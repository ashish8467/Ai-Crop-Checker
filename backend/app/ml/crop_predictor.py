"""Rule-based crop suitability ranking; this is not a trained ML model."""

from app.services.crop_recommendation_service import rank_crops

__all__ = ["rank_crops"]
