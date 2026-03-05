"""
Backend Unit Testleri
Çalıştırma: python manage.py test apps.emissions apps.gamification apps.ai_features
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, timedelta
from decimal import Decimal

User = get_user_model()


class BaseTestCase(TestCase):
    """Ortak test altyapısı."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@ahievran.edu.tr',
            password='testpass123',
            first_name='Test',
            last_name='Kullanıcı',
        )
        # İlgili nesneleri oluştur
        from apps.users.models import UserProfile
        from apps.gamification.models import UserXP, Streak
        from apps.market.models import CarbonCredit
        UserProfile.objects.get_or_create(user=self.user)
        UserXP.objects.get_or_create(user=self.user)
        Streak.objects.get_or_create(user=self.user)
        CarbonCredit.objects.get_or_create(user=self.user)

        self.client.force_authenticate(user=self.user)


# ── AUTH TESTLERİ ─────────────────────────────────────────────────────────────

class RegisterTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_success(self):
        """Geçerli üniversite emailiyle kayıt."""
        res = self.client.post('/api/v1/auth/register/', {
            'email':            'yeni@ahievran.edu.tr',
            'first_name':       'Ali',
            'last_name':        'Yılmaz',
            'password':         'gucluSifre123',
            'password_confirm': 'gucluSifre123',
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', res.data)
        self.assertIn('access', res.data['tokens'])

    def test_register_invalid_domain(self):
        """Üniversite dışı email reddedilmeli."""
        res = self.client.post('/api/v1/auth/register/', {
            'email':            'kisi@gmail.com',
            'first_name':       'Ali',
            'last_name':        'Yılmaz',
            'password':         'gucluSifre123',
            'password_confirm': 'gucluSifre123',
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_password_mismatch(self):
        """Şifre uyuşmazlığı hatası."""
        res = self.client.post('/api/v1/auth/register/', {
            'email':            'test2@ahievran.edu.tr',
            'first_name':       'Ali',
            'last_name':        'Yılmaz',
            'password':         'sifre123',
            'password_confirm': 'farkliSifre',
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


# ── EMİSYON TESTLERİ ─────────────────────────────────────────────────────────

class EmissionCategoryTests(BaseTestCase):

    def test_category_list_public(self):
        """Kategoriler auth olmadan görüntülenebilmeli."""
        self.client.force_authenticate(user=None)
        from apps.emissions.models import EmissionCategory
        EmissionCategory.objects.create(slug='transport', name='Transport', name_tr='Ulaşım', order=1)

        res = self.client.get('/api/v1/emissions/categories/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data), 1)


class EmissionEntryTests(BaseTestCase):

    def setUp(self):
        super().setUp()
        from apps.emissions.models import EmissionCategory, EmissionFactor

        cat = EmissionCategory.objects.create(
            slug='transport', name='Transport', name_tr='Ulaşım', order=1
        )
        self.factor = EmissionFactor.objects.create(
            category=cat,
            name='Car petrol',
            name_tr='Otomobil (Benzinli)',
            co2_per_unit=Decimal('0.171'),
            unit='km',
        )

    def test_create_entry(self):
        """Emisyon girişi ekleme ve CO₂ hesabı."""
        res = self.client.post('/api/v1/emissions/entries/', {
            'factor':   self.factor.id,
            'quantity': 10,
            'date':     date.today().isoformat(),
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        # 10 km × 0.171 = 1.71 kg CO₂
        self.assertAlmostEqual(float(res.data['co2_kg']), 1.71, places=2)

    def test_future_date_rejected(self):
        """Gelecek tarihli giriş reddedilmeli."""
        future = (date.today() + timedelta(days=1)).isoformat()
        res = self.client.post('/api/v1/emissions/entries/', {
            'factor':   self.factor.id,
            'quantity': 5,
            'date':     future,
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_entries_only_own(self):
        """Kullanıcı sadece kendi girişlerini görmeli."""
        other_user = User.objects.create_user(
            email='other@ahievran.edu.tr', password='pass123',
            first_name='Diğer', last_name='Kullanıcı',
        )
        from apps.emissions.models import EmissionEntry
        EmissionEntry.objects.create(
            user=other_user, factor=self.factor,
            quantity=5, co2_kg=0.855, date=date.today()
        )
        res = self.client.get('/api/v1/emissions/entries/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # Diğer kullanıcının girişi görünmemeli
        data = res.data.get('results', res.data)
        for entry in data:
            self.assertNotEqual(entry.get('user'), other_user.id)

    def test_today_summary(self):
        """Bugünkü özet endpoint'i doğru veri döndürmeli."""
        from apps.emissions.models import EmissionEntry
        EmissionEntry.objects.create(
            user=self.user, factor=self.factor,
            quantity=20, co2_kg=Decimal('3.42'), date=date.today()
        )
        res = self.client.get('/api/v1/emissions/today/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreater(res.data['total_co2'], 0)
        self.assertIn('by_category', res.data)


# ── GAMİFİCATİON TESTLERİ ────────────────────────────────────────────────────

class GamificationTests(BaseTestCase):

    def test_xp_add(self):
        """XP ekleme ve seviye hesabı."""
        from apps.gamification.models import UserXP
        xp = UserXP.objects.get(user=self.user)
        xp.add_xp(100, 'test')
        self.assertEqual(xp.total_xp, 100)
        self.assertGreaterEqual(xp.level, 1)

    def test_streak_record(self):
        """Ardışık giriş seri sayacını artırmalı."""
        from apps.gamification.models import Streak
        streak = Streak.objects.get(user=self.user)

        today     = date.today()
        yesterday = today - timedelta(days=1)

        streak.record_entry(yesterday)
        self.assertEqual(streak.current_streak, 1)

        streak.record_entry(today)
        self.assertEqual(streak.current_streak, 2)
        self.assertEqual(streak.longest_streak, 2)

    def test_streak_reset_on_skip(self):
        """Gün atlandığında seri sıfırlanmalı."""
        from apps.gamification.models import Streak
        streak = Streak.objects.get(user=self.user)

        three_days_ago = date.today() - timedelta(days=3)
        streak.record_entry(three_days_ago)
        self.assertEqual(streak.current_streak, 1)

        # Bugün giriş yap (2 gün atlandı → seri sıfırlanır)
        streak.record_entry(date.today())
        self.assertEqual(streak.current_streak, 1)

    def test_gamification_status_endpoint(self):
        """Gamification durum endpoint'i doğru çalışmalı."""
        res = self.client.get('/api/v1/gamification/status/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('xp', res.data)
        self.assertIn('streak', res.data)
        self.assertIn('level', res.data['xp'])

    def test_leaderboard_endpoint(self):
        """Liderboard endpoint'i hata vermemeli."""
        res = self.client.get('/api/v1/gamification/leaderboard/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('top10', res.data)
        self.assertIn('week_start', res.data)


# ── ANALİTİK TESTLERİ ────────────────────────────────────────────────────────

class AnalyticsTests(BaseTestCase):

    def test_budget_set_and_get(self):
        """Bütçe oluşturma ve okuma."""
        # Bütçe belirle
        res = self.client.put('/api/v1/analytics/budget/', {'budget_kg': 150})
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Bütçeyi oku
        res = self.client.get('/api/v1/analytics/budget/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(float(res.data['budget_kg']), 150.0)

    def test_weekly_chart_empty(self):
        """Veri yokken haftalık grafik sıfır döndürmeli."""
        res = self.client.get('/api/v1/analytics/chart/weekly/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 7)
        for day in res.data:
            self.assertEqual(day['total'], 0)
