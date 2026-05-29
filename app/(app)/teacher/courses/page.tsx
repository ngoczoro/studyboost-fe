import Link from "next/link"
import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { listCourses } from "@/lib/api/courses"
import { countActiveEnrollments } from "@/lib/api/enrollments"
import { PageHeader, StatusBadge, EmptyState, Card } from "@/components/ui/primitives"
import { CourseGlyph } from "@/components/ui/course-glyph"
import { CourseCreateTrigger } from "./course-create-trigger"
import { ApiError } from "@/lib/api-client"

export default async function TeacherCoursesPage() {
  const session = await verifySession()
  if (!session || session.role !== "teacher") redirect("/login")

  try {
    const myCourses = await listCourses({ teacherId: session.id })
    const coursesWithMeta = await Promise.all(
      myCourses.map(async c => ({
        ...c,
        enrolledCount: await countActiveEnrollments(c.id),
      })),
    )

    return (
      <>
        <PageHeader
          title="My Courses"
          subtitle="Manage and publish your courses."
          actions={<CourseCreateTrigger />}
        />

        {coursesWithMeta.length === 0 ? (
          <EmptyState
            title="No courses yet"
            description="Create your first course to get started."
            action={<CourseCreateTrigger />}
          />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {coursesWithMeta.map(c => (
              <Link
                key={c.id}
                href={`/teacher/courses/${c.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="teacher-course-card" style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  cursor: "pointer",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <CourseGlyph course={c} size={64} />
                    <StatusBadge status={c.status.toLowerCase()} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: "var(--color-fg-muted)" }}>
                      {c.enrolledCount} / {c.max_students} students
                    </div>
                  </div>
                  {c.description && (
                    <p style={{
                      margin: 0, fontSize: 13, color: "var(--color-fg-muted)",
                      lineHeight: 1.5, display: "-webkit-box",
                      WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {c.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </>
    )
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Failed to load courses"
    return (
      <>
        <PageHeader title="My Courses" subtitle="Unable to load courses" />
        <Card>
          <EmptyState title="Could not load courses" description={message} />
        </Card>
      </>
    )
  }
}
