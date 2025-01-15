from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    EstabelecimentoViewSet, ProfissionalViewSet, ClienteViewSet, 
    ServicoViewSet, AgendamentoViewSet,
    ChatConfigViewSet,
    SupportBotViewSet, SalonBotViewSet, bot_views, auth_views, payment_views, report_views, salon_views, UserViewSet, health_check, 
    staff_list, staff_activities, staff_user_activities, system_logs, system_metrics, staff_bot_metrics, staff_interactions, staff_bot_status, staff_webhook,
    create_payment_preference, process_payment, export_data, salon_analytics, verificar_disponibilidade, create_professional,
    register, CustomTokenObtainPairView, staff_detail,
)

# Configuração do Router
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'estabelecimentos', EstabelecimentoViewSet, basename='estabelecimento')
router.register(r'profissionais', ProfissionalViewSet, basename='profissional')
router.register(r'clientes', ClienteViewSet, basename='cliente')
router.register(r'servicos', ServicoViewSet, basename='servico')
router.register(r'agendamentos', AgendamentoViewSet, basename='agendamento')
router.register(r'support-bot', SupportBotViewSet, basename='support-bot')
router.register(r'salon-bot', SalonBotViewSet, basename='salon-bot')
router.register(r'chat-config', ChatConfigViewSet, basename='chat-config')

urlpatterns = [
    # Rotas base
    path('', include(router.urls)),
    path('health-check/', health_check, name='health-check'),
    
    # Autenticação
    path('auth/', include([
        path('register/', register, name='register'),
        path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    ])),

    # Área Administrativa (Staff Bot - Bot 1)
    path('admin/', include([
        # Staff Management
        path('staff/', staff_list, name='staff-list'),
        path('staff/<int:pk>/', staff_detail, name='staff-detail'),
        path('staff/activities/', staff_activities, name='staff-activities'),
        path('staff/activities/<int:user_id>/', staff_user_activities, name='staff-user-activities'),
        
        # Sistema e Métricas
        path('system-logs/', system_logs, name='system-logs'),
        path('system-metrics/', system_metrics, name='system-metrics'),
        
        # Bot Staff (Bot 1)
        path('bot/', include([
            path('config/', StaffBotViewSet.as_view({
                'get': 'retrieve',
                'patch': 'update',
                'post': 'connect'
            }), name='staff-bot-config'),
            path('metrics/', staff_bot_metrics, name='staff-bot-metrics'),
            path('interactions/', staff_interactions, name='staff-bot-interactions'),
            path('status/', staff_bot_status, name='staff-bot-status'),
            path('webhook/', staff_webhook, name='staff-webhook'),
        ])),
        
        # Finanças Admin
        path('finance/', include([
            path('stats/', finance_stats, name='finance-stats'),
            path('transactions/', finance_transactions, name='finance-transactions'),
        ])),
    ])),

    # Área dos Salões (Salon Bot - Bot 2)
    path('salon/', include([
        # Gestão do Salão
        path('analytics/<int:estabelecimento_id>/', salon_analytics, name='salon-analytics'),
        path('disponibilidade/', verificar_disponibilidade, name='verificar-disponibilidade'),
        path('profissionais/', create_professional, name='create-professional'),
        
        # Bot do Salão (Bot 2)
        path('bot/', include([
            path('config/<str:estabelecimento_id>/', SalonBotViewSet.as_view({
                'get': 'retrieve',
                'patch': 'update',
                'post': 'connect'
            }), name='salon-bot-config'),
            path('metrics/<str:estabelecimento_id>/', salon_bot_metrics, name='salon-bot-metrics'),
            path('interactions/<str:estabelecimento_id>/', salon_interactions, name='salon-bot-interactions'),
            path('status/<str:estabelecimento_id>/', salon_bot_status, name='salon-bot-status'),
            path('webhook/<str:estabelecimento_id>/', salon_webhook, name='salon-webhook'),
        ])),
        
        # Finanças do Salão
        path('finance/', include([
            path('stats/', salon_finance_stats, name='salon-finance-stats'),
            path('transactions/', salon_finance_transactions, name='salon-finance-transactions'),
        ])),
    ])),

    # Relatórios
    path('reports/', include([
        path('export/', export_data, name='export-data'),
        path('analytics/', salon_analytics, name='salon-analytics'),
    ])),

    # Pagamentos
    path('payments/', include([
        path('preference/', create_payment_preference, name='create-payment-preference'),
        path('process/', process_payment, name='process-payment'),
    ])),
]




