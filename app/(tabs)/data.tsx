import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ActivityIndicator, ScrollView, Dimensions,
  StatusBar, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useChat } from '@/context/ChatContext';
import { COLORS, RADIUS, SPACING } from '@/constants/gemini-theme';

const { width } = Dimensions.get('window');

// ─── Result Cards ──────────────────────────────────────────────────────────────
const ChatResultCard = ({ item }) => (
  <View style={styles.resultCard}>
    <View style={styles.resultHeader}>
      <Text style={styles.promptBadge}>💬 Chat</Text>
      <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
    </View>
    <View style={styles.promptBubble}>
      <Text style={styles.promptText}>{item.prompt}</Text>
    </View>
    <View style={styles.responseBubble}>
      <View style={styles.geminiAvatar}>
        <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientMid]} style={styles.geminiAvatarGradient}>
          <Text style={{ fontSize: 12, color: '#fff' }}>✦</Text>
        </LinearGradient>
      </View>
      <Text style={styles.responseText}>{item.result}</Text>
    </View>
  </View>
);

const ImageResultCard = ({ item }) => {
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  return (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <Text style={styles.promptBadge}>🎨 Image</Text>
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
      </View>
      <View style={styles.promptBubble}>
        <Text style={styles.promptText}>{item.prompt}</Text>
      </View>
      <View style={styles.imageContainer}>
        {imgLoading && !imgError && (
          <View style={styles.imageLoader}>
            <ActivityIndicator color={COLORS.accent} size="large" />
            <Text style={styles.imageLoaderText}>Generating image...</Text>
          </View>
        )}
        {!imgError ? (
          <Image
            source={{ uri: item.result }}
            style={[styles.generatedImage, imgLoading && { opacity: 0, height: 0 }]}
            onLoad={() => setImgLoading(false)}
            onError={() => { setImgLoading(false); setImgError(true); }}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imageError}>
            <Text style={styles.imageErrorText}>⚠️ Image generation failed</Text>
            <Text style={styles.imageErrorSub}>Try a different prompt</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const SlidesResultCard = ({ item }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = item.result?.slides ?? [];
  const slide = slides[activeSlide];

  return (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <Text style={styles.promptBadge}>📊 Slides</Text>
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
      </View>
      <Text style={styles.slidesDeckTitle}>{item.result?.title}</Text>

      {slide && (
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={styles.slideCard}
        >
          <View style={styles.slideNumberBadge}>
            <Text style={styles.slideNumber}>{activeSlide + 1}/{slides.length}</Text>
          </View>
          <Text style={styles.slideTitle}>{slide.title}</Text>
          <Text style={styles.slideContent}>{slide.content}</Text>
          {slide.bulletPoints?.map((bp, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>▸</Text>
              <Text style={styles.bulletText}>{bp}</Text>
            </View>
          ))}
        </LinearGradient>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.slidesNav}>
        {slides.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => setActiveSlide(i)} style={[styles.slideNavDot, i === activeSlide && styles.slideNavDotActive]} />
        ))}
      </ScrollView>
    </View>
  );
};

const VideoResultCard = ({ item }) => {
  const scenes = item.result?.scenes ?? [];
  return (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <Text style={styles.promptBadge}>🎬 Video Script</Text>
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
      </View>
      <Text style={styles.videoTitle}>{item.result?.title}</Text>
      <Text style={styles.videoDuration}>Total Duration: {item.result?.duration}</Text>
      {scenes.map((scene) => (
        <View key={scene.scene} style={styles.sceneCard}>
          <View style={styles.sceneHeader}>
            <Text style={styles.sceneNumber}>Scene {scene.scene}</Text>
            <Text style={styles.sceneDuration}>{scene.duration}</Text>
          </View>
          <Text style={styles.sceneTitle}>{scene.title}</Text>
          <Text style={styles.sceneDesc}>{scene.description}</Text>
          <View style={styles.narrationBox}>
            <Text style={styles.narrationLabel}>Narration</Text>
            <Text style={styles.narrationText}>{scene.narration}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const AudioResultCard = ({ item }) => (
  <View style={styles.resultCard}>
    <View style={styles.resultHeader}>
      <Text style={styles.promptBadge}>🎵 Audio</Text>
      <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
    </View>
    <View style={styles.audioPlayer}>
      <LinearGradient colors={[COLORS.modeAudio + '30', COLORS.bgCard]} style={styles.audioPlayerGradient}>
        <Text style={styles.audioWaveform}>🎙️ Audio Generated</Text>
        <Text style={styles.audioScript}>{item.result?.script}</Text>
        <View style={styles.audioUrlBox}>
          <Text style={styles.audioUrlLabel}>Audio URL (copy to play):</Text>
          <Text style={styles.audioUrl} numberOfLines={2}>{item.result?.audioUrl}</Text>
        </View>
      </LinearGradient>
    </View>
  </View>
);

const ErrorCard = ({ item }) => (
  <View style={[styles.resultCard, styles.errorCard]}>
    <View style={styles.resultHeader}>
      <Text style={[styles.promptBadge, { color: COLORS.error }]}>⚠️ Error</Text>
    </View>
    <Text style={styles.errorText}>{item.result}</Text>
  </View>
);

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function DataScreen() {
  const router = useRouter();
  const { conversations, clearConversations } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const FILTER_TYPES = ['all', 'chat', 'image', 'video', 'slides', 'audio'];

  const filtered = conversations.filter((c) => {
    const matchesType = filterType === 'all' || c.type === filterType;
    const matchesSearch = !searchQuery || c.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const renderResult = ({ item }) => {
    switch (item.type) {
      case 'image':  return <ImageResultCard item={item} />;
      case 'slides': return <SlidesResultCard item={item} />;
      case 'video':  return <VideoResultCard item={item} />;
      case 'audio':  return <AudioResultCard item={item} />;
      case 'error':  return <ErrorCard item={item} />;
      default:       return <ChatResultCard item={item} />;
    }
  };

  return (
    <View style={styles.container}>
      

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Results</Text>
        {conversations.length > 0 && (
          <TouchableOpacity onPress={clearConversations}>
            <Text style={styles.clearBtn}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchInput}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchText}
            placeholder="Search results..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: SPACING.md }}>
        {FILTER_TYPES.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filterType === f && styles.filterChipActive]}
            onPress={() => setFilterType(f)}
          >
            <Text style={[styles.filterText, filterType === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>✦</Text>
          <Text style={styles.emptyTitle}>No results yet</Text>
          <Text style={styles.emptySubtitle}>Go to Home and ask Gemini something!</Text>
          <TouchableOpacity
            style={styles.goHomeBtn}
            onPress={() => router.push('/')}
          >
            <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientMid]} style={styles.goHomeBtnGradient}>
              <Text style={styles.goHomeBtnText}>Start a conversation</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderResult}
          contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingTop: 56, paddingBottom: SPACING.sm,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  clearBtn: { fontSize: 13, color: COLORS.error },

  searchRow: { paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
  searchInput: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border, gap: 8,
  },
  searchIcon: { fontSize: 14 },
  searchText: { flex: 1, color: COLORS.textPrimary, fontSize: 14 },
  clearIcon: { color: COLORS.textMuted, fontSize: 14 },

  filterRow: { marginBottom: SPACING.sm },
  filterChip: {
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.md,
    paddingVertical: 6, marginRight: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bgCard,
  },
  filterChipActive: { backgroundColor: COLORS.accentSoft, borderColor: COLORS.accent },
  filterText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  filterTextActive: { color: COLORS.accent },

  // Result cards
  resultCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md,
  },
  errorCard: { borderColor: 'rgba(234,67,53,0.3)' },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  promptBadge: { fontSize: 12, color: COLORS.accent, fontWeight: '600' },
  timestamp: { fontSize: 11, color: COLORS.textMuted },

  promptBubble: {
    backgroundColor: COLORS.bgSurface, borderRadius: RADIUS.md,
    padding: SPACING.sm, marginBottom: SPACING.sm,
    borderLeftWidth: 3, borderLeftColor: COLORS.accent,
  },
  promptText: { color: COLORS.textSecondary, fontSize: 13 },

  responseBubble: { flexDirection: 'row', gap: SPACING.sm },
  geminiAvatar: { marginTop: 2 },
  geminiAvatarGradient: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  responseText: { flex: 1, color: COLORS.textPrimary, fontSize: 14, lineHeight: 22 },

  // Image card
  imageContainer: { borderRadius: RADIUS.md, overflow: 'hidden', minHeight: 200 },
  generatedImage: { width: '100%', height: 250, borderRadius: RADIUS.md },
  imageLoader: { height: 200, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.bgSurface, borderRadius: RADIUS.md },
  imageLoaderText: { color: COLORS.textSecondary, fontSize: 13 },
  imageError: { height: 120, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bgSurface, borderRadius: RADIUS.md },
  imageErrorText: { color: COLORS.error, fontSize: 14, fontWeight: '600' },
  imageErrorSub: { color: COLORS.textMuted, fontSize: 12 },

  // Slides
  slidesDeckTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  slideCard: { borderRadius: RADIUS.lg, padding: SPACING.lg, minHeight: 200 },
  slideNumberBadge: { alignSelf: 'flex-end', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 3, marginBottom: SPACING.sm },
  slideNumber: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
  slideTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: SPACING.sm },
  slideContent: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: SPACING.sm, lineHeight: 20 },
  bulletRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: 4 },
  bulletDot: { color: COLORS.accent, fontSize: 12, marginTop: 1 },
  bulletText: { flex: 1, color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 18 },
  slidesNav: { marginTop: SPACING.sm },
  slideNavDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border, marginRight: 6, marginTop: 4 },
  slideNavDotActive: { backgroundColor: COLORS.accent, width: 20 },

  // Video
  videoTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  videoDuration: { fontSize: 12, color: COLORS.textSecondary, marginBottom: SPACING.md },
  sceneCard: { backgroundColor: COLORS.bgSurface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
  sceneHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  sceneNumber: { fontSize: 11, color: COLORS.modeVideo, fontWeight: '700', textTransform: 'uppercase' },
  sceneDuration: { fontSize: 11, color: COLORS.textMuted },
  sceneTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  sceneDesc: { fontSize: 12, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  narrationBox: { backgroundColor: 'rgba(255,107,53,0.1)', borderRadius: RADIUS.sm, padding: SPACING.sm, borderLeftWidth: 2, borderLeftColor: COLORS.modeVideo },
  narrationLabel: { fontSize: 10, color: COLORS.modeVideo, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  narrationText: { fontSize: 12, color: COLORS.textPrimary, lineHeight: 18 },

  // Audio
  audioPlayer: { borderRadius: RADIUS.md, overflow: 'hidden' },
  audioPlayerGradient: { padding: SPACING.md, borderRadius: RADIUS.md },
  audioWaveform: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  audioScript: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, marginBottom: SPACING.md },
  audioUrlBox: { backgroundColor: COLORS.bgSurface, borderRadius: RADIUS.sm, padding: SPACING.sm },
  audioUrlLabel: { fontSize: 10, color: COLORS.modeAudio, textTransform: 'uppercase', fontWeight: '700', marginBottom: 4 },
  audioUrl: { fontSize: 10, color: COLORS.textMuted, lineHeight: 14 },

  // Error
  errorText: { color: COLORS.error, fontSize: 13, lineHeight: 20 },

  // Empty state
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.xl },
  goHomeBtn: { borderRadius: RADIUS.full, overflow: 'hidden' },
  goHomeBtnGradient: { paddingHorizontal: SPACING.xl, paddingVertical: 12 },
  goHomeBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
