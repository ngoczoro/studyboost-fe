import type { BackendUserResponse } from "@/lib/auth"
import type {
  BackendCourseResponse,
  BackendEnrollmentResponse,
  BackendAssignmentResponse,
  BackendSubmissionResponse,
  BackendSubmissionFileResponse,
  BackendGradeResponse,
  BackendPostResponse,
  BackendCommentResponse,
  BackendNotificationResponse,
} from "./types"
import type { Course, Enrollment, User, Assignment, Submission, Grade, Post, Comment, Notification } from "@/lib/types"

const GLYPH_COLORS = ["#86efac", "#fbbf24", "#60a5fa", "#f472b6", "#a78bfa"]

function deriveColor(id: number): string {
  return GLYPH_COLORS[Math.abs(id) % GLYPH_COLORS.length]
}

function deriveGlyph(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return title.slice(0, 2).toUpperCase() || "SB"
}

export function mapBackendUser(user: BackendUserResponse): User {
  return {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    role: "student",
    avatar_url: user.avatarUrl ?? undefined,
    is_active: user.isActive,
    created_at: new Date().toISOString(),
  }
}

export function mapBackendCourse(course: BackendCourseResponse): Course {
  return {
    id: course.id,
    title: course.title,
    description: course.description ?? undefined,
    thumbnail_url: course.thumbnailUrl ?? undefined,
    thumbnail_color: deriveColor(course.id),
    thumbnail_glyph: deriveGlyph(course.title),
    teacher_id: course.teacher?.id ?? 0,
    teacher: course.teacher ? mapBackendUser(course.teacher) : undefined,
    status: course.status,
    max_students: course.maxStudents ?? 30,
    created_at: course.createdAt ?? new Date().toISOString(),
  }
}

export function mapBackendEnrollment(enrollment: BackendEnrollmentResponse): Enrollment {
  return {
    id: enrollment.id,
    student_id: enrollment.student?.id ?? 0,
    course_id: enrollment.course?.id ?? 0,
    enrolled_at: enrollment.enrolledAt ?? new Date().toISOString(),
    status: enrollment.status,
    course: enrollment.course ? mapBackendCourse(enrollment.course) : undefined,
    student: enrollment.student ? mapBackendUser(enrollment.student) : undefined,
  }
}

export function mapBackendAssignment(a: BackendAssignmentResponse): Assignment {
  return {
    id: a.id,
    course_id: a.courseId,
    section_id: a.sectionId ?? undefined,
    title: a.title,
    description: a.description ?? undefined,
    max_score: Number(a.maxScore),
    due_date: a.dueDate ?? undefined,
    allow_late_submission: a.allowLateSubmission ?? false,
    max_files: a.maxFiles ?? undefined,
    max_file_size_mb: a.maxFileSizeMb ?? undefined,
    allowed_file_types: a.allowedFileTypes ?? undefined,
    created_at: a.createdAt ?? new Date().toISOString(),
  }
}

export function mapBackendGrade(g: BackendGradeResponse): Grade {
  return {
    id: g.id,
    submission_id: g.submissionId,
    grader_id: 0,
    score: Number(g.score),
    feedback: g.feedback ?? undefined,
    graded_at: g.gradedAt ?? new Date().toISOString(),
  }
}

export function mapBackendSubmission(
  s: BackendSubmissionResponse,
): Submission & { gradeId?: number; files?: BackendSubmissionFileResponse[] } {
  const grade: (Grade & { _realId: number }) | undefined = s.score != null
    ? {
        id: 0,
        _realId: 0,
        submission_id: s.id,
        grader_id: 0,
        score: Number(s.score),
        feedback: s.feedback ?? undefined,
        graded_at: new Date().toISOString(),
      }
    : undefined

  return {
    id: s.id,
    assignment_id: s.assignmentId,
    student_id: s.studentId,
    content: s.note ?? undefined,
    attachment_url: s.files?.[0]?.filePath ?? undefined,
    submitted_at: s.submittedAt ?? new Date().toISOString(),
    is_late: s.isLate ?? false,
    student: s.studentId && s.studentName
      ? { id: s.studentId, full_name: s.studentName, email: "", role: "student", is_active: true, created_at: new Date().toISOString() }
      : undefined,
    grade,
    files: s.files ?? [],
  }
}

export function mapBackendPost(p: BackendPostResponse): Post & { authorName: string; commentCount: number } {
  return {
    id: p.id,
    course_id: p.courseId,
    author_id: p.authorId,
    title: p.title,
    content: p.content,
    is_pinned: p.isPinned,
    created_at: p.createdAt ?? new Date().toISOString(),
    updated_at: p.updatedAt ?? new Date().toISOString(),
    authorName: p.authorName ?? "Unknown",
    commentCount: p.commentCount ?? 0,
  }
}

export function mapBackendComment(c: BackendCommentResponse): Comment {
  return {
    id: c.id,
    post_id: c.postId,
    author_id: c.authorId,
    parent_id: c.parentId ?? undefined,
    content: c.content,
    created_at: c.createdAt ?? new Date().toISOString(),
    author: { id: c.authorId, full_name: c.authorName ?? "Unknown", email: "", role: "student", is_active: true, created_at: new Date().toISOString() },
  }
}

export function mapBackendNotification(n: BackendNotificationResponse): Notification {
  let message = n.data ?? ""
  let link: string | undefined
  try {
    const parsed = JSON.parse(n.data ?? "")
    if (parsed && typeof parsed === "object") {
      message = (parsed as { message?: string; link?: string }).message ?? n.data ?? ""
      const rawLink = (parsed as { link?: string }).link
      link = rawLink || undefined
    }
  } catch {
    message = n.data ?? ""
  }
  return {
    id: n.id,
    recipient_id: 0,
    type: n.type as Notification["type"],
    message,
    is_read: n.isRead,
    link,
    created_at: n.createdAt ?? new Date().toISOString(),
  }
}
