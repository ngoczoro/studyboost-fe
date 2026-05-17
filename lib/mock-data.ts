import type { User, Course, Enrollment, Assignment, Submission, Grade, Post, Comment, Notification, Section, SectionItem } from "./types"

export const users: User[] = [
  { id: 1, email: "admin@lms.edu",     full_name: "Admin System",    role: "admin",   is_active: true, created_at: "2025-01-01T00:00:00Z" },
  { id: 2, email: "teacher1@lms.edu",  full_name: "Nguyễn Văn An",   role: "teacher", is_active: true, created_at: "2025-01-02T00:00:00Z" },
  { id: 3, email: "teacher2@lms.edu",  full_name: "Trần Thị Bình",   role: "teacher", is_active: true, created_at: "2025-01-03T00:00:00Z" },
  { id: 4, email: "teacher3@lms.edu",  full_name: "Lê Văn Cường",    role: "teacher", is_active: true, created_at: "2025-01-04T00:00:00Z" },
  { id: 5, email: "student1@lms.edu",  full_name: "Phạm Thị Dung",   role: "student", is_active: true, created_at: "2025-01-05T00:00:00Z" },
  { id: 6, email: "student2@lms.edu",  full_name: "Hoàng Văn Em",    role: "student", is_active: true, created_at: "2025-01-06T00:00:00Z" },
  { id: 7, email: "student3@lms.edu",  full_name: "Ngô Thị Phương",  role: "student", is_active: true, created_at: "2025-01-07T00:00:00Z" },
  { id: 8, email: "student4@lms.edu",  full_name: "Vũ Minh Quân",    role: "student", is_active: true, created_at: "2025-01-08T00:00:00Z" },
  { id: 9, email: "student5@lms.edu",  full_name: "Đặng Thị Sen",    role: "student", is_active: true, created_at: "2025-01-09T00:00:00Z" },
  { id: 10, email: "student6@lms.edu", full_name: "Bùi Văn Tú",      role: "student", is_active: true, created_at: "2025-01-10T00:00:00Z" },
]

export const courses: Course[] = [
  { id: 101, title: "Introduction to Java",        description: "Core Java fundamentals for beginners.",         teacher_id: 2, status: "PUBLISHED", max_students: 50, created_at: "2025-02-01T00:00:00Z", thumbnail_color: "#86efac", thumbnail_glyph: "‹/›" },
  { id: 102, title: "Web Development with React",  description: "Build modern UIs with React and TypeScript.",   teacher_id: 2, status: "PUBLISHED", max_students: 40, created_at: "2025-02-05T00:00:00Z", thumbnail_color: "#fbbf24", thumbnail_glyph: "JS" },
  { id: 103, title: "Database Design",             description: "SQL, normalization, and ORM patterns.",         teacher_id: 3, status: "PUBLISHED", max_students: 35, created_at: "2025-02-10T00:00:00Z", thumbnail_color: "#60a5fa", thumbnail_glyph: "DB" },
  { id: 104, title: "Spring Boot REST APIs",       description: "Backend development with Spring Boot 3.",       teacher_id: 3, status: "DRAFT",     max_students: 30, created_at: "2025-03-01T00:00:00Z", thumbnail_color: "#f472b6", thumbnail_glyph: "UX" },
  { id: 105, title: "Data Structures & Algorithms",description: "Algorithms and complexity analysis.",            teacher_id: 4, status: "PUBLISHED", max_students: 60, created_at: "2025-03-10T00:00:00Z", thumbnail_color: "#a78bfa", thumbnail_glyph: "Σ" },
]

export const sections: Section[] = [
  { id: 1, course_id: 101, title: "Getting Started",  order_index: 0 },
  { id: 2, course_id: 101, title: "OOP Fundamentals", order_index: 1 },
  { id: 3, course_id: 102, title: "React Basics",     order_index: 0 },
  { id: 4, course_id: 102, title: "Hooks Deep Dive",  order_index: 1 },
]

