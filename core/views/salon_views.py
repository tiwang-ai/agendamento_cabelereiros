from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg
from ..models import (
    Estabelecimento, Profissional, Servico, 
    Agendamento, Cliente, Calendario_Estabelecimento
)
from ..serializers import (
    EstabelecimentoSerializer, ProfissionalSerializer,
    ServicoSerializer, AgendamentoSerializer, ClienteSerializer
)
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class EstabelecimentoViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar estabelecimentos"""
    serializer_class = EstabelecimentoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Estabelecimento.objects.all()
        return Estabelecimento.objects.filter(id=self.request.user.estabelecimento_id)

class ProfissionalViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar profissionais do salão"""
    serializer_class = ProfissionalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Profissional.objects.filter(
            estabelecimento=self.request.user.estabelecimento
        )

class ServicoViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar serviços do salão"""
    serializer_class = ServicoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Servico.objects.filter(
            estabelecimento=self.request.user.estabelecimento
        )

class AgendamentoViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar agendamentos"""
    serializer_class = AgendamentoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Agendamento.objects.filter(
            estabelecimento=self.request.user.estabelecimento
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def salon_analytics(request, estabelecimento_id):
    """Retorna análises do salão"""
    try:
        estabelecimento = Estabelecimento.objects.get(id=estabelecimento_id)
        
        # Análises básicas
        total_clientes = Cliente.objects.filter(estabelecimento=estabelecimento).count()
        total_agendamentos = Agendamento.objects.filter(estabelecimento=estabelecimento).count()
        
        # Métricas de serviços
        servicos_populares = Servico.objects.filter(
            estabelecimento=estabelecimento
        ).annotate(
            total_agendamentos=Count('agendamento')
        ).order_by('-total_agendamentos')[:5]
        
        # Métricas financeiras
        hoje = datetime.now()
        primeiro_dia_mes = hoje.replace(day=1)
        
        faturamento_mes = Agendamento.objects.filter(
            estabelecimento=estabelecimento,
            data_agendamento__gte=primeiro_dia_mes,
            status='completed'
        ).aggregate(total=Sum('servico__preco'))['total'] or 0
        
        return Response({
            'total_clientes': total_clientes,
            'total_agendamentos': total_agendamentos,
            'servicos_populares': ServicoSerializer(servicos_populares, many=True).data,
            'faturamento_mes': float(faturamento_mes)
        })
        
    except Estabelecimento.DoesNotExist:
        return Response({'error': 'Salão não encontrado'}, status=404)
    except Exception as e:
        logger.error(f"Erro em salon_analytics: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verificar_disponibilidade(request):
    """Verifica horários disponíveis para agendamento"""
    data = request.query_params.get('data')
    profissional_id = request.query_params.get('profissional_id')
    
    if not data or not profissional_id:
        return Response({
            'error': 'Data e profissional são obrigatórios'
        }, status=400)
        
    try:
        # Busca agendamentos existentes
        agendamentos = Agendamento.objects.filter(
            data_agendamento=data,
            profissional_id=profissional_id
        ).values_list('horario', flat=True)
        
        # Define horários disponíveis (8h às 18h, intervalos de 1h)
        horarios_possiveis = [
            f"{hora:02d}:00" for hora in range(8, 19)
        ]
        
        # Remove horários já agendados
        horarios_disponiveis = [
            horario for horario in horarios_possiveis 
            if horario not in agendamentos
        ]
        
        return Response({
            'horarios_disponiveis': horarios_disponiveis
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_professional(request):
    """Cria um novo profissional para o salão"""
    try:
        data = request.data.copy()
        data['estabelecimento'] = request.user.estabelecimento.id
        
        serializer = ProfissionalSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
        
    except Exception as e:
        logger.error(f"Erro ao criar profissional: {str(e)}")
        return Response({'error': str(e)}, status=500)
