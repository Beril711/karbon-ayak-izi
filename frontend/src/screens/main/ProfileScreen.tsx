// src/screens/main/ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import { useDrawer } from '../../navigation/DrawerContext';
import api from '../../services/api';
import type { Badge, GamificationStatus, LeaderboardData } from '../../types';
import Svg, { Path } from 'react-native-svg';

const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#B9F2FF',
};

export default function ProfileScreen({ navigation }: any) {
  const { user } = useSelector((s: RootState) => s.auth);
  const drawer = useDrawer();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [xpData, setXpData] = useState<GamificationStatus | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bRes, gRes, lRes] = await Promise.all([
        api.get('/gamification/badges/'),
        api.get('/gamification/status/'),
        api.get('/gamification/leaderboard/'),
      ]);
      setBadges(bRes.data);
      setXpData(gRes.data);
      setLeaderboard(lRes.data);
    } catch (err) {
      Alert.alert('Hata', 'Profil verileri yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.g600} /></View>;
  }

  const earnedBadges = badges.filter(b => b.earned);
  const lockedBadges = badges.filter(b => !b.earned);
  const xpToNext = xpData?.xp?.xp_to_next ?? 0;
  const totalXP = xpData?.xp?.total ?? 0;
  const level = xpData?.xp?.level ?? 1;
  const thresholds = xpData?.xp?.level_thresholds ?? [0, 100];
  const levelStart = thresholds[level - 1] ?? 0;
  const levelEnd = thresholds[level] ?? 100;
  const levelProgress = levelEnd > levelStart
    ? ((totalXP - levelStart) / (levelEnd - levelStart)) * 100
    : 0;
  const currentStreak = xpData?.streak?.current ?? 0;
  const longestStreak = xpData?.streak?.longest ?? 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          <TouchableOpacity onPress={drawer.open} style={styles.menuBtn}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path d="M3 6H21M3 12H21M3 18H21" stroke={colors.g800} strokeWidth="2" strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
          <View>
            <Text style={styles.titleText}>👤 Profil</Text>
            <Text style={styles.subtitleText}>Yeşil yolculuğun</Text>
          </View>
        </View>
      </View>

      {/* ── HERO CARD (Dark) ── */}
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.heroAvatar}>
            <Text style={styles.heroAvatarText}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </Text>
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{user?.full_name}</Text>
            <Text style={styles.heroRole}>
              {user?.role === 'student' ? '🎓 Öğrenci' : '👨‍🏫 Personel'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.heroEditBtn}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.heroEditText}>✏️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatEmoji}>🌳</Text>
            <Text style={styles.heroStatValue}>{level}</Text>
            <Text style={styles.heroStatLabel}>Seviye</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatEmoji}>⚡</Text>
            <Text style={styles.heroStatValue}>{totalXP}</Text>
            <Text style={styles.heroStatLabel}>XP</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatEmoji}>🔥</Text>
            <Text style={styles.heroStatValue}>{currentStreak}</Text>
            <Text style={styles.heroStatLabel}>Gün Seri</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatEmoji}>🏅</Text>
            <Text style={styles.heroStatValue}>{earnedBadges.length}</Text>
            <Text style={styles.heroStatLabel}>Rozet</Text>
          </View>
        </View>

        {/* XP Bar */}
        <View style={styles.heroXpRow}>
          <Text style={styles.heroXpLabel}>Lv.{level}</Text>
          <View style={styles.heroXpTrack}>
            <View style={[styles.heroXpFill, { width: `${Math.min(100, levelProgress)}%` }]} />
          </View>
          <Text style={styles.heroXpLabel}>Lv.{level + 1}</Text>
        </View>
        <Text style={styles.heroXpHint}>{xpToNext} XP kaldı</Text>
      </View>

      {/* ── BADGES GRID (5x2) ── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🏅 Rozetler</Text>
          <Text style={styles.cardSub}>{earnedBadges.length}/{badges.length}</Text>
        </View>
        <View style={styles.badgeGrid}>
          {badges.slice(0, 10).map((b) => (
            <View key={b.id} style={[styles.badgeItem, !b.earned && styles.badgeLocked]}>
              <View style={[styles.badgeCircle, {
                borderColor: b.earned ? (TIER_COLORS[b.tier] ?? colors.g400) : colors.border,
                backgroundColor: b.earned ? 'rgba(76,175,80,0.1)' : colors.background,
              }]}>
                <Text style={[styles.badgeEmoji, !b.earned && { opacity: 0.3 }]}>{b.icon}</Text>
              </View>
              <Text style={[styles.badgeName, !b.earned && { color: colors.textMuted }]} numberOfLines={1}>
                {b.name}
              </Text>
            </View>
          ))}
        </View>
        {badges.length > 10 && (
          <TouchableOpacity style={styles.showAllBtn}>
            <Text style={styles.showAllText}>Tümünü Gör ({badges.length}) →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── GREEN STORY ── */}
      <View style={[styles.card, styles.storyCard]}>
        <Text style={styles.storyTitle}>📖 Yeşil Hikaye</Text>
        <View style={styles.storyTimeline}>
          <View style={styles.storyItem}>
            <View style={[styles.storyDot, { backgroundColor: colors.g500 }]} />
            <View style={styles.storyContent}>
              <Text style={styles.storyDate}>Bu Hafta</Text>
              <Text style={styles.storyText}>
                {currentStreak > 0
                  ? `🔥 ${currentStreak} günlük seri devam ediyor!`
                  : '💪 Yeni bir seri başlat!'
                }
              </Text>
            </View>
          </View>
          <View style={styles.storyItem}>
            <View style={[styles.storyDot, { backgroundColor: '#42A5F5' }]} />
            <View style={styles.storyContent}>
              <Text style={styles.storyDate}>Başarılar</Text>
              <Text style={styles.storyText}>
                {earnedBadges.length > 0
                  ? `🏅 ${earnedBadges.length} rozet kazandın!`
                  : '🎯 İlk rozetini kazanmak için devam et!'
                }
              </Text>
            </View>
          </View>
          <View style={styles.storyItem}>
            <View style={[styles.storyDot, { backgroundColor: '#FF9800' }]} />
            <View style={styles.storyContent}>
              <Text style={styles.storyDate}>Seviye</Text>
              <Text style={styles.storyText}>
                ⚡ Seviye {level} — {totalXP} XP toplandı
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── LEADERBOARD ── */}
      {leaderboard && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏆 Liderlik Tablosu</Text>

          {leaderboard.my_rank && (
            <View style={styles.myRankCard}>
              <Text style={styles.myRankLabel}>Senin Sıran</Text>
              <Text style={styles.myRankNumber}>#{leaderboard.my_rank}</Text>
              <Text style={styles.myRankCo2}>{leaderboard.my_co2?.toFixed(1)} kg CO₂</Text>
            </View>
          )}

          {leaderboard.top_users?.slice(0, 5).map((entry: any, idx: number) => (
            <View key={idx} style={styles.leaderRow}>
              <View style={styles.leaderRank}>
                <Text style={styles.leaderRankText}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                </Text>
              </View>
              <View style={styles.leaderInfo}>
                <Text style={styles.leaderName} numberOfLines={1}>{entry.name}</Text>
              </View>
              <Text style={styles.leaderCo2}>{entry.total_co2?.toFixed(1)} kg</Text>
            </View>
          ))}
        </View>
      )}

      {/* ── QUICK STATS ── */}
      <View style={styles.quickStatsRow}>
        <View style={[styles.quickStatCard, { backgroundColor: '#E8F5E9' }]}>
          <Text style={styles.quickStatEmoji}>🏆</Text>
          <Text style={styles.quickStatValue}>{longestStreak}</Text>
          <Text style={styles.quickStatLabel}>En Uzun Seri</Text>
        </View>
        <View style={[styles.quickStatCard, { backgroundColor: '#E3F2FD' }]}>
          <Text style={styles.quickStatEmoji}>📝</Text>
          <Text style={styles.quickStatValue}>{totalXP}</Text>
          <Text style={styles.quickStatLabel}>Toplam XP</Text>
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing['4xl'] },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  menuBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  titleText: {
    fontSize: typography.size.xl,
    fontWeight: '700',
    color: colors.text,
  },
  subtitleText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // ── Hero Card ──
  heroCard: {
    backgroundColor: colors.g800,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  heroAvatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: colors.g600,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  heroAvatarText: { color: '#fff', fontSize: typography.size.xl, fontWeight: '800' },
  heroInfo: { flex: 1 },
  heroName: {
    fontSize: typography.size.lg,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroRole: {
    fontSize: typography.size.xs,
    color: colors.g300,
    marginTop: 2,
  },
  heroEditBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroEditText: { fontSize: 16 },

  heroStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroStat: { alignItems: 'center', flex: 1 },
  heroStatEmoji: { fontSize: 18, marginBottom: 4 },
  heroStatValue: {
    fontSize: typography.size.lg,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroStatLabel: {
    fontSize: 9,
    color: colors.g300,
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  heroXpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  heroXpLabel: {
    fontSize: 10,
    color: colors.g300,
    fontWeight: '600',
  },
  heroXpTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  heroXpFill: {
    height: 6,
    backgroundColor: colors.g400,
    borderRadius: 3,
  },
  heroXpHint: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 4,
  },

  // ── Cards ──
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.size.base,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  cardSub: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
  },

  // ── Badges ──
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badgeItem: {
    width: '18%',
    alignItems: 'center',
    gap: 4,
  },
  badgeLocked: { opacity: 0.5 },
  badgeCircle: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  badgeEmoji: { fontSize: 20 },
  badgeName: {
    fontSize: 8,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  showAllBtn: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  showAllText: {
    fontSize: typography.size.xs,
    color: colors.g700,
    fontWeight: '600',
  },

  // ── Green Story ──
  storyCard: {
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.15)',
  },
  storyTitle: {
    fontSize: typography.size.base,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  storyTimeline: {
    gap: spacing.md,
  },
  storyItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  storyDot: {
    width: 10, height: 10, borderRadius: 5,
    marginTop: 4,
  },
  storyContent: { flex: 1 },
  storyDate: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  storyText: {
    fontSize: typography.size.sm,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 18,
  },

  // ── Leaderboard ──
  myRankCard: {
    backgroundColor: colors.g50,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.2)',
  },
  myRankLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  myRankNumber: {
    fontSize: typography.size['2xl'],
    fontWeight: '900',
    color: colors.g800,
  },
  myRankCo2: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
  },

  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: spacing.md,
  },
  leaderRank: {
    width: 30,
    alignItems: 'center',
  },
  leaderRankText: {
    fontSize: typography.size.base,
    fontWeight: '700',
  },
  leaderInfo: { flex: 1 },
  leaderName: {
    fontSize: typography.size.sm,
    fontWeight: '600',
    color: colors.text,
  },
  leaderCo2: {
    fontSize: typography.size.sm,
    fontWeight: '700',
    color: colors.g700,
  },

  // ── Quick Stats ──
  quickStatsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  quickStatCard: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  quickStatEmoji: { fontSize: 24, marginBottom: 6 },
  quickStatValue: {
    fontSize: typography.size.xl,
    fontWeight: '900',
    color: colors.text,
  },
  quickStatLabel: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
