import requests
from django.conf import settings
from .filters import filtrar_pergunta_bot1, filtrar_pergunta_bot2
from .models import Estabelecimento, BotConfig, Interacao, Servico, Profissional, Cliente
from .integrations.evolution import EvolutionAPI
from typing import Dict, Optional
from datetime import datetime
import json

class ConversationContext:
    def __init__(self, estabelecimento_id: int, numero_cliente: str):
        self.estabelecimento = Estabelecimento.objects.get(id=estabelecimento_id)
        self.numero_cliente = numero_cliente
        self.stage = 'initial'
        self.data = {}
        
    def update(self, **kwargs):
        self.data.update(kwargs)
        if 'stage' in kwargs:
            self.stage = kwargs['stage']
            
    def get_servicos(self):
        return Servico.objects.filter(estabelecimento=self.estabelecimento)
        
    def get_profissionais(self):
        return Profissional.objects.filter(estabelecimento=self.estabelecimento)

def gerar_prompt_bot1() -> str:
    """
    Gera o prompt padrão para o bot de suporte
    """
    return """Você é um bot de atendimento ao cliente da empresa que fornece o sistema de agendamento para salões. 
    Responda apenas a perguntas sobre relatórios, configuração do sistema e status de agendamentos."""

def gerar_prompt_bot2(pergunta, nome_estabelecimento, horario_funcionamento, servicos):
    prompt = f"""
    Você é um assistente virtual do salão {nome_estabelecimento}. 
    
    Horário de Funcionamento: {horario_funcionamento}
    
    Serviços Disponíveis:
    {format_servicos(servicos)}
    
    Instruções:
    - Seja cordial e profissional
    - Ajude com agendamentos
    - Verifique disponibilidade
    - Confirme dados antes de agendar
    - Ofereça alternativas se horário indisponível
    
    Contexto da Conversa:
    Cliente: {pergunta}
    Assistente:"""
    return prompt

def format_servicos(servicos):
    return "\n".join([
        f"- {s['nome_servico']} ({s['duracao']} min) - R$ {s['preco']}"
        for s in servicos
    ])

def processar_pergunta(pergunta: str, bot_tipo: int, estabelecimento_id: Optional[int] = None, numero_cliente: Optional[str] = None) -> str:
    """
    Processa perguntas para os bots com contexto do estabelecimento
    """
    try:
        print("\n=== PROCESSANDO MENSAGEM ===")
        print(f"Pergunta: {pergunta}")
        print(f"Bot Tipo: {bot_tipo}")
        
        # Filtra pergunta
        if bot_tipo == 1:
            pergunta_filtrada = filtrar_pergunta_bot1(pergunta)
        else:
            pergunta_filtrada = filtrar_pergunta_bot2(pergunta)
            
        print(f"Pergunta Filtrada: {pergunta_filtrada}")
        
        # Gera prompt
        prompt = gerar_prompt_bot1() if bot_tipo == 1 else gerar_prompt_bot2(
            pergunta_filtrada,
            estabelecimento_id,
            numero_cliente
        )
        print(f"Prompt Gerado: {prompt}")
        
        # Chama LLM
        resposta = chamar_llm(prompt)
        print(f"Resposta LLM: {resposta}")
        print("=== FIM PROCESSAMENTO ===\n")
        
        return resposta
        
    except Exception as e:
        print(f"ERRO no processamento: {str(e)}")
        return "Desculpe, ocorreu um erro ao processar sua mensagem."

def processar_estagio_conversa(pergunta: str, context: ConversationContext) -> str:
    """
    Processa a mensagem baseado no estágio atual da conversa
    """
    if context.stage == 'initial':
        # Identifica intenção
        if any(palavra in pergunta.lower() for palavra in ['agendar', 'marcar', 'horário']):
            context.update(stage='service_selection')
            servicos = context.get_servicos()
            return gerar_lista_servicos(servicos)
            
    elif context.stage == 'service_selection':
        # Processa seleção de serviço
        servico = identificar_servico(pergunta, context.get_servicos())
        if servico:
            context.update(stage='professional_selection', servico_id=servico.id)
            profissionais = context.get_profissionais()
            return gerar_lista_profissionais(profissionais)
            
    elif context.stage == 'professional_selection':
        # Processa seleção de profissional
        profissional = identificar_profissional(pergunta, context.get_profissionais())
        if profissional:
            context.update(stage='date_selection', profissional_id=profissional.id)
            return "Qual data você prefere para o agendamento?"
    
    # ... outros estágios
    
    return gerar_resposta_padrao(context.stage)

