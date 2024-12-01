# agendamento_salao/celery.py
from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agendamento_salao.settings')
app = Celery('agendamento_salao')

# Configuração básica do Celery
app.config_from_object('django.conf:settings', namespace='CELERY')

# Configurações específicas para o ambiente de produção
app.conf.update(
    worker_max_tasks_per_child=1000,
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='America/Sao_Paulo',
    enable_utc=True,
    broker_connection_retry_on_startup=True,
    broker_connection_max_retries=10,
    task_queues={
        'whatsapp': {
            'exchange': 'whatsapp',
            'routing_key': 'whatsapp',
        },
        'default': {
            'exchange': 'default',
            'routing_key': 'default',
        },
    },
    task_routes={
        'core.tasks.whatsapp_tasks.*': {'queue': 'whatsapp'},
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
