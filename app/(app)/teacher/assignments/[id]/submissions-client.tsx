"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PageHeader, Card, Badge, Avatar, toast } from "@/components/ui/primitives"
import { ButtonSmall } from "@/components/ui/button-small"
import { parseScoreInput, isScoreInRange } from "@/lib/datetime-picker"
import { formatDateTimeHcm } from "@/lib/datetime-format"
import { formatSubmissionTiming } from "@/lib/submission-timing"
import { resolveSubmissionFileUrl } from "@/lib/submission-files"
import type { Assignment, Submission } from "@/lib/types"
import type { BackendSubmissionFileResponse } from "@/lib/api/types"

type SubmissionRow = Omit<Submission, "grade"> & {
  grade?: { id: number; score: number; feedback?: string; graded_at: string }
  files?: BackendSubmissionFileResponse[]
  assignmentDueDate?: string
}

interface Props {
  assignment: Assignment
  courseName: string
  submissions: SubmissionRow[]
}

function GradePanel({
  submission,
  maxScore,
  dueDate,
  onGraded,
}: {
  submission: SubmissionRow
  maxScore: number
  dueDate?: string
  onGraded: (sub: SubmissionRow, grade: { id: number; score: number; feedback?: string; graded_at?: string }) => void
}) {
  const [score, setScore] = useState(submission.grade?.score?.toString() ?? "")
  const [feedback, setFeedback] = useState(submission.grade?.feedback ?? "")
  const [saving, setSaving] = useState(false)

  const parsedScore = parseScoreInput(score)
  const scoreValid = parsedScore != null && isScoreInRange(parsedScore, 0, maxScore)
  const effectiveDueDate = dueDate ?? submission.assignmentDueDate
  const timingMessage = formatSubmissionTiming(submission.submitted_at, effectiveDueDate)

  const submit = async () => {
    if (!scoreValid || parsedScore == null) return
    setSaving(true)
    try {
      const body = { score: parsedScore, feedback: feedback.trim() || undefined }
      const isUpdate = submission.grade && submission.grade.id > 0

      const res = await fetch(
        isUpdate
          ? `/api/grades/${submission.grade!.id}`
          : `/api/submissions/${submission.id}/grade`,
        {
          method: isUpdate ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to save grade")

      onGraded(submission, {
        id: data.grade.id,
        score: data.grade.score,
        feedback: data.grade.feedback,
        graded_at: data.grade.graded_at ?? data.grade.gradedAt,
      })
      toast(isUpdate ? "Grade updated" : "Grade saved", "success")
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save grade", "error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <Avatar name={submission.student?.full_name ?? "?"} size="md" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{submission.student?.full_name}</div>
            <div style={{ fontSize: 12, color: "var(--color-fg-muted)", lineHeight: 1.5 }}>
              <div><strong>Submitted At:</strong> {formatDateTimeHcm(submission.submitted_at)}</div>
              {effectiveDueDate && (
                <div><strong>Due Date:</strong> {formatDateTimeHcm(effectiveDueDate)}</div>
              )}
              {timingMessage && <div style={{ marginTop: 4 }}>{timingMessage}</div>}
            </div>
          </div>
          {submission.is_late && <Badge tone="yellow">Late</Badge>}
        </div>

        <div style={{ padding: 12, borderRadius: 10, background: "var(--color-surface-2)", fontSize: 13, color: "var(--color-fg)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
          {submission.content ?? "No note provided."}
        </div>

        {submission.files?.map(file => {
          const href = resolveSubmissionFileUrl(file)
          return href ? (
            <a
              key={file.id}
              href={href}
              download={file.fileName}
              style={{ display: "block", marginTop: 10, fontSize: 13, color: "var(--color-primary-600)" }}
            >
              {file.fileName}
            </a>
          ) : null
        })}
      </Card>

      <Card>
        <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600 }}>Grade</h3>
        <div style={{ fontSize: 13, color: "var(--color-fg-muted)", marginBottom: 12 }}>
          Max Score: <strong style={{ color: "var(--color-fg)" }}>{maxScore}</strong>
          {submission.grade && (
            <> · Current Grade: <strong style={{ color: "var(--color-fg)" }}>{submission.grade.score} / {maxScore}</strong></>
          )}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 8 }}>Score</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="number"
              min={0}
              max={maxScore}
              step={0.1}
              value={score}
              onChange={e => setScore(e.target.value)}
              style={{
                width: 90,
                height: 44,
                padding: "0 12px",
                borderRadius: 12,
                border: `1px solid ${score && !scoreValid ? "#dc2626" : "var(--color-border)"}`,
                fontSize: 16,
                fontWeight: 600,
                textAlign: "center",
                outline: "none",
              }}
            />
            <span style={{ color: "var(--color-fg-muted)", fontWeight: 600 }}>/ {maxScore}</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--color-fg-muted)", marginTop: 6 }}>
            Allowed range: 0 – {maxScore}
          </div>
          {score && !scoreValid && (
            <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>
              Enter a score between 0 and {maxScore}
            </div>
          )}
        </div>
        <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 8 }}>Feedback</label>
        <textarea
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          rows={5}
          placeholder="What did the student do well? What could be stronger?"
          style={{ width: "100%", borderRadius: 12, border: "1px solid var(--color-border)", padding: 12, fontSize: 14, resize: "vertical", outline: "none", boxSizing: "border-box" }}
        />
        <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
          <ButtonSmall onClick={submit} disabled={saving || !scoreValid}>
            {saving ? "Saving…" : submission.grade ? "Update grade" : "Save grade"}
          </ButtonSmall>
        </div>
      </Card>
    </div>
  )
}

