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

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://doadmin:AVNS_EJ9-aplM6wWoGKsogZ8@cabelereiro-db-do-user-18173817-0.j.db.ondigitalocean.com:25060/defaultdb?sslmode=require')

DATABASES = {
    'default': {
        **dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
            ssl_require=True,
        ),
        'OPTIONS': {
            'sslmode': 'require',
            'options': '-c search_path=public'
        }
    }
}

if os.getenv('BUILD_PHASE', 'False') == 'True':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

if os.getenv('DJANGO_RESET_DB', 'False') == 'True':
    DATABASES['default']['OPTIONS'] = {
        'sslmode': 'require',
        'options': '-c search_path=public'
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
DEEPINFRA_API_KEY = os.getenv("4h47LHC10VwzA5DR6vjHD9gnqZOSaK0")

# Configuração do Celery
CELERY_BROKER_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'America/Sao_Paulo'
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
CELERY_BROKER_CONNECTION_MAX_RETRIES = 10

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
    f"https://{os.getenv('APP_DOMAIN')}",
    "http://localhost:3000",
    "http://localhost:5173"
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

# Configurações de segurança para produção
SECURE_SSL_REDIRECT = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Configurações do Redis
REDIS_URL = os.getenv('REDIS_URL')
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": os.getenv('redis://default:********@next-barnacle-22762.upstash.io:6379', 'redis://localhost:6379/1'),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "IGNORE_EXCEPTIONS": True,
        }
    }
}

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    f"https://{os.getenv('APP_DOMAIN')}",
    "http://localhost:3000",
    "http://localhost:5173"
]

# Adicione estas configurações
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Configurações de URLs base
BACKEND_BASE_URL = os.getenv('BACKEND_BASE_URL', 'https://app.agendacabelereiro.com.br')
FRONTEND_BASE_URL = os.getenv('FRONTEND_BASE_URL', 'https://app.agendacabelereiro.com.br')
API_BASE_URL = f"{BACKEND_BASE_URL}/api"

# Ajuste nas configurações de CORS e CSRF
CORS_ALLOWED_ORIGINS = [
    FRONTEND_BASE_URL,
    "http://localhost:3000",
    "http://localhost:5173"
]

CSRF_TRUSTED_ORIGINS = [
    FRONTEND_BASE_URL,
    BACKEND_BASE_URL,
    "http://localhost:3000",
    "http://localhost:5173"
]