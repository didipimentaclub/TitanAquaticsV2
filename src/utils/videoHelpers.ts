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
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
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

  return { type: 'unknown', videoId: null, embedUrl: null, thumbnailUrl: null };
}

export function getEmbedUrl(url?: string): string | null {
  return parseVideoUrl(url).embedUrl;
}