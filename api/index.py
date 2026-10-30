import os
import sys

# Ensure project root is on Python path for Vercel Serverless Functions
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app import app

# WSGI application exposed for Vercel
app = app
