"""
AI Servis Testleri
Çalıştırma: python manage.py test apps.ai_features
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from datetime import date, timedelta

from apps.ai_features.services import (
    calculate_carbon_dna,
    calculate_time_projection,
    predict_missing_day,
    analyze_emotion_correlation,
    _generate_dna_sequence,
    _calculate_trend,
)

User = get_user_model()


def make_user():
    from apps.users.models import UserProfile
    from apps.gamification.models import UserXP, Streak
    from apps.market.models import CarbonCredit
    user = User.objects.create_user(
        email='aitest@ahievran.edu.tr', password='testpass',
        first_name='AI', last_name='Test'
    )
    UserProfile.objects.get_or_create(user=user)
    UserXP.objects.get_or_create(user=user)
    Streak.objects.get_or_create(user=user)
    CarbonCredit.objects.get_or_create(user=user)
    return user


class CarbonDNATest(TestCase):

    def setUp(self):
        self.user = make_user()

    def test_dna_returns_all_categories(self):
        """DNA sonucu 6 kategorinin tamamını içermeli."""
        result = calculate_carbon_dna(self.user)
        for cat in ['transport', 'energy', 'food', 'waste', 'water', 'digital']:
            self.assertIn(cat, result['scores'])

    def test_dna_scores_in_range(self):
        """Tüm skorlar 0-100 arasında olmalı."""
        result = calculate_carbon_dna(self.user)
        for score in result['scores'].values():
            self.assertGreaterEqual(score, 0)
            self.assertLessEqual(score, 100)

    def test_dna_sequence_length(self):
        """DNA sekansı 24 karakter olmalı."""
        seq = _generate_dna_sequence({'transport': 70, 'energy': 30, 'food': 55, 'waste': 20, 'water': 10, 'digital': 80})
        self.assertEqual(len(seq), 24)

    def test_dna_sequence_deterministic(self):
        """Aynı skorlar aynı sekansı üretmeli."""
        scores = {'transport': 60, 'energy': 40, 'food': 50, 'waste': 30, 'water': 20, 'digital': 70}
        seq1 = _generate_dna_sequence(scores)
        seq2 = _generate_dna_sequence(scores)
        self.assertEqual(seq1, seq2)

    def test_profile_type_present(self):
        """Profil tipi döndürülmeli."""
        result = calculate_carbon_dna(self.user)
        self.assertIn('profile_type', result)
        self.assertIsNotNone(result['profile_type'])


class TimeProjectionTest(TestCase):

    def setUp(self):
        self.user = make_user()

    def test_projection_returns_11_years(self):
        """0-10 yıl = 11 nokta döndürülmeli."""
        result = calculate_time_projection(self.user)
        self.assertEqual(len(result['projections']), 11)

    def test_projection_has_three_scenarios(self):
        """Her yıl için 3 senaryo olmalı."""
        result = calculate_time_projection(self.user)
        for p in result['projections']:
            self.assertIn('optimistic',  p)
            self.assertIn('realistic',   p)
            self.assertIn('pessimistic', p)

    def test_optimistic_less_than_pessimistic(self):
        """İyimser senaryo kötümsenden az olmalı (yıl 5+)."""
        result = calculate_time_projection(self.user)
        for p in result['projections'][5:]:
            self.assertLessEqual(p['optimistic'], p['pessimistic'])

    def test_trend_calculation(self):
        """Eğim hesaplaması: artan veri seti pozitif dönmeli."""
        summaries = [{'date': date.today() - timedelta(days=i), 'total_co2': 10 + i} for i in range(10, -1, -1)]
        trend = _calculate_trend(summaries)
        self.assertGreater(trend, 0)


class CarbonMemoryTest(TestCase):

    def setUp(self):
        self.user = make_user()

    def test_predict_empty_history_returns_zero(self):
        """Geçmiş veri yoksa tahmin 0 olmalı."""
        result = predict_missing_day(self.user, date.today() - timedelta(days=5))
        self.assertEqual(result['predicted_co2'], 0.0)
        self.assertEqual(result['confidence'], 0.0)


class EmotionCorrelationTest(TestCase):

    def setUp(self):
        self.user = make_user()

    def test_insufficient_data(self):
        """3'ten az kayıt varsa correlation None olmalı."""
        result = analyze_emotion_correlation(self.user)
        self.assertIsNone(result['correlation'])

    def test_correlation_range(self):
        """Korelasyon -1 ile 1 arasında olmalı."""
        from apps.ai_features.models import CarbonEmotion
        moods = ['great', 'good', 'neutral', 'bad', 'great', 'good', 'neutral']
        cos   = [2.0,     3.0,    5.0,      7.0,   1.5,   4.0,    6.0     ]
        for i, (mood, co2) in enumerate(zip(moods, cos)):
            CarbonEmotion.objects.create(
                user=self.user,
                date=date.today() - timedelta(days=i),
                mood=mood,
                co2_that_day=co2
            )
        result = analyze_emotion_correlation(self.user, days=30)
        if result['correlation'] is not None:
            self.assertGreaterEqual(result['correlation'], -1.0)
            self.assertLessEqual(result['correlation'],     1.0)
