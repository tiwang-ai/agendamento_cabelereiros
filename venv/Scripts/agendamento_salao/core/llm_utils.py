import requests
from django.conf import settings
from .filters import filtrar_pergunta_bot1, filtrar_pergunta_bot2

def gerar_prompt_bot1(pergunta):
    prompt = f"""
    Você é um bot de atendimento ao cliente da empresa que fornece o sistema de agendamento para salões. Responda apenas a perguntas sobre relatórios, configuração do sistema e status de agendamentos.
    Pergunta: {pergunta}
    """
    return prompt

def gerar_prompt_bot2(pergunta):
    prompt = f"""
    Você é um bot de atendimento para um salão de beleza. Responda apenas a perguntas sobre agendamentos, tipos de serviços e horários disponíveis.
    Pergunta: {pergunta}
    """
    return prompt

def processar_pergunta(pergunta, bot_tipo):
    if bot_tipo == 1:  # Bot 1 - Atendimento ao salão cliente
        if filtrar_pergunta_bot1(pergunta):
            prompt = gerar_prompt_bot1(pergunta)
            resposta = chamar_llm(prompt)
        else:
            resposta = "Desculpe, só posso ajudar com questões sobre relatórios e configuração do sistema."
    
    elif bot_tipo == 2:  # Bot 2 - Atendimento ao cliente final do salão
        if filtrar_pergunta_bot2(pergunta):
            prompt = gerar_prompt_bot2(pergunta)
            resposta = chamar_llm(prompt)
        else:
            resposta = "Desculpe, só posso ajudar com questões sobre agendamentos e serviços do salão."

    return resposta

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
