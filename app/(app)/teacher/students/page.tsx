import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { getUserCourses, getCourseEnrollments, getUser } from "@/lib/mock-data"
import { PageHeader, Avatar } from "@/components/ui/primitives"

export default async function TeacherStudentsPage() {
  const session = await verifySession()
  if (!session || session.role !== "teacher") redirect("/login")

  const myCourses = getUserCourses(session.id)

  const rows = myCourses.flatMap(course =>
    getCourseEnrollments(course.id)
      .filter(e => e.status === "ACTIVE")
      .map(e => {
        const student = getUser(e.student_id)
        return { enrollmentId: e.id, student, courseName: course.title }
      })
      .filter(r => r.student != null)
  ) as { enrollmentId: number; student: NonNullable<ReturnType<typeof getUser>>; courseName: string }[]

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`${rows.length} active enrollment${rows.length !== 1 ? "s" : ""} across ${myCourses.length} course${myCourses.length !== 1 ? "s" : ""}`}
      />

      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                background: "var(--color-surface-2)",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <th
                style={{
                  textAlign: "left",
                  padding: "10px 16px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--color-fg-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Student
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "10px 16px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--color-fg-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Course
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  style={{
                    padding: "48px 16px",
                    textAlign: "center",
                    color: "var(--color-fg-muted)",
                    fontSize: 14,
                  }}
                >
                  No students enrolled yet.
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={row.enrollmentId}
                  style={{
                    borderBottom:
                      i < rows.length - 1 ? "1px solid var(--color-border)" : "none",
                  }}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={row.student.full_name} size="sm" />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-fg)" }}>
                          {row.student.full_name}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--color-fg-muted)" }}>
                          {row.student.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "var(--color-fg)" }}>
                    {row.courseName}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
