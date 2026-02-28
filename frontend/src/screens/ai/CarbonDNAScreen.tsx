// src/screens/ai/CarbonDNAScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, TouchableOpacity, Dimensions,
} from 'react-native';
import { colors, spacing, radius, typography, shadows, getCategoryColor, getCategoryIcon } from '../../theme';
import api from '../../services/api';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { key: 'transport', label: 'Ulaşım' },
  { key: 'energy',    label: 'Enerji' },
  { key: 'food',      label: 'Beslenme' },
  { key: 'waste',     label: 'Atık' },
  { key: 'water',     label: 'Su' },
  { key: 'digital',   label: 'Dijital' },
];

const SCORE_LABELS = [
  { max: 20,  label: 'Mükemmel 🌟', color: '#2E7D32' },
  { max: 40,  label: 'İyi 👍',      color: '#43A047' },
  { max: 60,  label: 'Orta ⚖️',    color: '#FFA726' },
  { max: 80,  label: 'Yüksek ⚠️',  color: '#EF6C00' },
  { max: 100, label: 'Kritik 🔴',   color: '#C62828' },
];

function getScoreLabel(score: number) {
  return SCORE_LABELS.find(s => score <= s.max) ?? SCORE_LABELS[SCORE_LABELS.length - 1];
}

export default function CarbonDNAScreen() {
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/ai/dna/');
      setData(res.data);
    } catch {
      setError('Veri yüklenemedi. Lütfen birkaç gün emisyon girişi yapın.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.g500} /></View>;

  if (error) return (
    <View style={styles.center}>
      <Text style={styles.errorEmoji}>🔬</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={load}>
        <Text style={styles.retryText}>Tekrar Dene</Text>
      </TouchableOpacity>
    </View>
  );

  const scores: Record<string, number> = data?.scores ?? {};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Profil başlığı */}
      <View style={styles.dnaCard}>
        <Text style={styles.dnaEmoji}>🧬</Text>
        <Text style={styles.profileLabel}>{data?.profile_label}</Text>
        <Text style={styles.periodNote}>Son {data?.period_days ?? 0} günün analizi</Text>

        {/* DNA Sekans kodu */}
        <View style={styles.seqWrap}>
          {(data?.dna_sequence ?? '').split('').map((char: string, i: number) => (
            <Text
              key={i}
              style={[
                styles.seqChar,
                char === 'A' && { color: '#4CAF50' },
                char === 'C' && { color: '#2196F3' },
                char === 'G' && { color: '#FF9800' },
                char === 'T' && { color: '#F44336' },
                (i + 1) % 4 === 0 && { marginRight: spacing.sm },
              ]}
            >
              {char}
            </Text>
          ))}
        </View>
        <Text style={styles.seqNote}>
          <Text style={{ color: '#4CAF50' }}>A</Text>{'=Düşük  '}
          <Text style={{ color: '#2196F3' }}>C</Text>{'=Orta  '}
          <Text style={{ color: '#FF9800' }}>G</Text>{'=Yüksek  '}
          <Text style={{ color: '#F44336' }}>T</Text>={'=Kritik'}
        </Text>
      </View>

      {/* Kategori skorları */}
      <Text style={styles.sectionTitle}>Kategori Analizi</Text>
      {CATEGORIES.map(({ key, label }) => {
        const score     = scores[key] ?? 0;
        const scoreInfo = getScoreLabel(score);
        return (
          <View key={key} style={styles.catCard}>
            <View style={styles.catHeader}>
              <Text style={styles.catEmoji}>{getCategoryIcon(key)}</Text>
              <Text style={styles.catName}>{label}</Text>
              <View style={[styles.catBadge, { backgroundColor: scoreInfo.color + '20' }]}>
                <Text style={[styles.catBadgeText, { color: scoreInfo.color }]}>{scoreInfo.label}</Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, {
                width: `${score}%`,
                backgroundColor: getCategoryColor(key),
              }]} />
              {/* Referans çizgisi (%50) */}
              <View style={styles.refLine} />
            </View>

            <View style={styles.progressLabels}>
              <Text style={styles.progressMin}>0 — İdeal</Text>
              <Text style={[styles.progressScore, { color: scoreInfo.color }]}>{score}/100</Text>
              <Text style={styles.progressMax}>100 — Kritik</Text>
            </View>
          </View>
        );
      })}

      {/* Genel tavsiye */}
      <View style={styles.adviceCard}>
        <Text style={styles.adviceTitle}>🌿 Tavsiye</Text>
        {_getAdvice(scores).map((advice, i) => (
          <Text key={i} style={styles.adviceItem}>• {advice}</Text>
        ))}
      </View>

    </ScrollView>
  );
}

