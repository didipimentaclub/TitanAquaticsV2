export interface VideoInfo {
  type: 'youtube' | 'vimeo' | 'iframe' | 'unknown';
  videoId: string | null;
  embedUrl: string | null;
  thumbnailUrl: string | null;
}

export function parseVideoUrl(url?: string): VideoInfo {
  if (!url) return { type: 'unknown', videoId: null, embedUrl: null, thumbnailUrl: null };
  const trimmedUrl = url.trim();

  if (trimmedUrl.includes('<iframe')) {
    const srcMatch = trimmedUrl.match(/src=["']([^"']+)["']/i);
    if (srcMatch) return parseVideoUrl(srcMatch[1]);
    return { type: 'iframe', videoId: null, embedUrl: null, thumbnailUrl: null };
  }

  const youtubePatterns = [
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of youtubePatterns) {
    const match = trimmedUrl.match(pattern);
    if (match?.[1]) {
      return {
        type: 'youtube',
        videoId: match[1],
        embedUrl: `https://www.youtube.com/embed/${match[1]}`,
        thumbnailUrl: `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`,
      };
    }
  }

  const vimeoMatch = trimmedUrl.match(/vimeo\.com\/(\d+)/) || trimmedUrl.match(/player\.vimeo\.com\/video\/(\d+)/);
  if (vimeoMatch?.[1]) {
    return { type: 'vimeo', videoId: vimeoMatch[1], embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`, thumbnailUrl: null };
  }

  if (trimmedUrl.includes('youtube.com/embed/') || trimmedUrl.includes('player.vimeo.com/video/')) {
    return { type: trimmedUrl.includes('youtube') ? 'youtube' : 'vimeo', videoId: null, embedUrl: trimmedUrl, thumbnailUrl: null };
  }

  return { type: 'unknown', videoId: null, embedUrl: null, thumbnailUrl: null };
}

export function getEmbedUrl(url?: string): string | null {
  return parseVideoUrl(url).embedUrl;
}

export function isValidVideoUrl(url?: string): boolean {
  return url ? parseVideoUrl(url).type !== 'unknown' : false;
}

export function getYoutubeThumbnail(url?: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'maxres'): string | null {
  const { type, videoId } = parseVideoUrl(url);
  if (type !== 'youtube' || !videoId) return null;
  const q = { default: 'default', medium: 'mqdefault', high: 'hqdefault', maxres: 'maxresdefault' };
  return `https://img.youtube.com/vi/${videoId}/${q[quality]}.jpg`;
}