export const sectionItems: SectionItem[] = [
  { id: 1,  section_id: 1, type: "video", title: "Setting Up JDK",         order_index: 0, is_visible: true, url: "#" },
  { id: 2,  section_id: 1, type: "text",  title: "Hello World walkthrough", order_index: 1, is_visible: true, content: "# Hello World\n\nYour first Java program..." },
  { id: 3,  section_id: 1, type: "file",  title: "Starter project ZIP",     order_index: 2, is_visible: true, url: "#" },
  { id: 4,  section_id: 2, type: "video", title: "Classes & Objects",        order_index: 0, is_visible: true, url: "#" },
  { id: 5,  section_id: 2, type: "video", title: "Inheritance",              order_index: 1, is_visible: true, url: "#" },
  { id: 6,  section_id: 3, type: "video", title: "JSX Syntax",               order_index: 0, is_visible: true, url: "#" },
  { id: 7,  section_id: 3, type: "text",  title: "Component model",          order_index: 1, is_visible: true, content: "# React Components\n\nComponents are the building blocks..." },
  { id: 8,  section_id: 4, type: "video", title: "useState & useEffect",     order_index: 0, is_visible: true, url: "#" },
  { id: 9,  section_id: 4, type: "video", title: "useContext & useReducer",   order_index: 1, is_visible: false, url: "#" },
]

export const enrollments: Enrollment[] = [
  { id: 1, student_id: 5,  course_id: 101, enrolled_at: "2025-02-15T00:00:00Z", status: "ACTIVE" },
  { id: 2, student_id: 5,  course_id: 102, enrolled_at: "2025-02-16T00:00:00Z", status: "ACTIVE" },
  { id: 3, student_id: 6,  course_id: 101, enrolled_at: "2025-02-17T00:00:00Z", status: "ACTIVE" },
  { id: 4, student_id: 7,  course_id: 103, enrolled_at: "2025-02-18T00:00:00Z", status: "ACTIVE" },
  { id: 5, student_id: 8,  course_id: 105, enrolled_at: "2025-03-12T00:00:00Z", status: "ACTIVE" },
]

export const assignments: Assignment[] = [
  { id: 1, course_id: 101, title: "Java Basics Quiz",         description: "Test your knowledge of Java fundamentals.",   max_score: 10, due_date: "2026-06-01T23:59:00Z", allow_late_submission: false, created_at: "2025-05-01T00:00:00Z" },
  { id: 2, course_id: 101, title: "OOP Project",              description: "Build a simple bank account system using OOP.", max_score: 20, due_date: "2026-06-15T23:59:00Z", allow_late_submission: true,  created_at: "2025-05-05T00:00:00Z" },
  { id: 3, course_id: 102, title: "React Todo App",           description: "Build a todo application with React hooks.",   max_score: 15, due_date: "2026-05-25T23:59:00Z", allow_late_submission: false, created_at: "2025-05-03T00:00:00Z" },
  { id: 4, course_id: 105, title: "Sorting Algorithm Impl",   description: "Implement merge sort and quick sort in Java.",  max_score: 10, due_date: "2026-05-20T23:59:00Z", allow_late_submission: true,  created_at: "2025-05-10T00:00:00Z" },
]

export const submissions: Submission[] = [
  { id: 1, assignment_id: 1, student_id: 5, content: "My answers to the quiz.", submitted_at: "2025-05-28T10:00:00Z", is_late: false },
  { id: 2, assignment_id: 3, student_id: 5, content: "GitHub link: https://github.com/...", submitted_at: "2025-05-24T15:30:00Z", is_late: false },
  { id: 3, assignment_id: 4, student_id: 8, content: "Attached my implementation.", submitted_at: "2025-05-21T08:00:00Z", is_late: true },
  { id: 4, assignment_id: 1, student_id: 6, content: "Answers to quiz.", submitted_at: "2025-05-29T12:00:00Z", is_late: false },
]

export const grades: Grade[] = [
  { id: 1, submission_id: 1, grader_id: 2, score: 8.5, feedback: "Good work! Watch out for edge cases.", graded_at: "2025-05-30T09:00:00Z" },
  { id: 2, submission_id: 4, grader_id: 2, score: 9.0, feedback: "Excellent answers, very clear.", graded_at: "2025-05-30T10:00:00Z" },
]

