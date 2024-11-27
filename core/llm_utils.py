import requests
from django.conf import settings
from .filters import filtrar_pergunta_bot1, filtrar_pergunta_bot2
from .models import Estabelecimento, BotConfig

def gerar_prompt_bot1(pergunta):
    prompt = f"""
    Você é um bot de atendimento ao cliente da empresa que fornece o sistema de agendamento para salões. Responda apenas a perguntas sobre relatórios, configuração do sistema e status de agendamentos.
    Pergunta: {pergunta}
    """
    return prompt

def gerar_prompt_bot2(pergunta, nome_estabelecimento, horario_funcionamento, servicos):
    prompt = f"""
    Você é um bot de atendimento para um salão de beleza. Responda apenas a perguntas sobre agendamentos, tipos de serviços e horários disponíveis.
    Pergunta: {pergunta}
    """
    return prompt

def processar_pergunta(pergunta, bot_tipo, estabelecimento_id=None):
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

            # Adiciona contexto do estabelecimento ao prompt
            prompt = gerar_prompt_bot2(
                pergunta=pergunta,
                nome_estabelecimento=estabelecimento.nome,
                horario_funcionamento=estabelecimento.horario_funcionamento,
                servicos=list(estabelecimento.servicos.all().values())
            )
        else:
            prompt = gerar_prompt_bot1(pergunta)

        resposta = chamar_llm(prompt)
        return resposta
    except Exception as e:
        print(f"Erro ao processar pergunta: {str(e)}")
        return "Desculpe, ocorreu um erro ao processar sua mensagem."

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
