import os
from dotenv import load_dotenv

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

def _load():
    load_dotenv(os.path.join(BASE_DIR, '.env'), override=True)

_load()

class Config:
    BASE_DIR = BASE_DIR
    SECRET_KEY = os.environ.get('SECRET_KEY', 'ai-art-generator-secret-key-2026')
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    GENERATED_FOLDER = os.path.join(BASE_DIR, 'static', 'generated')
    DATABASE_PATH = os.path.join(BASE_DIR, 'database', 'database.db')
    
    # API Keys for External Engines
    HF_TOKEN = os.environ.get('HF_TOKEN', '').strip()
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '').strip()
    STABILITY_API_KEY = os.environ.get('STABILITY_API_KEY', '').strip()
    POLLEN_API_KEY = os.environ.get('POLLEN_API_KEY', '').strip()
    STABLE_DIFFUSION_API_URL = os.environ.get('STABLE_DIFFUSION_API_URL', 'http://127.0.0.1:7860').strip()
    
    # Default engine: 'auto', 'creative_neural', 'huggingface', 'openai', 'stability', 'local_sd'
    DEFAULT_ENGINE = os.environ.get('DEFAULT_ENGINE', 'auto').strip()

    @classmethod
    def reload(cls):
        """Reload configuration from .env file."""
        _load()
        cls.SECRET_KEY = os.environ.get('SECRET_KEY', 'ai-art-generator-secret-key-2026')
        cls.HF_TOKEN = os.environ.get('HF_TOKEN', '').strip()
        cls.OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '').strip()
        cls.STABILITY_API_KEY = os.environ.get('STABILITY_API_KEY', '').strip()
        cls.POLLEN_API_KEY = os.environ.get('POLLEN_API_KEY', '').strip()
        cls.STABLE_DIFFUSION_API_URL = os.environ.get('STABLE_DIFFUSION_API_URL', 'http://127.0.0.1:7860').strip()
        cls.DEFAULT_ENGINE = os.environ.get('DEFAULT_ENGINE', 'auto').strip()
