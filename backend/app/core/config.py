from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
from typing import Optional
import warnings


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ─── App ──────────────────────────────────────────────────────
    APP_NAME: str = "Sentinel AI"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # ─── Security ─────────────────────────────────────────────────
    SECRET_KEY: str = "changeme-use-a-real-256bit-secret-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ─── Database ─────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://sentinel:sentinel@localhost:5432/sentinel_ai"
    DATABASE_URL_SYNC: str = "postgresql://sentinel:sentinel@localhost:5432/sentinel_ai"

    # ─── Redis (future) ───────────────────────────────────────────
    REDIS_URL: Optional[str] = None

    # ─── AI ───────────────────────────────────────────────────────
    OPENROUTER_API_KEY: Optional[str] = None
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    AI_MODEL_PRIMARY: str = "qwen/qwen-2.5-72b-instruct"
    AI_MODEL_FAST: str = "google/gemma-2-9b-it:free"
    AI_MODEL_REASONING: str = "deepseek/deepseek-chat"
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"

    # ─── CORS ─────────────────────────────────────────────────────
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://sentinel.ai",
    ]

    # ─── WebSocket ────────────────────────────────────────────────
    WS_HEARTBEAT_INTERVAL: int = 30

    # ─── Anomaly Detection ────────────────────────────────────────
    ANOMALY_CONTAMINATION: float = 0.05
    ANOMALY_SCORE_THRESHOLD: float = 0.7

    # ─── Simulation ───────────────────────────────────────────────
    SIMULATION_EVENT_DELAY_MS: int = 200

    @model_validator(mode="after")
    def _validate_secret_key(self) -> "Settings":
        """Prevent deploying with the default SECRET_KEY in non-dev environments."""
        _DEFAULT_KEY = "changeme-use-a-real-256bit-secret-in-production"
        if self.SECRET_KEY == _DEFAULT_KEY:
            if self.ENVIRONMENT != "development":
                raise ValueError(
                    f"SECRET_KEY must be changed from default in '{self.ENVIRONMENT}' environment. "
                    "Set a secure 256-bit secret via the SECRET_KEY environment variable."
                )
            warnings.warn(
                "Using default SECRET_KEY — acceptable for development only.",
                stacklevel=2,
            )
        return self


settings = Settings()
