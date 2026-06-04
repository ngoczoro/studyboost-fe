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

export interface BackendAssignmentRequest {
  title: string
  description?: string
  maxScore?: number
  dueDate?: string
  allowLateSubmission?: boolean
  maxFiles?: number
  maxFileSizeMb?: number
  allowedFileTypes?: string
}

export interface BackendAssignmentResponse {
  id: number
  courseId: number
  sectionId?: number | null
  title: string
  description?: string | null
  maxScore: number
  dueDate?: string | null
  allowLateSubmission?: boolean
  maxFiles?: number | null
  maxFileSizeMb?: number | null
  allowedFileTypes?: string | null
  createdAt?: string | null
}

export interface BackendSubmissionFileResponse {
  id: number
  fileName: string
  filePath: string
  fileSize?: number | null
  mimeType?: string | null
  orderIndex?: number | null
}

export interface BackendSubmissionResponse {
  id: number
  assignmentId: number
  assignmentTitle?: string | null
  studentId: number
  studentName?: string | null
  version: number
  isFinal?: boolean
  note?: string | null
  submittedAt?: string | null
  isLate?: boolean
  assignmentDueDate?: string | null
  status?: string | null
  files?: BackendSubmissionFileResponse[]
  score?: number | null
  feedback?: string | null
}

export interface BackendGradeRequest {
  score: number
  feedback?: string
}

export interface BackendNotificationResponse {
  id: number
  notificationId?: number | null
  type: string
  data?: string | null
  isRead: boolean
  readAt?: string | null
  createdAt?: string | null
}

export interface BackendGradeResponse {
  id: number
  submissionId: number
  assignmentId?: number
  assignmentTitle?: string | null
  studentId?: number
  studentName?: string | null
  score: number
  feedback?: string | null
  graderName?: string | null
  gradedAt?: string | null
}

export interface BackendPostResponse {
  id: number
  courseId: number
  authorId: number
  authorName?: string | null
  title: string
  content: string
  isPinned: boolean
  commentCount?: number | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface BackendCommentResponse {
  id: number
  postId: number
  authorId: number
  authorName?: string | null
  parentId?: number | null
  content: string
  createdAt?: string | null
  replies?: BackendCommentResponse[]
}

export interface BackendPersonalEventRequest {
  title: string
  eventDate: string
}

export interface BackendPersonalEventResponse {
  id: number
  title: string
  eventDate: string
  createdAt?: string | null
  updatedAt?: string | null
}
