import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  Layout,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { fetchNews, searchImages } from '@/services/api';
import { COLORS, RADIUS, SPACING } from '@/constants/gemini-theme';

const { width } = Dimensions.get('window');
const logoSource = require('../../assets/logo/dawn_logo_nobg.png');

const CATEGORIES = [
  { label: 'Technology', icon: 'hardware-chip-outline' },
  { label: 'Science', icon: 'flask-outline' },
  { label: 'Business', icon: 'briefcase-outline' },
  { label: 'Health', icon: 'heart-outline' },
  { label: 'Sports', icon: 'football-outline' },
  { label: 'Entertainment', icon: 'film-outline' },
];

export default function ExploreScreen() {
  const [news, setNews] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Technology');
  const [activeTab, setActiveTab] = useState('news'); // news | images

  const loadNews = useCallback(async (query?: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchNews(query || selectedCategory.toLowerCase());
      setNews(data.filter((n: any) => n.title && n.title !== '[Removed]'));
    } catch (err: any) {
      setError(err.message || 'Failed to load news. Check your API key.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const loadImages = useCallback(async (query?: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await searchImages(query || selectedCategory);
      setImages(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load images. Check your API key.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (activeTab === 'news') loadNews();
    else loadImages();
  }, [activeTab, loadNews, loadImages]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    if (activeTab === 'news') loadNews(searchQuery);
    else loadImages(searchQuery);
  };

  const NewsCard = ({ item, index }: { item: any; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(600)}
      style={styles.newsCard}
    >
      <View style={styles.newsImageWrapper}>
        {item.urlToImage ? (
          <Image
            source={{ uri: item.urlToImage }}
            style={styles.newsImage}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <View style={styles.newsImagePlaceholder}>
            <Ionicons name="newspaper-outline" size={32} color={COLORS.textMuted} />
          </View>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.newsImageOverlay}
        >
          <View style={styles.sourceBadge}>
            <Text style={styles.sourceText}>{item.source?.name}</Text>
          </View>
        </LinearGradient>
      </View>
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.newsDesc} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.newsFooter}>
          <View style={styles.newsFooterItem}>
            <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.newsTime}>
              {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.readMoreBtn}>
            <Text style={styles.readMoreText}>Read more</Text>
            <Ionicons name="arrow-forward" size={12} color={COLORS.accent} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  const ImageCard = ({ item, index }: { item: any; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(500)}
      style={styles.imageCard}
    >
      <Image
        source={{ uri: item.urls?.small }}
        style={styles.imageItem}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.imageInfoOverlay}
      >
        <Text style={styles.imageAlt} numberOfLines={1}>
          {item.alt_description || item.description || 'Untitled'}
        </Text>
        <View style={styles.imageAuthorRow}>
          <Ionicons name="camera-outline" size={10} color="#fff" />
          <Text style={styles.imageAuthor}>{item.user?.name}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );

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
          <Text style={styles.appName}>Explore</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn}>
          <View style={styles.profileIndicator} />
          <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </Animated.View>

      {/* Search Bar */}
      <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={activeTab === 'news' ? 'Search global news...' : 'Search high-res images...'}
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
            <LinearGradient
              colors={[COLORS.gradientStart, COLORS.gradientMid]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.searchBtnGradient}
            >
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Tabs */}
      <Animated.View entering={FadeIn.delay(300).duration(600)} style={styles.tabWrapper}>
        <View style={styles.tabBackground}>
          {['news', 'images'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => {
                setActiveTab(tab);
                setSearchQuery('');
              }}
            >
              <Ionicons
                name={tab === 'news' ? 'newspaper-outline' : 'images-outline'}
                size={16}
                color={activeTab === tab ? '#fff' : COLORS.textSecondary}
              />
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'news' ? 'News' : 'Gallery'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Categories */}
      <Animated.View entering={FadeIn.delay(400).duration(600)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categories}
          contentContainerStyle={{ paddingHorizontal: SPACING.md }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.label}
              style={[
                styles.catChip,
                selectedCategory === cat.label && styles.catChipActive,
              ]}
              onPress={() => {
                setSelectedCategory(cat.label);
                setSearchQuery('');
              }}
            >
              <Ionicons
                name={cat.icon as any}
                size={14}
                color={selectedCategory === cat.label ? COLORS.accent : COLORS.textSecondary}
              />
              <Text style={[styles.catText, selectedCategory === cat.label && styles.catTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={COLORS.accent} size="small" />
          <Text style={styles.loadingText}>Curating your feed...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorState}>
          <View style={styles.errorIconBg}>
            <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          </View>
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => (activeTab === 'news' ? loadNews() : loadImages())}
          >
            <LinearGradient
              colors={[COLORS.bgCard, COLORS.bgSurface]}
              style={styles.retryBtnGradient}
            >
              <Text style={styles.retryText}>Retry Discovery</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : activeTab === 'news' ? (
        <FlatList
          key="news-list"
          data={news}
          keyExtractor={(item, i) => (item.url || String(i))}
          renderItem={({ item, index }) => <NewsCard item={item} index={index} />}
          contentContainerStyle={{ padding: SPACING.md, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
        />
      ) : (
        <FlatList
          key="images-list"
          data={images}
          keyExtractor={(item: any) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: SPACING.md }}
          renderItem={({ item, index }) => <ImageCard item={item} index={index} />}
          contentContainerStyle={{ padding: SPACING.md, paddingBottom: 120 }}
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
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIndicator: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    borderWidth: 2,
    borderColor: COLORS.bg,
    zIndex: 1,
  },

  searchRow: { paddingHorizontal: SPACING.md, marginBottom: SPACING.md },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: RADIUS.full,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: 15, paddingVertical: 8 },
  searchBtn: { borderRadius: RADIUS.full, overflow: 'hidden' },
  searchBtnGradient: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },

  tabWrapper: { paddingHorizontal: SPACING.md, marginBottom: SPACING.md },
  tabBackground: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.full,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  tabTextActive: { color: COLORS.textPrimary, fontWeight: '700' },

  categories: { marginBottom: SPACING.md },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  catChipActive: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(79, 142, 247, 0.1)',
  },
  catText: { fontSize: 13, color: COLORS.textSecondary },
  catTextActive: { color: COLORS.accent, fontWeight: '600' },

  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { color: COLORS.textMuted, fontSize: 14 },

  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl, marginTop: 40 },
  errorIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(234, 67, 53, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  errorText: { color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  retryBtn: { borderRadius: RADIUS.full, overflow: 'hidden' },
  retryBtnGradient: { paddingHorizontal: 30, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: RADIUS.full },
  retryText: { color: COLORS.accent, fontWeight: '700' },

  // News Card
  newsCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  newsImageWrapper: { width: '100%', height: 200, backgroundColor: 'rgba(255,255,255,0.02)' },
  newsImage: { width: '100%', height: '100%' },
  newsImagePlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  newsImageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, padding: SPACING.md, justifyContent: 'flex-end' },
  sourceBadge: { alignSelf: 'flex-start', backgroundColor: COLORS.accent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  sourceText: { color: '#fff', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  newsContent: { padding: SPACING.md },
  newsTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8, lineHeight: 24 },
  newsDesc: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 16 },
  newsFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  newsFooterItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  newsTime: { fontSize: 12, color: COLORS.textMuted },
  readMoreBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  readMoreText: { fontSize: 12, color: COLORS.accent, fontWeight: '700' },

  // Image Card
  imageCard: {
    flex: 1,
    height: 220,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  imageItem: { width: '100%', height: '100%' },
  imageInfoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, height: 70, justifyContent: 'flex-end' },
  imageAlt: { color: '#fff', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  imageAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  imageAuthor: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '500' },
});
