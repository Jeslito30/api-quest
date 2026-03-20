import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useChat } from '@/context/ChatContext';
import { COLORS, RADIUS, SPACING } from '@/constants/gemini-theme';

const { width } = Dimensions.get('window');
const logoSource = require('../../assets/logo/dawn_logo_nobg.png');

// ─── Result Cards ──────────────────────────────────────────────────────────────

const CardWrapper = ({ children, index }: { children: React.ReactNode; index: number }) => (
  <Animated.View
    entering={FadeInDown.delay(index * 100).duration(600)}
    style={styles.resultCard}
  >
    {children}
  </Animated.View>
);

const ChatResultCard = ({ item, index }: { item: any; index: number }) => (
  <CardWrapper index={index}>
    <View style={styles.resultHeader}>
      <View style={styles.badgeRow}>
        <Ionicons name="chatbubble-ellipses-outline" size={14} color={COLORS.modeChat} />
        <Text style={[styles.promptBadge, { color: COLORS.modeChat }]}>Chat</Text>
      </View>
      <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
    </View>
    <View style={styles.promptBubble}>
      <Text style={styles.promptText}>{item.prompt}</Text>
    </View>
    <View style={styles.responseBubble}>
      <View style={styles.dawnAvatar}>
        <LinearGradient
          colors={[COLORS.gradientStart, COLORS.gradientMid]}
          style={styles.dawnAvatarGradient}
        >
          <Text style={{ fontSize: 10, color: '#fff' }}>✦</Text>
        </LinearGradient>
      </View>
      <Text style={styles.responseText}>{item.result}</Text>
    </View>
  </CardWrapper>
);

const ImageResultCard = ({ item, index }: { item: any; index: number }) => {
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  return (
    <CardWrapper index={index}>
      <View style={styles.resultHeader}>
        <View style={styles.badgeRow}>
          <Ionicons name="image-outline" size={14} color={COLORS.modeImage} />
          <Text style={[styles.promptBadge, { color: COLORS.modeImage }]}>Image</Text>
        </View>
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
      <View style={styles.promptBubble}>
        <Text style={styles.promptText}>{item.prompt}</Text>
      </View>
      <View style={styles.imageContainer}>
        {imgLoading && !imgError && (
          <View style={styles.imageLoader}>
            <ActivityIndicator color={COLORS.accent} size="small" />
            <Text style={styles.imageLoaderText}>Creating your masterpiece...</Text>
          </View>
        )}
        {!imgError ? (
          <Image
            source={{ uri: item.result }}
            style={[styles.generatedImage, imgLoading && { opacity: 0, height: 0 }]}
            onLoad={() => setImgLoading(false)}
            onError={() => {
              setImgLoading(false);
              setImgError(true);
            }}
            contentFit="cover"
          />
        ) : (
          <View style={styles.imageError}>
            <Ionicons name="alert-circle-outline" size={24} color={COLORS.error} />
            <Text style={styles.imageErrorText}>Generation failed</Text>
            <Text style={styles.imageErrorSub}>Please try a different prompt</Text>
          </View>
        )}
      </View>
    </CardWrapper>
  );
};

