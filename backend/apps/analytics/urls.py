# apps/analytics/urls.py
from django.urls import path
from .views import WeeklyChartView, TrendView, BudgetView

urlpatterns = [
    path('chart/weekly/', WeeklyChartView.as_view(), name='analytics-weekly'),
    path('trend/',        TrendView.as_view(),        name='analytics-trend'),
    path('budget/',       BudgetView.as_view(),        name='analytics-budget'),
]
