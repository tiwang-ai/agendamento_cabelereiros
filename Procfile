web: gunicorn agendamento_salao.wsgi:application
worker: celery -A agendamento_salao worker --pool=gevent -l info
beat: celery -A agendamento_salao beat -l info 