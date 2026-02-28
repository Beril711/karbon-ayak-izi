"""
apps/ai_features/services.py
Tüm AI/ML hesaplama servisleri.
"""
import numpy as np
from datetime import date, timedelta
from django.db.models import Avg

CATEGORY_SLUGS  = ['transport', 'energy', 'food', 'waste', 'water', 'digital']
DNA_CHARS       = 'ACGT'

REFERENCE_DAILY = {
    'transport': 2.5, 'energy': 1.2, 'food': 3.0,
    'waste': 0.4,     'water':  0.1, 'digital': 0.3,
}

SCENARIOS = {
    'public_transport': {
        'name': 'Toplu Taşımaya Geç',
        'description': 'Günlük araç kullanımı yerine otobüs/metro tercih edilirse',
        'adjustments': {'transport': 0.30},
    },
    'vegan_diet': {
        'name': 'Bitkisel Beslenme',
        'description': 'Kırmızı et ve süt ürünleri azaltılırsa',
        'adjustments': {'food': 0.45},
    },
    'renewable_energy': {
        'name': 'Yenilenebilir Enerji',
        'description': 'Güneş/rüzgar enerji paketine geçilirse',
        'adjustments': {'energy': 0.15},
    },
    'digital_minimalism': {
        'name': 'Dijital Minimalizm',
        'description': 'Streaming ve sosyal medya kullanımı yarıya indirilirse',
        'adjustments': {'digital': 0.50},
    },
    'zero_waste': {
        'name': 'Sıfır Atık',
        'description': 'Geri dönüşüm ve kompost uygulanırsa',
        'adjustments': {'waste': 0.20},
    },
}


# ── KARBON DNA ────────────────────────────────────────────────────────────────

def calculate_carbon_dna(user) -> dict:
    from apps.analytics.models import DailyEmissionSummary
    end_date   = date.today()
    start_date = end_date - timedelta(days=29)

    summaries = DailyEmissionSummary.objects.filter(user=user, date__range=(start_date, end_date))
    if not summaries.exists():
        return _empty_dna()

    agg = summaries.aggregate(
        t=Avg('transport_co2'), e=Avg('energy_co2'), f=Avg('food_co2'),
        w=Avg('waste_co2'),     r=Avg('water_co2'),  d=Avg('digital_co2'),
    )
    avgs = {
        'transport': float(agg['t'] or 0), 'energy': float(agg['e'] or 0),
        'food':      float(agg['f'] or 0), 'waste':  float(agg['w'] or 0),
        'water':     float(agg['r'] or 0), 'digital':float(agg['d'] or 0),
    }

    scores = {}
    for cat, avg_val in avgs.items():
        ref   = REFERENCE_DAILY[cat]
        score = int(min(100, max(0, (avg_val / ref) * 50))) if ref > 0 else 0
        scores[cat] = score

    return {
        'scores':       scores,
        'profile_type': _determine_profile_type(scores),
        'dna_sequence': _generate_dna_sequence(scores),
        'period_days':  summaries.count(),
    }


def _determine_profile_type(scores):
    if max(scores.values(), default=0) < 30:
        return 'eco_pioneer'
    dominant = max(scores, key=scores.get)
    return {'transport': 'urban_traveler', 'energy': 'energy_saver',
            'food': 'food_focused', 'digital': 'digital_nomad'}.get(dominant, 'balanced')


