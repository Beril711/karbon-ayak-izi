from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import UserXP, Streak, Badge, UserBadge, WeeklyLeaderboard

User = get_user_model()


class GamificationStatusView(APIView):
    """Kullanıcının XP, seviye ve seri durumu."""
    permission_classes = [IsAuthenticated]

    @extend_schema(summary='Gamification Durumu', tags=['Gamification'])
    def get(self, request):
        user = request.user
        xp, _     = UserXP.objects.get_or_create(user=user)
        streak, _ = Streak.objects.get_or_create(user=user)

        return Response({
            'xp': {
                'total':         xp.total_xp,
                'level':         xp.level,
                'xp_to_next':    xp.xp_to_next_level,
                'level_thresholds': UserXP.LEVEL_THRESHOLDS,
            },
            'streak': {
                'current': streak.current_streak,
                'longest': streak.longest_streak,
                'last_entry': streak.last_entry_date,
            },
        })


class BadgeListView(APIView):
    """Kullanıcının tüm rozetleri (kazanılan ve kilitli)."""
    permission_classes = [IsAuthenticated]

    @extend_schema(summary='Rozet Listesi', tags=['Gamification'])
    def get(self, request):
        all_badges    = Badge.objects.filter(is_active=True)
        earned_ids    = set(UserBadge.objects.filter(user=request.user).values_list('badge_id', flat=True))

        result = []
        for badge in all_badges:
            result.append({
                'id':          badge.id,
                'slug':        badge.slug,
                'name':        badge.name_tr,
                'description': badge.description_tr,
                'icon':        badge.icon,
                'tier':        badge.tier,
                'xp_reward':   badge.xp_reward,
                'earned':      badge.id in earned_ids,
            })

        # Kazanılan rozetleri "is_new=False" olarak işaretle
        UserBadge.objects.filter(user=request.user, is_new=True).update(is_new=False)

        return Response(result)


class LeaderboardView(APIView):
    """Haftalık karbon liderboardu — Top 10 + kullanıcı sırası."""
    permission_classes = [IsAuthenticated]

    @extend_schema(summary='Haftalık Liderboard', tags=['Gamification'])
    def get(self, request):
        from datetime import date, timedelta
        # Bu haftanın Pazartesisi
        today      = date.today()
        week_start = today - timedelta(days=today.weekday())

        top10 = WeeklyLeaderboard.objects.filter(
            week_start=week_start
        ).select_related('user').order_by('rank')[:10]

        # Kullanıcının kendi sırası
        my_entry = WeeklyLeaderboard.objects.filter(
            week_start=week_start,
            user=request.user
        ).first()

        return Response({
            'week_start': week_start,
            'top10': [
                {
                    'rank':      e.rank,
                    'user':      e.user.get_full_name(),
                    'total_co2': float(e.total_co2),
                    'is_me':     e.user_id == request.user.id,
                }
                for e in top10
            ],
            'my_rank': my_entry.rank if my_entry else None,
            'my_co2':  float(my_entry.total_co2) if my_entry else None,
        })
