import requests
from rest_framework import viewsets, status, serializers
from django.contrib.auth import get_user_model
from .models import Estabelecimento, Profissional, Cliente, Servico, Agendamento
from .serializers import EstabelecimentoSerializer, ProfissionalSerializer, ClienteSerializer, ServicoSerializer, AgendamentoSerializer
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings
from datetime import datetime, timedelta
from django.db.models import Count, Sum
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAdminUser

from .models import (
    Estabelecimento, 
    Profissional, 
    Cliente, 
    Servico, 
    Agendamento
)
from .serializers import (
    EstabelecimentoSerializer,
    ProfissionalSerializer,
    ClienteSerializer,
    ServicoSerializer,
    AgendamentoSerializer,
    UserSerializer
)
from .llm_utils import processar_pergunta
from .integrations.evolution import criar_instancia_evolution

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate

import mercadopago

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Verifica se é login por email ou telefone
        email = attrs.get('email')
        phone = attrs.get('phone')
        password = attrs.get('password')

        if not (email or phone) or not password:
            raise serializers.ValidationError('Informe email/telefone e senha')

        # Tenta autenticar por email
        if email:
            user = authenticate(email=email, password=password)
        # Tenta autenticar por telefone
        else:
            user = User.objects.filter(phone=phone).first()
            if user:
                user = authenticate(email=user.email, password=password)

        if user:
            data = super().validate(attrs)
            data.update({
                'email': user.email,
                'name': user.name,
                'role': user.role,
                'estabelecimento_id': user.estabelecimento_id if user.estabelecimento else None
            })
            return data
        
        raise serializers.ValidationError('Credenciais inválidas')

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        return token

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class EstabelecimentoViewSet(viewsets.ModelViewSet):
    queryset = Estabelecimento.objects.all()
    serializer_class = EstabelecimentoSerializer

class ProfissionalViewSet(viewsets.ModelViewSet):
    queryset = Profissional.objects.all()
    serializer_class = ProfissionalSerializer

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

class ServicoViewSet(viewsets.ModelViewSet):
    queryset = Servico.objects.all()
    serializer_class = ServicoSerializer

class AgendamentoViewSet(viewsets.ModelViewSet):
    queryset = Agendamento.objects.all()
    serializer_class = AgendamentoSerializer


def enviar_mensagem_whatsapp(numero, mensagem):
    """
    Função para enviar uma mensagem via WhatsApp usando a API do Evolution.

    Parâmetros:
    - numero (str): Número do destinatário no formato internacional (ex: "+5511999999999").
    - mensagem (str): Conteúdo da mensagem a ser enviada.

    Retorno:
    - dict: Resposta JSON da API do Evolution.
    """
    url = settings.EVOLUTION_API_URL  # Defina essa URL no settings.py
    payload = {
        "numero": numero,
        "mensagem": mensagem
    }
    headers = {
        "Authorization": f"Bearer {settings.EVOLUTION_API_TOKEN}",  # Defina esse token no settings.py
        "Content-Type": "application/json"
    }
    response = requests.post(url, json=payload, headers=headers)
    return response.json()




@api_view(["POST"])
def receber_mensagem_whatsapp(request):
    """
    Função para receber mensagens do WhatsApp via webhook do Evolution e processá-las com a LLM do Deep Infra.
    """
    data = request.data
    numero = data.get("numero")
    mensagem = data.get("mensagem")

    # Envia a mensagem recebida para o Deep Infra e obtém a resposta da LLM
    resposta_ia = enviar_para_deep_infra(mensagem)

    # Envia a resposta da LLM de volta para o cliente via WhatsApp
    enviar_mensagem_whatsapp(numero, resposta_ia)

    return Response({"status": "Mensagem processada com sucesso!"})



