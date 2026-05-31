"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, Modal, toast } from "@/components/ui/primitives"
import { formatDueDateForApi } from "@/lib/datetime-picker"
import { CourseGlyph } from "@/components/ui/course-glyph"
import type { Course } from "@/lib/types"
import type { BackendPersonalEventResponse } from "@/lib/api/types"

export interface CalendarAssignmentEvent {
  id: string
  date: string
  title: string
  type: "assignment"
  course?: Course
  assignmentId: number
}

export interface CalendarPersonalEvent {
  id: string
  date: string
  title: string
  type: "personal"
  eventId: number
}

export type CalendarEvent = CalendarAssignmentEvent | CalendarPersonalEvent

interface Props {
  role: "student" | "teacher"
  assignmentEvents: CalendarAssignmentEvent[]
  personalEvents: CalendarPersonalEvent[]
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function assignmentHref(role: Props["role"], assignmentId: number): string {
  return role === "teacher"
    ? `/teacher/assignments/${assignmentId}`
    : `/student/assignments/${assignmentId}`
}

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function mapPersonalEvent(ev: BackendPersonalEventResponse): CalendarPersonalEvent {
  return {
    id: `personal-${ev.id}`,
    date: ev.eventDate,
    title: ev.title,
    type: "personal",
    eventId: ev.id,
  }
}

export function CalendarClient({ role, assignmentEvents, personalEvents: initialPersonal }: Props) {
  const router = useRouter()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [personalEvents, setPersonalEvents] = useState(initialPersonal)
  const [formOpen, setFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarPersonalEvent | null>(null)
  const [title, setTitle] = useState("")
  const [saving, setSaving] = useState(false)

  const allEvents: CalendarEvent[] = [...assignmentEvents, ...personalEvents]

  function eventsForDay(day: number) {
    const dateStr = toDateKey(year, month, day)
    return allEvents.filter(e => e.date.startsWith(dateStr))
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const selectedDayEvents = selectedDay ? eventsForDay(selectedDay) : []

  function openCreateForm() {
    setEditingEvent(null)
    setTitle("")
    setFormOpen(true)
  }

  function openEditForm(ev: CalendarPersonalEvent) {
    setEditingEvent(ev)
    setTitle(ev.title)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingEvent(null)
    setTitle("")
  }

  async function savePersonalEvent(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !selectedDay) return

    const dateStr = toDateKey(year, month, selectedDay)
    const eventDate = formatDueDateForApi(`${dateStr}T12:00`)

    setSaving(true)
    try {
      if (editingEvent) {
        const res = await fetch(`/api/events/${editingEvent.eventId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim(), eventDate }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? "Update failed")
        const updated = mapPersonalEvent(data.event as BackendPersonalEventResponse)
        setPersonalEvents(prev => prev.map(p => (p.eventId === editingEvent.eventId ? updated : p)))
        toast("Event updated", "success")
      } else {
        const res = await fetch("/api/users/me/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim(), eventDate }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? "Create failed")
        const created = mapPersonalEvent(data.event as BackendPersonalEventResponse)
        setPersonalEvents(prev => [...prev, created])
        toast("Event created", "success")
      }
      closeForm()
      router.refresh()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error")
    } finally {
      setSaving(false)
    }
  }

  async function removePersonalEvent(ev: CalendarPersonalEvent) {
    if (!window.confirm(`Delete "${ev.title}"?`)) return
    setSaving(true)
    try {
      const res = await fetch(`/api/events/${ev.eventId}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Delete failed")
      setPersonalEvents(prev => prev.filter(p => p.eventId !== ev.eventId))
      toast("Event deleted", "success")
      router.refresh()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Delete failed", "error")
    } finally {
      setSaving(false)
    }
  }

  function handleAssignmentClick(assignmentId: number) {
    router.push(assignmentHref(role, assignmentId))
  }

  return (
    <>
      <Card style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <button
            type="button"
            onClick={prevMonth}
            style={{ background: "none", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "6px 12px", cursor: "pointer", fontSize: 16, color: "var(--color-fg)" }}
          >
            ‹
          </button>
          <div style={{ fontWeight: 700, fontSize: 16 }}>
            {MONTH_NAMES[month]} {year}
          </div>
          <button
            type="button"
            onClick={nextMonth}
            style={{ background: "none", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "6px 12px", cursor: "pointer", fontSize: 16, color: "var(--color-fg)" }}
          >
            ›
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
          {DAY_NAMES.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "var(--color-fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em", padding: "4px 0" }}>
              {d}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
          {cells.map((day, idx) => {
            const isToday = day !== null && year === today.getFullYear() && month === today.getMonth() && day === today.getDate()
            const dayEvents = day ? eventsForDay(day) : []
            return (
              <div
                key={idx}
                onClick={() => day && setSelectedDay(day)}
                style={{
                  minHeight: 72,
                  borderRadius: "var(--radius-md)",
                  padding: 6,
                  background: day ? "var(--color-surface-2)" : "transparent",
                  border: isToday 
                    ? "2px solid var(--color-primary-600)" 
                    : day 
                    ? "1px solid var(--color-border)" 
                    : "1px solid transparent",
                  cursor: day ? "pointer" : "default",
                }}
              >
                {day && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? "var(--color-primary-600)" : "var(--color-fg)", marginBottom: 4 }}>
                      {day}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {dayEvents.slice(0, 2).map(ev => (
                        <div
                          key={ev.id}
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            padding: "2px 4px",
                            borderRadius: 4,
                            background: ev.type === "assignment" ? "var(--color-primary-50)" : "#fef3c7",
                            color: ev.type === "assignment" ? "var(--color-primary-700)" : "#92400e",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div style={{ fontSize: 10, color: "var(--color-fg-muted)" }}>+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 16, justifyContent: "flex-end" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-fg-muted)" }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "var(--color-primary-50)", border: "1px solid var(--color-primary-200)" }} />
            Assignment due
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-fg-muted)" }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "#fef3c7", border: "1px solid #fcd34d" }} />
            Personal
          </div>
        </div>
      </Card>

      <Modal
        open={selectedDay !== null}
        onClose={() => { setSelectedDay(null); closeForm() }}
        title={selectedDay ? `${MONTH_NAMES[month]} ${selectedDay}, ${year}` : ""}
        width={420}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {selectedDayEvents.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--color-fg-muted)", margin: 0 }}>No events on this day.</p>
          ) : (
            selectedDayEvents.map(ev => (
              <div
                key={ev.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {ev.type === "assignment" && ev.course && (
                  <CourseGlyph course={ev.course} size={32} />
                )}
                {ev.type === "personal" && (
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                    📅
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {ev.type === "assignment" ? (
                    <button
                      type="button"
                      onClick={() => handleAssignmentClick(ev.assignmentId)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--color-primary-600)",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      {ev.title}
                    </button>
                  ) : (
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{ev.title}</div>
                  )}
                  {ev.type === "assignment" && ev.course && (
                    <div style={{ fontSize: 11, color: "var(--color-fg-muted)" }}>{ev.course.title}</div>
                  )}
                  {ev.type === "assignment" && (
                    <Link
                      href={assignmentHref(role, ev.assignmentId)}
                      style={{ fontSize: 11, color: "var(--color-primary-600)", textDecoration: "none" }}
                    >
                      Open assignment →
                    </Link>
                  )}
                </div>
                {ev.type === "personal" && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => openEditForm(ev)}
                      style={{ fontSize: 12, border: "1px solid var(--color-border)", borderRadius: 6, padding: "4px 8px", background: "var(--color-surface)", cursor: "pointer" }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removePersonalEvent(ev)}
                      disabled={saving}
                      style={{ fontSize: 12, border: "1px solid var(--color-border)", borderRadius: 6, padding: "4px 8px", background: "var(--color-surface)", cursor: "pointer", color: "#dc2626" }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}

          {formOpen ? (
            <form onSubmit={savePersonalEvent} style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <input
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Event title…"
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  fontSize: 13,
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-surface)",
                  color: "var(--color-fg)",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={saving || !title.trim()}
                style={{ padding: "8px 14px", background: "var(--color-primary-600)", color: "#fff", border: "none", borderRadius: "var(--radius-md)", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.7 : 1 }}
              >
                {saving ? "…" : editingEvent ? "Save" : "Add"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                style={{ padding: "8px 10px", background: "none", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: 13, cursor: "pointer", color: "var(--color-fg)" }}
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={openCreateForm}
              style={{
                marginTop: 4,
                padding: "8px 14px",
                background: "none",
                border: "1px dashed var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontSize: 13,
                color: "var(--color-fg-muted)",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              + Add personal event
            </button>
          )}
        </div>
      </Modal>
    </>
  )
}
