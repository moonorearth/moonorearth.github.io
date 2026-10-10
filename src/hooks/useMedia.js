import { useState, useEffect, useRef } from 'react';
import {
  getRecentMedia,
  getMostViewedMedia,
  getRandomMedia,
  searchMedia,
} from '../services/media';

export function useMedia({
  isUnlocked,
  activeTab,
  recentCategories = [],
  mostViewedCategories = [],
  debouncedSearchQuery,
  recentAsc,
  viewsAsc,
  shuffleTrigger,
}) {
  const [media, setMedia] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const getActiveCategories = () => {
    if (activeTab === 'most_viewed') return mostViewedCategories;
    return recentCategories;
  };

  const activeCategories = getActiveCategories();
  const categoryIds = activeCategories
    .map((c) => (typeof c === 'object' ? c.id : c))
    .filter(Boolean);
  const categoryKey = categoryIds.sort().join(',');

  const cacheRef = useRef({
    feed: [],
    random: [],
    recent: {},
    most_viewed: {},
  });

  const prevShuffleTriggerRef = useRef(shuffleTrigger);

  // Reset page whenever tab, filters, or search query changes
  useEffect(() => {
    setPage(0);
  }, [activeTab, categoryKey, recentAsc, viewsAsc, debouncedSearchQuery]);

  // Handle Explicit Reshuffle
  useEffect(() => {
    if (shuffleTrigger > 0 && prevShuffleTriggerRef.current !== shuffleTrigger) {
      prevShuffleTriggerRef.current = shuffleTrigger;

      if (activeTab === 'feed') {
        cacheRef.current.feed = [];
      } else if (activeTab === 'random') {
        cacheRef.current.random = [];
      }

      setPage(0);
    }
  }, [shuffleTrigger, activeTab]);

  // Fetch Media Effect
  useEffect(() => {
    if (!isUnlocked || activeTab === 'people' || activeTab === 'requests') return;

    const trimmedQuery = debouncedSearchQuery ? debouncedSearchQuery.trim() : '';
    const isSecretSearch = trimmedQuery.startsWith('?');
    const searchTerm = isSecretSearch ? trimmedQuery.slice(1).trim() : trimmedQuery;

    // Ignore secret searches shorter than 3 characters
    if (isSecretSearch && searchTerm.length < 3) {
      return;
    }

    const sortKeyRecent = `${categoryKey}_${recentAsc ? 'asc' : 'desc'}`;
    const sortKeyViews = `${categoryKey}_${viewsAsc ? 'asc' : 'desc'}`;

    // Cache hit check on page 0 (Disabled when active search query exists)
    if (!trimmedQuery && page === 0) {
      if (activeTab === 'feed' && cacheRef.current.feed.length > 0) {
        setMedia(cacheRef.current.feed);
        setHasMore(false);
        return;
      }
      if (activeTab === 'random' && cacheRef.current.random.length > 0) {
        setMedia(cacheRef.current.random);
        setHasMore(false);
        return;
      }
      if (activeTab === 'recent' && cacheRef.current.recent[sortKeyRecent]) {
        setMedia(cacheRef.current.recent[sortKeyRecent]);
        setHasMore(true);
        return;
      }
      if (activeTab === 'most_viewed' && cacheRef.current.most_viewed[sortKeyViews]) {
        setMedia(cacheRef.current.most_viewed[sortKeyViews]);
        setHasMore(true);
        return;
      }
    }

    async function loadMedia() {
      if (page === 0) setLoading(true);
      else setLoadingMore(true);

      let result = { media: [], hasMore: false };

      // 1. Search Query Handling (Normal or Secret Search)
      if (searchTerm.length > 0) {
        const sortBy = activeTab === 'most_viewed' ? 'views_count' : 'created_at';
        const ascending = activeTab === 'most_viewed' ? viewsAsc : recentAsc;
        
        // Paginated search requesting 100 items for current page
        result = await searchMedia(searchTerm, sortBy, ascending, page, 100);
      } 
      // 2. Feed or Random Views
      else if (activeTab === 'feed' || activeTab === 'random') {
        result = await getRandomMedia(page);
      } 
      // 3. Recent Tab View
      else if (activeTab === 'recent') {
        result = await getRecentMedia(page, recentAsc, categoryIds);
      } 
      // 4. Most Viewed Tab View
      else if (activeTab === 'most_viewed') {
        result = await getMostViewedMedia(page, viewsAsc, categoryIds);
      }

      const fetchedItems = result.media || [];

      setMedia((prev) => {
        const updated = page === 0 ? fetchedItems : [...prev, ...fetchedItems];

        // Only store in cache if there is no active search
        if (!trimmedQuery) {
          if (activeTab === 'feed') cacheRef.current.feed = updated;
          if (activeTab === 'random') cacheRef.current.random = updated;
          if (activeTab === 'recent') cacheRef.current.recent[sortKeyRecent] = updated;
          if (activeTab === 'most_viewed') cacheRef.current.most_viewed[sortKeyViews] = updated;
        }
        return updated;
      });

      setHasMore(result.hasMore);
      setLoading(false);
      setLoadingMore(false);
    }

    loadMedia();
  }, [
    isUnlocked,
    activeTab,
    categoryKey,
    debouncedSearchQuery,
    page,
    recentAsc,
    viewsAsc,
    shuffleTrigger,
  ]);

  const loadMore = () => setPage((prev) => prev + 1);

  const resetMedia = () => {
    setPage(0);
    setMedia([]);
    cacheRef.current = { feed: [], random: [], recent: {}, most_viewed: {} };
  };

  return {
    media,
    videos: media,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    resetVideos: resetMedia,
  };
}
