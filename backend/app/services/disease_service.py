from io import BytesIO

from PIL import Image, ImageOps

from app.ml.disease_predictor import predict
from app.integrations.groq_client import analyze_crop_image


def detect(image_bytes: bytes) -> dict:
    return predict(image_bytes)


async def analyze(image_bytes: bytes, crop_name: str, language: str):
    # Normalize accepted upload formats for the vision API and keep the request modest in size.
    with Image.open(BytesIO(image_bytes)) as source:
        image = ImageOps.exif_transpose(source)
        if "A" in image.getbands() or "transparency" in image.info:
            rgba = image.convert("RGBA")
            normalized = Image.new("RGB", rgba.size, "white")
            normalized.paste(rgba, mask=rgba.getchannel("A"))
        else:
            normalized = image.convert("RGB")
        normalized.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        output = BytesIO()
        normalized.save(output, format="JPEG", quality=90, optimize=True)
    return await analyze_crop_image(output.getvalue(), "image/jpeg", crop_name, language)
