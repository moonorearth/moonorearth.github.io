/**
 * Resolves the best preview thumbnail for an item
 */
export function getMediaThumbnail(item) {
  if (!item) return '/placeholder.jpg';

  // 1. Direct thumbnail_url if provided
  if (item.thumbnail_url && item.thumbnail_url.trim() !== '') {
    return item.thumbnail_url;
  }

  // 2. Direct image_url (for images / gifs)
  if (item.image_url && item.image_url.trim() !== '') {
    return item.image_url;
  }

  // 3. Extract thumbnail from embed_url if it's YouTube / Vimeo
  if (item.embed_url) {
    // YouTube Embed Pattern (e.g., https://www.youtube.com/embed/VIDEO_ID or youtube.com/watch?v=VIDEO_ID)
    const ytMatch = item.embed_url.match(/(?:embed\/|v=)([^"&?/\s]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    }
  }

  // 4. Default fallback
  return '/placeholder.jpg';
}