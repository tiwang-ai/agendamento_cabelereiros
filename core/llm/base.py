import requests
from django.conf import settings
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)

def chamar_llm(prompt: str) -> str:
    """Função genérica para chamar o LLM"""
    try:
        response = requests.post(
            settings.LLM_API_URL,
            json={"prompt": prompt},
            headers={"Authorization": f"Bearer {settings.LLM_API_KEY}"}
        )
        response.raise_for_status()
        return response.json()["response"]
    except Exception as e:
        logger.error(f"Erro ao chamar LLM: {str(e)}")
        raise 