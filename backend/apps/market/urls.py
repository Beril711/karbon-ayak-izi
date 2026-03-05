from django.urls import path
from .views import (
    WalletView, TransactionListView,
    SmartContractListCreateView, SmartContractDetailView,
    JoinContractView, LeaveContractView,
)

urlpatterns = [
    # Cüzdan
    path('wallet/',                          WalletView.as_view(),                  name='market-wallet'),
    path('wallet/transactions/',             TransactionListView.as_view(),          name='market-transactions'),

    # Akıllı sözleşmeler
    path('contracts/',                       SmartContractListCreateView.as_view(),  name='market-contracts'),
    path('contracts/<uuid:pk>/',             SmartContractDetailView.as_view(),      name='market-contract-detail'),
    path('contracts/<uuid:pk>/join/',        JoinContractView.as_view(),             name='market-contract-join'),
    path('contracts/<uuid:pk>/leave/',       LeaveContractView.as_view(),            name='market-contract-leave'),
]