const SlidesResultCard = ({ item, index }: { item: any; index: number }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = item.result?.slides ?? [];
  const slide = slides[activeSlide];

  const nextSlide = () => {
    if (activeSlide < slides.length - 1) {
      setActiveSlide(activeSlide + 1);
    }
  };

  const prevSlide = () => {
    if (activeSlide > 0) {
      setActiveSlide(activeSlide - 1);
    }
  };

  return (
    <CardWrapper index={index}>
      <View style={styles.resultHeader}>
        <View style={styles.badgeRow}>
          <Ionicons name="stats-chart-outline" size={14} color={COLORS.modeSlides} />
          <Text style={[styles.promptBadge, { color: COLORS.modeSlides }]}>Slides</Text>
        </View>
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
      <Text style={styles.slidesDeckTitle}>{item.result?.title}</Text>

      {slide && (
        <LinearGradient
          colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
          style={styles.slideCard}
        >
          <View style={styles.slideNumberBadge}>
            <Text style={styles.slideNumber}>
              {activeSlide + 1} / {slides.length}
            </Text>
          </View>
          <Text style={styles.slideTitle}>{slide.title}</Text>
          <Text style={styles.slideContent}>{slide.content}</Text>
          {slide.bulletPoints?.map((bp: string, i: number) => (
            <View key={i} style={styles.bulletRow}>
              <View style={[styles.bulletDot, { backgroundColor: COLORS.modeSlides }]} />
              <Text style={styles.bulletText}>{bp}</Text>
            </View>
          ))}
        </LinearGradient>
      )}

      <View style={styles.slideControls}>
        <TouchableOpacity 
          onPress={prevSlide} 
          style={[styles.slideControlBtn, activeSlide === 0 && { opacity: 0.3 }]}
          disabled={activeSlide === 0}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
          <Text style={styles.slideControlText}>Back</Text>
        </TouchableOpacity>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.slidesNavDots}
          contentContainerStyle={{ alignItems: 'center' }}
        >
          {slides.map((_: any, i: number) => (
            <TouchableOpacity
              key={i}
              onPress={() => setActiveSlide(i)}
              style={[
                styles.slideNavDot,
                i === activeSlide && [styles.slideNavDotActive, { backgroundColor: COLORS.modeSlides }],
              ]}
              hitSlop={{ top: 15, bottom: 15, left: 10, right: 10 }}
            />
          ))}
        </ScrollView>

        <TouchableOpacity 
          onPress={nextSlide} 
          style={[styles.slideControlBtn, activeSlide === slides.length - 1 && { opacity: 0.3 }]}
          disabled={activeSlide === slides.length - 1}
        >
          <Text style={styles.slideControlText}>Next</Text>
          <Ionicons name="chevron-forward" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>
    </CardWrapper>
  );
};

const VideoResultCard = ({ item, index }: { item: any; index: number }) => {
  const scenes = item.result?.scenes ?? [];
  return (
    <CardWrapper index={index}>
      <View style={styles.resultHeader}>
        <View style={styles.badgeRow}>
          <Ionicons name="videocam-outline" size={14} color={COLORS.modeVideo} />
          <Text style={[styles.promptBadge, { color: COLORS.modeVideo }]}>Video Script</Text>
        </View>
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
      <Text style={styles.videoTitle}>{item.result?.title}</Text>
      <View style={styles.videoMeta}>
        <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
        <Text style={styles.videoDuration}>Duration: {item.result?.duration}</Text>
      </View>
      
      {scenes.map((scene: any) => (
        <View key={scene.scene} style={styles.sceneCard}>
          <View style={styles.sceneHeader}>
            <Text style={[styles.sceneNumber, { color: COLORS.modeVideo }]}>Scene {scene.scene}</Text>
            <Text style={styles.sceneDuration}>{scene.duration}</Text>
          </View>
          <Text style={styles.sceneTitle}>{scene.title}</Text>
          <Text style={styles.sceneDesc}>{scene.description}</Text>
          <View style={[styles.narrationBox, { borderLeftColor: COLORS.modeVideo }]}>
            <Text style={[styles.narrationLabel, { color: COLORS.modeVideo }]}>Narration</Text>
            <Text style={styles.narrationText}>{scene.narration}</Text>
          </View>
        </View>
      ))}
    </CardWrapper>
  );
};

