import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { assignments, courses, getUserCourses, getAssignmentSubmissions, getUser } from "@/lib/mock-data"
import { SubmissionsClient } from "./submissions-client"

export default async function TeacherAssignmentSubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await verifySession()
  if (!session || session.role !== "teacher") redirect("/login")

  const assignmentId = Number(id)
  const assignment = assignments.find(a => a.id === assignmentId)
  if (!assignment) redirect("/teacher/assignments")

  const myCourses = getUserCourses(session.id)
  const course = myCourses.find(c => c.id === assignment.course_id)
  if (!course) redirect("/teacher/assignments")

  const subs = getAssignmentSubmissions(assignmentId)

  return (
    <SubmissionsClient
      assignment={assignment}
      courseName={course.title}
      submissions={subs}
    />
  )
}
