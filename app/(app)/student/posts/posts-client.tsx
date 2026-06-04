"use client"

import { useState, useCallback } from "react"
import { PageHeader, EmptyState } from "@/components/ui/primitives"
import { ButtonSmall } from "@/components/ui/button-small"
import { PlusIcon } from "@/components/ui/icons"
import { PostCard } from "@/components/post-card"
import { PostCreateModal } from "@/components/post-create-modal"
import type { Course } from "@/lib/types"

interface PostMeta {
  id: number
  course_id: number
  author_id: number
  title: string
  content: string
  is_pinned: boolean
  created_at: string
  updated_at: string
  authorName: string
  commentCount: number
}

interface PostsByCourse {
  courseId: number
  posts: PostMeta[]
}

interface Props {
  courses: Course[]
  postsByCourse: PostsByCourse[]
  studentId: number
}

function mapPost(p: Record<string, unknown>): PostMeta {
  return {
    id: p.id as number,
    course_id: (p.courseId ?? p.course_id) as number,
    author_id: (p.authorId ?? p.author_id) as number,
    title: p.title as string,
    content: p.content as string,
    is_pinned: (p.isPinned ?? p.is_pinned ?? false) as boolean,
    created_at: (p.createdAt ?? p.created_at ?? new Date().toISOString()) as string,
    updated_at: (p.updatedAt ?? p.updated_at ?? new Date().toISOString()) as string,
    authorName: (p.authorName ?? "Unknown") as string,
    commentCount: (p.commentCount ?? 0) as number,
  }
}

export function StudentPostsClient({ courses, postsByCourse: initialPostsByCourse, studentId }: Props) {
  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.id ?? null)
  const [postsByCourse, setPostsByCourse] = useState<PostsByCourse[]>(initialPostsByCourse)
  const [createOpen, setCreateOpen] = useState(false)

  const coursePosts = postsByCourse.find(p => p.courseId === selectedCourse)?.posts ?? []

  const refreshPosts = useCallback(async (courseId: number) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/posts`)
      if (!res.ok) return
      const data = (await res.json()) as Record<string, unknown>[]
      const mapped = data.map(mapPost)
      setPostsByCourse(prev =>
        prev.map(p => p.courseId === courseId ? { ...p, posts: mapped } : p),
      )
    } catch {}
  }, [])

  if (courses.length === 0) {
    return (
      <>
        <PageHeader title="Discussion" subtitle="Join a course to participate in discussions." />
        <EmptyState title="No courses" description="You are not enrolled in any courses yet." />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Discussion"
        subtitle="Participate in course discussions."
        actions={
          <ButtonSmall onClick={() => setCreateOpen(true)}>
            <PlusIcon size={16} /> New post
          </ButtonSmall>
        }
      />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {courses.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedCourse(c.id)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: `1.5px solid ${selectedCourse === c.id ? "var(--color-primary-600)" : "var(--color-border)"}`,
              background: selectedCourse === c.id ? "var(--color-primary-50)" : "transparent",
              color: selectedCourse === c.id ? "var(--color-primary-700)" : "var(--color-fg)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {c.title}
          </button>
        ))}
      </div>

      {coursePosts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Be the first to start a discussion."
          action={
            <ButtonSmall onClick={() => setCreateOpen(true)}>
              <PlusIcon size={16} /> New post
            </ButtonSmall>
          }
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {coursePosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={studentId}
              currentUserRole="student"
              onChanged={() => selectedCourse && refreshPosts(selectedCourse)}
            />
          ))}
        </div>
      )}

      {selectedCourse && (
        <PostCreateModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          courseId={selectedCourse}
          authorId={studentId}
          onCreated={() => {
            setCreateOpen(false)
            refreshPosts(selectedCourse)
          }}
        />
      )}
    </>
  )
}
