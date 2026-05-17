"use client"

import { useState } from "react"
import type { Post, Comment } from "@/lib/types"
import { users, getPostComments } from "@/lib/mock-data"
import { Avatar, Badge, toast } from "@/components/ui/primitives"
import { ButtonSmall } from "@/components/ui/button-small"
import { PinIcon, EditIcon, TrashIcon, CommentIcon } from "@/components/ui/icons"
import { relative } from "@/lib/fmt"
import { PostCreateModal } from "@/components/post-create-modal"

interface CommentRowProps {
  comment: Comment
  onReply?: ((c: Comment) => void) | null
  onDelete?: ((c: Comment) => void) | null
}

function CommentRow({ comment, onReply, onDelete }: CommentRowProps) {
  const author = users.find(u => u.id === comment.author_id)
  const name = author?.full_name ?? "Unknown"

  return (
    <div style={{ display: "flex", gap: 10, padding: "10px 0" }}>
      <Avatar name={name} size="sm" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{name}</span>
          <span style={{ fontSize: 11, color: "var(--color-fg-muted)" }}>{relative(comment.created_at)}</span>
        </div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{comment.content}</p>
        <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
          {onReply && (
            <button
              onClick={() => onReply(comment)}
              style={{ background: "none", border: "none", padding: 0, fontSize: 12, color: "var(--color-primary-600)", cursor: "pointer", fontWeight: 500 }}
            >
              Reply
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(comment)}
              style={{ background: "none", border: "none", padding: 0, fontSize: 12, color: "var(--color-fg-muted)", cursor: "pointer" }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface PostCardProps {
  post: Post
  canPin?: boolean
  canEdit?: boolean
  canModerate?: boolean
  onChanged?: () => void
  currentUserId: number
  currentUserRole: string
}

export function PostCard({ post, canPin, canEdit, canModerate, onChanged, currentUserId, currentUserRole }: PostCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  const [replyText, setReplyText] = useState("")
  const [newComment, setNewComment] = useState("")
  const [editOpen, setEditOpen] = useState(false)
  const [pinned, setPinned] = useState(post.is_pinned)

  const author = users.find(u => u.id === post.author_id)
  const authorName = author?.full_name ?? "Unknown"
  const canEditPost = canEdit || canModerate || post.author_id === currentUserId
  const canDeleteComment = (c: Comment) =>
    c.author_id === currentUserId || currentUserRole === "teacher" || currentUserRole === "admin"

  const toggleComments = () => {
    if (!expanded) setComments(getPostComments(post.id))
    setExpanded(prev => !prev)
  }

  const submitComment = async () => {
    const text = (replyTo ? replyText : newComment).trim()
    if (!text) return
    await new Promise(r => setTimeout(r, 300))
    toast("Comment posted", "success")
    setReplyTo(null)
    setReplyText("")
    setNewComment("")
    setComments(getPostComments(post.id))
  }

  const deleteComment = async (c: Comment) => {
    await new Promise(r => setTimeout(r, 200))
    setComments(prev => prev.filter(x => x.id !== c.id))
    toast("Comment deleted", "success")
  }

  const togglePin = async () => {
    await new Promise(r => setTimeout(r, 200))
    setPinned(prev => !prev)
    toast(pinned ? "Post unpinned" : "Post pinned", "success")
    onChanged?.()
  }

  const deletePost = async () => {
    await new Promise(r => setTimeout(r, 200))
    toast("Post deleted", "success")
    onChanged?.()
  }

  return (
    <>
      <div style={{
        background: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-card)",
        padding: 20,
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
          <Avatar name={authorName} size="md" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{authorName}</span>
              {pinned && (
                <Badge tone="yellow" style={{ fontSize: 11 }}>
                  <PinIcon size={10} /> Pinned
                </Badge>
              )}
              <span style={{ fontSize: 12, color: "var(--color-fg-muted)", marginLeft: "auto" }}>
                {relative(post.created_at)}
              </span>
            </div>
            <h3 style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>{post.title}</h3>
          </div>
        </div>

        {/* Body */}
        <p style={{ margin: "0 0 14px", fontSize: 14, lineHeight: 1.6, color: "var(--color-fg)" }}>
          {post.content}
        </p>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={toggleComments}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "1px solid var(--color-border)",
              borderRadius: 8, padding: "5px 12px", fontSize: 13,
              color: "var(--color-fg-muted)", cursor: "pointer",
            }}
          >
            <CommentIcon size={14} />
            {expanded ? "Hide comments" : "Comments"}
          </button>

          {canPin && (
            <button
              onClick={togglePin}
              style={{
                background: "none", border: "1px solid var(--color-border)",
                borderRadius: 8, padding: "5px 12px", fontSize: 13,
                color: pinned ? "var(--color-primary-600)" : "var(--color-fg-muted)",
                cursor: "pointer",
              }}
            >
              {pinned ? "Unpin" : "Pin"}
            </button>
          )}

          {canEditPost && (
            <button
              onClick={() => setEditOpen(true)}
              style={{ background: "none", border: "none", padding: "5px 8px", cursor: "pointer", color: "var(--color-fg-muted)" }}
            >
              <EditIcon size={15} />
            </button>
          )}

          {(canModerate || canEdit || post.author_id === currentUserId) && (
            <button
              onClick={deletePost}
              style={{ background: "none", border: "none", padding: "5px 8px", cursor: "pointer", color: "#dc2626" }}
            >
              <TrashIcon size={15} />
            </button>
          )}
        </div>

        {/* Comments section */}
        {expanded && (
          <div style={{ marginTop: 16, borderTop: "1px solid var(--color-border)", paddingTop: 12 }}>
            {comments.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--color-fg-muted)", margin: "0 0 12px" }}>No comments yet.</p>
            )}
            {comments.map(c => (
              <CommentRow
                key={c.id}
                comment={c}
                onReply={replyTo ? null : setReplyTo}
                onDelete={canDeleteComment(c) ? deleteComment : null}
              />
            ))}

            {/* Reply box */}
            {replyTo && (
              <div style={{
                background: "var(--color-surface-2, #f8f9fa)",
                borderRadius: 8, padding: 10, marginBottom: 10,
              }}>
                <div style={{ fontSize: 12, color: "var(--color-fg-muted)", marginBottom: 6 }}>
                  Replying to {users.find(u => u.id === replyTo.author_id)?.full_name ?? "Unknown"}
                  <button
                    onClick={() => setReplyTo(null)}
                    style={{ background: "none", border: "none", cursor: "pointer", marginLeft: 8, color: "var(--color-fg-muted)" }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Write a reply…"
                    onKeyDown={e => { if (e.key === "Enter") submitComment() }}
                    style={{
                      flex: 1, height: 36, padding: "0 12px", borderRadius: 8,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-surface)",
                      color: "var(--color-fg)", fontSize: 13, outline: "none",
                    }}
                  />
                  <ButtonSmall onClick={submitComment} style={{ height: 36, padding: "0 14px" }}>Reply</ButtonSmall>
                </div>
              </div>
            )}

            {/* New comment box */}
            {!replyTo && (
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Write a comment…"
                  onKeyDown={e => { if (e.key === "Enter") submitComment() }}
                  style={{
                    flex: 1, height: 36, padding: "0 12px", borderRadius: 8,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                    color: "var(--color-fg)", fontSize: 13, outline: "none",
                  }}
                />
                <ButtonSmall onClick={submitComment} style={{ height: 36, padding: "0 14px" }}>Post</ButtonSmall>
              </div>
            )}
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
