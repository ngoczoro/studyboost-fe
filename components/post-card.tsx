"use client"

import { useState } from "react"
import type { Post } from "@/lib/types"
import { Avatar, Badge, toast } from "@/components/ui/primitives"
import { ButtonSmall } from "@/components/ui/button-small"
import { PinIcon, EditIcon, TrashIcon, CommentIcon } from "@/components/ui/icons"
import { relative } from "@/lib/fmt"
import { PostCreateModal } from "@/components/post-create-modal"

interface CommentData {
  id: number
  author_id: number
  author_name: string
  content: string
  created_at: string
  replies: CommentData[]
}

function parseComment(c: Record<string, unknown>): CommentData {
  return {
    id: c.id as number,
    author_id: (c.authorId ?? c.author_id) as number,
    author_name: (c.authorName ?? (c.author as Record<string, unknown>)?.full_name ?? "Unknown") as string,
    content: c.content as string,
    created_at: (c.createdAt ?? c.created_at ?? new Date().toISOString()) as string,
    replies: ((c.replies ?? []) as Record<string, unknown>[]).map(parseComment),
  }
}

interface CommentRowProps {
  comment: CommentData
  depth?: number
  currentUserId: number
  canModerate: boolean
  replyingTo: number | null
  onReply: (c: CommentData) => void
  onDeleted: (id: number) => void
  onUpdated: (id: number, content: string) => void
}

