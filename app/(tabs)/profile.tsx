import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { fetchHistory, clearHistory } from '@/services/history';
import { COLORS, RADIUS, SPACING } from '@/constants/gemini-theme';

export default function ProfileScreen() {
  const { user, userId, signOut } = useAuth();
  const { conversations, clearConversations } = useChat();
  const [dbHistory, setDbHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Pull display name: prefer Clerk firstName, fall back to email prefix
  const primaryEmail = user?.emailAddresses?.[0]?.emailAddress ?? '';
  const userName = user?.firstName ?? primaryEmail.split('@')[0] ?? 'User';
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
    { label: 'Total Prompts', value: dbHistory.length, icon: '💬' },
    { label: 'Images Made', value: dbHistory.filter(h => h.type === 'image').length, icon: '🎨' },
    { label: 'Slides Made', value: dbHistory.filter(h => h.type === 'slides').length, icon: '📊' },
    { label: 'Videos Made', value: dbHistory.filter(h => h.type === 'video').length, icon: '🎬' },
  ];

  const settings = [
    { icon: '🔔', label: 'Notifications', action: () => {} },
    { icon: '🎨', label: 'Appearance', action: () => {} },
    { icon: '🔒', label: 'Privacy & Security', action: () => {} },
    { icon: '❓', label: 'Help & Feedback', action: () => {} },
    { icon: '📋', label: 'Terms of Service', action: () => {} },
  ];

  const handleClearAll = async () => {
    if (userId) await clearHistory(userId);
    clearConversations();
    setDbHistory([]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* User Card */}
      <View style={styles.userCard}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        ) : (
          <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]} style={styles.avatar}>
            <Text style={styles.avatarText}>{userName[0]?.toUpperCase()}</Text>
          </LinearGradient>
        )}
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userEmail}>{primaryEmail}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✦ Dawn AI Free</Text>
        </View>
      </View>

      {/* Stats from Supabase */}
      <Text style={styles.sectionLabel}>Activity</Text>
      {historyLoading ? (
        <ActivityIndicator color={COLORS.accent} style={{ marginVertical: SPACING.md }} />
      ) : (
        <View style={styles.statsGrid}>
          {historyStats.map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Settings */}
      <Text style={styles.sectionLabel}>Settings</Text>
      <View style={styles.settingsCard}>
        {settings.map((s, i) => (
          <TouchableOpacity key={i} style={[styles.settingRow, i < settings.length - 1 && styles.settingRowBorder]} onPress={s.action}>
            <Text style={styles.settingIcon}>{s.icon}</Text>
            <Text style={styles.settingLabel}>{s.label}</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Data */}
      <Text style={styles.sectionLabel}>Data</Text>
      <View style={styles.settingsCard}>
        <TouchableOpacity style={styles.settingRow} onPress={handleClearAll}>
          <Text style={styles.settingIcon}>🗑️</Text>
          <Text style={[styles.settingLabel, { color: COLORS.warning }]}>Clear All Conversations</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signOutBtn} onPress={() => signOut()}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Dawn AI v1.0.0</Text>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingBottom: SPACING.xl },
  header: { paddingHorizontal: SPACING.md, paddingTop: 56, paddingBottom: SPACING.sm },
  headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },

  userCard: { alignItems: 'center', paddingVertical: SPACING.xl, paddingHorizontal: SPACING.md },
  avatar: { width: 80, height: 80, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  avatarImage: { width: 80, height: 80, borderRadius: 28, marginBottom: SPACING.md },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  userName: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  userEmail: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  badge: { backgroundColor: COLORS.accentSoft, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.accentGlow },
  badgeText: { color: COLORS.accent, fontSize: 12, fontWeight: '600' },

  sectionLabel: { fontSize: 11, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '600', paddingHorizontal: SPACING.md, marginBottom: SPACING.sm, marginTop: SPACING.lg },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.md, gap: SPACING.sm },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statIcon: { fontSize: 20, marginBottom: SPACING.xs },
  statValue: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, textAlign: 'center' },

  settingsCard: { marginHorizontal: SPACING.md, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 14, gap: SPACING.md },
  settingRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  settingIcon: { fontSize: 16, width: 24, textAlign: 'center' },
  settingLabel: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  settingArrow: { fontSize: 20, color: COLORS.textMuted },

  signOutBtn: { marginHorizontal: SPACING.md, marginTop: SPACING.lg, backgroundColor: 'rgba(234,67,53,0.12)', borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(234,67,53,0.3)' },
  signOutText: { color: COLORS.error, fontWeight: '600', fontSize: 15 },

  version: { textAlign: 'center', color: COLORS.textMuted, fontSize: 11, marginTop: SPACING.lg },
});
