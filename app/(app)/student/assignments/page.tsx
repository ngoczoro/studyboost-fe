import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { listStudentAssignmentRows } from "@/lib/api/assignments"
import { StudentAssignmentsClient } from "./assignments-client"
import { ApiError } from "@/lib/api-client"
import { Card, EmptyState, PageHeader } from "@/components/ui/primitives"

export default async function StudentAssignmentsPage() {
  const session = await verifySession()
  if (!session || session.role !== "student") redirect("/login")

  try {
    const rows = await listStudentAssignmentRows()
    return <StudentAssignmentsClient assignments={rows} />
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
