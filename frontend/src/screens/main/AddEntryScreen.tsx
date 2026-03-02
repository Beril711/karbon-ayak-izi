// src/screens/main/AddEntryScreen.tsx
import React, { useState, useEffect } from 'react';
import { addEntry, fetchCategories, fetchFactors, fetchTodaySummary } from '../../store/slices/emissionSlice';
import {
  View, Text, TouchableOpacity, ScrollView,
  TextInput, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { colors, spacing, radius, typography, shadows, getCategoryColor, getCategoryIcon } from '../../theme';
import { format } from 'date-fns';

type Step = 'category' | 'factor' | 'quantity';

export default function AddEntryScreen({ navigation, route }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, factors, isSubmitting } = useSelector((s: RootState) => s.emissions);

  const [step, setStep] = useState<Step>('category');
  const [selectedCategory, setCategory] = useState<string>(route.params?.category ?? '');
  const [selectedFactor, setFactor] = useState<any>(null);
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      dispatch(fetchFactors(selectedCategory));
      if (route.params?.category) setStep('factor');
    }
  }, [selectedCategory]);

  const filteredFactors = factors.filter(
    (f: any) => f.category_name || true // API slug'ına göre filtrele
  );

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
      dispatch(fetchTodaySummary()); // bunu ekle
      Alert.alert(
        '✅ Kaydedildi',
        `${selectedFactor.name_tr}: ${result.payload.co2_kg} kg CO₂`,
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Adım göstergesi */}
      <View style={styles.stepBar}>
        {(['category', 'factor', 'quantity'] as Step[]).map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.stepDot, step === s && styles.stepDotActive, (step === 'factor' && i === 0 || step === 'quantity' && i < 2) && styles.stepDotDone]}>
              <Text style={styles.stepNum}>{i + 1}</Text>
            </View>
            <Text style={styles.stepLabel}>{['Kategori', 'Aktivite', 'Miktar'][i]}</Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ADIM 1: Kategori Seç */}
        {step === 'category' && (
          <>
            <Text style={styles.stepTitle}>Kategori Seçin</Text>
            <View style={styles.grid}>
              {categories.map((cat: any) => (
                <TouchableOpacity
                  key={cat.slug}
                  style={[styles.catCard, { borderColor: getCategoryColor(cat.slug) }]}
                  onPress={() => { setCategory(cat.slug); setStep('factor'); }}
                >
                  <Text style={styles.catCardIcon}>{cat.icon || getCategoryIcon(cat.slug)}</Text>
                  <Text style={styles.catCardName}>{cat.name_tr}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* ADIM 2: Faktör Seç */}
        {step === 'factor' && (
          <>
            <TouchableOpacity onPress={() => setStep('category')}>
              <Text style={styles.back}>← Geri</Text>
            </TouchableOpacity>
            <Text style={styles.stepTitle}>Aktivite Seçin</Text>
            {factors.map((f: any) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.factorRow, selectedFactor?.id === f.id && styles.factorRowSelected]}
                onPress={() => { setFactor(f); setStep('quantity'); }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.factorName}>{f.name_tr}</Text>
                  <Text style={styles.factorMeta}>{f.co2_per_unit} kg CO₂ / {f.unit}</Text>
                </View>
                {selectedFactor?.id === f.id && <Text>✅</Text>}
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* ADIM 3: Miktar Gir */}
        {step === 'quantity' && selectedFactor && (
          <>
            <TouchableOpacity onPress={() => setStep('factor')}>
              <Text style={styles.back}>← Geri</Text>
            </TouchableOpacity>
            <Text style={styles.stepTitle}>Miktar Girin</Text>

            <View style={styles.selectedInfo}>
              <Text style={styles.selectedName}>{selectedFactor.name_tr}</Text>
              <Text style={styles.selectedMeta}>{selectedFactor.co2_per_unit} kg CO₂ / {selectedFactor.unit}</Text>
            </View>

            <Text style={styles.inputLabel}>Miktar ({selectedFactor.unit})</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              placeholder={`Örn: 5 ${selectedFactor.unit}`}
              value={quantity}
              onChangeText={setQuantity}
              autoFocus
            />

            {/* Anlık CO2 hesaplama */}
            {quantity && !isNaN(parseFloat(quantity)) && (
              <View style={styles.preview}>
                <Text style={styles.previewLabel}>Tahmini CO₂</Text>
                <Text style={styles.previewValue}>
                  {(parseFloat(quantity) * selectedFactor.co2_per_unit).toFixed(3)} kg
                </Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Not (opsiyonel)</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              multiline
              placeholder="Açıklama ekleyin..."
              value={note}
              onChangeText={setNote}
            />

            <TouchableOpacity
              style={[styles.submitBtn, (!quantity || isSubmitting) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!quantity || isSubmitting}
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
  stepBar: { flexDirection: 'row', justifyContent: 'center', gap: spacing['3xl'], padding: spacing.lg, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.g100, justifyContent: 'center', alignItems: 'center' },
  stepDotActive: { backgroundColor: colors.g700 },
  stepDotDone: { backgroundColor: colors.g500 },
  stepNum: { fontSize: 12, fontWeight: '700', color: '#fff' },
  stepLabel: { fontSize: typography.size.xs, color: colors.textSecondary },

  content: { padding: spacing.lg, paddingBottom: 100 },
  stepTitle: { fontSize: typography.size.xl, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  back: { color: colors.g700, fontWeight: '600', marginBottom: spacing.lg },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  catCard: { width: '30%', aspectRatio: 1, borderRadius: radius.lg, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 2, ...shadows.sm },
  catCardIcon: { fontSize: 28 },
  catCardName: { fontSize: typography.size.xs, fontWeight: '600', color: colors.text, marginTop: 4, textAlign: 'center' },

  factorRow: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', ...shadows.sm },
  factorRowSelected: { borderWidth: 2, borderColor: colors.g500 },
  factorName: { fontSize: typography.size.base, fontWeight: '600', color: colors.text },
  factorMeta: { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: 2 },

  selectedInfo: { backgroundColor: colors.g50, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  selectedName: { fontSize: typography.size.base, fontWeight: '700', color: colors.g800 },
  selectedMeta: { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: 2 },

  inputLabel: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  input: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, fontSize: typography.size.base, color: colors.text, marginBottom: spacing.lg },

  preview: { backgroundColor: colors.g800, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, alignItems: 'center' },
  previewLabel: { fontSize: typography.size.xs, color: colors.g300 },
  previewValue: { fontSize: typography.size['2xl'], fontWeight: '800', color: '#fff', marginTop: 2 },

  submitBtn: { backgroundColor: colors.g700, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', marginTop: spacing.md },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#fff', fontSize: typography.size.base, fontWeight: '700' },
});
