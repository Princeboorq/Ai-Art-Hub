# AI Art Generator 🎨

A full-stack, modern AI Art Generation web application built with **Flask**, **PyTorch**, **Pillow**, and **SQLite**. It features an adaptive multi-backend architecture that works immediately out-of-the-box with zero configuration, while also supporting advanced cloud and local AI diffusion models.

---

## ✨ Features

- **Instant Zero-Config Synthesis**: Features a built-in *Creative Neural Synthesizer* powered by PyTorch and PIL. Generates styled artwork locally in under 1 second without requiring GPU setup or paid API keys.
- **Multiple AI Backends Supported**:
  - **Creative Neural Synthesizer** (Default, offline, high-speed procedural neural synthesis)
  - **Hugging Face Serverless Inference** (FLUX.1-schnell & SDXL via `HF_TOKEN`)
  - **OpenAI DALL-E 3** (via `OPENAI_API_KEY`)
  - **Local Stable Diffusion** (Automatic1111 / ComfyUI on `http://127.0.0.1:7860`)
- **10 Curated Artistic Style Presets**: Cyberpunk, Anime & Manga, Mythic Fantasy, Classical Oil Painting, Synthwave, Photorealistic, Fluid Watercolor, Retro Pixel Art, 3D Isometric / Octane, and Surrealism.
- **Magic Prompt Enhancer**: Automatically enriches simple prompts with aesthetic lighting, atmospheric composition, and quality modifiers.
- **Aspect Ratio Options**: 1:1 (Square), 16:9 (Landscape), 9:16 (Portrait), 4:3 (Classic), and 3:4.
- **Deterministic Seed Control**: Reproduce or iterate on artwork using custom seeds.
- **Gallery & History**: Persistent SQLite database storing all artwork with search, style filters, download, and deletion.
- **Modern Responsive Dark UI**: Futuristic glassmorphism studio design with animated loading states, live progress indicators, fullscreen lightbox zoom, and toast notifications.

---

## 📁 Project Structure

```
AI-Art-Generator/
│
├── app.py                     # Flask web server & REST API
├── config.py                  # App configuration & environment loader
├── requirements.txt           # Dependencies
├── README.md                  # Project documentation
├── .env.example               # Example environment variables
│
├── models/                    # Directory for custom model weights
├── uploads/                   # Directory for user uploads
│
├── static/
│   ├── css/
│   │   └── style.css          # Modern dark-mode UI stylesheet
│   ├── js/
│   │   └── script.js          # Interactive frontend & async generation
│   └── generated/             # Storage for generated PNG artwork
│
├── templates/
│   ├── index.html             # Studio generation workspace
│   ├── history.html           # Artwork gallery & history
│   └── about.html             # Documentation & architecture overview
│
├── database/
│   └── database.db            # SQLite database
│
└── utils/
    ├── image_generator.py     # Multi-engine image generation logic
    └── database.py            # SQLite queries and helpers
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Application
```bash
python app.py
```

### 3. Open in Browser
Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## ⚙️ Configuration (Optional)

To enable external AI engines (FLUX.1, SDXL, or DALL-E 3), copy `.env.example` to `.env` and add your keys:

```ini
# Hugging Face User Access Token (Free at huggingface.co/settings/tokens)
HF_TOKEN=hf_your_token_here

# OpenAI API Key (for DALL-E 3)
OPENAI_API_KEY=sk-proj-your_key_here

# Local Automatic1111 / ComfyUI WebUI API URL
STABLE_DIFFUSION_API_URL=http://127.0.0.1:7860

# Default Engine ('auto', 'creative_neural', 'huggingface', 'openai', 'local_sd')
DEFAULT_ENGINE=auto
```

---

## 📡 API Endpoints

- `GET /` — Studio workspace interface
- `POST /api/generate` — Asynchronous art generation endpoint
  - **Body (JSON)**:
    ```json
    {
      "prompt": "Neon cyberpunk skyline in heavy rain",
      "style": "cyberpunk",
      "aspect_ratio": "16:9",
      "seed": 42,
      "engine": "auto",
      "enhance": true
    }
    ```
- `GET /history` — Gallery page with filtering & search
- `DELETE /api/history/<id>` — Delete artwork from database and disk
- `GET /about` — Documentation & architecture details
