import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { getStudentAssignments, getSubmission, getGrade, getCourse } from "@/lib/mock-data"
import type { Course } from "@/lib/types"
import { StudentAssignmentsClient } from "./assignments-client"

type AssignmentRow = {
  id: number
  title: string
  dueDate?: string
  maxScore: number
  score?: number
  status: "open" | "submitted" | "graded" | "overdue"
  course: Course
}

export default async function StudentAssignmentsPage() {
  const session = await verifySession()
  if (!session || session.role !== "student") redirect("/login")

  const now = new Date()
  const assignments = getStudentAssignments(session.id)

  const rows: AssignmentRow[] = []
  for (const a of assignments) {
    const course = getCourse(a.course_id)
    if (!course) continue
    const sub = getSubmission(a.id, session.id)
    const grade = sub ? getGrade(sub.id) : undefined

    let status: AssignmentRow["status"] = "open"
    if (grade) status = "graded"
    else if (sub) status = "submitted"
    else if (a.due_date && new Date(a.due_date) < now) status = "overdue"

    rows.push({
      id: a.id,
      title: a.title,
      dueDate: a.due_date ?? undefined,
      maxScore: a.max_score,
      score: grade?.score,
      status,
      course,
    })
  }

  return <StudentAssignmentsClient assignments={rows} />
}
