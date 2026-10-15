from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class DiseaseAnalysisResponse(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    status: Literal["analysis_complete", "uncertain", "poor_image", "not_a_plant"]
    crop_name: str = Field(min_length=1, max_length=80)
    likely_issue: str | None = Field(max_length=120)
    confidence_percent: int = Field(ge=0, le=100)
    severity: Literal["low", "moderate", "high", "uncertain"]
    observations: list[str] = Field(min_length=1, max_length=6)
    possible_alternatives: list[str] = Field(max_length=4)
    actions_today: list[str] = Field(min_length=1, max_length=6)
    plan_next_7_days: list[str] = Field(max_length=7)
    protect_yield: list[str] = Field(max_length=6)
    avoid: list[str] = Field(max_length=5)
    ask_local_expert_when: list[str] = Field(max_length=5)
    follow_up_questions: list[str] = Field(max_length=4)
    disclaimer: str = "Preliminary AI image screening only; visual symptoms cannot confirm a pathogen. Verify with a local agriculture expert before using pesticides or making major crop decisions."


class DiseaseDetectionResponse(BaseModel):
    status: str
    message: str
    model_available: bool
    report_id: int | None = None


class DiseaseReportResponse(BaseModel):
    id: int
    filename: str
    prediction: str
    confidence: float | None
    created_at: datetime

