// frontend/src/hooks/useNotifications.ts
import { useEffect, useRef, useState, useCallback } from 'react'
import Cookies from 'js-cookie'

export interface AppNotification {
  id: string
  type: 'project_updated' | 'user_joined' | 'comment_added' | 'risk_updated' | 'system'
  title: string
  body: string
  read: boolean
  timestamp: string
}

const WS_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000')
  .replace('http', 'ws')
  .replace('https', 'wss')

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [connected,     setConnected]     = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const retryRef = useRef<ReturnType<typeof setTimeout>>()

  const connect = useCallback(() => {
    const token = Cookies.get('access_token')
    if (!token || typeof window === 'undefined') return

    const ws = new WebSocket(`${WS_URL}/ws?token=${token}`)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      clearTimeout(retryRef.current)
    }

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === 'connected' || msg.type === 'pong') return

        const notif: AppNotification = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          type: msg.type || 'system',
          title: titleFor(msg.type),
          body: msg.payload?.message || JSON.stringify(msg.payload),
          read: false,
          timestamp: msg.timestamp || new Date().toISOString(),
        }
        setNotifications(prev => [notif, ...prev].slice(0, 50))
      } catch { /* ignore */ }
    }

    ws.onclose = () => {
      setConnected(false)
      // Reconnect after 5s
      retryRef.current = setTimeout(connect, 5_000)
    }

    ws.onerror = () => ws.close()
  }, [])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(retryRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const clearAll = useCallback(() => setNotifications([]), [])

  const unread = notifications.filter(n => !n.read).length

  return { notifications, connected, unread, markRead, markAllRead, clearAll }
}

function titleFor(type: string): string {
  const map: Record<string, string> = {
    project_updated: 'Projeto atualizado',
    user_joined:     'Novo usuário',
    comment_added:   'Novo comentário',
    risk_updated:    'Risco atualizado',
    system:          'Notificação do sistema',
  }
  return map[type] || 'Notificação'
}
