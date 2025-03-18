from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from ..services.reports import ReportService
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_data(request):
    """Exporta dados em CSV"""
    try:
        data_type = request.query_params.get('type')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        salon_id = request.user.estabelecimento_id

        if not all([data_type, start_date, end_date, salon_id]):
            return Response({"error": "Parâmetros inválidos"}, status=400)

        data = ReportService.export_data(salon_id, data_type, start_date, end_date)
        return Response(data)
        
    except ValueError as e:
        return Response({"error": str(e)}, status=400)
    except Exception as e:
        logger.error(f"Erro ao exportar dados: {str(e)}")
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def salon_analytics(request, salon_id):
    """Retorna análises para um salão específico"""
    try:
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        data = ReportService.get_salon_analytics(salon_id, start_date, end_date)
        return Response(data)
    except Exception as e:
        logger.error(f"Erro ao gerar análises do salão: {str(e)}")
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def staff_analytics(request):
    """Retorna análises para a equipe administrativa"""
    try:
        data = ReportService.get_staff_analytics()
        return Response(data)
    except Exception as e:
        logger.error(f"Erro ao gerar análises administrativas: {str(e)}")
        return Response({"error": str(e)}, status=500) 