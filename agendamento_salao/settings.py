from pathlib import Path
import os
from datetime import timedelta
from dotenv import load_dotenv
import dj_database_url

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("SECRET_KEY")

DEBUG = os.getenv("DEBUG", "False") == "True"

ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")

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

# Configuração melhorada do banco de dados
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://doadmin:AVNS_EJ9-aplM6wWoGKsogZ8@cabelereiro-db-do-user-18173817-0.j.db.ondigitalocean.com:25060/defaultdb?sslmode=require",
)

DATABASES = {
    "default": {
        **dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
            ssl_require=True,
        ),
        "OPTIONS": {
            "sslmode": "require",
            "options": "-c search_path=public",
            "keepalives": 1,
            "keepalives_idle": 60,  # Aumentado para 60 segundos
            "keepalives_interval": 10,
            "keepalives_count": 5,
            "connect_timeout": 30,  # Aumentado para 30 segundos
            "retries": 5,  # Número de tentativas de reconexão
            "retry_delay": 5,  # Delay entre tentativas em segundos
        },
        "CONN_MAX_AGE": 0,  # Força novas conexões
        "ATOMIC_REQUESTS": True,  # Transações atômicas por request
    }
}

if os.getenv("BUILD_PHASE", "False") == "True":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

if os.getenv("DJANGO_RESET_DB", "False") == "True":
    DATABASES["default"]["OPTIONS"] = {
        "sslmode": "require",
        "options": "-c search_path=public",
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
EVOLUTION_API_TOKEN = os.getenv("EVOLUTION_API_KEY", "429683C4C977415CAAFCCE10F7D57E11")

# Configurações da API do Deep Infra
DEEP_INFRA_API_URL = (
    "https://api.deepinfra.com/v1/inference/meta-llama/Meta-Llama-3.1-8B-Instruct"
)
DEEP_INFRA_API_TOKEN = os.getenv(
    "DEEP_INFRA_API_TOKEN", "74h47LHC10VwzA5DR6vjHD9gnqZOSaK0"
)

# Configuração melhorada do Celery e Redis
REDIS_URL = os.getenv(
    "REDIS_URL",
    "redis://default:AVjqAAIjcDE2NDI5MTJhNjU2NjA0MWI0YWZlYWE4NGI4NmYxYTg0M3AxMA@next-barnacle-22762.upstash.io:6379",
)

CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = "America/Sao_Paulo"
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
CELERY_BROKER_CONNECTION_MAX_RETRIES = 10
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
            "MAX_CONNECTIONS": 100,
            "CONNECTION_POOL_KWARGS": {"max_retries": 3},
        },
        "KEY_PREFIX": "agendamento_salao",
    }
}

# Configurações de CORS e segurança
CORS_ALLOWED_ORIGINS = [
    "https://cabelereiro-ia-dtnxh.ondigitalocean.app",
    "http://localhost:3000",
    "http://localhost:5173",
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

# Configurações de segurança
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
