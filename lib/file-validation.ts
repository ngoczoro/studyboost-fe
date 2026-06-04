export const BLOCKED_EXTENSIONS = new Set([
  "exe", "bat", "cmd", "msi", "apk", "jar", "sh",
])

export const VIDEO_EXTENSIONS = new Set(["mp4"])

export const DOCUMENT_EXTENSIONS = new Set([
  "pdf", "docx", "pptx", "xlsx", "txt", "zip",
])

const VIDEO_MAX_BYTES = 100 * 1024 * 1024

const DOCUMENT_MAX_BYTES: Record<string, number> = {
  pdf: 20 * 1024 * 1024,
  docx: 10 * 1024 * 1024,
  pptx: 20 * 1024 * 1024,
  xlsx: 10 * 1024 * 1024,
  zip: 30 * 1024 * 1024,
  txt: 2 * 1024 * 1024,
}

export class FileValidationError extends Error {
  constructor(
    message: string,
    public readonly errorCode: string,
  ) {
    super(message)
    this.name = "FileValidationError"
  }
}

export function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf(".")
  if (dot < 0 || dot === fileName.length - 1) return ""
  return fileName.slice(dot + 1).toLowerCase()
}

function validateNoDangerousSegments(fileName: string): void {
  const segments = fileName.toLowerCase().split(".")
  for (const segment of segments) {
    if (BLOCKED_EXTENSIONS.has(segment)) {
      throw new FileValidationError(
        "This file type is not allowed.",
        "Unsupported file type",
      )
    }
  }
}

function sizeLimitMessage(extension: string, maxBytes: number): string {
  const mb = maxBytes / (1024 * 1024)
  return `File exceeds the ${mb} MB limit for .${extension} files.`
}

export function validateVideoFile(file: File): void {
  validateUpload(file, VIDEO_EXTENSIONS, VIDEO_MAX_BYTES, "video")
}

export function validateDocumentFile(file: File): void {
  const extension = validateUpload(file, DOCUMENT_EXTENSIONS, null, "document")
  const maxBytes = DOCUMENT_MAX_BYTES[extension]
  if (file.size > maxBytes) {
    throw new FileValidationError(
      sizeLimitMessage(extension, maxBytes),
      "File exceeds limit",
    )
  }
}

function validateUpload(
  file: File,
  allowedExtensions: Set<string>,
  fixedMaxBytes: number | null,
  category: "video" | "document",
): string {
  if (!file || file.size <= 0) {
    throw new FileValidationError("File is required.", "Upload failed")
  }

  const fileName = file.name
  if (!fileName.trim()) {
    throw new FileValidationError("File name is required.", "Upload failed")
  }

  validateNoDangerousSegments(fileName)

  const extension = extensionOf(fileName)
  if (!extension || !allowedExtensions.has(extension)) {
    throw new FileValidationError(
      `Unsupported file type. Allowed ${category} types: ${[...allowedExtensions].join(", ")}.`,
      "Unsupported file type",
    )
  }

  if (fixedMaxBytes != null && file.size > fixedMaxBytes) {
    throw new FileValidationError(
      sizeLimitMessage(extension, fixedMaxBytes),
      "File exceeds limit",
    )
  }

  return extension
}

export function mapUploadError(data: { error?: string; errorCode?: string }): string {
  if (data.error) return data.error
  switch (data.errorCode) {
    case "Unsupported file type":
      return "Unsupported file type."
    case "File exceeds limit":
      return "File exceeds the allowed size limit."
    case "Cloudinary unavailable":
      return "File storage is temporarily unavailable. Please try again later."
    case "File not found":
      return "File not found."
    default:
      return "Upload failed. Please try again."
  }
}

export function isPdfDocument(fileName?: string, mimeType?: string): boolean {
  if (mimeType?.toLowerCase().includes("pdf")) return true
  return extensionOf(fileName ?? "") === "pdf"
}
