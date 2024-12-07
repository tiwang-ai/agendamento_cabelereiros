# core/services/system_logs.py
from typing import Dict, List
import psutil
import docker
from django.conf import settings
from ..models import Estabelecimento, Interacao

class SystemMonitor:
    def __init__(self):
        self.has_docker = self._check_docker_available()

    def _check_docker_available(self) -> bool:
        try:
            import docker
            self.docker_client = docker.from_env()
            return True
        except:
            return False

    def get_system_metrics(self) -> Dict:
        metrics = {
            'system': {
                'cpu_percent': psutil.cpu_percent(),
                'memory_percent': psutil.virtual_memory().percent,
                'disk_usage': psutil.disk_usage('/').percent
            },
            'salons': self.get_salon_metrics(),
            'bot': self.get_bot_metrics()
        }

        # Só inclui métricas do Docker se disponível
        if self.has_docker:
            metrics['docker'] = self.get_docker_metrics()
        
        return metrics

    def get_docker_metrics(self) -> List[Dict]:
        if not self.has_docker:
            return []
            
        containers = []
        try:
            for container in self.docker_client.containers.list():
                stats = container.stats(stream=False)
                containers.append({
                    'name': container.name,
                    'status': container.status,
                    'cpu_usage': stats['cpu_stats']['cpu_usage']['total_usage'],
                    'memory_usage': stats['memory_stats']['usage']
                })
        except Exception as e:
            print(f"Erro ao obter métricas do Docker: {str(e)}")
        return containers

    def get_salon_metrics(self) -> List[Dict]:
        salons = []
        for salon in Estabelecimento.objects.all():
            interactions = Interacao.objects.filter(salao=salon)
            salons.append({
                'id': salon.id,
                'name': salon.nome,
                'total_interactions': interactions.count(),
                'whatsapp_status': salon.status,
                'is_active': salon.is_active
            })
        return salons

    def get_bot_metrics(self) -> Dict:
        total_interactions = Interacao.objects.filter(tipo='bot_response').count()
        success = Interacao.objects.filter(tipo='bot_response', sucesso=True).count()
        
        return {
            'total_messages': Interacao.objects.filter(tipo='message').count(),
            'success_rate': (success / total_interactions * 100) if total_interactions > 0 else 0,
            'average_response_time': self._calculate_response_time()
        }

    def _calculate_response_time(self) -> float:
        interactions = Interacao.objects.filter(tipo='bot_response')
        total_time = sum(interaction.response_time for interaction in interactions if hasattr(interaction, 'response_time'))
        return total_time / interactions.count() if interactions.count() > 0 else 0