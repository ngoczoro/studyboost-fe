"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader, Card, EmptyState, Modal, toast } from "@/components/ui/primitives"
import { ButtonSmall } from "@/components/ui/button-small"
import { CourseGlyph } from "@/components/ui/course-glyph"
import Link from "next/link"
import type { Course } from "@/lib/types"

interface EnrolledEntry {
  enrollmentId: number
  course: Course
  teacherName: string
}

interface Props {
  enrolled: EnrolledEntry[]
  catalog: (Course & { teacherName: string })[]
}

export function StudentCoursesClient({ enrolled, catalog }: Props) {
  const router = useRouter()
  const [browseOpen, setBrowseOpen] = useState(false)
  const [enrollingId, setEnrollingId] = useState<number | null>(null)

  async function handleEnroll(courseId: number) {
    setEnrollingId(courseId)
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Enrollment failed")
      toast("Enrolled successfully", "success")
      setBrowseOpen(false)
      router.refresh()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Enrollment failed", "error")
    } finally {
      setEnrollingId(null)
    }
  }

  return (
    <>
      <PageHeader
        title="My Courses"
        subtitle={`${enrolled.length} course${enrolled.length !== 1 ? "s" : ""} enrolled`}
        actions={
          <ButtonSmall onClick={() => setBrowseOpen(true)}>Browse courses</ButtonSmall>
        }
      />

      {enrolled.length === 0 ? (
        <EmptyState
          title="No courses yet"
          description="Browse available courses and enroll to get started."
          action={<ButtonSmall onClick={() => setBrowseOpen(true)}>Browse courses</ButtonSmall>}
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {enrolled.map(({ enrollmentId, course, teacherName }) => (
            <Link
              key={enrollmentId}
              href={`/student/courses/${course.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Card
                style={{
                  cursor: "pointer",
                  transition: "box-shadow .15s, transform .15s",
                  height: "100%",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <CourseGlyph course={course} size={48} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginBottom: 2,
                      }}
                    >
                      {course.title}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--color-fg-muted)" }}>{teacherName}</div>
                    {course.description && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--color-fg-muted)",
                          marginTop: 8,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {course.description}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal open={browseOpen} onClose={() => setBrowseOpen(false)} title="Browse courses" width={580}>
        {catalog.length === 0 ? (
          <p style={{ fontSize: 14, color: "var(--color-fg-muted)", margin: 0 }}>
            No new courses available.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {catalog.map(course => (
              <div
                key={course.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 14,
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface-2)",
                }}
              >
                <CourseGlyph course={course} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{course.title}</div>
                  <div style={{ fontSize: 12, color: "var(--color-fg-muted)" }}>{course.teacherName}</div>
                  {course.description && (
                    <div style={{ fontSize: 12, color: "var(--color-fg-muted)", marginTop: 4 }}>
                      {course.description}
                    </div>
                  )}
                </div>
                <ButtonSmall
                  onClick={() => handleEnroll(course.id)}
                  disabled={enrollingId === course.id}
                >
                  {enrollingId === course.id ? "Enrolling…" : "Enroll"}
                </ButtonSmall>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  )
}
