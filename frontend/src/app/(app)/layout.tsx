// frontend/src/app/(app)/layout.tsx  (replace)
'use client'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { useProjectStore } from '@/store/project.store'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

const ONBOARDING_KEY = 'dc_onboarding_done'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [showOnboard, setShowOnboard] = useState(false)
  const { fetchMe }                   = useAuthStore()
  const { fetchProjects, projects, isLoading } = useProjectStore()

  useEffect(() => {
    fetchMe()
    fetchProjects()
  }, [fetchMe, fetchProjects])

  useEffect(() => {
    if (isLoading) return
    const done = typeof window !== 'undefined' && localStorage.getItem(ONBOARDING_KEY)
    if (!done && projects.length === 0) setShowOnboard(true)
  }, [isLoading, projects.length])

  function completeOnboarding() {
    if (typeof window !== 'undefined') localStorage.setItem(ONBOARDING_KEY, '1')
    setShowOnboard(false)
  }

  return (
    <div className="flex min-h-screen relative z-10">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex-1 min-w-0 md:ml-16">
        {/* Mobile topbar with hamburger */}
        <div className="flex items-center gap-3 px-4 py-3 bg-bg1/90 backdrop-blur border-b border-line md:hidden sticky top-0 z-40">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-line2 text-tx2 hover:text-amber hover:border-amber transition-colors"
          >☰</button>
          <span className="font-condensed text-sm font-bold uppercase">Dumb <span className="text-amber">Construtor</span></span>
        </div>

        <Topbar />
        <main className="p-4 md:p-5">{children}</main>
      </div>

      {showOnboard && <OnboardingWizard onComplete={completeOnboarding} />}
    </div>
  )
}
