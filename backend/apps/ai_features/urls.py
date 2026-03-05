from django.urls import path
from .views import CarbonDNAView, CarbonTwinView, TimeProjectionView, CarbonMemoryView, CarbonEmotionView

urlpatterns = [
    path('dna/',        CarbonDNAView.as_view(),        name='ai-dna'),
    path('twin/',       CarbonTwinView.as_view(),       name='ai-twin'),
    path('projection/', TimeProjectionView.as_view(),   name='ai-projection'),
    path('memory/',     CarbonMemoryView.as_view(),     name='ai-memory'),
    path('emotions/',   CarbonEmotionView.as_view(),    name='ai-emotions'),
]
