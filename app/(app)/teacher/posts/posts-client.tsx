"use client"

import { useState } from "react"
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
  teacherId: number
}

export function TeacherPostsClient({ courses, postsByCourse, teacherId }: Props) {
  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.id ?? null)
  const [createOpen, setCreateOpen] = useState(false)
  const [version, setVersion] = useState(0)

  const coursePosts = postsByCourse.find(p => p.courseId === selectedCourse)?.posts ?? []

  return (
    <>
      <PageHeader
        title="Discussion"
        subtitle="Manage and participate in course discussions."
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
          description="Start a discussion for this course."
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
              key={`${post.id}-${version}`}
              post={post}
              canPin
              canEdit
              canModerate
              currentUserId={teacherId}
              currentUserRole="teacher"
              onChanged={() => setVersion(v => v + 1)}
            />
          ))}
        </div>
      )}

      {selectedCourse && (
        <PostCreateModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          courseId={selectedCourse}
          authorId={teacherId}
          onCreated={() => {
            setCreateOpen(false)
            setVersion(v => v + 1)
          }}
        />
      )}
    </>
  )
}
