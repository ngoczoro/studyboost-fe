import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { getStudentEnrollments, courses, getUser } from "@/lib/mock-data"
import { StudentCoursesClient } from "./courses-client"

export default async function StudentCoursesPage() {
  const session = await verifySession()
  if (!session || session.role !== "student") redirect("/login")

  const enrollments = getStudentEnrollments(session.id).filter(e => e.status === "ACTIVE")
  const enrolledIds = new Set(enrollments.map(e => e.course_id))

  const enrolled = enrollments
    .map(e => {
      const course = courses.find(c => c.id === e.course_id)
      if (!course) return null
      const teacher = getUser(course.teacher_id)
      return { enrollmentId: e.id, course, teacherName: teacher?.full_name ?? "Unknown" }
    })
    .filter(Boolean) as { enrollmentId: number; course: (typeof courses)[0]; teacherName: string }[]

  const catalog = courses
    .filter(c => c.status === "PUBLISHED" && !enrolledIds.has(c.id))
    .map(c => {
      const teacher = getUser(c.teacher_id)
      return { ...c, teacherName: teacher?.full_name ?? "Unknown" }
    })

  return <StudentCoursesClient enrolled={enrolled} catalog={catalog} />
}
