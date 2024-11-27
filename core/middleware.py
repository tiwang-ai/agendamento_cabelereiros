# core/middleware.py
from django.utils import timezone
from .models import User, BotConfig, Estabelecimento

class ActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        if request.user.is_authenticated:
            User.objects.filter(id=request.user.id).update(
                last_activity=timezone.now(),
                last_login_ip=request.META.get('REMOTE_ADDR')
            )
        
        return response

class WhatsAppMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_view(self, request, view_func, view_args, view_kwargs):
        if request.path.startswith('/api/whatsapp/webhook/'):
            try:
                data = request.data
                if data.get('event') == 'messages':
                    mensagem = data.get('message', {})
                    numero = mensagem.get('from')
                    instance_id = data.get('instanceId')
                    
                    estabelecimento = Estabelecimento.objects.get(
                        evolution_instance_id=instance_id
                    )
                    
                    # Atualiza ou cria configuração do chat
                    BotConfig.objects.update_or_create(
                        estabelecimento=estabelecimento,
                        numero_cliente=numero,
                        defaults={
                            'ultima_atualizacao': timezone.now()
                        }
                    )
            except Exception as e:
                print(f"Erro no middleware: {str(e)}")
        return None