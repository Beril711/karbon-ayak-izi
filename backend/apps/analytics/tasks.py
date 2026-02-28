"""
Analitik periyodik görevler.
Celery beat tarafından otomatik tetiklenir.
"""
import logging
from celery import shared_task
from django.contrib.auth import get_user_model
from datetime import date, timedelta

logger = logging.getLogger(__name__)
User   = get_user_model()


@shared_task
def create_daily_summaries():
    """
    Her gece 23:59 — Bugün emisyon girişi olan tüm kullanıcılar için
    DailyEmissionSummary oluştur veya güncelle.
    """
    from apps.emissions.models import EmissionEntry
    from apps.analytics.models import DailyEmissionSummary
    from django.db.models import Sum

    today = date.today()

    # Bugün giriş yapan benzersiz kullanıcılar
    user_ids = EmissionEntry.objects.filter(date=today).values_list('user_id', flat=True).distinct()

    created = 0
    for user_id in user_ids:
        entries = EmissionEntry.objects.filter(user_id=user_id, date=today).select_related('factor__category')

        totals = {'transport': 0.0, 'energy': 0.0, 'food': 0.0, 'waste': 0.0, 'water': 0.0, 'digital': 0.0}
        total_co2 = 0.0

        for entry in entries:
            slug = entry.factor.category.slug
            co2  = float(entry.co2_kg)
            total_co2 += co2
            if slug in totals:
                totals[slug] += co2

        try:
            user = User.objects.get(id=user_id)
            goal = float(user.profile.daily_carbon_goal)
        except Exception:
            goal = 5.0

        DailyEmissionSummary.objects.update_or_create(
            user_id=user_id,
            date=today,
            defaults={
                'total_co2':     round(total_co2, 4),
                'transport_co2': round(totals['transport'], 4),
                'energy_co2':    round(totals['energy'], 4),
                'food_co2':      round(totals['food'], 4),
                'waste_co2':     round(totals['waste'], 4),
                'water_co2':     round(totals['water'], 4),
                'digital_co2':   round(totals['digital'], 4),
                'daily_goal':    goal,
                'goal_achieved': total_co2 <= goal,
                'entry_count':   entries.count(),
            }
        )
        created += 1

        # Bütçe kontrolü
        _check_budget(user_id, total_co2)

    logger.info(f'Günlük özetler oluşturuldu: {created} kullanıcı')
    return {'created': created, 'date': str(today)}


@shared_task
def create_weekly_summaries():
    """
    Her Pazartesi 00:00 — Geçen hafta için WeeklySummary oluştur.
    """
    from apps.analytics.models import DailyEmissionSummary, WeeklySummary
    from django.db.models import Sum, Avg, Count

    today      = date.today()
    # Geçen haftanın Pazartesi → Pazar
    last_mon   = today - timedelta(days=today.weekday() + 7)
    last_sun   = last_mon + timedelta(days=6)

    # Geçen hafta aktif kullanıcılar
    user_ids = DailyEmissionSummary.objects.filter(
        date__range=(last_mon, last_sun)
    ).values_list('user_id', flat=True).distinct()

    for user_id in user_ids:
        agg = DailyEmissionSummary.objects.filter(
            user_id=user_id, date__range=(last_mon, last_sun)
        ).aggregate(
            total=Sum('total_co2'),
            avg=Avg('total_co2'),
            days=Count('id'),
        )

        total     = float(agg['total'] or 0)
        avg_daily = float(agg['avg']   or 0)
        days      = agg['days'] or 0

        # Önceki haftayla karşılaştır
        prev_mon = last_mon - timedelta(weeks=1)
        prev_sun = last_sun - timedelta(weeks=1)
        prev_agg = DailyEmissionSummary.objects.filter(
            user_id=user_id, date__range=(prev_mon, prev_sun)
        ).aggregate(total=Sum('total_co2'))
        prev_total = float(prev_agg['total'] or 0)

        change_pct = None
        if prev_total > 0:
            change_pct = round((total - prev_total) / prev_total * 100, 2)

        WeeklySummary.objects.update_or_create(
            user_id=user_id,
            week_start=last_mon,
            defaults={
                'week_end':    last_sun,
                'total_co2':   round(total, 4),
                'avg_daily':   round(avg_daily, 4),
                'active_days': days,
                'change_pct':  change_pct,
            }
        )

    logger.info(f'Haftalık özetler: {len(user_ids)} kullanıcı, {last_mon} → {last_sun}')
    return {'users': len(user_ids), 'week': str(last_mon)}


def _check_budget(user_id: int, today_co2: float):
    """Aylık bütçeyi güncelle, aşılırsa bildirim gönder."""
    from apps.analytics.models import CarbonBudget
    from apps.users.tasks import send_budget_exceeded_notification
    from django.utils import timezone

    today       = date.today()
    month_start = today.replace(day=1)

    budget = CarbonBudget.objects.filter(user_id=user_id, month=month_start).first()
    if not budget:
        return

    budget.spent_kg = float(budget.spent_kg) + today_co2
    was_exceeded    = budget.is_exceeded

    if float(budget.spent_kg) > float(budget.budget_kg):
        budget.is_exceeded = True
        if not was_exceeded:
            budget.exceeded_at = timezone.now()
            # Bildirim gönder (ilk kez aşıldığında)
            send_budget_exceeded_notification.delay(user_id)

    budget.save()
