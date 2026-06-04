import "server-only"
import { authJson } from "./authenticated"
import { mapBackendPost, mapBackendComment } from "./mappers"
import type { BackendPostResponse, BackendCommentResponse } from "./types"
import type { Post, Comment } from "@/lib/types"

export type PostWithMeta = Post & { authorName: string; commentCount: number }

export async function getPostsInCourse(courseId: number): Promise<PostWithMeta[]> {
  const data = await authJson<BackendPostResponse[]>(`/api/courses/${courseId}/posts`)
  return data.map(mapBackendPost)
}

export async function getPostById(id: number): Promise<PostWithMeta> {
  const data = await authJson<BackendPostResponse>(`/api/posts/${id}`)
  return mapBackendPost(data)
}

export async function getCommentsInPost(postId: number): Promise<Comment[]> {
  const data = await authJson<BackendCommentResponse[]>(`/api/posts/${postId}/comments`)
  return data.map(mapBackendComment)
}