function CommentRow({ comment, depth = 0, currentUserId, canModerate, replyingTo, onReply, onDeleted, onUpdated }: CommentRowProps) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(comment.content)
  const [saving, setSaving] = useState(false)

  const isOwn = comment.author_id === currentUserId
  const canDelete = isOwn || canModerate

  const saveEdit = async () => {
    if (!editText.trim() || saving) return
    setSaving(true)
    try {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editText.trim() }),
      })
      if (!res.ok) throw new Error("Failed")
      onUpdated(comment.id, editText.trim())
      setEditing(false)
      toast("Comment updated", "success")
    } catch { toast("Failed to update comment", "error") }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/comments/${comment.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
      onDeleted(comment.id)
      toast("Comment deleted", "success")
    } catch { toast("Failed to delete comment", "error") }
  }

  const isBeingRepliedTo = replyingTo === comment.id

  return (
    <div style={{ marginLeft: depth > 0 ? Math.min(depth, 3) * 24 : 0, borderLeft: depth > 0 ? "2px solid var(--color-border)" : "none", paddingLeft: depth > 0 ? 12 : 0 }}>
      <div style={{ display: "flex", gap: 10, padding: "8px 0" }}>
        <Avatar name={comment.author_name} size="sm" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{comment.author_name}</span>
            {isOwn && <span style={{ fontSize: 11, color: "var(--color-primary-600)", fontWeight: 500 }}>you</span>}
            <span style={{ fontSize: 11, color: "var(--color-fg-muted)" }}>{relative(comment.created_at)}</span>
          </div>

          {editing ? (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                value={editText}
                onChange={e => setEditText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditing(false) }}
                autoFocus
                style={{ flex: 1, height: 34, padding: "0 10px", borderRadius: 7, border: "1px solid var(--color-primary-600)", background: "var(--color-surface)", color: "var(--color-fg)", fontSize: 13, outline: "none" }}
              />
              <ButtonSmall onClick={saveEdit} disabled={saving} style={{ height: 34, padding: "0 12px", fontSize: 12 }}>
                {saving ? "…" : "Save"}
              </ButtonSmall>
              <button onClick={() => { setEditing(false); setEditText(comment.content) }} style={{ height: 34, padding: "0 10px", background: "none", border: "1px solid var(--color-border)", borderRadius: 7, fontSize: 12, cursor: "pointer", color: "var(--color-fg-muted)" }}>
                Cancel
              </button>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{comment.content}</p>
          )}

          {!editing && (
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                onClick={() => onReply(comment)}
                style={{ background: "none", border: "none", padding: 0, fontSize: 12, color: isBeingRepliedTo ? "var(--color-primary-700)" : "var(--color-primary-600)", cursor: "pointer", fontWeight: 500 }}
              >
                {isBeingRepliedTo ? "Replying…" : "Reply"}
              </button>
              {isOwn && (
                <button onClick={() => { setEditText(comment.content); setEditing(true) }} style={{ background: "none", border: "none", padding: 0, fontSize: 12, color: "var(--color-fg-muted)", cursor: "pointer" }}>
                  Edit
                </button>
              )}
              {canDelete && (
                <button onClick={handleDelete} style={{ background: "none", border: "none", padding: 0, fontSize: 12, color: "#dc2626", cursor: "pointer" }}>
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {comment.replies.map(reply => (
        <CommentRow
          key={reply.id}
          comment={reply}
          depth={depth + 1}
          currentUserId={currentUserId}
          canModerate={canModerate}
          replyingTo={replyingTo}
          onReply={onReply}
          onDeleted={onDeleted}
          onUpdated={onUpdated}
        />
      ))}
    </div>
  )
}

interface PostCardProps {
  post: Post & { authorName?: string; commentCount?: number }
  canPin?: boolean
  canEdit?: boolean
  canModerate?: boolean
  onChanged?: () => void
  currentUserId: number
  currentUserRole: string
}

export function PostCard({ post, canPin, canEdit, canModerate, onChanged, currentUserId, currentUserRole }: PostCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [comments, setComments] = useState<CommentData[]>([])
  const [commentCount, setCommentCount] = useState(post.commentCount ?? 0)
  const [loadingComments, setLoadingComments] = useState(false)
  const [replyTo, setReplyTo] = useState<CommentData | null>(null)
  const [replyText, setReplyText] = useState("")
  const [newComment, setNewComment] = useState("")
  const [editOpen, setEditOpen] = useState(false)
  const [pinned, setPinned] = useState(post.is_pinned)

  const authorName = post.authorName ?? "Unknown"
  const canEditPost = canEdit || canModerate || post.author_id === currentUserId
  const isModeratorRole = canModerate || currentUserRole === "teacher" || currentUserRole === "admin"

  const toggleComments = async () => {
    if (!expanded) {
      setLoadingComments(true)
      try {
        const res = await fetch(`/api/posts/${post.id}/comments`)
        if (res.ok) {
          const data = (await res.json()) as Record<string, unknown>[]
          setComments(data.map(parseComment))
        }
      } catch { /* ignore */ }
      setLoadingComments(false)
    }
    setExpanded(prev => !prev)
  }

  const submitComment = async () => {
    const text = (replyTo ? replyText : newComment).trim()
    if (!text) return
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, parentId: replyTo?.id }),
      })
      if (!res.ok) throw new Error("Failed")
      const raw = (await res.json()) as Record<string, unknown>
      const newC = parseComment(raw)

      if (replyTo) {
        const addReply = (list: CommentData[], parentId: number, reply: CommentData): CommentData[] =>
          list.map(c =>
            c.id === parentId
              ? { ...c, replies: [...c.replies, reply] }
              : { ...c, replies: addReply(c.replies, parentId, reply) },
          )
        setComments(prev => addReply(prev, replyTo.id, { ...newC, replies: [] }))
      } else {
        setComments(prev => [...prev, { ...newC, replies: [] }])
      }
      setCommentCount(n => n + 1)
      toast("Comment posted", "success")
    } catch { toast("Failed to post comment", "error") }
    setReplyTo(null)
    setReplyText("")
    setNewComment("")
  }

  const handleDeleted = (id: number) => {
    const remove = (list: CommentData[]): CommentData[] =>
      list.filter(c => c.id !== id).map(c => ({ ...c, replies: remove(c.replies) }))
    setComments(prev => remove(prev))
    setCommentCount(n => Math.max(0, n - 1))
  }

  const handleUpdated = (id: number, content: string) => {
    const update = (list: CommentData[]): CommentData[] =>
      list.map(c => c.id === id ? { ...c, content } : { ...c, replies: update(c.replies) })
    setComments(prev => update(prev))
  }

  const togglePin = async () => {
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: post.title, content: post.content, isPinned: !pinned }),
      })
      if (!res.ok) throw new Error("Failed")
      setPinned(prev => !prev)
      toast(pinned ? "Post unpinned" : "Post pinned", "success")
      onChanged?.()
    } catch { toast("Failed to update post", "error") }
  }

  const deletePost = async () => {
    if (!confirm("Delete this post and all its comments?")) return
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
      toast("Post deleted", "success")
      onChanged?.()
    } catch { toast("Failed to delete post", "error") }
  }

  return (
    <>
      <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-card)", padding: 20 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
          <Avatar name={authorName} size="md" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{authorName}</span>
              {pinned && <Badge tone="yellow" style={{ fontSize: 11 }}><PinIcon size={10} /> Pinned</Badge>}
              <span style={{ fontSize: 12, color: "var(--color-fg-muted)", marginLeft: "auto" }}>{relative(post.created_at)}</span>
            </div>
            <h3 style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>{post.title}</h3>
          </div>
        </div>

        {/* Body */}
        <p style={{ margin: "0 0 14px", fontSize: 14, lineHeight: 1.6, color: "var(--color-fg)" }}>{post.content}</p>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={toggleComments}
            style={{ display: "flex", alignItems: "center", gap: 6, background: expanded ? "var(--color-primary-50,#f0fdf4)" : "none", border: "1px solid var(--color-border)", borderRadius: 8, padding: "5px 12px", fontSize: 13, color: expanded ? "var(--color-primary-700,#15803d)" : "var(--color-fg-muted)", cursor: "pointer", transition: "all .12s" }}
          >
            <CommentIcon size={14} />
            {commentCount > 0
              ? `${commentCount} comment${commentCount !== 1 ? "s" : ""}`
              : expanded ? "Hide" : "Comment"}
          </button>

          {canPin && (
            <button onClick={togglePin} style={{ background: "none", border: "1px solid var(--color-border)", borderRadius: 8, padding: "5px 12px", fontSize: 13, color: pinned ? "var(--color-primary-600)" : "var(--color-fg-muted)", cursor: "pointer" }}>
              {pinned ? "Unpin" : "Pin"}
            </button>
          )}

          {canEditPost && (
            <button onClick={() => setEditOpen(true)} style={{ background: "none", border: "none", padding: "5px 8px", cursor: "pointer", color: "var(--color-fg-muted)" }}>
              <EditIcon size={15} />
            </button>
          )}

          {(canModerate || canEdit || post.author_id === currentUserId) && (
            <button onClick={deletePost} style={{ background: "none", border: "none", padding: "5px 8px", cursor: "pointer", color: "#dc2626" }}>
              <TrashIcon size={15} />
            </button>
          )}
        </div>

        {/* Comments section */}
        {expanded && (
          <div style={{ marginTop: 16, borderTop: "1px solid var(--color-border)", paddingTop: 12 }}>
            {loadingComments ? (
              <p style={{ fontSize: 13, color: "var(--color-fg-muted)", margin: "0 0 12px" }}>Loading comments…</p>
            ) : comments.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--color-fg-muted)", margin: "0 0 12px" }}>No comments yet. Be the first!</p>
            ) : (
              <div style={{ marginBottom: 12 }}>
                {comments.map(c => (
                  <CommentRow
                    key={c.id}
                    comment={c}
                    currentUserId={currentUserId}
                    canModerate={isModeratorRole}
                    replyingTo={replyTo?.id ?? null}
                    onReply={setReplyTo}
                    onDeleted={handleDeleted}
                    onUpdated={handleUpdated}
                  />
                ))}
              </div>
            )}

            {/* Reply context banner */}
            {replyTo && (
              <div style={{ background: "var(--color-surface-2,#f8f9fa)", borderRadius: 8, padding: "8px 12px", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "var(--color-fg-muted)", flex: 1 }}>
                  Replying to <strong>{replyTo.author_name}</strong>
                </span>
                <button onClick={() => setReplyTo(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-fg-muted)", fontSize: 16, lineHeight: 1 }}>✕</button>
              </div>
            )}

            {/* Input */}
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={replyTo ? replyText : newComment}
                onChange={e => replyTo ? setReplyText(e.target.value) : setNewComment(e.target.value)}
                placeholder={replyTo ? `Reply to ${replyTo.author_name}…` : "Write a comment…"}
                onKeyDown={e => { if (e.key === "Enter") submitComment(); if (e.key === "Escape" && replyTo) setReplyTo(null) }}
                style={{ flex: 1, height: 36, padding: "0 12px", borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-fg)", fontSize: 13, outline: "none" }}
              />
              <ButtonSmall onClick={submitComment} style={{ height: 36, padding: "0 14px" }}>
                {replyTo ? "Reply" : "Post"}
              </ButtonSmall>
            </div>
          </div>
        )}
      </div>

      <PostCreateModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        courseId={post.course_id}
        authorId={currentUserId}
        onCreated={() => onChanged?.()}
        post={post}
      />
    </>
  )
}