const AudioResultCard = ({ item, index }: { item: any; index: number }) => {
  const [loading, setLoading] = useState(false);

  async function playSound() {
    setLoading(true);
    try {
      await WebBrowser.openBrowserAsync(item.result?.audioUrl);
    } catch (error) {
      console.error('Error opening audio browser', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <CardWrapper index={index}>
      <View style={styles.resultHeader}>
        <View style={styles.badgeRow}>
          <Ionicons name="musical-notes-outline" size={14} color={COLORS.modeAudio} />
          <Text style={[styles.promptBadge, { color: COLORS.modeAudio }]}>Audio</Text>
        </View>
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
      <View style={styles.audioPlayer}>
        <LinearGradient
          colors={[`${COLORS.modeAudio}20`, `${COLORS.bgCard}`]}
          style={styles.audioPlayerGradient}
        >
          <View style={styles.audioHeader}>
            <TouchableOpacity 
              style={styles.audioPlayBtn} 
              onPress={playSound}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="play" size={20} color="#fff" />
              )}
            </TouchableOpacity>
            <Text style={styles.audioWaveform}>Listen to Audio</Text>
          </View>
          <Text style={styles.audioScript} numberOfLines={3}>{item.result?.script}</Text>
          <View style={styles.audioUrlBox}>
            <Ionicons name="link-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.audioUrl} numberOfLines={1}>
              {item.result?.audioUrl}
            </Text>
          </View>
        </LinearGradient>
      </View>
    </CardWrapper>
  );
};

