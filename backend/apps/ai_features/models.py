from django.db import models
from django.conf import settings


class CarbonDNAProfile(models.Model):
    """
    Kullanıcının karbon DNA profili.
    6 kategori puanından oluşan benzersiz bir 'karbon parmak izi'.
    """
    CARBON_TYPES = [
        ('eco_pioneer',   '🌱 Eko Öncü'),
        ('urban_traveler','🏙️ Kentli Gezgin'),
        ('digital_nomad', '💻 Dijital Göçebe'),
        ('food_focused',  '🍃 Beslenme Odaklı'),
        ('energy_saver',  '⚡ Enerji Tasarrufu'),
        ('balanced',      '⚖️ Dengeli'),
    ]

    user            = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='carbon_dna')
    profile_type    = models.CharField(max_length=20, choices=CARBON_TYPES, default='balanced')

    # 0-100 arası segment skorları
    transport_score = models.PositiveSmallIntegerField(default=0)
    energy_score    = models.PositiveSmallIntegerField(default=0)
    food_score      = models.PositiveSmallIntegerField(default=0)
    waste_score     = models.PositiveSmallIntegerField(default=0)
    water_score     = models.PositiveSmallIntegerField(default=0)
    digital_score   = models.PositiveSmallIntegerField(default=0)

    # Benzersiz DNA kodu (görsel temsil için harf dizisi)
    dna_sequence    = models.CharField(max_length=24, blank=True)

    calculated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Karbon DNA Profili'

    def __str__(self):
        return f'{self.user.get_full_name()} | {self.get_profile_type_display()}'

    @property
    def scores(self):
        return {
            'transport': self.transport_score,
            'energy':    self.energy_score,
            'food':      self.food_score,
            'waste':     self.waste_score,
            'water':     self.water_score,
            'digital':   self.digital_score,
        }


class CarbonTwinScenario(models.Model):
    """
    Karbon İkizi: Alternatif yaşam tarzı senaryosu.
    Kullanıcının mevcut alışkanlıklarını değiştirmesi durumunda
    ne kadar CO2 tasarrufu yapabileceğini simüle eder.
    """
    user            = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='twin_scenarios')
    name            = models.CharField(max_length=100)
    description     = models.TextField()

    # Orijinal ve senaryo değerleri (aylık kg CO2)
    current_monthly = models.DecimalField(max_digits=8, decimal_places=2)
    scenario_monthly = models.DecimalField(max_digits=8, decimal_places=2)

    # Senaryo varsayımları (JSON)
    assumptions     = models.JSONField(default=dict)

    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Karbon İkizi Senaryosu'
        ordering     = ['-created_at']

    @property
    def monthly_saving(self):
        return float(self.current_monthly) - float(self.scenario_monthly)

    @property
    def saving_pct(self):
        if self.current_monthly == 0:
            return 0
        return round(self.monthly_saving / float(self.current_monthly) * 100, 1)

    def __str__(self):
        return f'{self.user.get_full_name()} | {self.name} | -{self.saving_pct}%'


class TimeProjection(models.Model):
    """
    Zaman Makinesi: 10 yıllık karbon projeksiyonu.
    Üç senaryo: iyimser, gerçekçi, kötümser
    """
    user        = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='time_projection')

    # Yıllık projeksiyon verileri (JSON liste)
    # {'year': 2026, 'optimistic': 1200, 'realistic': 1500, 'pessimistic': 1900}
    projections = models.JSONField(default=list)

    baseline_annual = models.DecimalField(max_digits=10, decimal_places=2, help_text='Başlangıç yıllık kg CO2')
    calculated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Zaman Projeksiyonu'

    def __str__(self):
        return f'{self.user.get_full_name()} | {self.calculated_at.strftime("%d.%m.%Y")} projeksiyonu'


class CarbonMemory(models.Model):
    """
    Karbon Hafıza: Eksik günler için AI tahmini.
    K-NN algoritması ile geçmiş verilere dayalı tahmin.
    """
    STATUS_CHOICES = [
        ('pending',   'Onay Bekliyor'),
        ('accepted',  'Onaylandı'),
        ('rejected',  'Reddedildi'),
    ]

    user            = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='carbon_memories')
    missing_date    = models.DateField()
    predicted_co2   = models.DecimalField(max_digits=8, decimal_places=4)
    confidence      = models.DecimalField(max_digits=4, decimal_places=2, help_text='0-1 arası güven skoru')
    similar_days    = models.JSONField(default=list, help_text='Referans alınan benzer günler')
    status          = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Karbon Hafıza Tahmini'
        unique_together = ['user', 'missing_date']
        ordering = ['-missing_date']

    def __str__(self):
        return f'{self.user.get_full_name()} | {self.missing_date} | {self.predicted_co2} kg (güven: {self.confidence})'


class CarbonEmotion(models.Model):
    """
    Karbon Duyguları: Emisyon-duygu korelasyon kaydı.
    """
    MOOD_CHOICES = [
        ('great',   '😄 Harika'),
        ('good',    '🙂 İyi'),
        ('neutral', '😐 Nötr'),
        ('bad',     '😟 Kötü'),
        ('terrible','😢 Berbat'),
    ]

    user      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='carbon_emotions')
    date      = models.DateField()
    mood      = models.CharField(max_length=10, choices=MOOD_CHOICES)
    note      = models.CharField(max_length=200, blank=True)
    co2_that_day = models.DecimalField(max_digits=8, decimal_places=4, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Karbon Duygusu'
        unique_together = ['user', 'date']
        ordering = ['-date']

    def __str__(self):
        return f'{self.user.get_full_name()} | {self.date} | {self.get_mood_display()}'
