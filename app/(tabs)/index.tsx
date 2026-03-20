import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, FlatList, Dimensions, Keyboard,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Animated, { 
  FadeInDown, 
  FadeInUp,
  FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import {
  generateText, generateImageUrl, generateVideoScript,
  generateSlides, generateAudioUrl,
} from '@/services/api';
import { COLORS, RADIUS, SPACING } from '@/constants/gemini-theme';

const { width } = Dimensions.get('window');
const logoSource = require('../../assets/logo/dawn_logo_nobg.png');

const MODES = [
  { id: 'chat',   label: 'Chat',          icon: 'chatbubble-ellipses-outline', color: COLORS.modeChat,   desc: 'Ask anything' },
  { id: 'image',  label: 'Create Image',  icon: 'image-outline',              color: COLORS.modeImage,  desc: 'Generate images' },
  { id: 'video',  label: 'Create Video',  icon: 'videocam-outline',           color: COLORS.modeVideo,  desc: 'Video scripts' },
  { id: 'slides', label: 'Create Slides', icon: 'stats-chart-outline',         color: COLORS.modeSlides, desc: 'Presentations' },
  { id: 'audio',  label: 'Create Audio',  icon: 'musical-notes-outline',      color: COLORS.modeAudio,  desc: 'Text to speech' },
  { id: 'more',   label: 'More',          icon: 'apps-outline',               color: COLORS.modeMore,   desc: 'Explore more' },
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
  const { user } = useAuth();
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
        style={[
          styles.modeChip, 
          active && { borderColor: mode.color, backgroundColor: `${mode.color}15` }
        ]}
        onPress={() => setSelectedMode(mode.id)}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={mode.icon} 
          size={16} 
          color={active ? mode.color : COLORS.textSecondary} 
        />
        <Text style={[styles.modeLabel, active && { color: mode.color, fontWeight: '600' }]}>
          {mode.label}
        </Text>
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
        {/* Header - now integrated into the top of the scrollable content */}
        <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={logoSource} style={styles.logoHeader} contentFit="contain" />
            <Text style={styles.appName}>Dawn AI</Text>
          </View>
        </Animated.View>

        {/* Greeting */}
        <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.greetingSection}>
          <Text style={styles.greetingHello}>{greeting()}, {userName}</Text>
          <Text style={styles.greetingSubtitle}>How can I help you today?</Text>
        </Animated.View>

        {/* Prompt Input */}
        <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.inputCard}>
          <TextInput
            ref={inputRef}
            style={styles.promptInput}
            placeholder={`Ask Dawn AI to ${MODES.find(m => m.id === selectedMode)?.desc.toLowerCase() ?? 'help you'}...`}
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
                colors={prompt.trim() && !loading ? [COLORS.gradientStart, COLORS.gradientMid] : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.05)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.sendBtnGradient}
              >
                {loading
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Ionicons name="send" size={18} color="#fff" />
                }
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Mode Filters */}
        <Animated.View entering={FadeIn.delay(600).duration(800)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Create with AI</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modesRow} contentContainerStyle={{ paddingHorizontal: SPACING.md }}>
            {MODES.map((m) => <ModeChip key={m.id} mode={m} />)}
          </ScrollView>
        </Animated.View>

        {/* Suggestions */}
        <Animated.View entering={FadeIn.delay(800).duration(800)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Suggestions</Text>
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
        </Animated.View>

        {/* Feature Cards */}
        <Animated.View entering={FadeIn.delay(1000).duration(800)}>
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
                <View style={[styles.featureIconBg, { backgroundColor: `${mode.color}15` }]}>
                  <Ionicons name={mode.icon} size={22} color={mode.color} />
                </View>
                <Text style={[styles.featureLabel, { color: mode.color }]}>{mode.label}</Text>
                <Text style={styles.featureDesc}>{mode.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

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
    paddingHorizontal: SPACING.md, paddingTop: 60, paddingBottom: SPACING.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoHeader: { width: 32, height: 32 },
  appName: { fontSize: 22, fontWeight: '600', color: COLORS.textPrimary, letterSpacing: -0.5 },

  greetingSection: { paddingHorizontal: SPACING.md, marginTop: SPACING.md, marginBottom: SPACING.lg },
  greetingHello: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.5 },
  greetingSubtitle: { fontSize: 18, color: COLORS.textSecondary, marginTop: 4, fontWeight: '500' },

  sectionHeader: { paddingHorizontal: SPACING.md, marginBottom: SPACING.sm, marginTop: SPACING.lg },
  sectionTitle: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },

  modesRow: { marginBottom: SPACING.md },
  modeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.full, paddingHorizontal: 16,
    paddingVertical: 10, marginRight: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  modeLabel: { fontSize: 14, color: COLORS.textSecondary },

  inputCard: {
    marginHorizontal: SPACING.md, backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: RADIUS.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    padding: SPACING.md,
  },
  promptInput: {
    color: COLORS.textPrimary, fontSize: 16, minHeight: 100,
    maxHeight: 200, textAlignVertical: 'top',
  },
  inputActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.sm },
  charCount: { fontSize: 11, color: COLORS.textMuted },
  sendBtn: { borderRadius: RADIUS.full, overflow: 'hidden' },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnGradient: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },

  suggestionChip: {
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: RADIUS.full,
    paddingHorizontal: 16, paddingVertical: 10,
    marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  suggestionText: { color: COLORS.textSecondary, fontSize: 14 },

  featureGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: SPACING.md, gap: 12,
  },
  featureCard: {
    width: (width - SPACING.md * 2 - 12) / 2,
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: RADIUS.lg,
    padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  featureIconBg: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  featureLabel: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  featureDesc: { fontSize: 12, color: COLORS.textMuted, lineHeight: 16 },
});
