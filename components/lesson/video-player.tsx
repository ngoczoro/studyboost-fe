"use client"

import { parseVideoUrl } from "@/lib/video-utils"

interface Props {
  url?: string
  title: string
}

export function VideoPlayer({ url, title }: Props) {
  const embed = url ? parseVideoUrl(url) : null

  if (!embed) {
    return (
      <div
        style={{
          aspectRatio: "16/9",
          background: "#0f172a",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          fontSize: 14,
        }}
      >
        No video URL configured.
      </div>
    )
  }

  if (embed.kind === "direct") {
    return (
      <video
        controls
        playsInline
        src={embed.src}
        title={title}
        style={{
          width: "100%",
          aspectRatio: "16/9",
          borderRadius: "var(--radius-md)",
          background: "#000",
        }}
      />
    )
  }

  return (
    <iframe
      src={embed.embedUrl}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      style={{
        width: "100%",
        aspectRatio: "16/9",
        border: "none",
        borderRadius: "var(--radius-md)",
        background: "#000",
      }}
    />
  )
}
