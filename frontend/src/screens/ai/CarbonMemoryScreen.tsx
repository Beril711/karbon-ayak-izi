// src/screens/ai/CarbonMemoryScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import api from '../../services/api';

interface Prediction {
  id:             number;
  date:           string;
  predicted_co2:  number;
  confidence:     number;
  confidence_pct: number;
  status:         string;
}

function ConfidenceBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? colors.g500 : pct >= 60 ? colors.warning : colors.error;
  return (
    <View style={styles.confWrap}>
      <View style={[styles.confFill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

export default function CarbonMemoryScreen() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [acting,      setActing]      = useState<number | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai/memory/');
      setPredictions(res.data.predictions);
    } finally {
      setLoading(false);
    }
  };

  const handle = async (id: number, action: 'accept' | 'reject') => {
    setActing(id);
    try {
      await api.patch('/ai/memory/', { id, action });
      setPredictions(prev =>
        prev.map(p => p.id === id ? { ...p, status: action === 'accept' ? 'accepted' : 'rejected' } : p)
      );
    } catch {
      Alert.alert('Hata', 'İşlem gerçekleştirilemedi.');
    } finally {
      setActing(null);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.g500} /></View>;

  const pending   = predictions.filter(p => p.status === 'pending');
  const processed = predictions.filter(p => p.status !== 'pending');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      <View style={styles.headerCard}>
        <Text style={styles.headerEmoji}>💭</Text>
        <Text style={styles.headerTitle}>Karbon Hafıza</Text>
        <Text style={styles.headerSub}>
          K-NN algoritması eksik günlerinizi tahmin etti.
          Onayladığınız tahminler emisyon kaydınıza eklenir.
        </Text>
      </View>

      {predictions.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>✅</Text>
          <Text style={styles.emptyTitle}>Eksik gün bulunamadı</Text>
          <Text style={styles.emptySub}>Son 60 günde tüm verileriniz eksiksiz görünüyor.</Text>
        </View>
      )}

      {pending.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Onay Bekleyenler ({pending.length})</Text>
          {pending.map(p => (
            <View key={p.id} style={styles.predCard}>
              <View style={styles.predHeader}>
                <Text style={styles.predDate}>📅 {p.date}</Text>
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>🤖 AI Tahmini</Text>
                </View>
              </View>

              <Text style={styles.predCO2}>
                {p.predicted_co2.toFixed(2)}
                <Text style={styles.predUnit}> kg CO₂</Text>
              </Text>

              <View style={styles.confRow}>
                <Text style={styles.confLabel}>Güven: %{p.confidence_pct}</Text>
                <ConfidenceBar pct={p.confidence_pct} />
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.rejectBtn]}
                  onPress={() => handle(p.id, 'reject')}
                  disabled={acting === p.id}
                >
                  <Text style={styles.rejectBtnText}>✗ Reddet</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.acceptBtn]}
                  onPress={() => handle(p.id, 'accept')}
                  disabled={acting === p.id}
                >
                  {acting === p.id
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.acceptBtnText}>✓ Onayla</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      )}

      {processed.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>İşlenenler</Text>
          {processed.map(p => (
            <View key={p.id} style={[styles.predCard, styles.predCardProcessed]}>
              <View style={styles.predHeader}>
                <Text style={styles.predDate}>📅 {p.date}</Text>
                <View style={[styles.statusBadge, {
                  backgroundColor: p.status === 'accepted' ? colors.g100 : '#FFEBEE'
                }]}>
                  <Text style={[styles.statusText, {
                    color: p.status === 'accepted' ? colors.g700 : colors.error
                  }]}>
                    {p.status === 'accepted' ? '✓ Onaylandı' : '✗ Reddedildi'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.predCO2, { color: colors.textSecondary }]}>
                {p.predicted_co2.toFixed(2)} kg CO₂
              </Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.background },
  content:        { padding: spacing.lg, paddingBottom: spacing['4xl'] },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerCard:     { backgroundColor: colors.g800, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.lg, ...shadows.lg },
  headerEmoji:    { fontSize: 40, marginBottom: spacing.sm },
  headerTitle:    { fontSize: typography.size.xl, fontWeight: '800', color: '#fff' },
  headerSub:      { fontSize: typography.size.sm, color: colors.g300, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },

  emptyCard:      { alignItems: 'center', padding: spacing['3xl'] },
  emptyEmoji:     { fontSize: 48, marginBottom: spacing.md },
  emptyTitle:     { fontSize: typography.size.lg, fontWeight: '700', color: colors.text },
  emptySub:       { fontSize: typography.size.sm, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },

  sectionTitle:   { fontSize: typography.size.md, fontWeight: '700', color: colors.text, marginBottom: spacing.md },

  predCard:       { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  predCardProcessed: { opacity: 0.7 },
  predHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  predDate:       { fontSize: typography.size.sm, fontWeight: '600', color: colors.text },
  aiBadge:        { backgroundColor: '#E3F2FD', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
  aiBadgeText:    { fontSize: typography.size.xs, color: '#1565C0', fontWeight: '600' },

  predCO2:        { fontSize: typography.size['2xl'], fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  predUnit:       { fontSize: typography.size.base, fontWeight: '400' },

  confRow:        { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  confLabel:      { fontSize: typography.size.xs, color: colors.textSecondary, width: 80 },
  confWrap:       { flex: 1, height: 6, backgroundColor: colors.g50, borderRadius: 3, overflow: 'hidden' },
  confFill:       { height: 6, borderRadius: 3 },

  actionRow:      { flexDirection: 'row', gap: spacing.md },
  actionBtn:      { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  rejectBtn:      { backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: '#FFCDD2' },
  rejectBtnText:  { color: colors.error, fontWeight: '700', fontSize: typography.size.sm },
  acceptBtn:      { backgroundColor: colors.g700 },
  acceptBtnText:  { color: '#fff', fontWeight: '700', fontSize: typography.size.sm },

  statusBadge:    { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
  statusText:     { fontSize: typography.size.xs, fontWeight: '700' },
});
