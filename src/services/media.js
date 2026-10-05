import { supabase } from '../lib/supabaseClient';

const PAGE_SIZE = 100;

export async function incrementLikes(id) {
  try {
    const { error } = await supabase.rpc('increment_likes', { row_id: id });
    if (error) {
      const { data } = await supabase.from('media').select('likes_count').eq('id', id).single();
      const currentLikes = data?.likes_count || 0;
      await supabase.from('media').update({ likes_count: currentLikes + 1 }).eq('id', id);
    }
  } catch (err) {
    console.error('Error incrementing likes:', err);
  }
}

export async function decrementLikes(id) {
  try {
    const { error } = await supabase.rpc('decrement_likes', { row_id: id });
    if (error) {
      const { data } = await supabase.from('media').select('likes_count').eq('id', id).single();
      const currentLikes = data?.likes_count || 0;
      await supabase.from('media').update({ likes_count: Math.max(0, currentLikes - 1) }).eq('id', id);
    }
  } catch (err) {
    console.error('Error decrementing likes:', err);
  }
}

export async function incrementVideoViews(id) {
  const { error } = await supabase.rpc('increment_views', { media_id: id });
  if (error) {
    const { data: item } = await supabase.from('media').select('views_count').eq('id', id).single();
    if (item) {
      await supabase.from('media').update({ views_count: (item.views_count || 0) + 1 }).eq('id', id);
    }
  }
}

export const incrementMediaViews = incrementVideoViews;

/**
 * Fetch all available categories for dropdowns & selection
 */
export async function getCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data || [];
}

/**
 * Fetch recent media with multi-category filtering AND sorting support
 */
export async function getRecentMedia(page = 0, recentAsc = false, categoryIds = []) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase.from('media');

  if (categoryIds && categoryIds.length > 0) {
    const { data: catRows } = await supabase
      .from('media_categories')
      .select('media_id, category_id')
      .in('category_id', categoryIds);

    if (!catRows || catRows.length === 0) {
      return { media: [], videos: [], hasMore: false };
    }

    const mediaCountMap = new Map();
    catRows.forEach((r) => {
      mediaCountMap.set(r.media_id, (mediaCountMap.get(r.media_id) || 0) + 1);
    });

    const matchingMediaIds = Array.from(mediaCountMap.entries())
      .filter(([_, count]) => count === categoryIds.length)
      .map(([id]) => id);

    if (matchingMediaIds.length === 0) {
      return { media: [], videos: [], hasMore: false };
    }

    query = query.select('*, media_categories(category_id, categories(*))', { count: 'exact' }).in('id', matchingMediaIds);
  } else {
    query = query.select('*, media_categories(category_id, categories(*))', { count: 'exact' });
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: recentAsc })
    .range(from, to);

  if (error) {
    console.error('Error fetching recent media:', error);
    return { media: [], videos: [], hasMore: false };
  }

  const items = (data || []).map(item => ({
    ...item,
    categories: item.media_categories?.map(mc => mc.categories).filter(Boolean) || [],
  }));

  return {
    media: items,
    videos: items,
    hasMore: count ? to + 1 < count : false,
  };
}

export const getRecentVideos = getRecentMedia;

/**
 * Fetch most viewed media with multi-category filtering AND sorting support
 */
export async function getMostViewedMedia(page = 0, viewsAsc = false, categoryIds = []) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase.from('media');

  if (categoryIds && categoryIds.length > 0) {
    const { data: catRows } = await supabase
      .from('media_categories')
      .select('media_id, category_id')
      .in('category_id', categoryIds);

    if (!catRows || catRows.length === 0) {
      return { media: [], videos: [], hasMore: false };
    }

    const mediaCountMap = new Map();
    catRows.forEach((r) => {
      mediaCountMap.set(r.media_id, (mediaCountMap.get(r.media_id) || 0) + 1);
    });

    const matchingMediaIds = Array.from(mediaCountMap.entries())
      .filter(([_, count]) => count === categoryIds.length)
      .map(([id]) => id);

    if (matchingMediaIds.length === 0) {
      return { media: [], videos: [], hasMore: false };
    }

    query = query.select('*, media_categories(category_id, categories(*))', { count: 'exact' }).in('id', matchingMediaIds);
  } else {
    query = query.select('*, media_categories(category_id, categories(*))', { count: 'exact' });
  }

  const { data, error, count } = await query
    .order('views_count', { ascending: viewsAsc })
    .range(from, to);

  if (error) {
    console.error('Error fetching most viewed media:', error);
    return { media: [], videos: [], hasMore: false };
  }

  const items = (data || []).map(item => ({
    ...item,
    categories: item.media_categories?.map(mc => mc.categories).filter(Boolean) || [],
  }));

  return {
    media: items,
    videos: items,
    hasMore: count ? to + 1 < count : false,
  };
}

export const getMostViewedVideos = getMostViewedMedia;

export async function getRandomMedia(page = 0) {
  const { data, error } = await supabase.from('media').select(`
    *,
    media_categories(category_id, categories(*)),
    media_people(people(*))
  `).limit(PAGE_SIZE);

  if (error) {
    console.error('Error fetching random media:', error);
    return { media: [], videos: [], hasMore: false };
  }

  const formattedData = (data || []).map((item) => ({
    ...item,
    categories: item.media_categories?.map((mc) => mc.categories).filter(Boolean) || [],
    people: item.media_people?.map((mp) => mp.people).filter(Boolean) || [],
  }));

  const shuffled = formattedData.sort(() => 0.5 - Math.random());

  return {
    media: shuffled,
    videos: shuffled,
    hasMore: false,
  };
}

export const getRandomVideos = getRandomMedia;

export async function searchMedia(query, sortBy = 'created_at', ascending = false) {
  const { data, error } = await supabase
    .from('media')
    .select('*, media_categories(category_id, categories(*))')
    .ilike('title', `%${query}%`)
    .order(sortBy, { ascending });

  if (error) {
    console.error('Error searching media:', error);
    return [];
  }

  return (data || []).map(item => ({
    ...item,
    categories: item.media_categories?.map(mc => mc.categories).filter(Boolean) || [],
  }));
}

export const searchVideos = searchMedia;

/**
 * Add new media entry and connect multiple categories in junction table
 */
export async function addMedia(mediaData, categoryIds = []) {
  const { data, error } = await supabase
    .from('media')
    .insert([mediaData])
    .select();

  if (error) {
    console.error('Error adding media:', error);
    throw error;
  }

  const newMedia = data?.[0];

  if (newMedia && categoryIds.length > 0) {
    const categoryRows = categoryIds.map((catId) => ({
      media_id: newMedia.id,
      category_id: catId,
    }));
    await supabase.from('media_categories').insert(categoryRows);
  }

  return newMedia;
}

/**
 * Update media entry by ID and synchronize multiple categories
 */
export async function updateMedia(id, updates, categoryIds = null) {
  const { data, error } = await supabase
    .from('media')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating media:', error);
    throw error;
  }

  if (Array.isArray(categoryIds)) {
    await supabase.from('media_categories').delete().eq('media_id', id);

    if (categoryIds.length > 0) {
      const categoryRows = categoryIds.map((catId) => ({
        media_id: id,
        category_id: catId,
      }));
      await supabase.from('media_categories').insert(categoryRows);
    }
  }

  return data?.[0];
}

/**
 * Delete media entry by ID
 */
export async function deleteMedia(id) {
  const { error } = await supabase
    .from('media')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting media:', error);
    throw error;
  }
  return true;
}
