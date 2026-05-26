"""
app.py
------
MalariaVision AI — Flask REST API Backend

Endpoints:
  GET  /          → Health check
  GET  /health    → Health check (JSON)
  POST /predict   → Upload image → get malaria prediction

Model: best_model.keras (TensorFlow/Keras CNN)
Place best_model.keras in the same folder as this file (backend/).
"""

import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model

from utils import preprocess_image, decode_prediction, validate_image

# ── Logging ────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
)
logger = logging.getLogger(__name__)

# ── Flask App ───────────────────────────────────────────────
app = Flask(__name__)

# Enable CORS for all origins (restrict in production if needed)
CORS(app, resources={r"/*": {"origins": "*"}})

# ── Config ─────────────────────────────────────────────────
UPLOAD_FOLDER    = os.path.join(os.path.dirname(__file__), 'uploads')
ALLOWED_EXT      = {'jpg', 'jpeg', 'png'}
MODEL_PATH       = os.path.join(os.path.dirname(__file__), 'best_model.keras')
MAX_CONTENT_MB   = 10

app.config['UPLOAD_FOLDER']      = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_MB * 1024 * 1024  # 10 MB limit

# Create uploads folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ── Load Model (once at startup) ───────────────────────────
logger.info(f"Loading model from: {MODEL_PATH}")
if not os.path.exists(MODEL_PATH):
    logger.error("❌  best_model.keras NOT FOUND!")
    logger.error(f"    Expected path: {MODEL_PATH}")
    logger.error("    Please copy best_model.keras into the backend/ folder.")
    model = None
else:
    try:
        model = load_model(MODEL_PATH)
        logger.info("✅  Model loaded successfully.")
    except Exception as e:
        logger.error(f"❌  Failed to load model: {e}")
        model = None


# ── Helper ─────────────────────────────────────────────────
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXT


# ── Routes ─────────────────────────────────────────────────

@app.route('/', methods=['GET'])
def index():
    """Simple health-check route."""
    return jsonify({
        'status':  'running',
        'message': 'MalariaVision AI backend is live 🩸',
        'model':   'loaded' if model else 'NOT FOUND — place best_model.keras in backend/',
    })


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint used by Render / uptime monitors."""
    return jsonify({
        'status':       'ok',
        'model_loaded': model is not None,
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    POST /predict
    -------------
    Expects:  multipart/form-data with field 'file' (JPG or PNG image)
    Returns:  JSON { prediction: str, confidence: float }
    """

    # ── 1. Check model is loaded ───────────────────────────
    if model is None:
        return jsonify({'error': 'Model not loaded. Place best_model.keras in backend/'}), 503

    # ── 2. Validate file presence ──────────────────────────
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided. Send an image with key "file".'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'Empty filename. Please select an image file.'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Only JPG and PNG are supported.'}), 400

    # ── 3. Preprocess → Validate → Predict ─────────────────
    try:
        logger.info(f"Processing file: {file.filename}")

        # Preprocess image — returns (batch_array, raw_bgr_for_validation)
        img_batch, img_bgr = preprocess_image(file)

        # ── Image quality validation ───────────────────────
        is_valid, reason = validate_image(img_bgr)
        if not is_valid:
            logger.warning(f"Image rejected by validator: {reason}")
            return jsonify({'error': reason}), 422

        # ── Model inference ────────────────────────────────
        predictions = model.predict(img_batch, verbose=0)
        logger.info(f"Raw sigmoid output: {predictions}")

        # ── Confidence threshold + decode ──────────────────
        result = decode_prediction(predictions)
        if result is None:
            raw = float(predictions[0][0])
            conf = round(max(raw, 1.0 - raw) * 100, 1)
            logger.warning(f"Low-confidence prediction rejected (conf={conf}%)")
            return jsonify({
                'error': (
                    f"Prediction confidence too low ({conf}%). "
                    "The image may not be a valid blood cell microscopy image. "
                    "Please upload a clear, focused blood smear image."
                )
            }), 422

        logger.info(f"Result: {result}")
        return jsonify(result), 200

    except Exception as e:
        logger.exception(f"Prediction error: {e}")
        return jsonify({'error': f'Internal error during prediction: {str(e)}'}), 500


# ── Error Handlers ──────────────────────────────────────────

@app.errorhandler(413)
def too_large(e):
    return jsonify({'error': f'File too large. Maximum size is {MAX_CONTENT_MB} MB.'}), 413

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found.'}), 404

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({'error': 'Method not allowed.'}), 405


# ── Entry Point ─────────────────────────────────────────────
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'true').lower() == 'true'
    logger.info(f"Starting MalariaVision AI backend on port {port} (debug={debug})")
    app.run(host='0.0.0.0', port=port, debug=debug)
