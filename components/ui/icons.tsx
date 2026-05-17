interface IconProps {
  size?: number
  color?: string
  className?: string
}

const props = (size: number, color: string) => ({
  width: size, height: size, viewBox: "0 0 24 24",
  fill: "none", stroke: color, strokeWidth: 1.75,
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
})

export function HomeIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>
}
export function UsersIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 21v-2a4 4 0 00-3-3.85"/></svg>
}
export function BookIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
}
export function ShieldIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
}
export function BellIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
}
export function ClipboardCheckIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><path d="M9 12l2 2 4-4"/></svg>
}
export function MegaphoneIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
}
export function CalendarIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
}
export function GradCapIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><polygon points="12 2 22 8.5 12 15 2 8.5 12 2"/><path d="M7 11.5V17.5c0 1.5 2.25 3 5 3s5-1.5 5-3v-6"/><path d="M22 8.5V15"/></svg>
}
export function SearchIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
}
export function PlusIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><path d="M12 5v14M5 12h14"/></svg>
}
export function CheckIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><path d="M20 6L9 17l-5-5"/></svg>
}
export function XIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><path d="M18 6L6 18M6 6l12 12"/></svg>
}
export function ChevronDownIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><path d="M6 9l6 6 6-6"/></svg>
}
export function ChevronRightIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><path d="M9 18l6-6-6-6"/></svg>
}
export function ChevronLeftIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><path d="M15 18l-6-6 6-6"/></svg>
}
export function ArrowLeftIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
}
export function MoreIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
}
export function EditIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
}
export function TrashIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
}
export function FilterIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
}
export function EyeIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
}
export function PinIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
}
export function UploadIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
}
export function DownloadIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
}
export function PlayIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><polygon points="5 3 19 12 5 21 5 3"/></svg>
}
export function FileIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
}
export function DocIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
}
export function MailIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>
}
export function LockIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
}
export function LogoutIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
}
export function CommentIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
}
export function StarIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
}
export function ClipboardListIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><path d="M9 12h6M9 16h4"/></svg>
}
export function DragIcon({ size = 20, color = "currentColor", className }: IconProps) {
  return <svg {...props(size, color)} className={className}><circle cx="9" cy="7" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="17" r="1"/><circle cx="15" cy="7" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="17" r="1"/></svg>
}
