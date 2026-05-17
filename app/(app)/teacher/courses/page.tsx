import Link from "next/link"
import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { getUserCourses, enrollments } from "@/lib/mock-data"
import { PageHeader, StatusBadge } from "@/components/ui/primitives"
import { CourseGlyph } from "@/components/ui/course-glyph"
import { CourseCreateTrigger } from "./course-create-trigger"

export default async function TeacherCoursesPage() {
  const session = await verifySession()
  if (!session || session.role !== "teacher") redirect("/login")

  const myCourses = getUserCourses(session.id)
  const coursesWithMeta = myCourses.map(c => ({
    ...c,
    enrolledCount: enrollments.filter(e => e.course_id === c.id && e.status === "ACTIVE").length,
  }))

  return (
    <>
      <PageHeader
        title="My Courses"
        subtitle="Manage and publish your courses."
        actions={<CourseCreateTrigger teacherId={session.id} />}
      />

      {coursesWithMeta.length === 0 ? (
        <p style={{ fontSize: 14, color: "var(--color-fg-muted)" }}>No courses yet. Create your first one.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {coursesWithMeta.map(c => (
            <Link
              key={c.id}
              href={`/teacher/courses/${c.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-card)",
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                transition: "box-shadow .15s",
                cursor: "pointer",
              }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.10)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "var(--shadow-card)")}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <CourseGlyph course={c} size={64} />
                  <StatusBadge status={c.status} />
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
}
