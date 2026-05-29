"use client"

import { useState, useEffect, useRef } from "react"
import type { SectionItem } from "@/lib/types"
import { formatFileSize } from "@/lib/api/lesson-mappers"
import {
  validateVideoFile,
  validateDocumentFile,
  mapUploadError,
  FileValidationError,
} from "@/lib/file-validation"
import { Modal, toast } from "@/components/ui/primitives"
import { ButtonSmall } from "@/components/ui/button-small"
import type { BackendFileUploadResponse } from "@/lib/api/types"

async function uploadLessonFile(
  file: File,
  category: "video" | "document",
): Promise<BackendFileUploadResponse> {
  if (category === "video") {
    validateVideoFile(file)
  } else {
    validateDocumentFile(file)
  }

  const form = new FormData()
  form.append("file", file)
  form.append("category", category)
  const res = await fetch("/api/files/upload", { method: "POST", body: form })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(mapUploadError(data))
  }
  return data as BackendFileUploadResponse
}

function LessonEditModal({
  item,
  onClose,
  onSave,
}: {
  item: SectionItem | null
  onClose: () => void
  onSave: (
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
  ) => Promise<void>
}) {
  const [title, setTitle] = useState("")
  const [visible, setVisible] = useState(true)
  const [content, setContent] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [videoFileName, setVideoFileName] = useState<string | undefined>()
  const [videoFileSize, setVideoFileSize] = useState<number | undefined>()
  const [videoMimeType, setVideoMimeType] = useState<string | undefined>()
  const [videoUploadedAt, setVideoUploadedAt] = useState<string | undefined>()
  const [documentUrl, setDocumentUrl] = useState("")
  const [documentName, setDocumentName] = useState("")
  const [documentSize, setDocumentSize] = useState<number | undefined>()
  const [documentMimeType, setDocumentMimeType] = useState<string | undefined>()
  const [documentUploadedAt, setDocumentUploadedAt] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!item) return
    setTitle(item.title)
    setVisible(item.is_visible)
    setContent(item.content ?? "")
    setVideoUrl(item.url ?? "")
    setVideoFileName(item.video_file_name)
    setVideoFileSize(item.video_file_size)
    setVideoMimeType(item.video_mime_type)
    setVideoUploadedAt(item.video_uploaded_at)
    setDocumentUrl(item.document_url ?? "")
    setDocumentName(item.document_name ?? "")
    setDocumentSize(item.document_size)
    setDocumentMimeType(item.document_mime_type)
    setDocumentUploadedAt(item.document_uploaded_at)
  }, [item])

  const submit = async () => {
    if (!item || !title.trim()) return
    setSaving(true)
    try {
      await onSave(item, {
        title: title.trim(),
        is_visible: visible,
        content: item.type === "text" ? content : undefined,
        url: item.type === "video" ? videoUrl.trim() : undefined,
        document_url: item.type === "file" ? documentUrl : undefined,
        document_name: item.type === "file" ? documentName : undefined,
        document_size: item.type === "file" ? documentSize : undefined,
        document_mime_type: item.type === "file" ? documentMimeType : undefined,
        document_uploaded_at: item.type === "file" ? documentUploadedAt : undefined,
        video_file_name: item.type === "video" ? videoFileName : undefined,
        video_file_size: item.type === "video" ? videoFileSize : undefined,
        video_mime_type: item.type === "video" ? videoMimeType : undefined,
        video_uploaded_at: item.type === "video" ? videoUploadedAt : undefined,
      })
      onClose()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update item", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleVideoUpload = async (file: File) => {
    setUploading(true)
    try {
      validateVideoFile(file)
      const result = await uploadLessonFile(file, "video")
      setVideoUrl(result.storageKey)
      setVideoFileName(result.fileName)
      setVideoFileSize(result.fileSize)
      setVideoMimeType(result.mimeType)
      setVideoUploadedAt(result.uploadedAt)
      toast("Video uploaded", "success")
    } catch (err) {
      toast(
        err instanceof FileValidationError || err instanceof Error
          ? err.message
          : "Upload failed",
        "error",
      )
    } finally {
      setUploading(false)
    }
  }

  const handleDocUpload = async (file: File) => {
    setUploading(true)
    try {
      validateDocumentFile(file)
      const result = await uploadLessonFile(file, "document")
      setDocumentUrl(result.storageKey)
      setDocumentName(result.fileName)
      setDocumentSize(result.fileSize)
      setDocumentMimeType(result.mimeType)
      setDocumentUploadedAt(result.uploadedAt)
      toast("Document uploaded", "success")
    } catch (err) {
      toast(
        err instanceof FileValidationError || err instanceof Error
          ? err.message
          : "Upload failed",
        "error",
      )
    } finally {
      setUploading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 38,
    padding: "0 12px",
    borderRadius: 8,
    border: "1px solid var(--color-border)",
    background: "var(--color-surface)",
    color: "var(--color-fg)",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  }

  return (
    <Modal open={!!item} onClose={onClose} title="Edit lesson" width={560}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
        </div>

        {item?.type === "video" && (
          <>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Video URL (YouTube, Vimeo, or direct link)
              </label>
              <input
                value={videoUrl.startsWith("LOCAL::") || videoUrl.startsWith("CLOUDINARY::") ? "" : videoUrl}
                onChange={e => {
                  setVideoUrl(e.target.value)
                  setVideoFileName(undefined)
                  setVideoFileSize(undefined)
                  setVideoMimeType(undefined)
                  setVideoUploadedAt(undefined)
                }}
                placeholder="https://youtube.com/watch?v=..."
                style={inputStyle}
              />
            </div>
            <div>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,.mp4"
                hidden
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleVideoUpload(file)
                  e.target.value = ""
                }}
              />
              <ButtonSmall
                variant="ghost"
                disabled={uploading}
                onClick={() => videoInputRef.current?.click()}
              >
                {uploading ? "Uploading…" : "Upload MP4 (max 100 MB)"}
              </ButtonSmall>
              {videoFileName && (
                <span style={{ marginLeft: 8, fontSize: 12, color: "var(--color-fg-muted)" }}>
                  {videoFileName} · {formatFileSize(videoFileSize)}
                </span>
              )}
            </div>
          </>
        )}

        {item?.type === "file" && (
          <>
            {documentName && (
              <div style={{ fontSize: 13, color: "var(--color-fg-muted)" }}>
                {documentName} · {formatFileSize(documentSize)}
              </div>
            )}
            <div>
              <input
                ref={docInputRef}
                type="file"
                accept=".pdf,.docx,.pptx,.xlsx,.txt,.zip,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                hidden
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleDocUpload(file)
                  e.target.value = ""
                }}
              />
              <ButtonSmall
                variant="ghost"
                disabled={uploading}
                onClick={() => docInputRef.current?.click()}
              >
                {uploading ? "Uploading…" : documentUrl ? "Replace document" : "Upload document"}
              </ButtonSmall>
            </div>
          </>
        )}

        {item?.type === "text" && (
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
              Content (Markdown supported)
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={10}
              placeholder="Write lesson content…"
              style={{
                ...inputStyle,
                height: "auto",
                padding: "8px 12px",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>
        )}

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
          <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />
          Visible to students
        </label>

        <div style={{ fontSize: 12, color: "var(--color-fg-muted)" }}>
          Type: <strong style={{ textTransform: "capitalize" }}>{item?.type}</strong>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
          <ButtonSmall variant="ghost" onClick={onClose}>Cancel</ButtonSmall>
          <ButtonSmall onClick={submit} disabled={saving || uploading || !title.trim()}>
            {saving ? "Saving…" : "Save"}
          </ButtonSmall>
        </div>
      </div>
    </Modal>
  )
}

export { LessonEditModal }
