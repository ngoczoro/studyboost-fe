import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { listCourses } from "@/lib/api/courses"
import { listTeacherAssignmentRows } from "@/lib/api/assignments"
import { TeacherAssignmentsClient } from "./assignments-client"
import { ApiError } from "@/lib/api-client"
import { Card, EmptyState, PageHeader } from "@/components/ui/primitives"

export default async function TeacherAssignmentsPage() {
  const session = await verifySession()
  if (!session || session.role !== "teacher") redirect("/login")

  try {
    const [myCourses, assignmentsWithMeta] = await Promise.all([
      listCourses({ teacherId: session.id }),
      listTeacherAssignmentRows(session.id),
    ])

    return (
      <TeacherAssignmentsClient
        assignments={assignmentsWithMeta}
        courses={myCourses}
        serverNowIso={new Date().toISOString()}
      />
    )
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Failed to load assignments"
    return (
      <>
        <PageHeader title="Assignments" subtitle="Unable to load assignments" />
        <Card>
          <EmptyState title="Could not load assignments" description={message} />
        </Card>
      </>
    )
  }
}
