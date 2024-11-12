import requests
from celery import shared_task
from datetime import datetime, timedelta
from .models import Agendamento, Cliente, Estabelecimento, Interacao
from .views import enviar_mensagem_whatsapp


@shared_task
def enviar_lembrete_agendamento():
    """
    Envia lembretes para os clientes 24 horas antes do agendamento.
    """
    hora_atual = datetime.now()
    hora_lembrete = hora_atual + timedelta(hours=24)
    
    agendamentos = Agendamento.objects.filter(data_agendamento=hora_lembrete.date(), horario__hour=hora_lembrete.hour)
    
    for agendamento in agendamentos:
        numero_cliente = agendamento.cliente.telefone
        mensagem = f"Olá, {agendamento.cliente.nome}! Lembre-se de que você tem um agendamento amanhã às {agendamento.horario} para {agendamento.servico}."
        enviar_mensagem_whatsapp(numero_cliente, mensagem)



def enviar_relatorio_whatsapp(tipo_relatorio, numero_destino, periodo_inicio=None, periodo_fim=None):
    """
    Função para enviar relatórios analíticos pelo WhatsApp.
    """
    base_url = "http://localhost:8000/api/relatorios/"
    if tipo_relatorio == "frequencia_clientes":
        url = f"{base_url}frequencia-clientes/?inicio={periodo_inicio}&fim={periodo_fim}"
    elif tipo_relatorio == "servicos_populares":
        url = f"{base_url}servicos-populares/"
    elif tipo_relatorio == "horarios_pico":
        url = f"{base_url}horarios-pico/"
    else:
        return "Tipo de relatório inválido."

    response = requests.get(url)
    relatorio = response.json()

    # Formatar o conteúdo do relatório para envio
    if tipo_relatorio == "frequencia_clientes":
        mensagem = f"Relatório de Frequência de Clientes:\nTotal de clientes atendidos entre {periodo_inicio} e {periodo_fim}: {relatorio['total_clientes']}"
    elif tipo_relatorio == "servicos_populares":
        mensagem = "Relatório de Serviços Mais Populares:\n" + "\n".join([f"{servico['servico__nome_servico']}: {servico['total']} vezes" for servico in relatorio["servicos_populares"]])
    elif tipo_relatorio == "horarios_pico":
        mensagem = "Relatório de Horários de Pico:\n" + "\n".join([f"{horario['horario']}: {horario['total']} agendamentos" for horario in relatorio["horarios_pico"]])

    # Enviar mensagem pelo WhatsApp usando Evolution API
    payload = {"numero": numero_destino, "mensagem": mensagem}
    evolution_url = "URL_DA_API_EVOLUTION"
    headers = {"Authorization": "Bearer SEU_TOKEN_EVOLUTION"}
    response = requests.post(evolution_url, json=payload, headers=headers)

    return response.json()


@shared_task
def enviar_mensagem_aniversario():
    """
    Envia uma mensagem de aniversário para os clientes que estão completando mais um ano hoje.
    """
    hoje = datetime.now().date()
    clientes_aniversariantes = Cliente.objects.filter(data_nascimento__month=hoje.month, data_nascimento__day=hoje.day)

    for cliente in clientes_aniversariantes:
        numero_cliente = cliente.whatsapp
        mensagem = f"Feliz Aniversário, {cliente.nome}! 🎉 Toda a equipe deseja um dia maravilhoso para você! Aproveite com muita alegria!"
        enviar_mensagem_whatsapp(numero_cliente, mensagem)

@shared_task
def enviar_mensagem_pos_atendimento():
    """
    Envia uma mensagem de agradecimento para clientes 24 horas após o atendimento.
    """
    ontem = datetime.now() - timedelta(days=1)
    agendamentos_ontem = Agendamento.objects.filter(data_agendamento=ontem.date())

    for agendamento in agendamentos_ontem:
        cliente = agendamento.cliente
        numero_cliente = cliente.whatsapp
        mensagem = f"Olá, {cliente.nome}! Esperamos que tenha gostado do seu atendimento de {agendamento.servico}. Agradecemos a sua preferência!"
        enviar_mensagem_whatsapp(numero_cliente, mensagem)


@shared_task
def generate_weekly_report():
    """
    Gera relatórios semanais de desempenho do Bot 2 e envia para os salões clientes.
    """
    saloes = Estabelecimento.objects.all()

    # Calcula a data de uma semana atrás
    uma_semana_atras = datetime.now() - timedelta(weeks=1)

    for salao in saloes:
        interacoes = Interacao.objects.filter(salao=salao, data__gte=uma_semana_atras)
        total_interacoes = interacoes.count()
        agendamentos = interacoes.filter(tipo="agendamento").count()
        
        # Gerar conteúdo do relatório
        relatorio = f"""
        Relatório Semanal para {salao.nome}:
        - Total de interações: {total_interacoes}
        - Total de agendamentos realizados: {agendamentos}
        - Feedback: Por favor, avalie o desempenho do bot através do link: [link de feedback]
        """

        # Enviar relatório via WhatsApp para o salão
        enviar_mensagem_whatsapp(salao.numero_whatsapp, relatorio)