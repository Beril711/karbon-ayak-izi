// src/screens/main/SettingsScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Switch, Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { colors, spacing, radius, typography, shadows } from '../../theme';

export default function SettingsScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((s: RootState) => s.auth);

  const [notifications, setNotifications] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabından çıkmak istediğine emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', style: 'destructive', onPress: () => dispatch(logout()) },
      ]
    );
  };

  const handleChangePassword = () => {
    Alert.alert('Şifre Değiştir', 'Şifre değiştirme e-postası gönderildi:\n' + user?.email);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Hesabı Sil',
      'Bu işlem geri alınamaz. Tüm verilerin silinecek.',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: () => Alert.alert('Hesap silme talebi iletildi.') },
      ]
    );
  };

  const SettingRow = ({ label, value, onValueChange, icon }: {
    label: string; value: boolean; onValueChange: (v: boolean) => void; icon: string;
  }) => (
    <View style={styles.settingRow}>
      <Text style={styles.settingIcon}>{icon}</Text>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.g400 }}
        thumbColor={value ? colors.g600 : '#f4f3f4'}
      />
    </View>
  );

  const ActionRow = ({ label, icon, onPress, danger }: {
    label: string; icon: string; onPress: () => void; danger?: boolean;
  }) => (
    <TouchableOpacity style={styles.actionRow} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.settingIcon}>{icon}</Text>
      <Text style={[styles.settingLabel, danger && { color: colors.error }]}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>⚙️ Ayarlar</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>👤 Hesap</Text>
          <ActionRow icon="✏️" label="Profili Düzenle" onPress={() => navigation.navigate('EditProfile')} />
          <ActionRow icon="🔑" label="Şifre Değiştir" onPress={handleChangePassword} />
          <ActionRow icon="📧" label={user?.email ?? ''} onPress={() => {}} />
        </View>

        {/* Notifications */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🔔 Bildirimler</Text>
          <SettingRow icon="🔔" label="Bildirimler" value={notifications} onValueChange={setNotifications} />
          <SettingRow icon="⏰" label="Günlük Hatırlatıcı" value={dailyReminder} onValueChange={setDailyReminder} />
          <SettingRow icon="📊" label="Haftalık Rapor" value={weeklyReport} onValueChange={setWeeklyReport} />
        </View>

        {/* Appearance */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🎨 Görünüm</Text>
          <SettingRow icon="🌙" label="Karanlık Mod" value={darkMode} onValueChange={(v) => {
            setDarkMode(v);
            Alert.alert('Bilgi', 'Karanlık mod yakında aktif olacak!');
          }} />
        </View>

        {/* About */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>ℹ️ Hakkında</Text>
          <ActionRow icon="📱" label="Uygulama Versiyonu: 1.0.0" onPress={() => {}} />
          <ActionRow icon="📄" label="Gizlilik Politikası" onPress={() => Alert.alert('Gizlilik Politikası', 'Verileriniz güvenle saklanmaktadır.')} />
          <ActionRow icon="📋" label="Kullanım Koşulları" onPress={() => Alert.alert('Kullanım Koşulları', 'GreenCampus kullanım koşulları.')} />
        </View>

        {/* Danger Zone */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>⚠️ Tehlikeli Bölge</Text>
          <ActionRow icon="🗑️" label="Hesabı Sil" onPress={handleDeleteAccount} danger />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>🚪 Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.background },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.g50, justifyContent: 'center', alignItems: 'center' },
  backText:     { fontSize: 18, color: colors.g700, fontWeight: '700' },
  title:        { fontSize: typography.size.md, fontWeight: '800', color: colors.text },

  content:      { padding: spacing.lg, paddingBottom: 100 },

  card:         { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  sectionTitle: { fontSize: typography.size.sm, fontWeight: '700', color: colors.textSecondary, marginBottom: spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },

  settingRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  actionRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  settingIcon:  { fontSize: 18, width: 32 },
  settingLabel: { flex: 1, fontSize: typography.size.base, color: colors.text, fontWeight: '500' },
  chevron:      { fontSize: 20, color: colors.textMuted },

  logoutBtn:    { backgroundColor: '#FFF0F0', borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: '#FFD0D0' },
  logoutText:   { color: colors.error, fontSize: typography.size.base, fontWeight: '700' },
});