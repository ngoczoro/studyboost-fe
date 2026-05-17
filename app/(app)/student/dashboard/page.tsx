import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import {
  getStudentEnrollments, getStudentAssignments,
  getSubmission, getGrade, getCourse, getUser,
  submissions, grades,
} from "@/lib/mock-data"
import { PageHeader, StatCard, Card } from "@/components/ui/primitives"
import { CourseGlyph } from "@/components/ui/course-glyph"
import Link from "next/link"

export default async function StudentDashboardPage() {
  const session = await verifySession()
  if (!session || session.role !== "student") redirect("/login")

  const now = new Date()
  const enrollments = getStudentEnrollments(session.id).filter(e => e.status === "ACTIVE")
  const myAssignments = getStudentAssignments(session.id)

  const upcoming = myAssignments.filter(a => {
    if (!a.due_date) return false
    const due = new Date(a.due_date)
    const sub = getSubmission(a.id, session.id)
    return due > now && !sub
  }).sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())

  const overdue = myAssignments.filter(a => {
    if (!a.due_date) return false
    const due = new Date(a.due_date)
    const sub = getSubmission(a.id, session.id)
    return due < now && !sub
  })

  const mySubmissions = submissions.filter(s => s.student_id === session.id)
  const myGrades = mySubmissions
    .map(s => grades.find(g => g.submission_id === s.id))
    .filter(Boolean) as (typeof grades)[0][]

  const avgGrade =
    myGrades.length > 0
      ? (myGrades.reduce((sum, g) => sum + g.score, 0) / myGrades.length).toFixed(1)
      : "—"

  const firstEnrollment = enrollments[0]
  const continueCourse = firstEnrollment ? getCourse(firstEnrollment.course_id) : null
  const continueTeacher = continueCourse ? getUser(continueCourse.teacher_id) : null

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
        <StatCard label="Avg grade" value={avgGrade} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Continue learning */}
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
                  transition: "background .15s",
                }}
              >
                <CourseGlyph course={continueCourse} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
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

        {/* Coming up */}
        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Coming up</h3>
          {upcoming.length === 0 ? (
            <p style={{ fontSize: 14, color: "var(--color-fg-muted)", margin: 0 }}>
              No upcoming assignments. You&apos;re all caught up!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {upcoming.slice(0, 4).map(a => {
                const course = getCourse(a.course_id)
                const due = new Date(a.due_date!)
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
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {a.title}
                        </div>
                        {course && (
                          <div style={{ fontSize: 11, color: "var(--color-fg-muted)" }}>
                            {course.title}
                          </div>
                        )}
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
}
