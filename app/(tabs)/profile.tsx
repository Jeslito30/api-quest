import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { fetchHistory, clearHistory } from '@/services/history';
import { COLORS, RADIUS, SPACING } from '@/constants/gemini-theme';

const { width } = Dimensions.get('window');
const logoSource = require('../../assets/logo/dawn_logo_nobg.png');

export default function ProfileScreen() {
  const { user, userId, signOut } = useAuth();
  const { clearConversations } = useChat();
  const [dbHistory, setDbHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Pull display name: prefer Clerk firstName, fall back to email prefix
  const primaryEmail = user?.emailAddresses?.[0]?.emailAddress ?? '';
  const userName = user?.firstName ?? primaryEmail.split('@')[0] ?? 'Explorer';
  const avatarUrl = user?.imageUrl;

  // Load Supabase history on mount
  useEffect(() => {
    if (!userId) return;
    setHistoryLoading(true);
    fetchHistory(userId, 200).then(({ data }) => {
      setDbHistory(data ?? []);
      setHistoryLoading(false);
    });
  }, [userId]);

  const historyStats = [
    { label: 'Total Prompts', value: dbHistory.length, icon: 'chatbubble-ellipses-outline', color: COLORS.modeChat },
    { label: 'Images Made', value: dbHistory.filter(h => h.type === 'image').length, icon: 'image-outline', color: COLORS.modeImage },
    { label: 'Slides Made', value: dbHistory.filter(h => h.type === 'slides').length, icon: 'stats-chart-outline', color: COLORS.modeSlides },
    { label: 'Videos Made', value: dbHistory.filter(h => h.type === 'video').length, icon: 'videocam-outline', color: COLORS.modeVideo },
  ];

  const settings = [
    { icon: 'notifications-outline', label: 'Notifications', action: () => {} },
    { icon: 'color-palette-outline', label: 'Appearance', action: () => {} },
    { icon: 'lock-closed-outline', label: 'Privacy & Security', action: () => {} },
    { icon: 'help-circle-outline', label: 'Help & Feedback', action: () => {} },
    { icon: 'document-text-outline', label: 'Terms of Service', action: () => {} },
  ];

  const handleClearAll = async () => {
    if (userId) await clearHistory(userId);
    clearConversations();
    setDbHistory([]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoWrapper}>
            <Image
              source={logoSource}
              style={styles.logoHeader}
              contentFit="contain"
              priority="high"
            />
          </View>
          <Text style={styles.appName}>Account</Text>
        </View>
        <TouchableOpacity style={styles.editBtn}>
          <Ionicons name="create-outline" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} transition={300} />
            ) : (
              <LinearGradient 
                colors={[COLORS.gradientStart, COLORS.gradientMid]} 
                style={styles.avatarPlaceholder}
              >
                <Text style={styles.avatarText}>{userName[0]?.toUpperCase()}</Text>
              </LinearGradient>
            )}
            <View style={styles.statusIndicator} />
          </View>
          
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{primaryEmail}</Text>
          
          <TouchableOpacity style={styles.planBadge}>
            <LinearGradient
              colors={[`${COLORS.accent}20`, `${COLORS.accent}05`]}
              style={styles.planBadgeGradient}
            >
              <Text style={styles.planBadgeText}>✦ Dawn AI Free</Text>
              <Ionicons name="chevron-forward" size={12} color={COLORS.accent} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Activity Section */}
        <Animated.View entering={FadeIn.delay(400).duration(800)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activity Overview</Text>
          </View>
          
          {historyLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator color={COLORS.accent} size="small" />
            </View>
          ) : (
            <View style={styles.statsGrid}>
              {historyStats.map((stat, i) => (
                <View key={i} style={styles.statCard}>
                  <View style={[styles.statIconBg, { backgroundColor: `${stat.color}15` }]}>
                    <Ionicons name={stat.icon as any} size={18} color={stat.color} />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Settings Group */}
        <Animated.View entering={FadeIn.delay(600).duration(800)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Preferences</Text>
          </View>
          <View style={styles.settingsGroup}>
            {settings.map((s, i) => (
              <TouchableOpacity 
                key={i} 
                style={[styles.settingRow, i < settings.length - 1 && styles.rowBorder]} 
                onPress={s.action}
                activeOpacity={0.7}
              >
                <View style={styles.settingIconBg}>
                  <Ionicons name={s.icon as any} size={18} color={COLORS.textSecondary} />
                </View>
                <Text style={styles.settingLabel}>{s.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Danger Zone */}
        <Animated.View entering={FadeIn.delay(800).duration(800)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Data Management</Text>
          </View>
          <View style={styles.settingsGroup}>
            <TouchableOpacity 
              style={styles.settingRow} 
              onPress={handleClearAll}
              activeOpacity={0.7}
            >
              <View style={[styles.settingIconBg, { backgroundColor: 'rgba(251, 188, 4, 0.1)' }]}>
                <Ionicons name="trash-outline" size={18} color={COLORS.warning} />
              </View>
              <Text style={[styles.settingLabel, { color: COLORS.warning }]}>Clear Session History</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Sign Out */}
        <Animated.View entering={FadeIn.delay(1000).duration(800)}>
          <TouchableOpacity 
            style={styles.signOutBtn} 
            onPress={() => signOut()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(234, 67, 53, 0.15)', 'rgba(234, 67, 53, 0.05)']}
              style={styles.signOutGradient}
            >
              <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.versionInfo}>Dawn AI • Version 1.0.0 (Stable)</Text>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingBottom: SPACING.xl },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: 60,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.bg,
    zIndex: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  logoHeader: { width: 28, height: 28 },
  appName: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    marginBottom: SPACING.md,
    position: 'relative',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  avatarText: { fontSize: 40, fontWeight: '700', color: '#fff' },
  statusIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    borderWidth: 3,
    borderColor: COLORS.bg,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  planBadge: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(79, 142, 247, 0.2)',
  },
  planBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  planBadgeText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '700',
  },

  sectionHeader: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  loaderContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - SPACING.md * 2 - 12) / 2,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.lg,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: '600',
  },

  settingsGroup: {
    marginHorizontal: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  settingIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  signOutBtn: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.xl,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(234, 67, 53, 0.2)',
  },
  signOutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  signOutText: {
    color: COLORS.error,
    fontWeight: '700',
    fontSize: 16,
  },
  versionInfo: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: SPACING.xl,
    fontWeight: '500',
  },
});

