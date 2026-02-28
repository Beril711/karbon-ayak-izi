from django.db import models
from django.conf import settings
from django.utils import timezone


class Badge(models.Model):
    """Kazanılabilir rozetler."""

    TRIGGER_CHOICES = [
        ('entry_count',      'Emisyon Girişi Sayısı'),
        ('streak_days',      'Seri Gün Sayısı'),
        ('goal_achieved',    'Hedef Tutturma'),
        ('co2_saved',        'CO2 Tasarrufu (kg)'),
        ('category_mastery', 'Kategori Uzmanlığı'),
        ('leaderboard_top',  'Liderboard Sıralaması'),
        ('first_entry',      'İlk Giriş'),
        ('weekly_champion',  'Haftalık Şampiyon'),
        ('special',          'Özel'),
    ]

    TIER_CHOICES = [
        ('bronze',   '🥉 Bronz'),
        ('silver',   '🥈 Gümüş'),
        ('gold',     '🥇 Altın'),
        ('platinum', '💎 Platin'),
    ]

    slug        = models.SlugField(unique=True)
    name        = models.CharField(max_length=80)
    name_tr     = models.CharField(max_length=80)
    description = models.TextField()
    description_tr = models.TextField()
    icon        = models.CharField(max_length=10)
    tier        = models.CharField(max_length=10, choices=TIER_CHOICES, default='bronze')
    xp_reward   = models.PositiveSmallIntegerField(default=50)
    trigger     = models.CharField(max_length=30, choices=TRIGGER_CHOICES)
    # Tetikleyici eşik değeri (örn: 7 gün seri için 7)
    threshold   = models.PositiveIntegerField(default=1)
    is_active   = models.BooleanField(default=True)

    class Meta:
        verbose_name        = 'Rozet'
        verbose_name_plural = 'Rozetler'
        ordering            = ['tier', 'name_tr']

    def __str__(self):
        return f'{self.icon} {self.name_tr} ({self.get_tier_display()})'


class UserBadge(models.Model):
    """Kullanıcının kazandığı rozetler."""

    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='badges')
    badge      = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='user_badges')
    earned_at  = models.DateTimeField(default=timezone.now)
    is_new     = models.BooleanField(default=True)   # Bildirim gönderilmeden önce True

    class Meta:
        verbose_name        = 'Kullanıcı Rozeti'
        verbose_name_plural = 'Kullanıcı Rozetleri'
        unique_together     = ['user', 'badge']
        ordering            = ['-earned_at']

    def __str__(self):
        return f'{self.user.get_full_name()} → {self.badge.name_tr}'


class UserXP(models.Model):
    """Kullanıcının toplam XP ve seviye durumu."""

    LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 7000, 11000, 16000, 25000]

    user        = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='xp')
    total_xp    = models.PositiveIntegerField(default=0)
    level       = models.PositiveSmallIntegerField(default=1)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Kullanıcı XP'
        verbose_name_plural = 'Kullanıcı XP\'leri'

    def __str__(self):
        return f'{self.user.get_full_name()} | Seviye {self.level} | {self.total_xp} XP'

    def add_xp(self, amount: int, reason: str = ''):
        """XP ekle ve seviye kontrolü yap."""
        self.total_xp += amount
        new_level = self._calculate_level()
        leveled_up = new_level > self.level
        self.level = new_level
        self.save()

        # XP geçmişine kaydet
        XPTransaction.objects.create(user=self.user, amount=amount, reason=reason)

        return leveled_up, new_level

    def _calculate_level(self):
        for i, threshold in enumerate(reversed(self.LEVEL_THRESHOLDS)):
            if self.total_xp >= threshold:
                return len(self.LEVEL_THRESHOLDS) - i
        return 1

    @property
    def xp_to_next_level(self):
        if self.level >= len(self.LEVEL_THRESHOLDS):
            return 0
        return self.LEVEL_THRESHOLDS[self.level] - self.total_xp


class XPTransaction(models.Model):
    """XP kazanım geçmişi."""

    REASON_CHOICES = [
        ('emission_entry', 'Emisyon Girişi (+10 XP)'),
        ('goal_achieved',  'Günlük Hedef (+50 XP)'),
        ('streak_bonus',   'Seri Bonusu'),
        ('badge_earned',   'Rozet Kazanımı'),
        ('weekly_top',     'Haftalık Liderboard'),
        ('first_entry',    'İlk Giriş (+100 XP)'),
        ('other',          'Diğer'),
    ]

    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='xp_transactions')
    amount     = models.IntegerField()
    reason     = models.CharField(max_length=30, choices=REASON_CHOICES, default='other')
    note       = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        sign = '+' if self.amount >= 0 else ''
        return f'{self.user.get_full_name()} | {sign}{self.amount} XP | {self.get_reason_display()}'


class Streak(models.Model):
    """Kullanıcının günlük seri takibi."""

    user            = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='streak')
    current_streak  = models.PositiveSmallIntegerField(default=0)
    longest_streak  = models.PositiveSmallIntegerField(default=0)
    last_entry_date = models.DateField(null=True, blank=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Seri'
        verbose_name_plural = 'Seriler'

    def __str__(self):
        return f'{self.user.get_full_name()} | {self.current_streak} gün seri'

    def record_entry(self, entry_date):
        """Bugün giriş yapıldı, seriyi güncelle."""
        from datetime import date, timedelta
        today = entry_date

        if self.last_entry_date is None:
            # İlk giriş
            self.current_streak = 1
        elif self.last_entry_date == today:
            # Aynı gün tekrar giriş, değişiklik yok
            return False
        elif self.last_entry_date == today - timedelta(days=1):
            # Dün giriş yapılmış, seri devam ediyor
            self.current_streak += 1
        else:
            # Seri kırıldı
            self.current_streak = 1

        self.last_entry_date = today
        if self.current_streak > self.longest_streak:
            self.longest_streak = self.current_streak
        self.save()
        return True

    def reset(self):
        """Seri sıfırla (Celery görevi ile tetiklenir)."""
        self.current_streak = 0
        self.save()


class WeeklyLeaderboard(models.Model):
    """Haftalık liderboard kaydı."""

    user        = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='leaderboard_entries')
    week_start  = models.DateField()
    total_co2   = models.DecimalField(max_digits=10, decimal_places=4)
    rank        = models.PositiveSmallIntegerField()
    xp_earned   = models.PositiveSmallIntegerField(default=0)

    class Meta:
        verbose_name        = 'Haftalık Liderboard'
        verbose_name_plural = 'Haftalık Liderboard Kayıtları'
        unique_together     = ['user', 'week_start']
        ordering            = ['week_start', 'rank']

    def __str__(self):
        return f'{self.week_start} | #{self.rank} {self.user.get_full_name()}'
