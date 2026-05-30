"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, toast } from "@/components/ui/primitives"
import { formatDateTimeHcm } from "@/lib/datetime-format"
import { formatSubmissionTiming } from "@/lib/submission-timing"
import { resolveSubmissionFileUrl } from "@/lib/submission-files"
import type { Assignment, Submission, Grade, Course } from "@/lib/types"
import type { BackendSubmissionFileResponse } from "@/lib/api/types"

interface Props {
  assignment: Assignment
  course: Course
  submission?: Submission & { grade?: Grade; files?: BackendSubmissionFileResponse[] }
}

export function AssignmentDetailClient({ assignment, course, submission }: Props) {
  const router = useRouter()
  const [note, setNote] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)

  const isGraded = !!submission?.grade
  const isSubmitted = !!submission
  const isPastDue = assignment.due_date ? new Date(assignment.due_date) < new Date() : false
  const gradedScore = submission?.grade?.score
  const timingMessage = submission
    ? formatSubmissionTiming(submission.submitted_at, assignment.due_date)
    : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim() && files.length === 0) {
      toast("Add a note or attach at least one file", "error")
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("note", note.trim())
      for (const file of files) {
        formData.append("files", file)
      }

      const res = await fetch(`/api/assignments/${assignment.id}/submissions`, {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Submit failed")

      toast("Assignment submitted", "success")
      router.refresh()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Submit failed", "error")
    } finally {
      setSubmitting(false)
    }
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
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700 }}>{assignment.title}</h1>
          <div style={{ fontSize: 13, color: "var(--color-fg-muted)" }}>{course.title}</div>
        </div>

        {isGraded && gradedScore != null && (
          <Card
            style={{
              padding: "16px 20px",
              borderLeft: "4px solid #15803d",
              background: "#f0fdf4",
            }}
          >
            <div style={{ fontWeight: 700, color: "#15803d", marginBottom: 6 }}>
              Graded: {gradedScore}/{assignment.max_score}
            </div>
            {submission?.grade?.feedback && (
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
              {submission?.content ?? "No note provided."}
            </div>
            {submission?.files?.map(file => {
              const href = resolveSubmissionFileUrl(file)
              return href ? (
                <a
                  key={file.id}
                  href={href}
                  download={file.fileName}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 12,
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--color-border)",
                    fontSize: 13,
                    color: "var(--color-primary-600)",
                    textDecoration: "none",
                    background: "var(--color-surface-2)",
                  }}
                >
                  📎 {file.fileName}
                </a>
              ) : null
            })}
            {!submission?.files?.length && submission?.attachment_url && (
              <a
                href={submission.attachment_url}
                target="_blank"
                rel="noreferrer"
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
              Submit your work
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add a note or written answer…"
                rows={6}
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
              <div>
                <input
                  type="file"
                  multiple
                  onChange={e => setFiles(Array.from(e.target.files ?? []))}
                  style={{ fontSize: 13 }}
                />
                {files.length > 0 && (
                  <div style={{ fontSize: 12, color: "var(--color-fg-muted)", marginTop: 6 }}>
                    {files.length} file{files.length !== 1 ? "s" : ""} selected
                  </div>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  disabled={submitting || (!note.trim() && files.length === 0)}
                  style={{
                    padding: "8px 20px",
                    background: !submitting ? "var(--color-primary-600)" : "var(--color-border)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: submitting ? "wait" : "pointer",
                    opacity: submitting || (!note.trim() && files.length === 0) ? 0.6 : 1,
                  }}
                >
                  {submitting ? "Submitting…" : "Submit"}
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

          {isSubmitted && submission?.submitted_at && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-fg-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                Submitted At
              </div>
              <div style={{ fontSize: 13 }}>{formatDateTimeHcm(submission.submitted_at)}</div>
            </div>
          )}

          {timingMessage && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-fg-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                Submission Timing
              </div>
              <div style={{ fontSize: 13, color: submission?.is_late ? "#d97706" : "#15803d" }}>
                {timingMessage}
              </div>
            </div>
          )}

          {assignment.due_date && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-fg-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                Due Date
              </div>
              <div style={{ fontSize: 13, color: isPastDue && !isSubmitted ? "#dc2626" : "var(--color-fg)" }}>
                {formatDateTimeHcm(assignment.due_date)}
              </div>
            </div>
          )}

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-fg-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
              Max Score
            </div>
            <div style={{ fontSize: 13 }}>{assignment.max_score} points</div>
          </div>

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