def gerar_lista_servicos(servicos) -> str:
    """
    Gera mensagem com lista de serviços disponíveis
    """
    mensagem = "Ótimo! Temos os seguintes serviços disponíveis:\n\n"
    for servico in servicos:
        mensagem += f"- {servico.nome_servico} (R$ {servico.preco})\n"
    mensagem += "\nQual serviço você gostaria de agendar?"
    return mensagem

def gerar_lista_profissionais(profissionais) -> str:
    """
    Gera mensagem com lista de profissionais disponíveis
    """
    mensagem = "Com qual profissional você gostaria de agendar?\n\n"
    for prof in profissionais:
        mensagem += f"- {prof.nome} ({prof.especialidade})\n"
    return mensagem

def identificar_servico(texto: str, servicos) -> Optional[Servico]:
    """
    Identifica serviço mencionado na mensagem
    """
    for servico in servicos:
        if servico.nome_servico.lower() in texto.lower():
            return servico
    return None

def identificar_profissional(texto: str, profissionais) -> Optional[Profissional]:
    """
    Identifica profissional mencionado na mensagem
    """
    for prof in profissionais:
        if prof.nome.lower() in texto.lower():
            return prof
    return None

def chamar_llm(texto: str, debug: bool = True) -> str:
    """
    Função centralizada para chamar o LLM usando a API do Deepinfra
    """
    if not settings.DEEPINFRA_API_KEY:
        raise ValueError("DEEPINFRA_API_KEY não configurada")

    # Endpoint correto para chat completions
    url = "https://api.deepinfra.com/v1/openai/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {settings.DEEPINFRA_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": settings.DEEPINFRA_MODEL,
        "messages": [
            {
                "role": "system",
                "content": "Você é um assistente virtual profissional e prestativo."
            },
            {
                "role": "user",
                "content": texto
            }
        ]
    }

    if debug:
        print("\n=== CHAMADA LLM ===")
        print(f"URL: {url}")
        print(f"Headers: {headers}")
        print(f"Payload: {json.dumps(payload, indent=2, ensure_ascii=False)}")

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        if debug:
            print(f"Resposta: {response.text}\n")
            print("=== FIM CHAMADA LLM ===\n")
        
        data = response.json()
        return data['choices'][0]['message']['content']
        
    except Exception as e:
        print(f"Erro na chamada LLM: {str(e)}")
        if debug and 'response' in locals():
            print(f"Resposta de erro: {response.text}")
        raise

class ConversationManager:
    def __init__(self):
        self.conversations = {}
        
    def get_conversation(self, conversation_id: str) -> list:
        """Retorna histórico da conversa ou cria novo"""
        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = []
        return self.conversations[conversation_id]
        
    def add_message(self, conversation_id: str, role: str, content: str):
        """Adiciona mensagem ao histórico"""
        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = []
        
        self.conversations[conversation_id].append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
        
        # Mantém apenas as últimas 10 mensagens para não sobrecarregar
        if len(self.conversations[conversation_id]) > 10:
            self.conversations[conversation_id].pop(0)
            
    def get_context(self, conversation_id: str) -> str:
        """Formata o contexto para a LLM"""
        messages = self.conversations.get(conversation_id, [])
        context = "\n".join([
            f"{msg['role']}: {msg['content']}"
            for msg in messages
        ])
        return context

# Instância global do gerenciador
conversation_manager = ConversationManager()

def gerar_resposta_padrao(stage: str) -> str:
    """
    Gera resposta padrão baseada no estágio da conversa
    """
    respostas = {
        'initial': 'Como posso ajudar você hoje?',
        'service_selection': 'Por favor, escolha um dos serviços listados acima.',
        'professional_selection': 'Por favor, escolha um dos profissionais listados.',
        'date_selection': 'Em qual data você gostaria de agendar?',
        'time_selection': 'Qual horário você prefere?',
        'confirmation': 'Posso confirmar seu agendamento?'
    }
    return respostas.get(stage, 'Como posso ajudar?')
