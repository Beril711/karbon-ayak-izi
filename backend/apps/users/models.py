from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone
from django.conf import settings


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('E-posta zorunludur.')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """
    E-posta tabanlı kullanıcı modeli.
    Sadece üniversite e-posta adreslerine izin verilir.
    """
    ROLE_CHOICES = [
        ('student', 'Öğrenci'),
        ('staff',   'Personel'),
        ('admin',   'Yönetici'),
    ]

    email        = models.EmailField(unique=True, verbose_name='E-posta')
    first_name   = models.CharField(max_length=60, verbose_name='Ad')
    last_name    = models.CharField(max_length=60, verbose_name='Soyad')
    role         = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    university   = models.CharField(max_length=120, blank=True, verbose_name='Üniversite')
    is_active    = models.BooleanField(default=True)
    is_staff     = models.BooleanField(default=False)
    date_joined  = models.DateTimeField(default=timezone.now)
    fcm_token    = models.TextField(blank=True, verbose_name='FCM Token')

    objects = CustomUserManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        verbose_name        = 'Kullanıcı'
        verbose_name_plural = 'Kullanıcılar'
        ordering            = ['-date_joined']

    def __str__(self):
        return f'{self.get_full_name()} <{self.email}>'

    def get_full_name(self):
        return f'{self.first_name} {self.last_name}'.strip()

    @property
    def university_domain(self):
        return self.email.split('@')[-1] if '@' in self.email else ''

    def is_university_email(self):
        return any(
            self.university_domain.endswith(domain)
            for domain in settings.ALLOWED_UNIVERSITY_DOMAINS
        )


class UserProfile(models.Model):
    """Kullanıcı profil detayları — OneToOne ile CustomUser'a bağlı."""

    FACULTY_CHOICES = [
        ('engineering',  'Mühendislik'),
        ('science',      'Fen-Edebiyat'),
        ('health',       'Sağlık Bilimleri'),
        ('economics',    'İktisadi İdari Bilimler'),
        ('education',    'Eğitim'),
        ('vocational',   'Meslek Yüksekokulu'),
        ('other',        'Diğer'),
    ]

    user           = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    avatar         = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio            = models.TextField(blank=True, max_length=300)
    faculty        = models.CharField(max_length=20, choices=FACULTY_CHOICES, blank=True)
    department     = models.CharField(max_length=100, blank=True)
    student_number = models.CharField(max_length=20, blank=True)
    phone          = models.CharField(max_length=15, blank=True)
    # Karbon hedefi (kg CO2/gün)
    daily_carbon_goal   = models.DecimalField(max_digits=6, decimal_places=2, default=5.00)
    # Bildirim tercihleri
    notify_daily        = models.BooleanField(default=True)
    notify_streak       = models.BooleanField(default=True)
    notify_budget       = models.BooleanField(default=True)
    notify_leaderboard  = models.BooleanField(default=True)
    # Gizlilik
    is_public           = models.BooleanField(default=True, verbose_name='Profil herkese açık')
    # Bio-sync
    health_sync_enabled = models.BooleanField(default=False)
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Kullanıcı Profili'
        verbose_name_plural = 'Kullanıcı Profilleri'

    def __str__(self):
        return f'{self.user.get_full_name()} profili'
