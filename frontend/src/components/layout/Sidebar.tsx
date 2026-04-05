// frontend/src/components/layout/Sidebar.tsx  (replace - mobile responsive)
'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { DogLogo } from '@/components/ui/DogLogo'

const NAV = [
  { href: '/dashboard',    icon: '🏠', label: 'Dashboard'       },
  { href: '/projetos',     icon: '🗂️', label: 'Projetos'        },
  { href: '/etapas',       icon: '📋', label: 'Etapas'          },
  { href: '/bdi',          icon: '📐', label: 'Calc. BDI'       },
  { href: '/abc',          icon: '📊', label: 'Curva ABC'       },
  { href: '/cashflow',     icon: '💰', label: 'Fluxo de Caixa'  },
  { href: '/composicoes',  icon: '🔩', label: 'Composições CPU' },
  { href: '/cronograma',   icon: '📅', label: 'Cronograma'      },
  { href: '/cenarios',     icon: '⚖️',  label: 'Cenários'       },
  { href: '/avanco',       icon: '📏', label: 'Avanço Físico'   },
  { href: '/pagamentos',   icon: '💳', label: 'Pagamentos'      },
  { href: '/riscos',       icon: '⚠️',  label: 'Riscos'         },
  { href: '/fornecedores', icon: '🏪', label: 'Fornecedores'    },
  { href: '/diario',       icon: '📝', label: 'Diário de Obra'  },
]
const ADMIN_NAV = [{ href: '/admin', icon: '🛡️', label: 'Painel Admin' }]

interface SidebarProps { mobileOpen?: boolean; onMobileClose?: () => void }

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const user     = useAuthStore(s => s.user)
  const logout   = useAuthStore(s => s.logout)
  const isAdmin  = user?.role === 'ADMIN'
  const initials = user?.name?.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() || '?'

  async function handleLogout() { await logout(); router.push('/auth/login') }
  function go(href: string) { router.push(href); onMobileClose?.() }

  function NavItems({ items }: { items: typeof NAV }) {
    return (
      <>
        {items.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
          return (
            <button key={item.href} onClick={() => go(item.href)}
              className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-all relative whitespace-nowrap overflow-hidden
                ${active ? 'bg-amber/10 text-amber before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-amber before:rounded-r' : 'text-tx2 hover:bg-white/[.04] hover:text-tx'}`}>
              <span className="text-base w-5 text-center flex-shrink-0 leading-none">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </>
    )
  }

  function SidebarInner({ collapsed }: { collapsed: boolean }) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-3.5 py-4 border-b border-line flex-shrink-0 min-h-[68px] overflow-hidden">
          <DogLogo size={36} />
          {!collapsed && (
            <div><div className="font-condensed text-sm font-bold uppercase">Dumb <span className="text-amber">Construtor</span></div>
            <div className="font-mono text-[9px] text-tx3 mt-0.5">Campo Grande · MS</div></div>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto py-2 scrollbar-none">
          {!collapsed && <div className="font-mono text-[9px] text-tx3 uppercase tracking-widest px-4 py-2">Orçamento</div>}
          {collapsed
            ? NAV.concat(isAdmin ? ADMIN_NAV : []).map(item => {
                const active = pathname === item.href
                return (
                  <button key={item.href} onClick={() => go(item.href)} title={item.label}
                    className={`flex items-center justify-center w-full py-2.5 transition-all ${active ? 'bg-amber/10 text-amber' : 'text-tx3 hover:text-tx hover:bg-white/[.04]'}`}>
                    <span className="text-base">{item.icon}</span>
                  </button>
                )
              })
            : (
              <>
                <NavItems items={NAV} />
                {isAdmin && (
                  <>
                    <div className="font-mono text-[9px] text-tx3 uppercase tracking-widest px-4 pt-4 pb-2">Admin</div>
                    <NavItems items={ADMIN_NAV} />
                  </>
                )}
              </>
            )}
        </nav>
        <div className="border-t border-line flex-shrink-0 overflow-hidden">
          <div className={`flex items-center gap-2.5 px-3.5 py-2.5 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-amber flex items-center justify-center font-condensed text-sm font-bold text-bg flex-shrink-0">{initials}</div>
            {!collapsed && (
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-tx truncate">{user?.name}</div>
                <div className="font-mono text-[9px] text-tx3">{isAdmin ? 'Admin' : 'Usuário'}</div>
              </div>
            )}
          </div>
          <button onClick={handleLogout} title="Sair"
            className={`flex items-center gap-3 w-full text-tx3 hover:text-danger hover:bg-danger/5 transition-all py-2 ${collapsed ? 'justify-center px-0' : 'px-4'}`}>
            <span className="text-sm flex-shrink-0">🚪</span>
            {!collapsed && <span className="text-xs font-medium">Sair</span>}
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* ── DESKTOP: hover to expand ── */}
      <aside className="fixed top-0 left-0 h-screen z-50 hidden md:flex flex-col bg-bg1 border-r border-line overflow-hidden w-16 hover:w-60 transition-[width] duration-300 ease-[cubic-bezier(.4,0,.2,1)] group">
        <div className="flex items-center gap-3 px-3.5 py-4 border-b border-line flex-shrink-0 min-h-[68px] overflow-hidden">
          <DogLogo size={36} />
          <div className="whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="font-condensed text-sm font-bold uppercase">Dumb <span className="text-amber">Construtor</span></div>
            <div className="font-mono text-[9px] text-tx3 mt-0.5">Campo Grande · MS</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-2 scrollbar-none">
          <div className="font-mono text-[9px] text-tx3 uppercase tracking-widest px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Orçamento</div>
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
            return (
              <button key={item.href} onClick={() => go(item.href)}
                className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-all relative whitespace-nowrap overflow-hidden
                  ${active ? 'bg-amber/10 text-amber before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-amber' : 'text-tx2 hover:bg-white/[.04] hover:text-tx'}`}>
                <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">{item.label}</span>
              </button>
            )
          })}
          {isAdmin && (
            <>
              <div className="font-mono text-[9px] text-tx3 uppercase tracking-widest px-4 pt-4 pb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Admin</div>
              {ADMIN_NAV.map(item => {
                const active = pathname === item.href
                return (
                  <button key={item.href} onClick={() => go(item.href)}
                    className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-all relative whitespace-nowrap overflow-hidden ${active ? 'bg-amber/10 text-amber' : 'text-tx2 hover:bg-white/[.04] hover:text-tx'}`}>
                    <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                    <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">{item.label}</span>
                  </button>
                )
              })}
            </>
          )}
        </nav>
        <div className="border-t border-line flex-shrink-0 overflow-hidden">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5">
            <div className="w-8 h-8 rounded-full bg-amber flex items-center justify-center font-condensed text-sm font-bold text-bg flex-shrink-0">{initials}</div>
            <div className="overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="text-xs font-semibold text-tx truncate">{user?.name}</div>
              <div className="font-mono text-[9px] text-tx3">{isAdmin ? 'Admin' : 'Usuário'}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-tx3 hover:text-danger hover:bg-danger/5 transition-all whitespace-nowrap">
            <span className="text-sm flex-shrink-0">🚪</span>
            <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">Sair</span>
          </button>
        </div>
      </aside>

      {/* ── MOBILE: overlay drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="relative w-64 bg-bg1 border-r border-line h-full overflow-hidden flex flex-col animate-slide-in">
            <SidebarInner collapsed={false} />
          </aside>
        </div>
      )}
    </>
  )
}
