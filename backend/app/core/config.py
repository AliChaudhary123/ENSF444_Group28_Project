import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

MODEL_DIR = Path(os.getenv("MODEL_DIR", str(Path(__file__).resolve().parents[3] / "ml" / "models")))