def _generate_dna_sequence(scores):
    seq = ''
    for cat in CATEGORY_SLUGS:
        score = scores.get(cat, 0)
        for _ in range(4):
            seq  += DNA_CHARS[min(3, score * 4 // 101)]
            score = (score * 7 + 13) % 101
    return seq


def _empty_dna():
    return {'scores': {c: 0 for c in CATEGORY_SLUGS}, 'profile_type': 'balanced',
            'dna_sequence': 'A' * 24, 'period_days': 0}


# ── KARBON İKİZİ ─────────────────────────────────────────────────────────────

def calculate_carbon_twin(user) -> list:
    from apps.analytics.models import DailyEmissionSummary
    end_date = date.today(); start_date = end_date - timedelta(days=29)

    agg = DailyEmissionSummary.objects.filter(user=user, date__range=(start_date, end_date)).aggregate(
        t=Avg('transport_co2'), e=Avg('energy_co2'), f=Avg('food_co2'),
        w=Avg('waste_co2'),     r=Avg('water_co2'),  d=Avg('digital_co2'), total=Avg('total_co2'),
    )
    if not agg['total']:
        return []

    daily = {'transport': float(agg['t'] or 0), 'energy': float(agg['e'] or 0),
             'food': float(agg['f'] or 0),       'waste':  float(agg['w'] or 0),
             'water': float(agg['r'] or 0),       'digital':float(agg['d'] or 0)}
    current_monthly = float(agg['total'] or 0) * 30

    results = []
    for key, scenario in SCENARIOS.items():
        sc_daily = dict(daily)
        for cat, mult in scenario['adjustments'].items():
            sc_daily[cat] *= mult
        sc_monthly = sum(sc_daily.values()) * 30
        saving     = current_monthly - sc_monthly
        results.append({
            'key': key, 'name': scenario['name'], 'description': scenario['description'],
            'current_monthly': round(current_monthly, 2), 'scenario_monthly': round(sc_monthly, 2),
            'monthly_saving':  round(saving, 2),
            'saving_pct':      round(saving / current_monthly * 100, 1) if current_monthly > 0 else 0,
            'annual_saving':   round(saving * 12, 1),
        })
    results.sort(key=lambda x: x['saving_pct'], reverse=True)
    return results


# ── ZAMAN MAKİNESİ ────────────────────────────────────────────────────────────

def calculate_time_projection(user, years: int = 10) -> dict:
    from apps.analytics.models import WeeklySummary, DailyEmissionSummary
    from sklearn.linear_model import LinearRegression

    summaries = list(WeeklySummary.objects.filter(user=user).order_by('week_start')[:52])
    if len(summaries) < 4:
        avg = DailyEmissionSummary.objects.filter(user=user).aggregate(avg=Avg('total_co2'))
        baseline = float(avg['avg'] or 5.0) * 365
        return _simple_projection(baseline, years)

    totals = np.array([float(s.total_co2) for s in summaries])
    weeks  = np.arange(len(totals)).reshape(-1, 1)
    model  = LinearRegression().fit(weeks, totals)
    annual_trend    = model.coef_[0] * 52
    baseline_annual = float(totals.mean()) * 52

    current_year = date.today().year
    projections  = []
    for i in range(years + 1):
        projections.append({
            'year':        current_year + i,
            'realistic':   round(max(0, baseline_annual + annual_trend * i), 1),
            'optimistic':  round(max(0, baseline_annual * ((0.95) ** i)), 1),
            'pessimistic': round(baseline_annual * ((1.03) ** i), 1),
        })

    return {
        'projections':     projections,
        'baseline_annual': round(baseline_annual, 1),
        'annual_trend':    round(annual_trend, 1),
        'trend_direction': 'down' if annual_trend < 0 else 'up',
    }


def _simple_projection(baseline, years):
    cy = date.today().year
    return {
        'projections': [{'year': cy + i, 'realistic': round(baseline, 1),
                         'optimistic': round(baseline * (0.95 ** i), 1),
                         'pessimistic': round(baseline * (1.03 ** i), 1)} for i in range(years + 1)],
        'baseline_annual': round(baseline, 1), 'annual_trend': 0, 'trend_direction': 'stable',
    }


# ── KARBON HAFIZA (K-NN) ──────────────────────────────────────────────────────

def predict_missing_days(user) -> list:
    from apps.analytics.models import DailyEmissionSummary
    from apps.emissions.models import EmissionEntry

    end_date   = date.today() - timedelta(days=1)
    start_date = end_date - timedelta(days=59)

    existing   = set(DailyEmissionSummary.objects.filter(user=user, date__range=(start_date, end_date)).values_list('date', flat=True))
    entry_days = set(EmissionEntry.objects.filter(user=user, date__range=(start_date, end_date)).values_list('date', flat=True))

    all_days    = [start_date + timedelta(days=i) for i in range((end_date - start_date).days + 1)]
    missing     = [d for d in all_days if d not in existing and d not in entry_days]

    if not missing:
        return []

    training = list(DailyEmissionSummary.objects.filter(user=user).values_list('date', 'total_co2').order_by('-date')[:90])
    if len(training) < 3:
        return []

    results = []
    for md in missing[:7]:
        pred, conf = _knn_predict(md, training, k=3)
        results.append({'date': md.isoformat(), 'predicted_co2': round(pred, 3), 'confidence': round(conf, 2)})
    return results


def _knn_predict(target_date, training, k=3):
    target_wd = target_date.weekday()
    distances = []
    for td, co2 in training:
        wd_diff  = min(abs(td.weekday() - target_wd), 7 - abs(td.weekday() - target_wd))
        day_diff = abs((td - target_date).days) / 90.0
        distances.append((wd_diff * 0.6 + day_diff * 0.4, float(co2)))
    distances.sort(key=lambda x: x[0])
    nn = distances[:k]

    total_w = sum(1 / (d + 0.01) for d, _ in nn)
    pred    = sum((1 / (d + 0.01)) * v for d, v in nn) / total_w
    values  = [v for _, v in nn]
    std     = np.std(values) if len(values) > 1 else 0
    conf    = max(0.2, min(0.95, 1 - (std / (pred + 0.01)) * 0.5))
    return pred, conf