function _getAdvice(scores: Record<string, number>): string[] {
  const advice: string[] = [];
  if ((scores.transport ?? 0) > 50) advice.push('Ulaşımda otobüs veya metro kullanımını artırın.');
  if ((scores.food ?? 0) > 50)      advice.push('Haftada 2-3 gün et tüketimini azaltmayı deneyin.');
  if ((scores.energy ?? 0) > 50)    advice.push('Kullanmadığınız elektronik cihazları kapatın.');
  if ((scores.digital ?? 0) > 50)   advice.push('Video akışı yerine zaman zaman podcast dinleyin.');
  if (advice.length === 0)           advice.push('Harika gidiyorsunuz! 🌱 Mevcut alışkanlıklarınızı sürdürün.');
  return advice;
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.background },
  content:        { padding: spacing.lg, paddingBottom: spacing['4xl'] },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing['2xl'] },

  dnaCard:        { backgroundColor: colors.g800, borderRadius: radius.xl, padding: spacing['2xl'], alignItems: 'center', marginBottom: spacing.lg, ...shadows.lg },
  dnaEmoji:       { fontSize: 48, marginBottom: spacing.sm },
  profileLabel:   { fontSize: typography.size.xl, fontWeight: '800', color: '#fff', marginBottom: 4 },
  periodNote:     { fontSize: typography.size.xs, color: colors.g300, marginBottom: spacing.lg },

  seqWrap:        { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  seqChar:        { fontFamily: 'monospace', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  seqNote:        { fontSize: typography.size.xs, color: colors.g300 },

  sectionTitle:   { fontSize: typography.size.md, fontWeight: '700', color: colors.text, marginBottom: spacing.md },

  catCard:        { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
  catHeader:      { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  catEmoji:       { fontSize: 20 },
  catName:        { flex: 1, fontSize: typography.size.base, fontWeight: '600', color: colors.text },
  catBadge:       { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
  catBadgeText:   { fontSize: typography.size.xs, fontWeight: '700' },

  progressTrack:  { height: 10, backgroundColor: colors.g50, borderRadius: 5, overflow: 'hidden', marginBottom: 4, position: 'relative' },
  progressFill:   { height: 10, borderRadius: 5 },
  refLine:        { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(0,0,0,0.2)' },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressMin:    { fontSize: 9, color: colors.g400 },
  progressScore:  { fontSize: typography.size.sm, fontWeight: '700' },
  progressMax:    { fontSize: 9, color: colors.error },

  adviceCard:     { backgroundColor: colors.g50, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.md },
  adviceTitle:    { fontSize: typography.size.md, fontWeight: '700', color: colors.g800, marginBottom: spacing.md },
  adviceItem:     { fontSize: typography.size.sm, color: colors.text, lineHeight: 22, marginBottom: 4 },

  errorEmoji:     { fontSize: 48, marginBottom: spacing.md },
  errorText:      { fontSize: typography.size.base, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  retryBtn:       { marginTop: spacing.lg, backgroundColor: colors.g700, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.full },
  retryText:      { color: '#fff', fontWeight: '700' },
});
