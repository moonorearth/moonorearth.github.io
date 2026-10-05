export function getMediaThumbnail(item) {
  if (!item) return '/placeholder.jpg';

  if (item.thumbnail_url && typeof item.thumbnail_url === 'string' && item.thumbnail_url.trim() !== '') {
    return item.thumbnail_url.trim();
  }

  if (item.image_url && typeof item.image_url === 'string' && item.image_url.trim() !== '') {
    const rawImg = item.image_url.trim();
    if (rawImg.includes('imx.to')) {
      return rawImg
        .replace('://i.imx.to', '://t.imx.to')
        .replace('://imx.to', '://t.imx.to')
        .replace('/i/', '/t/')
        .replace('/u/i/', '/t/');
    }
    return rawImg;
  }

  const directMedia = item.media_url || item.url;
  if (directMedia && typeof directMedia === 'string' && directMedia.trim() !== '') {
    const trimmed = directMedia.trim();
    if (trimmed.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i)) return trimmed;
  }

  const videoUrl = item.embed_url || item.media_url || item.url;
  if (videoUrl && typeof videoUrl === 'string') {
    const trimmedUrl = videoUrl.trim();

    const luluMatch = trimmedUrl.match(/lulustream\.com\/(?:e|d|v)\/([a-zA-Z0-9]+)/);
    if (luluMatch && luluMatch[1]) return `https://img.lulucdn.com/${luluMatch[1]}.jpg`;

    const ytMatch = trimmedUrl.match(/(?:embed\/|v=|v\/|vi\/|youtu\.be\/)([^"&?/\s]{11})/);
    if (ytMatch && ytMatch[1]) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  }

  return '/placeholder.jpg';
}

export function getFullMediaUrl(item) {
  if (!item) return '';

  const rawUrl = item.image_url || item.thumbnail_url || item.media_url || item.url || '';
  if (!rawUrl) return '';

  if (rawUrl.includes('imx.to')) {
    return rawUrl
      .replace('://imx.to', '://i.imx.to')
      .replace('://t.imx.to', '://i.imx.to')
      .replace('/t/', '/i/')
      .replace('/u/t/', '/i/')
      .replace('/u/i/', '/i/');
  }

  return rawUrl;
}

export function getMediaAspectRatio(video) {
  if (video?.aspect_ratio) return video.aspect_ratio;
  if (video?.is_vertical || video?.media_type === 'short') return '9/16';
  if (video?.media_type === 'image') return '4/5';

  const ratios = ['16/9', '4/3', '9/16', '1/1', '3/4'];
  const charCodeSum = (video?.id || '0').toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return ratios[charCodeSum % ratios.length];
}
