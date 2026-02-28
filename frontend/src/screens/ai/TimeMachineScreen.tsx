// src/screens/ai/TimeMachineScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, TouchableOpacity, Dimensions,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import api from '../../services/api';

const { width } = Dimensions.get('window');
const CHART_W   = width - spacing.lg * 2 - spacing['2xl'] * 2;
const CHART_H   = 160;

type ScenarioKey = 'realistic' | 'optimistic' | 'pessimistic';

const SCENARIO_STYLES: Record<ScenarioKey, { color: string; label: string; dash?: boolean }> = {
  optimistic:  { color: colors.g500,   label: 'İyimser'   },
  realistic:   { color: colors.warning, label: 'Gerçekçi'  },
  pessimistic: { color: colors.error,   label: 'Kötümser', dash: true },
};

export default function TimeMachineScreen() {
  const [data,       setData]       = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [activeScen, setActiveScen] = useState<ScenarioKey>('realistic');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai/projection/?years=10');
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.g500} /></View>;

  const projections: any[] = data?.projections ?? [];
  const allValues = projections.flatMap(p => [p.optimistic, p.realistic, p.pessimistic]);
  const maxVal    = Math.max(...allValues, 1);
  const minVal    = Math.min(...allValues, 0);
  const range     = maxVal - minVal || 1;

  const toY = (val: number) => CHART_H - ((val - minVal) / range) * (CHART_H - 20) - 10;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Başlık */}
      <View style={styles.headerCard}>
        <Text style={styles.headerEmoji}>⏰</Text>
        <Text style={styles.headerTitle}>Karbon Zaman Makinesi</Text>
        <Text style={styles.headerSub}>
          Mevcut: {data?.baseline_annual?.toFixed(0) ?? '—'} kg CO₂/yıl
          {data?.trend_direction === 'down' ? ' 📉 azalma eğilimi' : data?.trend_direction === 'up' ? ' 📈 artış eğilimi' : ''}
        </Text>
      </View>

      {/* Senaryo seçici */}
      <View style={styles.scenPicker}>
        {(Object.keys(SCENARIO_STYLES) as ScenarioKey[]).map(key => (
          <TouchableOpacity
            key={key}
            style={[styles.scenBtn, activeScen === key && { backgroundColor: SCENARIO_STYLES[key].color }]}
            onPress={() => setActiveScen(key)}
          >
            <Text style={[styles.scenBtnText, activeScen === key && { color: '#fff' }]}>
              {SCENARIO_STYLES[key].label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Basit SVG benzeri çizgi grafik (View tabanlı) */}
      <View style={styles.chartCard}>
        <View style={[styles.chartArea, { height: CHART_H + 30 }]}>
          {/* Y eksen kılavuz çizgileri */}
          {[0, 0.25, 0.5, 0.75, 1].map(frac => (
            <View key={frac} style={[styles.gridLine, { bottom: frac * (CHART_H - 20) + 10 }]}>
              <Text style={styles.gridLabel}>{Math.round(minVal + frac * range)}</Text>
            </View>
          ))}

          {/* Aktif senaryo çizgisi (dot'larla) */}
          {projections.map((p, i) => {
            if (i === 0) return null;
            const x1 = ((i - 1) / (projections.length - 1)) * CHART_W;
            const x2 = (i / (projections.length - 1)) * CHART_W;
            const y1 = toY(projections[i - 1][activeScen]);
            const y2 = toY(p[activeScen]);

            const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
            const len   = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

            return (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  left:     x1,
                  bottom:   CHART_H - y1 + 30,
                  width:    len,
                  height:   3,
                  backgroundColor: SCENARIO_STYLES[activeScen].color,
                  borderRadius: 2,
                  transform: [{ rotate: `${angle}deg` }, { translateY: -1.5 }],
                  transformOrigin: '0 50%',
                }}
              />
            );
          })}

          {/* X eksen yıl etiketleri */}
          <View style={styles.xAxis}>
            {projections.filter((_, i) => i % 2 === 0).map((p) => (
              <Text key={p.year} style={styles.xLabel}>{p.year}</Text>
            ))}
          </View>
        </View>

        {/* Seçili senaryo son değer */}
        <View style={[styles.lastValRow, { borderLeftColor: SCENARIO_STYLES[activeScen].color }]}>
          <Text style={styles.lastValLabel}>10 Yıl Sonra ({SCENARIO_STYLES[activeScen].label})</Text>
          <Text style={[styles.lastValNum, { color: SCENARIO_STYLES[activeScen].color }]}>
            {projections[projections.length - 1]?.[activeScen]?.toFixed(0) ?? '—'} kg/yıl
          </Text>
        </View>
      </View>

      {/* Tablo */}
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          <Text style={[styles.thCell, { flex: 1 }]}>Yıl</Text>
          <Text style={[styles.thCell, { color: SCENARIO_STYLES.optimistic.color }]}>İyimser</Text>
          <Text style={[styles.thCell, { color: SCENARIO_STYLES.realistic.color }]}>Gerçekçi</Text>
          <Text style={[styles.thCell, { color: SCENARIO_STYLES.pessimistic.color }]}>Kötümser</Text>
        </View>
        {projections.map((p, i) => (
          <View key={p.year} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
            <Text style={[styles.tdCell, { flex: 1, fontWeight: '600' }]}>{p.year}</Text>
            <Text style={[styles.tdCell, { color: SCENARIO_STYLES.optimistic.color }]}>{p.optimistic.toFixed(0)}</Text>
            <Text style={[styles.tdCell, { color: SCENARIO_STYLES.realistic.color }]}>{p.realistic.toFixed(0)}</Text>
            <Text style={[styles.tdCell, { color: SCENARIO_STYLES.pessimistic.color }]}>{p.pessimistic.toFixed(0)}</Text>
          </View>
        ))}
        <Text style={styles.tableNote}>Değerler kg CO₂/yıl</Text>
      </View>

      <Text style={styles.disclaimer}>
        * Bu projeksiyon, lineer regresyon modeli ve geçmiş verileriniz kullanılarak hesaplanmıştır. AI tarafından üretilmiş tahmindir.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.background },
  content:      { padding: spacing.lg, paddingBottom: spacing['4xl'] },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerCard:   { backgroundColor: colors.g800, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.lg, ...shadows.lg },
  headerEmoji:  { fontSize: 40, marginBottom: spacing.sm },
  headerTitle:  { fontSize: typography.size.xl, fontWeight: '800', color: '#fff' },
  headerSub:    { fontSize: typography.size.sm, color: colors.g300, marginTop: 4 },

  scenPicker:   { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  scenBtn:      { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', ...shadows.sm },
  scenBtnText:  { fontSize: typography.size.xs, fontWeight: '700', color: colors.textSecondary },

  chartCard:    { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  chartArea:    { width: CHART_W, position: 'relative', marginBottom: spacing.sm },
  gridLine:     { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: colors.border },
  gridLabel:    { position: 'absolute', left: -35, fontSize: 9, color: colors.textMuted, top: -6, width: 32, textAlign: 'right' },
  xAxis:        { flexDirection: 'row', justifyContent: 'space-between', position: 'absolute', bottom: 0, left: 0, right: 0 },
  xLabel:       { fontSize: 9, color: colors.textMuted },

  lastValRow:   { borderLeftWidth: 3, paddingLeft: spacing.md, marginTop: spacing.md },
  lastValLabel: { fontSize: typography.size.xs, color: colors.textSecondary },
  lastValNum:   { fontSize: typography.size.xl, fontWeight: '800' },

  tableCard:    { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', marginBottom: spacing.md, ...shadows.sm },
  tableHeader:  { flexDirection: 'row', backgroundColor: colors.g50, padding: spacing.md },
  thCell:       { flex: 1, fontSize: typography.size.xs, fontWeight: '700', color: colors.text, textAlign: 'center' },
  tableRow:     { flexDirection: 'row', padding: spacing.sm, paddingHorizontal: spacing.md },
  tableRowAlt:  { backgroundColor: colors.g50 + '40' },
  tdCell:       { flex: 1, fontSize: typography.size.xs, color: colors.text, textAlign: 'center' },
  tableNote:    { fontSize: typography.size.xs, color: colors.textMuted, textAlign: 'center', padding: spacing.sm },

  disclaimer:   { fontSize: typography.size.xs, color: colors.textMuted, textAlign: 'center', lineHeight: 16 },
});
