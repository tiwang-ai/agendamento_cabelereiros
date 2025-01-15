from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count
from ..models import Servico, Agendamento, Profissional
from ..serializers import ServicoSerializer, AgendamentoSerializer
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class ServicoViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar serviços"""
    serializer_class = ServicoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Servico.objects.filter(
            estabelecimento=self.request.user.estabelecimento
        )
    
    def perform_create(self, serializer):
        serializer.save(estabelecimento=self.request.user.estabelecimento)

class AgendamentoViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar agendamentos"""
    serializer_class = AgendamentoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Agendamento.objects.filter(
            estabelecimento=self.request.user.estabelecimento
        )
    
    def perform_create(self, serializer):
        serializer.save(estabelecimento=self.request.user.estabelecimento)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verificar_disponibilidade(request):
    """Verifica horários disponíveis para agendamento"""
    data = request.query_params.get('data')
    profissional_id = request.query_params.get('profissional_id')
    servico_id = request.query_params.get('servico_id')  # Opcional
    
    if not data or not profissional_id:
        return Response({
            'error': 'Data e profissional são obrigatórios'
        }, status=400)
    
    try:
        agendamentos = Agendamento.objects.filter(
            data_agendamento=data,
            profissional_id=profissional_id
        ).values_list('horario', flat=True)
        
        horarios_possiveis = [f"{hora:02d}:00" for hora in range(8, 19)]
        horarios_disponiveis = [
            horario for horario in horarios_possiveis 
            if horario not in agendamentos
        ]
        
        response = {'horarios_disponiveis': horarios_disponiveis}
        
        # Adiciona informações do serviço se fornecido
        if servico_id:
            try:
                servico = Servico.objects.get(id=servico_id)
                profissional = Profissional.objects.get(id=profissional_id)
                response.update({
                    'servico': {
                        'nome': servico.nome_servico,
                        'duracao': servico.duracao,
                        'preco': float(servico.preco)
                    },
                    'profissional': {
                        'nome': profissional.nome,
                        'especialidade': profissional.especialidade
                    }
                })
            except (Servico.DoesNotExist, Profissional.DoesNotExist):
                pass
                
        return Response(response)
    except Exception as e:
        logger.error(f"Erro ao verificar disponibilidade: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def relatorio_servicos_populares(request):
    """Relatório de serviços mais agendados"""
    try:
        servicos = Servico.objects.filter(
            estabelecimento=request.user.estabelecimento
        ).annotate(
            total_agendamentos=Count('agendamento')
        ).order_by('-total_agendamentos')[:10]
        
        return Response(ServicoSerializer(servicos, many=True).data)
    except Exception as e:
        logger.error(f"Erro ao gerar relatório de serviços: {str(e)}")
        return Response({'error': str(e)}, status=500) 