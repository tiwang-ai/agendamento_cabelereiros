# core/services/reports.py
from typing import Dict, Any
from datetime import datetime, timedelta
from django.db.models import Count, Sum, Avg
from django.utils import timezone
from ..models import Estabelecimento, Agendamento, Cliente, Interacao

class ReportService:
    @staticmethod
    def get_salon_analytics(salon_id: int, start_date: str = None, end_date: str = None) -> Dict[str, Any]:
        """
        Retorna análises para um salão específico
        """
        if start_date:
            start = datetime.strptime(start_date, '%Y-%m-%d')
        else:
            start = timezone.now() - timedelta(days=30)
            
        if end_date:
            end = datetime.strptime(end_date, '%Y-%m-%d')
        else:
            end = timezone.now()

        agendamentos = Agendamento.objects.filter(
            profissional__estabelecimento_id=salon_id,
            data_agendamento__range=[start, end]
        )

        return {
            'total_agendamentos': agendamentos.count(),
            'receita_total': float(agendamentos.aggregate(Sum('servico__preco'))['servico__preco__sum'] or 0),
            'media_diaria': agendamentos.count() / max((end - start).days, 1),
            'servicos_populares': list(agendamentos.values('servico__nome_servico')
                .annotate(total=Count('id'))
                .order_by('-total')[:5]),
            'novos_clientes': Cliente.objects.filter(
                estabelecimento_id=salon_id,
                data_cadastro__range=[start, end]
            ).count()
        }

    @staticmethod
    def get_staff_analytics() -> Dict[str, Any]:
        """
        Retorna análises para a equipe administrativa
        """
        hoje = timezone.now()
        inicio_mes = hoje.replace(day=1)

        return {
            'total_saloes': Estabelecimento.objects.count(),
            'saloes_ativos': Estabelecimento.objects.filter(is_active=True).count(),
            'receita_total': float(Agendamento.objects.filter(status='completed')
                .aggregate(Sum('servico__preco'))['servico__preco__sum'] or 0),
            'receita_mes': float(Agendamento.objects.filter(
                status='completed',
                data_agendamento__gte=inicio_mes
            ).aggregate(Sum('servico__preco'))['servico__preco__sum'] or 0),
            'interacoes_bot': Interacao.objects.filter(tipo='bot_response').count(),
            'taxa_sucesso_bot': ReportService._calcular_taxa_sucesso_bot()
        }

    @staticmethod
    def _calcular_taxa_sucesso_bot() -> float:
        total = Interacao.objects.filter(tipo='bot_response').count()
        if total == 0:
            return 0
        sucesso = Interacao.objects.filter(
            tipo='bot_response',
            descricao__contains='success'
        ).count()
        return (sucesso / total) * 100

    @staticmethod
    def export_data(salon_id: int, data_type: str, start_date: str, end_date: str) -> Dict:
        """
        Exporta dados em formato adequado para relatórios
        """
        if data_type not in ['agendamentos', 'clientes', 'financeiro']:
            raise ValueError('Tipo de dados inválido')

        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')

        if data_type == 'agendamentos':
            data = Agendamento.objects.filter(
                profissional__estabelecimento_id=salon_id,
                data_agendamento__range=[start, end]
            ).values(
                'data_agendamento',
                'horario',
                'cliente__nome',
                'servico__nome_servico',
                'status'
            )
        elif data_type == 'clientes':
            data = Cliente.objects.filter(
                estabelecimento_id=salon_id,
                data_cadastro__range=[start, end]
            ).values(
                'nome',
                'whatsapp',
                'email',
                'data_cadastro'
            )
        else:  # financeiro
            data = Agendamento.objects.filter(
                profissional__estabelecimento_id=salon_id,
                data_agendamento__range=[start, end],
                status='completed'
            ).values(
                'data_agendamento',
                'servico__nome_servico',
                'servico__preco'
            )

        return {'data': list(data)}