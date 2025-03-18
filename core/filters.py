def filtrar_pergunta_bot1(pergunta):
    palavras_chave = ["relatório", "configuração", "agendamentos", "status"]
    for palavra in palavras_chave:
        if palavra in pergunta.lower():
            return True
    return False

def filtrar_pergunta_bot2(pergunta):
    palavras_chave = ["agendamento", "serviço", "horário", "disponível", "preço"]
    for palavra in palavras_chave:
        if palavra in pergunta.lower():
            return True
    return False
