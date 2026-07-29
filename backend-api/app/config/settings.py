from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve the .env file relative to this file's location (backend-api/.env),
# so it is found regardless of which directory the process is started from.
_ENV_FILE = Path(__file__).resolve().parent.parent.parent / ".env"


class Settings(BaseSettings):
    app_name: str = "SmartGovAI API"
    app_env: str = "development"
    log_level: str = "INFO"
    database_url: str | None = None
    seed_officer_password: str | None = None
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5173"])

    # JWT
    jwt_secret: str | None = None
    jwt_refresh_secret: str | None = None
    jwt_access_expire_minutes: int = 15
    jwt_refresh_expire_days: int = 7

    # OTP
    otp_provider: str = "development"
    otp_expire_minutes: int = 5
    otp_max_attempts: int = 5
    otp_length: int = 6

    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
