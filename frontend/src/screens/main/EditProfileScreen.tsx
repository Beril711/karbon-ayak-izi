// src/screens/main/EditProfileScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import api from '../../services/api';

export default function EditProfileScreen({ navigation }: any) {
  const { user } = useSelector((s: RootState) => s.auth);
  const [firstName, setFirstName] = useState(user?.first_name ?? '');
  const [lastName, setLastName] = useState(user?.last_name ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Hata', 'Ad ve soyad boş bırakılamaz.');
      return;
    }
    setSaving(true);
    try {
      await api.patch('/auth/profile/', { first_name: firstName, last_name: lastName });
      Alert.alert('✅ Kaydedildi', 'Profilin güncellendi.', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Hata', 'Profil güncellenirken bir sorun oluştu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>✏️ Profili Düzenle</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {firstName?.[0]}{lastName?.[0]}
            </Text>
          </View>
          <Text style={styles.avatarHint}>Profil fotoğrafı yakında eklenecek</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>

          <Text style={styles.label}>Ad</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Adınız"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Soyad</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Soyadınız"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>E-posta</Text>
          <View style={styles.inputDisabled}>
            <Text style={styles.inputDisabledText}>{user?.email}</Text>
          </View>
          <Text style={styles.hint}>E-posta değiştirilemez</Text>

          <Text style={styles.label}>Rol</Text>
          <View style={styles.inputDisabled}>
            <Text style={styles.inputDisabledText}>
              {user?.role === 'student' ? '🎓 Öğrenci' : '👨‍🏫 Personel'}
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>💾 Kaydet</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: colors.background },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn:          { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.g50, justifyContent: 'center', alignItems: 'center' },
  backText:         { fontSize: 18, color: colors.g700, fontWeight: '700' },
  title:            { fontSize: typography.size.md, fontWeight: '800', color: colors.text },

  content:          { padding: spacing.lg, paddingBottom: 100 },

  avatarWrap:       { alignItems: 'center', marginBottom: spacing.xl },
  avatar:           { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.g600, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  avatarText:       { color: '#fff', fontSize: typography.size['2xl'], fontWeight: '800' },
  avatarHint:       { fontSize: typography.size.xs, color: colors.textSecondary },

  card:             { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  sectionTitle:     { fontSize: typography.size.base, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },

  label:            { fontSize: typography.size.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  input:            { backgroundColor: colors.background, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, padding: spacing.md, fontSize: typography.size.base, color: colors.text, marginBottom: spacing.md },
  inputDisabled:    { backgroundColor: colors.g50, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.xs },
  inputDisabledText:{ fontSize: typography.size.base, color: colors.textSecondary },
  hint:             { fontSize: typography.size.xs, color: colors.textMuted, marginBottom: spacing.md },

  saveBtn:          { backgroundColor: colors.g600, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', ...shadows.md },
  saveBtnText:      { color: '#fff', fontSize: typography.size.base, fontWeight: '700' },
});