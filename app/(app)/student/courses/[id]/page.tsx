import { verifySession } from "@/lib/session"
import { redirect, notFound } from "next/navigation"
import { getCourseById } from "@/lib/api/courses"
import { listMyEnrollments } from "@/lib/api/enrollments"
import { getCourseCurriculum } from "@/lib/api/sections"
import {
  getCourseAssignments,
  getSubmission, getGrade, getCoursePosts, comments, users,
} from "@/lib/mock-data"
import { PageHeader, Card, EmptyState } from "@/components/ui/primitives"
import { CourseDetailClient } from "./course-detail-client"
import { ApiError } from "@/lib/api-client"

export default async function StudentCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await verifySession()
  if (!session || session.role !== "student") redirect("/login")

  const courseId = Number(id)
  const course = await getCourseById(courseId)
  if (!course) notFound()

  const enrollments = await listMyEnrollments()
  const isEnrolled = enrollments.some(e => e.course_id === courseId && e.status === "ACTIVE")
  if (!isEnrolled) redirect("/student/courses")

  let sections: Awaited<ReturnType<typeof getCourseCurriculum>> = []
  let sectionsError: string | null = null

  try {
    sections = await getCourseCurriculum(courseId)
  } catch (err) {
    sectionsError = err instanceof ApiError ? err.message : "Failed to load course content"
  }

  const teacher = course.teacher
  const now = new Date()

  const assignments = getCourseAssignments(courseId).map(a => {
    const sub = getSubmission(a.id, session.id)
    const grade = sub ? getGrade(sub.id) : undefined
    let status: "open" | "submitted" | "graded" | "overdue" = "open"
    if (grade) status = "graded"
    else if (sub) status = "submitted"
    else if (a.due_date && new Date(a.due_date) < now) status = "overdue"
    return { ...a, submission: sub ? { ...sub, grade: grade ?? undefined } : undefined, status }
  })

  const rawPosts = getCoursePosts(courseId)
  const posts = rawPosts.map(p => ({
    ...p,
    authorName: users.find(u => u.id === p.author_id)?.full_name ?? "Unknown",
    commentCount: comments.filter(c => c.post_id === p.id).length,
  }))

  return (
    <div>
      <PageHeader
        title={course.title}
        subtitle={teacher ? `Instructor: ${teacher.full_name}` : undefined}
      />
      {sectionsError ? (
        <Card style={{ marginBottom: 16 }}>
          <EmptyState title="Could not load course content" description={sectionsError} />
        </Card>
      ) : null}
      <CourseDetailClient
        course={course}
        sections={sections}
        assignments={assignments}
        posts={posts}
        studentId={session.id}
      />
    </div>
  )
}
