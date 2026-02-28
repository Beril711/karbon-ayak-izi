from django.urls import path
from django.http import JsonResponse
from django.db import connection
import redis as redis_lib
from django.conf import settings


def health_check(request):
    checks = {}

    # DB kontrolü
    try:
        connection.ensure_connection()
        checks['database'] = 'ok'
    except Exception as e:
        checks['database'] = f'error: {e}'

    # Redis kontrolü
    try:
        r = redis_lib.from_url(settings.REDIS_URL)
        r.ping()
        checks['redis'] = 'ok'
    except Exception as e:
        checks['redis'] = f'error: {e}'

    status = 200 if all(v == 'ok' for v in checks.values()) else 503
    return JsonResponse({'status': 'healthy' if status == 200 else 'unhealthy', 'checks': checks}, status=status)


urlpatterns = [
    path('', health_check, name='health_check'),
]
