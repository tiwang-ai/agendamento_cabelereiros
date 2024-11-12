# core/integrations/evolution.py

import requests
from django.conf import settings

def criar_instancia_evolution(dados_salao):
    """
    Cria uma instância no Evolution para um novo salão.
    
    Parâmetros:
    - dados_salao: dicionário contendo as informações do salão.

    Retorno:
    - Resposta da API do Evolution se bem-sucedido, None se falhar.
    """
    url = settings.EVOLUTION_API_URL
    headers = {
        "Authorization": f"Bearer {settings.EVOLUTION_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "nome": dados_salao["nome"],
        "whatsapp": dados_salao["whatsapp"],
        "horario_funcionamento": dados_salao["horario_funcionamento"],
        # Inclua outros campos conforme necessário
    }

    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 201:
        return response.json()  # Dados de resposta da API
    else:
        print("Erro ao criar instância no Evolution:", response.text)
        return None
