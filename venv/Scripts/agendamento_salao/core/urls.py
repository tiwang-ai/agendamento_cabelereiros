from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import EstabelecimentoViewSet, ProfissionalViewSet, ClienteViewSet, ServicoViewSet, AgendamentoViewSet, listar_agendamentos_calendario, relatorio_frequencia_clientes, relatorio_servicos_populares, relatorio_horarios_pico, solicitar_relatorio_whatsapp

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
    path("relatorios/frequencia-clientes/", relatorio_frequencia_clientes, name="relatorio_frequencia_clientes"),
    path("relatorios/servicos-populares/", relatorio_servicos_populares, name="relatorio_servicos_populares"),
    path("relatorios/horarios-pico/", relatorio_horarios_pico, name="relatorio_horarios_pico"),
    path("solicitar-relatorio/", solicitar_relatorio_whatsapp, name="solicitar_relatorio_whatsapp"),


]