export function SubmissionsClient({ assignment, courseName, submissions: initialSubs }: Props) {
  const router = useRouter()
  const [subs, setSubs] = useState(initialSubs)
  const [selectedId, setSelectedId] = useState(initialSubs[0]?.id ?? null)

  const selected = subs.find(s => s.id === selectedId) ?? null

  const handleGraded = (
    sub: SubmissionRow,
    grade: { id: number; score: number; feedback?: string; graded_at?: string },
  ) => {
    setSubs(prev =>
      prev.map(s =>
        s.id === sub.id
          ? {
              ...s,
              grade: {
                id: grade.id,
                score: grade.score,
                feedback: grade.feedback,
                graded_at: grade.graded_at ?? new Date().toISOString(),
              },
            }
          : s,
      ),
    )
    router.refresh()
  }

  return (
    <>
      <PageHeader
        title={assignment.title}
        subtitle={
          assignment.due_date
            ? `${courseName} · Due ${formatDateTimeHcm(assignment.due_date)}`
            : courseName
        }
        actions={
          <Link href="/teacher/assignments" style={{ textDecoration: "none" }}>
            <ButtonSmall variant="ghost">← {courseName}</ButtonSmall>
          </Link>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16, alignItems: "start" }}>
        <Card style={{ padding: 0 }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)", fontWeight: 600, fontSize: 14 }}>
            Submissions ({subs.length})
          </div>
          {subs.length === 0 ? (
            <div style={{ padding: 24, fontSize: 13, color: "var(--color-fg-muted)" }}>No submissions yet.</div>
          ) : (
            subs.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedId(s.id)}
                style={{
                  width: "100%", textAlign: "left",
                  padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
                  border: "none", borderTop: "1px solid var(--color-border)",
                  background: s.id === selectedId ? "var(--color-primary-50)" : "transparent",
                  cursor: "pointer",
                }}
              >
                <Avatar name={s.student?.full_name ?? "?"} size="sm" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{s.student?.full_name}</div>
                  <div style={{ fontSize: 11, color: "var(--color-fg-muted)" }}>
                    {formatDateTimeHcm(s.submitted_at)}
                  </div>
                </div>
                {s.grade
                  ? <Badge tone="green">{s.grade.score}</Badge>
                  : s.is_late
                    ? <Badge tone="yellow">Late</Badge>
                    : <Badge tone="default">Open</Badge>}
              </button>
            ))
          )}
        </Card>

        {selected && (
          <GradePanel
            submission={selected}
            maxScore={assignment.max_score}
            dueDate={assignment.due_date}
            onGraded={handleGraded}
          />
        )}
      </div>
    </>
  )
}
