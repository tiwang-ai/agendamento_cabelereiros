import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from ..models import Agendamento

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def finance_transactions(request):
    """Retorna lista de transações financeiras filtradas"""
    try:
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        transaction_type = request.query_params.get('type')
        status = request.query_params.get('status')
        
        transactions = Agendamento.objects.all()
        
        if start_date:
            transactions = transactions.filter(data_agendamento__gte=start_date)
        if end_date:
            transactions = transactions.filter(data_agendamento__lte=end_date)
        if status and status != 'all':
            transactions = transactions.filter(status=status)
            
        transaction_list = [{
            'id': agendamento.id,
            'date': agendamento.data_agendamento,
            'description': f'Agendamento - {agendamento.servico.nome_servico}',
            'amount': float(agendamento.servico.preco),
            'type': 'income',
            'status': agendamento.status,
            'category': 'Serviço',
            'salon_id': agendamento.profissional.estabelecimento.id
        } for agendamento in transactions]
        
        return Response(transaction_list)
        
    except Exception as e:
        logger.error(f"Erro ao listar transações: {str(e)}")
        return Response({'error': str(e)}, status=500) 