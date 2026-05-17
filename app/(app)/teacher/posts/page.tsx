import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { getUserCourses, getCoursePosts, comments, users } from "@/lib/mock-data"
import { TeacherPostsClient } from "./posts-client"

export default async function TeacherPostsPage() {
  const session = await verifySession()
  if (!session || session.role !== "teacher") redirect("/login")

  const myCourses = getUserCourses(session.id)
  const postsWithMeta = myCourses.map(c => ({
    courseId: c.id,
    posts: getCoursePosts(c.id).map(p => ({
      ...p,
      authorName: users.find(u => u.id === p.author_id)?.full_name ?? "Unknown",
      commentCount: comments.filter(c => c.post_id === p.id).length,
    })),
  }))

  return (
    <TeacherPostsClient
      courses={myCourses}
      postsByCourse={postsWithMeta}
      teacherId={session.id}
    />
  )
}
