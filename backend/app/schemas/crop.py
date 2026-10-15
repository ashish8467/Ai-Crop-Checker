from pydantic import BaseModel, Field


class CropRecommendationRequest(BaseModel):
    farm_id: int | None = None
    state: str = Field(min_length=2, max_length=80)
    district: str = Field(min_length=2, max_length=100)
    area_acres: float = Field(gt=0, le=100000)
    season: str = "kharif"
    soil_type: str | None = None
    soil_ph: float | None = Field(default=None, ge=0, le=14)
    nitrogen: float | None = Field(default=None, ge=0)
    phosphorus: float | None = Field(default=None, ge=0)
    potassium: float | None = Field(default=None, ge=0)
    irrigation: str | None = None
    previous_crops: str | None = Field(default=None, max_length=255)
    budget_inr: float | None = Field(default=None, ge=0)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)


class ProfitEstimateRequest(BaseModel):
    crop: str = Field(min_length=2, max_length=80)
    area_acres: float = Field(gt=0, le=100000)
    expected_yield_per_acre: float | None = Field(default=None, gt=0)
    price_per_quintal: float | None = Field(default=None, gt=0)
    cost_per_acre: float | None = Field(default=None, ge=0)

