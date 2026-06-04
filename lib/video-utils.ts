export type VideoEmbed =
  | { kind: "youtube"; embedUrl: string }
  | { kind: "vimeo"; embedUrl: string }
  | { kind: "direct"; src: string }

export function parseVideoUrl(url: string): VideoEmbed | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  const youtubeMatch =
    trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/i) ??
    trimmed.match(/^([\w-]{11})$/)
  if (youtubeMatch) {
    const id = youtubeMatch[1]
    return {
      kind: "youtube",
      embedUrl: `https://www.youtube.com/embed/${id}`,
    }
  }

  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/i)
  if (vimeoMatch) {
    return {
      kind: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    }
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return { kind: "direct", src: trimmed }
  }

  return { kind: "direct", src: trimmed }
}
