from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from django.utils import timezone
from datetime import date, timedelta
from .models import DailyEmissionSummary, WeeklySummary, CarbonBudget


class WeeklyChartView(APIView):
    """Son 7 gün yığılı bar grafik verisi."""
    permission_classes = [IsAuthenticated]

    @extend_schema(summary='Haftalık Grafik', tags=['Analitik'])
    def get(self, request):
        today     = timezone.localdate()
        week_ago  = today - timedelta(days=6)

        summaries = DailyEmissionSummary.objects.filter(
            user=request.user,
            date__range=(week_ago, today)
        ).order_by('date')

        # Eksik günler için 0 değeri ekle
        summary_map = {s.date: s for s in summaries}
        chart_data  = []
        for i in range(7):
            d = week_ago + timedelta(days=i)
            s = summary_map.get(d)
            chart_data.append({
                'date':      d.isoformat(),
                'day':       d.strftime('%a'),
                'total':     float(s.total_co2) if s else 0,
                'transport': float(s.transport_co2) if s else 0,
                'energy':    float(s.energy_co2) if s else 0,
                'food':      float(s.food_co2) if s else 0,
                'waste':     float(s.waste_co2) if s else 0,
                'water':     float(s.water_co2) if s else 0,
                'digital':   float(s.digital_co2) if s else 0,
            })

        return Response(chart_data)


class TrendView(APIView):
    """Bu hafta vs geçen hafta trend karşılaştırması."""
    permission_classes = [IsAuthenticated]

    @extend_schema(summary='Trend Analizi', tags=['Analitik'])
    def get(self, request):
        today      = timezone.localdate()
        this_mon   = today - timedelta(days=today.weekday())
        last_mon   = this_mon - timedelta(weeks=1)
        last_sun   = this_mon - timedelta(days=1)

        from .models import DailyEmissionSummary
        from django.db.models import Sum, Avg

        this_week = DailyEmissionSummary.objects.filter(
            user=request.user, date__gte=this_mon
        ).aggregate(total=Sum('total_co2'), avg=Avg('total_co2'))

        last_week = DailyEmissionSummary.objects.filter(
            user=request.user, date__range=(last_mon, last_sun)
        ).aggregate(total=Sum('total_co2'), avg=Avg('total_co2'))

        this_total = float(this_week['total'] or 0)
        last_total = float(last_week['total'] or 0)

        change_pct = None
        if last_total > 0:
            change_pct = round((this_total - last_total) / last_total * 100, 1)

        return Response({
            'this_week': {'total': this_total, 'avg_daily': round(float(this_week['avg'] or 0), 2)},
            'last_week': {'total': last_total, 'avg_daily': round(float(last_week['avg'] or 0), 2)},
            'change_pct': change_pct,
            'trend': 'down' if (change_pct or 0) < 0 else 'up',
        })


class BudgetView(APIView):
    """Aylık karbon bütçesi durumu."""
    permission_classes = [IsAuthenticated]

    @extend_schema(summary='Karbon Bütçesi', tags=['Analitik'])
    def get(self, request):
        today = timezone.localdate()
        month_start = today.replace(day=1)

        budget = CarbonBudget.objects.filter(
            user=request.user, month=month_start
        ).first()

        if not budget:
            return Response({'detail': 'Bu ay için bütçe tanımlanmamış.'}, status=404)

        return Response({
            'month':        month_start.isoformat(),
            'budget_kg':    float(budget.budget_kg),
            'spent_kg':     float(budget.spent_kg),
            'remaining_kg': budget.remaining_kg,
            'usage_pct':    budget.usage_pct,
            'is_exceeded':  budget.is_exceeded,
        })

    @extend_schema(summary='Karbon Bütçesi Güncelle', tags=['Analitik'])
    def put(self, request):
        today       = timezone.localdate()
        month_start = today.replace(day=1)
        budget_kg   = request.data.get('budget_kg')

        if not budget_kg:
            return Response({'detail': 'budget_kg zorunludur.'}, status=400)

        budget, _ = CarbonBudget.objects.get_or_create(
            user=request.user, month=month_start,
            defaults={'budget_kg': budget_kg}
        )
        if not _:
            budget.budget_kg = budget_kg
            budget.save()

        return Response({'detail': 'Bütçe güncellendi.', 'budget_kg': float(budget.budget_kg)})
