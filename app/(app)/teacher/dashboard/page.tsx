import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { listCourses } from "@/lib/api/courses"
import { countActiveEnrollments } from "@/lib/api/enrollments"
import {
  listTeacherAssignmentRows,
  listPendingTeacherSubmissions,
} from "@/lib/api/assignments"
import { Card, StatCard, PageHeader, EmptyState } from "@/components/ui/primitives"
import { CourseGlyph } from "@/components/ui/course-glyph"
import { BookIcon, UsersIcon, ClipboardCheckIcon, CheckIcon } from "@/components/ui/icons"
import { relative } from "@/lib/fmt"
import Link from "next/link"
import { ApiError } from "@/lib/api-client"

export default async function TeacherDashboardPage() {
  const session = await verifySession()
  if (!session || session.role !== "teacher") redirect("/login")

  try {
    const [myCourses, myAssignments, pendingGrading] = await Promise.all([
      listCourses({ teacherId: session.id }),
      listTeacherAssignmentRows(session.id),
      listPendingTeacherSubmissions(session.id),
    ])

    const enrollmentCounts = await Promise.all(
      myCourses.map(c => countActiveEnrollments(c.id)),
    )
    const totalStudents = enrollmentCounts.reduce((sum, n) => sum + n, 0)

    return (
      <>
        <PageHeader title="Teacher Dashboard" subtitle="Welcome back. Here's what's happening." />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
          <StatCard label="My courses" value={myCourses.length} icon={<BookIcon size={20} />} />
          <StatCard label="Total students" value={totalStudents} icon={<UsersIcon size={20} />} />
          <StatCard label="Assignments" value={myAssignments.length} icon={<ClipboardCheckIcon size={20} />} />
          <StatCard
            label="To grade"
            value={pendingGrading.length}
            trend={pendingGrading.length > 0 ? `${pendingGrading.length} pending` : "All caught up"}
            icon={<CheckIcon size={20} />}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>My courses</h2>
              <Link href="/teacher/courses" style={{ fontSize: 13, color: "var(--color-primary-600)", fontWeight: 600, textDecoration: "none" }}>
                View all →
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {myCourses.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/teacher/courses/${c.id}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 0", borderBottom: "1px solid var(--color-border)",
                    textDecoration: "none", color: "inherit",
                  }}
                >
                  <CourseGlyph course={c} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-fg)" }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: "var(--color-fg-muted)" }}>
                      {enrollmentCounts[i] ?? 0} students enrolled
                    </div>
                  </div>
                </Link>
              ))}
              {myCourses.length === 0 && (
                <p style={{ fontSize: 13, color: "var(--color-fg-muted)", margin: 0 }}>No courses yet.</p>
              )}
            </div>
          </Card>

          <Card>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Submissions to grade</h2>
            {pendingGrading.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--color-fg-muted)", margin: 0 }}>All caught up!</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pendingGrading.map(({ submission, assignment, courseName, studentName }) => (
                  <Link
                    key={`${submission.id}`}
                    href={`/teacher/assignments/${assignment.id}`}
                    style={{
                      display: "block", padding: "10px 12px",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8, textDecoration: "none",
                      background: "var(--color-surface)",
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-fg)" }}>{studentName}</div>
                    <div style={{ fontSize: 12, color: "var(--color-fg-muted)", marginTop: 2 }}>
                      {assignment.title} · {courseName}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--color-fg-muted)", marginTop: 2 }}>
                      {submission.submittedAt ? relative(submission.submittedAt) : "Recently submitted"}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </>
    )
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Failed to load dashboard"
    return (
      <>
        <PageHeader title="Teacher Dashboard" subtitle="Unable to load courses" />
        <Card>
          <EmptyState title="Could not load dashboard" description={message} />
        </Card>
      </>
    )
  }
}
