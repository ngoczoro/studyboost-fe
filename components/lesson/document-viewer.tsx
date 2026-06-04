"use client"

import {
  resolveFileUrl,
  formatFileSize,
  formatUploadDate,
} from "@/lib/api/lesson-mappers"
import { isPdfDocument } from "@/lib/file-validation"

interface Props {
  title: string
  documentUrl?: string
  documentName?: string
  documentSize?: number
  documentMimeType?: string
  documentUploadedAt?: string
}

export function DocumentViewer({
  title,
  documentUrl,
  documentName,
  documentSize,
  documentMimeType,
  documentUploadedAt,
}: Props) {
  const displayName = documentName || title
  const downloadUrl = resolveFileUrl(documentUrl, displayName)
  const previewUrl = resolveFileUrl(documentUrl, displayName, true)
  const showPdfPreview = isPdfDocument(displayName, documentMimeType) && previewUrl

  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>{title}</h2>

      <div
        style={{
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          padding: 24,
          background: "var(--color-surface)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 40, lineHeight: 1 }}>📄</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{displayName}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", fontSize: 13, color: "var(--color-fg-muted)" }}>
              <span>Size: {formatFileSize(documentSize)}</span>
              <span>Uploaded: {formatUploadDate(documentUploadedAt)}</span>
            </div>
          </div>
        </div>

        {downloadUrl ? (
          <a
            href={downloadUrl}
            download={displayName}
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: 38,
              padding: "0 16px",
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 13,
              background: "var(--color-primary-600)",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            Download
          </a>
        ) : (
          <p style={{ fontSize: 14, color: "var(--color-fg-muted)", margin: 0 }}>
            No document attached.
          </p>
        )}
      </div>

      {showPdfPreview && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--color-fg-muted)" }}>
            Preview
          </div>
          <iframe
            src={previewUrl}
            title={`Preview of ${displayName}`}
            style={{
              width: "100%",
              height: 640,
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              background: "#fff",
            }}
          />
        </div>
      )}
    </div>
  )
}
