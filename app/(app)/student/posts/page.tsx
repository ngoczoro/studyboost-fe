import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { listMyEnrollments } from "@/lib/api/enrollments"
import { getPostsInCourse } from "@/lib/api/posts"
import { ApiError } from "@/lib/api-client"
import { Card, EmptyState, PageHeader } from "@/components/ui/primitives"
import { StudentPostsClient } from "./posts-client"

export default async function StudentPostsPage() {
  const session = await verifySession()
  if (!session || session.role !== "student") redirect("/login")

  try {
    const enrollments = await listMyEnrollments("ACTIVE")
    const enrolledCourses = enrollments.filter(e => e.course).map(e => e.course!)

    const postsByCourse = await Promise.all(
      enrolledCourses.map(async c => ({
        courseId: c.id,
        posts: await getPostsInCourse(c.id),
      })),
    )

    return (
      <StudentPostsClient
        courses={enrolledCourses}
        postsByCourse={postsByCourse}
        studentId={session.id}
      />
    )
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Failed to load discussions"
    return (
      <>
        <PageHeader title="Discussion" subtitle="Unable to load posts" />
        <Card>
          <EmptyState title="Could not load discussions" description={message} />
        </Card>
      </>
    )
  }
}
