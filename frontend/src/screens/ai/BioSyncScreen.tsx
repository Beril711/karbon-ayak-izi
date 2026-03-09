// src/screens/ai/BioSyncScreen.tsx
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../../theme';

const BIO_STATS = [
  { emoji: '👣', value: '8,432', label: '6.5 km yürüyüş' },
  { emoji: '❤️', value: '72', label: 'bpm ortalama' },
  { emoji: '😴', value: '7.5', label: 'saat uyku' },
  { emoji: '🏃', value: '45', label: 'aktif dakika' },
];

const CONNECTIONS = [
  { label: 'Yürüyerek tasarruf', value: '1.11 kg CO₂', color: colors.g700 },
  { label: 'Sağlık Skoru', value: '78/100', color: '#26A69A' },
  { label: 'Yeşil Skor', value: '72/100', color: colors.g700 },
];

export default function BioSyncScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>💚 Bio-Senkronizasyon</Text>
          <Text style={styles.subtitle}>Sağlığın = Gezegenin sağlığı</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Banner */}
        <View style={styles.bannerCard}>
          <Text style={styles.bannerEmoji}>💚</Text>
          <Text style={styles.bannerTitle}>Bugünkü Bio Durumun</Text>
          <Text style={styles.bannerSub}>Sağlıklı yaşam karbon tasarrufunu artırıyor</Text>
        </View>

        {/* Bio Stats Grid */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📊 Sağlık Verileri</Text>
          <View style={styles.statsGrid}>
            {BIO_STATS.map((s, i) => (
              <View key={i} style={styles.statBox}>
                <Text style={styles.statEmoji}>{s.emoji}</Text>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Carbon-Health Connection */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🔗 Karbon-Sağlık Bağlantısı</Text>
          {CONNECTIONS.map((c, i) => (
            <View key={i} style={[styles.connRow, i === CONNECTIONS.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={styles.connLabel}>{c.label}</Text>
              <Text style={[styles.connValue, { color: c.color }]}>{c.value}</Text>
            </View>
          ))}
          <View style={styles.greenBadge}>
            <Text style={styles.greenBadgeText}>💚 Sağlıklı yaşam = Düşük karbon ayak izi</Text>
          </View>
        </View>

        {/* Weekly Progress */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📅 Haftalık İlerleme</Text>
          {[
            { day: 'Pzt', steps: 9200, co2: 0.8, good: true },
            { day: 'Sal', steps: 6100, co2: 2.1, good: false },
            { day: 'Çar', steps: 8432, co2: 1.1, good: true },
            { day: 'Per', steps: 7800, co2: 1.4, good: true },
            { day: 'Cum', steps: 5200, co2: 3.2, good: false },
          ].map((d, i) => (
            <View key={i} style={[styles.weekRow, i === 4 && { borderBottomWidth: 0 }]}>
              <Text style={styles.weekDay}>{d.day}</Text>
              <View style={styles.weekBar}>
                <View style={[styles.weekFill, {
                  width: `${(d.steps / 10000) * 100}%`,
                  backgroundColor: d.good ? colors.g500 : '#FF9800',
                }]} />
              </View>
              <Text style={styles.weekSteps}>{(d.steps / 1000).toFixed(1)}k</Text>
              <Text style={[styles.weekCo2, { color: d.good ? colors.g600 : '#FF9800' }]}>
                {d.co2} kg
              </Text>
            </View>
          ))}
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Bugünkü Öneri</Text>
          <Text style={styles.tipsText}>
            Bugün 8.432 adım attın! 10.000 adım hedefine 1.568 adım kaldı.
            Yürüyerek hedefe ulaşırsan ~0.3 kg daha CO₂ tasarrufu yapabilirsin.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.background },
  header:       { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.g50, justifyContent: 'center', alignItems: 'center' },
  backText:     { fontSize: 18, color: colors.g700, fontWeight: '700' },
  title:        { fontSize: typography.size.md, fontWeight: '900', color: colors.text },
  subtitle:     { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: 2 },

  content:      { padding: spacing.lg, paddingBottom: 100 },

  bannerCard:   { backgroundColor: '#E8F5E9', borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.md, borderWidth: 1, borderColor: '#C8E6C9' },
  bannerEmoji:  { fontSize: 40, marginBottom: spacing.sm },
  bannerTitle:  { fontSize: typography.size.lg, fontWeight: '800', color: colors.g800, textAlign: 'center' },
  bannerSub:    { fontSize: typography.size.xs, color: colors.g600, marginTop: 4, textAlign: 'center' },

  card:         { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  sectionTitle: { fontSize: typography.size.base, fontWeight: '700', color: colors.text, marginBottom: spacing.md },

  statsGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statBox:      { width: '47%', backgroundColor: colors.g50, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  statEmoji:    { fontSize: 24, marginBottom: 4 },
  statValue:    { fontSize: typography.size.xl, fontWeight: '900', color: colors.text },
  statLabel:    { fontSize: 9, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },

  connRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  connLabel:    { fontSize: typography.size.sm, color: colors.textSecondary },
  connValue:    { fontSize: typography.size.sm, fontWeight: '700' },
  greenBadge:   { backgroundColor: 'rgba(76,175,80,0.1)', borderRadius: radius.sm, padding: spacing.sm, marginTop: spacing.md, alignItems: 'center' },
  greenBadgeText: { fontSize: typography.size.xs, color: colors.g800, fontWeight: '600', textAlign: 'center' },

  weekRow:      { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
  weekDay:      { width: 28, fontSize: typography.size.xs, fontWeight: '600', color: colors.textSecondary },
  weekBar:      { flex: 1, height: 6, backgroundColor: colors.g50, borderRadius: 3, overflow: 'hidden' },
  weekFill:     { height: 6, borderRadius: 3 },
  weekSteps:    { width: 32, fontSize: typography.size.xs, color: colors.text, fontWeight: '600', textAlign: 'right' },
  weekCo2:      { width: 40, fontSize: typography.size.xs, fontWeight: '700', textAlign: 'right' },

  tipsCard:     { backgroundColor: colors.g700, borderRadius: radius.lg, padding: spacing.lg },
  tipsTitle:    { fontSize: typography.size.base, fontWeight: '700', color: '#fff', marginBottom: spacing.sm },
  tipsText:     { fontSize: typography.size.xs, color: 'rgba(255,255,255,0.8)', lineHeight: 18 },
});