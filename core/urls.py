from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

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
    finance_transactions
)

router = DefaultRouter()
router.register(r'estabelecimentos', EstabelecimentoViewSet)
router.register(r'profissionais', ProfissionalViewSet)
router.register(r'clientes', ClienteViewSet)
router.register(r'servicos', ServicoViewSet)
router.register(r'agendamentos', AgendamentoViewSet)

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
]




