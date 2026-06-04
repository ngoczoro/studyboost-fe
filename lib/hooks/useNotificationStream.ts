"use client"

import { useEffect, useRef } from "react"

export interface StreamNotif {
  id: number
  type: string
  data?: string | null
  isRead: boolean
  createdAt?: string | null
}

export function useNotificationStream(onNotification: (n: StreamNotif) => void) {
  const callbackRef = useRef(onNotification)
  callbackRef.current = onNotification

  useEffect(() => {
    let es: EventSource | null = null
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let dead = false

    function connect() {
      if (dead) return
      es = new EventSource("/api/notifications/stream")

      es.addEventListener("notification", (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data as string) as StreamNotif
          callbackRef.current(data)
        } catch {
          // malformed event — ignore
        }
      })

      es.onerror = () => {
        es?.close()
        es = null
        if (!dead) {
          retryTimer = setTimeout(connect, 5_000)
        }
      }
    }

    connect()

    return () => {
      dead = true
      if (retryTimer) clearTimeout(retryTimer)
      es?.close()
    }
  }, []) // stable via ref — intentional empty deps
}
