import "server-only"

import type {
  BackendLessonCreateRequest,
  BackendLessonRequest,
  BackendLessonResponse,
} from "./types"
import { authJson } from "./authenticated"

export async function listLessonsInSection(
  sectionId: number,
): Promise<BackendLessonResponse[]> {
  return authJson<BackendLessonResponse[]>(`/api/sections/${sectionId}/items`)
}

export async function createSectionItem(
  sectionId: number,
  body: BackendLessonCreateRequest,
): Promise<BackendLessonResponse> {
  return authJson<BackendLessonResponse>(`/api/sections/${sectionId}/items`, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function updateLesson(
  lessonId: number,
  body: BackendLessonRequest,
): Promise<BackendLessonResponse> {
  return authJson<BackendLessonResponse>(`/api/items/${lessonId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  })
}

export async function deleteLesson(lessonId: number): Promise<void> {
  await authJson<{ message: string }>(`/api/items/${lessonId}`, {
    method: "DELETE",
  })
}
