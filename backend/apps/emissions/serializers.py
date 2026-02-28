from rest_framework import serializers
from .models import EmissionCategory, EmissionFactor, EmissionEntry


class EmissionCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = EmissionCategory
        fields = ['id', 'slug', 'name_tr', 'icon', 'color', 'order']


class EmissionFactorSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name_tr', read_only=True)

    class Meta:
        model  = EmissionFactor
        fields = ['id', 'category', 'category_name', 'name_tr', 'co2_per_unit', 'unit']


class EmissionEntrySerializer(serializers.ModelSerializer):
    factor_name     = serializers.CharField(source='factor.name_tr', read_only=True)
    category_slug   = serializers.CharField(source='factor.category.slug', read_only=True)
    category_icon   = serializers.CharField(source='factor.category.icon', read_only=True)
    unit            = serializers.CharField(source='factor.unit', read_only=True)

    class Meta:
        model  = EmissionEntry
        fields = [
            'id', 'factor', 'factor_name', 'category_slug', 'category_icon',
            'quantity', 'unit', 'co2_kg', 'note', 'date', 'is_predicted', 'created_at',
        ]
        read_only_fields = ['id', 'co2_kg', 'is_predicted', 'created_at']

    def validate_date(self, value):
        from django.utils import timezone
        if value > timezone.localdate():
            raise serializers.ValidationError('Gelecek tarihli giriş yapılamaz.')
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        entry = EmissionEntry(user=user, **validated_data)
        # CO2 hesapla
        entry.co2_kg = entry.quantity * entry.factor.co2_per_unit
        entry.save()
        return entry
