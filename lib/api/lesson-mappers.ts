import type { BackendLessonResponse } from "./types"
import type { SectionItem } from "@/lib/types"

export type BackendLessonType = "VIDEO" | "DOCUMENT" | "TEXT"

const TYPE_MAP: Record<BackendLessonType, SectionItem["type"]> = {
  VIDEO: "video",
  DOCUMENT: "file",
  TEXT: "text",
}

const REVERSE_TYPE_MAP: Record<SectionItem["type"], BackendLessonType> = {
  video: "VIDEO",
  file: "DOCUMENT",
  text: "TEXT",
  assignment: "TEXT",
}

export function resolveMediaUrl(storedUrl?: string | null): string | undefined {
  if (!storedUrl) return undefined
  if (storedUrl.startsWith("CLOUDINARY::")) {
    const parts = storedUrl.split("::")
    if (parts.length >= 3) return parts[2]
  }
  if (storedUrl.startsWith("http://") || storedUrl.startsWith("https://")) {
    return storedUrl
  }
  if (storedUrl.startsWith("LOCAL::")) {
    return buildDownloadUrl(storedUrl)
  }
  return storedUrl
}

export function buildDownloadUrl(
  storedUrl: string,
  options?: { filename?: string | null; inline?: boolean },
): string {
  const params = new URLSearchParams({ key: storedUrl })
  if (options?.filename) params.set("filename", options.filename)
  if (options?.inline) params.set("disposition", "inline")
  return `/api/files/download?${params.toString()}`
}

export function resolveFileUrl(
  storedUrl?: string | null,
  filename?: string | null,
  inline = false,
): string | undefined {
  if (!storedUrl) return undefined
  if (storedUrl.startsWith("http://") || storedUrl.startsWith("https://")) {
    return storedUrl
  }
  if (storedUrl.startsWith("LOCAL::") || storedUrl.startsWith("CLOUDINARY::")) {
    if (storedUrl.startsWith("CLOUDINARY::")) {
      const parts = storedUrl.split("::")
      if (parts.length >= 3) return parts[2]
    }
    return buildDownloadUrl(storedUrl, { filename, inline })
  }
  return storedUrl
}

export function mapLessonToSectionItem(lesson: BackendLessonResponse): SectionItem {
  const type = lesson.type ? TYPE_MAP[lesson.type] : "text"

  return {
    id: lesson.id,
    section_id: lesson.sectionId,
    type,
    title: lesson.title,
    content: type === "text" ? lesson.content ?? "" : undefined,
    url: type === "video" ? lesson.videoUrl ?? undefined : undefined,
    document_url: type === "file" ? lesson.documentUrl ?? undefined : undefined,
    document_name: type === "file" ? lesson.documentName ?? undefined : undefined,
    document_size: type === "file" ? lesson.documentSize ?? undefined : undefined,
    document_mime_type: type === "file" ? lesson.documentMimeType ?? undefined : undefined,
    document_uploaded_at: type === "file" ? lesson.documentUploadedAt ?? undefined : undefined,
    video_file_name: type === "video" ? lesson.videoFileName ?? undefined : undefined,
    video_file_size: type === "video" ? lesson.videoFileSize ?? undefined : undefined,
    video_mime_type: type === "video" ? lesson.videoMimeType ?? undefined : undefined,
    video_uploaded_at: type === "video" ? lesson.videoUploadedAt ?? undefined : undefined,
    order_index: lesson.orderIndex,
    is_visible: lesson.isVisible ?? true,
  }
}

export function toCreateItemPayload(
  frontendType: "video" | "file" | "text",
  orderIndex: number,
) {
  const type = REVERSE_TYPE_MAP[frontendType]
  const title =
    frontendType === "video"
      ? "New video lesson"
      : frontendType === "file"
        ? "New document"
        : "New text lesson"

  switch (frontendType) {
    case "video":
      return { type, title, orderIndex, isVisible: true, videoUrl: "" }
    case "file":
      return { type, title, orderIndex, isVisible: true, documentUrl: "", documentName: "" }
    case "text":
      return { type, title, orderIndex, isVisible: true, content: "" }
  }
}

export function mapSection(response: {
  id: number
  courseId: number
  title: string
  orderIndex: number
}): import("@/lib/types").Section {
  return {
    id: response.id,
    course_id: response.courseId,
    title: response.title,
    order_index: response.orderIndex,
  }
}

export function sectionItemToLessonRequest(
  item: SectionItem,
  updates: {
    title: string
    is_visible: boolean
    content?: string
    url?: string
    document_url?: string
    document_name?: string
    document_size?: number
    document_mime_type?: string
    document_uploaded_at?: string
    video_file_name?: string
    video_file_size?: number
    video_mime_type?: string
    video_uploaded_at?: string
  },
): import("./types").BackendLessonRequest {
  const type = REVERSE_TYPE_MAP[item.type]

  const base = {
    type,
    title: updates.title,
    orderIndex: item.order_index,
    isVisible: updates.is_visible,
  }

  if (item.type === "video") {
    const videoUrl = updates.url ?? item.url ?? ""
    const isUpload = videoUrl.startsWith("LOCAL::") || videoUrl.startsWith("CLOUDINARY::")
    return {
      ...base,
      videoUrl,
      videoFileName: isUpload ? updates.video_file_name ?? item.video_file_name : undefined,
      videoFileSize: isUpload ? updates.video_file_size ?? item.video_file_size : undefined,
      videoMimeType: isUpload ? updates.video_mime_type ?? item.video_mime_type : undefined,
      videoUploadedAt: isUpload ? updates.video_uploaded_at ?? item.video_uploaded_at : undefined,
    }
  }

  if (item.type === "file") {
    return {
      ...base,
      documentUrl: updates.document_url ?? item.document_url ?? "",
      documentName: updates.document_name ?? item.document_name ?? "",
      documentSize: updates.document_size ?? item.document_size,
      documentMimeType: updates.document_mime_type ?? item.document_mime_type,
      documentUploadedAt: updates.document_uploaded_at ?? item.document_uploaded_at,
    }
  }

  return { ...base, content: updates.content ?? item.content ?? "" }
}

export function formatFileSize(bytes?: number): string {
  if (bytes == null || bytes <= 0) return "Unknown size"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatUploadDate(value?: string | null): string {
  if (!value) return "Unknown date"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown date"
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
