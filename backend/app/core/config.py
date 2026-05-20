import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

MODEL_DIR = Path(os.getenv("MODEL_DIR", str(Path(__file__).resolve().parents[3] / "ml" / "models")))

# CORS. Set ALLOWED_ORIGINS on the backend host to a comma-separated list of the
# exact frontend URLs, e.g. "https://your-app.vercel.app". Defaults to localhost
# for development.
_DEFAULT_ORIGINS = "http://localhost:3000,http://127.0.0.1:3000"
ALLOWED_ORIGINS = [
    o.strip() for o in os.getenv("ALLOWED_ORIGINS", _DEFAULT_ORIGINS).split(",") if o.strip()
]

# Optional regex to additionally allow dynamic origins (e.g. Vercel preview
# deployments): ALLOWED_ORIGIN_REGEX=r"https://your-app-.*\.vercel\.app"
ALLOWED_ORIGIN_REGEX = os.getenv("ALLOWED_ORIGIN_REGEX") or None
