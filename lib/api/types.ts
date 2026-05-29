import type { BackendUserResponse } from "@/lib/auth"

export type BackendCourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"
export type BackendEnrollmentStatus = "ACTIVE" | "DROPPED" | "COMPLETED"

export interface BackendCourseResponse {
  id: number
  title: string
  description?: string | null
  thumbnailUrl?: string | null
  status: BackendCourseStatus
  maxStudents?: number | null
  teacher?: BackendUserResponse | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface BackendEnrollmentResponse {
  id: number
  student?: BackendUserResponse | null
  course?: BackendCourseResponse | null
  enrolledAt?: string | null
  status: BackendEnrollmentStatus
}

export interface BackendCourseRequest {
  title: string
  description?: string
  thumbnailUrl?: string
  status?: BackendCourseStatus
  maxStudents?: number
}

export interface BackendSectionResponse {
  id: number
  courseId: number
  title: string
  orderIndex: number
  createdAt?: string | null
}

export interface BackendSectionRequest {
  title: string
  orderIndex: number
}

export type BackendLessonType = "VIDEO" | "DOCUMENT" | "TEXT"

export interface BackendLessonResponse {
  id: number
  sectionId: number
  type: BackendLessonType
  title: string
  content?: string | null
  videoUrl?: string | null
  documentUrl?: string | null
  documentName?: string | null
  documentSize?: number | null
  documentMimeType?: string | null
  documentUploadedAt?: string | null
  videoFileName?: string | null
  videoFileSize?: number | null
  videoMimeType?: string | null
  videoUploadedAt?: string | null
  isVisible?: boolean | null
  orderIndex: number
  createdAt?: string | null
}

export interface BackendLessonCreateRequest {
  type: BackendLessonType
  title: string
  orderIndex: number
  isVisible?: boolean
  content?: string
  videoUrl?: string
  documentUrl?: string
  documentName?: string
  documentSize?: number
  documentMimeType?: string
  documentUploadedAt?: string
  videoFileName?: string
  videoFileSize?: number
  videoMimeType?: string
  videoUploadedAt?: string
}

export interface BackendLessonRequest {
  type: BackendLessonType
  title: string
  content?: string
  videoUrl?: string
  documentUrl?: string
  documentName?: string
  documentSize?: number
  documentMimeType?: string
  documentUploadedAt?: string
  videoFileName?: string
  videoFileSize?: number
  videoMimeType?: string
  videoUploadedAt?: string
  orderIndex: number
  isVisible?: boolean
}

export interface BackendFileUploadResponse {
  url: string
  storageKey: string
  fileName: string
  fileSize: number
  mimeType?: string
  uploadedAt?: string
}
