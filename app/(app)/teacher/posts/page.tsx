import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { listCourses } from "@/lib/api/courses"
import { getPostsInCourse } from "@/lib/api/posts"
import { ApiError } from "@/lib/api-client"
import { Card, EmptyState, PageHeader } from "@/components/ui/primitives"
import { TeacherPostsClient } from "./posts-client"

export default async function TeacherPostsPage() {
  const session = await verifySession()
  if (!session || session.role !== "teacher") redirect("/login")

  try {
    const myCourses = await listCourses({ teacherId: session.id })

    const postsByCourse = await Promise.all(
      myCourses.map(async c => ({
        courseId: c.id,
        posts: await getPostsInCourse(c.id),
      })),
    )

    return (
      <TeacherPostsClient
        courses={myCourses}
        postsByCourse={postsByCourse}
        teacherId={session.id}
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
