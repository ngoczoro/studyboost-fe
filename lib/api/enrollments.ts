import "server-only"

import type {
  BackendEnrollmentResponse,
  BackendEnrollmentStatus,
} from "./types"
import { authJson } from "./authenticated"
import { listCourses } from "./courses"
import { mapBackendEnrollment } from "./mappers"
import type { Enrollment } from "@/lib/types"

export async function listMyEnrollments(
  status?: BackendEnrollmentStatus,
): Promise<Enrollment[]> {
  const query = status ? `?status=${status}` : ""
  const data = await authJson<BackendEnrollmentResponse[]>(
    `/api/users/me/courses${query}`,
  )
  return data.map(mapBackendEnrollment)
}

export async function listCourseStudents(courseId: number): Promise<Enrollment[]> {
  const data = await authJson<BackendEnrollmentResponse[]>(
    `/api/courses/${courseId}/students`,
  )
  return data.map(mapBackendEnrollment)
}

export async function enrollInCourse(courseId: number): Promise<Enrollment> {
  const data = await authJson<BackendEnrollmentResponse>(
    `/api/courses/${courseId}/enroll`,
    { method: "POST" },
  )
  return mapBackendEnrollment(data)
}

export async function countActiveEnrollments(courseId: number): Promise<number> {
  const enrollments = await listCourseStudents(courseId)
  return enrollments.filter(e => e.status === "ACTIVE").length
}

export async function listTeacherStudentRows(teacherId: number): Promise<
  { enrollmentId: number; student: NonNullable<Enrollment["student"]>; courseName: string }[]
> {
  const courses = await listCourses({ teacherId })

  const rows = await Promise.all(
    courses.map(async course => {
      const enrollments = await listCourseStudents(course.id)
      return enrollments
        .filter(e => e.status === "ACTIVE" && e.student)
        .map(e => ({
          enrollmentId: e.id,
          student: e.student!,
          courseName: course.title,
        }))
    }),
  )

  return rows.flat()
}

export async function countTotalActiveEnrollments(courseIds: number[]): Promise<number> {
  if (courseIds.length === 0) return 0
  const counts = await Promise.all(courseIds.map(id => countActiveEnrollments(id)))
  return counts.reduce((sum, n) => sum + n, 0)
}
