# StudyBoost LMS — Frontend

Next.js App Router frontend for a mini Learning Management System (LMS), ported from a static design handoff prototype. Built as the UI layer for the UIT Java project backend.

## Tech Stack

- **Next.js** (App Router, server components, route groups)
- **TypeScript**
- **CSS custom properties** (design tokens, no Tailwind)
- **jose** — JWT verification in server components / middleware
- **Static mock data** — all data served from `lib/mock-data.ts` (no live API required to run)

## Roles & Routes

The app has three roles. Each has its own route group under `app/(app)/`.

### Admin
| Route | Description |
|---|---|
| `/admin/dashboard` | System overview stats |
| `/admin/users` | User list with role management |
| `/admin/courses` | All courses across all teachers |

### Teacher
| Route | Description |
|---|---|
| `/teacher/dashboard` | Personal course overview |
| `/teacher/courses` | My courses list |
| `/teacher/courses/[id]` | Course detail (sections, lessons, documents) |
| `/teacher/courses/[id]/assignments` | Assignment list for a course |
| `/teacher/courses/[id]/assignments/[aId]` | Submission inbox + grading |
| `/teacher/posts` | Discussion posts across my courses |

### Student
| Route | Description |
|---|---|
| `/student/dashboard` | Enrolled courses + upcoming assignments |
| `/student/courses` | Browse & enroll in courses |
| `/student/courses/[id]` | Course detail (lessons, documents) |
| `/student/assignments` | All assignments across enrolled courses |
| `/student/assignments/[id]` | Assignment detail + submission form |
| `/student/posts` | Discussion forum |
| `/student/calendar` | Month-view calendar of due dates |
| `/student/notifications` | Notification feed |

### Auth
| Route | Description |
|---|---|
| `/login` | Email + password login |
| `/register` | New account registration |

## Mock Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@lms.edu` | `password` |
| Teacher | `teacher1@lms.edu` | `password` |
| Student | `student1@lms.edu` | `password` |

> Credentials are validated against `lib/mock-data.ts`. Sessions are stored as signed JWT cookies via `jose`.

## Project Structure

```
app/
├── (auth)/          # Login + Register pages
├── (app)/           # Authenticated app shell (sidebar + topbar)
│   ├── admin/
│   ├── teacher/
│   └── student/
├── api/             # Next.js route handlers (auth, notifications)
└── globals.css      # Design tokens (CSS custom properties)

components/
├── auth/            # LoginCard
├── brand/           # BrandMark
├── layout/          # Sidebar, Topbar
└── ui/              # Button, Input, Badge, Card, Modal, Avatar, etc.

lib/
├── mock-data.ts     # All seed data + query helpers
├── session.ts       # JWT cookie auth (server-only)
├── types.ts         # Shared TypeScript types
└── fmt.ts           # Date / number formatters

proxy.ts             # Auth middleware (route protection)
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/login`.

## Design Tokens

All colors, radii, shadows, and spacing are defined as CSS custom properties in `app/globals.css`. Key tokens:

```css
--color-primary-600   /* brand accent */
--color-surface       /* card background */
--color-fg            /* primary text */
--color-fg-muted      /* secondary text */
--color-border        /* dividers */
--radius-lg           /* card radius */
--shadow-card         /* card elevation */
```
