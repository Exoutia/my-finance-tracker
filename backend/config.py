from pathlib import Path
from typing import Optional

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_NAME: str = "finance.db"
    BASE_PATH: Path = Path(__file__).parent
    DATABASE_PATH: Path = BASE_PATH / DATABASE_NAME
    DATABASE_URL: str = f"sqlite:///{DATABASE_PATH.absolute()}"
    API_KEY: Optional[SecretStr] = None

    PORT: int = Field(default=8000, gt=1024, lt=65535)
    DEBUG: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
