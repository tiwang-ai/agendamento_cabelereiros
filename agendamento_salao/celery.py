# agendamento_salao/celery.py
from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from celery.schedules import crontab


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agendamento_salao.settings')
app = Celery('agendamento_salao')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'enviar-mensagem-aniversario-diariamente': {
        'task': 'core.tasks.enviar_mensagem_aniversario',
        'schedule': crontab(hour=9, minute=0),  # Executa todos os dias às 9:00
    },
}

app.conf.beat_schedule.update({
    'enviar-mensagem-pos-atendimento-diariamente': {
        'task': 'core.tasks.enviar_mensagem_pos_atendimento',
        'schedule': crontab(hour=10, minute=0),  # Executa diariamente às 10:00
    },
})
