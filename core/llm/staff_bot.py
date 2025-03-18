from typing import Dict, Optional
from .base import chamar_llm
from ..models import SystemConfig
import logging

logger = logging.getLogger(__name__)

class StaffBotProcessor:
    """Processador de mensagens para o bot de suporte"""
    
    @staticmethod
    def gerar_prompt() -> str:
        config = SystemConfig.objects.first()
        return f"""Você é um bot de atendimento ao cliente da empresa que fornece o sistema de agendamento para salões. 
        Nome da empresa: {config.company_name}
        
        Instruções:
        - Responda apenas a perguntas sobre:
          * Relatórios
          * Configuração do sistema
          * Status de agendamentos
          * Problemas técnicos
        - Seja profissional e objetivo
        - Encaminhe para suporte humano casos complexos
        """
    
    @staticmethod
    def processar_pergunta(pergunta: str) -> str:
        try:
            prompt = StaffBotProcessor.gerar_prompt()
            return chamar_llm(prompt + "\n\nPergunta: " + pergunta)
        except Exception as e:
            logger.error(f"Erro ao processar pergunta do bot de suporte: {str(e)}")
            return "Desculpe, ocorreu um erro ao processar sua mensagem." 