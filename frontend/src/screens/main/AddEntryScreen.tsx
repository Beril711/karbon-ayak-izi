// src/screens/main/AddEntryScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { addEntry, fetchCategories, fetchFactors, fetchTodaySummary } from '../../store/slices/emissionSlice';
import {
  View, Text, TouchableOpacity, ScrollView,
  TextInput, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { AppDispatch, RootState } from '../../store';
import { colors, spacing, radius, typography, shadows, getCategoryColor, getCategoryIcon } from '../../theme';
import { format } from 'date-fns';
import type { EmissionFactor } from '../../types';

type Step = 'category' | 'factor' | 'quantity';

interface Props {
  navigation: { goBack: () => void; navigate: (screen: string, params?: Record<string, unknown>) => void };
  route: { params?: { category?: string } };
}

export default function AddEntryScreen({ navigation, route }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, factors, isSubmitting } = useSelector((s: RootState) => s.emissions);

  const [step, setStep] = useState<Step>('category');
  const [selectedCategory, setCategory] = useState<string>(route.params?.category ?? '');
  const [selectedFactor, setFactor] = useState<EmissionFactor | null>(null);
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');

  useFocusEffect(
    useCallback(() => {
      setStep('category');
      setCategory(route.params?.category ?? '');
      setFactor(null);
      setQuantity('');
      setNote('');
      dispatch(fetchCategories());
    }, [])
  );

  useEffect(() => {
    if (selectedCategory) {
      dispatch(fetchFactors(selectedCategory));
      if (route.params?.category) setStep('factor');
    }
  }, [selectedCategory]);

  const handleSubmit = async () => {
    if (!selectedFactor || !quantity) return;
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Hata', 'Geçerli bir miktar girin.');
      return;
    }

    const result = await dispatch(addEntry({
      factor: selectedFactor.id,
      quantity: qty,
      note,
      date: format(new Date(), 'yyyy-MM-dd'),
    }));

    if (addEntry.fulfilled.match(result)) {
      dispatch(fetchTodaySummary());
      Alert.alert(
        '✅ Kaydedildi',
        `${selectedFactor.name_tr}: ${result.payload.co2_kg} kg CO₂`,
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert('Hata', 'Kayıt başarısız oldu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Sheet Handle */}
      <View style={styles.handleWrap}>
        <View style={styles.handle} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepBar}>
        {(['category', 'factor', 'quantity'] as Step[]).map((s, i) => {
          const isActive = step === s;
          const isDone = (step === 'factor' && i === 0) || (step === 'quantity' && i < 2);
          return (
            <View key={s} style={styles.stepItem}>
              <View style={[styles.stepDot, isActive && styles.stepDotActive, isDone && styles.stepDotDone]}>
                <Text style={[styles.stepNum, (isActive || isDone) && { color: '#fff' }]}>
                  {isDone ? '✓' : i + 1}
                </Text>
              </View>
              <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
                {['Kategori', 'Aktivite', 'Miktar'][i]}
              </Text>
            </View>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── STEP 1: Category Selection ── */}
        {step === 'category' && (
          <>
            <Text style={styles.stepTitle}>🌱 Emisyon Ekle</Text>
            <Text style={styles.stepDesc}>Hangi kategoride emisyon eklemek istiyorsun?</Text>

            <View style={styles.catGrid}>
              {categories.map((cat: any) => (
                <TouchableOpacity
                  key={cat.slug}
                  style={[styles.catCard, { borderColor: getCategoryColor(cat.slug) + '40' }]}
                  onPress={() => { setCategory(cat.slug); setStep('factor'); }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.catIconWrap, { backgroundColor: getCategoryColor(cat.slug) + '15' }]}>
                    <Text style={styles.catCardIcon}>{cat.icon || getCategoryIcon(cat.slug)}</Text>
                  </View>
                  <Text style={styles.catCardName}>{cat.name_tr}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* ── STEP 2: Factor Selection ── */}
        {step === 'factor' && (
          <>
            <TouchableOpacity onPress={() => setStep('category')} style={styles.backBtn}>
              <Text style={styles.backText}>← Geri</Text>
            </TouchableOpacity>
            <Text style={styles.stepTitle}>Aktivite Seçin</Text>
            <Text style={styles.stepDesc}>
              {getCategoryIcon(selectedCategory)} {selectedCategory} kategorisinden bir aktivite seç
            </Text>

            {factors.map((f: any) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.factorRow, selectedFactor?.id === f.id && styles.factorRowSelected]}
                onPress={() => { setFactor(f); setStep('quantity'); }}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.factorName}>{f.name_tr}</Text>
                  <Text style={styles.factorMeta}>{f.co2_per_unit} kg CO₂ / {f.unit}</Text>
                </View>
                <View style={[styles.factorArrow, selectedFactor?.id === f.id && styles.factorArrowSelected]}>
                  <Text style={{ color: selectedFactor?.id === f.id ? '#fff' : colors.textMuted }}>→</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* ── STEP 3: Quantity Input ── */}
        {step === 'quantity' && selectedFactor && (
          <>
            <TouchableOpacity onPress={() => setStep('factor')} style={styles.backBtn}>
              <Text style={styles.backText}>← Geri</Text>
            </TouchableOpacity>
            <Text style={styles.stepTitle}>Miktar Girin</Text>

            {/* Selected factor info */}
            <View style={styles.selectedInfo}>
              <View style={styles.selectedInfoLeft}>
                <Text style={styles.selectedIcon}>{getCategoryIcon(selectedCategory)}</Text>
                <View>
                  <Text style={styles.selectedName}>{selectedFactor.name_tr}</Text>
                  <Text style={styles.selectedMeta}>{selectedFactor.co2_per_unit} kg CO₂ / {selectedFactor.unit}</Text>
                </View>
              </View>
            </View>

            {/* Quantity input */}
            <Text style={styles.inputLabel}>Miktar ({selectedFactor.unit})</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              placeholder={`Örn: 5 ${selectedFactor.unit}`}
              placeholderTextColor={colors.textMuted}
              value={quantity}
              onChangeText={setQuantity}
              autoFocus
            />

            {/* Live CO2 preview */}
            {quantity && !isNaN(parseFloat(quantity)) && (
              <View style={styles.preview}>
                <Text style={styles.previewLabel}>Tahmini CO₂ Emisyonu</Text>
                <Text style={styles.previewValue}>
                  {(parseFloat(quantity) * selectedFactor.co2_per_unit).toFixed(3)}
                </Text>
                <Text style={styles.previewUnit}>kg CO₂</Text>
              </View>
            )}

            {/* Note */}
            <Text style={styles.inputLabel}>Not (opsiyonel)</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              multiline
              placeholder="Açıklama ekleyin..."
              placeholderTextColor={colors.textMuted}
              value={note}
              onChangeText={setNote}
            />

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, (!quantity || isSubmitting) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!quantity || isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitBtnText}>💾 Kaydet</Text>
              }
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Handle
  handleWrap: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    backgroundColor: colors.surface,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D4D4D4',
  },

  // Step Bar
  stepBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing['3xl'],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#E8E9EE',
    justifyContent: 'center', alignItems: 'center',
  },
  stepDotActive: { backgroundColor: colors.g500 },
  stepDotDone: { backgroundColor: colors.g400 },
  stepNum: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  stepLabel: { fontSize: typography.size.xs, color: colors.textSecondary, fontWeight: '500' },
  stepLabelActive: { color: colors.g700, fontWeight: '700' },

  // Content
  content: { padding: spacing.lg, paddingBottom: 120 },
  stepTitle: {
    fontSize: typography.size.xl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  stepDesc: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  backBtn: { marginBottom: spacing.md },
  backText: {
    color: colors.g600,
    fontWeight: '700',
    fontSize: typography.size.base,
  },

  // ── Category Grid (2-column) ──
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  catCard: {
    width: '47%',
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    ...shadows.sm,
  },
  catIconWrap: {
    width: 56, height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  catCardIcon: { fontSize: 30 },
  catCardName: {
    fontSize: typography.size.sm,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },

  // ── Factor List ──
  factorRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: colors.g100,
    ...shadows.sm,
  },
  factorRowSelected: {
    borderLeftColor: colors.g500,
    backgroundColor: '#F0FFF0',
  },
  factorName: {
    fontSize: typography.size.base,
    fontWeight: '700',
    color: colors.text,
  },
  factorMeta: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    marginTop: 3,
  },
  factorArrow: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.g50,
    justifyContent: 'center', alignItems: 'center',
    marginLeft: spacing.sm,
  },
  factorArrowSelected: {
    backgroundColor: colors.g500,
  },

  // ── Selected Info ──
  selectedInfo: {
    backgroundColor: colors.g50,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.g500,
  },
  selectedInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  selectedIcon: { fontSize: 28 },
  selectedName: {
    fontSize: typography.size.base,
    fontWeight: '700',
    color: colors.g700,
  },
  selectedMeta: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // ── Input ──
  inputLabel: {
    fontSize: typography.size.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.lg,
    fontSize: typography.size.base,
    color: colors.text,
    marginBottom: spacing.lg,
  },

  // ── CO2 Preview ──
  preview: {
    backgroundColor: colors.g700,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: typography.size.xs,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    marginBottom: 4,
  },
  previewValue: {
    fontSize: typography.size['3xl'],
    fontWeight: '900',
    color: '#fff',
  },
  previewUnit: {
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    marginTop: 2,
  },

  // ── Submit ──
  submitBtn: {
    backgroundColor: colors.g500,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.md,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: {
    color: '#fff',
    fontSize: typography.size.md,
    fontWeight: '700',
  },
});
