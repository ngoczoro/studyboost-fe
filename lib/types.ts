export type Role = string

export interface User {
  id: number
  email: string
  full_name: string
  role: Role
  avatar_url?: string
  is_active: boolean
  created_at: string
}

export interface Course {
  id: number
  title: string
  description?: string
  thumbnail_url?: string
  thumbnail_color?: string
  thumbnail_glyph?: string
  teacher_id: number
  teacher?: User
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  max_students: number
  created_at: string
  sections?: Section[]
}

export interface Enrollment {
  id: number
  student_id: number
  course_id: number
  enrolled_at: string
  status: "ACTIVE" | "DROPPED" | "COMPLETED"
  course?: Course
  student?: User
}

export interface Section {
  id: number
  course_id: number
  title: string
  order_index: number
  items?: SectionItem[]
}

export interface SectionItem {
  id: number
  section_id: number
  type: "video" | "file" | "text" | "assignment"
  title: string
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
  order_index: number
  is_visible: boolean
}

export interface Assignment {
  id: number
  course_id: number
  section_id?: number
  title: string
  description?: string
  max_score: number
  due_date?: string
  allow_late_submission: boolean
  max_files?: number
  max_file_size_mb?: number
  allowed_file_types?: string
  created_at: string
  course?: Course
}

export interface Submission {
  id: number
  assignment_id: number
  student_id: number
  content?: string
  attachment_url?: string
  submitted_at: string
  is_late: boolean
  student?: User
  assignment?: Assignment
  grade?: Grade
}

export interface Grade {
  id: number
  submission_id: number
  grader_id: number
  score: number
  feedback?: string
  graded_at: string
}

export interface Post {
  id: number
  course_id: number
  author_id: number
  title: string
  content: string
  is_pinned: boolean
  created_at: string
  updated_at: string
  author?: User
  course?: Course
  comments?: Comment[]
}

export interface Comment {
  id: number
  post_id: number
  author_id: number
  parent_id?: number
  content: string
  created_at: string
  author?: User
}

export interface Notification {
  id: number
  recipient_id: number
  type: "GRADE_RELEASED" | "NEW_POST" | "NEW_ASSIGNMENT" | "ENROLLMENT_UPDATED" | "SUBMISSION_RECEIVED" | "NEW_COMMENT" | "SYSTEM_ALERT"
  message: string
  is_read: boolean
  link?: string
  created_at: string
}

export interface SessionUser {
  id: number
  email: string
  full_name: string
  role: Role
}
