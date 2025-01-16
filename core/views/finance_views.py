import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg
from datetime import datetime, timedelta
from ..models import Agendamento, Transaction, Estabelecimento
from ..serializers import InteracaoSerializer

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def finance_stats(request):
    """Estatísticas financeiras para administradores"""
    try:
        start_date = request.query_params.get('start_date', 
            (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d'))
        end_date = request.query_params.get('end_date', 
            datetime.now().strftime('%Y-%m-%d'))
            
        transactions = Transaction.objects.filter(
            created_at__range=[start_date, end_date]
        )
        
        return Response({
            'total_revenue': transactions.aggregate(Sum('amount'))['amount__sum'] or 0,
            'total_transactions': transactions.count(),
            'average_ticket': transactions.aggregate(Avg('amount'))['amount__avg'] or 0,
            'transactions_by_type': transactions.values('type').annotate(
                count=Count('id'),
                total=Sum('amount')
            )
        })
    except Exception as e:
        logger.error(f"Erro ao buscar estatísticas financeiras: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def finance_transactions(request):
    """Lista de transações financeiras para administradores"""
    try:
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        transaction_type = request.query_params.get('type')
        status = request.query_params.get('status')
        
        transactions = Transaction.objects.all()
        
        if start_date:
            transactions = transactions.filter(created_at__gte=start_date)
        if end_date:
            transactions = transactions.filter(created_at__lte=end_date)
        if transaction_type:
            transactions = transactions.filter(type=transaction_type)
        if status and status != 'all':
            transactions = transactions.filter(status=status)
            
        transaction_list = [{
            'id': t.id,
            'amount': float(t.amount),
            'type': t.type,
            'status': t.status,
            'created_at': t.created_at,
            'estabelecimento': t.estabelecimento.nome if t.estabelecimento else None
        } for t in transactions.order_by('-created_at')[:100]]
        
        return Response(transaction_list)
        
    except Exception as e:
        logger.error(f"Erro ao listar transações: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def salon_finance_stats(request):
    """Estatísticas financeiras para salões"""
    try:
        if not request.user.estabelecimento:
            return Response({'error': 'Usuário não associado a um estabelecimento'}, status=400)
            
        start_date = request.query_params.get('start_date', 
            (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d'))
        end_date = request.query_params.get('end_date', 
            datetime.now().strftime('%Y-%m-%d'))
            
        transactions = Transaction.objects.filter(
            estabelecimento=request.user.estabelecimento,
            created_at__range=[start_date, end_date]
        )
        
        return Response({
            'total_revenue': transactions.aggregate(Sum('amount'))['amount__sum'] or 0,
            'total_transactions': transactions.count(),
            'average_ticket': transactions.aggregate(Avg('amount'))['amount__avg'] or 0,
            'transactions_by_type': transactions.values('type').annotate(
                count=Count('id'),
                total=Sum('amount')
            )
        })
    except Exception as e:
        logger.error(f"Erro ao buscar estatísticas financeiras do salão: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def salon_finance_transactions(request):
    """Lista de transações financeiras para salões"""
    try:
        if not request.user.estabelecimento:
            return Response({'error': 'Usuário não associado a um estabelecimento'}, status=400)
            
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        transaction_type = request.query_params.get('type')
        
        transactions = Transaction.objects.filter(
            estabelecimento=request.user.estabelecimento
        )
        
        if start_date:
            transactions = transactions.filter(created_at__gte=start_date)
        if end_date:
            transactions = transactions.filter(created_at__lte=end_date)
        if transaction_type:
            transactions = transactions.filter(type=transaction_type)
            
        transaction_list = [{
            'id': t.id,
            'amount': float(t.amount),
            'type': t.type,
            'status': t.status,
            'created_at': t.created_at
        } for t in transactions.order_by('-created_at')[:100]]
        
        return Response(transaction_list)
        
    except Exception as e:
        logger.error(f"Erro ao listar transações do salão: {str(e)}")
        return Response({'error': str(e)}, status=500) 