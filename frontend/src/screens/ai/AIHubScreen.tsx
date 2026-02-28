// src/screens/ai/AIHubScreen.tsx
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../../theme';

const AI_FEATURES = [
  {
    key:      'CarbonDNA',
    icon:     '🧬',
    title:    'Karbon DNA',
    subtitle: '6 kategorideki benzersiz karbon parmak izin',
    bg:       colors.g900,
    accent:   colors.g400,
    badge:    'YENİ',
  },
  {
    key:      'CarbonTwin',
    icon:     '🤖',
    title:    'Karbon İkizi',
    subtitle: 'Alternatif yaşam senaryoları ve tasarruf potansiyeli',
    bg:       '#1A1A2E',
    accent:   '#64B5F6',
  },
  {
    key:      'TimeMachine',
    icon:     '⏰',
    title:    'Zaman Makinesi',
    subtitle: '10 yıllık emisyon projeksiyonu (3 senaryo)',
    bg:       '#1B0000',
    accent:   '#EF9A9A',
  },
  {
    key:      'CarbonMemory',
    icon:     '💭',
    title:    'Karbon Hafıza',
    subtitle: 'K-NN ile eksik günlerin otomatik tahmini',
    bg:       '#0D1B2A',
    accent:   '#90CAF9',
  },
  {
    key:      'CarbonEmotion',
    icon:     '🎭',
    title:    'Karbon Duyguları',
    subtitle: 'Emisyon ve ruh hali korelasyon analizi',
    bg:       '#1A0033',
    accent:   '#CE93D8',
  },
];

export default function AIHubScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Başlık */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🤖</Text>
        <Text style={styles.headerTitle}>AI Özellikleri</Text>
        <Text style={styles.headerSub}>
          Yapay zeka destekli kişisel karbon analizi
        </Text>
      </View>

      {/* Özellik kartları */}
      {AI_FEATURES.map(feat => (
        <TouchableOpacity
          key={feat.key}
          style={[styles.featureCard, { backgroundColor: feat.bg }]}
          onPress={() => navigation.navigate(feat.key)}
          activeOpacity={0.85}
        >
          <View style={styles.featureLeft}>
            <Text style={styles.featureIcon}>{feat.icon}</Text>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Text style={styles.featureTitle}>{feat.title}</Text>
                {feat.badge && (
                  <View style={[styles.badgePill, { backgroundColor: feat.accent + '30' }]}>
                    <Text style={[styles.badgeText, { color: feat.accent }]}>{feat.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.featureSub, { color: feat.accent + 'CC' }]}>{feat.subtitle}</Text>
            </View>
          </View>
          <Text style={[styles.arrow, { color: feat.accent }]}>›</Text>
        </TouchableOpacity>
      ))}

      {/* Alt not */}
      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerTitle}>🔬 Hakkında</Text>
        <Text style={styles.disclaimerText}>
          AI özellikleri, geçmiş emisyon verilerinizi kullanarak tahminler üretir.
          Tüm AI çıktıları tahmini değerlerdir ve "AI tarafından üretilmiştir" olarak etiketlenmiştir.
          Tahminleri onaylamadan önce doğrulayın.
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: colors.background },
  content:       { padding: spacing.lg, paddingBottom: spacing['4xl'] },

  header:        { alignItems: 'center', paddingVertical: spacing['2xl'], marginBottom: spacing.md },
  headerEmoji:   { fontSize: 48, marginBottom: spacing.sm },
  headerTitle:   { fontSize: typography.size['2xl'], fontWeight: '800', color: colors.text },
  headerSub:     { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: 4 },

  featureCard:   { borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', ...shadows.md },
  featureLeft:   { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  featureIcon:   { fontSize: 36 },
  featureTitle:  { fontSize: typography.size.md, fontWeight: '700', color: '#fff', marginBottom: 2 },
  featureSub:    { fontSize: typography.size.xs, lineHeight: 18 },
  badgePill:     { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  badgeText:     { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  arrow:         { fontSize: 28, fontWeight: '300' },

  disclaimerBox: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.md, ...shadows.sm },
  disclaimerTitle:{ fontSize: typography.size.base, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  disclaimerText:{ fontSize: typography.size.sm, color: colors.textSecondary, lineHeight: 20 },
});
