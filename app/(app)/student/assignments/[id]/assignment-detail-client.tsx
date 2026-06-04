"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, toast } from "@/components/ui/primitives"
import { formatSubmissionTiming } from "@/lib/submission-timing"
import { resolveSubmissionFileUrl } from "@/lib/submission-files"
import type { Assignment, Submission, Grade, Course } from "@/lib/types"
import type { BackendSubmissionFileResponse } from "@/lib/api/types"

interface Props {
  assignment: Assignment
  course: Course
  submission?: Submission & { grade?: Grade; files?: BackendSubmissionFileResponse[] }
}

interface ExistingEntry { kind: "existing"; id: number; name: string; size?: number }
interface NewEntry { kind: "new"; file: File }
type FileEntry = ExistingEntry | NewEntry

function entryName(e: FileEntry): string { return e.kind === "existing" ? e.name : e.file.name }
function entrySize(e: FileEntry): number | undefined { return e.kind === "existing" ? e.size : e.file.size }
function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1048576).toFixed(1)} MB`
}
function fileIcon(name: string, mime = ""): string {
  if (mime.startsWith("image/") || /\.(png|jpg|jpeg|gif|webp)$/i.test(name)) return "🖼️"
  if (mime === "application/pdf" || name.endsWith(".pdf")) return "📄"
  if (/\.(zip|rar|7z|tar|gz)$/i.test(name)) return "🗜️"
  return "📎"
}
function btnStyle(color: string): React.CSSProperties {
  return { fontSize: 12, fontWeight: 600, color, background: "none", border: `1px solid ${color}`, borderRadius: 6, padding: "4px 10px", cursor: "pointer" }
}

export function AssignmentDetailClient({ assignment, course, submission }: Props) {
  const router = useRouter()
  const [note, setNote] = useState("")
  const [fileList, setFileList] = useState<FileEntry[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [resubmitting, setResubmitting] = useState(false)
  const [withdrawConfirm, setWithdrawConfirm] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isGraded = !!submission?.grade
  const isSubmitted = !!submission
  const isPastDue = assignment.due_date ? new Date(assignment.due_date) < new Date() : false
  const canResubmit = isSubmitted && !isGraded && !isPastDue
  const gradedScore = submission?.grade?.score
  const timingMessage = submission ? formatSubmissionTiming(submission.submitted_at, assignment.due_date) : null

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return
    const arr = Array.from(incoming)
    setFileList(prev => {
      const names = new Set(prev.map(entryName))
      const toAdd: NewEntry[] = arr.filter(f => !names.has(f.name)).map(f => ({ kind: "new", file: f }))
      return [...prev, ...toAdd]
    })
  }, [])

  const removeEntry = (idx: number) => {
    setFileList(prev => prev.filter((_, i) => i !== idx))
  }

  const openResubmit = () => {
    setNote(submission?.content ?? "")
    setFileList(
      (submission?.files ?? []).map(f => ({
        kind: "existing" as const,
        id: f.id,
        name: f.fileName,
        size: f.fileSize ?? undefined,
      })),
    )
    setResubmitting(true)
  }

  const handleWithdraw = async () => {
    if (!submission) return
    setWithdrawing(true)
    try {
      const res = await fetch(`/api/submissions/${submission.id}/withdraw`, { method: "DELETE" })
      if (!res.ok) {
        const d = await res.json() as { error?: string }
        throw new Error(d.error ?? "Withdraw failed")
      }
      toast("Submission withdrawn", "success")
      setWithdrawConfirm(false)
      router.refresh()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Withdraw failed", "error")
    } finally {
      setWithdrawing(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newFiles = (fileList.filter(x => x.kind === "new") as NewEntry[]).map(x => x.file)
    const keptIds = (fileList.filter(x => x.kind === "existing") as ExistingEntry[]).map(x => x.id)
    if (!note.trim() && newFiles.length === 0 && keptIds.length === 0) {
      toast("Add a note or attach at least one file", "error")
      return
    }
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append("note", note.trim())
      for (const f of newFiles) fd.append("files", f)
      if (keptIds.length > 0) fd.append("keepFileIds", keptIds.join(","))

      const res = await fetch(`/api/assignments/${assignment.id}/submissions`, { method: "POST", body: fd })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? "Submit failed")

      toast(resubmitting ? "Submission updated" : "Assignment submitted", "success")
      setResubmitting(false)
      setFileList([])
      setNote("")
      router.refresh()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Submit failed", "error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
      {/* ── Main column ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700 }}>{assignment.title}</h1>
          <div style={{ fontSize: 13, color: "var(--color-fg-muted)" }}>{course.title}</div>
        </div>

        {/* Grade banner */}
        {isGraded && gradedScore != null && (
          <Card style={{ padding: "16px 20px", borderLeft: "4px solid #15803d", background: "#f0fdf4" }}>
            <div style={{ fontWeight: 700, color: "#15803d", marginBottom: 6 }}>
              Graded: {gradedScore}/{assignment.max_score}
            </div>
            {submission?.grade?.feedback && (
              <div style={{ fontSize: 13, color: "var(--color-fg)", whiteSpace: "pre-wrap" }}>{submission.grade.feedback}</div>
            )}
          </Card>
        )}

        {/* ── Submitted view ── */}
        {isSubmitted && !resubmitting && (
          <Card style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Your submission
              </div>
              {canResubmit && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={openResubmit} style={btnStyle("#7c3aed")}>✏️ Edit</button>
                  <button type="button" onClick={() => setWithdrawConfirm(true)} style={btnStyle("#dc2626")}>🗑️ Withdraw</button>
                </div>
              )}
            </div>

            {/* Withdraw confirm inline */}
            {withdrawConfirm && (
              <div style={{ marginBottom: 14, padding: "12px 14px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#dc2626", marginBottom: 6 }}>
                  Withdraw this submission?
                </div>
                <div style={{ fontSize: 12, color: "#991b1b", marginBottom: 10 }}>
                  Your submission and all attached files will be permanently deleted.
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={handleWithdraw} disabled={withdrawing}
                    style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#dc2626", color: "#fff", fontSize: 12, fontWeight: 600, cursor: withdrawing ? "wait" : "pointer" }}>
                    {withdrawing ? "Withdrawing…" : "Yes, withdraw"}
                  </button>
                  <button type="button" onClick={() => setWithdrawConfirm(false)}
                    style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid var(--color-border)", background: "transparent", fontSize: 12, cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap", color: "var(--color-fg)" }}>
              {submission?.content ?? "No note provided."}
            </div>
            {submission?.files?.map(file => {
              const href = resolveSubmissionFileUrl(file)
              return href ? (
                <a key={file.id} href={href} download={file.fileName} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, padding: "10px 12px", borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 13, color: "var(--color-primary-600)", textDecoration: "none", background: "var(--color-surface-2)" }}>
                  📎 {file.fileName}
                </a>
              ) : null
            })}
            {timingMessage && <div style={{ fontSize: 12, color: "var(--color-fg-muted)", marginTop: 12 }}>{timingMessage}</div>}
          </Card>
        )}

        {/* ── Submit / edit form ── */}
        {(!isSubmitted || resubmitting) && (
          <Card style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {resubmitting ? "Edit your submission" : "Submit your work"}
              </div>
              {resubmitting && (
                <button type="button" onClick={() => { setResubmitting(false); setFileList([]); setNote("") }}
                  style={{ fontSize: 12, color: "var(--color-fg-muted)", background: "none", border: "none", cursor: "pointer" }}>
                  ← Back
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder="Add a note or written answer…" rows={6}
                style={{ width: "100%", padding: "10px 12px", fontSize: 14, lineHeight: 1.6, border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", background: "var(--color-surface)", color: "var(--color-fg)", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box", outline: "none" }} />

              {/* Hidden file input */}
              <input ref={fileInputRef} type="file" multiple style={{ display: "none" }}
                onChange={e => { addFiles(e.target.files); e.target.value = "" }} />

              {/* Unified file list */}
              {fileList.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {fileList.map((entry, idx) => {
                    const name = entryName(entry)
                    const size = entrySize(entry)
                    const mime = entry.kind === "new" ? entry.file.type : ""
                    return (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-surface)", fontSize: 13 }}>
                        <span style={{ fontSize: 18 }}>{fileIcon(name, mime)}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {name}
                            {entry.kind === "existing" && (
                              <span style={{ marginLeft: 6, fontSize: 11, color: "var(--color-primary-600)", fontWeight: 400 }}>previously submitted</span>
                            )}
                          </div>
                          {size != null && <div style={{ fontSize: 11, color: "var(--color-fg-muted)" }}>{formatBytes(size)}</div>}
                        </div>
                        <button type="button" onClick={() => removeEntry(idx)} aria-label="Remove"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-fg-muted)", fontSize: 18, lineHeight: 1, padding: "2px 4px", flexShrink: 0 }}>×</button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
                style={{ border: `2px dashed ${dragOver ? "var(--color-primary-600)" : "var(--color-border)"}`, borderRadius: "var(--radius-md)", padding: fileList.length > 0 ? "12px 16px" : "24px 16px", textAlign: "center", cursor: "pointer", background: dragOver ? "var(--color-primary-50,#f0fdf4)" : "var(--color-surface-2,#f8f9fa)", transition: "border-color .15s,background .15s", userSelect: "none" }}>
                {fileList.length === 0 && <div style={{ fontSize: 28, marginBottom: 8 }}>📁</div>}
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-fg-muted)" }}>
                  {fileList.length > 0 ? "+ Add more files" : "Click to browse or drag files here"}
                </div>
                {fileList.length === 0 && (
                  <div style={{ fontSize: 12, color: "var(--color-fg-muted)", marginTop: 4 }}>
                    {assignment.allowed_file_types ? `Accepted: ${assignment.allowed_file_types}` : "Any file type accepted"}
                    {assignment.max_files ? ` · max ${assignment.max_files} file${assignment.max_files !== 1 ? "s" : ""}` : ""}
                    {assignment.max_file_size_mb ? ` · max ${assignment.max_file_size_mb} MB each` : ""}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" disabled={submitting || (!note.trim() && fileList.length === 0)}
                  style={{ padding: "8px 20px", background: "var(--color-primary-600)", color: "#fff", border: "none", borderRadius: "var(--radius-md)", fontSize: 13, fontWeight: 600, cursor: submitting ? "wait" : "pointer", opacity: submitting || (!note.trim() && fileList.length === 0) ? 0.6 : 1 }}>
                  {submitting ? "Submitting…" : resubmitting ? "Update submission" : "Submit"}
                </button>
              </div>

              {isPastDue && !assignment.allow_late_submission && (
                <div style={{ fontSize: 12, color: "#dc2626" }}>This assignment is past due. Late submissions are not accepted.</div>
              )}
              {isPastDue && assignment.allow_late_submission && (
                <div style={{ fontSize: 12, color: "#d97706" }}>This assignment is past due. Your submission will be marked as late.</div>
              )}
            </form>
          </Card>
        )}
      </div>

      {/* ── Sidebar ── */}
      <Card style={{ padding: "20px 20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-fg-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Status</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: isGraded ? "#15803d" : isSubmitted ? "#7c3aed" : isPastDue ? "#dc2626" : "var(--color-primary-600)" }}>
              {isGraded ? "Graded" : isSubmitted ? "Submitted" : isPastDue ? "Overdue" : "Open"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-fg-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Max Score</div>
            <div style={{ fontSize: 13 }}>{assignment.max_score} points</div>
          </div>
          {assignment.due_date && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-fg-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Due Date</div>
              <div style={{ fontSize: 13, color: isPastDue ? "#dc2626" : "var(--color-fg)" }}>
                {new Date(assignment.due_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
              </div>
            </div>
          )}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-fg-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Course</div>
            <div style={{ fontSize: 13 }}>{course.title}</div>
          </div>
          {assignment.description && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-fg-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Instructions</div>
              <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--color-fg)", whiteSpace: "pre-wrap" }}>{assignment.description}</div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
