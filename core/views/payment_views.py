import mercadopago
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.conf import settings
from ..models import Plan, Estabelecimento, Transaction
from django.db.models import Sum, Count, Avg
from datetime import datetime, timedelta
import logging

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
        
        transactions = Transaction.objects.all()
        
        if start_date:
            transactions = transactions.filter(created_at__gte=start_date)
        if end_date:
            transactions = transactions.filter(created_at__lte=end_date)
        if transaction_type:
            transactions = transactions.filter(type=transaction_type)
            
        transactions = transactions.order_by('-created_at')[:100]
        
        return Response([{
            'id': t.id,
            'amount': float(t.amount),
            'type': t.type,
            'status': t.status,
            'created_at': t.created_at,
            'estabelecimento': t.estabelecimento.nome if t.estabelecimento else None
        } for t in transactions])
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
            
        transactions = transactions.order_by('-created_at')[:100]
        
        return Response([{
            'id': t.id,
            'amount': float(t.amount),
            'type': t.type,
            'status': t.status,
            'created_at': t.created_at
        } for t in transactions])
    except Exception as e:
        logger.error(f"Erro ao listar transações do salão: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def create_payment_preference(request):
    """Cria preferência de pagamento no Mercado Pago"""
    try:
        plan_id = request.data.get('planId')
        plan = Plan.objects.get(id=plan_id)
        
        sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
        
        preference_data = {
            "items": [{
                "title": plan.name,
                "quantity": 1,
                "currency_id": "BRL",
                "unit_price": float(plan.price)
            }],
            "back_urls": {
                "success": f"{settings.FRONTEND_URL}/payment/success",
                "failure": f"{settings.FRONTEND_URL}/payment/failure",
                "pending": f"{settings.FRONTEND_URL}/payment/pending"
            },
            "auto_return": "approved",
        }
        
        preference_response = sdk.preference().create(preference_data)
        return Response(preference_response["response"])
        
    except Exception as e:
        logger.error(f"Erro ao criar preferência de pagamento: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def process_payment(request):
    """Processa pagamento após retorno do Mercado Pago"""
    try:
        payment_id = request.data.get('payment_id')
        salon_id = request.data.get('salon_id')
        
        sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
        payment = sdk.payment().get(payment_id)
        
        if payment["status"] == "approved":
            salon = Estabelecimento.objects.get(id=salon_id)
            salon.is_active = True
            salon.save()
            
            # Registra a transação
            Transaction.objects.create(
                estabelecimento=salon,
                amount=payment["transaction_amount"],
                type="subscription",
                status="approved",
                payment_id=payment_id
            )
            
            return Response({"status": "approved"})
        
        return Response({"status": payment["status"]}, status=400)
        
    except Exception as e:
        logger.error(f"Erro ao processar pagamento: {str(e)}")
        return Response({'error': str(e)}, status=500)