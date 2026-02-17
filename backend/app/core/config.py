from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "AEGIS"
    BACKEND_CORS_ORIGINS: List[str] = Field(default=["http://localhost:3000"])  # frontend

    DATABASE_URL: str = Field(default="postgresql://postgres:postgres@db:5432/aegis")
    CHROMA_API_URL: str = Field(default="http://chroma:8000")

    JWT_SECRET: str = Field(default="changeme-secret-in-prod")
    JWT_ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60*24)

    OPENAI_API_KEY: str | None = None

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env")
        env_file_encoding = "utf-8"


settings = Settings()
