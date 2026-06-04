import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { getCourseById } from "@/lib/api/courses"
import { listCourseStudents } from "@/lib/api/enrollments"
import { getCourseCurriculum } from "@/lib/api/sections"
import { listAssignmentsInCourse, listSubmissions } from "@/lib/api/assignments"
import { CourseEditor } from "./course-editor"

export type CourseAssignmentRow = Awaited<ReturnType<typeof loadCourseAssignments>>[number]

async function loadCourseAssignments(courseId: number) {
  const assignments = await listAssignmentsInCourse(courseId)
  return Promise.all(
    assignments.map(async assignment => {
      const subs = await listSubmissions(assignment.id)
      return {
        ...assignment,
        submissionCount: subs.filter(s => s.isFinal !== false).length,
      }
    }),
  )
}

export default async function TeacherCourseEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await verifySession()
  if (!session || session.role !== "teacher") redirect("/login")

  const courseId = Number(id)
  const course = await getCourseById(courseId)
  if (!course || course.teacher_id !== session.id) redirect("/teacher/courses")

  const [enrollments, sections, initialAssignments] = await Promise.all([
    listCourseStudents(courseId),
    getCourseCurriculum(courseId),
    loadCourseAssignments(courseId),
  ])
  const enrolledCount = enrollments.filter(e => e.status === "ACTIVE").length

  return (
    <CourseEditor
      course={course}
      enrolledCount={enrolledCount}
      enrollments={enrollments}
      initialSections={sections}
      initialAssignments={initialAssignments}
      serverNowIso={new Date().toISOString()}
    />
  )
}
