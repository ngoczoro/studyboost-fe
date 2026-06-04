/** Application timezone for assignment timestamps (matches backend AppDateTime). */
export const APP_TIMEZONE = "Asia/Ho_Chi_Minh"

/**
 * Parse API datetime strings into a JS Date.
 * Naïve strings from the backend (e.g. `2026-05-31T02:00:00`) are treated as HCM wall time.
 */
export function parseApiDateTime(value: string): Date {
  const trimmed = value.trim()
  if (trimmed.endsWith("Z") || trimmed.endsWith("z")) {
    return new Date(trimmed)
  }
  if (/[+-]\d{2}:\d{2}$/.test(trimmed)) {
    return new Date(trimmed)
  }

  let normalized = trimmed
  if (normalized.length === 16) {
    normalized = `${normalized}:00`
  } else if (normalized.length > 19 && normalized.charAt(19) === ".") {
    normalized = normalized.slice(0, 19)
  }

  return new Date(`${normalized}+07:00`)
}

/**
 * Format a datetime in Asia/Ho_Chi_Minh as `dd/MM/yyyy HH:mm:ss`.
 * Fixed format — not browser-locale dependent.
 */
export function formatDateTimeHcm(value: string | Date | null | undefined): string {
  if (value == null || value === "") return "—"

  const date = typeof value === "string" ? parseApiDateTime(value) : value
  if (Number.isNaN(date.getTime())) return "—"

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date)

  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(p => p.type === type)?.value ?? "00"

  return `${part("day")}/${part("month")}/${part("year")} ${part("hour")}:${part("minute")}:${part("second")}`
}
