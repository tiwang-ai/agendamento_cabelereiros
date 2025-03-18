from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count
from ..models import Cliente
from ..serializers import ClienteSerializer
import logging

logger = logging.getLogger(__name__)

class ClienteViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar clientes"""
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Cliente.objects.filter(
            estabelecimento=self.request.user.estabelecimento
        )
    
    def perform_create(self, serializer):
        serializer.save(estabelecimento=self.request.user.estabelecimento)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def relatorio_frequencia_clientes(request):
    """Relatório de frequência de clientes"""
    try:
        clientes = Cliente.objects.filter(
            estabelecimento=request.user.estabelecimento
        ).annotate(
            total_agendamentos=Count('agendamentos')
        ).order_by('-total_agendamentos')[:10]
        
        data = [{
            'id': cliente.id,
            'nome': cliente.nome,
            'telefone': cliente.telefone,
            'total_agendamentos': cliente.total_agendamentos
        } for cliente in clientes]
        
        return Response(data)
    except Exception as e:
        logger.error(f"Erro ao gerar relatório de frequência: {str(e)}")
        return Response({'error': str(e)}, status=500) 