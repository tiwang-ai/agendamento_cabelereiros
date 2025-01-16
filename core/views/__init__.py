from .auth_views import (
    CustomTokenObtainPairView,
    UserViewSet,
    register
)
from .bot_views import (
    SupportBotViewSet,
    SalonBotViewSet,
    ChatConfigViewSet,
    staff_bot_metrics,
    staff_interactions,
    staff_bot_status,
    staff_webhook,
    salon_bot_metrics,
    salon_interactions,
    salon_bot_status,
    salon_webhook,
    bot_verificar_agenda,
    create_whatsapp_instance,
    list_chats,
    check_instance,
    get_connection_status
)
from .payment_views import (
    create_payment_preference,
    process_payment
)
from .finance_views import (
    finance_stats,
    finance_transactions,
    salon_finance_stats,
    salon_finance_transactions
)
from .report_views import (
    export_data,
    salon_analytics,
    staff_analytics
)
from .system_views import (
    system_info,
    system_logs,
    system_metrics,
    health_check
)
from .staff_views import (
    staff_list,
    staff_detail,
    staff_activities,
    staff_user_activities,
    admin_stats
)
from .salon_views import (
    EstabelecimentoViewSet,
    ProfissionalViewSet,
    ServicoViewSet,
    AgendamentoViewSet,
    verificar_disponibilidade,
    create_professional
)
from .client_views import (
    ClienteViewSet,
    relatorio_frequencia_clientes
)
from .service_views import (
    relatorio_servicos_populares
)

__all__ = [
    # Auth
    'CustomTokenObtainPairView',
    'UserViewSet',
    'register',
    
    # Bots
    'SupportBotViewSet',
    'SalonBotViewSet',
    'ChatConfigViewSet',
    'staff_bot_metrics',
    'staff_interactions',
    'staff_bot_status',
    'staff_webhook',
    'salon_bot_metrics',
    'salon_interactions',
    'salon_bot_status',
    'salon_webhook',
    'bot_verificar_agenda',
    'create_whatsapp_instance',
    'list_chats',
    'check_instance',
    'get_connection_status',
    
    # Payment
    'create_payment_preference',
    'process_payment',
    
    # Finance
    'finance_stats',
    'finance_transactions',
    'salon_finance_stats',
    'salon_finance_transactions',
    
    # Report
    'export_data',
    'salon_analytics',
    'staff_analytics',
    
    # System
    'health_check',
    'system_info',
    'system_logs',
    'system_metrics',
    
    # Staff
    'staff_list',
    'staff_detail',
    'staff_activities',
    'staff_user_activities',
    'admin_stats',
    
    # Salon
    'EstabelecimentoViewSet',
    'ProfissionalViewSet',
    'ServicoViewSet',
    'AgendamentoViewSet',
    'verificar_disponibilidade',
    'create_professional',
    
    # Client
    'ClienteViewSet',
    'relatorio_frequencia_clientes',
    
    # Service
    'relatorio_servicos_populares'
] 