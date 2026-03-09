// src/screens/ai/EmotionCarbonMapScreen.tsx
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../../theme';

const LOCATIONS = [
  { emoji: '😊', name: 'Kütüphane',  co2: 1.8,  people: 45,  pct: 72,  color: '#4CAF50' },
  { emoji: '😄', name: 'Kafeterya',  co2: 4.2,  people: 120, pct: 81,  color: '#FF9800' },
  { emoji: '😐', name: 'Laboratuvar',co2: 3.1,  people: 30,  pct: 55,  color: '#FF9800' },
  { emoji: '🤩', name: 'Spor Salonu',co2: 0.5,  people: 60,  pct: 88,  color: '#4CAF50' },
  { emoji: '😤', name: 'Otopark',    co2: 8.5,  people: 200, pct: 42,  color: '#F44336' },
  { emoji: '🥰', name: 'Bahçe',      co2: 0.2,  people: 80,  pct: 91,  color: '#4CAF50' },
];

export default function EmotionCarbonMapScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>🌊 Duygu-Karbon Haritası</Text>
          <Text style={styles.subtitle}>Mutluluk ve karbon korelasyonu: r = -0.72</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Insight Card */}
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>💡 Düşük karbon = Yüksek mutluluk</Text>
          <Text style={styles.insightSub}>Anonim kampüs verisine dayalı korelasyon</Text>
        </View>

        {/* Location Rows */}
        <View style={styles.card}>
          {LOCATIONS.map((loc, i) => (
            <View key={loc.name} style={[styles.row, i === LOCATIONS.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={styles.emoji}>{loc.emoji}</Text>
              <View style={styles.rowMiddle}>
                <Text style={styles.locName}>{loc.name}</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${loc.pct}%`, backgroundColor: loc.color }]} />
                </View>
              </View>
              <View style={styles.rowRight}>
                <Text style={[styles.co2Val, { color: loc.color }]}>{loc.co2} kg</Text>
                <Text style={styles.peopleVal}>{loc.people} kişi</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📌 Nasıl Hesaplanır?</Text>
          <Text style={styles.infoText}>
            Kullanıcıların emisyon girişi sonrası işaretlediği ruh hali verileri
            ile konuma göre ortalama CO₂ değerleri karşılaştırılır.
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

  insightCard:  { backgroundColor: colors.g700, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, alignItems: 'center' },
  insightTitle: { fontSize: typography.size.base, fontWeight: '700', color: '#fff', textAlign: 'center' },
  insightSub:   { fontSize: typography.size.xs, color: 'rgba(255,255,255,0.7)', marginTop: 4, textAlign: 'center' },

  card:         { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm },
  row:          { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  emoji:        { fontSize: 26, width: 36 },
  rowMiddle:    { flex: 1 },
  locName:      { fontSize: typography.size.sm, fontWeight: '600', color: colors.text, marginBottom: 6 },
  progressTrack:{ height: 6, backgroundColor: colors.g50, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  rowRight:     { alignItems: 'flex-end', minWidth: 55 },
  co2Val:       { fontSize: typography.size.sm, fontWeight: '700' },
  peopleVal:    { fontSize: 9, color: colors.textSecondary, marginTop: 2 },

  infoCard:     { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadows.sm },
  infoTitle:    { fontSize: typography.size.sm, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  infoText:     { fontSize: typography.size.xs, color: colors.textSecondary, lineHeight: 18 },
});