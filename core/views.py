import requests
from rest_framework import viewsets, status, serializers
from django.contrib.auth import get_user_model
from .models import Estabelecimento, Profissional, Cliente, Servico, Agendamento, Calendario_Estabelecimento, Interacao, Plan, SystemConfig, BotConfig, SystemService, SalonService
from .serializers import EstabelecimentoSerializer, ProfissionalSerializer, ClienteSerializer, ServicoSerializer, AgendamentoSerializer, UserSerializer, ChatConfigSerializer, SystemServiceSerializer, SalonServiceSerializer
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings
from datetime import datetime, timedelta
from django.db.models import Count, Sum, Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from .services.system_logs import SystemMonitor
from django.http import JsonResponse
from .integrations.evolution import (
    get_whatsapp_status, 
    check_connection,
    criar_instancia_evolution,
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
        try:
            # Normaliza o telefone se fornecido
            phone = attrs.get('phone')
            if phone:
                phone = ''.join(filter(str.isdigit, phone))
                user = User.objects.get(phone=phone)
                attrs['username'] = user.get_username()  # Usa o email ou phone como username
            else:
                attrs['username'] = attrs.get('email')

            password = attrs.get('password')

            if not attrs.get('username') or not password:
                raise serializers.ValidationError({'detail': 'Informe email/telefone e senha'})

            user = authenticate(
                request=self.context.get('request'),
                username=attrs['username'],
                password=password
            )

            if user:
                data = super().validate(attrs)
                data.update({
                    'email': user.email,
                    'name': user.name,
                    'role': user.role,
                    'estabelecimento_id': user.estabelecimento_id if user.estabelecimento else None,
                    'phone': user.phone
                })
                return data
            
            raise serializers.ValidationError({'detail': 'Credenciais inválidas'})
        except User.DoesNotExist:
            raise serializers.ValidationError({'detail': 'Usuário não encontrado'})
        except Exception as e:
            print("Erro detalhado:", str(e))
            raise serializers.ValidationError({'detail': str(e)})

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

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            estabelecimento = serializer.save()

            # Criar instância WhatsApp automaticamente
            instance_response = criar_instancia_evolution(
                salon_id=str(estabelecimento.id),
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
                api = EvolutionAPI()
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
    queryset = Profissional.objects.all()
    serializer_class = ProfissionalSerializer

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
    queryset = Servico.objects.all()
    serializer_class = ServicoSerializer
    permission_classes = [IsAuthenticated]
    queryset = Servico.objects.all()

    def get_queryset(self):
        if self.request.user.role == 'ADMIN':
            return Servico.objects.all()
        return Servico.objects.filter(estabelecimento=self.request.user.estabelecimento)

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
        instance_response = criar_instancia_evolution(
            salon_id=str(estabelecimento.id),
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
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return User.objects.all()
        elif user.role == 'OWNER':
            return User.objects.filter(estabelecimento=user.estabelecimento)
        else:
            return User.objects.filter(id=user.id)

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
def whatsapp_status(request, salon_id):
    try:
        estabelecimento = Estabelecimento.objects.get(id=salon_id)
        if not estabelecimento.evolution_instance_id:
            return JsonResponse({'error': 'Instância não encontrada'}, status=404)
            
        status = get_whatsapp_status(estabelecimento.evolution_instance_id)
        return JsonResponse(status)
    except Estabelecimento.DoesNotExist:
        return JsonResponse({'error': 'Salão não encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

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
def check_connection_status(request, salon_id):
    try:
        estabelecimento = Estabelecimento.objects.get(id=salon_id)
        status = check_connection(estabelecimento.instance_id)
        return JsonResponse({'status': status})
    except Estabelecimento.DoesNotExist:
        return JsonResponse({'error': 'Salão não encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

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

@api_view(['POST'])
def create_whatsapp_instance(request):
    try:
        salon_id = request.user.estabelecimento_id
        phone = request.data.get('phone')
        
        # Cria instância na Evolution API
        instance_response = criar_instancia_evolution(salon_id, phone)
        
        if instance_response:
            # Atualiza o estabelecimento com o ID da instância
            estabelecimento = Estabelecimento.objects.get(id=salon_id)
            estabelecimento.instance_id = instance_response['instanceId']
            estabelecimento.whatsapp_number = phone
            estabelecimento.save()
            
            return Response({
                'success': True,
                'instanceId': instance_response['instanceId']
            })
        
        return Response({
            'success': False,
            'error': 'Falha ao criar instância'
        }, status=400)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def whatsapp_instances_status(request):
    try:
        estabelecimentos = Estabelecimento.objects.all()
        status_list = []
        
        for estabelecimento in estabelecimentos:
            status = {
                'id': estabelecimento.id,
                'nome': estabelecimento.nome,
                'instance_id': estabelecimento.evolution_instance_id,
                'whatsapp': estabelecimento.whatsapp,
                'status': 'disconnected'
            }
            
            if estabelecimento.evolution_instance_id:
                try:
                    status_response = get_whatsapp_status(estabelecimento.evolution_instance_id)
                    status['status'] = status_response.get('status', 'error')
                except:
                    status['status'] = 'error'
            
            status_list.append(status)
        
        return Response(status_list)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def system_logs(request):
    # Implementar lógica de logs
    pass

@api_view(['POST'])
@permission_classes([IsAdminUser])
def reconnect_whatsapp(request, estabelecimento_id):
    try:
        estabelecimento = Estabelecimento.objects.get(id=estabelecimento_id)
        api = EvolutionAPI()
        
        # Verifica se instância existe
        instance_exists = api.check_instance_exists(f"estabelecimento_{estabelecimento_id}")
        
        if instance_exists:
            # Deleta instância antiga
            api.disconnect_instance(estabelecimento.evolution_instance_id)
        
        # Cria nova instância
        instance_response = criar_instancia_evolution(
            estabelecimento_id=estabelecimento_id,
            phone=estabelecimento.whatsapp
        )
        
        if instance_response and instance_response.get('instanceId'):
            estabelecimento.evolution_instance_id = instance_response['instanceId']
            estabelecimento.save()
            return Response({
                'success': True, 
                'instanceId': instance_response['instanceId']
            })
            
        return Response({
            'success': False,
            'error': 'Falha ao criar instância'
        }, status=400)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
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
    """
    Endpoint para receber webhooks da Evolution API
    """
    data = request.data
    event_type = data.get('event')
    instance_id = data.get('instanceId')
    
    try:
        # Primeiro verifica se é uma mensagem para o Bot 1 (suporte)
        system_config = SystemConfig.objects.first()
        if system_config and system_config.evolution_instance_id == instance_id:
            if event_type == 'messages':
                mensagem = data.get('message', {})
                if not mensagem.get('fromMe'):
                    # Verifica se o número é de um salão para evitar loop de IAs
                    numero = mensagem.get('from')
                    if not Estabelecimento.objects.filter(whatsapp=numero).exists():
                        resposta = processar_pergunta(mensagem.get('body', ''), bot_tipo=1)
                        api = EvolutionAPI()
                        api.send_message(
                            instance_id=instance_id,
                            number=numero,
                            message=resposta
                        )
            return Response({"status": "success"})

        # Se não for Bot 1, processa como Bot 2
        estabelecimento = Estabelecimento.objects.get(evolution_instance_id=instance_id)
        
        if event_type == 'connection':
            estabelecimento.status = data.get('status', 'disconnected')
            estabelecimento.save()
        
        elif event_type == 'messages':
            mensagem = data.get('message', {})
            numero = mensagem.get('from')
            
            # Verifica se o bot está desativado para este número
            bot_desativado = BotConfig.objects.filter(
                estabelecimento=estabelecimento,
                numero_cliente=numero,
                bot_ativo=False
            ).exists()
            
            if not mensagem.get('fromMe') and not bot_desativado:
                resposta = processar_pergunta(mensagem.get('body', ''), bot_tipo=2)
                api = EvolutionAPI()
                api.send_message(
                    instance_id=instance_id,
                    number=numero,
                    message=resposta
                )
        
        # Registrar log
        Interacao.objects.create(
            salao=estabelecimento,
            tipo=event_type,
            descricao=str(data)
        )
        
        return Response({"status": "success"})
    except Exception as e:
        print(f"Erro no webhook: {str(e)}")
        return Response({"error": str(e)}, status=500)

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

    analytics = ReportService.get_salon_analytics(salon_id, start_date, end_date)
    return Response(analytics)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def staff_analytics(request):
    """
    Retorna análises para a equipe administrativa
    """
    analytics = ReportService.get_staff_analytics()
    return Response(analytics)

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

    try:
        data = ReportService.export_data(salon_id, data_type, start_date, end_date)
        return Response(data)
    except ValueError as e:
        return Response({"error": str(e)}, status=400)

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