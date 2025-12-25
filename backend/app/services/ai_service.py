"""
AI Service untuk integrasi dengan berbagai AI providers
Menggunakan LangChain untuk orkestrasi

Priority:
1. GitHub Models (FREE) - DEFAULT untuk development & low-medium traffic
2. Llama 3.1 70B (Expensive) - Untuk high traffic production
3. Azure OpenAI (Pay-per-use) - Enterprise alternative
"""

from langchain_openai import AzureChatOpenAI
from langchain_community.llms import AzureMLOnlineEndpoint
from pydantic import SecretStr
from app.config import settings
from typing import Any
import sys


def dapatkan_llm_github_models() -> AzureChatOpenAI:
    """
    Gunakan GitHub Models untuk AI inferensi GRATIS
    
    Cost: $0/bulan (100% GRATIS!)
    Models: GPT-4o, GPT-4o-mini, Phi-3, Llama 3
    Endpoint: models.inference.ai.azure.com (Azure infrastructure)
    Rate Limits: 15 req/min per model, 150K tokens/day
    Perfect untuk: Development & low-medium traffic (0-10K users/month)
    
    Setup:
    1. Buat GitHub Personal Access Token di https://github.com/settings/tokens
    2. Pilih scope "public_repo" (read access)
    3. Set GITHUB_TOKEN di .env
    
    Raises:
        ValueError: Jika GITHUB_TOKEN tidak diset
    """
    if not settings.github_token:
        raise ValueError(
            "GITHUB_TOKEN tidak diset!\n"
            "1. Buat token di https://github.com/settings/tokens\n"
            "2. Pilih scope 'public_repo'\n"
            "3. Set GITHUB_TOKEN di file .env"
        )
    
    api_key = SecretStr(settings.github_token)
    
    return AzureChatOpenAI(
        model=settings.github_model_name,  # Default: gpt-4o-mini
        api_key=api_key,
        azure_endpoint="https://models.inference.ai.azure.com",
        api_version="2024-02-01",
        temperature=0.3,
    )


def dapatkan_llm_llama() -> Any:
    """
    Gunakan Llama 3.1 70B untuk inferensi AI yang powerful (EXPENSIVE!)
    
    Cost: $1.10/hour = $792/month (24/7) atau $242/month (auto-stop)
    Quality: Excellent (70B parameters)
    Response time: <1 second
    Unlimited requests (no rate limit)
    MAHAL! Hanya gunakan jika traffic > 10K users/month
    
    Setup: Lihat AZURE_PORTAL_SETUP.md (Section 2: Llama Deployment)
    
    Raises:
        ValueError: Jika Llama endpoint tidak dikonfigurasi
    """
    if not settings.llama_endpoint_url or not settings.llama_api_key:
        raise ValueError(
            "Llama endpoint tidak dikonfigurasi!\n"
            "Set LLAMA_ENDPOINT_URL dan LLAMA_API_KEY di .env\n"
            "Atau switch ke GitHub Models (gratis) dengan USE_GITHUB_MODELS=true"
        )
    
    return AzureMLOnlineEndpoint(
        endpoint_url=settings.llama_endpoint_url,
        endpoint_api_key=settings.llama_api_key,
        deployment_name="llama-3-1-70b-instruct",
        temperature=0.3,
    )


def dapatkan_llm_azure_openai() -> AzureChatOpenAI:
    """
    Gunakan Azure OpenAI untuk production (pay-per-use)
    
    Cost: GPT-4o-mini ~$1.88/10K requests
    Quality: Excellent
    Enterprise SLA & support
    Higher rate limits vs GitHub Models
    
    Setup: Create Azure OpenAI resource di Azure Portal
    
    Raises:
        ValueError: Jika Azure OpenAI tidak dikonfigurasi
    """
    if not settings.azure_openai_api_key or not settings.azure_openai_endpoint:
        raise ValueError(
            "Azure OpenAI tidak dikonfigurasi!\n"
            "Set AZURE_OPENAI_API_KEY dan AZURE_OPENAI_ENDPOINT di .env\n"
            "Atau switch ke GitHub Models (gratis) dengan USE_GITHUB_MODELS=true"
        )
    
    api_key = SecretStr(settings.azure_openai_api_key)
    
    return AzureChatOpenAI(
        model="gpt-4o-mini",
        api_key=api_key,
        azure_endpoint=settings.azure_openai_endpoint,
        api_version="2024-02-01",
        temperature=0.3,
    )


def dapatkan_llm() -> Any:
    """
    Auto-select LLM berdasarkan environment variables dengan error handling
    
    Priority:
    1. GitHub Models (jika USE_GITHUB_MODELS=true) - DEFAULT & RECOMMENDED
    2. Llama 3.1 70B (jika USE_LLAMA=true) - Expensive
    3. Azure OpenAI (jika USE_AZURE_OPENAI=true) - Alternative paid
    
    Returns:
        LLM instance yang siap digunakan
        
    Raises:
        ValueError: Jika tidak ada provider yang valid dikonfigurasi
    """
    try:
        if settings.use_github_models:
            print("Menggunakan GitHub Models (GRATIS)", file=sys.stderr)
            return dapatkan_llm_github_models()
        elif settings.use_llama:
            print("Menggunakan Llama 3.1 70B (EXPENSIVE!)", file=sys.stderr)
            return dapatkan_llm_llama()
        elif settings.use_azure_openai:
            print("Menggunakan Azure OpenAI (Pay-per-use)", file=sys.stderr)
            return dapatkan_llm_azure_openai()
        else:
            raise ValueError(
                "Tidak ada AI provider yang diaktifkan!\n"
                "Set salah satu flag di .env:\n"
                "  - USE_GITHUB_MODELS=true (RECOMMENDED - FREE)\n"
                "  - USE_LLAMA=true (expensive)\n"
                "  - USE_AZURE_OPENAI=true (pay-per-use)"
            )
    except ValueError as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        raise
    except Exception as e:
        print(f"Unexpected error saat inisialisasi LLM: {str(e)}", file=sys.stderr)
        raise ValueError(f"Gagal menginisialisasi AI provider: {str(e)}") from e
