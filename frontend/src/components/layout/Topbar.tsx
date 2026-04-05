// frontend/src/components/layout/Topbar.tsx  (replace)
'use client'
import { useProjectStore } from '@/store/project.store'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export function Topbar() {
  const router                                 = useRouter()
  const { current, isSaving, lastSavedAt }    = useProjectStore()
  const user                                  = useAuthStore(s => s.user)

  function handleExportJSON() {
    if (!current) return
    const blob = new Blob([JSON.stringify({ version: 4, exportedAt: new Date().toISOString(), project: current }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `dumb-construtor-${current.name.replace(/\s+/g,'-')}-${new Date().toISOString().slice(0,10)}.json`
    a.click(); URL.revokeObjectURL(a.href)
    toast.success('Projeto exportado!')
  }

  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 px-4 md:px-5 py-3 bg-bg1/90 backdrop-blur border-b border-line flex-wrap">
      {/* Project name + save */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {current ? (
          <>
            <button
              onClick={() => router.push('/projetos')}
              className="font-condensed text-base font-bold uppercase truncate hover:text-amber transition-colors"
            >
              {current.name}
            </button>
            <span className="font-mono text-[9px] text-tx3 whitespace-nowrap hidden sm:block">
              {isSaving ? '⏳ Salvando…' : lastSavedAt ? `✓ ${lastSavedAt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}` : ''}
            </span>
          </>
        ) : (
          <button
            onClick={() => router.push('/projetos')}
            className="font-condensed text-sm text-tx3 uppercase hover:text-amber transition-colors"
          >
            + Novo projeto
          </button>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {current && (
          <Button variant="secondary" size="sm" onClick={handleExportJSON} className="hidden sm:flex">
            💾 Exportar
          </Button>
        )}
        <Button variant="secondary" size="sm" onClick={() => window.print()} className="hidden md:flex">
          📄 PDF
        </Button>

        {/* Notifications */}
        <NotificationBell />

        {/* CUB badge */}
        <div className="bg-bg2 border border-line2 rounded-lg px-2.5 py-1.5 text-right hidden sm:block">
          <div className="font-mono text-[8px] text-tx3 uppercase tracking-wider">CUB-MS</div>
          <div className="font-mono text-xs font-semibold text-mo">R$1.787/m²</div>
        </div>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-amber flex items-center justify-center font-condensed text-xs font-bold text-bg flex-shrink-0 cursor-pointer"
          onClick={() => router.push('/projetos')}
          title={user?.name}>
          {user?.name?.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase() || '?'}
        </div>
      </div>
    </header>
  )
}
