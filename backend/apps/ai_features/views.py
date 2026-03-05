from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from drf_spectacular.utils import extend_schema
from django.utils import timezone
from .services import calculate_carbon_dna, calculate_carbon_twin, calculate_time_projection, predict_missing_days
from .models import CarbonDNAProfile, TimeProjection, CarbonMemory, CarbonEmotion

PROFILE_LABELS = {
    'eco_pioneer': '🌱 Eko Öncü', 'urban_traveler': '🏙️ Kentli Gezgin',
    'digital_nomad': '💻 Dijital Göçebe', 'food_focused': '🍃 Beslenme Odaklı',
    'energy_saver': '⚡ Enerji Tasarrufu', 'balanced': '⚖️ Dengeli',
}


class CarbonDNAView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary='Karbon DNA Profili', tags=['AI Özellikleri'])
    def get(self, request):
        result = calculate_carbon_dna(request.user)
        CarbonDNAProfile.objects.update_or_create(
            user=request.user,
            defaults={
                'profile_type': result['profile_type'],
                'transport_score': result['scores']['transport'],
                'energy_score': result['scores']['energy'],
                'food_score': result['scores']['food'],
                'waste_score': result['scores']['waste'],
                'water_score': result['scores']['water'],
                'digital_score': result['scores']['digital'],
                'dna_sequence': result['dna_sequence'],
            }
        )
        return Response({
            'profile_type': result['profile_type'],
            'profile_label': PROFILE_LABELS.get(result['profile_type'], ''),
            'dna_sequence': result['dna_sequence'],
            'scores': result['scores'],
            'period_days': result['period_days'],
            'calculated_at': timezone.now().isoformat(),
        })


class CarbonTwinView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary='Karbon İkizi Senaryoları', tags=['AI Özellikleri'])
    def get(self, request):
        scenarios = calculate_carbon_twin(request.user)
        if not scenarios:
            return Response({'detail': 'En az 7 günlük veri gerekiyor.'}, status=400)
        return Response({'scenarios': scenarios, 'top_scenario': scenarios[0]})


class TimeProjectionView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary='10 Yıllık Projeksiyon', tags=['AI Özellikleri'])
    def get(self, request):
        years  = max(1, min(20, int(request.query_params.get('years', 10))))
        result = calculate_time_projection(request.user, years)
        TimeProjection.objects.update_or_create(
            user=request.user,
            defaults={'projections': result['projections'], 'baseline_annual': result['baseline_annual']}
        )
        return Response(result)


class CarbonMemoryView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary='Eksik Gün Tahminleri', tags=['AI Özellikleri'])
    def get(self, request):
        predictions = predict_missing_days(request.user)
        saved = []
        for p in predictions:
            from datetime import date
            obj, _ = CarbonMemory.objects.get_or_create(
                user=request.user, missing_date=date.fromisoformat(p['date']),
                defaults={'predicted_co2': p['predicted_co2'], 'confidence': p['confidence'], 'status': 'pending'}
            )
            saved.append({
                'id': obj.id, 'date': obj.missing_date.isoformat(),
                'predicted_co2': float(obj.predicted_co2), 'confidence': float(obj.confidence),
                'confidence_pct': int(float(obj.confidence) * 100), 'status': obj.status,
            })
        return Response({'predictions': saved, 'count': len(saved)})

    @extend_schema(summary='Tahmin Onayla/Reddet', tags=['AI Özellikleri'])
    def patch(self, request):
        action = request.data.get('action')
        if action not in ('accept', 'reject'):
            return Response({'detail': "action: 'accept' veya 'reject' olmalı."}, status=400)
        try:
            memory = CarbonMemory.objects.get(id=request.data.get('id'), user=request.user, status='pending')
        except CarbonMemory.DoesNotExist:
            return Response({'detail': 'Tahmin bulunamadı.'}, status=404)

        memory.status = 'accepted' if action == 'accept' else 'rejected'
        memory.save()
        return Response({'detail': f'Tahmin {action} edildi.', 'status': memory.status})


class CarbonEmotionView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary='Karbon Duyguları', tags=['AI Özellikleri'])
    def get(self, request):
        emotions = CarbonEmotion.objects.filter(user=request.user).order_by('-date')[:30]
        return Response([{
            'date': e.date.isoformat(), 'mood': e.mood,
            'note': e.note, 'co2_that_day': float(e.co2_that_day) if e.co2_that_day else None,
        } for e in emotions])

    @extend_schema(summary='Duygu Kaydet', tags=['AI Özellikleri'])
    def post(self, request):
        from datetime import date as date_type
        mood = request.data.get('mood')
        if mood not in ('great', 'good', 'neutral', 'bad', 'terrible'):
            return Response({'detail': 'Geçersiz ruh hali.'}, status=400)
        today = date_type.today()
        from apps.analytics.models import DailyEmissionSummary
        summary = DailyEmissionSummary.objects.filter(user=request.user, date=today).first()
        emotion, created = CarbonEmotion.objects.update_or_create(
            user=request.user, date=today,
            defaults={'mood': mood, 'note': request.data.get('note', ''),
                      'co2_that_day': summary.total_co2 if summary else None}
        )
        return Response({
            'detail': 'Kaydedildi.' if created else 'Güncellendi.',
            'date': emotion.date.isoformat(), 'mood': emotion.mood,
        }, status=201 if created else 200)
