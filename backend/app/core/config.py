from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_name: str = "Kisan Saathi"
    api_v1_prefix: str = "/api/v1"
    database_url: str = "sqlite:///./smart_farming.db"
    secret_key: str = "development-only-change-me-please"
    access_token_expire_minutes: int = 720
    allowed_origins: str = "http://localhost:5500,http://127.0.0.1:5500"
    open_meteo_base_url: str = "https://api.open-meteo.com/v1/forecast"
    open_meteo_timeout_seconds: float = 8
    agmarknet_api_url: str = ""
    agmarknet_api_key: str = ""
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    groq_vision_model: str = "qwen/qwen3.8-27b"
    groq_timeout_seconds: float = 45
    max_image_bytes: int = 5 * 1024 * 1024

    # Resolve backend/.env from this source file, not the shell's current directory.
    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("groq_api_key", "groq_model", "groq_vision_model", mode="before")
    @classmethod
    def strip_groq_settings(cls, value):
        return value.strip() if isinstance(value, str) else value

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
