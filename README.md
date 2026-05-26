# 🩸 MalariaVision AI

<div align="center">

![MalariaVision AI](https://img.shields.io/badge/MalariaVision-AI-dc2626?style=for-the-badge&logo=microscope&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![EfficientNetB0](https://img.shields.io/badge/EfficientNetB0-Transfer%20Learning-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-REST%20API-000000?style=for-the-badge&logo=flask&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**AI-powered malaria parasite detection from microscopic blood smear images.**  
Upload a cell image → get an instant, high-confidence diagnosis in under 2 seconds.

[🔬 Live Demo](#) · [📖 Documentation](#table-of-contents) · [🐛 Report Bug](https://github.com/shivenbansal91/MalariaVision-AI/issues) · [💡 Request Feature](https://github.com/shivenbansal91/MalariaVision-AI/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Model Architecture](#-model-architecture)
- [Validation Pipeline](#-validation-pipeline)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Dataset](#-dataset)
- [Performance Metrics](#-performance-metrics)
- [Deployment](#-deployment)
- [Disclaimer](#-disclaimer)
- [License](#-license)

---

## 🌍 Overview

Malaria remains one of the world's most deadly infectious diseases, killing over **600,000 people annually** — the majority being children under five in sub-Saharan Africa. Traditional diagnosis via microscopy is slow, expensive, and highly dependent on expert technician skill.

**MalariaVision AI** addresses this gap by providing an automated, deep-learning-powered diagnostic tool that:

- Analyses microscopic blood smear images in **< 2 seconds**
- Achieves **95.8% accuracy** using EfficientNetB0 transfer learning
- Includes a **6-layer image validation pipeline** to reject non-medical images before prediction
- Provides a clean, professional web interface accessible from any modern browser

> ⚠️ **This tool is intended for research and educational purposes only. It is not a substitute for professional medical diagnosis.**

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔬 **AI Prediction** | EfficientNetB0 CNN classifies cells as *Parasitized* or *Uninfected* |
| 🛡️ **Smart Validation** | 6-layer pipeline rejects non-blood-cell images before the model runs |
| 📊 **Confidence Scoring** | Returns raw sigmoid score + confidence percentage for every prediction |
| 🖼️ **Drag & Drop UI** | Intuitive upload interface with image preview and result history |
| ⚡ **Fast Inference** | CPU inference in ~1–2 seconds per image on standard hardware |
| 📱 **Responsive Design** | Fully responsive — works on desktop, tablet, and mobile |
| 🔒 **Input Validation** | File type, file size, and image quality validated on both client and server |
| 📝 **Prediction History** | Last 10 predictions kept in-session with thumbnail preview |

---

## 🧠 Model Architecture

The model uses **EfficientNetB0 Transfer Learning** — pretrained on ImageNet and fine-tuned for binary malaria classification.

```
┌──────────────────────────────────────────────────┐
│                   INPUT LAYER                    │
│            128 × 128 × 3  (RGB Image)            │
└────────────────────┬─────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────┐
│             EfficientNetB0 BACKBONE              │
│   Pretrained on ImageNet (1,000 classes)         │
│   Fine-tuned for blood cell classification       │
│   ~5.3M parameters, efficient compound scaling   │
└────────────────────┬─────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────┐
│         GLOBAL AVERAGE POOLING LAYER             │
│   Reduces feature maps to a single vector        │
│   No Flatten required — more robust to overffit  │
└────────────────────┬─────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────┐
│            BATCH NORMALIZATION                   │
│   Stabilises activations during fine-tuning      │
└────────────────────┬─────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────┐
│              DENSE LAYER (256 units)             │
│   ReLU activation — task-specific features       │
└────────────────────┬─────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────┐
│              DROPOUT LAYER (0.3)                 │
│   Regularisation — prevents overfitting          │
└────────────────────┬─────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────┐
│              OUTPUT LAYER                        │
│   Dense(1) + Sigmoid → binary probability        │
│   > 0.5 → Uninfected  |  ≤ 0.5 → Parasitized    │
└──────────────────────────────────────────────────┘
```

### Training Configuration

| Parameter | Value |
|-----------|-------|
| **Architecture** | EfficientNetB0 Transfer Learning |
| **Input Size** | 128 × 128 × 3 (RGB) |
| **Pretrained On** | ImageNet (1,000 classes) |
| **Optimizer** | Adam |
| **Loss Function** | Binary Cross-Entropy |
| **Batch Size** | 16 |
| **Max Epochs** | 28 (with Early Stopping) |
| **Augmentation** | Horizontal/Vertical Flip, Rotation, Zoom, Shear |
| **Framework** | TensorFlow 2.x / Keras |
| **Output Activation** | Sigmoid (binary) |

### Preprocessing Pipeline (matches training exactly)

```python
img = cv2.resize(img, (128, 128))
img = cv2.GaussianBlur(img, (3, 3), 0)
img = preprocess_input(img.astype(np.float32))   # EfficientNet scaling → [-1, 1]
img = np.expand_dims(img, axis=0)                # add batch dimension
```

---

## 🛡️ Validation Pipeline

The backend runs a **6-layer validation pipeline** on every uploaded image **before** the model is invoked. This prevents synthetic or unrelated images (polkadots, cartoons, random textures) from receiving a false diagnosis.

```
Upload Received
      │
      ▼
[HARD FAIL 1] ── Grayscale Variance < 40
      │            Rejects: blank, solid-colour images
      ▼
[HARD FAIL 2] ── Edge Density < 0.5%
      │            Rejects: featureless, near-uniform images
      ▼
[SOFT CHECK 1] ── Laplacian Texture < 30
      │            Rejects: synthetically smooth images
      ▼
[SOFT CHECK 2] ── FFT Spectral Peak Ratio > 0.25
      │            Rejects: repeating/periodic patterns (polkadots)
      ▼
[SOFT CHECK 3] ── Hough Circle Regularity
      │            Rejects: perfect circle grids (radius CV < 0.08)
      ▼
[SOFT CHECK 4] ── HSV Colour Distribution
      │            Rejects: single-dominant saturated hue (cartoons)
      ▼
[If ≥ 2 soft checks fail → REJECT with 422]
      │
      ▼
Model Prediction
      │
      ▼
[Confidence Threshold] ── < 80% → REJECT
      │
      ▼
Return Result ✅
```

**Rejected image types:**
- 🔴 Red polkadot patterns
- 🎨 Cartoon / illustration images
- 🟥 Solid-colour images
- 🔲 Repeated geometric patterns
- ⬜ Blank / near-blank images
- 📸 Random unrelated photographs with low model confidence

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.9+ | Runtime |
| **Flask** | 3.0.3 | REST API server |
| **TensorFlow / Keras** | 2.21 | Model inference |
| **OpenCV** | 4.13 | Image processing & validation |
| **NumPy** | 2.4 | Numerical operations |
| **Pillow** | 10+ | Image decoding |
| **Flask-CORS** | 4.0 | Cross-origin requests |
| **Gunicorn** | 22.0 | Production WSGI server |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18+ | UI framework |
| **Vite** | 8.0 | Build tool & dev server |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **Framer Motion** | Latest | Animations |
| **Axios** | Latest | HTTP client |
| **React Router** | v6 | Client-side routing |
| **Lucide React** | Latest | Icon library |
| **React Hot Toast** | Latest | Toast notifications |

---

## 📁 Project Structure

```
MalariaVision-AI/
│
├── backend/                        # Flask REST API
│   ├── app.py                      # Main application, routes, CORS, error handlers
│   ├── utils.py                    # Validation pipeline + preprocessing + decoding
│   ├── requirements.txt            # Python dependencies
│   ├── best_model.keras            # ← Place your trained model here (not in git)
│   └── uploads/                    # Temporary upload storage
│
├── frontend/                       # React + Vite SPA
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Responsive sticky navigation
│   │   │   └── Footer.jsx          # Site footer with links
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx     # Hero, features, statistics
│   │   │   ├── DetectionPage.jsx   # Upload, analysis, result, history
│   │   │   ├── AboutPage.jsx       # Architecture, metrics, training details
│   │   │   └── ContactPage.jsx     # Contact form
│   │   ├── services/
│   │   │   └── api.js              # Axios instance + predictMalaria()
│   │   ├── App.jsx                 # Router + Toaster config
│   │   ├── main.jsx                # React entry point
│   │   └── index.css               # Design system + Tailwind tokens
│   ├── vite.config.js              # Vite config + API proxy
│   └── package.json
│
├── start.bat                       # One-click launcher (Windows)
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python** 3.9 or higher
- **Node.js** 18 or higher
- **Git**
- Your trained model file: `best_model.keras`

### 1. Clone the Repository

```bash
git clone https://github.com/shivenbansal91/MalariaVision-AI.git
cd MalariaVision-AI
```

### 2. Add the Trained Model

Copy your `best_model.keras` file into the `backend/` folder:

```
backend/
└── best_model.keras   ← place here
```

> The model file is excluded from version control (`.gitignore`) due to its size. Download it from the [Releases](https://github.com/shivenbansal91/MalariaVision-AI/releases) page or train your own using the NIH Malaria Dataset.

### 3. Set Up the Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Set Up the Frontend

```bash
cd frontend
npm install
```

### 5. Run the Application

**Option A — One click (Windows only):**
```
Double-click start.bat in the project root
```

**Option B — Two terminals:**

```bash
# Terminal 1 — Backend
cd backend
venv\Scripts\activate       # Windows
source venv/bin/activate    # macOS/Linux
python app.py
```

```bash
# Terminal 2 — Frontend
cd frontend
npm run dev
```

### 6. Open the App

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:5000 |
| **Health Check** | http://localhost:5000/health |

---

## 📡 API Reference

### `GET /`

Health check and model status.

**Response:**
```json
{
  "status": "running",
  "message": "MalariaVision AI backend is live 🩸",
  "model": "loaded"
}
```

---

### `GET /health`

Lightweight health check used by uptime monitors.

**Response:**
```json
{
  "status": "ok",
  "model_loaded": true
}
```

---

### `POST /predict`

Analyse a blood cell image and return a malaria prediction.

**Request:**
```
Content-Type: multipart/form-data
Body: file=<image.jpg|image.png>  (max 10 MB)
```

**Success Response (200):**
```json
{
  "prediction": "Parasitized",
  "confidence": 99.45,
  "raw_score": 0.005507
}
```

| Field | Type | Description |
|-------|------|-------------|
| `prediction` | `string` | `"Parasitized"` or `"Uninfected"` |
| `confidence` | `float` | Confidence of predicted class (0–100 %) |
| `raw_score` | `float` | Raw sigmoid output (0.0–1.0) |

**Validation Error (422):**
```json
{
  "error": "Uploaded image does not appear to be a valid microscopic blood smear image. Reasons: ..."
}
```

**Low Confidence (422):**
```json
{
  "error": "Prediction confidence too low (65.5%). The image may not be a valid blood cell microscopy image."
}
```

**Other Errors:**

| Code | Meaning |
|------|---------|
| `400` | No file provided / empty filename / unsupported format |
| `413` | File exceeds 10 MB limit |
| `503` | Model not loaded — place `best_model.keras` in `backend/` |
| `500` | Internal server error during prediction |

---

## 📊 Dataset

The model was trained and evaluated on the **NIH Malaria Cell Images Dataset**.

| Property | Value |
|----------|-------|
| **Source** | National Institutes of Health (NIH) |
| **Total Images** | 27,558 |
| **Parasitized** | 13,779 |
| **Uninfected** | 13,779 |
| **Image Type** | Segmented single blood cell images |
| **Format** | PNG |
| **Stain** | Giemsa-stained thin blood smears |

**Download:** [Kaggle — Cell Images for Detecting Malaria](https://www.kaggle.com/iarunava/cell-images-for-detecting-malaria)

---

## 📈 Performance Metrics

| Metric | Value |
|--------|-------|
| **Test Accuracy** | 95.8 % |
| **Precision** | 96.1 % |
| **Recall** | 95.4 % |
| **F1 Score** | 95.7 % |
| **Training Images** | 22,046 |
| **Testing Images** | 5,512 |
| **Avg Inference Time** | ~1–2 seconds (CPU) |

---

## ☁️ Deployment

### Backend — Render

1. Push the `backend/` folder to GitHub (ensure `best_model.keras` is uploaded as a release asset or fetched at startup)
2. Create a new **Web Service** on [Render](https://render.com)
3. Set the build command: `pip install -r requirements.txt`
4. Set the start command: `gunicorn app:app`
5. Add environment variables: `FLASK_DEBUG=false`, `PORT=10000`

### Frontend — Vercel

1. Import the repository into [Vercel](https://vercel.com)
2. Set the root directory to `frontend/`
3. Add environment variable: `VITE_API_URL=https://your-render-backend.onrender.com`
4. Deploy

---

## ⚠️ Disclaimer

MalariaVision AI is developed for **research and educational purposes only**.

- Results must **not** be used as a substitute for professional medical diagnosis
- Always consult a qualified healthcare professional for medical decisions
- Model accuracy may vary with image quality, staining technique, and equipment
- The validation pipeline reduces but cannot eliminate all false predictions on non-medical images

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Shiven Bansal**

- GitHub: [@shivenbansal91](https://github.com/shivenbansal91)
- Repository: [MalariaVision-AI](https://github.com/shivenbansal91/MalariaVision-AI)

---

<div align="center">

Made with ❤️ for global health

**Star ⭐ this repo if you found it useful!**

</div>
