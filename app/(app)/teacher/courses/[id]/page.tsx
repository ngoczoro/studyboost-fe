import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { courses, enrollments } from "@/lib/mock-data"
import { CourseEditor } from "./course-editor"

export default async function TeacherCourseEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await verifySession()
  if (!session || session.role !== "teacher") redirect("/login")

  const courseId = Number(id)
  const course = courses.find(c => c.id === courseId && c.teacher_id === session.id)
  if (!course) redirect("/teacher/courses")

  const enrolledCount = enrollments.filter(e => e.course_id === courseId && e.status === "ACTIVE").length

  return <CourseEditor course={course} enrolledCount={enrolledCount} />
}
