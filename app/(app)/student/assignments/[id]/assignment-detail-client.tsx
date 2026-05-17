"use client"

import { useState } from "react"
import { Card } from "@/components/ui/primitives"
import type { Assignment, Submission, Grade, Course } from "@/lib/types"

interface Props {
  assignment: Assignment
  course: Course
  submission?: Submission & { grade?: Grade }
}

export function AssignmentDetailClient({ assignment, course, submission }: Props) {
  const [text, setText] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const isGraded = !!submission?.grade
  const isSubmitted = !!submission || submitted
  const isPastDue = assignment.due_date ? new Date(assignment.due_date) < new Date() : false

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitted(true)
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        gap: 24,
        alignItems: "start",
      }}
    >
      {/* Main area */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700 }}>{assignment.title}</h1>
          <div style={{ fontSize: 13, color: "var(--color-fg-muted)" }}>{course.title}</div>
        </div>

        {isGraded && submission?.grade && (
          <Card
            style={{
              padding: "16px 20px",
              borderLeft: "4px solid #15803d",
              background: "#f0fdf4",
            }}
          >
            <div style={{ fontWeight: 700, color: "#15803d", marginBottom: 6 }}>
              Graded: {submission.grade.score}/{assignment.max_score}
            </div>
            {submission.grade.feedback && (
              <div style={{ fontSize: 13, color: "var(--color-fg)", whiteSpace: "pre-wrap" }}>
                {submission.grade.feedback}
              </div>
            )}
          </Card>
        )}

        {isSubmitted ? (
          <Card style={{ padding: "20px 24px" }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#7c3aed",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Your submission
            </div>
            <div
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                color: "var(--color-fg)",
              }}
            >
              {submission?.content ?? text}
            </div>
            {submission?.attachment_url && (
              <a
                href={submission.attachment_url}
                style={{ display: "block", marginTop: 12, fontSize: 13, color: "var(--color-primary-600)" }}
              >
                View attachment
              </a>
            )}
          </Card>
        ) : (
          <Card style={{ padding: "20px 24px" }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--color-fg-muted)",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Your answer
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Write your answer here…"
                rows={8}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: 14,
                  lineHeight: 1.6,
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-surface)",
                  color: "var(--color-fg)",
                  resize: "vertical",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  disabled={!text.trim()}
                  style={{
                    padding: "8px 20px",
                    background: text.trim() ? "var(--color-primary-600)" : "var(--color-border)",
                    color: text.trim() ? "#fff" : "var(--color-fg-muted)",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: text.trim() ? "pointer" : "not-allowed",
                  }}
                >
                  Submit
                </button>
              </div>
              {isPastDue && !assignment.allow_late_submission && (
                <div style={{ fontSize: 12, color: "#dc2626" }}>
                  This assignment is past due. Late submissions are not accepted.
                </div>
              )}
              {isPastDue && assignment.allow_late_submission && (
                <div style={{ fontSize: 12, color: "#d97706" }}>
                  This assignment is past due. Your submission will be marked as late.
                </div>
              )}
            </form>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <Card style={{ padding: "20px 20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-fg-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
              Status
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: isGraded
                  ? "#15803d"
                  : isSubmitted
                  ? "#7c3aed"
                  : isPastDue
                  ? "#dc2626"
                  : "var(--color-primary-600)",
              }}
            >
              {isGraded ? "Graded" : isSubmitted ? "Submitted" : isPastDue ? "Overdue" : "Open"}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-fg-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
              Max Score
            </div>
            <div style={{ fontSize: 13 }}>{assignment.max_score} points</div>
          </div>

          {assignment.due_date && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-fg-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                Due Date
              </div>
              <div style={{ fontSize: 13, color: isPastDue ? "#dc2626" : "var(--color-fg)" }}>
                {new Date(assignment.due_date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          )}

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-fg-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
              Course
            </div>
            <div style={{ fontSize: 13 }}>{course.title}</div>
          </div>

          {assignment.description && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-fg-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                Instructions
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--color-fg)", whiteSpace: "pre-wrap" }}>
                {assignment.description}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
