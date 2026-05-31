"use client"

import Link from "next/link"
import type { Course, SectionItem, Enrollment } from "@/lib/types"
import type { SectionWithItems } from "@/lib/api/sections"
import {
  formatFileSize,
  formatUploadDate,
  resolveMediaUrl,
} from "@/lib/api/lesson-mappers"
import { Card, PageHeader, StatusBadge, Badge, Avatar } from "@/components/ui/primitives"
import { CourseGlyph } from "@/components/ui/course-glyph"
import { VideoPlayer } from "@/components/lesson/video-player"
import { MarkdownContent } from "@/components/lesson/markdown-content"
import { DocumentViewer } from "@/components/lesson/document-viewer"
import { date_ } from "@/lib/fmt"

interface AssignmentSummary {
  id: number
  title: string
  due_date?: string
  max_score: number
}

interface Props {
  course: Course
  sections: SectionWithItems[]
  enrolledCount: number
  enrollments: Enrollment[]
  assignmentCount: number
  assignments: AssignmentSummary[]
}

const TYPE_LABEL: Record<SectionItem["type"], string> = {
  video: "Video",
  file: "Document",
  text: "Text",
  assignment: "Assignment",
}

function LessonPreview({ item }: { item: SectionItem }) {
  if (item.type === "video") {
    return (
      <div style={{ marginTop: 10 }}>
        <VideoPlayer url={resolveMediaUrl(item.url)} title={item.title} />
        {item.video_file_name && (
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--color-fg-muted)" }}>
            File: {item.video_file_name} · {formatFileSize(item.video_file_size)}
          </p>
        )}
        {!item.video_file_name && item.url && !item.url.startsWith("LOCAL::") && !item.url.startsWith("CLOUDINARY::") && (
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--color-fg-muted)", wordBreak: "break-all" }}>
            URL: {item.url}
          </p>
        )}
      </div>
    )
  }

  if (item.type === "file") {
    return (
      <DocumentViewer
        title={item.title}
        documentUrl={item.document_url}
        documentName={item.document_name}
        documentSize={item.document_size}
        documentMimeType={item.document_mime_type}
        documentUploadedAt={item.document_uploaded_at}
      />
    )
  }

  return (
    <div style={{ marginTop: 10 }}>
      <MarkdownContent content={item.content} />
    </div>
  )
}

export function AdminCourseDetailClient({
  course,
  sections,
  enrolledCount,
  enrollments,
  assignmentCount,
  assignments,
}: Props) {
  const lessonCount = sections.reduce((sum, s) => sum + (s.items?.length ?? 0), 0)

  return (
    <>
      <div style={{ marginBottom: 16, fontSize: 13, color: "var(--color-fg-muted)" }}>
        <Link href="/admin/courses" style={{ color: "var(--color-primary-600)", textDecoration: "none" }}>
          Course moderation
        </Link>
        {" / "}
        {course.title}
      </div>

      <PageHeader
        title={course.title}
        subtitle="Read-only moderation view"
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
        <Card>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <CourseGlyph course={course} size={56} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{course.title}</div>
              <StatusBadge status={course.status.toLowerCase()} />
            </div>
          </div>
          {course.description && (
            <p style={{ margin: "14px 0 0", fontSize: 14, color: "var(--color-fg-muted)", lineHeight: 1.6 }}>
              {course.description}
            </p>
          )}
          <div style={{ marginTop: 14, fontSize: 13, color: "var(--color-fg-muted)" }}>
            Max students: {course.max_students} · Created: {date_(course.created_at)}
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-fg-muted)", marginBottom: 8 }}>
            Teacher
          </div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{course.teacher?.full_name ?? "Unknown"}</div>
          <div style={{ fontSize: 13, color: "var(--color-fg-muted)", marginTop: 4 }}>
            {course.teacher?.email ?? "—"}
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-fg-muted)", marginBottom: 8 }}>
            Enrollment
          </div>
          <div style={{ fontWeight: 700, fontSize: 28 }}>{enrolledCount}</div>
          <div style={{ fontSize: 13, color: "var(--color-fg-muted)" }}>active students</div>
        </Card>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Curriculum overview</div>
        <div style={{ display: "flex", gap: 16, fontSize: 14, color: "var(--color-fg-muted)" }}>
          <span>{sections.length} sections</span>
          <span>{lessonCount} lessons</span>
          <span>{assignmentCount} assignments</span>
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Sections & lessons</h2>
        {sections.length === 0 ? (
          <Card><p style={{ margin: 0, color: "var(--color-fg-muted)" }}>No curriculum content yet.</p></Card>
        ) : (
          sections.map(section => (
            <Card key={section.id} style={{ padding: 0 }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--color-border)", fontWeight: 600 }}>
                {section.title}
                <span style={{ marginLeft: 8, fontSize: 12, color: "var(--color-fg-muted)", fontWeight: 400 }}>
                  {section.items?.length ?? 0} items
                </span>
              </div>
              {(section.items ?? []).map(item => (
                <div key={item.id} style={{ padding: "16px 18px", borderTop: "1px solid var(--color-border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{item.title}</span>
                    <Badge tone="blue">{TYPE_LABEL[item.type]}</Badge>
                    {!item.is_visible && <Badge tone="default">Hidden</Badge>}
                  </div>
                  <LessonPreview item={item} />
                </div>
              ))}
            </Card>
          ))
        )}
      </div>

      <Card>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
          Assignments summary ({assignmentCount})
        </div>
        {assignments.length === 0 ? (
          <p style={{ margin: 0, color: "var(--color-fg-muted)", fontSize: 14 }}>No assignments for this course.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {assignments.map(a => (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "10px 0",
                  borderTop: "1px solid var(--color-border)",
                  fontSize: 14,
                }}
              >
                <span style={{ fontWeight: 500 }}>{a.title}</span>
                <span style={{ color: "var(--color-fg-muted)", whiteSpace: "nowrap" }}>
                  {a.due_date ? date_(a.due_date) : "No due date"} · Max {a.max_score} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
          Enrolled students ({enrolledCount})
        </div>
        {enrollments.length === 0 ? (
          <p style={{ margin: 0, color: "var(--color-fg-muted)", fontSize: 14 }}>
            No students enrolled in this course yet.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--color-surface-2)", fontSize: 12, color: "var(--color-fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  <th style={{ textAlign: "left", padding: "12px 16px" }}>Student</th>
                  <th style={{ textAlign: "left", padding: "12px 16px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map(e => {
                  const student = e.student
                  if (!student) return null
                  return (
                    <tr key={e.id} style={{ borderTop: "1px solid var(--color-border)" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar name={student.full_name} size="sm" />
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 500 }}>{student.full_name}</div>
                            <div style={{ fontSize: 12, color: "var(--color-fg-muted)" }}>{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Badge tone={e.status === "ACTIVE" ? "green" : e.status === "COMPLETED" ? "blue" : "default"}>
                          {e.status}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
