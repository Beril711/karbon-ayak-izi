"""
Market Testleri — Cüzdan ve Akıllı Sözleşmeler
Çalıştırma: python manage.py test apps.market
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, timedelta

from apps.market.models import CarbonCredit, SmartContract, ContractParticipant
from apps.users.models import UserProfile
from apps.gamification.models import UserXP, Streak

User = get_user_model()


def make_user(email='test@ahievran.edu.tr'):
    user = User.objects.create_user(
        email=email, password='testpass123',
        first_name='Test', last_name='Kullanıcı'
    )
    UserProfile.objects.get_or_create(user=user)
    UserXP.objects.get_or_create(user=user)
    Streak.objects.get_or_create(user=user)
    CarbonCredit.objects.get_or_create(user=user)
    return user


def make_contract(creator, status='open', max_p=5):
    today = date.today()
    return SmartContract.objects.create(
        creator=creator,
        title='Test Sözleşmesi',
        description='Test',
        target_co2_reduction_pct=20,
        duration_days=30,
        max_participants=max_p,
        reward_per_participant=100,
        start_date=today,
        end_date=today + timedelta(days=30),
        status=status,
    )


class WalletAPITest(TestCase):

    def setUp(self):
        self.user   = make_user()
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_wallet_returns_balance(self):
        res = self.client.get('/api/v1/market/wallet/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('balance', res.data)

    def test_wallet_default_zero(self):
        res = self.client.get('/api/v1/market/wallet/')
        self.assertEqual(float(res.data['balance']), 0.0)

    def test_unauthenticated_blocked(self):
        res = APIClient().get('/api/v1/market/wallet/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class SmartContractAPITest(TestCase):

    def setUp(self):
        self.creator = make_user('creator@ahievran.edu.tr')
        self.user2   = make_user('user2@ahievran.edu.tr')
        self.client  = APIClient()
        self.client.force_authenticate(user=self.creator)

    def test_list_open_contracts(self):
        make_contract(self.creator)
        res = self.client.get('/api/v1/market/contracts/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_create_contract_success(self):
        today = date.today()
        data  = {
            'title':                    'Yeni Sözleşme',
            'description':              'Açıklama',
            'target_co2_reduction_pct': 15,
            'duration_days':            30,
            'max_participants':         5,
            'reward_per_participant':   100,
            'start_date':               str(today),
            'end_date':                 str(today + timedelta(days=30)),
        }
        res = self.client.post('/api/v1/market/contracts/', data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_create_contract_invalid_dates(self):
        today = date.today()
        data  = {
            'title': 'Geçersiz', 'description': 'x',
            'target_co2_reduction_pct': 10, 'duration_days': 30,
            'max_participants': 5, 'reward_per_participant': 50,
            'start_date': str(today + timedelta(days=5)),
            'end_date':   str(today),  # bitiş başlangıçtan önce
        }
        res = self.client.post('/api/v1/market/contracts/', data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_join_contract(self):
        contract = make_contract(self.creator)
        c2 = APIClient()
        c2.force_authenticate(user=self.user2)
        res = c2.post(f'/api/v1/market/contracts/{contract.id}/join/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(ContractParticipant.objects.filter(contract=contract, user=self.user2).exists())

    def test_join_twice_rejected(self):
        contract = make_contract(self.creator)
        ContractParticipant.objects.create(contract=contract, user=self.user2, baseline_co2=100)
        c2 = APIClient()
        c2.force_authenticate(user=self.user2)
        res = c2.post(f'/api/v1/market/contracts/{contract.id}/join/')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_join_full_contract_rejected(self):
        contract = make_contract(self.creator, max_p=1)
        # Tek kişilik kontenjan creator ile dolu olsun
        ContractParticipant.objects.create(contract=contract, user=self.creator, baseline_co2=100)
        c2 = APIClient()
        c2.force_authenticate(user=self.user2)
        res = c2.post(f'/api/v1/market/contracts/{contract.id}/join/')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_leave_contract(self):
        contract = make_contract(self.creator)
        ContractParticipant.objects.create(contract=contract, user=self.user2, baseline_co2=100)
        c2 = APIClient()
        c2.force_authenticate(user=self.user2)
        res = c2.post(f'/api/v1/market/contracts/{contract.id}/leave/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(ContractParticipant.objects.filter(contract=contract, user=self.user2).exists())
