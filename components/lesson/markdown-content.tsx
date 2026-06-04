"use client"

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function renderInline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
}

function renderMarkdown(content: string): string {
  const lines = content.split("\n")
  const html: string[] = []
  let inList = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith("### ")) {
      if (inList) { html.push("</ul>"); inList = false }
      html.push(`<h3>${renderInline(trimmed.slice(4))}</h3>`)
      continue
    }
    if (trimmed.startsWith("## ")) {
      if (inList) { html.push("</ul>"); inList = false }
      html.push(`<h2>${renderInline(trimmed.slice(3))}</h2>`)
      continue
    }
    if (trimmed.startsWith("# ")) {
      if (inList) { html.push("</ul>"); inList = false }
      html.push(`<h1>${renderInline(trimmed.slice(2))}</h1>`)
      continue
    }
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (!inList) { html.push("<ul>"); inList = true }
      html.push(`<li>${renderInline(trimmed.slice(2))}</li>`)
      continue
    }
    if (trimmed === "") {
      if (inList) { html.push("</ul>"); inList = false }
      html.push("<br />")
      continue
    }
    if (inList) { html.push("</ul>"); inList = false }
    html.push(`<p>${renderInline(trimmed)}</p>`)
  }

  if (inList) html.push("</ul>")
  return html.join("")
}

interface Props {
  content?: string
}

export function MarkdownContent({ content }: Props) {
  if (!content?.trim()) {
    return <p style={{ color: "var(--color-fg-muted)", fontSize: 14 }}>No content available.</p>
  }

  return (
    <div
      className="lesson-markdown"
      style={{ fontSize: 14, lineHeight: 1.7, color: "var(--color-fg)" }}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  )
}
