import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, FlatList, Dimensions, Keyboard,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import {
  generateText, generateImageUrl, generateVideoScript,
  generateSlides, generateAudioUrl,
} from '@/services/api';
import { COLORS, RADIUS, SPACING } from '@/constants/gemini-theme';

const { width } = Dimensions.get('window');

const MODES = [
  { id: 'chat',   label: 'Chat',          icon: '💬', color: COLORS.modeChat,   desc: 'Ask anything' },
  { id: 'image',  label: 'Create Image',  icon: '🎨', color: COLORS.modeImage,  desc: 'Generate images' },
  { id: 'video',  label: 'Create Video',  icon: '🎬', color: COLORS.modeVideo,  desc: 'Video scripts' },
  { id: 'slides', label: 'Create Slides', icon: '📊', color: COLORS.modeSlides, desc: 'Presentations' },
  { id: 'audio',  label: 'Create Audio',  icon: '🎵', color: COLORS.modeAudio,  desc: 'Text to speech' },
  { id: 'more',   label: 'More',          icon: '✦',  color: COLORS.modeMore,   desc: 'Explore more' },
];

const SUGGESTIONS = [
  'Explain quantum computing simply',
  'Write a poem about the ocean',
  'Help me plan a healthy meal',
  'Debug my React Native code',
  'Summarize the history of AI',
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { addConversation, setActiveMode } = useChat();
  const [prompt, setPrompt] = useState('');
  const [selectedMode, setSelectedMode] = useState('chat');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const userName = user?.email?.split('@')[0] ?? 'there';
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleSend = async (text) => {
    const query = text || prompt;
    if (!query.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    setActiveMode(selectedMode);

    try {
      let result = null;
      let type = selectedMode;

      if (selectedMode === 'chat') {
        result = await generateText(query);
      } else if (selectedMode === 'image') {
        result = generateImageUrl(query);
      } else if (selectedMode === 'video') {
        result = await generateVideoScript(query);
      } else if (selectedMode === 'slides') {
        result = await generateSlides(query);
      } else if (selectedMode === 'audio') {
        const script = await generateText(`Write a short, engaging audio script about: ${query}. Keep it under 300 words.`);
        result = { script, audioUrl: generateAudioUrl(script) };
      } else {
        result = await generateText(query);
        type = 'chat';
      }

      addConversation({ id: Date.now().toString(), prompt: query, result, type, timestamp: new Date() });
      setPrompt('');
      router.push('/data');
    } catch (err) {
      addConversation({
        id: Date.now().toString(), prompt: query,
        result: `Error: ${err.message || 'Something went wrong. Please try again.'}`,
        type: 'error', timestamp: new Date(),
      });
      router.push('/data');
    } finally {
      setLoading(false);
    }
  };

  const ModeChip = ({ mode }) => {
    const active = selectedMode === mode.id;
    return (
      <TouchableOpacity
        style={[styles.modeChip, active && { borderColor: mode.color, backgroundColor: `${mode.color}20` }]}
        onPress={() => setSelectedMode(mode.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.modeIcon}>{mode.icon}</Text>
        <Text style={[styles.modeLabel, active && { color: mode.color }]}>{mode.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.logoSmall}
            >
              <Text style={styles.logoSmallText}>✦</Text>
            </LinearGradient>
            <Text style={styles.appName}>Gemini</Text>
          </View>
          <TouchableOpacity onPress={signOut} style={styles.avatarBtn}>
            <LinearGradient
              colors={[COLORS.accent, COLORS.gradientMid]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{userName[0]?.toUpperCase()}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>
            <Text style={styles.greetingHello}>{greeting()}, {userName}</Text>
          </Text>
          <LinearGradient
            colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ borderRadius: RADIUS.sm }}
          >
            <Text style={styles.greetingSubtitle}>How can I help you today?</Text>
          </LinearGradient>
        </View>

        {/* Mode Filters */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>What would you like to create?</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modesRow} contentContainerStyle={{ paddingHorizontal: SPACING.md }}>
          {MODES.map((m) => <ModeChip key={m.id} mode={m} />)}
        </ScrollView>

        {/* Prompt Input */}
        <View style={styles.inputCard}>
          <TextInput
            ref={inputRef}
            style={styles.promptInput}
            placeholder={`Ask Gemini to ${MODES.find(m => m.id === selectedMode)?.desc.toLowerCase() ?? 'help you'}...`}
            placeholderTextColor={COLORS.textMuted}
            value={prompt}
            onChangeText={setPrompt}
            multiline
            maxLength={2000}
          />
          <View style={styles.inputActions}>
            <Text style={styles.charCount}>{prompt.length}/2000</Text>
            <TouchableOpacity
              style={[styles.sendBtn, (!prompt.trim() || loading) && styles.sendBtnDisabled]}
              onPress={() => handleSend()}
              disabled={!prompt.trim() || loading}
            >
              <LinearGradient
                colors={prompt.trim() && !loading ? [COLORS.gradientStart, COLORS.gradientMid] : [COLORS.bgSurface, COLORS.bgSurface]}
                style={styles.sendBtnGradient}
              >
                {loading
                  ? <Text style={styles.sendIcon}>⏳</Text>
                  : <Text style={styles.sendIcon}>▶</Text>
                }
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Suggestions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Suggestions</Text>
        </View>
        <FlatList
          data={SUGGESTIONS}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SPACING.md }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionChip}
              onPress={() => { setPrompt(item); handleSend(item); }}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Feature Cards */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Explore capabilities</Text>
        </View>
        <View style={styles.featureGrid}>
          {MODES.filter(m => m.id !== 'more').map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={styles.featureCard}
              onPress={() => setSelectedMode(mode.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.featureIconBg, { backgroundColor: `${mode.color}20` }]}>
                <Text style={styles.featureIcon}>{mode.icon}</Text>
              </View>
              <Text style={[styles.featureLabel, { color: mode.color }]}>{mode.label}</Text>
              <Text style={styles.featureDesc}>{mode.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: SPACING.xl },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingTop: 56, paddingBottom: SPACING.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoSmall: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  logoSmallText: { fontSize: 18, color: '#fff' },
  appName: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.3 },
  avatarBtn: {},
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  greetingSection: { paddingHorizontal: SPACING.md, marginTop: SPACING.md, marginBottom: SPACING.lg },
  greetingHello: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary },
  greetingText: { marginBottom: SPACING.xs },
  greetingSubtitle: {
    fontSize: 20, fontWeight: '600',
    paddingVertical: 2, paddingHorizontal: 0,
    // gradient text trick: bg will show as gradient, text transparent
    color: '#fff', opacity: 0.85,
  },

  sectionHeader: { paddingHorizontal: SPACING.md, marginBottom: SPACING.sm, marginTop: SPACING.lg },
  sectionTitle: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },

  modesRow: { marginBottom: SPACING.md },
  modeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm, marginRight: SPACING.sm,
    backgroundColor: COLORS.bgCard,
  },
  modeIcon: { fontSize: 14 },
  modeLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },

  inputCard: {
    marginHorizontal: SPACING.md, backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border,
    padding: SPACING.md,
  },
  promptInput: {
    color: COLORS.textPrimary, fontSize: 16, minHeight: 80,
    maxHeight: 160, textAlignVertical: 'top',
  },
  inputActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.sm },
  charCount: { fontSize: 11, color: COLORS.textMuted },
  sendBtn: { borderRadius: RADIUS.full, overflow: 'hidden' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnGradient: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  sendIcon: { fontSize: 16, color: '#fff' },

  suggestionChip: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    marginRight: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  suggestionText: { color: COLORS.textSecondary, fontSize: 13 },

  featureGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: SPACING.md, gap: SPACING.sm,
  },
  featureCard: {
    width: (width - SPACING.md * 2 - SPACING.sm) / 2,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  featureIconBg: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  featureIcon: { fontSize: 20 },
  featureLabel: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  featureDesc: { fontSize: 11, color: COLORS.textMuted },
});
