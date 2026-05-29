import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { listCourses } from "@/lib/api/courses"
import { listMyEnrollments } from "@/lib/api/enrollments"
import { ApiError } from "@/lib/api-client"
import { Card, EmptyState, PageHeader } from "@/components/ui/primitives"
import { StudentCoursesClient } from "./courses-client"

export default async function StudentCoursesPage() {
  const session = await verifySession()
  if (!session || session.role !== "student") redirect("/login")

  try {
    const [enrollments, publishedCourses] = await Promise.all([
      listMyEnrollments("ACTIVE"),
      listCourses({ status: "PUBLISHED" }),
    ])

    const enrolledIds = new Set(
      enrollments.map(e => e.course_id).filter(Boolean),
    )

    const enrolled = enrollments
      .map(e => {
        const course = e.course
        if (!course) return null
        return {
          enrollmentId: e.id,
          course,
          teacherName: course.teacher?.full_name ?? "Unknown",
        }
      })
      .filter(Boolean) as {
        enrollmentId: number
        course: NonNullable<(typeof enrollments)[0]["course"]>
        teacherName: string
      }[]

    const catalog = publishedCourses
      .filter(c => !enrolledIds.has(c.id))
      .map(c => ({
        ...c,
        teacherName: c.teacher?.full_name ?? "Unknown",
      }))

    return <StudentCoursesClient enrolled={enrolled} catalog={catalog} />
  } catch (err) {
    const message =
      err instanceof ApiError ? err.message : "Failed to load courses"
    return (
      <>
        <PageHeader title="My Courses" subtitle="Unable to load courses" />
        <Card>
          <EmptyState title="Could not load courses" description={message} />
        </Card>
      </>
    )
  }
}
