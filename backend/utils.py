"""
utils.py
--------
Multi-layer image validation + preprocessing for EfficientNetB0 malaria detection.

VALIDATION PIPELINE (runs BEFORE prediction on raw image):
  Layer 1  – Grayscale variance      : rejects blank / solid-colour images
  Layer 2  – Edge density            : rejects featureless / cartoon images
  Layer 3  – Laplacian texture       : rejects synthetically smooth images
  Layer 4  – FFT periodicity         : rejects repeating-pattern images (polkadots)
  Layer 5  – Hough circle regularity : rejects perfectly-spaced circle grids
  Layer 6  – HSV colour distribution : rejects unnatural single-colour images
  Final    – Confidence threshold    : rejects uncertain model outputs (< 0.80)

PREPROCESSING PIPELINE (matches training exactly):
  - Resize 128 x 128 → GaussianBlur (3,3) → EfficientNet preprocess_input → batch
"""

import io
import numpy as np
import cv2
from PIL import Image

try:
    from tensorflow.keras.applications.efficientnet import preprocess_input
except ImportError:
    from keras.applications.efficientnet import preprocess_input


# =============================================================================
#  THRESHOLDS  (tuned for NIH cell-image dataset vs. synthetic test images)
# =============================================================================

# Hard-fail thresholds (any single failure = immediate rejection)
VARIANCE_MIN      = 40       # Grayscale variance — rejects blank / solid images
EDGE_DENSITY_MIN  = 0.005    # Canny edge fraction — rejects nearly featureless images

# Soft-fail thresholds (scored; image rejected if SOFT_FAIL_LIMIT or more are hit)
LAPLACIAN_VAR_MIN = 30       # Layer 3 — smooth synthetic images score low
FFT_PEAK_RATIO_MAX = 0.25    # Layer 4 — periodic patterns have high spectral peaks
CIRCLE_CV_MIN     = 0.08     # Layer 5 — real cells have irregular radii (CV >= 0.08)
CIRCLE_SPACING_CV_MIN = 0.12 # Layer 5 — real cells have irregular spacing
HSV_SAT_HIGH_MAX  = 0.55     # Layer 6 — overly saturated pixels (S>160) fraction
HSV_HUE_PEAK_MAX  = 0.65     # Layer 6 — single dominant hue among saturated pixels

SOFT_FAIL_LIMIT   = 2        # Reject if this many soft checks fail

# Confidence threshold for model output
CONFIDENCE_MIN    = 0.80     # Below this → "uncertain / invalid" response


# =============================================================================
#  HELPER — safe single-check wrapper
# =============================================================================

def _check(fn, *args, fallback=False, **kwargs):
    """Run a check function; return fallback value if it raises an exception."""
    try:
        return fn(*args, **kwargs)
    except Exception as exc:
        print(f"[WARN] Validation sub-check failed (skipped): {exc}")
        return fallback


# =============================================================================
#  LAYER 3 – Laplacian texture richness
# =============================================================================

def _check_texture(gray):
    """
    Real microscopy images have rich texture (varied pixel intensities at small scales).
    Synthetically smooth cartoons/gradients have very low Laplacian variance.

    Returns True (valid) if texture is sufficient.
    """
    lap_var = float(np.var(cv2.Laplacian(gray, cv2.CV_64F)))
    return lap_var >= LAPLACIAN_VAR_MIN, lap_var


# =============================================================================
#  LAYER 4 – FFT periodicity (detects repeating-pattern images)
# =============================================================================

