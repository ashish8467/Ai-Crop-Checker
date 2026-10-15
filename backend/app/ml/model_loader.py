from pathlib import Path


MODEL_PATH = Path(__file__).resolve().parents[2] / "trained_models" / "plant_disease.pt"


def disease_model_available() -> bool:
    return MODEL_PATH.is_file()
