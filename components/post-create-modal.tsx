"use client"

import { useState, useEffect } from "react"
import type { Post } from "@/lib/types"
import { Modal } from "@/components/ui/primitives"
import { ButtonSmall } from "@/components/ui/button-small"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/primitives"

interface PostCreateModalProps {
  open: boolean
  onClose: () => void
  courseId: number
  authorId: number
  onCreated: () => void
  post?: Post | null
}

export function PostCreateModal({ open, onClose, courseId, authorId, onCreated, post = null }: PostCreateModalProps) {
  const isEdit = !!post
  const [form, setForm] = useState({ title: "", content: "", is_pinned: false })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(isEdit && post
        ? { title: post.title, content: post.content, is_pinned: post.is_pinned }
        : { title: "", content: "", is_pinned: false }
      )
    }
  }, [open, post?.id])

  const submit = async () => {
    if (saving || !form.title.trim() || !form.content.trim()) return
    setSaving(true)
    try {
      let res: Response
      if (isEdit && post) {
        res = await fetch(`/api/posts/${post.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: form.title, content: form.content, isPinned: form.is_pinned }),
        })
      } else {
        res = await fetch(`/api/courses/${courseId}/posts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: form.title, content: form.content, isPinned: form.is_pinned }),
        })
      }
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? "Failed")
      }
      toast(isEdit ? "Post updated" : "Post published", "success")
      onCreated()
      onClose()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save post", "error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit post" : "New discussion post"} width={560}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Input
          label="Title"
          value={form.title}
          onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Post title…"
        />

        <div>
          <label style={{
            fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6,
            color: "var(--color-fg-muted)",
          }}>
            Content
          </label>
          <textarea
            value={form.content}
            onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Write your message…"
            rows={5}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-fg)",
              fontSize: 14,
              lineHeight: 1.5,
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={form.is_pinned}
            onChange={e => setForm(prev => ({ ...prev, is_pinned: e.target.checked }))}
          />
          Pin this post
        </label>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4 }}>
          <ButtonSmall variant="ghost" onClick={onClose}>Cancel</ButtonSmall>
          <ButtonSmall
            onClick={submit}
            loading={saving}
            style={{ opacity: (!form.title.trim() || !form.content.trim()) ? 0.5 : 1 }}
          >
            {isEdit ? "Save changes" : "Publish"}
          </ButtonSmall>
        </div>
      </div>
    </Modal>
  )
}