def _check_fft_periodicity(gray):
    """
    Polkadots, grids, and repeating synthetic patterns generate strong isolated
    peaks in the 2-D frequency domain.  Natural microscopy images have broadly
    distributed spectral energy.

    peak_ratio = (power in top-20 frequencies) / (total power)
    High ratio → repetitive / synthetic.

    Returns True (valid) if pattern is NOT periodic.
    """
    f      = np.fft.fft2(gray.astype(np.float32))
    fshift = np.fft.fftshift(f)
    mag    = np.abs(fshift)

    # Zero out DC component (centre pixel)
    h, w = mag.shape
    mag[h // 2, w // 2] = 0.0

    flat       = mag.flatten()
    total_pwr  = float(np.sum(flat)) + 1e-10
    top_pwr    = float(np.sum(np.partition(flat, -20)[-20:]))
    peak_ratio = top_pwr / total_pwr

    is_valid = peak_ratio <= FFT_PEAK_RATIO_MAX
    return is_valid, peak_ratio


# =============================================================================
#  LAYER 5 – Hough circle regularity (polkadot / grid detection)
# =============================================================================

def _check_hough_circles(gray):
    """
    Detect circles with HoughCircles.  Synthetic polkadot images have:
      - Many circles with near-identical radii (low coefficient of variation)
      - Circles spaced on a regular grid (low spacing CV)

    Real blood cells have irregular sizes and uneven distribution.

    Returns True (valid) if circles look biological (or too few are found).
    """
    circles = cv2.HoughCircles(
        gray,
        cv2.HOUGH_GRADIENT,
        dp=1.2,
        minDist=8,
        param1=60,
        param2=25,
        minRadius=4,
        maxRadius=60,
    )

    if circles is None or len(circles[0]) < 8:
        # Too few circles detected — cannot make a regularity judgment; pass.
        return True, "too_few"

    circles = circles[0]
    radii   = circles[:, 2]
    xs      = circles[:, 0]

    # Coefficient of variation of radii
    cv_radii = float(np.std(radii) / (np.mean(radii) + 1e-6))

    # Spacing regularity in X direction
    x_sorted  = np.sort(xs)
    x_diffs   = np.diff(x_sorted)
    cv_spacing = float(np.std(x_diffs) / (np.mean(x_diffs) + 1e-6)) if len(x_diffs) > 2 else 1.0

    # Flag as suspicious if BOTH radii and spacing are unrealistically uniform
    radius_too_uniform  = cv_radii   < CIRCLE_CV_MIN
    spacing_too_uniform = cv_spacing < CIRCLE_SPACING_CV_MIN

    is_valid = not (radius_too_uniform and spacing_too_uniform)
    return is_valid, {"cv_radii": round(cv_radii, 3), "cv_spacing": round(cv_spacing, 3)}


# =============================================================================
#  LAYER 6 – HSV colour distribution (detects unnatural single-colour images)
# =============================================================================

def _check_hsv_color(bgr):
    """
    Synthetic images (polkadots, cartoons) are typically dominated by a single,
    highly saturated hue (e.g. pure red).  Microscopy blood smear images contain
    a mix of pinks, purples, and near-white backgrounds — moderate saturation,
    varied hue.

    Two sub-checks:
      A) If >55 % of pixels are highly saturated (S > 160) → suspicious
      B) Among those saturated pixels, if >65 % fall in one hue bin → suspicious

    Returns True (valid) if colour looks natural.
    """
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    sat = hsv[:, :, 1]
    hue = hsv[:, :, 0]

    # Sub-check A: fraction of highly saturated pixels
    high_sat_mask  = sat > 160
    high_sat_ratio = float(np.sum(high_sat_mask)) / high_sat_mask.size

    if high_sat_ratio > HSV_SAT_HIGH_MAX:
        return False, f"high-sat={high_sat_ratio:.2f}"

    # Sub-check B: single dominant hue among saturated pixels
    if high_sat_ratio > 0.15:
        dom_hues = hue[high_sat_mask]
        hist, _  = np.histogram(dom_hues, bins=18, range=(0, 180))
        hue_peak = float(np.max(hist)) / (float(np.sum(hist)) + 1e-6)
        if hue_peak > HSV_HUE_PEAK_MAX:
            return False, f"hue-peak={hue_peak:.2f}"

    return True, "ok"


# =============================================================================
#  MAIN VALIDATION ENTRY POINT
# =============================================================================

def validate_image(raw_bgr):
    """
    Run the full multi-layer validation pipeline on a resized (128x128) BGR
    image BEFORE GaussianBlur/normalisation.

    Args:
        raw_bgr: np.ndarray  shape (128, 128, 3)  dtype uint8  BGR

    Returns:
        (bool, str)
            True,  ""           — image passed all checks
            False, reason_str   — image rejected; reason is user-facing text
    """
    gray = cv2.cvtColor(raw_bgr, cv2.COLOR_BGR2GRAY)

    # ── HARD FAIL 1: Grayscale variance ───────────────────────────────────────
    variance = float(np.var(gray))
    if variance < VARIANCE_MIN:
        return False, (
            "The uploaded image appears blank or has no visual detail. "
            "Please upload a clear microscopic blood smear image."
        )

    # ── HARD FAIL 2: Edge density ──────────────────────────────────────────────
    edges       = cv2.Canny(cv2.GaussianBlur(gray, (3, 3), 0), 20, 80)
    edge_density = float(np.count_nonzero(edges)) / edges.size
    if edge_density < EDGE_DENSITY_MIN:
        return False, (
            "The image contains too little structural detail to analyse. "
            "Please upload a focused microscopic blood smear image."
        )

    # ── SOFT FAILS (scored) ───────────────────────────────────────────────────
    soft_failures = []

    # Layer 3 — Texture
    tex_ok, tex_val = _check(_check_texture, gray, fallback=(True, 0))
    if not tex_ok:
        soft_failures.append(
            f"Image texture is too smooth (Laplacian variance={tex_val:.1f}). "
            "Likely a synthetic or cartoon image."
        )

    # Layer 4 — FFT periodicity
    fft_ok, fft_val = _check(_check_fft_periodicity, gray, fallback=(True, 0))
    if not fft_ok:
        soft_failures.append(
            f"Image contains a strongly repeating/periodic pattern (spectral peak ratio={fft_val:.3f}). "
            "This does not resemble a real blood smear."
        )

    # Layer 5 — Hough circle regularity
    hough_ok, hough_val = _check(_check_hough_circles, gray, fallback=(True, "skip"))
    if not hough_ok:
        soft_failures.append(
            f"Detected unnaturally regular circular shapes {hough_val}. "
            "Real blood cells have irregular sizes and spacing."
        )

    # Layer 6 — HSV colour
    hsv_ok, hsv_val = _check(_check_hsv_color, raw_bgr, fallback=(True, "skip"))
    if not hsv_ok:
        soft_failures.append(
            f"Image colour is dominated by a single saturated hue ({hsv_val}). "
            "This does not match microscopy blood smear colour profiles."
        )

    # ── DECISION ──────────────────────────────────────────────────────────────
    if len(soft_failures) >= SOFT_FAIL_LIMIT:
        # Summarise all failures into one professional message
        reasons = " | ".join(soft_failures)
        return False, (
            "Uploaded image does not appear to be a valid microscopic blood smear image. "
            f"Reasons: {reasons}"
        )

    return True, ""


# =============================================================================
#  PREPROCESSING  (exact training pipeline)
# =============================================================================

def preprocess_image(file_storage):
    """
    Preprocess uploaded image exactly as done during EfficientNetB0 training.

    Returns:
        img_batch  (1, 128, 128, 3)  float32  — ready for model.predict()
        img_raw    (128, 128, 3)     uint8    — resized BGR BEFORE blur,
                                                passed to validate_image()
    """
    img_bytes = file_storage.read()
    pil_img   = Image.open(io.BytesIO(img_bytes)).convert('RGB')
    img_rgb   = np.array(pil_img, dtype=np.uint8)

    img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
    img_bgr = cv2.resize(img_bgr, (128, 128), interpolation=cv2.INTER_AREA)

    img_raw = img_bgr.copy()                          # pre-blur copy for validation

    img_bgr  = cv2.GaussianBlur(img_bgr, (3, 3), 0)
    img_norm = preprocess_input(img_bgr.astype(np.float32))
    img_batch = np.expand_dims(img_norm, axis=0)      # (1, 128, 128, 3)

    return img_batch, img_raw


# =============================================================================
#  PREDICTION DECODING
# =============================================================================

def decode_prediction(predictions):
    """
    Decode EfficientNetB0 binary sigmoid output.

    Label mapping (matches training):
      classes = ["Parasitized", "Uninfected"]
        > 0.5  -> "Uninfected"
       <= 0.5  -> "Parasitized"

    Returns:
        dict  — { 'prediction', 'confidence', 'raw_score' }
        None  — confidence below CONFIDENCE_MIN (caller returns 422)
    """
    raw_score  = float(predictions[0][0])
    confidence = max(raw_score, 1.0 - raw_score)

    if confidence < CONFIDENCE_MIN:
        return None

    label    = 'Uninfected' if raw_score > 0.5 else 'Parasitized'
    conf_pct = (raw_score if raw_score > 0.5 else 1.0 - raw_score) * 100.0

    return {
        'prediction': label,
        'confidence': round(conf_pct, 2),
        'raw_score':  round(raw_score, 6),
    }
