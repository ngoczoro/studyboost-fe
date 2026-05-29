import { verifySession } from "@/lib/session"
import { redirect, notFound } from "next/navigation"
import { getCourseById } from "@/lib/api/courses"
import { countActiveEnrollments } from "@/lib/api/enrollments"
import { getCourseCurriculum } from "@/lib/api/sections"
import { getCourseAssignments } from "@/lib/mock-data"
import { AdminCourseDetailClient } from "./admin-course-detail-client"

export default async function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await verifySession()
  if (!session || session.role !== "admin") redirect("/login")

  const courseId = Number(id)
  if (Number.isNaN(courseId)) notFound()

  const course = await getCourseById(courseId)
  if (!course) notFound()

  const [sections, enrolledCount] = await Promise.all([
    getCourseCurriculum(courseId),
    countActiveEnrollments(courseId),
  ])

  const assignments = getCourseAssignments(courseId)

  return (
    <AdminCourseDetailClient
      course={course}
      sections={sections}
      enrolledCount={enrolledCount}
      assignmentCount={assignments.length}
      assignments={assignments.map(a => ({
        id: a.id,
        title: a.title,
        due_date: a.due_date,
        max_score: a.max_score,
      }))}
    />
  )
}
