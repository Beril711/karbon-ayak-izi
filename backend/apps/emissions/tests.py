"""
Backend Unit Testleri — Emisyon Modülü
Çalıştırma: python manage.py test apps.emissions
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, timedelta
from decimal import Decimal

from apps.emissions.models import EmissionCategory, EmissionFactor, EmissionEntry
from apps.users.models import UserProfile

User = get_user_model()


def make_user(email='test@ahievran.edu.tr', password='testpass123'):
    user = User.objects.create_user(email=email, password=password, first_name='Test', last_name='Kullanıcı')
    UserProfile.objects.get_or_create(user=user)
    return user


def make_category(slug='transport'):
    return EmissionCategory.objects.get_or_create(
        slug=slug,
        defaults={'name': slug.title(), 'name_tr': slug.title(), 'order': 1}
    )[0]


def make_factor(category, name='Otobüs', co2=0.089, unit='km'):
    return EmissionFactor.objects.get_or_create(
        category=category, name=name,
        defaults={'name_tr': name, 'co2_per_unit': co2, 'unit': unit}
    )[0]


class EmissionCategoryAPITest(TestCase):

    def test_category_list_unauthenticated(self):
        """Kategoriler auth gerektirmez."""
        make_category()
        res = APIClient().get('/api/v1/emissions/categories/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_category_list_returns_active_only(self):
        """Sadece aktif kategoriler listelenmeli."""
        cat_active   = make_category('transport')
        cat_inactive = EmissionCategory.objects.create(slug='test_inactive', name='Test', name_tr='Test', is_active=False, order=99)
        res = APIClient().get('/api/v1/emissions/categories/')
        slugs = [c['slug'] for c in res.data]
        self.assertIn('transport', slugs)
        self.assertNotIn('test_inactive', slugs)


class EmissionEntryAPITest(TestCase):

    def setUp(self):
        self.user    = make_user()
        self.client  = APIClient()
        self.client.force_authenticate(user=self.user)
        cat          = make_category()
        self.factor  = make_factor(cat)

    def test_create_entry_success(self):
        """Geçerli giriş başarıyla oluşturulmalı."""
        data = {'factor': self.factor.id, 'quantity': 10.0, 'date': str(date.today())}
        res  = self.client.post('/api/v1/emissions/entries/', data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('co2_kg', res.data)
        self.assertGreater(float(res.data['co2_kg']), 0)

    def test_co2_calculation(self):
        """CO₂ = miktar × faktör olmalı."""
        qty  = 15.0
        data = {'factor': self.factor.id, 'quantity': qty, 'date': str(date.today())}
        res  = self.client.post('/api/v1/emissions/entries/', data)
        expected = round(qty * float(self.factor.co2_per_unit), 4)
        self.assertAlmostEqual(float(res.data['co2_kg']), expected, places=3)

    def test_future_date_rejected(self):
        """Gelecek tarihli giriş reddedilmeli."""
        future = str(date.today() + timedelta(days=1))
        data   = {'factor': self.factor.id, 'quantity': 5.0, 'date': future}
        res    = self.client.post('/api/v1/emissions/entries/', data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_cannot_create(self):
        """Auth gerektiren endpoint anonim kullanıcıya kapalı."""
        data = {'factor': self.factor.id, 'quantity': 5.0, 'date': str(date.today())}
        res  = APIClient().post('/api/v1/emissions/entries/', data)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_returns_only_own_entries(self):
        """Kullanıcı sadece kendi girişlerini görmeli."""
        other = make_user('other@ahievran.edu.tr')
        EmissionEntry.objects.create(user=other, factor=self.factor, quantity=5, co2_kg=0.445, date=date.today())
        EmissionEntry.objects.create(user=self.user, factor=self.factor, quantity=10, co2_kg=0.89, date=date.today())

        res = self.client.get('/api/v1/emissions/entries/')
        ids = [e['id'] for e in (res.data.get('results') or res.data)]
        # Yalnızca kendi girişi
        self.assertEqual(len(ids), 1)

    def test_delete_own_entry(self):
        """Kendi girişini silebilmeli."""
        entry = EmissionEntry.objects.create(user=self.user, factor=self.factor, quantity=5, co2_kg=0.445, date=date.today())
        res   = self.client.delete(f'/api/v1/emissions/entries/{entry.id}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)


class TodaySummaryTest(TestCase):

    def setUp(self):
        self.user   = make_user()
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        cat = make_category()
        self.factor = make_factor(cat)

    def test_today_summary_empty(self):
        """Giriş yoksa toplam 0 olmalı."""
        res = self.client.get('/api/v1/emissions/today/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['total_co2'], 0)

    def test_today_summary_sums_correctly(self):
        """Bugünkü girişlerin toplamı doğru olmalı."""
        today = date.today()
        EmissionEntry.objects.create(user=self.user, factor=self.factor, quantity=10, co2_kg=Decimal('0.890'), date=today)
        EmissionEntry.objects.create(user=self.user, factor=self.factor, quantity=5,  co2_kg=Decimal('0.445'), date=today)
        res = self.client.get('/api/v1/emissions/today/')
        self.assertAlmostEqual(res.data['total_co2'], 1.335, places=2)
