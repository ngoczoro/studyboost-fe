"use client"

import { useState } from "react"
import { Tabs, Card, EmptyState } from "@/components/ui/primitives"
import { PostCard } from "@/components/post-card"
import type { Course, Section, SectionItem, Assignment, Submission, Grade } from "@/lib/types"

interface PostMeta {
  id: number; course_id: number; author_id: number; title: string
  content: string; is_pinned: boolean; created_at: string; updated_at: string
  authorName: string; commentCount: number
}

interface AssignmentWithStatus extends Assignment {
  submission?: Submission & { grade?: Grade }
  status: "open" | "submitted" | "graded" | "overdue"
}

interface Props {
  course: Course
  sections: (Section & { items: SectionItem[] })[]
  assignments: AssignmentWithStatus[]
  posts: PostMeta[]
  studentId: number
}

function ItemViewer({ item }: { item: SectionItem | null }) {
  if (!item) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--color-fg-muted)", fontSize: 14 }}>
        Select an item from the sidebar to view it.
      </div>
    )
  }
  if (item.type === "video") {
    return (
      <div>
        <div style={{ aspectRatio: "16/9", background: "#0f172a", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>▶</div>
            <div style={{ fontSize: 14 }}>Video: {item.title}</div>
          </div>
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700 }}>{item.title}</h2>
      </div>
    )
  }
  if (item.type === "file") {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
        <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600 }}>{item.title}</h3>
        <a href={item.url ?? "#"} style={{ color: "var(--color-primary-600)", fontSize: 14, fontWeight: 500 }}>
          Download file
        </a>
      </div>
    )
  }
  return (
    <div>
      <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700 }}>{item.title}</h2>
      <div style={{ fontSize: 14, lineHeight: 1.7, color: "var(--color-fg)", whiteSpace: "pre-wrap" }}>
        {item.content ?? "No content available."}
      </div>
    </div>
  )
}

export function CourseDetailClient({ course, sections, assignments, posts, studentId }: Props) {
  const [tab, setTab] = useState("content")
  const [selectedItem, setSelectedItem] = useState<SectionItem | null>(
    sections[0]?.items?.[0] ?? null
  )
  const [postVersion, setPostVersion] = useState(0)

  const TABS = [
    { label: "Content", value: "content" },
    { label: `Assignments (${assignments.length})`, value: "assignments" },
    { label: "Discussion", value: "discussion" },
  ]

  return (
    <div>
      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === "content" && (
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 0, marginTop: 0, minHeight: 480 }}>
          {/* Sidebar */}
          <div
            style={{
              borderRight: "1px solid var(--color-border)",
              overflowY: "auto",
              padding: "16px 0",
            }}
          >
            {sections.length === 0 ? (
              <p style={{ padding: "0 16px", fontSize: 13, color: "var(--color-fg-muted)" }}>
                No content available yet.
              </p>
            ) : (
              sections.map(section => (
                <div key={section.id} style={{ marginBottom: 8 }}>
                  <div
                    style={{
                      padding: "6px 16px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--color-fg-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {section.title}
                  </div>
                  {section.items
                    .filter(i => i.is_visible)
                    .map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 16px",
                          background: selectedItem?.id === item.id ? "var(--color-primary-50)" : "transparent",
                          color: selectedItem?.id === item.id ? "var(--color-primary-700)" : "var(--color-fg)",
                          border: "none",
                          borderLeft: `3px solid ${selectedItem?.id === item.id ? "var(--color-primary-600)" : "transparent"}`,
                          fontSize: 13,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span style={{ fontSize: 12 }}>
                          {item.type === "video" ? "▶" : item.type === "file" ? "📄" : "📝"}
                        </span>
                        {item.title}
                      </button>
                    ))}
                </div>
              ))
            )}
          </div>

          {/* Content viewer */}
          <div style={{ padding: 24, overflowY: "auto" }}>
            <ItemViewer item={selectedItem} />
          </div>
        </div>
      )}

      {tab === "assignments" && (
        <div style={{ padding: "16px 0" }}>
          {assignments.length === 0 ? (
            <EmptyState title="No assignments" description="No assignments have been posted for this course yet." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {assignments.map(a => {
                const statusColor = {
                  open: "var(--color-primary-600)",
                  submitted: "#7c3aed",
                  graded: "#15803d",
                  overdue: "#dc2626",
                }[a.status]
                const statusLabel = {
                  open: "Open",
                  submitted: "Submitted",
                  graded: `Graded: ${a.submission?.grade?.score}/${a.max_score}`,
                  overdue: "Overdue",
                }[a.status]
                return (
                  <a
                    key={a.id}
                    href={`/student/assignments/${a.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <Card style={{ padding: "14px 16px", cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{a.title}</div>
                          {a.due_date && (
                            <div style={{ fontSize: 12, color: "var(--color-fg-muted)", marginTop: 2 }}>
                              Due {new Date(a.due_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: statusColor, flexShrink: 0 }}>
                          {statusLabel}
                        </span>
                      </div>
                    </Card>
                  </a>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab === "discussion" && (
        <div style={{ padding: "16px 0" }}>
          {posts.length === 0 ? (
            <EmptyState title="No discussion posts" description="No one has posted in this course yet." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {posts.map(post => (
                <PostCard
                  key={`${post.id}-${postVersion}`}
                  post={post}
                  currentUserId={studentId}
                  currentUserRole="student"
                  onChanged={() => setPostVersion(v => v + 1)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
