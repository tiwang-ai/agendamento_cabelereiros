# core/services/activity_logs.py
from ..models import User, Interacao
from django.utils import timezone

class ActivityLogService:
    @staticmethod
    def log_activity(user: User, action: str, details: str = None):
        """
        Registra uma atividade do usuário
        """
        Interacao.objects.create(
            user=user,
            tipo='staff_activity',
            acao=action,
            descricao=details,
            data=timezone.now()
        )

    @staticmethod
    def get_user_activities(user_id: int, start_date=None, end_date=None):
        """
        Retorna atividades de um usuário específico
        """
        queryset = Interacao.objects.filter(
            user_id=user_id,
            tipo='staff_activity'
        )
        
        if start_date:
            queryset = queryset.filter(data__gte=start_date)
        if end_date:
            queryset = queryset.filter(data__lte=end_date)
            
        return queryset.order_by('-data')

    @staticmethod
    def get_staff_activities(start_date=None, end_date=None):
        """
        Retorna atividades de toda a equipe staff
        """
        queryset = Interacao.objects.filter(
            user__is_staff=True,
            tipo='staff_activity'
        )
        
        if start_date:
            queryset = queryset.filter(data__gte=start_date)
        if end_date:
            queryset = queryset.filter(data__lte=end_date)
            
        return queryset.order_by('-data')