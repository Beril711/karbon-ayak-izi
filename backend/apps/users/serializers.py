from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.conf import settings
from .models import UserProfile

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password         = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = ['email', 'first_name', 'last_name', 'password', 'password_confirm', 'role']

    def validate_email(self, value):
        domain = value.split('@')[-1]
        allowed = settings.ALLOWED_UNIVERSITY_DOMAINS
        if not any(domain.endswith(d) for d in allowed):
            raise serializers.ValidationError(
                f'Sadece üniversite e-posta adresleri kabul edilmektedir. '
                f'İzin verilen domainler: {", ".join(allowed)}'
            )
        return value.lower()

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Şifreler eşleşmiyor.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        # Profil ve ilgili nesneleri oluştur
        UserProfile.objects.create(user=user)
        self._create_related_objects(user)
        return user

    def _create_related_objects(self, user):
        """Yeni kullanıcı için varsayılan nesneleri oluştur."""
        from apps.gamification.models import UserXP, Streak
        from apps.market.models import CarbonCredit
        UserXP.objects.create(user=user)
        Streak.objects.create(user=user)
        CarbonCredit.objects.create(user=user)


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = UserProfile
        fields = [
            'avatar', 'bio', 'faculty', 'department', 'student_number',
            'daily_carbon_goal', 'notify_daily', 'notify_streak',
            'notify_budget', 'notify_leaderboard', 'is_public',
            'health_sync_enabled',
        ]


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model  = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name', 'role', 'university', 'profile', 'date_joined']
        read_only_fields = ['id', 'email', 'date_joined']


class UpdateProfileSerializer(serializers.ModelSerializer):
    """Profil güncelleme — iç içe yazma desteği."""
    profile = UserProfileSerializer()

    class Meta:
        model  = User
        fields = ['first_name', 'last_name', 'university', 'profile']

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        # Kullanıcı alanlarını güncelle
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        # Profil alanlarını güncelle
        profile = instance.profile
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()
        return instance


class FCMTokenSerializer(serializers.Serializer):
    token = serializers.CharField(max_length=512)

    def update(self, instance, validated_data):
        instance.fcm_token = validated_data['token']
        instance.save(update_fields=['fcm_token'])
        return instance
