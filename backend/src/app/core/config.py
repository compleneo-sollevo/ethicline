from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Application
    APP_NAME: str = "ethicLine"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://ethicline_user:ethicline_dev_password@localhost:5432/ethicline"

    # Auth / JWT
    SECRET_KEY: str = "dev-secret-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours
    TEMP_TOKEN_EXPIRE_MINUTES: int = 5  # For 2FA verification

    # CORS
    CORS_ORIGINS: str = "http://ethicline.localhost"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"


settings = Settings()
