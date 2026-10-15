from pydantic import BaseModel, ConfigDict, Field


class FarmCreate(BaseModel):
    name: str = Field(default="My farm", min_length=1, max_length=120)
    state: str = Field(min_length=2, max_length=80)
    district: str = Field(min_length=2, max_length=100)
    village: str | None = Field(default=None, max_length=100)
    area_acres: float = Field(gt=0, le=100000)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    soil_type: str | None = Field(default=None, max_length=80)
    soil_ph: float | None = Field(default=None, ge=0, le=14)
    season: str | None = Field(default=None, max_length=20)
    nitrogen: float | None = Field(default=None, ge=0)
    phosphorus: float | None = Field(default=None, ge=0)
    potassium: float | None = Field(default=None, ge=0)
    irrigation: str | None = Field(default=None, max_length=40)
    previous_crops: str | None = Field(default=None, max_length=255)
    budget_inr: float | None = Field(default=None, ge=0)


class FarmResponse(FarmCreate):
    id: int
    owner_id: int

    model_config = ConfigDict(from_attributes=True)
