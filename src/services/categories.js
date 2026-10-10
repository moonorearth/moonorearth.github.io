import { supabase } from '../lib/supabaseClient';

const PAGE_SIZE = 100;

// Fetch all available categories for the UI pills
export async function getAllCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data;
}

/**
 * Fetch strictly 100 media items directly from DB based on selected categories and sort mode
 * @param {Array<string|object>} categoriesInput - Selected category UUIDs or Objects
 * @param {number} page - Page index (0 = first 100 items, 1 = next 100 items)
 * @param {string} sortBy - 'recent' (created_at DESC) or 'popular' (views_count/likes_count DESC)
 * @param {number} limit - Items per request (default 100)
 */
export async function getMediaByCategories(
  categoriesInput = [],
  page = 0,
  sortBy = 'recent',
  limit = PAGE_SIZE
) {
  if (!categoriesInput || categoriesInput.length === 0) {
    return { media: [], videos: [], hasMore: false };
  }

  // Extract raw UUID strings whether objects or string IDs were passed
  const categoryIds = (Array.isArray(categoriesInput) ? categoriesInput : [categoriesInput])
    .map((item) => (typeof item === 'object' && item !== null ? item.id : item))
    .filter(Boolean);

  if (categoryIds.length === 0) {
    return { media: [], videos: [], hasMore: false };
  }

  // Exact 100-item boundaries: Page 0 = 0..99, Page 1 = 100..199
  const from = page * limit;
  const to = from + limit - 1;

  // Determine ordering column
  const orderColumn = sortBy === 'popular' ? 'views_count' : 'created_at';

  // Single Category Selected (e.g., clicking Instagram tag)
  if (categoryIds.length === 1) {
    const { data, error, count } = await supabase
      .from('media')
      .select(`
        id,
        title,
        media_type,
        thumbnail_url,
        image_url,
        embed_url,
        views_count,
        likes_count,
        created_at,
        media_categories!inner(category_id)
      `, { count: 'exact' })
      .eq('media_categories.category_id', categoryIds[0])
      .order(orderColumn, { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching category media:', error);
      return { media: [], videos: [], hasMore: false };
    }

    const mediaList = data || [];
    const totalFetchedSoFar = from + mediaList.length;
    const hasMore = count ? totalFetchedSoFar < count : mediaList.length === limit;

    return {
      media: mediaList,
      videos: mediaList,
      hasMore,
    };
  }

  // Multi-Category Selected (Matches media containing ALL selected tags)
  const { data, error } = await supabase
    .from('media')
    .select(`
      id,
      title,
      media_type,
      thumbnail_url,
      image_url,
      embed_url,
      views_count,
      likes_count,
      created_at,
      media_categories!inner(category_id)
    `)
    .in('media_categories.category_id', categoryIds)
    .order(orderColumn, { ascending: false });

  if (error) {
    console.error('Error fetching multi-category media:', error);
    return { media: [], videos: [], hasMore: false };
  }

  // Keep media that contains ALL selected tag IDs
  const filteredMedia = (data || []).filter((mediaItem) => {
    const itemCatIds = new Set((mediaItem.media_categories || []).map((mc) => mc.category_id));
    return categoryIds.every((reqId) => itemCatIds.has(reqId));
  });

  const paginatedMedia = filteredMedia.slice(from, from + limit);
  const hasMore = (from + limit) < filteredMedia.length;

  return {
    media: paginatedMedia,
    videos: paginatedMedia,
    hasMore,
  };
}

export const getVideosByCategory = getMediaByCategories;
export const getMediaByCategory = getMediaByCategories;
