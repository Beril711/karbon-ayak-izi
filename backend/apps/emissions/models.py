from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
import uuid


class EmissionCategory(models.Model):
    """
    6 ana emisyon kategorisi:
    transport, energy, food, waste, water, digital
    """
    CATEGORY_ICONS = {
        'transport': '🚗',
        'energy':    '⚡',
        'food':      '🍽️',
        'waste':     '♻️',
        'water':     '💧',
        'digital':   '💻',
    }

    slug        = models.SlugField(unique=True, max_length=30)
    name        = models.CharField(max_length=60)
    name_tr     = models.CharField(max_length=60, verbose_name='Ad (Türkçe)')
    description = models.TextField(blank=True)
    icon        = models.CharField(max_length=10, blank=True)
    color       = models.CharField(max_length=7, default='#4CAF50', help_text='HEX renk kodu')
    is_active   = models.BooleanField(default=True)
    order       = models.PositiveSmallIntegerField(default=0)

    class Meta:
        verbose_name        = 'Emisyon Kategorisi'
        verbose_name_plural = 'Emisyon Kategorileri'
        ordering            = ['order']

    def __str__(self):
        return self.name_tr


class EmissionFactor(models.Model):
    """
    Birim başına CO2 eşdeğeri (kg CO2e).
    Örn: 'Otobüs' → 0.089 kg CO2e / km
    """
    UNIT_CHOICES = [
        ('km',       'Kilometre'),
        ('kWh',      'Kilowatt-saat'),
        ('kg',       'Kilogram'),
        ('litre',    'Litre'),
        ('piece',    'Adet'),
        ('hour',     'Saat'),
        ('gb',       'Gigabyte'),
        ('minute',   'Dakika'),
    ]

    category   = models.ForeignKey(EmissionCategory, on_delete=models.CASCADE, related_name='factors')
    name       = models.CharField(max_length=100)
    name_tr    = models.CharField(max_length=100, verbose_name='Ad (Türkçe)')
    co2_per_unit = models.DecimalField(
        max_digits=10, decimal_places=6,
        validators=[MinValueValidator(0)],
        help_text='kg CO2e / birim'
    )
    unit       = models.CharField(max_length=10, choices=UNIT_CHOICES)
    source     = models.CharField(max_length=200, blank=True, help_text='Veri kaynağı')
    is_active  = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Emisyon Faktörü'
        verbose_name_plural = 'Emisyon Faktörleri'
        ordering            = ['category', 'name_tr']
        unique_together     = ['category', 'name']

    def __str__(self):
        return f'{self.name_tr} ({self.co2_per_unit} kg CO2e/{self.unit})'


class EmissionEntry(models.Model):
    """
    Kullanıcının günlük emisyon girişi.
    Her kayıt bir aktiviteyi temsil eder.
    """
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user       = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='emission_entries'
    )
    factor     = models.ForeignKey(EmissionFactor, on_delete=models.PROTECT, related_name='entries')
    quantity   = models.DecimalField(
        max_digits=10, decimal_places=3,
        validators=[MinValueValidator(0.001)],
        help_text='Birim miktarı (örn: 15.5 km)'
    )
    co2_kg     = models.DecimalField(
        max_digits=10, decimal_places=4,
        help_text='Hesaplanan CO2 eşdeğeri (kg)'
    )
    note       = models.CharField(max_length=255, blank=True)
    date       = models.DateField(help_text='Aktivite tarihi')
    created_at = models.DateTimeField(auto_now_add=True)
    # AI tarafından tahmin edilen kayıt mı?
    is_predicted = models.BooleanField(default=False)

    class Meta:
        verbose_name        = 'Emisyon Girişi'
        verbose_name_plural = 'Emisyon Girişleri'
        ordering            = ['-date', '-created_at']
        indexes             = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f'{self.user.get_full_name()} | {self.factor.name_tr} | {self.co2_kg} kg CO2'

    def save(self, *args, **kwargs):
        # CO2 hesaplamasını otomatik yap
        if not self.co2_kg:
            self.co2_kg = self.quantity * self.factor.co2_per_unit
        super().save(*args, **kwargs)
