from pathlib import Path
import os
from datetime import timedelta
from dotenv import load_dotenv
import dj_database_url

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("SECRET_KEY")

DEBUG = "True"

ALLOWED_HOSTS = [
    'cabelereiro-api.onrender.com',
    'localhost',
    '127.0.0.1',
    # Adicione outros domínios que você precisa
]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django_filters",
    "rest_framework",
    "core.apps.CoreConfig",
    "corsheaders",
    "drf_yasg",
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
    ],
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "USER_ID_FIELD": "email",
    "USER_ID_CLAIM": "email",
}

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "core.middleware.WhatsAppMiddleware",
]

ROOT_URLCONF = "agendamento_salao.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "agendamento_salao.wsgi.application"

# Configuração do banco de dados Neon
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://cabalereiro-db_owner:W4nmbkYi7FvX@ep-white-mud-a5wh0xvw.us-east-2.aws.neon.tech/cabalereiro-db?sslmode=require",
)

db_config = {
    "default": {
        **dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=0,  # Importante para serverless
            ssl_require=True,
        ),
        "OPTIONS": {
            "sslmode": "require",
            "target_session_attrs": "read-write",
            "application_name": "agendamento_salao",
        },
        "POOL_OPTIONS": {
            "POOL_SIZE": 20,  # Ajuste baseado na necessidade
            "MAX_OVERFLOW": 10,
            "RECYCLE": 300,  # 5 minutos
        },
        "CONN_MAX_AGE": 0,  # Desativa conexões persistentes
        "CONN_HEALTH_CHECKS": True,
        "TEST": {
            "MIRROR": "default",
        },
    }
}

DATABASES = db_config

if os.getenv("BUILD_PHASE", "False") == "True":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
STATICFILES_DIRS = [os.path.join(BASE_DIR, "static")]
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Configurações da Evolution API
EVOLUTION_API_URL = os.getenv(
    "EVOLUTION_API_URL", "https://evo-evolution.vaekfu.easypanel.io:8080/api/"
)
EVOLUTION_API_KEY = os.getenv("EVOLUTION_API_KEY", "429683C4C977415CAAFCCE10F7D57E11")
EVOLUTION_API_TOKEN = EVOLUTION_API_KEY

# Configurações da API do Deep Infra
DEEP_INFRA_API_URL = (
    "https://api.deepinfra.com/v1/inference/meta-llama/Meta-Llama-3.1-8B-Instruct"
)
DEEP_INFRA_API_TOKEN = os.getenv(
    "DEEP_INFRA_API_TOKEN", "74h47LHC10VwzA5DR6vjHD9gnqZOSaK0"
)

# Configuração do Redis
REDIS_URL = os.getenv(
    "REDIS_URL",
    "redis://default:AVjqAAIjcDE2NDI5MTJhNjU2NjA0MWI0YWZlYWE4NGI4NmYxYTg0M3AxMA@next-barnacle-22762.upstash.io:6379",
)

# Configuração do Celery
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = "America/Sao_Paulo"
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
CELERY_BROKER_CONNECTION_MAX_RETRIES = 1
CELERY_BROKER_CONNECTION_TIMEOUT = 30

CELERY_TASK_QUEUES = {
    "whatsapp": {
        "exchange": "whatsapp",
        "routing_key": "whatsapp",
    },
    "default": {
        "exchange": "default",
        "routing_key": "default",
    },
}

CELERY_TASK_ROUTES = {
    "core.tasks.whatsapp_tasks.*": {"queue": "whatsapp"},
}

# Configuração do Redis para cache
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": REDIS_URL,
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "IGNORE_EXCEPTIONS": True,
            "SOCKET_CONNECT_TIMEOUT": 30,
            "SOCKET_TIMEOUT": 30,
            "RETRY_ON_TIMEOUT": True,
            "MAX_CONNECTIONS": 1,
            "CONNECTION_POOL_KWARGS": {"max_retries": 3},
        },
        "KEY_PREFIX": "agendamento_salao",
    }
}

# Configurações de CORS e segurança
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://cabelereiro-ia-dtnxh.ondigitalocean.app"
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

# URLs base e configurações de domínio
BACKEND_BASE_URL = os.getenv(
    "BACKEND_BASE_URL", "https://cabelereiro-ia-dtnxh.ondigitalocean.app"
)
FRONTEND_BASE_URL = os.getenv(
    "FRONTEND_BASE_URL", "https://cabelereiro-ia-dtnxh.ondigitalocean.app"
)
API_BASE_URL = f"{BACKEND_BASE_URL}/api"

CSRF_TRUSTED_ORIGINS = [
    FRONTEND_BASE_URL,
    BACKEND_BASE_URL,
    "http://localhost:3000",
    "http://localhost:5173",
]

# Configura��ões de segurança
SECURE_SSL_REDIRECT = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# Configurações de autenticação
AUTH_USER_MODEL = "core.User"
AUTHENTICATION_BACKENDS = ["django.contrib.auth.backends.ModelBackend"]

# Configurações do MercadoPago
MERCADOPAGO_ACCESS_TOKEN = os.getenv("MERCADOPAGO_ACCESS_TOKEN", "YOUR_ACCESS_TOKEN")
MERCADOPAGO_PUBLIC_KEY = os.getenv("MERCADOPAGO_PUBLIC_KEY", "YOUR_PUBLIC_KEY")

# Configurações específicas do WhatsApp
WHATSAPP_INSTANCE_URL = f"{EVOLUTION_API_URL}/instance"
WHATSAPP_MESSAGE_URL = f"{EVOLUTION_API_URL}/message"
WHATSAPP_STATUS_URL = f"{EVOLUTION_API_URL}/status"