from django.urls import path
from .views import CategoryListView, FactorListView, EmissionEntryListCreateView, EmissionEntryDetailView, TodaySummaryView

urlpatterns = [
    path('categories/',    CategoryListView.as_view(),            name='emission-categories'),
    path('factors/',       FactorListView.as_view(),              name='emission-factors'),
    path('entries/',       EmissionEntryListCreateView.as_view(), name='emission-entries'),
    path('entries/<uuid:pk>/', EmissionEntryDetailView.as_view(), name='emission-entry-detail'),
    path('today/',         TodaySummaryView.as_view(),            name='emission-today'),
]
