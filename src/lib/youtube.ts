export function extractYoutubeId(url: string): string | null {
  if (!url) return null
  const match = url.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

export function getYoutubeThumbnail(videoUrl: string, quality: 'default' | 'mq' | 'hq' | 'sd' | 'max' = 'hq'): string | null {
  const id = extractYoutubeId(videoUrl)
  if (!id) return null
  const map = { default: 'default', mq: 'mqdefault', hq: 'hqdefault', sd: 'sddefault', max: 'maxresdefault' }
  return `https://img.youtube.com/vi/${id}/${map[quality]}.jpg`
}

export function getYoutubeWatchUrl(videoUrl: string): string | null {
  const id = extractYoutubeId(videoUrl)
  return id ? `https://www.youtube.com/watch?v=${id}` : null
}

export function getYoutubeEmbedUrl(videoUrl: string): string | null {
  const id = extractYoutubeId(videoUrl)
  return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : null
}
