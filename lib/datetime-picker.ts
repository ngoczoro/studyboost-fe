/** Format for `<input type="datetime-local" />` (local timezone). */
export function formatDateTimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function isoToDateTimeLocal(iso: string): string {
  return formatDateTimeLocal(new Date(iso))
}

/** Default assignment due date: now + 7 days (local time). */
export function defaultDueDateLocal(from = new Date()): string {
  const d = new Date(from)
  d.setDate(d.getDate() + 7)
  return formatDateTimeLocal(d)
}

/** Minimum selectable due date: current moment (local time). */
export function minDueDateLocal(from = new Date()): string {
  return formatDateTimeLocal(from)
}

export function parseScoreInput(value: string): number | null {
  if (value.trim() === "") return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/** Asia/Ho_Chi_Minh offset — Vietnam has no DST. */
export const APP_TIMEZONE_OFFSET = "+07:00"

/**
 * Convert a `datetime-local` value (browser local wall time) to an API string
 * with explicit +07:00 offset so the backend stores HCM wall time correctly.
 */
export function formatDueDateForApi(datetimeLocal: string): string {
  if (!datetimeLocal.trim()) return ""
  const base = datetimeLocal.length === 16 ? `${datetimeLocal}:00` : datetimeLocal
  return `${base}${APP_TIMEZONE_OFFSET}`
}

export function isScoreInRange(score: number, min: number, max: number): boolean {
  return score >= min && score <= max
}
