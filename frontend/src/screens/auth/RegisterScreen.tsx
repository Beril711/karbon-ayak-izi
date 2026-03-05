// src/screens/auth/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { register, clearError } from '../../store/slices/authSlice';
import { colors, spacing, radius, typography, shadows } from '../../theme';

const ROLES = [
  { value: 'student', label: '🎓 Öğrenci' },
  { value: 'staff',   label: '👨‍🏫 Personel' },
];

export default function RegisterScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((s: RootState) => s.auth);

  const [firstName,  setFirstName]  = useState('');
  const [lastName,   setLastName]   = useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [passConfirm,setPassConfirm]= useState('');
  const [role,       setRole]       = useState('student');
  const [showPass,   setShowPass]   = useState(false);

  // İstemci taraflı validasyon
  const validate = (): string | null => {
    if (!firstName.trim()) return 'Ad zorunludur.';
    if (!lastName.trim())  return 'Soyad zorunludur.';
    if (!email.includes('edu.tr'))
      return 'Lütfen üniversite e-posta adresinizi kullanın.';
    if (password.length < 8) return 'Şifre en az 8 karakter olmalıdır.';
    if (password !== passConfirm) return 'Şifreler eşleşmiyor.';
    return null;
  };

  const handleRegister = async () => {
    const err = validate();
    if (err) { Alert.alert('Hata', err); return; }

    dispatch(clearError());
    const result = await dispatch(register({
      email:            email.trim().toLowerCase(),
      first_name:       firstName.trim(),
      last_name:        lastName.trim(),
      password,
      password_confirm: passConfirm,
    }));

    if (register.fulfilled.match(result)) {
      navigation.replace('MainApp');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Hesap Oluştur</Text>
        <Text style={styles.subtitle}>Üniversite e-postanla kayıt ol</Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {typeof error === 'string' ? error : 'Kayıt başarısız.'}</Text>
          </View>
        )}

        {/* Ad - Soyad */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Ad</Text>
            <TextInput
              style={styles.input}
              placeholder="Adınız"
              placeholderTextColor={colors.textMuted}
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Soyad</Text>
            <TextInput
              style={styles.input}
              placeholder="Soyadınız"
              placeholderTextColor={colors.textMuted}
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
        </View>

        {/* E-posta */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Üniversite E-postası</Text>
          <TextInput
            style={styles.input}
            placeholder="ad.soyad@ahievran.edu.tr"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.hint}>🏛️ Sadece üniversite (@edu.tr) e-posta adresleri kabul edilir</Text>
        </View>

        {/* Rol */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Rolünüz</Text>
          <View style={styles.roleRow}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[styles.roleBtn, role === r.value && styles.roleBtnActive]}
                onPress={() => setRole(r.value)}
              >
                <Text style={[styles.roleBtnText, role === r.value && styles.roleBtnTextActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Şifre */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Şifre</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={[styles.input, { flex: 1, borderWidth: 0 }]}
              placeholder="En az 8 karakter"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={{ padding: spacing.sm }}>
              <Text>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Şifre Tekrar</Text>
          <TextInput
            style={styles.input}
            placeholder="Şifrenizi tekrar girin"
            placeholderTextColor={colors.textMuted}
            value={passConfirm}
            onChangeText={setPassConfirm}
            secureTextEntry={!showPass}
          />
        </View>

        {/* Kayıt butonu */}
        <TouchableOpacity
          style={[styles.btnPrimary, isLoading && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnPrimaryText}>🌱 Kayıt Ol</Text>
          }
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Zaten hesabın var mı? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:      { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: spacing.lg, paddingBottom: spacing['4xl'] },

  backBtn:  { marginBottom: spacing.lg },
  backText: { color: colors.g700, fontWeight: '600', fontSize: typography.size.sm },

  title:    { fontSize: typography.size['2xl'], fontWeight: '800', color: colors.text },
  subtitle: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xl },

  errorBox: {
    backgroundColor: '#FFF3F3', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
    borderLeftWidth: 3, borderLeftColor: colors.error,
  },
  errorText: { color: colors.error, fontSize: typography.size.sm },

  row:        { flexDirection: 'row', gap: spacing.md },
  inputGroup: { marginBottom: spacing.lg },
  label:      { fontSize: typography.size.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  input: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    fontSize: typography.size.base, color: colors.text,
  },
  hint: { fontSize: typography.size.xs, color: colors.textMuted, marginTop: spacing.xs },

  roleRow:           { flexDirection: 'row', gap: spacing.md },
  roleBtn:           {
    flex: 1, paddingVertical: spacing.md, borderRadius: radius.md,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', backgroundColor: colors.surface,
  },
  roleBtnActive:     { borderColor: colors.g600, backgroundColor: colors.g50 },
  roleBtnText:       { fontSize: typography.size.sm, fontWeight: '600', color: colors.textSecondary },
  roleBtnTextActive: { color: colors.g800 },

  btnPrimary: {
    backgroundColor: colors.g700, borderRadius: radius.lg,
    paddingVertical: spacing.lg, alignItems: 'center',
    marginBottom: spacing.lg, ...shadows.md,
  },
  btnDisabled:    { opacity: 0.6 },
  btnPrimaryText: { color: '#fff', fontSize: typography.size.base, fontWeight: '700' },

  loginRow:  { flexDirection: 'row', justifyContent: 'center' },
  loginText: { color: colors.textSecondary, fontSize: typography.size.sm },
  loginLink: { color: colors.g700, fontWeight: '700', fontSize: typography.size.sm },
});
