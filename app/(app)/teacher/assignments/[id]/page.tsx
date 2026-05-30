import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { getAssignment, listSubmissions } from "@/lib/api/assignments"
import { listCourses } from "@/lib/api/courses"
import { mapBackendSubmission } from "@/lib/api/assignment-mappers"
import { getGradeBySubmission } from "@/lib/api/grades"
import { SubmissionsClient } from "./submissions-client"

export default async function TeacherAssignmentSubmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await verifySession()
  if (!session || session.role !== "teacher") redirect("/login")

  const assignmentId = Number(id)
  const assignment = await getAssignment(assignmentId)
  if (!assignment) redirect("/teacher/assignments")

  const myCourses = await listCourses({ teacherId: session.id })
  const course = myCourses.find(c => c.id === assignment.course_id)
  if (!course) redirect("/teacher/assignments")

  const subs = await listSubmissions(assignmentId)
  const submissions = await Promise.all(
    subs
      .filter(s => s.isFinal !== false)
      .map(async s => {
        const mapped = mapBackendSubmission(s)
        if (s.assignmentDueDate) {
          mapped.assignmentDueDate = s.assignmentDueDate
        }
        if (s.score != null || s.status === "GRADED") {
          const grade = await getGradeBySubmission(s.id)
          if (grade) mapped.grade = grade
        }
        return mapped
      }),
  )

  return (
    <SubmissionsClient
      assignment={assignment}
      courseName={course.title}
      submissions={submissions}
    />
  )
}
