import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { listTeacherAssignmentRows } from "@/lib/api/assignments"
import { listMyPersonalEvents } from "@/lib/api/personal-events"
import { listCourses } from "@/lib/api/courses"
import { PageHeader, Card, EmptyState } from "@/components/ui/primitives"
import { CalendarClient } from "@/components/calendar/calendar-client"
import { ApiError } from "@/lib/api-client"

export default async function TeacherCalendarPage() {
  const session = await verifySession()
  if (!session || session.role !== "teacher") redirect("/login")

  try {
    const [assignments, personalEventsRaw, courses] = await Promise.all([
      listTeacherAssignmentRows(session.id),
      listMyPersonalEvents(),
      listCourses({ teacherId: session.id }),
    ])

    const assignmentEvents = assignments
      .filter(a => !!a.due_date)
      .map(a => ({
        id: `assignment-${a.id}`,
        date: a.due_date!,
        title: a.title,
        type: "assignment" as const,
        course: courses.find(c => c.id === a.course_id),
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
          subtitle={`${courses.length} course${courses.length !== 1 ? "s" : ""}`}
        />
        <CalendarClient
          role="teacher"
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
