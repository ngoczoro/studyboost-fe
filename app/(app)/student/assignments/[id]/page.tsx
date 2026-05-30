import { verifySession } from "@/lib/session"
import { redirect, notFound } from "next/navigation"
import {
  getAssignment,
  getStudentSubmissionForAssignment,
} from "@/lib/api/assignments"
import { getCourseById } from "@/lib/api/courses"
import { listMyEnrollments } from "@/lib/api/enrollments"
import { getGradeBySubmission } from "@/lib/api/grades"
import { AssignmentDetailClient } from "./assignment-detail-client"

export default async function StudentAssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await verifySession()
  if (!session || session.role !== "student") redirect("/login")

  const assignmentId = Number(id)
  const assignment = await getAssignment(assignmentId)
  if (!assignment) notFound()

  const enrollments = await listMyEnrollments("ACTIVE")
  const isEnrolled = enrollments.some(
    e => e.course_id === assignment.course_id && e.status === "ACTIVE",
  )
  if (!isEnrolled) redirect("/student/assignments")

  const course = await getCourseById(assignment.course_id)
  if (!course) notFound()

  const submission = await getStudentSubmissionForAssignment(assignmentId)
  let grade = submission?.grade
  if (submission && !grade) {
    grade = (await getGradeBySubmission(submission.id)) ?? undefined
  }

  return (
    <div style={{ padding: "0 0 40px" }}>
      <AssignmentDetailClient
        assignment={assignment}
        course={course}
        submission={submission && grade ? { ...submission, grade } : submission}
      />
    </div>
  )
}
