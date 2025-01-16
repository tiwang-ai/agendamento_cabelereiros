from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from ..models import ActivityLog, Estabelecimento, Transaction
from ..serializers import StaffSerializer
import logging
from django.db.models import Count, Sum

User = get_user_model()
logger = logging.getLogger(__name__)

class ActivityLogger:
    """Classe para centralizar o registro de atividades"""
    
    @staticmethod
    def register(user, action, details=""):
        try:
            ActivityLog.objects.create(
                user=user,
                action=action,
                details=details
            )
        except Exception as e:
            logger.error(f"Erro ao registrar atividade: {str(e)}")
            
    @staticmethod
    def get_user_activities(user_id, limit=50):
        return ActivityLog.objects.filter(
            user_id=user_id
        ).select_related('user').order_by('-timestamp')[:limit]

@api_view(['GET'])
@permission_classes([IsAdminUser])
def staff_list(request):
    """Lista todos os membros da equipe (staff)"""
    try:
        staff = User.objects.filter(is_staff=True).select_related('estabelecimento')
        serializer = StaffSerializer(staff, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Erro ao listar staff: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET', 'PUT'])
@permission_classes([IsAdminUser])
def staff_detail(request, pk):
    """Detalhes e atualização de um membro da equipe"""
    try:
        staff_member = User.objects.get(id=pk, is_staff=True)
        
        if request.method == 'GET':
            serializer = StaffSerializer(staff_member)
            return Response(serializer.data)
            
        elif request.method == 'PUT':
            serializer = StaffSerializer(staff_member, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
            
    except User.DoesNotExist:
        return Response({'error': 'Membro da equipe não encontrado'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def staff_activities(request):
    """Lista todas as atividades da equipe staff"""
    try:
        activities = ActivityLog.objects.filter(
            user__is_staff=True
        ).select_related('user').order_by('-timestamp')[:100]
        
        data = [{
            'id': activity.id,
            'user': activity.user.get_full_name() or activity.user.username,
            'action': activity.action,
            'details': activity.details,
            'timestamp': activity.timestamp
        } for activity in activities]
        
        return Response(data)
    except Exception as e:
        logger.error(f"Erro ao buscar atividades: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def staff_user_activities(request, user_id):
    """Lista atividades de um membro específico da equipe"""
    try:
        activities = ActivityLog.objects.filter(
            user_id=user_id,
            user__is_staff=True
        ).select_related('user').order_by('-timestamp')[:50]
        
        data = [{
            'id': activity.id,
            'user': activity.user.get_full_name() or activity.user.username,
            'action': activity.action,
            'details': activity.details,
            'timestamp': activity.timestamp
        } for activity in activities]
        
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats(request):
    """Retorna estatísticas gerais para o dashboard administrativo"""
    try:
        # Cálculo das estatísticas
        total_salons = Estabelecimento.objects.count()
        active_salons = Estabelecimento.objects.filter(is_active=True).count()
        total_revenue = Transaction.objects.filter(
            status='approved'
        ).aggregate(total=Sum('amount'))['total'] or 0
        active_subscriptions = Estabelecimento.objects.filter(
            is_active=True,
            plano__isnull=False
        ).count()

        # Buscar atividades recentes
        recent_activities = ActivityLog.objects.select_related('user').order_by(
            '-timestamp'
        )[:10]

        activities_data = [{
            'id': activity.id,
            'type': activity.action,
            'description': activity.details,
            'date': activity.timestamp.isoformat()
        } for activity in recent_activities]

        return Response({
            'totalSalons': total_salons,
            'activeSalons': active_salons,
            'totalRevenue': float(total_revenue),
            'activeSubscriptions': active_subscriptions,
            'recentActivities': activities_data
        })
    except Exception as e:
        logger.error(f"Erro ao buscar estatísticas administrativas: {str(e)}")
        return Response({'error': str(e)}, status=500) 