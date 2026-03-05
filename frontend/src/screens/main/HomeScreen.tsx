// src/screens/main/HomeScreen.tsx
import React, { useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Animated, Easing,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchTodaySummary } from '../../store/slices/emissionSlice';
import { colors, spacing, radius, typography, shadows, getCategoryColor, getCategoryIcon } from '../../theme';
import { useDrawer } from '../../navigation/DrawerContext';
import Svg, { Path, Circle, Line, Polyline, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

const CATEGORIES = ['transport', 'energy', 'food', 'waste', 'water', 'digital'];

export default function HomeScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((s: RootState) => s.auth);
  const { todaySummary, isLoading } = useSelector((s: RootState) => s.emissions);
  const { xp, streak } = useSelector((s: RootState) => s.gamification);
  const drawer = useDrawer();

  // Campus breath animation
  const breathAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: 0.7,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchTodaySummary());
    }, [])
  );

  const totalCo2 = todaySummary?.total_co2 ?? 0;
  const dailyGoal = todaySummary?.daily_goal ?? 5;
  const goalPct = Math.min(100, (totalCo2 / dailyGoal) * 100);
  const currentLevel = xp?.level ?? 1;
  const xpTotal = xp?.total ?? 0;
  const xpToNext = xp?.xp_to_next ?? 100;
  const xpPct = Math.min(100, (xpTotal / (xpTotal + xpToNext)) * 100);

  // Sparkline data (simulated weekly data)
  const sparklineData: number[] = [2.1, 3.4, 1.8, 4.2, 2.9, totalCo2, 0];
  const maxSparkline = Math.max(...sparklineData, 1);
  const sparkFirst = sparklineData[0] ?? 0;

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
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          <TouchableOpacity onPress={drawer.open} style={styles.menuBtn}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path d="M3 6H21M3 12H21M3 18H21" stroke={colors.g800} strokeWidth="2" strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
          <View>
            <Text style={styles.greeting}>Merhaba, {user?.first_name} 🌳</Text>
            <Text style={styles.subGreeting}>Green Campus | Bugünkü karbon durumun</Text>
          </View>
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

      {/* ── LEVEL PROGRESS CARD ── */}
      <View style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Lv.{currentLevel}</Text>
          </View>
          <Text style={styles.levelTitle}>Yeşil Kaşif</Text>
          <Text style={styles.levelXpText}>{xpTotal} / {xpTotal + xpToNext} XP</Text>
        </View>
        <View style={styles.xpBarTrack}>
          <View style={[styles.xpBarFill, { width: `${xpPct}%` }]} />
        </View>
        <Text style={styles.levelHint}>
          Sonraki seviyeye {xpToNext} XP kaldı
        </Text>
      </View>

      {/* ── TODAY CO₂ CARD WITH SPARKLINE ── */}
      <View style={styles.co2Card}>
        <View style={styles.co2TopRow}>
          <View>
            <Text style={styles.co2Label}>Bugün CO₂</Text>
            <View style={styles.co2ValueRow}>
              <Text style={styles.co2BigValue}>
                {totalCo2.toFixed(2)}
              </Text>
              <Text style={styles.co2Unit}>kg</Text>
            </View>
            <Text style={styles.co2GoalText}>
              Hedef: {dailyGoal} kg | {goalPct < 100 ? `${(dailyGoal - totalCo2).toFixed(1)} kg kaldı` : 'Hedef aşıldı!'}
            </Text>
          </View>
          {/* Sparkline SVG */}
          <View style={styles.sparklineWrap}>
            <Svg width={100} height={45} viewBox="0 0 100 45">
              <Defs>
                <LinearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
                  <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
                </LinearGradient>
              </Defs>
              {/* Area fill */}
              <Path
                d={`M0,${40 - (sparkFirst / maxSparkline) * 35} ${sparklineData.map((v, i) =>
                  `L${(i / (sparklineData.length - 1)) * 100},${40 - (v / maxSparkline) * 35}`
                ).join(' ')} L100,40 L0,40 Z`}
                fill="url(#sparkGrad)"
              />
              {/* Line */}
              <Polyline
                points={sparklineData.map((v, i) =>
                  `${(i / (sparklineData.length - 1)) * 100},${40 - (v / maxSparkline) * 35}`
                ).join(' ')}
                fill="none"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth="2"
              />
              {/* Current point */}
              <Circle
                cx={(5 / 6) * 100}
                cy={40 - (totalCo2 / maxSparkline) * 35}
                r="3"
                fill="#FFFFFF"
              />
            </Svg>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.co2ProgressTrack}>
          <View style={[styles.co2ProgressFill, {
            width: `${Math.min(goalPct, 100)}%`,
            backgroundColor: goalPct > 100 ? '#FF6B6B' : goalPct > 80 ? '#FFB74D' : '#FFFFFF',
          }]} />
        </View>
      </View>

      {/* ── STAT MINIS (3 columns) ── */}
      <View style={styles.statMiniRow}>
        <View style={styles.statMiniCard}>
          <Text style={styles.statMiniEmoji}>🔥</Text>
          <Text style={styles.statMiniValue}>{streak?.current ?? 0}</Text>
          <Text style={styles.statMiniLabel}>gün seri</Text>
        </View>
        <View style={styles.statMiniCard}>
          <Text style={styles.statMiniEmoji}>📝</Text>
          <Text style={styles.statMiniValue}>{todaySummary?.entry_count ?? 0}</Text>
          <Text style={styles.statMiniLabel}>giriş</Text>
        </View>
        <View style={styles.statMiniCard}>
          <Text style={styles.statMiniEmoji}>📊</Text>
          <Text style={styles.statMiniValue}>
            {totalCo2 > 0 && (todaySummary?.entry_count ?? 0) > 0
              ? (totalCo2 / (todaySummary?.entry_count ?? 1)).toFixed(1)
              : '0.0'}
          </Text>
          <Text style={styles.statMiniLabel}>ort. kg</Text>
        </View>
      </View>

      {/* ── CAMPUS BREATH ── */}
      <View style={styles.breathCard}>
        <Text style={styles.breathTitle}>🌬️ Kampüs Nefesi</Text>
        <Text style={styles.breathSub}>Kampüsün karbon ritmi</Text>
        <View style={styles.breathCircleWrap}>
          <Animated.View style={[styles.breathCircleOuter, {
            transform: [{ scale: breathAnim }],
            opacity: breathAnim.interpolate({
              inputRange: [0.7, 1],
              outputRange: [0.3, 0.15],
            }),
          }]} />
          <Animated.View style={[styles.breathCircleMiddle, {
            transform: [{ scale: breathAnim.interpolate({
              inputRange: [0.7, 1],
              outputRange: [0.8, 1.05],
            }) }],
            opacity: breathAnim.interpolate({
              inputRange: [0.7, 1],
              outputRange: [0.4, 0.25],
            }),
          }]} />
          <View style={styles.breathCircleInner}>
            <Text style={styles.breathValue}>{totalCo2.toFixed(1)}</Text>
            <Text style={styles.breathUnit}>kg CO₂</Text>
          </View>
        </View>
        <View style={styles.breathStatusRow}>
          <View style={[styles.breathDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.breathStatusText}>
            {goalPct < 50 ? 'Kampüs temiz nefes alıyor' : goalPct < 80 ? 'Normal seviye' : 'Dikkatli olmalıyız'}
          </Text>
        </View>
      </View>

      {/* ── QUICK ACTIONS (2x2 Grid) ── */}
      <Text style={styles.sectionTitle}>⚡ Hızlı Erişim</Text>
      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={[styles.quickCard, { borderColor: 'rgba(76,175,80,0.3)' }]}
          onPress={() => navigation.navigate('CarbonDNA')}
          activeOpacity={0.7}
        >
          <Text style={styles.quickIcon}>🧬</Text>
          <Text style={styles.quickLabel}>Karbon DNA</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickCard, { borderColor: 'rgba(66,165,245,0.3)' }]}
          onPress={() => navigation.navigate('CarbonTwin')}
          activeOpacity={0.7}
        >
          <Text style={styles.quickIcon}>👥</Text>
          <Text style={styles.quickLabel}>Karbon İkizi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickCard, { borderColor: 'rgba(255,152,0,0.3)' }]}
          onPress={() => navigation.navigate('TimeMachine')}
          activeOpacity={0.7}
        >
          <Text style={styles.quickIcon}>⏳</Text>
          <Text style={styles.quickLabel}>Zaman Makinesi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickCard, { borderColor: 'rgba(124,77,255,0.3)' }]}
          onPress={() => navigation.navigate('Explore')}
          activeOpacity={0.7}
        >
          <Text style={styles.quickIcon}>💹</Text>
          <Text style={styles.quickLabel}>Karbon Borsası</Text>
        </TouchableOpacity>
      </View>

      {/* ── CATEGORY BREAKDOWN ── */}
      {todaySummary && todaySummary.total_co2 > 0 && todaySummary.by_category && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📊 Bugünkü Dağılım</Text>
          {CATEGORIES.map((cat) => {
            const val = (todaySummary.by_category as Record<string, number>)[cat] ?? 0;
            if (val === 0) return null;
            const pct = (val / todaySummary.total_co2) * 100;
            return (
              <View key={cat} style={styles.catRow}>
                <View style={styles.catLeft}>
                  <Text style={styles.catEmoji}>{getCategoryIcon(cat)}</Text>
                  <Text style={styles.catName}>{CAT_NAMES[cat] ?? cat}</Text>
                </View>
                <View style={styles.catBarWrap}>
                  <View style={[styles.catBar, {
                    width: `${pct}%`,
                    backgroundColor: getCategoryColor(cat),
                  }]} />
                </View>
                <Text style={styles.catVal}>{val.toFixed(1)} kg</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* ── ACTIVE QUESTS ── */}
      <View style={styles.card}>
        <View style={styles.questHeader}>
          <Text style={styles.sectionTitle}>⚔️ Aktif Görevler</Text>
        </View>
        {QUESTS.map((quest, idx) => (
          <View key={idx} style={[styles.questRow, idx < QUESTS.length - 1 && styles.questBorder]}>
            <View style={styles.questLeft}>
              <View style={[styles.questIconWrap, { backgroundColor: quest.color + '18' }]}>
                <Text style={styles.questIcon}>{quest.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Text style={styles.questName}>{quest.name}</Text>
                  <View style={[styles.questTypeBadge, { backgroundColor: quest.color + '20' }]}>
                    <Text style={[styles.questTypeText, { color: quest.color }]}>{quest.type}</Text>
                  </View>
                </View>
                <View style={styles.questProgressTrack}>
                  <View style={[styles.questProgressFill, {
                    width: `${quest.progress}%`,
                    backgroundColor: quest.color,
                  }]} />
                </View>
              </View>
            </View>
            <View style={styles.questRight}>
              <Text style={styles.questXP}>+{quest.xp}</Text>
              <Text style={styles.questXPLabel}>XP</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Bottom padding for tab bar */}
      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

// Kategori isimleri
const CAT_NAMES: Record<string, string> = {
  transport: 'Ulaşım',
  energy: 'Enerji',
  food: 'Beslenme',
  waste: 'Atık',
  water: 'Su',
  digital: 'Dijital',
};

// Aktif görev verileri (backend'den çekilecek)
const QUESTS = [
  { icon: '🏃', name: 'Merdiven Günü', xp: 30, type: 'Günlük', progress: 75, color: '#4CAF50' },
  { icon: '🔥', name: 'Karbon Canavarı', xp: 500, type: 'Boss', progress: 45, color: '#FF9800' },
  { icon: '🧬', name: 'DNA Evrimi', xp: 400, type: 'Özel', progress: 60, color: '#42A5F5' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing['4xl'] },

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  menuBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  greeting: {
    fontSize: typography.size.lg,
    fontWeight: '800',
    color: colors.text,
  },
  subGreeting: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.g500,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: typography.size.base },

  // ── Level Progress Card ──
  levelCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.15)',
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: spacing.md,
  },
  levelBadge: {
    backgroundColor: colors.g800,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  levelTitle: {
    flex: 1,
    fontSize: typography.size.base,
    fontWeight: '700',
    color: colors.text,
  },
  levelXpText: {
    fontSize: typography.size.xs,
    color: colors.g700,
    fontWeight: '700',
  },
  xpBarTrack: {
    height: 8,
    backgroundColor: colors.g100,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: 8,
    backgroundColor: colors.g500,
    borderRadius: 4,
  },
  levelHint: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 6,
    textAlign: 'right',
  },

  // ── Today CO₂ Card ──
  co2Card: {
    backgroundColor: colors.g700,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.md,
    ...shadows.md,
    overflow: 'hidden',
  },
  co2TopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  co2Label: {
    fontSize: typography.size.xs,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginBottom: 4,
  },
  co2ValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  co2BigValue: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1.5,
  },
  co2Unit: {
    fontSize: typography.size.md,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  co2GoalText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 4,
  },
  sparklineWrap: {
    marginTop: 4,
  },
  co2ProgressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  co2ProgressFill: {
    height: 4,
    borderRadius: 2,
  },

  // ── Stat Minis ──
  statMiniRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statMiniCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    ...shadows.sm,
  },
  statMiniEmoji: { fontSize: 18, marginBottom: 4 },
  statMiniValue: {
    fontSize: typography.size.lg,
    fontWeight: '900',
    color: colors.text,
  },
  statMiniLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },

  // ── Campus Breath ──
  breathCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
    borderWidth: 1,
    borderColor: 'rgba(38,166,154,0.15)',
  },
  breathTitle: {
    fontSize: typography.size.sm,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  breathSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  breathCircleWrap: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  breathCircleOuter: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#26A69A',
  },
  breathCircleMiddle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#26A69A',
  },
  breathCircleInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#26A69A',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  breathValue: {
    fontSize: typography.size.lg,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  breathUnit: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  breathStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breathDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breathStatusText: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // ── Quick Actions Grid ──
  sectionTitle: {
    fontSize: typography.size.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickCard: {
    width: '48.5%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    ...shadows.sm,
  },
  quickIcon: {
    fontSize: 30,
    marginBottom: spacing.sm,
  },
  quickLabel: {
    fontSize: typography.size.sm,
    fontWeight: '700',
    color: colors.text,
  },

  // ── Category Breakdown ──
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 14,
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: 130,
  },
  catEmoji: { fontSize: 22 },
  catName: {
    fontSize: typography.size.base,
    fontWeight: '600',
    color: colors.text,
  },
  catBarWrap: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F1F5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  catBar: { height: 8, borderRadius: 4 },
  catVal: {
    width: 55,
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    textAlign: 'right',
    fontWeight: '600',
  },

  // ── Active Quests ──
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  questBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  questLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  questIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questIcon: { fontSize: 20 },
  questName: {
    fontSize: typography.size.sm,
    fontWeight: '700',
    color: colors.text,
  },
  questTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  questTypeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  questProgressTrack: {
    height: 5,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  questProgressFill: { height: 5, borderRadius: 3 },
  questRight: {
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  questXP: {
    fontSize: typography.size.base,
    fontWeight: '800',
    color: colors.g600,
  },
  questXPLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
