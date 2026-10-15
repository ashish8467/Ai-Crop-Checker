from app.ml.model_loader import disease_model_available


def predict(_image_bytes: bytes) -> dict:
    if not disease_model_available():
        raise RuntimeError("No trained disease model is installed; no prediction was made.")
    raise RuntimeError("Model weights exist, but no compatible model adapter has been configured.")
