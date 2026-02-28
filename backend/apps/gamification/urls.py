from django.urls import path
from .views import GamificationStatusView, BadgeListView, LeaderboardView

urlpatterns = [
    path('status/',      GamificationStatusView.as_view(), name='gamification-status'),
    path('badges/',      BadgeListView.as_view(),          name='gamification-badges'),
    path('leaderboard/', LeaderboardView.as_view(),        name='gamification-leaderboard'),
]
