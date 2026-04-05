// frontend/src/components/notifications/NotificationBell.tsx
'use client'
import { useState, useRef, useEffect } from 'react'
import { useNotifications, AppNotification } from '@/hooks/useNotifications'

export function NotificationBell() {
  const { notifications, connected, unread, markRead, markAllRead, clearAll } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref  = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const typeIcon: Record<AppNotification['type'], string> = {
    project_updated: '📋', user_joined: '👤', comment_added: '💬',
    risk_updated: '⚠️', system: '🔔',
  }
  const typeColor: Record<AppNotification['type'], string> = {
    project_updated: '#f0a500', user_joined: '#3ecfb2', comment_added: '#6c8fff',
    risk_updated: '#fb923c', system: '#8892a4',
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 rounded-lg border border-line2 bg-bg2 flex items-center justify-center hover:border-amber transition-colors text-tx2 hover:text-amber"
        title={connected ? 'Notificações (conectado)' : 'Notificações (desconectado)'}
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full flex items-center justify-center font-mono text-[8px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
        {!connected && (
          <span className="absolute bottom-0 right-0 w-2 h-2 bg-tx3 rounded-full border border-bg" title="Desconectado" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-bg1 border border-line2 rounded-xl shadow-2xl z-50 overflow-hidden animate-slide-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-line">
            <div className="flex items-center gap-2">
              <span className="font-condensed text-sm font-bold uppercase">Notificações</span>
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-ok' : 'bg-tx3'}`} title={connected ? 'Conectado' : 'Desconectado'} />
            </div>
            <div className="flex gap-2">
              {unread > 0 && (
                <button onClick={markAllRead} className="font-mono text-[9px] text-amber hover:underline">Marcar todas</button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll} className="font-mono text-[9px] text-tx3 hover:text-danger">Limpar</button>
              )}
            </div>
          </div>

          {/* Notifications list */}
          <div className="max-h-80 overflow-y-auto divide-y divide-line/50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <div className="text-3xl mb-2">🔕</div>
                <div className="text-xs text-tx3">Nenhuma notificação</div>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors ${n.read ? 'opacity-60' : 'bg-white/[.015]'} hover:bg-white/[.03]`}
                  onClick={() => markRead(n.id)}
                >
                  <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm" style={{ background: `${typeColor[n.type]}22` }}>
                    {typeIcon[n.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-tx truncate">{n.title}</span>
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-amber flex-shrink-0" />}
                    </div>
                    <p className="text-[10px] text-tx3 mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                    <span className="font-mono text-[9px] text-tx3 mt-1 block">
                      {new Date(n.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
