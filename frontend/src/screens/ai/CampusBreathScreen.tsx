// src/screens/ai/CampusBreathScreen.tsx
import React, { useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../../theme';

const CHALLENGES = [
  { title: '🏃 Merdiven Günü', pct: 80, xp: '+30 XP', type: 'Günlük' },
  { title: '👹 Karbon Canavarı', pct: 45, xp: '+500 XP', type: 'Boss' },
  { title: '🧬 DNA Evrimi', pct: 62, xp: '+400 XP', type: 'Özel' },
];

export default function CampusBreathScreen({ navigation }: any) {
  const pulse1 = useRef(new Animated.Value(52)).current;
  const pulse2 = useRef(new Animated.Value(34)).current;
  const pulse3 = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    const animate = (anim: Animated.Value, min: number, max: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: max, duration: 2000, useNativeDriver: false }),
          Animated.timing(anim, { toValue: min, duration: 2000, useNativeDriver: false }),
        ])
      ).start();

    animate(pulse1, 52, 62);
    animate(pulse2, 34, 44);
    animate(pulse3, 18, 24);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>🫁 Kampüs Nefesi</Text>
          <Text style={styles.subtitle}>Kampüsün anlık karbon ritmini hisset</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Animated Pulse Card */}
        <View style={styles.darkCard}>
          <View style={styles.darkCardHeader}>
            <Text style={styles.darkCardTitle}>🫁 Kampüs Nefesi</Text>
            <Text style={styles.watching}>127 kişi izliyor</Text>
          </View>

          <View style={styles.pulseContainer}>
            <Animated.View style={[styles.circle, styles.circle1, {
              width: Animated.multiply(pulse1, 2),
              height: Animated.multiply(pulse1, 2),
              borderRadius: pulse1,
            }]} />
            <Animated.View style={[styles.circle, styles.circle2, {
              width: Animated.multiply(pulse2, 2),
              height: Animated.multiply(pulse2, 2),
              borderRadius: pulse2,
            }]} />
            <Animated.View style={[styles.circle, styles.circle3, {
              width: Animated.multiply(pulse3, 2),
              height: Animated.multiply(pulse3, 2),
              borderRadius: pulse3,
            }]} />
            <View style={styles.centerText}>
              <Text style={styles.co2Number}>187</Text>
              <Text style={styles.co2Unit}>kg CO₂/saat</Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusDot}>🟡</Text>
            <Text style={styles.statusText}>Normal Nefes</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Anlık', value: '187', unit: 'kg/saat' },
            { label: 'Günlük', value: '2.4K', unit: 'kg CO₂' },
            { label: 'Aktif', value: '127', unit: 'kişi' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statUnit}>{s.unit}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Active Challenges */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>⚔️ Aktif Görevler</Text>
          {CHALLENGES.map((c, i) => (
            <View key={i} style={[styles.challengeRow, i === CHALLENGES.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.challengeName}>{c.title}</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, {
                    width: `${c.pct}%`,
                    backgroundColor: c.pct > 60 ? colors.g500 : '#FF9800',
                  }]} />
                </View>
              </View>
              <View style={styles.xpWrap}>
                <Text style={styles.xpText}>{c.xp}</Text>
                <Text style={styles.typeText}>{c.type}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Nasıl Çalışır?</Text>
          <Text style={styles.infoText}>
            Kampüsteki tüm kullanıcıların anlık emisyon verileri toplanarak
            kampüsün "karbon nefes ritmi" hesaplanır. Yeşil bölgede kalmak
            için emisyonunu düşük tut!
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

  darkCard:     { backgroundColor: '#1A1A2E', borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md },
  darkCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  darkCardTitle:{ fontSize: typography.size.base, fontWeight: '700', color: '#fff' },
  watching:     { fontSize: typography.size.xs, color: 'rgba(255,255,255,0.6)' },

  pulseContainer: { alignItems: 'center', justifyContent: 'center', height: 160, marginBottom: spacing.md },
  circle:       { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  circle1:      { backgroundColor: 'rgba(255,152,0,0.15)', borderWidth: 1, borderColor: 'rgba(255,152,0,0.3)' },
  circle2:      { backgroundColor: 'rgba(255,152,0,0.2)' },
  circle3:      { backgroundColor: 'rgba(255,152,0,0.55)' },
  centerText:   { alignItems: 'center', zIndex: 10 },
  co2Number:    { fontSize: 20, fontWeight: '900', color: '#fff' },
  co2Unit:      { fontSize: 9, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  statusRow:    { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  statusDot:    { fontSize: 14 },
  statusText:   { fontSize: typography.size.sm, fontWeight: '700', color: '#FFB74D' },

  statsRow:     { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statCard:     { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', ...shadows.sm },
  statValue:    { fontSize: typography.size.lg, fontWeight: '900', color: colors.text },
  statUnit:     { fontSize: 9, color: colors.textSecondary, marginTop: 2 },
  statLabel:    { fontSize: typography.size.xs, color: colors.g600, fontWeight: '600', marginTop: 4 },

  card:         { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  sectionTitle: { fontSize: typography.size.base, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  challengeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  challengeName:{ fontSize: typography.size.sm, fontWeight: '600', color: colors.text, marginBottom: 6 },
  progressTrack:{ height: 6, backgroundColor: colors.g50, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  xpWrap:       { alignItems: 'flex-end' },
  xpText:       { fontSize: typography.size.xs, fontWeight: '700', color: colors.g700 },
  typeText:     { fontSize: 9, color: colors.textSecondary, marginTop: 2 },

  infoCard:     { backgroundColor: colors.g50, borderRadius: radius.lg, padding: spacing.lg, borderLeftWidth: 3, borderLeftColor: colors.g400 },
  infoTitle:    { fontSize: typography.size.sm, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  infoText:     { fontSize: typography.size.xs, color: colors.textSecondary, lineHeight: 18 },
});