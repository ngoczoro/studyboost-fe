import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { getCourseById } from "@/lib/api/courses"
import { listCourseStudents } from "@/lib/api/enrollments"
import { getCourseCurriculum } from "@/lib/api/sections"
import { CourseEditor } from "./course-editor"

export default async function TeacherCourseEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await verifySession()
  if (!session || session.role !== "teacher") redirect("/login")

  const courseId = Number(id)
  const course = await getCourseById(courseId)
  if (!course || course.teacher_id !== session.id) redirect("/teacher/courses")

  const [enrollments, sections] = await Promise.all([
    listCourseStudents(courseId),
    getCourseCurriculum(courseId),
  ])
  const enrolledCount = enrollments.filter(e => e.status === "ACTIVE").length

  return (
    <CourseEditor
      course={course}
      enrolledCount={enrolledCount}
      enrollments={enrollments}
      initialSections={sections}
    />
  )
}
