import "server-only"

import type {
  BackendAssignmentRequest,
  BackendAssignmentResponse,
  BackendSubmissionResponse,
} from "./types"
import { authFetch, authJson } from "./authenticated"
import { ApiError } from "@/lib/api-client"
import { listMyEnrollments } from "./enrollments"
import { listCourses } from "./courses"
import {
  mapBackendAssignment,
  mapBackendSubmission,
  computeAssignmentStatus,
  type AssignmentStatus,
} from "./assignment-mappers"
import type { Assignment, Course, Submission } from "@/lib/types"

export type StudentAssignmentRow = {
  id: number
  title: string
  dueDate?: string
  maxScore: number
  score?: number
  status: AssignmentStatus
  course: Course
}

export type TeacherAssignmentRow = Assignment & {
  courseName: string
  totalSubmissions: number
  gradedCount: number
}

export async function createAssignment(
  courseId: number,
  body: BackendAssignmentRequest,
): Promise<Assignment> {
  const data = await authJson<BackendAssignmentResponse>(
    `/api/courses/${courseId}/assignments`,
    { method: "POST", body: JSON.stringify(body) },
  )
  return mapBackendAssignment(data)
}

export async function listAssignmentsInCourse(
  courseId: number,
): Promise<Assignment[]> {
  const data = await authJson<BackendAssignmentResponse[]>(
    `/api/courses/${courseId}/assignments`,
  )
  return data.map(mapBackendAssignment)
}

export async function getAssignment(id: number): Promise<Assignment | null> {
  try {
    const data = await authJson<BackendAssignmentResponse>(`/api/assignments/${id}`)
    return mapBackendAssignment(data)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

export async function updateAssignment(
  id: number,
  body: BackendAssignmentRequest,
): Promise<Assignment> {
  const data = await authJson<BackendAssignmentResponse>(`/api/assignments/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  })
  return mapBackendAssignment(data)
}

export async function deleteAssignment(id: number): Promise<void> {
  await authJson<{ message: string }>(`/api/assignments/${id}`, {
    method: "DELETE",
  })
}

export async function submitAssignmentServer(
  assignmentId: number,
  formData: FormData,
): Promise<BackendSubmissionResponse> {
  const res = await authFetch(`/api/assignments/${assignmentId}/submissions`, {
    method: "POST",
    body: formData,
  })
  return res.json() as Promise<BackendSubmissionResponse>
}

export async function listSubmissions(
  assignmentId: number,
): Promise<BackendSubmissionResponse[]> {
  return authJson<BackendSubmissionResponse[]>(
    `/api/assignments/${assignmentId}/submissions`,
  )
}

export async function getSubmission(
  id: number,
): Promise<BackendSubmissionResponse> {
  return authJson<BackendSubmissionResponse>(`/api/submissions/${id}`)
}

export async function getMySubmissions(): Promise<BackendSubmissionResponse[]> {
  return authJson<BackendSubmissionResponse[]>("/api/users/me/submissions")
}

export async function getStudentFinalSubmission(
  assignmentId: number,
): Promise<BackendSubmissionResponse | null> {
  const subs = await getMySubmissions()
  return (
    subs.find(s => s.assignmentId === assignmentId && s.isFinal !== false) ?? null
  )
}

export async function listStudentAssignmentRows(): Promise<StudentAssignmentRow[]> {
  const enrollments = await listMyEnrollments("ACTIVE")
  const mySubmissions = await getMySubmissions()
  const now = new Date()
  const rows: StudentAssignmentRow[] = []

  for (const enrollment of enrollments) {
    const course = enrollment.course
    if (!course) continue

    const assignments = await listAssignmentsInCourse(course.id)
    for (const assignment of assignments) {
      const submission = mySubmissions.find(
        s => s.assignmentId === assignment.id && s.isFinal !== false,
      )
      rows.push({
        id: assignment.id,
        title: assignment.title,
        dueDate: assignment.due_date,
        maxScore: assignment.max_score,
        score: submission?.score != null ? Number(submission.score) : undefined,
        status: computeAssignmentStatus(assignment, submission, now),
        course,
      })
    }
  }

  return rows.sort((a, b) => {
    const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
    const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
    return aTime - bTime
  })
}

export async function listTeacherAssignmentRows(
  teacherId: number,
): Promise<TeacherAssignmentRow[]> {
  const courses = await listCourses({ teacherId })
  const rows: TeacherAssignmentRow[] = []

  for (const course of courses) {
    const assignments = await listAssignmentsInCourse(course.id)
    for (const assignment of assignments) {
      const subs = await listSubmissions(assignment.id)
      const finalSubs = subs.filter(s => s.isFinal !== false)
      rows.push({
        ...assignment,
        courseName: course.title,
        totalSubmissions: finalSubs.length,
        gradedCount: finalSubs.filter(s => s.score != null || s.status === "GRADED").length,
      })
    }
  }

  return rows
}

export async function listPendingTeacherSubmissions(teacherId: number): Promise<
  {
    submission: BackendSubmissionResponse
    assignment: Assignment
    courseName: string
    studentName: string
  }[]
> {
  const rows = await listTeacherAssignmentRows(teacherId)
  const pending: {
    submission: BackendSubmissionResponse
    assignment: Assignment
    courseName: string
    studentName: string
  }[] = []

  for (const row of rows) {
    const subs = await listSubmissions(row.id)
    for (const sub of subs.filter(s => s.isFinal !== false && s.score == null && s.status !== "GRADED")) {
      pending.push({
        submission: sub,
        assignment: row,
        courseName: row.courseName,
        studentName: sub.studentName ?? "Unknown",
      })
    }
  }

  return pending.sort((a, b) => {
    const aTime = a.submission.submittedAt ? new Date(a.submission.submittedAt).getTime() : 0
    const bTime = b.submission.submittedAt ? new Date(b.submission.submittedAt).getTime() : 0
    return bTime - aTime
  })
}

export async function getStudentSubmissionForAssignment(
  assignmentId: number,
): Promise<(Submission & { files?: import("./types").BackendSubmissionResponse["files"] }) | undefined> {
  const sub = await getStudentFinalSubmission(assignmentId)
  if (!sub) return undefined
  return mapBackendSubmission(sub)
}
