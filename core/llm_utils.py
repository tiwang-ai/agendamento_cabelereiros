import requests
from django.conf import settings
from .filters import filtrar_pergunta_bot1, filtrar_pergunta_bot2
from .models import Estabelecimento, BotConfig, Interacao, Servico, Profissional, Cliente
from .integrations.evolution import EvolutionAPI
from typing import Dict, Optional

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

def gerar_prompt_bot1(pergunta):
    prompt = f"""
    Você é um bot de atendimento ao cliente da empresa que fornece o sistema de agendamento para salões. Responda apenas a perguntas sobre relatórios, configuração do sistema e status de agendamentos.
    Pergunta: {pergunta}
    """
    return prompt

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
        if bot_tipo == 2:  # Bot de atendimento ao cliente final
            estabelecimento = Estabelecimento.objects.get(id=estabelecimento_id)
            
            # Verifica se o bot está ativo
            bot_config = BotConfig.objects.filter(
                estabelecimento=estabelecimento,
                bot_ativo=True
            ).first()
            
            if not bot_config:
                return "Atendimento automático desativado."

            # Verifica se é cliente cadastrado
            is_client = Cliente.objects.filter(
                estabelecimento=estabelecimento,
                whatsapp__contains=numero_cliente
            ).exists()
            
            if not is_client and not bot_config.aceitar_nao_clientes:
                return bot_config.mensagem_nao_cliente
            
            # Processa mensagem baseado no estágio atual
            context = ConversationContext(estabelecimento_id, numero_cliente)
            resposta = processar_estagio_conversa(pergunta, context)
            
            # Registra interação
            Interacao.objects.create(
                salao=estabelecimento,
                tipo='bot_response',
                descricao=f"Pergunta: {pergunta}\nResposta: {resposta}"
            )
            
            return resposta
            
    except Exception as e:
        print(f"Erro ao processar pergunta: {str(e)}")
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

def chamar_llm(prompt):
    url = "https://api.deepinfra.com/v1/inference/meta-llama/Meta-Llama-3-8B-Instruct"
    headers = {
        "Authorization": f"Bearer {settings.DEEPINFRA_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "input": prompt,
        "stop": ["<|eot_id|>"]
    }
    
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code == 200:
        data = response.json()
        return data["results"][0]["generated_text"]
    else:
        return "Erro ao se comunicar com a LLM."
