# agendamento_salao/celery.py
from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from celery.schedules import crontab
from kombu import Queue, Exchange
import ssl

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agendamento_salao.settings')
app = Celery('agendamento_salao')

REDIS_URL = "rediss://default:AVjqAAIjcDE2NDI5MTJhNjU2NjA0MWI0YWZlYWE4NGI4NmYxYTg0M3AxMA@next-barnacle-22762.upstash.io:6379"

app.conf.update(
    broker_url=REDIS_URL,
    result_backend=REDIS_URL,
    broker_connection_retry_on_startup=True,
    broker_pool_limit=None,
    redis_max_connections=20,
    broker_transport_options={
        'visibility_timeout': 3600,
        'socket_timeout': 30,
        'socket_connect_timeout': 30,
        'socket_keepalive': True,
        'retry_on_timeout': True,
        'ssl_cert_reqs': ssl.CERT_NONE,
        'ssl': {
            'ssl_cert_reqs': ssl.CERT_NONE
        }
    },
    redis_backend_use_ssl={
        'ssl_cert_reqs': ssl.CERT_NONE
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