def enviar_para_deep_infra(mensagem):
    """
    Função para enviar uma mensagem para a LLM hospedada no Deep Infra e receber uma resposta.

    Parâmetros:
    - mensagem (str): Texto da mensagem a ser processada pela LLM.

    Retorno:
    - str: Resposta gerada pela LLM.
    """
    url = settings.DEEP_INFRA_API_URL
    headers = {
        "Authorization": f"Bearer {settings.DEEP_INFRA_API_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "query": mensagem
    }
    response = requests.post(url, json=payload, headers=headers)
    response_data = response.json()
    return response_data.get("response", "Desculpe, não entendi a sua pergunta.")


def verificar_disponibilidade(profissional_id, data, horario):
    """
    Verifica se o profissional está disponível em uma data e horário específicos.
    """
    data_horario = datetime.strptime(f"{data} {horario}", "%Y-%m-%d %H:%M")
    agendamentos_existentes = Agendamento.objects.filter(
        profissional_id=profissional_id,
        data_agendamento=data,
        horario=horario
    )

    # Se houver agendamentos existentes, o horário está indisponível
    return not agendamentos_existentes.exists()


class AgendamentoViewSet(viewsets.ModelViewSet):
    queryset = Agendamento.objects.all()
    serializer_class = AgendamentoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['data_agendamento', 'profissional', 'servico']

    def create(self, request, *args, **kwargs):
        profissional_id = request.data.get("profissional_id")
        data = request.data.get("data_agendamento")
        horario = request.data.get("horario")
        response = super().create(request, *args, **kwargs)
        agendamento = response.data

        # Verifique a disponibilidade chamando a função verificar_disponibilidade
        disponibilidade = verificar_disponibilidade(profissional_id, data, horario)

        if not disponibilidade:
            return Response(
                {"erro": "Horário indisponível para o profissional escolhido."},
                status=status.HTTP_400_BAD_REQUEST
            )

        numero_cliente = agendamento['cliente']['telefone']
        mensagem = f"Olá, {agendamento['cliente']['nome']}! Seu agendamento para o serviço {agendamento['servico']} está confirmado para o dia {agendamento['data_agendamento']} às {agendamento['horario']}."
        enviar_mensagem_whatsapp(numero_cliente, mensagem)
        # Se o horário estiver disponível, continue com a criação do agendamento
        return super().create(request, *args, **kwargs)
    
