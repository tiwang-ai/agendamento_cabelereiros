import logging
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import viewsets
from django.conf import settings
from ..models import SystemConfig, Estabelecimento, Interacao, BotConfig, Servico, Profissional
from ..serializers import SystemConfigSerializer, InteracaoSerializer, BotConfigSerializer, ChatConfigSerializer
from ..integrations.evolution import EvolutionAPI
from ..llm import StaffBot, SalonBot
from ..llm.base import chamar_llm
from datetime import datetime, timedelta
from django.db.models import Avg
import time
from .salon_views import verificar_disponibilidade

logger = logging.getLogger(__name__)
evolution_api = EvolutionAPI()

# Bot 1 (Staff/Suporte)
class SupportBotViewSet(viewsets.ViewSet):
    """ViewSet para gerenciar bot de suporte (Bot 1)"""
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
            if 'bot_ativo' in request.data:
                webhook_result = evolution_api.configurar_webhooks(
                    'support_bot', 
                    enabled=request.data['bot_ativo']
                )
                if 'error' in webhook_result:
                    return Response({'error': webhook_result['error']}, status=400)
            
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    def connect(self, request):
        """Conecta bot de suporte ao WhatsApp"""
        try:
            qr_code = self.generate_qr_code()
            return Response({'qr_code': qr_code})
        except Exception as e:
            return Response({'error': str(e)}, status=500)
            
    def disconnect(self, request):
        """Desconecta bot de suporte"""
        try:
            evolution_api.disconnect_instance('support_bot')
            return Response({'success': True})
        except Exception as e:
            return Response({'error': str(e)}, status=500)

