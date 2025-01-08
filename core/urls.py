from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import datetime

from .views import (
    EstabelecimentoViewSet, ProfissionalViewSet, ClienteViewSet, ServicoViewSet, AgendamentoViewSet, listar_agendamentos_calendario, relatorio_frequencia_clientes, relatorio_servicos_populares, relatorio_horarios_pico, solicitar_relatorio_whatsapp, register, finance_stats, finance_transactions, UserViewSet, admin_stats, create_payment_preference, process_payment, bot_responder, whatsapp_status, generate_qr_code, dashboard_stats, create_professional, whatsapp_instances_status, system_logs, ClienteProfissionalViewSet, whatsapp_webhook, CustomTokenObtainPairView, ChatConfigViewSet, salon_finance_stats, salon_finance_transactions, SystemServiceViewSet, SalonServiceViewSet, manage_whatsapp_connection, system_metrics, health_check, staff_list, staff_detail, staff_activities, staff_user_activities, send_whatsapp_message, support_webhook, salon_webhook, bot_status, check_connection, bot_settings_view, check_instance
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'estabelecimentos', EstabelecimentoViewSet, basename='estabelecimento')
router.register(r'profissionais', ProfissionalViewSet, basename='profissional')
router.register(r'clientes', ClienteViewSet, basename='cliente')
router.register(r'servicos', ServicoViewSet, basename='servico')
router.register(r'agendamentos', AgendamentoViewSet, basename='agendamento')
router.register(r'profissional/clientes', ClienteProfissionalViewSet, basename='profissional-clientes')
router.register(r'whatsapp/chats', ChatConfigViewSet, basename='chat-config')
router.register(r'system-services', SystemServiceViewSet, basename='system-services')
router.register(r'salon-services', SalonServiceViewSet, basename='salon-services')

urlpatterns = [
    path('', include(router.urls)),
    path('agendamentos/calendario/', listar_agendamentos_calendario, name='listar_agendamentos_calendario'),
    path('relatorios/frequencia-clientes/', relatorio_frequencia_clientes, name='relatorio_frequencia_clientes'),
    path('relatorios/servicos-populares/', relatorio_servicos_populares, name='relatorio_servicos_populares'),
    path('relatorios/horarios-pico/', relatorio_horarios_pico, name='relatorio_horarios_pico'),
    path('solicitar-relatorio/', solicitar_relatorio_whatsapp, name='solicitar_relatorio_whatsapp'),
    path('payments/preference/', create_payment_preference, name='create_payment_preference'),
    path('payments/process/', process_payment, name='process_payment'),
    path('bot/process/', bot_responder, name='bot_responder'),
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),
    path('profissionais/', create_professional, name='create-professional'),
    path('finance/salon/stats/', salon_finance_stats, name='salon-finance-stats'),
    path('finance/salon/transactions/', salon_finance_transactions, name='salon-finance-transactions'),
    path('auth/', include([
        path('register/', register, name='register'),
        path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    ])),
    path('admin/', include([
        path('stats/', admin_stats, name='admin-stats'),
        path('staff/', staff_list, name='staff-list'),
        path('staff/activities/', staff_activities, name='staff-activities'),
        path('staff/activities/<int:user_id>/', staff_user_activities, name='staff-user-activities'),
        path('finance/stats/', finance_stats, name='finance_stats'),
        path('staff/<int:pk>/', staff_detail, name='staff-detail'),
        path('finance/transactions/', finance_transactions, name='finance_transactions'),
        path('system-logs/', system_logs, name='system-logs'),
        path('system-metrics/', system_metrics, name='system-metrics'),
        path('bot/', include([
            path('config/', bot_settings_view, name='bot-config'),
            path('qr-code/', generate_qr_code, name='bot-qr-code'),
            path('status/', bot_status, name='bot-status'),
            path('connection/', check_connection, name='check-connection'),
            path('instance/check/', check_instance, name='check-instance-exists'),
        ])),
    ])),
    path('whatsapp/', include([
        path('instances/status/', whatsapp_instances_status, name='whatsapp-instances-status'),
        path('status/<str:estabelecimento_id>/', whatsapp_status, name='whatsapp-status'),
        path('qr-code/<str:estabelecimento_id>/', generate_qr_code, name='generate-qr-code'),
        path('connect/<str:estabelecimento_id>/', manage_whatsapp_connection, name='connect-whatsapp'),
        path('bot-config/<str:estabelecimento_id>/', bot_settings_view, name='bot-config'),
        path('webhook/', whatsapp_webhook, name='whatsapp-webhook'),
        path('send-message/<str:estabelecimento_id>/', send_whatsapp_message, name='send-message'),        
    ])),
    path('estabelecimentos/<int:pk>/', EstabelecimentoViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='estabelecimento-detail'),
    path('estabelecimentos/<int:pk>/details/', EstabelecimentoViewSet.as_view({
        'get': 'retrieve_details'
    }), name='estabelecimento-details'),
    path('health-check/', health_check, name='health-check'),
    path('webhooks/support/', support_webhook, name='support-webhook'),
    path('webhooks/salon/<str:salon_id>/', salon_webhook, name='salon-webhook'),
]




