import "server-only"

import type {
  BackendCourseRequest,
  BackendCourseResponse,
} from "./types"
import { authJson } from "./authenticated"
import { ApiError } from "@/lib/api-client"
import { mapBackendCourse } from "./mappers"
import type { Course } from "@/lib/types"

export interface ListCoursesParams {
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  teacherId?: number
}

function buildQuery(params?: ListCoursesParams): string {
  if (!params) return ""
  const search = new URLSearchParams()
  if (params.status) search.set("status", params.status)
  if (params.teacherId != null) search.set("teacherId", String(params.teacherId))
  const q = search.toString()
  return q ? `?${q}` : ""
}

export async function listCourses(params?: ListCoursesParams): Promise<Course[]> {
  const data = await authJson<BackendCourseResponse[]>(
    `/api/courses${buildQuery(params)}`,
  )
  return data.map(mapBackendCourse)
}

export async function getCourseById(id: number): Promise<Course | null> {
  try {
    const data = await authJson<BackendCourseResponse>(`/api/courses/${id}`)
    return mapBackendCourse(data)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null
    }
    throw err
  }
}

export async function createCourse(body: BackendCourseRequest): Promise<Course> {
  const data = await authJson<BackendCourseResponse>("/api/courses", {
    method: "POST",
    body: JSON.stringify(body),
  })
  return mapBackendCourse(data)
}

export async function updateCourse(
  id: number,
  body: BackendCourseRequest,
): Promise<Course> {
  const data = await authJson<BackendCourseResponse>(`/api/courses/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  })
  return mapBackendCourse(data)
}

export async function deleteCourse(id: number): Promise<void> {
  await authJson<{ message: string }>(`/api/courses/${id}`, {
    method: "DELETE",
  })
}
