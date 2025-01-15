import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from django.db import connection
from django_redis import get_redis_connection
import psutil  # Para estatísticas do sistema

logger = logging.getLogger(__name__)

class SystemMonitor:
    """Monitor do sistema"""
    @staticmethod
    def get_system_stats():
        return {
            'cpu_percent': psutil.cpu_percent(),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_percent': psutil.disk_usage('/').percent
        }

@api_view(['GET'])
@permission_classes([AllowAny])
def system_info(request):
    """Retorna informações básicas do sistema"""
    try:
        monitor = SystemMonitor()
        redis_conn = get_redis_connection("default")
        
        return Response({
            'version': '1.0.0',
            'environment': 'production',
            'api_status': 'online',
            'database': {
                'connections': len(connection.queries),
                'is_connected': connection.is_usable()
            },
            'cache': {
                'status': 'connected' if redis_conn.ping() else 'disconnected'
            },
            'system': monitor.get_system_stats()
        })
    except Exception as e:
        logger.error(f"Erro ao buscar informações do sistema: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Endpoint para verificar se a API está funcionando"""
    return Response({
        'status': 'healthy',
        'message': 'API is running'
    })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def system_logs(request):
    """Retorna logs do sistema"""
    try:
        # Implementar lógica de logs aqui
        return Response({
            'logs': 'Sistema de logs em desenvolvimento'
        })
    except Exception as e:
        logger.error(f"Erro ao buscar logs do sistema: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def system_metrics(request):
    """Retorna métricas do sistema"""
    try:
        monitor = SystemMonitor()
        return Response(monitor.get_system_stats())
    except Exception as e:
        logger.error(f"Erro ao buscar métricas do sistema: {str(e)}")
        return Response({'error': str(e)}, status=500)