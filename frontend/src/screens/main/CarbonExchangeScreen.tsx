// src/screens/main/CarbonExchangeScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../../theme';

const OFFERS = [
  { name: 'Ali K.', amount: '5 kredi', type: 'Satış', price: '₺5.80', color: '#F44336' },
  { name: 'Zeynep D.', amount: '10 kredi', type: 'Alış', price: '₺5.20', color: '#4CAF50' },
  { name: 'Can M.', amount: '3 kredi', type: 'Satış', price: '₺6.10', color: '#F44336' },
  { name: 'Fatma A.', amount: '8 kredi', type: 'Alış', price: '₺5.40', color: '#4CAF50' },
];

const CHART_POINTS = [70, 65, 60, 55, 50, 58, 65, 58, 42, 38, 30, 25, 22];

export default function CarbonExchangeScreen({ navigation }: any) {
  const [myCredits] = useState(12);

  const handleTrade = (type: 'Al' | 'Sat') => {
    Alert.alert(
      type === 'Al' ? '📈 Kredi Satın Al' : '📉 Kredi Sat',
      `${type === 'Al' ? 'Kaç kredi almak' : 'Kaç kredi satmak'} istiyorsunuz?\n\nGüncel fiyat: ₺5.65/kredi`,
      [
        { text: 'İptal', style: 'cancel' },
        { text: type, onPress: () => Alert.alert('✅ İşlem Gönderildi', 'Teklifiniz piyasaya iletildi.') },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>💱 Karbon Borsası</Text>
          <Text style={styles.subtitle}>Kampüs mikro karbon kredi ticareti</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Price Card */}
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Güncel Fiyat</Text>
              <Text style={styles.price}>₺5.65</Text>
              <Text style={styles.priceChange}>▲ +0.35 (6.2%)</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.priceLabel}>Hacim</Text>
              <Text style={styles.volume}>142</Text>
              <Text style={styles.priceLabel}>kredi/gün</Text>
            </View>
          </View>

          {/* Simple Chart */}
          <View style={styles.chartContainer}>
            <View style={styles.chartBars}>
              {CHART_POINTS.map((h, i) => (
                <View key={i} style={styles.chartBarWrap}>
                  <View style={[styles.chartBar, {
                    height: h,
                    backgroundColor: i === CHART_POINTS.length - 1
                      ? colors.g500
                      : `rgba(76,175,80,${0.3 + (i / CHART_POINTS.length) * 0.5})`,
                  }]} />
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* My Portfolio */}
        <View style={styles.portfolioCard}>
          <Text style={styles.portfolioLabel}>💼 Portföyüm</Text>
          <View style={styles.portfolioRow}>
            <View style={styles.portfolioStat}>
              <Text style={styles.portfolioValue}>{myCredits}</Text>
              <Text style={styles.portfolioUnit}>kredi</Text>
            </View>
            <View style={styles.portfolioDivider} />
            <View style={styles.portfolioStat}>
              <Text style={styles.portfolioValue}>₺{(myCredits * 5.65).toFixed(2)}</Text>
              <Text style={styles.portfolioUnit}>değer</Text>
            </View>
            <View style={styles.portfolioDivider} />
            <View style={styles.portfolioStat}>
              <Text style={[styles.portfolioValue, { color: colors.g500 }]}>+8.2%</Text>
              <Text style={styles.portfolioUnit}>bu hafta</Text>
            </View>
          </View>
        </View>

        {/* Trade Buttons */}
        <View style={styles.tradeRow}>
          <TouchableOpacity style={styles.buyBtn} onPress={() => handleTrade('Al')} activeOpacity={0.8}>
            <Text style={styles.buyBtnText}>📈 Al</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sellBtn} onPress={() => handleTrade('Sat')} activeOpacity={0.8}>
            <Text style={styles.sellBtnText}>📉 Sat</Text>
          </TouchableOpacity>
        </View>

        {/* Open Offers */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📋 Açık Teklifler</Text>
          {OFFERS.map((o, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.offerRow, i === OFFERS.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => Alert.alert('Teklif', `${o.name} - ${o.amount} @ ${o.price}`)}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.offerName}>{o.name}</Text>
                <Text style={styles.offerDetail}>{o.amount} • {o.type}</Text>
              </View>
              <View style={styles.offerRight}>
                <Text style={[styles.offerPrice, { color: o.color }]}>{o.price}</Text>
                <Text style={[styles.offerType, { color: o.color }]}>{o.type}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Karbon Kredisi Nedir?</Text>
          <Text style={styles.infoText}>
            Her kg CO₂ tasarrufu = 1 karbon kredisi. Kredilerini kampüs
            içinde diğer kullanıcılara satabilir, kafeterya indirimleri
            veya kitaplık önceliği gibi ödüllere dönüştürebilirsin.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.background },
  header:         { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.g50, justifyContent: 'center', alignItems: 'center' },
  backText:       { fontSize: 18, color: colors.g700, fontWeight: '700' },
  title:          { fontSize: typography.size.md, fontWeight: '900', color: colors.text },
  subtitle:       { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: 2 },

  content:        { padding: spacing.lg, paddingBottom: 100 },

  priceCard:      { backgroundColor: colors.g800, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md },
  priceRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  priceLabel:     { fontSize: typography.size.xs, color: colors.g300 },
  price:          { fontSize: 32, fontWeight: '900', color: '#fff', marginTop: 2 },
  priceChange:    { fontSize: typography.size.xs, color: '#66BB6A', fontWeight: '600', marginTop: 2 },
  volume:         { fontSize: 24, fontWeight: '700', color: '#fff', marginTop: 2 },

  chartContainer: { height: 80, justifyContent: 'flex-end' },
  chartBars:      { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 80 },
  chartBarWrap:   { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  chartBar:       { width: '100%', borderRadius: 2, minHeight: 4 },

  portfolioCard:  { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  portfolioLabel: { fontSize: typography.size.sm, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  portfolioRow:   { flexDirection: 'row', alignItems: 'center' },
  portfolioStat:  { flex: 1, alignItems: 'center' },
  portfolioValue: { fontSize: typography.size.lg, fontWeight: '800', color: colors.text },
  portfolioUnit:  { fontSize: 9, color: colors.textSecondary, marginTop: 2 },
  portfolioDivider: { width: 1, height: 36, backgroundColor: colors.border },

  tradeRow:       { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  buyBtn:         { flex: 1, backgroundColor: colors.g600, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', ...shadows.sm },
  buyBtnText:     { color: '#fff', fontWeight: '700', fontSize: typography.size.base },
  sellBtn:        { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', borderWidth: 2, borderColor: colors.border },
  sellBtnText:    { color: colors.text, fontWeight: '700', fontSize: typography.size.base },

  card:           { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  sectionTitle:   { fontSize: typography.size.base, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  offerRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  offerName:      { fontSize: typography.size.sm, fontWeight: '600', color: colors.text },
  offerDetail:    { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: 2 },
  offerRight:     { alignItems: 'flex-end' },
  offerPrice:     { fontSize: typography.size.sm, fontWeight: '700' },
  offerType:      { fontSize: 9, fontWeight: '600', marginTop: 2 },

  infoCard:       { backgroundColor: colors.g50, borderRadius: radius.lg, padding: spacing.lg, borderLeftWidth: 3, borderLeftColor: colors.g400 },
  infoTitle:      { fontSize: typography.size.sm, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  infoText:       { fontSize: typography.size.xs, color: colors.textSecondary, lineHeight: 18 },
});