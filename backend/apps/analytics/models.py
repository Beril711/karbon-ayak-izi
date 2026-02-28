from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
import datetime


class DailyEmissionSummary(models.Model):
    """
    Kullanıcı başına günlük emisyon özeti.
    Celery görevi ile her gece otomatik oluşturulur.
    """
    user       = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='daily_summaries'
    )
    date       = models.DateField()

    # Toplam
    total_co2  = models.DecimalField(max_digits=10, decimal_places=4, default=0)

    # Kategori bazlı dağılım (kg CO2)
    transport_co2 = models.DecimalField(max_digits=8, decimal_places=4, default=0)
    energy_co2    = models.DecimalField(max_digits=8, decimal_places=4, default=0)
    food_co2      = models.DecimalField(max_digits=8, decimal_places=4, default=0)
    waste_co2     = models.DecimalField(max_digits=8, decimal_places=4, default=0)
    water_co2     = models.DecimalField(max_digits=8, decimal_places=4, default=0)
    digital_co2   = models.DecimalField(max_digits=8, decimal_places=4, default=0)

    # Günlük hedefe kıyasla
    daily_goal        = models.DecimalField(max_digits=6, decimal_places=2, default=5.00)
    goal_achieved     = models.BooleanField(default=False)
    entry_count       = models.PositiveSmallIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Günlük Emisyon Özeti'
        verbose_name_plural = 'Günlük Emisyon Özetleri'
        unique_together     = ['user', 'date']
        ordering            = ['-date']
        indexes             = [
            models.Index(fields=['user', '-date']),
        ]

    def __str__(self):
        return f'{self.user.get_full_name()} | {self.date} | {self.total_co2} kg CO2'

    @property
    def category_breakdown(self):
        return {
            'transport': float(self.transport_co2),
            'energy':    float(self.energy_co2),
            'food':      float(self.food_co2),
            'waste':     float(self.waste_co2),
            'water':     float(self.water_co2),
            'digital':   float(self.digital_co2),
        }


class WeeklySummary(models.Model):
    """Haftalık emisyon özeti ve trend analizi."""

    user         = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='weekly_summaries'
    )
    week_start   = models.DateField(help_text='Haftanın başlangıç tarihi (Pazartesi)')
    week_end     = models.DateField(help_text='Haftanın bitiş tarihi (Pazar)')

    total_co2    = models.DecimalField(max_digits=12, decimal_places=4, default=0)
    avg_daily    = models.DecimalField(max_digits=8, decimal_places=4, default=0)
    active_days  = models.PositiveSmallIntegerField(default=0)

    # Bir önceki haftaya göre değişim (%)
    change_pct   = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    # Üniversite ortalamasına kıyasla (%)
    vs_avg_pct   = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = 'Haftalık Özet'
        verbose_name_plural = 'Haftalık Özetler'
        unique_together     = ['user', 'week_start']
        ordering            = ['-week_start']

    def __str__(self):
        return f'{self.user.get_full_name()} | {self.week_start} - {self.week_end}'


class CarbonBudget(models.Model):
    """Kullanıcının aylık karbon bütçesi takibi."""

    user        = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='carbon_budgets'
    )
    month       = models.DateField(help_text='Ayın ilk günü (örn: 2026-02-01)')
    budget_kg   = models.DecimalField(max_digits=8, decimal_places=2)
    spent_kg    = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    is_exceeded = models.BooleanField(default=False)
    exceeded_at = models.DateTimeField(null=True, blank=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Karbon Bütçesi'
        verbose_name_plural = 'Karbon Bütçeleri'
        unique_together     = ['user', 'month']

    @property
    def remaining_kg(self):
        return max(0, float(self.budget_kg) - float(self.spent_kg))

    @property
    def usage_pct(self):
        if self.budget_kg == 0:
            return 0
        return round(float(self.spent_kg) / float(self.budget_kg) * 100, 1)

    def __str__(self):
        return f'{self.user.get_full_name()} | {self.month.strftime("%B %Y")} | %{self.usage_pct}'
