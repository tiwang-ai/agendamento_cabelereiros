from pathlib import Path
import os
from datetime import timedelta
from dotenv import load_dotenv
import dj_database_url

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
# SECRET_KEY = 'django-insecure-z&lz0%@w70ao)t4%3yh!=2t)fk1g9he-#cza6hcvhi-3nfend@'
SECRET_KEY = os.getenv('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_filters',
    'rest_framework',
    'core.apps.CoreConfig',
    'corsheaders',
    'drf_yasg',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ],

}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'USER_ID_FIELD': 'email',
    'USER_ID_CLAIM': 'email',
}

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'core.middleware.WhatsAppMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
]

ROOT_URLCONF = 'agendamento_salao.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'agendamento_salao.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///db.sqlite3')

DATABASES = {
    'default': dj_database_url.config(
        default=DATABASE_URL,
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Permitir fallback para SQLite durante build
if os.getenv('BUILD_PHASE', 'False') == 'True':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Extra places for collectstatic to find static files
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# Whitenoise para servir arquivos estáticos
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# settings.py
EVOLUTION_API_URL = "https://evo-evolution.vaekfu.easypanel.io:8080/api/"  
EVOLUTION_API_TOKEN = "seu_token_de_autenticacao"

# Configurações da API do Deep Infra
DEEP_INFRA_API_URL = "https://api.deepinfra.com/v1/inference/meta-llama/Meta-Llama-3.1-8B-Instruct"
DEEP_INFRA_API_TOKEN = "74h47LHC10VwzA5DR6vjHD9gnqZOSaK0"
DEEPINFRA_API_KEY = "74h47LHC10VwzA5DR6vjHD9gnqZOSaK0"
DEEPINFRA_API_KEY = os.getenv("4h47LHC10VwzA5DR6vjHD9gnqZOSaK0")

# Configuração do Celery
CELERY_BROKER_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'America/Sao_Paulo'

# Configuração das filas do Celery
CELERY_TASK_QUEUES = {
    'whatsapp': {
        'exchange': 'whatsapp',
        'routing_key': 'whatsapp',
    },
    'default': {
        'exchange': 'default',
        'routing_key': 'default',
    },
}

# Configuração do routing
CELERY_TASK_ROUTES = {
    'core.tasks.whatsapp_tasks.*': {'queue': 'whatsapp'},
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # URL do frontend Vite
]

AUTH_USER_MODEL = 'core.User'

# Configuração para usar email como campo de login
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

MERCADOPAGO_ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN'
MERCADOPAGO_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'
FRONTEND_URL = 'http://localhost:5173'  # URL do frontend

# Configurações da Evolution API
EVOLUTION_API_URL = os.getenv('EVOLUTION_API_URL', 'https://api.agendacabelereiro.com.br')
EVOLUTION_API_KEY = os.getenv('EVOLUTION_API_KEY', '429683C4C977415CAAFCCE10F7D57E11')
EVOLUTION_API_TOKEN = EVOLUTION_API_KEY
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:8000')

# Configurações específicas do WhatsApp
WHATSAPP_INSTANCE_URL = f"{EVOLUTION_API_URL}/instance"
WHATSAPP_MESSAGE_URL = f"{EVOLUTION_API_URL}/message"
WHATSAPP_STATUS_URL = f"{EVOLUTION_API_URL}/status"