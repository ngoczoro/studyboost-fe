function parseDate(date: string | Date): Date {
  if (typeof date === "string") {
    let datestr = date.trim()
    // Nếu chuỗi rỗng hoặc lỗi, trả về Date hiện tại
    if (!datestr) return new Date()
    // Đảm bảo định dạng có chữ T nếu chứa khoảng trắng phân tách
    if (datestr.length >= 10 && !datestr.includes("T") && datestr.includes(" ")) {
      datestr = datestr.replace(" ", "T")
    }
    // Nếu chuỗi không chứa múi giờ chỉ định (Z hoặc +xx:xx), tự động coi là giờ GMT+7
    if (!datestr.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(datestr)) {
      datestr = datestr.includes("T") ? `${datestr}+07:00` : `${datestr}T00:00:00+07:00`
    }
    const parsed = new Date(datestr)
    return isNaN(parsed.getTime()) ? new Date() : parsed
  }
  return date
}

export function relative(date: string | Date): string {
  const d = parseDate(date)
  const diff = Date.now() - d.getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return "just now"
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const days = Math.floor(hr / 24)
  if (days < 7) return `${days}d ago`
  return date_(d)
}

export function date_(d: string | Date): string {
  const dt = parseDate(d)
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function time_(d: string | Date): string {
  const dt = parseDate(d)
  return dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

export function bytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`
  return `${(n / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join("")
}
