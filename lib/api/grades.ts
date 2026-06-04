import "server-only"

import type { BackendGradeRequest, BackendGradeResponse } from "./types"
import { authJson } from "./authenticated"
import { ApiError } from "@/lib/api-client"
import { mapBackendGrade } from "./assignment-mappers"
import type { Grade } from "@/lib/types"

export async function gradeSubmission(
  submissionId: number,
  body: BackendGradeRequest,
): Promise<Grade> {
  const data = await authJson<BackendGradeResponse>(
    `/api/submissions/${submissionId}/grade`,
    { method: "POST", body: JSON.stringify(body) },
  )
  return mapBackendGrade(data)
}

export async function updateGrade(
  gradeId: number,
  body: BackendGradeRequest,
): Promise<Grade> {
  const data = await authJson<BackendGradeResponse>(`/api/grades/${gradeId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  })
  return mapBackendGrade(data)
}

export async function getGradeBySubmission(
  submissionId: number,
): Promise<Grade | null> {
  try {
    const data = await authJson<BackendGradeResponse>(
      `/api/submissions/${submissionId}/grade`,
    )
    return mapBackendGrade(data)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

export async function getClassGrades(courseId: number): Promise<Grade[]> {
  const data = await authJson<BackendGradeResponse[]>(
    `/api/courses/${courseId}/grades`,
  )
  return data.map(mapBackendGrade)
}

export async function getStudentAverageGrade(): Promise<number | null> {
  const { getMySubmissions } = await import("./assignments")
  const subs = await getMySubmissions()
  const graded = subs.filter(s => s.score != null && s.isFinal !== false)
  if (graded.length === 0) return null
  const total = graded.reduce((sum, s) => sum + Number(s.score), 0)
  return total / graded.length
}
