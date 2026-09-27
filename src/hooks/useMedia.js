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

  // Active categories only apply to recent and most_viewed now
  const getActiveCategories = () => {
    if (activeTab === 'most_viewed') return mostViewedCategories;
    return recentCategories;
  };

  const activeCategories = getActiveCategories();
  const categoryIds = activeCategories
    .map((c) => (typeof c === 'object' ? c.id : c))
    .filter(Boolean);
  const categoryKey = categoryIds.sort().join(',');

  // Separate cache namespaces for feed (vertical shorts) vs random (grid)
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

  // Handle Explicit Reshuffle (Bypasses cache and clears state)
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
    const searchTerm = isSecretSearch ? trimmedQuery.slice(1).trim() : '';

    if (
      (trimmedQuery !== '' && !isSecretSearch) ||
      (isSecretSearch && searchTerm.length < 3)
    ) {
      return;
    }

    const sortKeyRecent = `${categoryKey}_${recentAsc ? 'asc' : 'desc'}`;
    const sortKeyViews = `${categoryKey}_${viewsAsc ? 'asc' : 'desc'}`;

    // Cache hit check on page 0
    if (!isSecretSearch && page === 0) {
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

      if (isSecretSearch && searchTerm.length >= 3) {
        const sortBy = activeTab === 'most_viewed' ? 'views_count' : 'created_at';
        const ascending = activeTab === 'most_viewed' ? viewsAsc : recentAsc;
        const data = await searchMedia(searchTerm, sortBy, ascending);
        result = { media: data, hasMore: false };
      } else if (activeTab === 'feed' || activeTab === 'random') {
        // Pass shuffleTrigger as cache-buster so new random items are fetched
        result = await getRandomMedia(page, [], shuffleTrigger);
      } else if (activeTab === 'recent') {
        result = await getRecentMedia(page, recentAsc, categoryIds);
      } else if (activeTab === 'most_viewed') {
        result = await getMostViewedMedia(page, viewsAsc, categoryIds);
      }

      const fetchedItems = result.media || [];

      setMedia((prev) => {
        const updated = page === 0 ? fetchedItems : [...prev, ...fetchedItems];

        if (!isSecretSearch) {
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