# Bot 2 (Salão)
class SalonBotViewSet(viewsets.ViewSet):
    """ViewSet para gerenciar bot do salão (Bot 2)"""
    permission_classes = [IsAuthenticated]
    
    def retrieve(self, request, estabelecimento_id):
        """Obtém configurações do bot do salão"""
        try:
            estabelecimento = Estabelecimento.objects.get(id=estabelecimento_id)
            
            if request.user.estabelecimento_id != estabelecimento.id and not request.user.is_staff:
                return Response({"error": "Sem permissão"}, status=403)
            
            bot_config = estabelecimento.bot_config
            if not bot_config:
                bot_config = BotConfig.objects.create(estabelecimento=estabelecimento)
            return Response(BotConfigSerializer(bot_config).data)
            
        except Estabelecimento.DoesNotExist:
            return Response({"error": "Salão não encontrado"}, status=404)
        except Exception as e:
            logger.error(f"Erro em salon_bot_settings: {str(e)}")
            return Response({'error': str(e)}, status=500)
    
    def update(self, request, estabelecimento_id):
        """Atualiza configurações do bot do salão"""
        try:
            estabelecimento = Estabelecimento.objects.get(id=estabelecimento_id)
            
            if request.user.estabelecimento_id != estabelecimento.id and not request.user.is_staff:
                return Response({"error": "Sem permissão"}, status=403)
            
            bot_config = estabelecimento.bot_config
            if not bot_config:
                bot_config = BotConfig.objects.create(estabelecimento=estabelecimento)
                
            serializer = BotConfigSerializer(bot_config, data=request.data, partial=True)
            if serializer.is_valid():
                if 'bot_ativo' in request.data:
                    bot_ativo = request.data.get('bot_ativo')
                    
                    instance_name = f'salon_{estabelecimento_id}'
                    webhook_result = evolution_api.configurar_webhooks(
                        instance_name, 
                        enabled=bot_ativo
                    )
                    if 'error' in webhook_result:
                        return Response({'error': webhook_result['error']}, status=400)
                
                serializer.save()
                return Response(serializer.data)
                
            return Response(serializer.errors, status=400)
            
        except Estabelecimento.DoesNotExist:
            return Response({"error": "Salão não encontrado"}, status=404)
        except Exception as e:
            logger.error(f"Erro em salon_bot_settings: {str(e)}")
            return Response({'error': str(e)}, status=500)
    
    def connect(self, request, estabelecimento_id):
        """Conecta bot do salão ao WhatsApp"""
        try:
            qr_code = self.generate_qr_code(estabelecimento_id)
            return Response({'qr_code': qr_code})
        except Exception as e:
            return Response({'error': str(e)}, status=500)
            
    def disconnect(self, request, estabelecimento_id):
        """Desconecta bot do salão"""
        try:
            evolution_api.disconnect_instance(f'salon_{estabelecimento_id}')
            return Response({'success': True})
        except Exception as e:
            return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_whatsapp_message(request, salon_id):
    """Envia mensagem de WhatsApp para um cliente do salão"""
    try:
        estabelecimento = Estabelecimento.objects.get(id=salon_id)
        
        number = request.data.get('number')
        message = request.data.get('message')
        options = request.data.get('options', {})
        
        if not all([number, message]):
            return Response({
                'success': False,
                'error': 'Número e mensagem são obrigatórios'
            }, status=400)
            
        response = evolution_api.send_text_message(
            instance_name=f'salon_{salon_id}',
            number=number,
            text=message
        )
        
        return Response(response)
        
    except Estabelecimento.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Estabelecimento não encontrado'
        }, status=404)
    except Exception as e:
        logger.error(f"Erro ao enviar mensagem: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)

# Webhooks
@api_view(['POST'])
@permission_classes([AllowAny])
def support_webhook(request):
    """Webhook para o bot de suporte (Bot 1)"""
    try:
        logger.info("=== WEBHOOK BOT SUPORTE ===")
        logger.info(f"Headers: {request.headers}")
        logger.info(f"Dados: {request.data}")

        bot_config = BotConfig.objects.first()
        if not bot_config or not bot_config.bot_ativo:
            return Response({'status': 'bot_disabled'})
        
        data = request.data
        if data.get('event') == 'messages.upsert':
            message_data = data.get('data', {})
            sender = message_data.get('key', {}).get('remoteJid', '').split('@')[0]
            text = message_data.get('message', {}).get('conversation', '')
            
            if not sender or not text:
                return Response({'status': 'invalid_message'})

            start_time = time.time()
            
            # Registra interação
            interacao = Interacao.objects.create(
                numero_whatsapp=sender,
                mensagem=text,
                tipo='support_bot',
                is_lead=True
            )
            
            # Verifica se é cliente existente
            estabelecimento = Estabelecimento.objects.filter(whatsapp=sender).first()
            if estabelecimento:
                interacao.is_lead = False
                interacao.estabelecimento = estabelecimento
                interacao.save()
            
            # Processa com LLM
            try:
                response_text = chamar_llm(text, debug=True)
                interacao.resposta = response_text
                interacao.usado_llm = True
                interacao.tempo_resposta = time.time() - start_time
                interacao.save()
                
                evolution_api.send_text_message('support_bot', sender, response_text)
                return Response({'status': 'ok'})
                
            except Exception as e:
                logger.error(f"Erro ao processar mensagem: {str(e)}")
                return Response({'error': str(e)}, status=500)
                
        return Response({'status': 'event_ignored'})
        
    except Exception as e:
        logger.error(f"Erro no webhook: {str(e)}")
        return Response({'error': str(e)}, status=500)

# Funções auxiliares
def validate_phone(phone: str) -> str:
    """Valida e formata o número de telefone"""
    phone = phone.replace("+", "").replace("-", "").replace(" ", "")
    if not phone.isdigit():
        raise ValueError("Número de telefone inválido")
    if not phone.startswith("55"):
        phone = "55" + phone
    return phone

@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_interactions(request):
    """Lista as últimas interações do bot"""
    try:
        interacoes = Interacao.objects.filter(
            tipo='support_bot'
        ).order_by('-created_at')[:50]
        
        serializer = InteracaoSerializer(interacoes, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        logger.error(f"Erro ao listar interações: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def bot_metrics(request):
    """Retorna métricas do bot de suporte"""
    try:
        hoje = datetime.now()
        ontem = hoje - timedelta(days=1)
        
        interacoes = Interacao.objects.filter(
            created_at__gte=ontem,
            tipo='support_bot'
        )
        
        leads = interacoes.values('numero_whatsapp').distinct().filter(is_lead=True).count()
        clientes = interacoes.values('numero_whatsapp').distinct().filter(is_lead=False).count()
        
        metricas = {
            'total_interactions': interacoes.count(),
            'unique_users': interacoes.values('numero_whatsapp').distinct().count(),
            'new_leads': leads,
            'existing_clients': clientes,
            'ai_responses': interacoes.filter(usado_llm=True).count(),
            'avg_response_time': interacoes.filter(
                tempo_resposta__isnull=False
            ).aggregate(Avg('tempo_resposta'))['tempo_resposta__avg']
        }
        
        return Response(metricas)
        
    except Exception as e:
        logger.error(f"Erro ao gerar métricas: {str(e)}")
        return Response({'error': str(e)}, status=500)

# Funções compartilhadas entre os bots
@api_view(['POST'])
def staff_bot_responder(request):
    """Processa perguntas para o bot de staff"""
    try:
        pergunta = request.data.get("pergunta")
        if not pergunta:
            return Response({"error": "Pergunta é obrigatória"}, status=400)

        bot = StaffBot()
        resposta = bot.processar_pergunta(pergunta)
        return Response({"resposta": resposta})
    except Exception as e:
        logger.error(f"Erro no bot staff: {str(e)}")
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
def salon_bot_responder(request, estabelecimento_id):
    """Processa perguntas para o bot do salão"""
    try:
        pergunta = request.data.get("pergunta")
        numero_cliente = request.data.get("numero")
        
        if not all([pergunta, numero_cliente]):
            return Response({"error": "Pergunta e número são obrigatórios"}, status=400)

        bot = SalonBot(estabelecimento_id)
        resposta = bot.processar_pergunta(pergunta, numero_cliente)
        return Response({"resposta": resposta})
    except Exception as e:
        logger.error(f"Erro no bot do salão: {str(e)}")
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def generate_qr_code(request):
    """Gera QR Code para conexão do WhatsApp"""
    try:
        config = SystemConfig.objects.first()
        if not config:
            return Response({'error': 'Configuração não encontrada'}, status=404)
            
        instance_name = 'support_bot'
        
        # Verifica se já existe uma instância
        instance_check = evolution_api.check_instance_exists(instance_name)
        
        # Se não existe instância, cria uma nova
        if not instance_check['exists']:
            if not config.support_whatsapp:
                return Response({'error': 'Número de WhatsApp não configurado'}, status=400)
                
            instance = evolution_api.criar_instancia(
                estabelecimento_id='support',
                phone=config.support_whatsapp,
                is_support=True
            )
            if instance.get('error'):
                return Response({'error': instance['error']}, status=400)
        
        # Gera o QR Code
        qr_response = evolution_api.get_qr_code(instance_name)
        if qr_response.get('error'):
            return Response({'error': qr_response['error']}, status=400)
            
        return Response(qr_response)
        
    except Exception as e:
        logger.error(f"Erro ao gerar QR code: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def salon_webhook(request, salon_id):
    """Webhook para os bots dos salões (Bot 2)"""
    try:
        logger.info("=== WEBHOOK BOT SALÃO ===")
        logger.info(f"Headers: {request.headers}")
        logger.info(f"Dados: {request.data}")
        
        estabelecimento = Estabelecimento.objects.get(id=salon_id)
        bot_config = estabelecimento.bot_config
        
        if not bot_config or not bot_config.bot_ativo:
            return Response({'status': 'bot_disabled'})
        
        data = request.data
        if data.get('event') == 'messages.upsert':
            message_data = data.get('data', {})
            sender = message_data.get('key', {}).get('remoteJid', '').split('@')[0]
            text = message_data.get('message', {}).get('conversation', '')
            
            if not sender or not text:
                return Response({'status': 'invalid_message'})

            start_time = time.time()
            
            # Registra interação
            interacao = Interacao.objects.create(
                estabelecimento=estabelecimento,
                numero_whatsapp=sender,
                mensagem=text,
                tipo='salon_bot'
            )
            
            # Processa com LLM
            try:
                response_text = chamar_llm(text, context=estabelecimento.id)
                interacao.resposta = response_text
                interacao.usado_llm = True
                interacao.tempo_resposta = time.time() - start_time
                interacao.save()
                
                evolution_api.send_text_message(f'salon_{salon_id}', sender, response_text)
                return Response({'status': 'ok'})
                
            except Exception as e:
                logger.error(f"Erro ao processar mensagem: {str(e)}")
                return Response({'error': str(e)}, status=500)
                
        return Response({'status': 'event_ignored'})
        
    except Estabelecimento.DoesNotExist:
        return Response({'error': 'Salão não encontrado'}, status=404)
    except Exception as e:
        logger.error(f"Erro no webhook: {str(e)}")
        return Response({'error': str(e)}, status=500) 

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_chats(request):
    """Lista todas as conversas do salão"""
    try:
        estabelecimento = request.user.estabelecimento
        chats = BotConfig.objects.filter(estabelecimento=estabelecimento)
        serializer = BotConfigSerializer(chats, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Erro ao listar chats: {str(e)}")
        return Response({'error': str(e)}, status=500) 

@api_view(['GET'])
def check_instance(request, salon_id):
    """Verifica se existe uma instância do salão"""
    try:
        logger.info(f"\n=== VERIFICANDO INSTÂNCIA DO SALÃO {salon_id} ===")
        instance_name = f"salon_{salon_id}"
        status_data = evolution_api.check_instance_exists(salon_id, is_support=False)
        logger.info(f"Resultado: {status_data}")
        return Response(status_data)
    except Exception as e:
        logger.error(f"Erro ao verificar instância: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def get_connection_status(request, estabelecimento_id):
    """Verifica status de conexão do WhatsApp"""
    try:
        estabelecimento = Estabelecimento.objects.get(id=estabelecimento_id)
        return Response({
            'status': estabelecimento.status
        })
    except Estabelecimento.DoesNotExist:
        return Response({'error': 'Salão não encontrado'}, status=404)

@api_view(['GET'])
def bot_verificar_agenda(request):
    """Endpoint para o bot verificar disponibilidade"""
    data = request.query_params.get('data')
    profissional_id = request.query_params.get('profissional_id')
    servico_id = request.query_params.get('servico_id')
    
    try:
        disponibilidade = verificar_disponibilidade(request)
        servico = Servico.objects.get(id=servico_id)
        profissional = Profissional.objects.get(id=profissional_id)
        
        return Response({
            'disponibilidade': disponibilidade.data,
            'servico': {
                'nome': servico.nome_servico,
                'duracao': servico.duracao,
                'preco': float(servico.preco)
            },
            'profissional': {
                'nome': profissional.nome,
                'especialidade': profissional.especialidade
            }
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_whatsapp_instance(request):
    """Cria uma nova instância do WhatsApp"""
    try:
        salon_id = request.user.estabelecimento_id
        phone = request.data.get('phone')
        
        try:
            phone = validate_phone(phone)
        except ValueError as e:
            return Response({'error': str(e)}, status=400)
        
        instance_response = evolution_api.criar_instancia(
            estabelecimento_id=str(salon_id),
            phone=phone
        )
        
        if instance_response:
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
        logger.error(f"Erro ao criar instância: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)

class WhatsAppService:
    """Serviço centralizado para operações do WhatsApp"""
    
    @staticmethod
    def send_message(instance_id, number, message, options=None):
        try:
            response = evolution_api.send_text_message(
                instance_id=instance_id,
                number=number,
                message=message,
                options=options
            )
            
            # Registra interação
            Interacao.objects.create(
                tipo='message_sent',
                numero_whatsapp=number,
                mensagem=message
            )
            
            return response
        except Exception as e:
            logger.error(f"Erro ao enviar mensagem: {str(e)}")
            raise

class ChatConfigViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar configurações de chat dos bots"""
    serializer_class = ChatConfigSerializer
    permission_classes = [IsAuthenticated]
    
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
        if 'bot_ativo' in serializer.validated_data:
            try:
                message = (
                    "O atendimento automático foi reativado." 
                    if instance.bot_ativo 
                    else "Um atendente humano assumirá a conversa a partir de agora."
                )
                evolution_api.send_text_message(
                    instance_id=instance.estabelecimento.evolution_instance_id,
                    number=instance.numero_cliente,
                    message=message
                )
            except Exception as e:
                logger.error(f"Erro ao enviar notificação: {str(e)}")

@api_view(['GET'])
@permission_classes([IsAdminUser])
def whatsapp_instances_status(request):
    """Retorna status de todas as instâncias WhatsApp"""
    try:
        estabelecimentos = Estabelecimento.objects.all()
        instances_data = []
        
        for estabelecimento in estabelecimentos:
            status = 'disconnected'
            if estabelecimento.evolution_instance_id:
                status_response = evolution_api.check_connection_status(
                    estabelecimento.evolution_instance_id
                )
                status = status_response.get('status', 'disconnected')
            
            instances_data.append({
                'id': str(estabelecimento.id),
                'nome': estabelecimento.nome,
                'instance_id': estabelecimento.evolution_instance_id,
                'whatsapp': estabelecimento.whatsapp,
                'status': status
            })
        
        return Response(instances_data)
    except Exception as e:
        logger.error(f"Erro ao buscar instâncias: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def reconnect_whatsapp(request, estabelecimento_id):
    """Reconecta ou cria nova instância WhatsApp"""
    try:
        estabelecimento = Estabelecimento.objects.get(id=estabelecimento_id)
        instance_name = f"estabelecimento_{estabelecimento_id}"
        
        # Verifica se instância existe
        instance_exists = evolution_api.check_instance_exists(
            estabelecimento_id,
            is_support=False
        )
        
        if not instance_exists.get('exists', False):
            # Cria nova instância
            instance_response = evolution_api.criar_instancia(
                estabelecimento_id=str(estabelecimento_id),
                phone=estabelecimento.whatsapp,
                is_support=False
            )
            
            if instance_response and instance_response.get('instanceId'):
                estabelecimento.evolution_instance_id = instance_response['instanceId']
                estabelecimento.save()
                return Response({
                    'success': True,
                    'message': 'Nova instância criada',
                    'instanceId': instance_response['instanceId']
                })
        
        return Response({
            'success': False,
            'error': 'Falha ao criar instância'
        }, status=400)
        
    except Exception as e:
        logger.error(f"Erro ao reconectar WhatsApp: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_whatsapp_instance(request):
    """Verifica existência e status da instância WhatsApp"""
    try:
        user = request.user
        instance_name = None
        
        # Define instance_name baseado no papel do usuário
        if user.role == 'ADMIN':
            instance_name = 'support_bot'
        elif user.role == 'OWNER':
            instance_name = f'salon_{user.estabelecimento_id}'
        else:
            return Response({'error': 'Usuário sem permissão'}, status=403)
            
        # Verifica se instância existe
        instance = evolution_api.get_instance(instance_name)
        
        if not instance:
            # Cria nova instância
            instance = evolution_api.criar_instancia(
                estabelecimento_id=user.estabelecimento_id if user.role == 'OWNER' else None,
                instance_name=instance_name
            )
            
            if instance:
                # Configura webhook
                webhook_url = f"{settings.BASE_URL}/api/whatsapp/webhook/{instance_name}/"
                evolution_api.set_webhook(instance_name, webhook_url)
                
                return Response({
                    'status': 'created',
                    'qr_code': instance.get('qrcode'),
                    'instance_name': instance_name
                })
                
        # Verifica status se instância existe
        status = evolution_api.check_connection_status(instance_name)
        
        if status == 'disconnected':
            qr_code = evolution_api.generate_qr_code(instance_name)
            return Response({
                'status': 'disconnected',
                'qr_code': qr_code,
                'instance_name': instance_name
            })
            
        return Response({
            'status': status,
            'instance_name': instance_name
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def staff_bot_metrics(request):
    """Métricas do bot de suporte"""
    try:
        start_date = request.query_params.get('start_date', datetime.now() - timedelta(days=30))
        end_date = request.query_params.get('end_date', datetime.now())
        
        interacoes = Interacao.objects.filter(
            tipo='staff_bot',
            timestamp__range=(start_date, end_date)
        )
        
        return Response({
            'total_interacoes': interacoes.count(),
            'media_resposta': interacoes.aggregate(Avg('tempo_resposta'))['tempo_resposta__avg'],
            'usuarios_unicos': interacoes.values('numero_whatsapp').distinct().count()
        })
    except Exception as e:
        logger.error(f"Erro ao buscar métricas do bot staff: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def staff_interactions(request):
    """Lista interações do bot de suporte"""
    try:
        interacoes = Interacao.objects.filter(
            tipo='staff_bot'
        ).order_by('-timestamp')[:100]
        return Response(InteracaoSerializer(interacoes, many=True).data)
    except Exception as e:
        logger.error(f"Erro ao listar interações do bot staff: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def staff_bot_status(request):
    """Status do bot de suporte"""
    try:
        config = SystemConfig.objects.first()
        return Response({
            'ativo': config.bot_ativo if config else False,
            'ultima_atualizacao': config.ultima_atualizacao if config else None
        })
    except Exception as e:
        logger.error(f"Erro ao verificar status do bot staff: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def staff_webhook(request):
    """Webhook para o bot de suporte"""
    try:
        data = request.data
        # Processa webhook do bot staff
        return Response({'status': 'processed'})
    except Exception as e:
        logger.error(f"Erro no webhook do bot staff: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def salon_bot_metrics(request, estabelecimento_id):
    """Métricas do bot do salão"""
    try:
        start_date = request.query_params.get('start_date', datetime.now() - timedelta(days=30))
        end_date = request.query_params.get('end_date', datetime.now())
        
        interacoes = Interacao.objects.filter(
            tipo='salon_bot',
            estabelecimento_id=estabelecimento_id,
            timestamp__range=(start_date, end_date)
        )
        
        return Response({
            'total_interacoes': interacoes.count(),
            'media_resposta': interacoes.aggregate(Avg('tempo_resposta'))['tempo_resposta__avg'],
            'clientes_unicos': interacoes.values('numero_whatsapp').distinct().count()
        })
    except Exception as e:
        logger.error(f"Erro ao buscar métricas do bot do salão: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def salon_interactions(request, estabelecimento_id):
    """Lista interações do bot do salão"""
    try:
        interacoes = Interacao.objects.filter(
            tipo='salon_bot',
            estabelecimento_id=estabelecimento_id
        ).order_by('-timestamp')[:100]
        return Response(InteracaoSerializer(interacoes, many=True).data)
    except Exception as e:
        logger.error(f"Erro ao listar interações do bot do salão: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def salon_bot_status(request, estabelecimento_id):
    """Status do bot do salão"""
    try:
        bot_config = BotConfig.objects.get(estabelecimento_id=estabelecimento_id)
        return Response({
            'ativo': bot_config.bot_ativo,
            'ultima_atualizacao': bot_config.ultima_atualizacao
        })
    except BotConfig.DoesNotExist:
        return Response({'error': 'Configuração não encontrada'}, status=404)
    except Exception as e:
        logger.error(f"Erro ao verificar status do bot do salão: {str(e)}")
        return Response({'error': str(e)}, status=500)