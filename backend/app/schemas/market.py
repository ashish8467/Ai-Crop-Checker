from pydantic import BaseModel, Field


class MarketStatus(BaseModel):
    status: str
    source: str | None = None
    records: list[dict] = Field(default_factory=list)
    message: str | None = None
