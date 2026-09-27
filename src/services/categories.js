import { supabase } from '../lib/supabaseClient';

const PAGE_SIZE = 12;

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
 * Fetch media items tagged with ALL selected categories (AND condition)
 * @param {Array<string|number>} categoryIds - Array of category IDs
 * @param {number} page - Page index for pagination
 * @param {number} limit - Items per page
 */
export async function getMediaByCategories(categoryIds = [], page = 0, limit = 12) {
  if (!categoryIds || categoryIds.length === 0) {
    return { media: [], videos: [], hasMore: false };
  }

  // Fetch all media linked to ANY of the selected category IDs
  const { data, error } = await supabase
    .from('media_categories')
    .select(`
      media_id,
      category_id,
      media:media_id (
        id,
        title,
        media_type,
        thumbnail_url,
        image_url,
        embed_url,
        views_count,
        likes_count,
        created_at
      )
    `)
    .in('category_id', categoryIds);

  if (error) {
    console.error('Error fetching media by categories:', error);
    return { media: [], videos: [], hasMore: false };
  }

  // Group fetched junction rows by media_id
  const mediaMap = new Map();
  (data || []).forEach((item) => {
    if (!item.media) return;
    const existing = mediaMap.get(item.media_id) || {
      media: item.media,
      categoryIds: new Set(),
    };
    existing.categoryIds.add(item.category_id);
    mediaMap.set(item.media_id, existing);
  });

  // Strict "AND" condition: keep only media containing ALL requested category IDs
  const matchedMedia = Array.from(mediaMap.values())
    .filter((entry) =>
      categoryIds.every((reqCatId) => entry.categoryIds.has(reqCatId))
    )
    .map((entry) => entry.media);

  // Paginate filtered results client-side
  const from = page * limit;
  const to = from + limit;
  const paginatedMedia = matchedMedia.slice(from, to);
  const hasMore = to < matchedMedia.length;

  return {
    media: paginatedMedia,
    videos: paginatedMedia,
    hasMore,
  };
}

// Backward compatibility alias
export const getVideosByCategory = getMediaByCategories;
export const getMediaByCategory = getMediaByCategories;