export const posts: Post[] = [
  { id: 1, course_id: 101, author_id: 2, title: "Welcome to Introduction to Java!", content: "Welcome everyone! Feel free to ask questions here.", is_pinned: true,  created_at: "2025-02-10T00:00:00Z", updated_at: "2025-02-10T00:00:00Z" },
  { id: 2, course_id: 101, author_id: 5, title: "Question about inheritance",      content: "Can someone explain how super() works?",           is_pinned: false, created_at: "2025-03-05T00:00:00Z", updated_at: "2025-03-05T00:00:00Z" },
  { id: 3, course_id: 102, author_id: 2, title: "Resources for React Hooks",       content: "Here are some useful resources for learning hooks.", is_pinned: true,  created_at: "2025-03-10T00:00:00Z", updated_at: "2025-03-10T00:00:00Z" },
]

export const comments: Comment[] = [
  { id: 1, post_id: 2, author_id: 2,  content: "super() calls the parent class constructor.",     created_at: "2025-03-06T00:00:00Z" },
  { id: 2, post_id: 2, author_id: 6,  content: "You can also call super.methodName() for methods.", created_at: "2025-03-06T01:00:00Z" },
  { id: 3, post_id: 2, author_id: 5,  content: "Thanks, that really helps!",                       created_at: "2025-03-07T00:00:00Z", parent_id: 1 },
  { id: 4, post_id: 1, author_id: 5,  content: "Excited to learn Java!",                           created_at: "2025-02-11T00:00:00Z" },
]

export const notifications: Notification[] = [
  { id: 1, recipient_id: 5, type: "GRADE_RELEASED",       message: "Your Java Basics Quiz has been graded: 8.5/10",  is_read: false, link: "/student/assignments/1", created_at: "2025-05-30T09:05:00Z" },
  { id: 2, recipient_id: 5, type: "NEW_ASSIGNMENT",        message: "New assignment: OOP Project in Introduction to Java", is_read: false, link: "/student/assignments/2", created_at: "2025-05-05T00:00:00Z" },
  { id: 3, recipient_id: 5, type: "NEW_POST",              message: "New discussion post in Introduction to Java",    is_read: true,  link: "/student/posts",         created_at: "2025-03-05T00:00:00Z" },
  { id: 4, recipient_id: 2, type: "ENROLLMENT_APPROVED",   message: "3 new students enrolled in your courses",        is_read: false, link: "/teacher/students",     created_at: "2025-05-15T00:00:00Z" },
  { id: 5, recipient_id: 1, type: "ENROLLMENT_APPROVED",   message: "Course 'Spring Boot REST APIs' pending review",   is_read: false, link: "/admin/courses",        created_at: "2025-03-02T00:00:00Z" },
]

/* ── Lookup helpers ─────────────────────────────── */
export function getUser(id: number) { return users.find(u => u.id === id) }
export function getCourse(id: number) { return courses.find(c => c.id === id) }
export function getUserCourses(teacherId: number) { return courses.filter(c => c.teacher_id === teacherId) }
export function getStudentEnrollments(studentId: number) { return enrollments.filter(e => e.student_id === studentId) }
export function getCourseEnrollments(courseId: number) { return enrollments.filter(e => e.course_id === courseId) }
export function getCourseAssignments(courseId: number) { return assignments.filter(a => a.course_id === courseId) }
export function getStudentAssignments(studentId: number) {
  const courseIds = getStudentEnrollments(studentId).map(e => e.course_id)
  return assignments.filter(a => courseIds.includes(a.course_id))
}
export function getSubmission(assignmentId: number, studentId: number) {
  return submissions.find(s => s.assignment_id === assignmentId && s.student_id === studentId)
}
export function getGrade(submissionId: number) { return grades.find(g => g.submission_id === submissionId) }
export function getCoursePosts(courseId: number) { return posts.filter(p => p.course_id === courseId) }
export function getPostComments(postId: number) { return comments.filter(c => c.post_id === postId) }
export function getUserNotifications(userId: number) { return notifications.filter(n => n.recipient_id === userId) }
export function getCourseSections(courseId: number) {
  const secs = sections.filter(s => s.course_id === courseId).sort((a,b) => a.order_index - b.order_index)
  return secs.map(s => ({ ...s, items: sectionItems.filter(i => i.section_id === s.id).sort((a,b) => a.order_index - b.order_index) }))
}
export function getAssignmentSubmissions(assignmentId: number) {
  return submissions.filter(s => s.assignment_id === assignmentId).map(s => ({
    ...s,
    student: getUser(s.student_id),
    grade: getGrade(s.id),
  }))
}
