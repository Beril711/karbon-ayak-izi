import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('greencampus')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# ── PERİYODİK GÖREVLER ───────────────────────────────────────────────────────
app.conf.beat_schedule = {
    # Her gece 23:59 günlük özet oluştur
    'create-daily-summaries': {
        'task': 'apps.analytics.tasks.create_daily_summaries',
        'schedule': crontab(hour=23, minute=59),
    },
    # Her Pazartesi haftalık özet
    'create-weekly-summaries': {
        'task': 'apps.analytics.tasks.create_weekly_summaries',
        'schedule': crontab(hour=0, minute=0, day_of_week=1),
    },
    # Her sabah 8:00 streak kontrolü
    'check-streaks': {
        'task': 'apps.gamification.tasks.check_and_reset_streaks',
        'schedule': crontab(hour=8, minute=0),
    },
    # Her sabah 9:00 hatırlatma bildirimleri
    'send-daily-reminders': {
        'task': 'apps.users.tasks.send_daily_reminders',
        'schedule': crontab(hour=9, minute=0),
    },
    # Her Pazar liderboard güncelle ve bildir
    'update-leaderboard': {
        'task': 'apps.gamification.tasks.update_weekly_leaderboard',
        'schedule': crontab(hour=20, minute=0, day_of_week=0),
    },
}
