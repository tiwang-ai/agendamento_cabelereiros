import logging
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..models import Estabelecimento, Calendario_Estabelecimento
from ..integrations.evolution import EvolutionAPI

logger = logging.getLogger(__name__)
evolution_api = EvolutionAPI()

@api_view(['POST'])
def onboarding(request):
    """Processo inicial de cadastro do salão"""
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
        instance_response = evolution_api.criar_instancia(
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
        logger.error(f"Erro durante onboarding: {str(e)}")
        return Response({
            "error": f"Erro durante onboarding: {str(e)}"
        }, status=500) 