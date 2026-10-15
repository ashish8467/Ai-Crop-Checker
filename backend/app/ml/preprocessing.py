from io import BytesIO

from PIL import Image, UnidentifiedImageError


def validate_image(data: bytes) -> tuple[bool, str | None]:
    try:
        with Image.open(BytesIO(data)) as image:
            if image.format not in {"JPEG", "PNG", "WEBP"}:
                return False, "Upload a JPEG, PNG, or WebP image."
            image.verify()
    except (UnidentifiedImageError, OSError):
        return False, "The uploaded file is not a valid image."
    return True, None
