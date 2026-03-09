// src/screens/ai/CarbonSymphonyScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../../theme';

const NOTES = [
  { day: 'Pzt', note: 'E4', height: 55, color: '#EF5350' },
  { day: 'Sal', note: 'C4', height: 38, color: '#FFB74D' },
  { day: 'Çar', note: 'G4', height: 68, color: '#EF5350' },
  { day: 'Per', note: 'D4', height: 48, color: '#FFB74D' },
  { day: 'Cum', note: 'A4', height: 82, color: '#EF5350' },
  { day: 'Cmt', note: 'C4', height: 30, color: '#66BB6A' },
  { day: 'Paz', note: 'B3', height: 22, color: '#66BB6A' },
];

export default function CarbonSymphonyScreen({ navigation }: any) {
  const [playing, setPlaying] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>🎵 Karbon Senfonisi</Text>
          <Text style={styles.subtitle}>Emisyon verilerin müziğe dönüştü</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Music Card */}
        <View style={styles.musicCard}>
          <Text style={styles.musicTitle}>🎼 Bu Haftanın Melodisi</Text>
          <Text style={styles.musicMood}>🎭 Dramatik (yüksek emisyon)</Text>

          {/* Note Bars */}
          <View style={styles.notesRow}>
            {NOTES.map((n) => (
              <View key={n.day} style={styles.noteWrap}>
                <View style={styles.noteBarContainer}>
                  <View style={[styles.noteBar, {
                    height: n.height,
                    backgroundColor: n.color,
                    opacity: playing ? 1 : 0.7,
                  }]} />
                </View>
                <Text style={styles.noteLabel}>{n.note}</Text>
                <Text style={styles.dayLabel}>{n.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Play Button */}
        <TouchableOpacity
          style={[styles.playBtn, playing && styles.playBtnActive]}
          onPress={() => setPlaying(!playing)}
          activeOpacity={0.8}
        >
          <Text style={styles.playBtnText}>
            {playing ? '⏸ Durdur' : '▶️ Senfonini Dinle'}
          </Text>
        </TouchableOpacity>

        {/* Sound Map */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Ses Haritası</Text>
          <Text style={styles.cardText}>
            Yüksek emisyon = Yüksek notalar (dramatik){'\n'}
            Düşük emisyon = Alçak notalar (huzurlu)
          </Text>
          <View style={styles.divider} />
          <View style={styles.tempoRow}>
            <View style={styles.tempoChip}>
              <Text style={styles.tempoLabel}>Tempo</Text>
              <Text style={styles.tempoVal}>115 BPM</Text>
            </View>
            <View style={styles.tempoChip}>
              <Text style={styles.tempoLabel}>Ton</Text>
              <Text style={styles.tempoVal}>A Minör</Text>
            </View>
            <View style={styles.tempoChip}>
              <Text style={styles.tempoLabel}>Süre</Text>
              <Text style={styles.tempoVal}>2:34</Text>
            </View>
          </View>
        </View>

        {/* History */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎵 Önceki Senfoniler</Text>
          {[
            { week: 'Geçen Hafta', mood: '🌿 Huzurlu', co2: '12.4 kg' },
            { week: '2 Hafta Önce', mood: '⚡ Enerjik', co2: '18.7 kg' },
            { week: '3 Hafta Önce', mood: '🌧 Melankolik', co2: '22.1 kg' },
          ].map((h, i) => (
            <View key={i} style={[styles.historyRow, i === 2 && { borderBottomWidth: 0 }]}>
              <View>
                <Text style={styles.historyWeek}>{h.week}</Text>
                <Text style={styles.historyMood}>{h.mood}</Text>
              </View>
              <Text style={styles.historyCo2}>{h.co2}</Text>
            </View>
          ))}
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

  musicCard:    { background: 'transparent', backgroundColor: '#1A1A2E', borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  musicTitle:   { fontSize: typography.size.base, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 4 },
  musicMood:    { fontSize: typography.size.xs, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: spacing.lg },

  notesRow:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: spacing.sm, height: 120 },
  noteWrap:     { alignItems: 'center', gap: 4 },
  noteBarContainer: { height: 90, justifyContent: 'flex-end' },
  noteBar:      { width: 28, borderRadius: 4 },
  noteLabel:    { fontSize: 8, color: '#aaa' },
  dayLabel:     { fontSize: 8, color: '#666' },

  playBtn:      { borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.md, backgroundColor: '#E91E63' },
  playBtnActive:{ backgroundColor: '#9C27B0' },
  playBtnText:  { color: '#fff', fontWeight: '700', fontSize: typography.size.base },

  card:         { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  cardTitle:    { fontSize: typography.size.sm, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  cardText:     { fontSize: typography.size.xs, color: colors.textSecondary, lineHeight: 18 },
  divider:      { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  tempoRow:     { flexDirection: 'row', gap: spacing.sm },
  tempoChip:    { flex: 1, backgroundColor: colors.g50, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center' },
  tempoLabel:   { fontSize: 9, color: colors.textSecondary, marginBottom: 2 },
  tempoVal:     { fontSize: typography.size.sm, fontWeight: '700', color: colors.g700 },

  historyRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  historyWeek:  { fontSize: typography.size.sm, fontWeight: '600', color: colors.text },
  historyMood:  { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: 2 },
  historyCo2:   { fontSize: typography.size.sm, fontWeight: '700', color: colors.g600 },
});