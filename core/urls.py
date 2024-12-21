from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .views import (
    EstabelecimentoViewSet,
    ProfissionalViewSet,
    ClienteViewSet,
    ServicoViewSet,
    AgendamentoViewSet,
    listar_agendamentos_calendario,
    relatorio_frequencia_clientes,
    relatorio_servicos_populares,
    relatorio_horarios_pico,
    solicitar_relatorio_whatsapp,
    register,
    finance_stats,
    finance_transactions,
    UserViewSet,
    admin_stats,
    create_payment_preference,
    process_payment,
    bot_responder,
    whatsapp_status,
    generate_qr_code,
    dashboard_stats,
    create_professional,
    whatsapp_instances_status,
    system_logs,
    reconnect_whatsapp,
    ClienteProfissionalViewSet,
    whatsapp_webhook,
    CustomTokenObtainPairView,
    ChatConfigViewSet,
    salon_finance_stats,
    salon_finance_transactions,
    SystemServiceViewSet,
    SalonServiceViewSet,
    connect_whatsapp,
    get_connection_status,
    bot_config,
    system_metrics
)

router = DefaultRouter()
router.register(r'estabelecimentos', EstabelecimentoViewSet)
router.register(r'profissionais', ProfissionalViewSet)
router.register(r'clientes', ClienteViewSet)
router.register(r'servicos', ServicoViewSet)
router.register(r'agendamentos', AgendamentoViewSet)
router.register(r'users', UserViewSet, basename='user')
router.register(r'profissional/clientes', ClienteProfissionalViewSet, basename='profissional-clientes')
router.register(r'whatsapp/chats', ChatConfigViewSet, basename='chat-config')
router.register(r'system-services', SystemServiceViewSet, basename='system-services')
router.register(r'salon-services', SalonServiceViewSet, basename='salon-services')

@api_view(['GET'])
def health_check(request):
    from django.db import connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        return Response({"status": "healthy"}, status=200)
    except Exception as e:
        return Response({"status": "unhealthy", "error": str(e)}, status=500)

urlpatterns = [
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
    path('agendamentos/calendario/', listar_agendamentos_calendario, name='listar_agendamentos_calendario'),
    path('relatorios/frequencia-clientes/', relatorio_frequencia_clientes, name='relatorio_frequencia_clientes'),
    path('relatorios/servicos-populares/', relatorio_servicos_populares, name='relatorio_servicos_populares'),
    path('relatorios/horarios-pico/', relatorio_horarios_pico, name='relatorio_horarios_pico'),
    path('solicitar-relatorio/', solicitar_relatorio_whatsapp, name='solicitar_relatorio_whatsapp'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', register, name='register'),
    path('admin/finance/stats/', finance_stats, name='finance_stats'),
    path('admin/finance/transactions/', finance_transactions, name='finance_transactions'),
    path('admin/stats/', admin_stats, name='admin_stats'),
    path('payments/preference/', create_payment_preference, name='create_payment_preference'),
    path('payments/process/', process_payment, name='process_payment'),
    path('bot/process/', bot_responder, name='bot_responder'),
    path('whatsapp/status/<str:salon_id>/', whatsapp_status, name='whatsapp_status'),
    path('whatsapp/qr-code/<str:estabelecimento_id>/', generate_qr_code),
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),
    path('profissionais/', create_professional, name='create-professional'),
    path('admin/whatsapp/instances/', whatsapp_instances_status, name='whatsapp-instances-status'),
    path('admin/system-logs/', system_logs, name='system-logs'),
    path('whatsapp/reconnect/<str:estabelecimento_id>/', reconnect_whatsapp, name='reconnect-whatsapp'),
    path('whatsapp/webhook/', whatsapp_webhook, name='whatsapp-webhook'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('finance/salon/stats/', salon_finance_stats, name='salon-finance-stats'),
    path('finance/salon/transactions/', salon_finance_transactions, name='salon-finance-transactions'),
    path('whatsapp/connect/<str:estabelecimento_id>/', connect_whatsapp, name='connect-whatsapp'),
    path('whatsapp/status/<str:estabelecimento_id>/', get_connection_status, name='get-connection-status'),
    path('admin/bot-config/', bot_config, name='bot-config'),
    path('admin/system-metrics/', system_metrics, name='system-metrics'),
    path('health-check/', health_check, name='health-check'),
]




