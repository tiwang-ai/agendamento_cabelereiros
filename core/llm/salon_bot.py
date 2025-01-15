from typing import Dict, Optional
from .base import chamar_llm
from ..models import Estabelecimento, Servico, Profissional
import logging

logger = logging.getLogger(__name__)

class SalonBotProcessor:
    """Processador de mensagens para o bot dos salões"""
    
    def __init__(self, estabelecimento_id: int):
        self.estabelecimento = Estabelecimento.objects.get(id=estabelecimento_id)
        
    def gerar_prompt(self, pergunta: str) -> str:
        servicos = Servico.objects.filter(estabelecimento=self.estabelecimento)
        profissionais = Profissional.objects.filter(estabelecimento=self.estabelecimento)
        
        servicos_formatados = "\n".join([
            f"- {s.nome_servico} ({s.duracao} min) - R$ {s.preco}"
            for s in servicos
        ])
        
        profissionais_formatados = "\n".join([
            f"- {p.nome} - {', '.join(p.especialidades.values_list('nome', flat=True))}"
            for p in profissionais
        ])
        
        return f"""
        Você é um assistente virtual do salão {self.estabelecimento.nome}. 
        
        Horário de Funcionamento: {self.estabelecimento.horario_funcionamento}
        Endereço: {self.estabelecimento.endereco}
        
        Serviços Disponíveis:
        {servicos_formatados}
        
        Profissionais:
        {profissionais_formatados}
        
        Instruções:
        - Seja cordial e profissional
        - Ajude com agendamentos
        - Verifique disponibilidade
        - Confirme dados antes de agendar
        - Ofereça alternativas se horário indisponível
        
        Pergunta do Cliente: {pergunta}
        Assistente:"""
    
    def processar_pergunta(self, pergunta: str, numero_cliente: str) -> str:
        try:
            prompt = self.gerar_prompt(pergunta)
            return chamar_llm(prompt)
        except Exception as e:
            logger.error(f"Erro ao processar pergunta do bot do salão: {str(e)}")
            return "Desculpe, ocorreu um erro ao processar sua mensagem." 