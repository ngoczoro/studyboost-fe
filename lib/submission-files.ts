import { resolveFileUrl } from "@/lib/api/lesson-mappers"
import type { BackendSubmissionFileResponse } from "@/lib/api/types"

export function resolveSubmissionFileUrl(
  file: BackendSubmissionFileResponse,
): string | undefined {
  const path = file.filePath
  if (!path) return undefined

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  if (path.startsWith("/api/files/download")) {
    const url = new URL(path, "http://local")
    const key = url.searchParams.get("key")
    if (key) {
      return resolveFileUrl(key, file.fileName)
    }
    if (file.fileName) {
      url.searchParams.set("filename", file.fileName)
      return `${url.pathname}?${url.searchParams.toString()}`
    }
    return path
  }

  return resolveFileUrl(path, file.fileName)
}
