import type { BackendUserResponse } from "@/lib/auth"
import type { BackendCourseResponse, BackendEnrollmentResponse } from "./types"
import type { Course, Enrollment, User } from "@/lib/types"

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
