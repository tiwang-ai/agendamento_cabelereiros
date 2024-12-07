# agendamento_salao/celery.py
from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from celery.schedules import crontab
from kombu import Queue, Exchange

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agendamento_salao.settings')
app = Celery('agendamento_salao')

# Configurações específicas para o Redis do Upstash
app.conf.update(
    broker_url=os.getenv('REDIS_URL', 'redis://default:AVjqAAIjcDE2NDI5MTJhNjU2NjA0MWI0YWZlYWE4NGI4NmYxYTg0M3AxMA@next-barnacle-22762.upstash.io:6379'),
    result_backend=os.getenv('REDIS_URL', 'redis://default:AVjqAAIjcDE2NDI5MTJhNjU2NjA0MWI0YWZlYWE4NGI4NmYxYTg0M3AxMA@next-barnacle-22762.upstash.io:6379'),
    broker_connection_retry_on_startup=True,
    broker_pool_limit=None,  # Desativa o limite de pool para conexões
    redis_max_connections=20,  # Limite máximo de conexões
    broker_transport_options={
        'visibility_timeout': 3600,  # 1 hora
        'socket_timeout': 30,        # 30 segundos
        'socket_connect_timeout': 30,
        'socket_keepalive': True,
        'retry_on_timeout': True
    },
    worker_concurrency=2,  # Reduz a concorrência para evitar muitas conexões
    task_queues=(
        Queue('whatsapp', Exchange('whatsapp'), routing_key='whatsapp'),
    ),
    task_routes={
        'core.tasks.*': {'queue': 'whatsapp'},
    }
)

# Descoberta automática de tasks
app.autodiscover_tasks()

# Schedule de tarefas
app.conf.beat_schedule = {
    'enviar-mensagem-aniversario-diariamente': {
        'task': 'core.tasks.enviar_mensagem_aniversario',
        'schedule': crontab(hour=9, minute=0),
    },
    'enviar-mensagem-pos-atendimento-diariamente': {
        'task': 'core.tasks.enviar_mensagem_pos_atendimento',
        'schedule': crontab(hour=10, minute=0),
    },
}
