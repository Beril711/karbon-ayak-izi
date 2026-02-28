from rest_framework import serializers
from .models import CarbonDNAProfile, CarbonTwinScenario, TimeProjection, CarbonMemory, CarbonEmotion


class CarbonDNASerializer(serializers.ModelSerializer):
    scores       = serializers.SerializerMethodField()
    profile_label = serializers.CharField(source='get_profile_type_display', read_only=True)

    class Meta:
        model  = CarbonDNAProfile
        fields = [
            'profile_type', 'profile_label', 'dna_sequence',
            'scores', 'calculated_at',
        ]

    def get_scores(self, obj):
        return obj.scores


class CarbonTwinSerializer(serializers.ModelSerializer):
    monthly_saving = serializers.ReadOnlyField()
    saving_pct     = serializers.ReadOnlyField()

    class Meta:
        model  = CarbonTwinScenario
        fields = [
            'id', 'name', 'description', 'current_monthly', 'scenario_monthly',
            'monthly_saving', 'saving_pct', 'assumptions', 'created_at',
        ]


class TimeProjectionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = TimeProjection
        fields = ['baseline_annual', 'projections', 'calculated_at']


class CarbonMemorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = CarbonMemory
        fields = ['id', 'missing_date', 'predicted_co2', 'confidence', 'similar_days', 'status', 'created_at']
        read_only_fields = ['id', 'predicted_co2', 'confidence', 'similar_days', 'created_at']


class CarbonMemoryConfirmSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['accept', 'reject'])


class CarbonEmotionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CarbonEmotion
        fields = ['id', 'date', 'mood', 'note', 'co2_that_day', 'created_at']
        read_only_fields = ['id', 'co2_that_day', 'created_at']

    def validate_date(self, value):
        from django.utils import timezone
        if value > timezone.localdate():
            raise serializers.ValidationError('Gelecek tarihli kayıt yapılamaz.')
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        # O günün CO₂ değerini otomatik doldur
        from apps.analytics.models import DailyEmissionSummary
        summary = DailyEmissionSummary.objects.filter(
            user=user, date=validated_data['date']
        ).first()
        if summary:
            validated_data['co2_that_day'] = summary.total_co2
        return CarbonEmotion.objects.create(user=user, **validated_data)
