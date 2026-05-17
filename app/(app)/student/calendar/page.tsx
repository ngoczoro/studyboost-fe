import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { getStudentAssignments, getCourse, getStudentEnrollments } from "@/lib/mock-data"
import { PageHeader } from "@/components/ui/primitives"
import { StudentCalendarClient } from "./calendar-client"

export default async function StudentCalendarPage() {
  const session = await verifySession()
  if (!session || session.role !== "student") redirect("/login")

  const enrollments = getStudentEnrollments(session.id).filter(e => e.status === "ACTIVE")
  const assignments = getStudentAssignments(session.id)

  const events = assignments
    .filter(a => !!a.due_date)
    .map(a => {
      const course = getCourse(a.course_id)
      return {
        id: `assignment-${a.id}`,
        date: a.due_date!,
        title: a.title,
        type: "assignment" as const,
        course: course ?? undefined,
        assignmentId: a.id,
      }
    })
    .filter(e => !!e.course)

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle={`${enrollments.length} enrolled course${enrollments.length !== 1 ? "s" : ""}`}
      />
      <StudentCalendarClient events={events} />
    </div>
  )
}
