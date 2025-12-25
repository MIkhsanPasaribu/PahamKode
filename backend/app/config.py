"""
Konfigurasi Environment Variables untuk Backend PahamKode
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Pengaturan aplikasi dari environment variables"""
    
    # Database - Azure Cosmos DB (MongoDB API)
    database_url: str = ""  # Format: mongodb://username:password@host:port/database?ssl=true
    
    # AI Provider Flags (GitHub Models sebagai default)
    use_github_models: bool = True   # RECOMMENDED: FREE untuk development & low traffic
    use_llama: bool = False          # Optional: Untuk high traffic (expensive ~$240/month)
    use_azure_openai: bool = False   # Optional: Alternative paid option
    
    # GitHub Models (FREE - RECOMMENDED untuk start!)
    # Endpoint: models.inference.ai.azure.com
    # Models: GPT-4o-mini, GPT-4o, Phi-3, Llama 3
    # Rate Limits: 15 req/min per model, 150K tokens/day
    github_token: Optional[str] = None
    github_model_name: str = "gpt-4o-mini"  # Model default
    
    # Llama 3.1 70B (Azure ML Endpoint - EXPENSIVE!)
    # Cost: $1.10/hour = $792/month (24/7) atau $242/month (dengan auto-stop)
    # Hanya gunakan jika traffic > 10K users/month
    llama_endpoint_url: Optional[str] = None
    llama_api_key: Optional[str] = None
    
    # Azure OpenAI (Pay-per-use)
    # Cost: ~$1.88/10K requests (GPT-4o-mini)
    azure_openai_api_key: Optional[str] = None
    azure_openai_endpoint: Optional[str] = None
    
    # JWT Authentication
    jwt_secret_key: str = "your-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # CORS
    frontend_url: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Singleton instance
settings = Settings()
