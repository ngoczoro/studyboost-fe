import type {
  BackendAssignmentResponse,
  BackendGradeResponse,
  BackendSubmissionResponse,
} from "./types"
import type { Assignment, Grade, Submission } from "@/lib/types"

export function mapBackendAssignment(
  data: BackendAssignmentResponse,
): Assignment {
  return {
    id: data.id,
    course_id: data.courseId,
    section_id: data.sectionId ?? undefined,
    title: data.title,
    description: data.description ?? undefined,
    max_score: Number(data.maxScore),
    due_date: data.dueDate ?? undefined,
    allow_late_submission: data.allowLateSubmission ?? false,
    created_at: data.createdAt ?? new Date().toISOString(),
  }
}

export function mapBackendSubmission(
  data: BackendSubmissionResponse,
): Submission & { grade?: Grade; files?: BackendSubmissionResponse["files"]; assignmentDueDate?: string } {
  const submission: Submission & { grade?: Grade } = {
    id: data.id,
    assignment_id: data.assignmentId,
    student_id: data.studentId,
    content: data.note ?? undefined,
    submitted_at: data.submittedAt ?? new Date().toISOString(),
    is_late: data.isLate ?? false,
    student: data.studentName
      ? {
          id: data.studentId,
          email: "",
          full_name: data.studentName,
          role: "student",
          is_active: true,
          created_at: "",
        }
      : undefined,
  }

  if (data.files?.length) {
    submission.attachment_url = data.files[0]?.filePath
  }

  if (data.score != null) {
    submission.grade = {
      id: 0,
      submission_id: data.id,
      grader_id: 0,
      score: Number(data.score),
      feedback: data.feedback ?? undefined,
      graded_at: data.submittedAt ?? new Date().toISOString(),
    }
  }

  return { ...submission, files: data.files, assignmentDueDate: data.assignmentDueDate ?? undefined }
}

export function mapBackendGrade(data: BackendGradeResponse): Grade {
  return {
    id: data.id,
    submission_id: data.submissionId,
    grader_id: 0,
    score: Number(data.score),
    feedback: data.feedback ?? undefined,
    graded_at: data.gradedAt ?? new Date().toISOString(),
  }
}

export type AssignmentStatus = "open" | "submitted" | "graded" | "overdue"

export function computeAssignmentStatus(
  assignment: Assignment,
  submission?: BackendSubmissionResponse | null,
  now = new Date(),
): AssignmentStatus {
  if (submission?.score != null || submission?.status === "GRADED") {
    return "graded"
  }
  if (submission?.isFinal) {
    return "submitted"
  }
  if (assignment.due_date && new Date(assignment.due_date) < now) {
    return "overdue"
  }
  return "open"
}
