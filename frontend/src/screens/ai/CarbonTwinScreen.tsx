// src/screens/ai/CarbonTwinScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import api from '../../services/api';

interface Scenario {
  key:              string;
  name:             string;
  description:      string;
  current_monthly:  number;
  scenario_monthly: number;
  monthly_saving:   number;
  saving_pct:       number;
  annual_saving:    number;
}

const SCENARIO_ICONS: Record<string, string> = {
  public_transport:   '🚌',
  vegan_diet:         '🥗',
  renewable_energy:   '☀️',
  digital_minimalism: '📵',
  zero_waste:         '♻️',
};

export default function CarbonTwinScreen() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [selected,  setSelected]  = useState<Scenario | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/ai/twin/');
      setScenarios(res.data.scenarios);
      if (res.data.top_scenario) setSelected(res.data.top_scenario);
    } catch {
      setError('Yeterli veri yok. En az 7 günlük emisyon kaydı gerekiyor.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.g500} /></View>;
  if (error)   return (
    <View style={styles.center}>
      <Text style={{ fontSize: 40 }}>🤖</Text>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Seçilen senaryo detayı */}
      {selected && (
        <View style={styles.mainCard}>
          <Text style={styles.mainIcon}>{SCENARIO_ICONS[selected.key] ?? '🌍'}</Text>
          <Text style={styles.mainName}>{selected.name}</Text>
          <Text style={styles.mainDesc}>{selected.description}</Text>

          <View style={styles.compareRow}>
            {/* Mevcut */}
            <View style={styles.compareBlock}>
              <Text style={styles.compareLabel}>Şu an</Text>
              <Text style={[styles.compareVal, { color: colors.error }]}>
                {selected.current_monthly.toFixed(1)}
              </Text>
              <Text style={styles.compareUnit}>kg/ay</Text>
            </View>

            {/* Ok */}
            <View style={styles.arrow}>
              <Text style={styles.arrowText}>→</Text>
              <Text style={[styles.savingPct, { color: colors.g600 }]}>
                -{selected.saving_pct}%
              </Text>
            </View>

            {/* Senaryo */}
            <View style={styles.compareBlock}>
              <Text style={styles.compareLabel}>Senaryoda</Text>
              <Text style={[styles.compareVal, { color: colors.g700 }]}>
                {selected.scenario_monthly.toFixed(1)}
              </Text>
              <Text style={styles.compareUnit}>kg/ay</Text>
            </View>
          </View>

          {/* Tasarruf bilgileri */}
          <View style={styles.savingsRow}>
            <View style={styles.savingChip}>
              <Text style={styles.savingChipVal}>{selected.monthly_saving.toFixed(1)} kg</Text>
              <Text style={styles.savingChipLabel}>Aylık tasarruf</Text>
            </View>
            <View style={styles.savingChip}>
              <Text style={styles.savingChipVal}>{selected.annual_saving.toFixed(0)} kg</Text>
              <Text style={styles.savingChipLabel}>Yıllık tasarruf</Text>
            </View>
          </View>

          {/* Ağaç eşdeğeri */}
          <Text style={styles.treeEquiv}>
            🌳 {Math.round(selected.annual_saving / 21)} ağaç dikimi eşdeğeri/yıl
          </Text>
        </View>
      )}

      {/* Tüm senaryolar listesi */}
      <Text style={styles.sectionTitle}>Tüm Senaryolar</Text>
      {scenarios.map(scenario => (
        <TouchableOpacity
          key={scenario.key}
          style={[styles.scenarioRow, selected?.key === scenario.key && styles.scenarioRowActive]}
          onPress={() => setSelected(scenario)}
        >
          <Text style={styles.scenarioIcon}>{SCENARIO_ICONS[scenario.key] ?? '🌿'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.scenarioName}>{scenario.name}</Text>
            <Text style={styles.scenarioPct}>Aylık {scenario.monthly_saving.toFixed(1)} kg tasarruf</Text>
          </View>
          <View style={[styles.pctBadge, {
            backgroundColor: scenario.saving_pct > 30 ? colors.g100 : '#FFF3E0',
          }]}>
            <Text style={[styles.pctBadgeText, {
              color: scenario.saving_pct > 30 ? colors.g700 : colors.warning,
            }]}>-%{scenario.saving_pct}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <Text style={styles.disclaimer}>
        * Bu tahminler AI modeli tarafından üretilmiş simülasyonlardır. Gerçek sonuçlar farklılık gösterebilir.
      </Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: colors.background },
  content:         { padding: spacing.lg, paddingBottom: spacing['4xl'] },
  center:          { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing['2xl'] },
  errorText:       { fontSize: typography.size.base, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md, lineHeight: 22 },

  mainCard:        { backgroundColor: colors.g900, borderRadius: radius.xl, padding: spacing['2xl'], marginBottom: spacing.lg, alignItems: 'center', ...shadows.lg },
  mainIcon:        { fontSize: 48, marginBottom: spacing.sm },
  mainName:        { fontSize: typography.size.xl, fontWeight: '800', color: '#fff', marginBottom: 4 },
  mainDesc:        { fontSize: typography.size.sm, color: colors.g300, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 20 },

  compareRow:      { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg, width: '100%', justifyContent: 'center' },
  compareBlock:    { alignItems: 'center', flex: 1 },
  compareLabel:    { fontSize: typography.size.xs, color: colors.g400, marginBottom: 4 },
  compareVal:      { fontSize: typography.size['3xl'], fontWeight: '800' },
  compareUnit:     { fontSize: typography.size.xs, color: colors.g400 },
  arrow:           { alignItems: 'center' },
  arrowText:       { fontSize: typography.size.xl, color: colors.g400 },
  savingPct:       { fontSize: typography.size.sm, fontWeight: '700' },

  savingsRow:      { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  savingChip:      { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  savingChipVal:   { fontSize: typography.size.lg, fontWeight: '800', color: colors.g300 },
  savingChipLabel: { fontSize: typography.size.xs, color: colors.g400, marginTop: 2 },

  treeEquiv:       { fontSize: typography.size.sm, color: colors.g300, marginTop: spacing.sm },

  sectionTitle:    { fontSize: typography.size.md, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  scenarioRow:     { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.md, ...shadows.sm },
  scenarioRowActive:{ borderWidth: 2, borderColor: colors.g500 },
  scenarioIcon:    { fontSize: 28 },
  scenarioName:    { fontSize: typography.size.base, fontWeight: '600', color: colors.text },
  scenarioPct:     { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: 2 },
  pctBadge:        { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.sm },
  pctBadgeText:    { fontSize: typography.size.sm, fontWeight: '700' },

  disclaimer:      { fontSize: typography.size.xs, color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg, lineHeight: 16 },
});
