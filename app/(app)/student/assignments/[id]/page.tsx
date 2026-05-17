import { verifySession } from "@/lib/session"
import { redirect, notFound } from "next/navigation"
import { assignments, getCourse, getSubmission, getGrade, getStudentEnrollments } from "@/lib/mock-data"
import { AssignmentDetailClient } from "./assignment-detail-client"

export default async function StudentAssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await verifySession()
  if (!session || session.role !== "student") redirect("/login")

  const assignmentId = Number(id)
  const assignment = assignments.find(a => a.id === assignmentId)
  if (!assignment) notFound()

  const enrollments = getStudentEnrollments(session.id)
  const isEnrolled = enrollments.some(e => e.course_id === assignment.course_id && e.status === "ACTIVE")
  if (!isEnrolled) redirect("/student/assignments")

  const course = getCourse(assignment.course_id)
  if (!course) notFound()

  const sub = getSubmission(assignmentId, session.id)
  const grade = sub ? getGrade(sub.id) : undefined
  const submission = sub ? { ...sub, grade: grade ?? undefined } : undefined

  return (
    <div style={{ padding: "0 0 40px" }}>
      <AssignmentDetailClient
        assignment={assignment}
        course={course}
        submission={submission}
      />
    </div>
  )
}
