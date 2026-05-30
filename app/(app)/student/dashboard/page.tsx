import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { listMyEnrollments } from "@/lib/api/enrollments"
import { listStudentAssignmentRows } from "@/lib/api/assignments"
import { getStudentAverageGrade } from "@/lib/api/grades"
import { PageHeader, StatCard, Card, EmptyState } from "@/components/ui/primitives"
import { CourseGlyph } from "@/components/ui/course-glyph"
import Link from "next/link"
import { ApiError } from "@/lib/api-client"
import { formatDateTimeHcm } from "@/lib/datetime-format"

export default async function StudentDashboardPage() {
  const session = await verifySession()
  if (!session || session.role !== "student") redirect("/login")

  const now = new Date()

  try {
    const [enrollments, assignmentRows, avgGrade] = await Promise.all([
      listMyEnrollments("ACTIVE"),
      listStudentAssignmentRows(),
      getStudentAverageGrade(),
    ])

    const upcoming = assignmentRows.filter(a => {
      if (!a.dueDate) return false
      return new Date(a.dueDate) > now && a.status === "open"
    })

    const overdue = assignmentRows.filter(a => a.status === "overdue")

    const firstEnrollment = enrollments[0]
    const continueCourse = firstEnrollment?.course ?? null
    const continueTeacher = continueCourse?.teacher ?? null

    return (
      <div>
        <PageHeader
          title={`Welcome back, ${session.full_name.split(" ")[0]}`}
          subtitle="Here's what's happening with your courses."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <StatCard label="Enrolled courses" value={enrollments.length} />
          <StatCard label="Upcoming" value={upcoming.length} />
          <StatCard label="Overdue" value={overdue.length} />
          <StatCard label="Avg grade" value={avgGrade != null ? avgGrade.toFixed(1) : "—"} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Card>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Continue learning</h3>
            {continueCourse ? (
              <Link href={`/student/courses/${continueCourse.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface-2)",
                    cursor: "pointer",
                  }}
                >
                  <CourseGlyph course={continueCourse} size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {continueCourse.title}
                    </div>
                    {continueTeacher && (
                      <div style={{ fontSize: 12, color: "var(--color-fg-muted)", marginTop: 2 }}>
                        {continueTeacher.full_name}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: "var(--color-primary-600)", fontWeight: 500, flexShrink: 0 }}>
                    Continue →
                  </span>
                </div>
              </Link>
            ) : (
              <p style={{ fontSize: 14, color: "var(--color-fg-muted)", margin: 0 }}>
                You haven&apos;t enrolled in any courses yet.{" "}
                <Link href="/student/courses" style={{ color: "var(--color-primary-600)" }}>
                  Browse courses
                </Link>
              </p>
            )}
          </Card>

          <Card>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Coming up</h3>
            {upcoming.length === 0 ? (
              <p style={{ fontSize: 14, color: "var(--color-fg-muted)", margin: 0 }}>
                No upcoming assignments. You&apos;re all caught up!
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {upcoming.slice(0, 4).map(a => {
                  const due = new Date(a.dueDate!)
                  const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                  return (
                    <Link
                      key={a.id}
                      href={`/student/assignments/${a.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 12px",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--color-border)",
                          gap: 8,
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {a.title}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--color-fg-muted)" }}>
                            {a.course.title}
                            {a.dueDate && (
                              <> · Due {formatDateTimeHcm(a.dueDate)}</>
                            )}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: daysLeft <= 2 ? "#dc2626" : "var(--color-fg-muted)",
                            flexShrink: 0,
                          }}
                        >
                          {daysLeft === 0 ? "Due today" : daysLeft === 1 ? "Due tomorrow" : `${daysLeft}d left`}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    )
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Failed to load dashboard"
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Unable to load your courses" />
        <Card>
          <EmptyState title="Could not load dashboard" description={message} />
        </Card>
      </>
    )
  }
}
