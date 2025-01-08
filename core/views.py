import requests
from rest_framework import viewsets, status, serializers
from django.contrib.auth import get_user_model
from .models import Estabelecimento, Profissional, Cliente, Servico, Agendamento, Calendario_Estabelecimento, Interacao, Plan, SystemConfig, BotConfig, SystemService, SalonService, ActivityLog, Transaction
from .serializers import EstabelecimentoSerializer, ProfissionalSerializer, ClienteSerializer, ServicoSerializer, AgendamentoSerializer, UserSerializer, ChatConfigSerializer, SystemServiceSerializer, SalonServiceSerializer, StaffSerializer, SystemConfigSerializer
from django.conf import settings
from django.db import connection
from django_redis import get_redis_connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from datetime import datetime, timedelta
from django.db.models import Count, Sum, Q, Avg
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from .services.system_logs import SystemMonitor
from django.http import JsonResponse
from .integrations.evolution import (
    EvolutionAPI
)

from .models import (
    Estabelecimento, 
    Profissional, 
    Cliente, 
    Servico, 
    Agendamento,
    Calendario_Estabelecimento,
    Interacao,
    Plan
)

from .serializers import (
    EstabelecimentoSerializer,
    ProfissionalSerializer,
    ClienteSerializer,
    ServicoSerializer,
    AgendamentoSerializer,
    UserSerializer,
    SystemConfigSerializer,
    StaffSerializer
)
from .llm_utils import processar_pergunta, conversation_manager, chamar_llm

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate

import mercadopago

User = get_user_model()

# Singleton para EvolutionAPI
evolution_api = EvolutionAPI()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        try:
            # Verifica se tem telefone ou email
            phone = attrs.get('phone')
            email = attrs.get('email')
            password = attrs.get('password')

            if not (phone or email):
                raise serializers.ValidationError({'detail': 'Informe email ou telefone'})
            
            if not password:
                raise serializers.ValidationError({'detail': 'Senha é obrigatória'})

            # Normaliza o telefone se fornecido
            if phone:
                phone = ''.join(filter(str.isdigit, phone))
                if not phone.startswith('55'):
                    phone = '55' + phone
                try:
                    user = User.objects.get(phone=phone)
                    attrs['username'] = phone  # Usa o telefone como username
                except User.DoesNotExist:
                    raise serializers.ValidationError({'detail': 'Usuário não encontrado'})
            else:
                attrs['username'] = email

            user = authenticate(
                request=self.context.get('request'),
                username=attrs['username'],
                password=password
            )

            if not user:
                raise serializers.ValidationError({'detail': 'Credenciais inválidas'})

            data = super().validate(attrs)
            data.update({
                'id': str(user.id),
                'name': user.name,
                'email': user.email,
                'phone': user.phone,
                'role': user.role,
                'estabelecimento_id': str(user.estabelecimento_id) if user.estabelecimento_id else None,
            })
            return data
            
        except Exception as e:
            print(f"Erro de autenticação: {str(e)}")
            raise

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        return token

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        print("Dados recebidos:", request.data)  # Debug
        return super().post(request, *args, **kwargs)

class EstabelecimentoViewSet(viewsets.ModelViewSet):
    queryset = Estabelecimento.objects.all()
    serializer_class = EstabelecimentoSerializer
    permission_classes = [IsAdminUser]

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            estabelecimento = serializer.save()

            # Criar instância WhatsApp automaticamente
            api = EvolutionAPI()
            instance_response = api.criar_instancia(
                estabelecimento_id=str(estabelecimento.id),
                phone=estabelecimento.whatsapp
            )
            
            if instance_response:
                estabelecimento.evolution_instance_id = instance_response.get('instanceId')
                estabelecimento.status = 'pending_connection'
                estabelecimento.save()
                
                # Ativar bot automaticamente
                BotConfig.objects.create(
                    estabelecimento=estabelecimento,
                    bot_ativo=True
                )

                # Configurar webhooks
                api.configurar_webhooks(instance_response.get('instanceId'))

            return Response(serializer.data, status=201)
        except Exception as e:
            print(f"Erro ao criar estabelecimento: {str(e)}")
            return Response({
                'error': f'Erro ao criar estabelecimento: {str(e)}'
            }, status=500)

    def destroy(self, request, *args, **kwargs):
        try:
            estabelecimento = self.get_object()
            
            # Deletar instância WhatsApp se existir
            if estabelecimento.evolution_instance_id:
                try:
                    api = EvolutionAPI()
                    # Primeiro desconecta
                    api.disconnect_instance(estabelecimento.evolution_instance_id)
                    # Depois deleta a instância
                    url = f"{api.base_url}/instance/delete/{estabelecimento.evolution_instance_id}"
                    response = requests.delete(url, headers=api.headers)
                    if response.status_code not in [200, 204]:
                        print(f"Erro ao deletar instância: {response.text}")
                except Exception as e:
                    print(f"Erro ao desconectar/deletar instância WhatsApp: {str(e)}")
            
            # Deletar estabelecimento e todos os registros relacionados
            estabelecimento.delete()
            return Response(status=204)
        except Exception as e:
            print(f"Erro ao deletar estabelecimento: {str(e)}")
            return Response({
                'error': f'Erro ao deletar estabelecimento: {str(e)}'
            }, status=500)

