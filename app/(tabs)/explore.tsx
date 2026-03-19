import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ActivityIndicator, TextInput, ScrollView,
} from 'react-native';
import { fetchNews, searchImages } from '@/services/api';
import { COLORS, RADIUS, SPACING } from '@/constants/gemini-theme';

const CATEGORIES = ['Technology', 'Science', 'Business', 'Health', 'Sports', 'Entertainment'];

export default function ExploreScreen() {
  const [news, setNews] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Technology');
  const [activeTab, setActiveTab] = useState('news'); // news | images

  const loadNews = useCallback(async (query) => {
    setLoading(true); setError('');
    try {
      const data = await fetchNews(query || selectedCategory.toLowerCase());
      setNews(data.filter(n => n.title && n.title !== '[Removed]'));
    } catch {
      setError('Failed to load news. Check your News API key.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const loadImages = useCallback(async (query) => {
    setLoading(true); setError('');
    try {
      const data = await searchImages(query || selectedCategory);
      setImages(data);
    } catch {
      setError('Failed to load images. Check your Unsplash API key.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (activeTab === 'news') loadNews();
    else loadImages();
  }, [activeTab, loadNews, loadImages]);

  const handleSearch = () => {
    if (activeTab === 'news') loadNews(searchQuery);
    else loadImages(searchQuery);
  };

  const NewsCard = ({ item }) => (
    <View style={styles.newsCard}>
      {item.urlToImage ? (
        <Image source={{ uri: item.urlToImage }} style={styles.newsImage} resizeMode="cover" />
      ) : (
        <View style={styles.newsImagePlaceholder}>
          <Text style={{ fontSize: 24 }}>📰</Text>
        </View>
      )}
      <View style={styles.newsContent}>
        <Text style={styles.newsSource}>{item.source?.name}</Text>
        <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.newsDesc} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.newsTime}>
          {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : ''}
        </Text>
      </View>
    </View>
  );

  const ImageCard = ({ item }) => (
    <View style={styles.imageCard}>
      <Image source={{ uri: item.urls?.small }} style={styles.imageItem} resizeMode="cover" />
      <View style={styles.imageOverlay}>
        <Text style={styles.imageAlt} numberOfLines={1}>{item.alt_description || item.description || ''}</Text>
        <Text style={styles.imageAuthor}>📷 {item.user?.name}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder={activeTab === 'news' ? 'Search news...' : 'Search images...'}
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {['news', 'images'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'news' ? '📰 News' : '🖼️ Images'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories} contentContainerStyle={{ paddingHorizontal: SPACING.md }}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
            onPress={() => { setSelectedCategory(cat); setSearchQuery(''); }}
          >
            <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={COLORS.accent} size="large" />
          <Text style={styles.loadingText}>Loading {activeTab}...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorState}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => activeTab === 'news' ? loadNews() : loadImages()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : activeTab === 'news' ? (
        <FlatList
          data={news}
          keyExtractor={(item, i) => item.url || String(i)}
          renderItem={({ item }) => <NewsCard item={item} />}
          contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
        />
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: SPACING.sm }}
          renderItem={({ item }) => <ImageCard item={item} />}
          contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100, gap: SPACING.sm }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: SPACING.md, paddingTop: 56, paddingBottom: SPACING.sm },
  headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },

  searchRow: { paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
  searchBox: { flexDirection: 'row', gap: SPACING.sm, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border, paddingLeft: SPACING.md, paddingRight: 4, paddingVertical: 4, alignItems: 'center' },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: 14, paddingVertical: 6 },
  searchBtn: { backgroundColor: COLORS.accent, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 8 },
  searchBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  tabRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, gap: SPACING.sm, marginBottom: SPACING.sm },
  tab: { flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', backgroundColor: COLORS.bgCard },
  tabActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentSoft },
  tabText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  tabTextActive: { color: COLORS.accent },

  categories: { marginBottom: SPACING.sm },
  catChip: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 6, marginRight: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bgCard },
  catChipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentSoft },
  catText: { fontSize: 12, color: COLORS.textSecondary },
  catTextActive: { color: COLORS.accent },

  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  loadingText: { color: COLORS.textSecondary, fontSize: 14 },

  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  errorIcon: { fontSize: 32, marginBottom: SPACING.sm },
  errorText: { color: COLORS.error, textAlign: 'center', marginBottom: SPACING.md },
  retryBtn: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.full, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  retryText: { color: COLORS.accent, fontWeight: '600' },

  newsCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  newsImage: { width: '100%', height: 160 },
  newsImagePlaceholder: { width: '100%', height: 80, backgroundColor: COLORS.bgSurface, alignItems: 'center', justifyContent: 'center' },
  newsContent: { padding: SPACING.md },
  newsSource: { fontSize: 10, color: COLORS.accent, textTransform: 'uppercase', fontWeight: '700', marginBottom: 4 },
  newsTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4, lineHeight: 20 },
  newsDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18, marginBottom: SPACING.sm },
  newsTime: { fontSize: 10, color: COLORS.textMuted },

  imageCard: { flex: 1, borderRadius: RADIUS.md, overflow: 'hidden', backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border },
  imageItem: { width: '100%', height: 140 },
  imageOverlay: { padding: SPACING.sm, backgroundColor: 'rgba(0,0,0,0.6)', position: 'absolute', bottom: 0, left: 0, right: 0 },
  imageAlt: { color: '#fff', fontSize: 10, lineHeight: 14 },
  imageAuthor: { color: 'rgba(255,255,255,0.7)', fontSize: 9, marginTop: 2 },
});
