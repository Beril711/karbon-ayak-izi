// src/screens/ai/SocialContractScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../../theme';

const CONTRACTS = [
  {
    id: '1',
    title: '🚲 Bisiklet Taahhüdü',
    progress: 67,
    participants: 'Ali, Ayşe, Mehmet',
    daysLeft: 12,
    reward: '500 XP + Rozet',
    color: '#4CAF50',
  },
  {
    id: '2',
    title: '🥗 Vegan Hafta',
    progress: 45,
    participants: 'Zeynep, Can',
    daysLeft: 5,
    reward: '300 XP',
    color: '#FF9800',
  },
  {
    id: '3',
    title: '⚡ Enerji Tasarrufu',
    progress: 82,
    participants: 'Ali, Fatma, Burak, Elif',
    daysLeft: 3,
    reward: '750 XP + Ağaç Dikimi',
    color: '#4CAF50',
  },
];

export default function SocialContractScreen({ navigation }: any) {
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    Alert.alert('✅ Oluşturuldu', `"${newTitle}" sözleşmesi oluşturuldu!`);
    setNewTitle('');
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>🤝 Sosyal Sözleşmeler</Text>
          <Text style={styles.subtitle}>Karbon azaltma taahhütlerin</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* New Contract Button */}
        <TouchableOpacity style={styles.dashedBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.dashedBtnText}>➕ Yeni Sözleşme Oluştur</Text>
        </TouchableOpacity>

        {/* Contract Cards */}
        {CONTRACTS.map((c) => (
          <View key={c.id} style={[styles.card, { borderLeftColor: c.color }]}>
            <Text style={styles.cardTitle}>{c.title}</Text>

            <View style={styles.progressWrap}>
              <View style={styles.progressLabel}>
                <Text style={styles.progressText}>İlerleme</Text>
                <Text style={styles.progressPct}>{c.progress}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${c.progress}%`, backgroundColor: c.color }]} />
              </View>
            </View>

            <View style={styles.cardMeta}>
              <Text style={styles.metaText}>👥 {c.participants}</Text>
              <Text style={styles.metaText}>⏰ {c.daysLeft} gün kaldı</Text>
            </View>
            <Text style={styles.reward}>🏆 {c.reward}</Text>
          </View>
        ))}
      </ScrollView>

      {/* New Contract Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Yeni Sözleşme</Text>
            <TextInput
              style={styles.input}
              placeholder="Sözleşme başlığı..."
              placeholderTextColor={colors.textSecondary}
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
                <Text style={styles.createText}>Oluştur</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  dashedBtn:    { borderWidth: 2, borderColor: colors.g400, borderStyle: 'dashed', borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.lg },
  dashedBtnText:{ fontSize: typography.size.base, fontWeight: '700', color: colors.g600 },

  card:         { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderLeftWidth: 4, ...shadows.sm },
  cardTitle:    { fontSize: typography.size.base, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  progressWrap: { marginBottom: spacing.sm },
  progressLabel:{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressText: { fontSize: typography.size.xs, color: colors.textSecondary },
  progressPct:  { fontSize: typography.size.xs, fontWeight: '700', color: colors.text },
  progressTrack:{ height: 8, backgroundColor: colors.g50, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },
  cardMeta:     { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  metaText:     { fontSize: typography.size.xs, color: colors.textSecondary },
  reward:       { fontSize: typography.size.xs, fontWeight: '600', color: colors.g700, marginTop: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox:     { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.xl },
  modalTitle:   { fontSize: typography.size.lg, fontWeight: '800', color: colors.text, marginBottom: spacing.lg },
  input:        { backgroundColor: colors.background, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, fontSize: typography.size.base, color: colors.text, marginBottom: spacing.lg },
  modalBtns:    { flexDirection: 'row', gap: spacing.md },
  cancelBtn:    { flex: 1, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  cancelText:   { color: colors.textSecondary, fontWeight: '600' },
  createBtn:    { flex: 1, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.g600, alignItems: 'center' },
  createText:   { color: '#fff', fontWeight: '700' },
});