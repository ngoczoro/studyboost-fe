import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { getUserCourses, assignments, submissions, grades } from "@/lib/mock-data"
import { TeacherAssignmentsClient } from "./assignments-client"

export default async function TeacherAssignmentsPage() {
  const session = await verifySession()
  if (!session || session.role !== "teacher") redirect("/login")

  const myCourses = getUserCourses(session.id)
  const courseIds = new Set(myCourses.map(c => c.id))

  const myAssignments = assignments.filter(a => courseIds.has(a.course_id))
  const assignmentsWithMeta = myAssignments.map(a => {
    const course = myCourses.find(c => c.id === a.course_id)!
    const subs = submissions.filter(s => s.assignment_id === a.id)
    const graded = subs.filter(s => grades.some(g => g.submission_id === s.id)).length
    return { ...a, courseName: course.title, totalSubmissions: subs.length, gradedCount: graded }
  })

  return <TeacherAssignmentsClient assignments={assignmentsWithMeta} courses={myCourses} />
}
