"use client"

import { useState } from "react"
import { Modal, toast } from "@/components/ui/primitives"
import { ButtonSmall } from "@/components/ui/button-small"

interface Props {
  open: boolean
  onClose: () => void
  onCreated?: () => void
}

export function CourseCreateModal({ open, onClose, onCreated }: Props) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [maxStudents, setMaxStudents] = useState(30)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          maxStudents,
          status: "DRAFT",
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to create course")
      toast("Course draft created", "success")
      setTitle("")
      setDescription("")
      setMaxStudents(30)
      onCreated?.()
      onClose()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to create course", "error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create new course" width={480}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Introduction to Python"
            style={{
              width: "100%", height: 38, padding: "0 12px", borderRadius: 8,
              border: "1px solid var(--color-border)", background: "var(--color-surface)",
              color: "var(--color-fg)", fontSize: 14, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What will students learn?"
            rows={3}
            style={{
              width: "100%", padding: "8px 12px", borderRadius: 8,
              border: "1px solid var(--color-border)", background: "var(--color-surface)",
              color: "var(--color-fg)", fontSize: 14, outline: "none", resize: "vertical",
              boxSizing: "border-box", fontFamily: "inherit",
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Max students</label>
          <input
            type="number"
            value={maxStudents}
            onChange={e => setMaxStudents(Number(e.target.value))}
            min={1}
            max={500}
            style={{
              width: 120, height: 38, padding: "0 12px", borderRadius: 8,
              border: "1px solid var(--color-border)", background: "var(--color-surface)",
              color: "var(--color-fg)", fontSize: 14, outline: "none",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
          <ButtonSmall variant="ghost" onClick={onClose}>Cancel</ButtonSmall>
          <ButtonSmall onClick={handleSubmit} disabled={!title.trim() || saving}>
            {saving ? "Creating…" : "Create draft"}
          </ButtonSmall>
        </div>
      </div>
    </Modal>
  )
}