@api_view(['GET'])
def listar_agendamentos_calendario(request):
    """
    Endpoint para listar agendamentos no formato de calendário.
    Retorna todos os agendamentos do cliente autenticado.
    """
    cliente_id = request.user.id  # Assumindo que o cliente está autenticado
    agendamentos = Agendamento.objects.filter(cliente_id=cliente_id).order_by('data_agendamento', 'horario')
    serializer = AgendamentoSerializer(agendamentos, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def relatorio_frequencia_clientes(request):
    """
    Relatório de frequência de clientes em um período.
    """
    periodo_inicio = request.query_params.get("inicio")
    periodo_fim = request.query_params.get("fim")

    if not periodo_inicio or not periodo_fim:
        return Response({"erro": "Especifique o período de início e fim."}, status=400)

    agendamentos = Agendamento.objects.filter(
        data_agendamento__range=[periodo_inicio, periodo_fim]
    ).values("cliente").distinct().count()

    return Response({"total_clientes": agendamentos})

@api_view(['GET'])
def relatorio_servicos_populares(request):
    """
    Relatório dos serviços mais populares.
    """
    servicos_populares = Agendamento.objects.values("servico__nome_servico").annotate(total=Count("servico")).order_by("-total")[:5]
    return Response({"servicos_populares": list(servicos_populares)})

@api_view(['GET'])
def relatorio_horarios_pico(request):
    """
    Relatório dos horários de pico (maior número de agendamentos).
    """
    horarios_pico = Agendamento.objects.values("horario").annotate(total=Count("horario")).order_by("-total")[:5]
    return Response({"horarios_pico": list(horarios_pico)})

@api_view(['POST'])
def solicitar_relatorio_whatsapp(request):
    """
    Endpoint para solicitar um relatório pelo WhatsApp.
    """
    tipo_relatorio = request.data.get("tipo_relatorio")
    numero_destino = request.data.get("numero_destino")
    periodo_inicio = request.data.get("inicio")
    periodo_fim = request.data.get("fim")

    resposta = enviar_relatorio_whatsapp(tipo_relatorio, numero_destino, periodo_inicio, periodo_fim)
    return Response(resposta)

def enviar_relatorio_whatsapp(tipo_relatorio, numero_destino, periodo_inicio=None, periodo_fim=None):
    """
    Gera e envia um relatório via WhatsApp usando a API do Evolution.

    Parâmetros:
    - tipo_relatorio (str): O tipo de relatório ('frequencia_clientes', 'servicos_populares' ou 'horarios_pico').
    - numero_destino (str): Número de telefone do destinatário no formato internacional (ex: "+5511999999999").
    - periodo_inicio (str, opcional): Data de incio para relatórios com período (ex: "2024-01-01").
    - periodo_fim (str, opcional): Data de fim para relatórios com período (ex: "2024-12-31").

    Retorno:
    - dict: Resposta JSON da API do Evolution ou uma mensagem de erro.
    """
    
    # Define a URL base para os endpoints de relatório
    base_url = "http://localhost:8000/api/relatorios/"
    
    # Gera o relatório baseado no tipo solicitado
    if tipo_relatorio == "frequencia_clientes":
        if not periodo_inicio or not periodo_fim:
            return {"erro": "Período de início e fim são necessários para o relatório de frequência de clientes."}
        url = f"{base_url}frequencia-clientes/?inicio={periodo_inicio}&fim={periodo_fim}"
        titulo_relatorio = "Relatório de Frequência de Clientes"
    elif tipo_relatorio == "servicos_populares":
        url = f"{base_url}servicos-populares/"
        titulo_relatorio = "Relatório de Serviços Mais Populares"
    elif tipo_relatorio == "horarios_pico":
        url = f"{base_url}horarios-pico/"
        titulo_relatorio = "Relatório de Horários de Pico"
    else:
        return {"erro": "Tipo de relatório inválido."}

    # Envia a requisição para obter o relatório
    try:
        response = requests.get(url)
        response.raise_for_status()
        relatorio = response.json()
    except requests.exceptions.RequestException as e:
        return {"erro": f"Erro ao gerar o relatório: {e}"}

    # Formata o conteúdo do relatório como mensagem
    if tipo_relatorio == "frequencia_clientes":
        mensagem = f"{titulo_relatorio}:\nTotal de clientes atendidos entre {periodo_inicio} e {periodo_fim}: {relatorio['total_clientes']}"
    elif tipo_relatorio == "servicos_populares":
        mensagem = f"{titulo_relatorio}:\n" + "\n".join([f"{servico['servico__nome_servico']}: {servico['total']} vezes" for servico in relatorio["servicos_populares"]])
    elif tipo_relatorio == "horarios_pico":
        mensagem = f"{titulo_relatorio}:\n" + "\n".join([f"{horario['horario']}: {horario['total']} agendamentos" for horario in relatorio["horarios_pico"]])

    # Configuração para a API do Evolution
    evolution_url = settings.EVOLUTION_API_URL  # Exemplo: "https://api.evolution.com/whatsapp/send"
    headers = {
        "Authorization": f"Bearer {settings.EVOLUTION_API_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "numero": numero_destino,
        "mensagem": mensagem
    }

    # Envia a mensagem via API do Evolution
    try:
        response = requests.post(evolution_url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"erro": f"Erro ao enviar mensagem pelo WhatsApp: {e}"}
    
@api_view(['POST'])
def onboarding(request):
    dados_salao = request.data
    numero_whatsapp = dados_salao.get("numero_whatsapp")
    servicos = dados_salao.get("servicos")
    horario_funcionamento = dados_salao.get("horario_funcionamento")

    # Criação e configuração do salão
    salao = Salão.objects.create(
        numero_whatsapp=numero_whatsapp,
        servicos=servicos,
        horario_funcionamento=horario_funcionamento
    )
        # Configuração do calendário para o salão
    calendario = Calendário.objects.create(salao=salao)

    # Configuração do bot para o número de WhatsApp do salão
    configurar_bot_whatsapp(salao)


    # Criar a instância no Evolution
    resposta_evolution = criar_instancia_evolution(dados_salao)

    if resposta_evolution:
        # Salvar o salão no banco de dados
        salao = Estabelecimento.objects.create(
            nome=dados_salao["nome"],
            whatsapp=dados_salao["whatsapp"],
            horario_funcionamento=dados_salao["horario_funcionamento"],
            # Salve outros dados se necessário
        )

        # Adicione o ID da instância no Evolution ao salão
        salao.evolution_instance_id = resposta_evolution.get("id")  # Exemplo de campo, ajuste conforme necessário
        salao.save()

        return Response({"message": "Onboarding concluído com sucesso!", "salao_id": salao.id})
    else:
        return Response({"error": "Erro ao criar instância no Evolution"}, status=500)



def configurar_bot_whatsapp(salao):
    """
    Configura o Bot 2 para o WhatsApp do salão cliente com base nos dados do salão.
    """
    # Configurações personalizadas de mensagens e respostas automáticas
    mensagens_boas_vindas = f"Olá! Bem-vindo ao {salao.nome}. Como posso ajudar você com seu agendamento?"
    mensagens_confirmacao = "Seu agendamento foi confirmado!"
    
    # Configuração do bot usando a API do WhatsApp
    payload = {
        "numero": salao.numero_whatsapp,
        "mensagem_boas_vindas": mensagens_boas_vindas,
        "mensagem_confirmacao": mensagens_confirmacao,
        "servicos": salao.servicos,
        "horario_funcionamento": salao.horario_funcionamento
    }
    
    # Enviar configuração para o Evolution ou API de automação do WhatsApp
    response = requests.post(settings.EVOLUTION_API_CONFIG_URL, json=payload, headers={
        "Authorization": f"Bearer {settings.EVOLUTION_API_TOKEN}"
    })
    
    return response.json()



def gerar_resposta_whatsapp(input_text):
    url = "https://api.deepinfra.com/v1/inference/meta-llama/Meta-Llama-3-8B-Instruct"
    headers = {"Authorization": f"Bearer {settings.DEEPINFRA_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "input": f"<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n{input_text}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n",
        "stop": ["<|eot_id|>"]
    }

    response = requests.post(url, json=payload, headers=headers)
    return response.json()["results"][0]["generated_text"]

@api_view(['POST'])
def bot_responder(request):
    """
    View para processar perguntas e retornar respostas baseadas no tipo de bot.
    """
    dados = request.data
    pergunta = dados.get("pergunta")
    bot_tipo = dados.get("bot_tipo")  # 1 para Bot 1 (salão) e 2 para Bot 2 (cliente final)

    if not pergunta or not bot_tipo:
        return Response({"error": "Pergunta e tipo de bot são obrigatórios"}, status=400)

    resposta = processar_pergunta(pergunta, bot_tipo)
    return Response({"resposta": resposta})

@api_view(['POST'])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'user': UserSerializer(user).data,
            'message': 'Usuário criado com sucesso!'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def finance_stats(request):
    """
    Retorna estatísticas financeiras para o painel administrativo
    """
    today = datetime.now()
    first_day_of_month = today.replace(day=1)
    
    # Calcular estatísticas
    total_revenue = Agendamento.objects.filter(
        status='completed'
    ).aggregate(total=Sum('servico__preco'))['total'] or 0
    
    monthly_revenue = Agendamento.objects.filter(
        status='completed',
        data_agendamento__gte=first_day_of_month
    ).aggregate(total=Sum('servico__preco'))['total'] or 0
    
    pending_payments = Agendamento.objects.filter(
        status='pending'
    ).aggregate(total=Sum('servico__preco'))['total'] or 0
    
    active_subscriptions = User.objects.filter(
        role='OWNER',
        is_active=True
    ).count()
    
    return Response({
        'totalRevenue': total_revenue,
        'monthlyRevenue': monthly_revenue,
        'pendingPayments': pending_payments,
        'activeSubscriptions': active_subscriptions
    })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def finance_transactions(request):
    """
    Retorna lista de transações financeiras filtradas
    """
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    transaction_type = request.query_params.get('type')
    status = request.query_params.get('status')
    
    transactions = Agendamento.objects.all()
    
    if start_date:
        transactions = transactions.filter(data_agendamento__gte=start_date)
    if end_date:
        transactions = transactions.filter(data_agendamento__lte=end_date)
    if status and status != 'all':
        transactions = transactions.filter(status=status)
        
    # Converter agendamentos em transações
    transaction_list = []
    for agendamento in transactions:
        transaction_list.append({
            'id': agendamento.id,
            'date': agendamento.data_agendamento,
            'description': f'Agendamento - {agendamento.servico.nome_servico}',
            'amount': float(agendamento.servico.preco),
            'type': 'income',
            'status': agendamento.status,
            'category': 'Serviço',
            'salon_id': agendamento.profissional.estabelecimento.id
        })
    
    return Response(transaction_list)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats(request):
    """
    Retorna estatísticas para o dashboard administrativo
    """
    total_salons = Estabelecimento.objects.count()
    active_salons = Estabelecimento.objects.filter(is_active=True).count()
    total_revenue = Agendamento.objects.filter(status='completed').aggregate(
        total=Sum('servico__preco'))['total'] or 0
    active_subscriptions = User.objects.filter(role='OWNER', is_active=True).count()
    
    # Atividades recentes
    recent_activities = []
    recent_appointments = Agendamento.objects.order_by('-data_agendamento')[:5]
    for appointment in recent_appointments:
        recent_activities.append({
            'id': appointment.id,
            'type': 'appointment',
            'description': f'Novo agendamento - {appointment.cliente.nome}',
            'date': appointment.data_agendamento
        })
    
    return Response({
        'totalSalons': total_salons,
        'activeSalons': active_salons,
        'totalRevenue': float(total_revenue),
        'activeSubscriptions': active_subscriptions,
        'recentActivities': recent_activities
    })

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return User.objects.all().select_related('estabelecimento')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

@api_view(['POST'])
def create_payment_preference(request):
    plan_id = request.data.get('planId')
    plan = Plan.objects.get(id=plan_id)
    
    sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
    
    preference_data = {
        "items": [
            {
                "title": plan.name,
                "quantity": 1,
                "currency_id": "BRL",
                "unit_price": float(plan.price)
            }
        ],
        "back_urls": {
            "success": f"{settings.FRONTEND_URL}/payment/success",
            "failure": f"{settings.FRONTEND_URL}/payment/failure",
            "pending": f"{settings.FRONTEND_URL}/payment/pending"
        },
        "auto_return": "approved",
    }
    
    preference_response = sdk.preference().create(preference_data)
    
    return Response(preference_response["response"])

@api_view(['POST'])
def process_payment(request):
    payment_id = request.data.get('payment_id')
    salon_id = request.data.get('salon_id')
    
    sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
    payment = sdk.payment().get(payment_id)
    
    if payment["status"] == "approved":
        # Ativar o salão
        salon = Estabelecimento.objects.get(id=salon_id)
        salon.is_active = True
        salon.save()
        
        return Response({"status": "approved"})
    
    return Response({"status": payment["status"]}, status=400)