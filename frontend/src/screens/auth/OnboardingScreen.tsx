// src/screens/auth/OnboardingScreen.tsx
import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  FlatList, Animated,
} from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key:         '1',
    icon:        '🌍',
    title:       'Karbon Ayak İzini Ölç',
    description: 'Ulaşım, enerji, beslenme, atık, su ve dijital aktivitelerinden kaynaklanan CO₂ emisyonunu günlük takip et.',
  },
  {
    key:         '2',
    icon:        '🎮',
    title:       'Oyunlaştırılmış Deneyim',
    description: 'Her girişte XP kazan, serileri kır, rozetler topla ve haftalık liderboardda yerini al.',
  },
  {
    key:         '3',
    icon:        '🤖',
    title:       'Yapay Zeka Destekli Analiz',
    description: 'Karbon DNA\'n, ikiz senaryolar ve 10 yıllık projeksiyon ile alışkanlıklarını dönüştür.',
  },
  {
    key:         '4',
    icon:        '🏛️',
    title:       'Kampüs Topluluğu',
    description: 'Üniversite\'nin genel karbon ayak izini göster, akıllı sözleşmelerle grup hedefleri oluştur.',
  },
];

export default function OnboardingScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX     = useRef(new Animated.Value(0)).current;

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.slideIcon}>{item.icon}</Text>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideDesc}>{item.description}</Text>
          </View>
        )}
      />

      {/* Dot göstergesi */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange, outputRange: [8, 24, 8], extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i}
              style={[styles.dot, { width: dotWidth, opacity }]}
            />
          );
        })}
      </View>

      {/* Butonlar */}
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.btnPrimary} onPress={goNext}>
          <Text style={styles.btnPrimaryText}>
            {currentIndex === SLIDES.length - 1 ? '🚀 Başlayalım' : 'Devam →'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.replace('Login')}>
          <Text style={styles.skipText}>Atla</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: colors.background,
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingVertical: spacing['4xl'],
  },
  slide: {
    width,
    alignItems:     'center',
    paddingHorizontal: spacing['3xl'],
    justifyContent: 'center',
    flex:           1,
  },
  slideIcon:  { fontSize: 80, marginBottom: spacing['3xl'] },
  slideTitle: {
    fontSize:    typography.size['2xl'],
    fontWeight:  '800',
    color:       colors.text,
    textAlign:   'center',
    marginBottom: spacing.lg,
  },
  slideDesc: {
    fontSize:  typography.size.base,
    color:     colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    gap:           spacing.sm,
    marginVertical: spacing.xl,
  },
  dot: {
    height:       8,
    borderRadius: 4,
    backgroundColor: colors.g600,
  },
  buttons: {
    width:      '100%',
    paddingHorizontal: spacing['3xl'],
    alignItems: 'center',
    gap:        spacing.md,
  },
  btnPrimary: {
    width:           '100%',
    backgroundColor: colors.g700,
    borderRadius:    radius.lg,
    paddingVertical: spacing.lg,
    alignItems:      'center',
    shadowColor:     colors.g800,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.3,
    shadowRadius:    8,
    elevation:       6,
  },
  btnPrimaryText: {
    color:      '#fff',
    fontSize:   typography.size.base,
    fontWeight: '700',
  },
  skipText: {
    color:    colors.textSecondary,
    fontSize: typography.size.sm,
  },
});
