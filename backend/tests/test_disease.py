from io import BytesIO

import pytest
from PIL import Image

from app.services.disease_service import detect
from app.utils.image_validation import validate_image


def test_image_validation_accepts_real_png_bytes():
    stream = BytesIO()
    Image.new("RGB", (8, 8), color="green").save(stream, format="PNG")
    assert validate_image(stream.getvalue()) == (True, None)


def test_disease_service_does_not_guess_without_model():
    with pytest.raises(RuntimeError, match="No trained disease model"):
        detect(b"valid image bytes are not required without a model")
