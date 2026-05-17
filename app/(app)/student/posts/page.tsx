import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { getStudentEnrollments, courses, getCoursePosts, comments, users } from "@/lib/mock-data"
import { StudentPostsClient } from "./posts-client"

export default async function StudentPostsPage() {
  const session = await verifySession()
  if (!session || session.role !== "student") redirect("/login")

  const enrollments = getStudentEnrollments(session.id).filter(e => e.status === "ACTIVE")
  const enrolledCourses = enrollments
    .map(e => courses.find(c => c.id === e.course_id))
    .filter(Boolean) as (typeof courses)[number][]

  const postsByCourse = enrolledCourses.map(c => ({
    courseId: c.id,
    posts: getCoursePosts(c.id).map(p => ({
      ...p,
      authorName: users.find(u => u.id === p.author_id)?.full_name ?? "Unknown",
      commentCount: comments.filter(cm => cm.post_id === p.id).length,
    })),
  }))

  return (
    <StudentPostsClient
      courses={enrolledCourses}
      postsByCourse={postsByCourse}
      studentId={session.id}
    />
  )
}
