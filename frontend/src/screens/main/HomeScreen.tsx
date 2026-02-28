// src/screens/main/HomeScreen.tsx
import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchTodaySummary } from '../../store/slices/emissionSlice';
import { colors, spacing, radius, typography, shadows, getCategoryColor, getCategoryIcon } from '../../theme';

const { width } = Dimensions.get('window');

const CATEGORIES = ['transport', 'energy', 'food', 'waste', 'water', 'digital'];

export default function HomeScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { user }         = useSelector((s: RootState) => s.auth);
  const { todaySummary, isLoading } = useSelector((s: RootState) => s.emissions);
  const { xp, streak }  = useSelector((s: RootState) => s.gamification);

  useEffect(() => {
    dispatch(fetchTodaySummary());
  }, []);

  const goalPct = todaySummary
    ? Math.min(100, (todaySummary.total_co2 / todaySummary.daily_goal) * 100)
    : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={() => dispatch(fetchTodaySummary())}
          tintColor={colors.g500}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba, {user?.first_name} 👋</Text>
          <Text style={styles.subGreeting}>Bugünkü karbon durumun</Text>
        </View>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.avatarText}>
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </Text>
        </TouchableOpacity>
      </View>

      {/* XP & Streak Şeridi */}
      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Text style={styles.statIcon}>⚡</Text>
          <Text style={styles.statValue}>Seviye {xp?.level ?? 1}</Text>
          <Text style={styles.statLabel}>{xp?.total_xp ?? 0} XP</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={styles.statValue}>{streak?.current ?? 0} Gün</Text>
          <Text style={styles.statLabel}>Seri</Text>
        </View>
      </View>

      {/* Günlük CO2 Özet Kartı */}
      <View style={[styles.card, styles.co2Card]}>
        <Text style={styles.co2Label}>Bugün</Text>
        <Text style={styles.co2Value}>
          {todaySummary ? todaySummary.total_co2.toFixed(2) : '0.00'}
          <Text style={styles.co2Unit}> kg CO₂</Text>
        </Text>
        <Text style={[styles.goalStatus, { color: todaySummary?.goal_achieved ? colors.success : colors.warning }]}>
          {todaySummary?.goal_achieved ? '✅ Günlük hedef tutturuldu!' : `⚠️ Hedefe ${todaySummary?.remaining?.toFixed(1) ?? '—'} kg kaldı`}
        </Text>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {
            width: `${goalPct}%`,
            backgroundColor: goalPct > 100 ? colors.error : goalPct > 80 ? colors.warning : colors.g500,
          }]} />
        </View>
        <Text style={styles.progressLabel}>
          {goalPct.toFixed(0)}% / Günlük hedef: {todaySummary?.daily_goal ?? 5} kg
        </Text>
      </View>

      {/* Kategori Dağılımı */}
      {todaySummary && todaySummary.total_co2 > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Bugünkü Dağılım</Text>
          {CATEGORIES.map((cat) => {
            const val = todaySummary.by_category[cat] ?? 0;
            if (val === 0) return null;
            const pct = (val / todaySummary.total_co2) * 100;
            return (
              <View key={cat} style={styles.catRow}>
                <Text style={styles.catIcon}>{getCategoryIcon(cat)}</Text>
                <View style={styles.catBarWrap}>
                  <View style={[styles.catBar, { width: `${pct}%`, backgroundColor: getCategoryColor(cat) }]} />
                </View>
                <Text style={styles.catVal}>{val.toFixed(2)}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Hızlı Giriş Butonları */}
      <Text style={styles.sectionTitle}>Hızlı Giriş</Text>
      <View style={styles.quickGrid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.quickBtn, { borderColor: getCategoryColor(cat) }]}
            onPress={() => navigation.navigate('AddEntry', { category: cat })}
          >
            <Text style={styles.quickIcon}>{getCategoryIcon(cat)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: colors.background },
  content:       { padding: spacing.lg, paddingBottom: spacing['4xl'] },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  greeting:      { fontSize: typography.size.xl, fontWeight: '700', color: colors.text },
  subGreeting:   { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: 2 },
  avatar:        { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.g700, justifyContent: 'center', alignItems: 'center' },
  avatarText:    { color: '#fff', fontWeight: '700', fontSize: typography.size.base },

  statsRow:      { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  statChip:      { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', ...shadows.sm },
  statIcon:      { fontSize: 20, marginBottom: 2 },
  statValue:     { fontSize: typography.size.base, fontWeight: '700', color: colors.text },
  statLabel:     { fontSize: typography.size.xs, color: colors.textSecondary },

  card:          { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  co2Card:       { backgroundColor: colors.g800 },
  co2Label:      { fontSize: typography.size.sm, color: colors.g300, marginBottom: 4 },
  co2Value:      { fontSize: typography.size['4xl'], fontWeight: '800', color: '#fff' },
  co2Unit:       { fontSize: typography.size.lg, fontWeight: '400' },
  goalStatus:    { fontSize: typography.size.sm, marginTop: spacing.sm },

  progressTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, marginTop: spacing.md, overflow: 'hidden' },
  progressFill:  { height: 8, borderRadius: 4 },
  progressLabel: { fontSize: typography.size.xs, color: colors.g300, marginTop: 4 },

  sectionTitle:  { fontSize: typography.size.md, fontWeight: '700', color: colors.text, marginBottom: spacing.md },

  catRow:        { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  catIcon:       { fontSize: 18, width: 28 },
  catBarWrap:    { flex: 1, height: 8, backgroundColor: colors.g50, borderRadius: 4, overflow: 'hidden' },
  catBar:        { height: 8, borderRadius: 4 },
  catVal:        { width: 45, fontSize: typography.size.xs, color: colors.textSecondary, textAlign: 'right' },

  quickGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  quickBtn:      { width: (width - spacing.lg * 2 - spacing.md * 5) / 6, aspectRatio: 1, borderRadius: radius.md, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 2, ...shadows.sm },
  quickIcon:     { fontSize: 22 },
});
