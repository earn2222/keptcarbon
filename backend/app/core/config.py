from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://keptcarbon:keptcarbon123@db:5432/keptcarbon"
    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "keptcarbon"
    POSTGRES_PASSWORD: str = "keptcarbon123"
    POSTGRES_DB: str = "keptcarbon"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # App settings
    DEBUG: bool = True
    APP_NAME: str = "KeptCarbon API"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
