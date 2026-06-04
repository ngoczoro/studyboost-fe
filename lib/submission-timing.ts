import { parseApiDateTime } from "@/lib/datetime-format"

function plural(n: number, unit: string): string {
  return `${n} ${unit}${n === 1 ? "" : "s"}`
}

function formatDurationPrecise(ms: number): string {
  let totalSeconds = Math.floor(Math.abs(ms) / 1000)
  const days = Math.floor(totalSeconds / 86_400)
  totalSeconds %= 86_400
  const hours = Math.floor(totalSeconds / 3_600)
  totalSeconds %= 3_600
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  const parts: string[] = []
  if (days > 0) parts.push(plural(days, "day"))
  if (hours > 0) parts.push(plural(hours, "hour"))
  if (minutes > 0) parts.push(plural(minutes, "minute"))
  if (seconds > 0) parts.push(plural(seconds, "second"))

  return parts.length > 0 ? parts.join(" ") : "0 seconds"
}

/** Human-readable early/late/on-time message using exact timestamps in HCM. */
export function formatSubmissionTiming(
  submittedAt?: string | null,
  dueDate?: string | null,
): string | null {
  if (!submittedAt || !dueDate) return null

  const submitted = parseApiDateTime(submittedAt)
  const due = parseApiDateTime(dueDate)
  if (Number.isNaN(submitted.getTime()) || Number.isNaN(due.getTime())) return null

  const diffMs = submitted.getTime() - due.getTime()
  if (diffMs === 0) {
    return "You submitted on time"
  }

  const duration = formatDurationPrecise(diffMs)
  return diffMs < 0
    ? `You submitted ${duration} early`
    : `You submitted ${duration} late`
}
