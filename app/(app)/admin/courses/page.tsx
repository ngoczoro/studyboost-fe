import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { listCourses } from "@/lib/api/courses"
import { countActiveEnrollments } from "@/lib/api/enrollments"
import { PageHeader, Card, EmptyState } from "@/components/ui/primitives"
import { AdminCoursesClient } from "./admin-courses-client"
import { ApiError } from "@/lib/api-client"
import type { Course } from "@/lib/types"

export type CourseWithMeta = Course & { teacherName: string; enrolled: number }

export default async function AdminCoursesPage() {
  const session = await verifySession()
  if (!session || session.role !== "admin") redirect("/login")

  try {
    const courses = await listCourses()
    const courseList: CourseWithMeta[] = await Promise.all(
      courses.map(async c => ({
        ...c,
        teacherName: c.teacher?.full_name ?? "Unknown",
        enrolled: await countActiveEnrollments(c.id),
      })),
    )

    return <AdminCoursesClient initialCourses={courseList} />
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Failed to load courses"
    return (
      <>
        <PageHeader title="Course moderation" subtitle="Unable to load courses" />
        <Card>
          <EmptyState title="Could not load courses" description={message} />
        </Card>
      </>
    )
  }
}
