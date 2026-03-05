// src/screens/main/ExploreScreen.tsx
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Platform,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import { useDrawer } from '../../navigation/DrawerContext';
import Svg, { Path } from 'react-native-svg';

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
  borderColor: string;
  screen?: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: '🧬',
    title: 'Karbon DNA',
    description: '6 kategoride benzersiz karbon parmak izini keşfet',
    borderColor: '#4CAF50',
    screen: 'CarbonDNA',
  },
  {
    icon: '👥',
    title: 'Karbon İkizi',
    description: 'Alternatif yaşam senaryolarını karşılaştır',
    borderColor: '#42A5F5',
    screen: 'CarbonTwin',
  },
  {
    icon: '🌬️',
    title: 'Kampüs Nefesi',
    description: 'Kampüsün anlık karbon ritmini hisset',
    borderColor: '#26A69A',
  },
  {
    icon: '⏳',
    title: 'Zaman Makinesi',
    description: '10 yıllık karbon projeksiyon senaryoların',
    borderColor: '#FF9800',
    screen: 'TimeMachine',
  },
  {
    icon: '💹',
    title: 'Karbon Borsası',
    description: 'Karbon kredileri al-sat, portföy yönet',
    borderColor: '#7C4DFF',
    screen: 'CarbonExchange',
  },
  {
    icon: '😊',
    title: 'Duygu-Karbon Haritası',
    description: 'Duygularınla karbon ayak izin arasındaki bağlantı',
    borderColor: '#E91E63',
    screen: 'EmotionCarbon',
  },
  {
    icon: '🤝',
    title: 'Sosyal Sözleşme',
    description: 'Arkadaşlarınla sürdürülebilirlik sözleşmeleri',
    borderColor: '#FF9800',
    screen: 'SocialContract',
  },
  {
    icon: '🎵',
    title: 'Karbon Senfonisi',
    description: 'Karbon verilerini müziğe dönüştür',
    borderColor: '#AB47BC',
    screen: 'CarbonSymphony',
  },
  {
    icon: '🧠',
    title: 'Karbon Hafıza',
    description: 'AI ile eksik günleri tahmin et',
    borderColor: '#42A5F5',
    screen: 'CarbonMemory',
  },
  {
    icon: '💚',
    title: 'Bio-Senkronizasyon',
    description: 'Sağlığın = Gezegenin sağlığı',
    borderColor: '#26A69A',
    screen: 'BioSync',
  },
];

export default function ExploreScreen({ navigation }: any) {
  const drawer = useDrawer();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          <TouchableOpacity onPress={drawer.open} style={styles.menuBtn}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path d="M3 6H21M3 12H21M3 18H21" stroke={colors.g800} strokeWidth="2" strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>🚀 Keşfet</Text>
            <Text style={styles.subtitle}>Yenilikçi karbon özellikleri</Text>
          </View>
        </View>
      </View>

      {/* Feature List */}
      {FEATURES.map((feature, idx) => (
        <TouchableOpacity
          key={idx}
          style={[styles.featureCard, { borderLeftColor: feature.borderColor }]}
          activeOpacity={0.7}
          onPress={() => {
            if (feature.screen) {
              navigation.navigate(feature.screen);
            }
          }}
        >
          <View style={styles.featureContent}>
            <Text style={styles.featureIcon}>{feature.icon}</Text>
            <View style={styles.featureTextWrap}>
              <Text style={styles.featureName}>{feature.title}</Text>
              <Text style={styles.featureDesc}>{feature.description}</Text>
            </View>
            <View style={styles.featureArrow}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M9 18L15 12L9 6" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing['4xl'] },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  menuBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Feature Cards
  featureCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureName: {
    fontSize: typography.size.base,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  featureArrow: {
    padding: 4,
  },
});