const ErrorCard = ({ item, index }: { item: any; index: number }) => (
  <CardWrapper index={index}>
    <View style={[styles.resultHeader]}>
      <View style={styles.badgeRow}>
        <Ionicons name="alert-circle-outline" size={14} color={COLORS.error} />
        <Text style={[styles.promptBadge, { color: COLORS.error }]}>Error</Text>
      </View>
    </View>
    <View style={styles.errorContent}>
      <Text style={styles.errorText}>{item.result}</Text>
    </View>
  </CardWrapper>
);

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function DataScreen() {
  const router = useRouter();
  const { conversations, clearConversations } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const FILTER_TYPES = [
    { id: 'all', label: 'All', icon: 'apps-outline', color: COLORS.modeMore },
    { id: 'chat', label: 'Chat', icon: 'chatbubble-ellipses-outline', color: COLORS.modeChat },
    { id: 'image', label: 'Images', icon: 'image-outline', color: COLORS.modeImage },
    { id: 'video', label: 'Videos', icon: 'videocam-outline', color: COLORS.modeVideo },
    { id: 'slides', label: 'Slides', icon: 'stats-chart-outline', color: COLORS.modeSlides },
    { id: 'audio', label: 'Audio', icon: 'musical-notes-outline', color: COLORS.modeAudio },
  ];

  const filtered = conversations.filter((c) => {
    const matchesType = filterType === 'all' || c.type === filterType;
    const matchesSearch = !searchQuery || c.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const renderResult = ({ item, index }: { item: any; index: number }) => {
    switch (item.type) {
      case 'image':  return <ImageResultCard item={item} index={index} />;
      case 'slides': return <SlidesResultCard item={item} index={index} />;
      case 'video':  return <VideoResultCard item={item} index={index} />;
      case 'audio':  return <AudioResultCard item={item} index={index} />;
      case 'error':  return <ErrorCard item={item} index={index} />;
      default:       return <ChatResultCard item={item} index={index} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={logoSource} style={styles.logoHeader} contentFit="contain" />
          <Text style={appNameStyles.appName}>History</Text>
        </View>
        {conversations.length > 0 && (
          <TouchableOpacity onPress={clearConversations} style={styles.clearBtnWrapper}>
            <Text style={styles.clearBtn}>Clear All</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Search */}
      <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.searchRow}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchText}
            placeholder="Search your history..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </Animated.View>

      {/* Filter chips */}
      <Animated.View entering={FadeIn.delay(300).duration(600)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={{ paddingHorizontal: SPACING.md }}
        >
          {FILTER_TYPES.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.filterChip,
                filterType === f.id && { borderColor: f.color, backgroundColor: `${f.color}15` },
              ]}
              onPress={() => setFilterType(f.id)}
            >
              <Ionicons
                name={f.icon as any}
                size={14}
                color={filterType === f.id ? f.color : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.filterText,
                  filterType === f.id && { color: f.color, fontWeight: '600' },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Results */}
      {filtered.length === 0 ? (
        <Animated.View entering={FadeIn.delay(400).duration(800)} style={styles.emptyState}>
          <View style={styles.emptyIconBg}>
            <Ionicons name="hourglass-outline" size={48} color={COLORS.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptySubtitle}>
            Your AI generations will appear here. Start a new conversation to see them!
          </Text>
          <TouchableOpacity
            style={styles.goHomeBtn}
            onPress={() => router.push('/')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.gradientStart, COLORS.gradientMid]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.goHomeBtnGradient}
            >
              <Text style={styles.goHomeBtnText}>Start Creating</Text>
              
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderResult}
          contentContainerStyle={{ padding: SPACING.md, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
        />
      )}
    </View>
  );
}

const appNameStyles = StyleSheet.create({
  appName: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: 60,
    paddingBottom: SPACING.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoHeader: { width: 32, height: 32 },
  
  clearBtnWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(234, 67, 53, 0.1)',
  },
  clearBtn: { fontSize: 12, color: COLORS.error, fontWeight: '600' },

  searchRow: { paddingHorizontal: SPACING.md, marginBottom: SPACING.md },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  searchIcon: { marginRight: 10 },
  searchText: { flex: 1, color: COLORS.textPrimary, fontSize: 15 },

  filterRow: { marginBottom: SPACING.md },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  filterText: { fontSize: 14, color: COLORS.textSecondary },

  // Result cards
  resultCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: SPACING.md,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  promptBadge: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  timestamp: { fontSize: 11, color: COLORS.textMuted },

  promptBubble: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.accent,
  },
  promptText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 20 },

  responseBubble: { flexDirection: 'row', gap: SPACING.sm },
  dawnAvatar: { marginTop: 2 },
  dawnAvatarGradient: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  responseText: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    lineHeight: 24,
  },

  // Image card
  imageContainer: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  generatedImage: { width: '100%', height: 300, borderRadius: RADIUS.lg },
  imageLoader: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  imageLoaderText: { color: COLORS.textMuted, fontSize: 13 },
  imageError: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imageErrorText: { color: COLORS.error, fontSize: 15, fontWeight: '600' },
  imageErrorSub: { color: COLORS.textMuted, fontSize: 13 },

  // Slides
  slidesDeckTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  slideCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    minHeight: 220,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  slideNumberBadge: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: SPACING.md,
  },
  slideNumber: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
  slideTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  slideContent: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  bulletDot: { width: 6, height: 6, borderRadius: 3 },
  bulletText: { flex: 1, color: COLORS.textSecondary, fontSize: 13 },
  
  slideControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    gap: 10,
  },
  slideControlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.md,
  },
  slideControlText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  slidesNavDots: {
    flex: 1,
    maxHeight: 40,
  },
  slideNavDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 4,
  },
  slideNavDotActive: { width: 20 },

  // Video
  videoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  videoMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.lg },
  videoDuration: { fontSize: 12, color: COLORS.textMuted },
  sceneCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  sceneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sceneNumber: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  sceneDuration: { fontSize: 11, color: COLORS.textMuted },
  sceneTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  sceneDesc: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.md, lineHeight: 18 },
  narrationBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 3,
  },
  narrationLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  narrationText: { fontSize: 13, color: COLORS.textPrimary, lineHeight: 20, fontStyle: 'italic' },

  // Audio
  audioPlayer: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  audioPlayerGradient: { padding: SPACING.lg, borderRadius: RADIUS.lg },
  audioHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: SPACING.md },
  audioPlayBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioWaveform: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  audioScript: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  audioUrlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  audioUrl: { flex: 1, fontSize: 11, color: COLORS.textMuted },

  // Error
  errorContent: {
    backgroundColor: 'rgba(234, 67, 53, 0.05)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(234, 67, 53, 0.1)',
  },
  errorText: { color: COLORS.error, fontSize: 14, lineHeight: 22 },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    marginTop: 60,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xxl,
  },
  goHomeBtn: { borderRadius: RADIUS.full, overflow: 'hidden', width: '100%' },
  goHomeBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  goHomeBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
