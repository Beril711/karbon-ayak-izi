// src/screens/main/AnalyticsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Dimensions,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { colors, spacing, radius, typography, shadows, getCategoryColor, getCategoryIcon } from '../../theme';
import { useDrawer } from '../../navigation/DrawerContext';
import api from '../../services/api';
import type { WeeklyDayData, TrendData, BudgetData } from '../../types';
import Svg, { Path, Rect, Text as SvgText, Line } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CHART_HEIGHT = 160;
const CATEGORIES = ['transport', 'energy', 'food', 'waste', 'water', 'digital'];

const CAT_NAMES: Record<string, string> = {
  transport: 'Ulaşım',
  energy: 'Enerji',
  food: 'Beslenme',
  waste: 'Atık',
  water: 'Su',
  digital: 'Dijital',
};

// Simulated hourly pattern data
const HOURLY_DATA = [
  0.1, 0.05, 0.02, 0.01, 0.01, 0.05,
  0.3, 0.8, 1.2, 0.9, 0.7, 0.5,
  1.4, 1.1, 0.6, 0.4, 0.5, 0.9,
  1.3, 1.0, 0.7, 0.4, 0.2, 0.1,
];

export default function AnalyticsScreen() {
  const drawer = useDrawer();
  const [weeklyData, setWeeklyData] = useState<WeeklyDayData[]>([]);
  const [trend, setTrend] = useState<TrendData | null>(null);
  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [wRes, tRes] = await Promise.all([
        api.get('/analytics/chart/weekly/'),
        api.get('/analytics/trend/'),
      ]);
      setWeeklyData(wRes.data);
      setTrend(tRes.data);
      api.get('/analytics/budget/').then(r => setBudget(r.data)).catch(() => { });
    } catch (err) {
      Alert.alert('Hata', 'Analiz verileri yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.g600} />
      </View>
    );
  }

  const maxCO2 = Math.max(...weeklyData.map(d => d.total), 1);
  const barWidth = (width - spacing.lg * 2 - spacing.sm * 6 - 32) / 7;
  const maxHourly = Math.max(...HOURLY_DATA, 0.1);

  // Weekly stats
  const weeklyTotal = weeklyData.reduce((s, d) => s + d.total, 0);
  const weeklyAvg = weeklyData.length > 0 ? weeklyTotal / weeklyData.length : 0;
  const bestDay = weeklyData.reduce((best, d) => d.total < best.total ? d : best, weeklyData[0] ?? { day: '-', total: 0 });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          <TouchableOpacity onPress={drawer.open} style={styles.menuBtn}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path d="M3 6H21M3 12H21M3 18H21" stroke={colors.g800} strokeWidth="2" strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
          <View>
            <Text style={styles.titleText}>📈 Analitik</Text>
            <Text style={styles.subtitleText}>Karbon verilerini analiz et</Text>
          </View>
        </View>
      </View>

      {/* ── Stacked Bar Chart (7 Days) ── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>📊 Haftalık Emisyon</Text>
          <Text style={styles.cardSub}>Son 7 gün (kg CO₂)</Text>
        </View>

        {/* Category filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catFilter}>
          <TouchableOpacity
            style={[styles.catChip, !activeCategory && styles.catChipActive]}
            onPress={() => setActiveCategory(null)}
          >
            <Text style={[styles.catChipText, !activeCategory && styles.catChipTextActive]}>Tümü</Text>
          </TouchableOpacity>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, activeCategory === cat && {
                borderColor: getCategoryColor(cat),
                backgroundColor: getCategoryColor(cat) + '20',
              }]}
              onPress={() => setActiveCategory(activeCategory === cat ? null : cat)}
            >
              <Text style={styles.catChipText}>{getCategoryIcon(cat)} {CAT_NAMES[cat]}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bar chart */}
        <View style={styles.chart}>
          {weeklyData.map((day, i) => {
            const cats = activeCategory ? [activeCategory] : CATEGORIES;
            const total = cats.reduce((sum, c) => sum + (Number((day as any)[c]) || 0), 0);
            const heightPct = total / maxCO2;

            return (
              <View key={i} style={[styles.barCol, { width: barWidth }]}>
                <Text style={styles.barValue}>{total > 0 ? total.toFixed(1) : ''}</Text>
                <View style={[styles.barTrack, { height: CHART_HEIGHT }]}>
                  {!activeCategory ? (
                    <View style={[styles.stackedBar, { height: heightPct * CHART_HEIGHT }]}>
                      {CATEGORIES.map((cat) => {
                        const catVal = Number((day as any)[cat]) || 0;
                        const catPct = catVal > 0 ? catVal / total : 0;
                        return (
                          <View
                            key={cat}
                            style={[styles.stackSegment, {
                              flex: catPct,
                              backgroundColor: getCategoryColor(cat),
                              opacity: catPct > 0 ? 1 : 0,
                            }]}
                          />
                        );
                      })}
                    </View>
                  ) : (
                    <View style={[styles.singleBar, {
                      height: heightPct * CHART_HEIGHT,
                      backgroundColor: getCategoryColor(activeCategory),
                    }]} />
                  )}
                </View>
                <Text style={styles.barDay}>{day.day}</Text>
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {CATEGORIES.map(cat => (
            <View key={cat} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: getCategoryColor(cat) }]} />
              <Text style={styles.legendText}>{CAT_NAMES[cat]}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Hourly Pattern ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🕐 Saatlik Desen</Text>
        <Text style={[styles.cardSub, { marginBottom: spacing.md }]}>Emisyon yoğunluğu (24 saat)</Text>

        <View style={styles.hourlyChart}>
          {HOURLY_DATA.map((val, i) => {
            const heightPct = val / maxHourly;
            const isHighlight = i === 12; // Highlight peak hour
            return (
              <View key={i} style={styles.hourlyCol}>
                <View style={styles.hourlyBarTrack}>
                  <View style={[styles.hourlyBar, {
                    height: `${heightPct * 100}%`,
                    backgroundColor: isHighlight ? colors.g500 : colors.g300,
                    borderRadius: 2,
                  }]} />
                </View>
                {i % 6 === 0 && (
                  <Text style={styles.hourlyLabel}>{String(i).padStart(2, '0')}</Text>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* ── Weekly Summary Stats ── */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { borderLeftColor: colors.g500 }]}>
          <Text style={styles.statValue}>{weeklyTotal.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Haftalık Toplam</Text>
          <Text style={styles.statUnit}>kg CO₂</Text>
        </View>
        <View style={[styles.statBox, { borderLeftColor: '#42A5F5' }]}>
          <Text style={styles.statValue}>{weeklyAvg.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Günlük Ort.</Text>
          <Text style={styles.statUnit}>kg CO₂</Text>
        </View>
        <View style={[styles.statBox, { borderLeftColor: '#FF9800' }]}>
          <Text style={styles.statValue}>{bestDay?.day ?? '-'}</Text>
          <Text style={styles.statLabel}>En İyi Gün</Text>
          <Text style={styles.statUnit}>{(bestDay?.total ?? 0).toFixed(1)} kg</Text>
        </View>
      </View>

      {/* ── Trend Analysis ── */}
      {trend && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📈 Trend Analizi</Text>

          <View style={styles.trendRow}>
            <View style={styles.trendBox}>
              <Text style={styles.trendLabel}>Bu Hafta</Text>
              <Text style={styles.trendValue}>{trend.this_week.total.toFixed(1)}</Text>
              <Text style={styles.trendUnit}>kg CO₂</Text>
            </View>
            <View style={styles.trendArrow}>
              <Text style={{ fontSize: 28 }}>
                {(trend.change_pct || 0) < 0 ? '📉' : '📈'}
              </Text>
              <Text style={[styles.trendPct, {
                color: (trend.change_pct || 0) < 0 ? colors.success : colors.error
              }]}>
                {trend.change_pct !== null
                  ? `${trend.change_pct > 0 ? '+' : ''}${trend.change_pct}%`
                  : '—'
                }
              </Text>
            </View>
            <View style={styles.trendBox}>
              <Text style={styles.trendLabel}>Geçen Hafta</Text>
              <Text style={styles.trendValue}>{trend.last_week.total.toFixed(1)}</Text>
              <Text style={styles.trendUnit}>kg CO₂</Text>
            </View>
          </View>

          <View style={styles.trendDetail}>
            <Text style={styles.trendDetailText}>
              Günlük ort: {trend.this_week.avg_daily} kg  ·  Geçen hafta: {trend.last_week.avg_daily} kg
            </Text>
          </View>
        </View>
      )}

      {/* ── Carbon Budget ── */}
      {budget && (
        <View style={[styles.card, budget.is_exceeded && styles.cardWarning]}>
          <Text style={styles.cardTitle}>💰 Aylık Karbon Bütçesi</Text>
          <View style={styles.budgetRow}>
            <View>
              <Text style={styles.budgetMain}>{budget.spent_kg.toFixed(1)} kg</Text>
              <Text style={styles.budgetSub}>Harcanan / {budget.budget_kg} kg</Text>
            </View>
            <View style={[styles.budgetPctCircle, {
              backgroundColor: budget.is_exceeded ? colors.error : budget.usage_pct > 80 ? colors.warning : colors.g800,
            }]}>
              <Text style={styles.budgetPct}>%{budget.usage_pct}</Text>
            </View>
          </View>

          <View style={styles.budgetTrack}>
            <View style={[styles.budgetFill, {
              width: `${Math.min(100, budget.usage_pct)}%`,
              backgroundColor: budget.is_exceeded ? colors.error : budget.usage_pct > 80 ? colors.warning : colors.g500,
            }]} />
          </View>

          <View style={styles.budgetInfoRow}>
            <Text style={styles.budgetInfoText}>
              {budget.is_exceeded
                ? `⚠️ Bütçe aşıldı!`
                : `✅ Kalan: ${budget.remaining_kg.toFixed(1)} kg CO₂`
              }
            </Text>
          </View>
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing['4xl'] },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
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
  titleText: {
    fontSize: typography.size.xl,
    fontWeight: '700',
    color: colors.text,
  },
  subtitleText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardWarning: { borderWidth: 2, borderColor: colors.error },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.size.base,
    fontWeight: '700',
    color: colors.text,
  },
  cardSub: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
  },

  // Category filter
  catFilter: { marginBottom: spacing.md },
  catChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  catChipActive: { borderColor: colors.g600, backgroundColor: colors.g50 },
  catChipText: { fontSize: typography.size.xs, color: colors.textSecondary },
  catChipTextActive: { color: colors.g800, fontWeight: '700' },

  // Bar chart
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  barCol: { alignItems: 'center', gap: spacing.xs },
  barValue: { fontSize: 9, color: colors.textSecondary, height: 14 },
  barTrack: {
    width: '100%',
    justifyContent: 'flex-end',
    backgroundColor: colors.g50,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  stackedBar: {
    width: '100%',
    borderRadius: radius.sm,
    overflow: 'hidden',
    flexDirection: 'column-reverse',
  },
  stackSegment: { minHeight: 2 },
  singleBar: { width: '100%', borderRadius: radius.sm },
  barDay: { fontSize: 9, color: colors.textSecondary },

  // Legend
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: colors.textSecondary },

  // Hourly Pattern
  hourlyChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    gap: 2,
  },
  hourlyCol: {
    flex: 1,
    alignItems: 'center',
  },
  hourlyBarTrack: {
    width: '100%',
    height: 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  hourlyBar: {
    width: '80%',
    minHeight: 2,
  },
  hourlyLabel: {
    fontSize: 8,
    color: colors.textMuted,
    marginTop: 4,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    ...shadows.sm,
  },
  statValue: {
    fontSize: typography.size.lg,
    fontWeight: '900',
    color: colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  statUnit: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 1,
  },

  // Trend
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  trendBox: { alignItems: 'center' },
  trendLabel: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  trendValue: {
    fontSize: typography.size.xl,
    fontWeight: '800',
    color: colors.text,
  },
  trendUnit: { fontSize: typography.size.xs, color: colors.textSecondary },
  trendArrow: { alignItems: 'center' },
  trendPct: { fontSize: typography.size.lg, fontWeight: '700' },
  trendDetail: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.g50,
    borderRadius: radius.sm,
  },
  trendDetailText: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Budget
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  budgetMain: {
    fontSize: typography.size.xl,
    fontWeight: '800',
    color: colors.text,
  },
  budgetSub: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
  },
  budgetPctCircle: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
  },
  budgetPct: { color: '#fff', fontWeight: '800', fontSize: typography.size.sm },
  budgetTrack: {
    height: 10,
    backgroundColor: colors.g50,
    borderRadius: 5,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  budgetFill: { height: 10, borderRadius: 5 },
  budgetInfoRow: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: 'rgba(76,175,80,0.08)',
    borderRadius: radius.sm,
  },
  budgetInfoText: {
    fontSize: typography.size.xs,
    color: colors.g800,
    fontWeight: '600',
    textAlign: 'center',
  },
});