class ProfissionalViewSet(viewsets.ModelViewSet):
    serializer_class = ProfissionalSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['estabelecimento']

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Profissional.objects.all()
        elif hasattr(user, 'estabelecimento'):
            return Profissional.objects.filter(estabelecimento=user.estabelecimento)
        return Profissional.objects.none()

class ClienteViewSet(viewsets.ModelViewSet):
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]
    queryset = Cliente.objects.all()

    def get_queryset(self):
        if self.request.user.role == 'ADMIN':
            return Cliente.objects.all()
        return Cliente.objects.filter(estabelecimento=self.request.user.estabelecimento)

    def perform_create(self, serializer):
        serializer.save(estabelecimento=self.request.user.estabelecimento)

class ServicoViewSet(viewsets.ModelViewSet):
    serializer_class = ServicoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['estabelecimento']

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Servico.objects.all()
        elif hasattr(user, 'estabelecimento'):
            return Servico.objects.filter(estabelecimento=user.estabelecimento)
        return Servico.objects.none()

    def perform_create(self, serializer):
        serializer.save(estabelecimento=self.request.user.estabelecimento)

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
        # disponibilidade = verificar_disponibilidade(profissional_id, data, horario)

        # if not disponibilidade:
          # return Response(
           #     {"erro": "Horário indisponível para o profissional escolhido."},
           #     status=status.HTTP_400_BAD_REQUEST
           # )

        numero_cliente = agendamento['cliente']['telefone']
        mensagem = f"Olá, {agendamento['cliente']['nome']}! Seu agendamento para o serviço {agendamento['servico']} está confirmado para o dia {agendamento['data_agendamento']} às {agendamento['horario']}."
        evolution_api.enviar_mensagem_whatsapp(numero_cliente, mensagem)
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
    try:
        # 1. Criar o estabelecimento
        estabelecimento = Estabelecimento.objects.create(
            nome=dados_salao["nome"],
            whatsapp=dados_salao["whatsapp"],
            horario_funcionamento=dados_salao["horario_funcionamento"],
            endereco=dados_salao["endereco"],
            telefone=dados_salao["telefone"]
        )

        # 2. Criar instância WhatsApp
        api = EvolutionAPI()
        instance_response = api.criar_instancia(
            estabelecimento_id=str(estabelecimento.id),
            phone=estabelecimento.whatsapp
        )

        if instance_response:
            estabelecimento.evolution_instance_id = instance_response.get('instanceId')
            estabelecimento.status = 'pending_connection'
            estabelecimento.save()

        # 3. Configurar calendário
        Calendario_Estabelecimento.objects.create(
            estabelecimento=estabelecimento,
            dia_semana=0,  # Domingo
            horario_abertura='09:00',
            horario_fechamento='18:00'
        )

        return Response({
            "message": "Onboarding concluído com sucesso!", 
            "salao_id": estabelecimento.id,
            "whatsapp_instance": instance_response.get('instanceId')
        })
    except Exception as e:
        return Response({
            "error": f"Erro durante onboarding: {str(e)}"
        }, status=500)



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
    try:
        # Total de salões
        total_salons = Estabelecimento.objects.count()
        
        # Salões ativos (usando o campo is_active)
        active_salons = Estabelecimento.objects.filter(
            is_active=True
        ).count()
        
        # Receita total (soma de todas as transações bem-sucedidas)
        total_revenue = Transaction.objects.filter(
            status='completed'
        ).aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        # Assinaturas ativas (usando estabelecimentos ativos como proxy)
        active_subscriptions = Estabelecimento.objects.filter(
            is_active=True
        ).count()
        
        # Atividades recentes
        recent_activities = ActivityLog.objects.all().order_by('-timestamp')[:10]
        
        activities_data = [{
            'id': activity.id,
            'type': activity.action,
            'description': activity.details,
            'date': activity.timestamp.isoformat()
        } for activity in recent_activities]
        
        return Response({
            'totalSalons': total_salons,
            'activeSalons': active_salons,
            'totalRevenue': float(total_revenue),
            'activeSubscriptions': active_subscriptions,
            'recentActivities': activities_data
        })
        
    except Exception as e:
        print(f"Erro ao gerar estatísticas: {str(e)}")
        return Response({'error': str(e)}, status=500)

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return User.objects.all()
        elif user.role in ['OWNER', 'PROFESSIONAL', 'RECEPTIONIST']:
            return User.objects.filter(estabelecimento=user.estabelecimento)
        return User.objects.none()

    @action(detail=True, methods=['get'])
    def details(self, request, pk=None):
        """
        Retorna detalhes do usuário incluindo atividades e permissões
        """
        try:
            user = self.get_object()
            
            # Verifica permissão
            if not request.user.is_staff and user.estabelecimento != request.user.estabelecimento:
                return Response(
                    {'error': 'Sem permissão para ver estes detalhes'}, 
                    status=403
                )

            # Busca atividades recentes
            activities = ActivityLog.objects.filter(user=user).order_by('-timestamp')[:10]
            
            # Monta resposta detalhada
            response_data = {
                'user': UserSerializer(user).data,
                'activities': [{
                    'action': log.action,
                    'details': log.details,
                    'timestamp': log.timestamp
                } for log in activities],
                'permissions': {
                    'manage_salons': user.has_perm('core.manage_salons'),
                    'manage_staff': user.has_perm('core.manage_staff'),
                    'view_finances': user.has_perm('core.view_finances'),
                    'manage_system': user.has_perm('core.manage_system')
                }
            }
            
            # Adiciona dados específicos baseado no papel
            if user.role == 'PROFESSIONAL':
                response_data['professional_data'] = {
                    'total_appointments': Agendamento.objects.filter(
                        profissional__user=user
                    ).count(),
                    'rating': Agendamento.objects.filter(
                        profissional__user=user,
                        avaliacao__isnull=False
                    ).aggregate(Avg('avaliacao'))['avaliacao__avg']
                }
            
            return Response(response_data)
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)

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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def whatsapp_status(request, estabelecimento_id):
    """
    Retorna o status do WhatsApp para um estabelecimento específico
    """
    try:
        estabelecimento = Estabelecimento.objects.get(id=estabelecimento_id)
        api = EvolutionAPI()
        
        status_data = {
            'id': estabelecimento.id,
            'nome': estabelecimento.nome,
            'instance_id': estabelecimento.evolution_instance_id,
            'whatsapp': estabelecimento.whatsapp,
            'status': estabelecimento.status
        }
        
        if estabelecimento.evolution_instance_id:
            status_response = evolution_api.get_instance_status(estabelecimento.evolution_instance_id)
            status_data['status'] = status_response.get('status', 'disconnected')
            
        return Response(status_data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def generate_qr_code(request, salon_id):
    try:
        estabelecimento = Estabelecimento.objects.get(id=salon_id)
        if not estabelecimento.evolution_instance_id:
            return JsonResponse({'error': 'Instância não encontrada'}, status=404)
            
        api = EvolutionAPI()
        qr_response = api.get_qr_code(estabelecimento.evolution_instance_id)
        
        if 'error' not in qr_response:
            return JsonResponse(qr_response)
        return JsonResponse({'error': 'Erro ao gerar QR code'}, status=500)
    except Estabelecimento.DoesNotExist:
        return JsonResponse({'error': 'Salão não encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
def get_connection_status(request, estabelecimento_id):
    try:
        estabelecimento = Estabelecimento.objects.get(id=estabelecimento_id)
        return JsonResponse({
            'status': estabelecimento.status
        })
    except Estabelecimento.DoesNotExist:
        return JsonResponse({'error': 'Salão não encontrado'}, status=404)

@api_view(['GET'])
def dashboard_stats(request):
    try:
        # Obtém estabelecimento_id do usuário logado
        estabelecimento_id = request.user.estabelecimento_id
        if not estabelecimento_id:
            return Response(
                {'error': 'Usuário não est associado a um estabelecimento'}, 
                status=400
            )
            
        hoje = datetime.now().date()
        
        # Busca profissionais do estabelecimento
        profissionais_ids = Profissional.objects.filter(
            estabelecimento_id=estabelecimento_id
        ).values_list('id', flat=True)
        
        stats = {
            'clientesHoje': Agendamento.objects.filter(
                profissional_id__in=profissionais_ids,
                data_agendamento=hoje
            ).values('cliente').distinct().count(),
            
            'agendamentosHoje': Agendamento.objects.filter(
                profissional_id__in=profissionais_ids,
                data_agendamento=hoje
            ).count(),
            
            'faturamentoHoje': Agendamento.objects.filter(
                profissional_id__in=profissionais_ids,
                data_agendamento=hoje,
                status='finalizado'
            ).aggregate(
                total=Sum('servico__preco')
            )['total'] or 0,
            
            'clientesTotal': Cliente.objects.filter(
                estabelecimento_id=estabelecimento_id
            ).count()
        }
        
        return Response(stats)
    except Exception as e:
        print(f"Erro no dashboard_stats: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def create_professional(request):
    try:
        data = request.data
        data['estabelecimento_id'] = request.user.estabelecimento_id
        
        serializer = ProfissionalSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

def validate_phone(phone: str) -> str:
    """Valida e formata o número de telefone"""
    phone = phone.replace("+", "").replace("-", "").replace(" ", "")
    if not phone.isdigit():
        raise ValueError("Número de telefone inválido")
    if not phone.startswith("55"):
        phone = "55" + phone
    return phone

@api_view(['POST'])
def create_whatsapp_instance(request):
    try:
        salon_id = request.user.estabelecimento_id
        phone = request.data.get('phone')
        
        try:
            phone = validate_phone(phone)
        except ValueError as e:
            return Response({'error': str(e)}, status=400)
        
        api = EvolutionAPI()
        instance_response = api.criar_instancia(
            estabelecimento_id=str(salon_id),
            phone=phone
        )
        
        if instance_response:
            # Atualiza o estabelecimento com o ID da instância
            estabelecimento = Estabelecimento.objects.get(id=salon_id)
            estabelecimento.evolution_instance_id = instance_response['instance']['instanceId']
            estabelecimento.whatsapp = phone
            estabelecimento.save()
            
            return Response({
                'success': True,
                'instanceId': instance_response['instance']['instanceId']
            })
        
        return Response({
            'success': False,
            'error': 'Falha ao criar instância'
        }, status=400)
    except Exception as e:
        print(f"Erro detalhado: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def whatsapp_instances_status(request):
    print("=== INICIANDO WHATSAPP INSTANCES STATUS ===")
    print(f"Request method: {request.method}")
    print(f"Request path: {request.path}")
    print(f"Request user: {request.user}")
    """
    Retorna todas as instâncias do WhatsApp
    """
    try:
        estabelecimentos = Estabelecimento.objects.all()
        print(f"Estabelecimentos encontrados: {estabelecimentos.count()}")
        instances_data = []
        
        for estabelecimento in estabelecimentos:
            print(f"Processando estabelecimento: {estabelecimento.id} - {estabelecimento.nome}")
            status = 'disconnected'
            if estabelecimento.evolution_instance_id:
                status_response = evolution_api.check_connection_status(estabelecimento.evolution_instance_id)
                status = status_response.get('status', 'disconnected')
                print(f"Status da instância {estabelecimento.evolution_instance_id}: {status}")
            
            instances_data.append({
                'id': str(estabelecimento.id),
                'nome': estabelecimento.nome,
                'instance_id': estabelecimento.evolution_instance_id,
                'whatsapp': estabelecimento.whatsapp,
                'status': status
            })
        
        print(f"Retornando dados: {instances_data}")
        return Response(instances_data)
    except Exception as e:
        print(f"Erro ao buscar instâncias: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def system_logs(request):
    """
    Retorna logs do sistema para a página de suporte técnico
    """
    try:
        # Busca as últimas 100 interações
        logs = Interacao.objects.all().order_by('-data')[:100].values(
            'id',
            'tipo',
            'descricao',
            'data',
            'sucesso',
            'salao__nome'
        )
        
        formatted_logs = [{
            'id': log['id'],
            'action': log['tipo'],
            'user': log['salao__nome'],
            'timestamp': log['data'].isoformat(),
            'details': log['descricao']
        } for log in logs]
        
        return Response(formatted_logs)
    except Exception as e:
        return Response(
            {'error': f'Erro ao buscar logs: {str(e)}'}, 
            status=500
        )

@api_view(['POST'])
@permission_classes([IsAdminUser])
def reconnect_whatsapp(request, estabelecimento_id):
    try:
        estabelecimento = Estabelecimento.objects.get(id=estabelecimento_id)
        api = EvolutionAPI()
        
        # Busca todas as instâncias
        instances = api.fetch_instances()
        instance_name = f"estabelecimento_{estabelecimento_id}"
        
        instance_exists = any(inst.get('instanceName') == instance_name for inst in instances)
        
        if not instance_exists:
            # Cria nova instância
            instance_response = api.criar_instancia(
                estabelecimento_id=str(estabelecimento_id),
                phone=estabelecimento.whatsapp
            )
            
            if instance_response and instance_response.get('instanceId'):
                estabelecimento.evolution_instance_id = instance_response['instanceId']
                estabelecimento.save()
                return Response({
                    'success': True,
                    'message': 'Nova instância criada.',
                    'instanceId': instance_response['instanceId']
                })
            
        return Response({
            'success': False,
            'error': 'Falha ao criar instância'
        }, status=400)
    except Exception as e:
        print(f"Erro detalhado: {str(e)}")
        return Response({
            'success': False,
            'error': f'Erro ao criar instância: {str(e)}'
        }, status=500)

class ClienteProfissionalViewSet(viewsets.ModelViewSet):
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]
    queryset = Cliente.objects.all()

    def get_queryset(self):
        profissional = Profissional.objects.get(user=self.request.user)
        return Cliente.objects.filter(
            Q(profissional_responsavel=profissional) | 
            Q(agendamentos__profissional=profissional)
        ).distinct()

    def perform_create(self, serializer):
        profissional = Profissional.objects.get(user=self.request.user)
        serializer.save(
            estabelecimento=profissional.estabelecimento,
            profissional_responsavel=profissional
        )

@api_view(['POST'])
def whatsapp_webhook(request):
    """Processa webhooks do WhatsApp"""
    try:
        data = request.data
        print("Webhook recebido:", data)  # Debug
        
        event_type = data.get('event')
        instance_name = data.get('instance', {}).get('instanceName')
        
        if not instance_name:
            return Response({'error': 'Instance name not provided'}, status=400)
            
        # Identifica se é bot de suporte ou salão
        if instance_name == 'support_bot':
            config = SystemConfig.objects.first()
            if config:
                if event_type == 'connection.update':
                    config.status = data.get('state', 'disconnected')
                    config.save()
        else:
            salon_id = instance_name.replace('salon_', '')
            try:
                estabelecimento = Estabelecimento.objects.get(id=salon_id)
                if event_type == 'connection.update':
                    estabelecimento.status = data.get('state', 'disconnected')
                    estabelecimento.save()
            except Estabelecimento.DoesNotExist:
                print(f"Estabelecimento não encontrado: {salon_id}")
        
        return Response({'status': 'success'})
        
    except Exception as e:
        print(f"Erro no webhook: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def system_metrics(request):
    monitor = SystemMonitor()
    
    metrics = {
        'system': monitor.get_system_metrics(),
        'docker': monitor.get_docker_metrics(),
        'salons': monitor.get_salon_metrics(),
        'bot': monitor.get_bot_metrics()
    }
    
    return Response(metrics)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def salon_analytics(request):
    """
    Retorna análises do salão
    """
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    salon_id = request.user.estabelecimento_id

    if not salon_id:
        return Response({"error": "Salão não encontrado"}, status=400)

    # analytics = ReportService.get_salon_analytics(salon_id, start_date, end_date)
    # return Response(analytics)

# @api_view(['GET'])
# @permission_classes([IsAdminUser])
# def staff_analytics(request):
#     """
#     Retorna análises para a equipe administrativa
#    """
#     analytics = ReportService.get_staff_analytics()
#     return Response(analytics)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_data(request):
    """
    Exporta dados em CSV
    """
    data_type = request.query_params.get('type')
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    salon_id = request.user.estabelecimento_id

    if not all([data_type, start_date, end_date, salon_id]):
        return Response({"error": "Parâmetros inválidos"}, status=400)

   #  try:
        # data = ReportService.export_data(salon_id, data_type, start_date, end_date)
        # return Response(data)
   #  except ValueError as e:
   #      return Response({"error": str(e)}, status=400)

@api_view(['POST'])
def send_whatsapp_message(request, salon_id):
    try:
        estabelecimento = Estabelecimento.objects.get(id=salon_id)
        api = EvolutionAPI()
        
        number = request.data.get('number')
        message = request.data.get('message')
        options = request.data.get('options', {})
        
        if not all([number, message]):
            return Response({
                'success': False,
                'error': 'Número e mensagem são obrigatórios'
            }, status=400)
            
        response = api.send_message(
            instance_id=estabelecimento.evolution_instance_id,
            number=number,
            message=message,
            options=options
        )
        
        # Registrar log
        Interacao.objects.create(
            salao=estabelecimento,
            tipo='message_sent',
            descricao=f"Mensagem enviada para {number}"
        )
        
        return Response(response)
    except Estabelecimento.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Estabelecimento não encontrado'
        }, status=404)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)

class ChatConfigViewSet(viewsets.ModelViewSet):
    serializer_class = ChatConfigSerializer
    permission_classes = [IsAuthenticated]
    queryset = BotConfig.objects.all()

    def get_queryset(self):
        if self.request.user.role == 'OWNER':
            return BotConfig.objects.filter(
                estabelecimento=self.request.user.estabelecimento
            ).order_by('-ultima_atualizacao')
        return BotConfig.objects.none()

    def perform_create(self, serializer):
        serializer.save(estabelecimento=self.request.user.estabelecimento)

    def perform_update(self, serializer):
        instance = serializer.save()
        # Notificar cliente sobre mudança no status do bot
        if 'bot_ativo' in serializer.validated_data:
            try:
                api = EvolutionAPI()
                message = (
                    "O atendimento automático foi reativado." 
                    if instance.bot_ativo 
                    else "Um atendente humano assumirá a conversa a partir de agora."
                )
                api.send_message(
                    instance_id=instance.estabelecimento.evolution_instance_id,
                    number=instance.numero_cliente,
                    message=message
                )
            except Exception as e:
                print(f"Erro ao enviar notificação: {str(e)}")

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def salon_finance_stats(request):
    """
    Retorna estatísticas financeiras para o salão
    """
    estabelecimento = request.user.estabelecimento
    if not estabelecimento:
        return Response({"error": "Salão não encontrado"}, status=400)

    today = datetime.now()
    first_day_of_month = today.replace(day=1)
    
    # Calcular estatísticas
    total_revenue = Agendamento.objects.filter(
        profissional__estabelecimento=estabelecimento,
        status='completed'
    ).aggregate(total=Sum('servico__preco'))['total'] or 0
    
    monthly_revenue = Agendamento.objects.filter(
        profissional__estabelecimento=estabelecimento,
        status='completed',
        data_agendamento__gte=first_day_of_month
    ).aggregate(total=Sum('servico__preco'))['total'] or 0
    
    pending_payments = Agendamento.objects.filter(
        profissional__estabelecimento=estabelecimento,
        status='pending'
    ).aggregate(total=Sum('servico__preco'))['total'] or 0
    
    total_appointments = Agendamento.objects.filter(
        profissional__estabelecimento=estabelecimento
    ).count()
    
    return Response({
        'totalRevenue': float(total_revenue),
        'monthlyRevenue': float(monthly_revenue),
        'pendingPayments': float(pending_payments),
        'totalAppointments': total_appointments
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def salon_finance_transactions(request):
    """
    Retorna transações financeiras do salão
    """
    estabelecimento = request.user.estabelecimento
    if not estabelecimento:
        return Response({"error": "Salão não encontrado"}, status=400)

    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    transaction_type = request.query_params.get('type')
    status = request.query_params.get('status')
    
    transactions = Agendamento.objects.filter(
        profissional__estabelecimento=estabelecimento
    )
    
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
            'status': agendamento.status
        })
    
    return Response(transaction_list)

class SystemServiceViewSet(viewsets.ModelViewSet):
    queryset = SystemService.objects.all()
    serializer_class = SystemServiceSerializer
    permission_classes = [IsAuthenticated]

class SalonServiceViewSet(viewsets.ModelViewSet):
    serializer_class = SalonServiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SalonService.objects.filter(
            estabelecimento=self.request.user.estabelecimento
        )

@api_view(['GET'])
def bot_metricas(request, estabelecimento_id):
    interacoes = Interacao.objects.filter(
        salao_id=estabelecimento_id,
        tipo='bot_response'
    )
    
    return Response({
        'total_interacoes': interacoes.count(),
        'tempo_medio_resposta': interacoes.aggregate(Avg('tempo_resposta')),
        'taxa_sucesso': interacoes.filter(sucesso=True).count() / interacoes.count(),
        'intencoes': interacoes.values('intencao').annotate(
            total=Count('id')
        ).order_by('-total'),
        'satisfacao_cliente': interacoes.filter(
            cliente_satisfeito=True
        ).count() / interacoes.filter(
            cliente_satisfeito__isnull=False
        ).count()
    })

@api_view(['GET', 'POST', 'PATCH'])
@permission_classes([IsAdminUser])
def manage_whatsapp_connection(request, estabelecimento_id):
    """Gerencia a conexão do WhatsApp para um estabelecimento"""
    try:
        api = EvolutionAPI()
        instance_name = f"salon_{estabelecimento_id}"
        
        # Verifica se já existe uma instância
        instance_check = api.check_instance_exists(instance_name)
        
        if instance_check['exists']:
            # Reconfigura o webhook para garantir
            webhook_result = api.configurar_webhooks(instance_name)
            if webhook_result.get('error'):
                print(f"Erro ao reconfigurar webhook: {webhook_result['error']}")
        else:
            # Busca o número do WhatsApp do estabelecimento
            estabelecimento = Estabelecimento.objects.get(id=estabelecimento_id)
            if not estabelecimento.whatsapp:
                return Response({'error': 'Número de WhatsApp não configurado'}, status=400)
            
            # Cria a instância
            instance = api.criar_instancia(
                estabelecimento_id=estabelecimento_id,
                phone=estabelecimento.whatsapp,
                is_support=False
            )
            if instance.get('error'):
                return Response({'error': instance['error']}, status=400)
        
        # Gera o QR Code
        qr_response = api.get_qr_code(instance_name)
        if qr_response.get('error'):
            return Response({'error': qr_response['error']}, status=400)
            
        return Response({
            'success': True,
            'connection_data': qr_response
        })
        
    except Estabelecimento.DoesNotExist:
        return Response({'error': 'Estabelecimento não encontrado'}, status=404)
    except Exception as e:
        print(f"Erro ao gerenciar conexão WhatsApp: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET', 'POST', 'PATCH'])
@permission_classes([IsAdminUser])
def bot_settings_view(request):
    """
    Gerencia configurações do bot de suporte
    """
    try:
        config = SystemConfig.objects.first()
        if not config:
            config = SystemConfig.objects.create()

        if request.method == 'GET':
            return Response(SystemConfigSerializer(config).data)
            
        elif request.method in ['POST', 'PATCH']:
            print("\n=== DEBUG BOT SETTINGS ===")
            print(f"Método: {request.method}")
            print(f"Dados recebidos: {request.data}")
            
            serializer = SystemConfigSerializer(config, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                print(f"Configuração salva: {serializer.data}")
                
                # Configura webhook se necessário
                if request.data.get('webhook_settings'):
                    api = EvolutionAPI()
                    webhook_result = api.configurar_webhooks('support_bot')
                    print(f"Resultado webhook: {webhook_result}")
                
                print("=== FIM DEBUG SETTINGS ===\n")
                return Response(serializer.data)
                
            print(f"Erros de validação: {serializer.errors}")
            return Response(serializer.errors, status=400)
            
    except Exception as e:
        print(f"Erro em bot_settings: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def generate_qr_code(request):
    """Gera QR Code para conexão do WhatsApp"""
    try:
        config = SystemConfig.objects.first()
        if not config:
            return Response({'error': 'Configuração não encontrada'}, status=404)
            
        api = EvolutionAPI()
        instance_name = 'support_bot'
        
        # Verifica se já existe uma instância
        instance_check = api.check_instance_exists(instance_name)
        
        # Se não existe instância, cria uma nova
        if not instance_check['exists']:
            if not config.support_whatsapp:
                return Response({'error': 'Número de WhatsApp não configurado'}, status=400)
                
            instance = api.criar_instancia(
                estabelecimento_id='support',
                phone=config.support_whatsapp,
                is_support=True
            )
            if instance.get('error'):
                return Response({'error': instance['error']}, status=400)
        
        # Gera o QR Code
        qr_response = api.get_qr_code(instance_name)
        if qr_response.get('error'):
            return Response({'error': qr_response['error']}, status=400)
            
        return Response(qr_response)
        
    except Exception as e:
        print(f"Erro ao gerar QR code: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    try:
        return Response({'status': 'ok'})
    except Exception as e:
        return Response({'status': 'error', 'details': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def staff_list(request):
    """
    Lista todos os membros da equipe (staff)
    """
    try:
        staff = User.objects.filter(is_staff=True).select_related('estabelecimento')
        serializer = StaffSerializer(staff, many=True)
        return Response(serializer.data)
    except Exception as e:
        print(f"Erro ao listar staff: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET', 'PUT'])
@permission_classes([IsAdminUser])
def staff_detail(request, pk):
    """
    Detalhes e atualização de um membro da equipe
    """
    try:
        staff_member = User.objects.get(id=pk, is_staff=True)
        
        if request.method == 'GET':
            serializer = StaffSerializer(staff_member)
            return Response(serializer.data)
            
        elif request.method == 'PUT':
            serializer = StaffSerializer(staff_member, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
            
    except User.DoesNotExist:
        return Response({'error': 'Membro da equipe não encontrado'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def staff_activities(request):
    """
    Lista todas as atividades da equipe staff
    """
    try:
        print("Buscando atividades da equipe...")
        activities = ActivityLog.objects.filter(
            user__is_staff=True
        ).select_related('user').order_by('-timestamp')[:100]
        
        print(f"Encontradas {activities.count()} atividades")
        data = [{
            'id': activity.id,
            'user': activity.user.get_full_name() or activity.user.username,
            'action': activity.action,
            'details': activity.details,
            'timestamp': activity.timestamp
        } for activity in activities]
        
        return Response(data)
    except Exception as e:
        print(f"Erro ao buscar atividades: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def staff_user_activities(request, user_id):
    """
    Lista atividades de um membro específico da equipe
    """
    try:
        activities = ActivityLog.objects.filter(
            user_id=user_id,
            user__is_staff=True
        ).select_related('user').order_by('-timestamp')[:50]
        
        data = [{
            'id': activity.id,
            'user': activity.user.get_full_name() or activity.user.username,
            'action': activity.action,
            'details': activity.details,
            'timestamp': activity.timestamp
        } for activity in activities]
        
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

def register_activity(user, action, details=""):
    """
    Registra uma atividade do usuário
    """
    try:
        ActivityLog.objects.create(
            user=user,
            action=action,
            details=details
        )
    except Exception as e:
        print(f"Erro ao registrar atividade: {str(e)}")

@api_view(['POST'])
@permission_classes([AllowAny])
def support_webhook(request):
    """Webhook para o bot de suporte (Bot 1)"""
    try:
        print("\n=== WEBHOOK RECEBIDO (SUPORTE) ===")
        print(f"Dados: {request.data}")
        
        data = request.data
        if data.get('type') == 'message':
            # Extrai informações da mensagem
            message = data.get('message', {})
            sender = message.get('from')
            text = message.get('text', '')
            
            print(f"De: {sender}")
            print(f"Mensagem: {text}")
            
            # Processa com LLM
            conversation_id = f"support_{sender}"
            conversation_manager.add_message(conversation_id, "user", text)
            
            # Gera resposta
            context = conversation_manager.get_context(conversation_id)
            response_text = chamar_llm(context)
            
            print(f"Resposta: {response_text}")
            
            # Envia resposta
            api = EvolutionAPI()
            api.send_text_message("support_bot", sender, response_text)
            
            return Response({'status': 'ok'})
            
    except Exception as e:
        print(f"ERRO no webhook: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def salon_webhook(request, salon_id):
    """Webhook para os bots dos salões (Bot 2)"""
    try:
        data = request.data
        estabelecimento = Estabelecimento.objects.get(id=salon_id)
        
        if data.get('type') == 'message':
            # Implementar lógica do Bot 2
            pass
        return Response({'status': 'ok'})
    except Estabelecimento.DoesNotExist:
        return Response({'error': 'Salão não encontrado'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

class BotConfigViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]
    
    def retrieve(self, request):
        """Obtém configurações do bot de suporte"""
        config = SystemConfig.objects.first()
        if not config:
            config = SystemConfig.objects.create()
        return Response(SystemConfigSerializer(config).data)
    
    def update(self, request):
        """Atualiza configurações do bot de suporte"""
        config = SystemConfig.objects.first()
        if not config:
            config = SystemConfig.objects.create()
            
        serializer = SystemConfigSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    @action(detail=False, methods=['post'])
    def connect(self, request):
        """Inicia conexão do bot de suporte"""
        config = SystemConfig.objects.first()
        if not config:
            return Response({"error": "Configurações não encontradas"}, status=404)
            
        api = EvolutionAPI()
        result = api.criar_instancia_suporte()
        
        if result.get('error'):
            return Response({"error": result['error']}, status=400)
            
        return Response(result)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def bot_status(request):
    """Retorna o status do bot de suporte"""
    try:
        config = SystemConfig.objects.first()
        if not config:
            return Response({
                'status': 'disconnected',
                'support_whatsapp': None
            })
            
        api = EvolutionAPI()
        if config.evolution_instance_id:
            status_response = api.check_connection_status(config.evolution_instance_id)
            status = status_response.get('status', 'disconnected')
        else:
            status = 'disconnected'
            
        return Response({
            'status': status,
            'support_whatsapp': config.support_whatsapp,
            'instance_id': config.evolution_instance_id
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def check_connection(request):
    """Verifica e gerencia conexão do bot de suporte"""
    try:
        config = SystemConfig.objects.first()
        if not config or not config.evolution_instance_id:
            return Response({'status': 'disconnected'})
            
        api = EvolutionAPI()
        
        if request.method == 'POST':
            # Tenta conectar
            instance = api.connect_instance(f"support_bot")
            if instance and not instance.get('error'):
                config.status = 'connecting'
                config.save()
                return Response({'status': 'connecting', 'qr': instance.get('qr')})
            return Response({'error': 'Falha ao conectar'}, status=400)
        
        # GET - apenas verifica status
        status = api.check_connection_status(config.evolution_instance_id)
        return Response(status)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET', 'POST', 'PATCH'])
@permission_classes([IsAdminUser])
def bot_settings_view(request):
    """
    Gerencia configurações do bot de suporte
    """
    try:
        config = SystemConfig.objects.first()
        if not config:
            config = SystemConfig.objects.create()

        if request.method == 'GET':
            return Response(SystemConfigSerializer(config).data)
            
        elif request.method in ['POST', 'PATCH']:
            print("\n=== DEBUG BOT SETTINGS ===")
            print(f"Método: {request.method}")
            print(f"Dados recebidos: {request.data}")
            
            serializer = SystemConfigSerializer(config, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                print(f"Configuração salva: {serializer.data}")
                
                # Configura webhook se necessário
                if request.data.get('webhook_settings'):
                    api = EvolutionAPI()
                    webhook_result = api.configurar_webhooks('support_bot')
                    print(f"Resultado webhook: {webhook_result}")
                
                print("=== FIM DEBUG SETTINGS ===\n")
                
                return Response(serializer.data)
                
            print(f"Erros de validação: {serializer.errors}")
            return Response(serializer.errors, status=400)
            
    except Exception as e:
        print(f"Erro em bot_settings: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def check_instance(request):
    """
    Verifica se existe uma instância do bot de suporte
    """
    try:
        config = SystemConfig.objects.first()
        if not config:
            return Response({'exists': False, 'instance_id': None, 'status': None})
            
        api = EvolutionAPI()
        result = api.check_connection_status('support_bot')
        
        # Atualiza o ID da instância se necessário
        if result['exists'] and result.get('instance_id') and result['instance_id'] != config.evolution_instance_id:
            config.evolution_instance_id = result['instance_id']
            config.save()
            
        return Response({
            'exists': result['exists'],
            'instance_id': result.get('instance_id'),
            'status': result.get('status', 'disconnected')
        })
        
    except Exception as e:
        print(f"Erro ao verificar instância: {str(e)}")
        return Response({'error': str(e)}, status=500)