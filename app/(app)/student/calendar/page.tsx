import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { listMyEnrollments } from "@/lib/api/enrollments"
import { listStudentAssignmentRows } from "@/lib/api/assignments"
import { listMyPersonalEvents } from "@/lib/api/personal-events"
import { PageHeader, Card, EmptyState } from "@/components/ui/primitives"
import { CalendarClient } from "@/components/calendar/calendar-client"
import { ApiError } from "@/lib/api-client"

export default async function StudentCalendarPage() {
  const session = await verifySession()
  if (!session || session.role !== "student") redirect("/login")

  try {
    const [enrollments, assignments, personalEventsRaw] = await Promise.all([
      listMyEnrollments("ACTIVE"),
      listStudentAssignmentRows(),
      listMyPersonalEvents(),
    ])

    const assignmentEvents = assignments
      .filter(a => !!a.dueDate)
      .map(a => ({
        id: `assignment-${a.id}`,
        date: a.dueDate!,
        title: a.title,
        type: "assignment" as const,
        course: a.course,
        assignmentId: a.id,
      }))

    const personalEvents = personalEventsRaw.map(ev => ({
      id: `personal-${ev.id}`,
      date: ev.eventDate,
      title: ev.title,
      type: "personal" as const,
      eventId: ev.id,
    }))

    return (
      <div>
        <PageHeader
          title="Calendar"
          subtitle={`${enrollments.length} enrolled course${enrollments.length !== 1 ? "s" : ""}`}
        />
        <CalendarClient
          role="student"
          assignmentEvents={assignmentEvents}
          personalEvents={personalEvents}
        />
      </div>
    )
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Failed to load calendar"
    return (
      <div>
        <PageHeader title="Calendar" subtitle="Unable to load calendar" />
        <Card>
          <EmptyState title="Could not load calendar" description={message} />
        </Card>
      </div>
    )
  }
}
