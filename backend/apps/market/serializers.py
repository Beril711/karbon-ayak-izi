from rest_framework import serializers
from .models import CarbonCredit, CreditTransaction, SmartContract, ContractParticipant


class CarbonCreditSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CarbonCredit
        fields = ['balance', 'total_earned', 'total_spent', 'updated_at']


class CreditTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CreditTransaction
        fields = ['id', 'type', 'amount', 'balance_after', 'description', 'created_at']


class SmartContractSerializer(serializers.ModelSerializer):
    creator_name      = serializers.CharField(source='creator.get_full_name', read_only=True)
    participant_count = serializers.SerializerMethodField()
    is_joined         = serializers.SerializerMethodField()

    class Meta:
        model  = SmartContract
        fields = [
            'id', 'title', 'description', 'creator_name',
            'target_co2_reduction_pct', 'duration_days', 'max_participants',
            'reward_per_participant', 'start_date', 'end_date',
            'status', 'participant_count', 'is_joined', 'created_at',
        ]
        read_only_fields = ['id', 'creator_name', 'status', 'created_at']

    def get_participant_count(self, obj):
        return obj.participants.count()

    def get_is_joined(self, obj):
        request = self.context.get('request')
        if not request:
            return False
        return obj.participants.filter(user=request.user).exists()


class SmartContractCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = SmartContract
        fields = [
            'title', 'description', 'target_co2_reduction_pct',
            'duration_days', 'max_participants', 'reward_per_participant',
            'start_date', 'end_date',
        ]

    def validate(self, data):
        if data['end_date'] <= data['start_date']:
            raise serializers.ValidationError({'end_date': 'Bitiş tarihi başlangıçtan sonra olmalı.'})
        return data

    def create(self, validated_data):
        return SmartContract.objects.create(
            creator=self.context['request'].user,
            **validated_data
        )


class ContractParticipantSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model  = ContractParticipant
        fields = ['user_name', 'joined_at', 'baseline_co2', 'achieved', 'reward_given']
