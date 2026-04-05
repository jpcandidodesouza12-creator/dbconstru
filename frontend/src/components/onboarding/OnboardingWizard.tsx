// frontend/src/components/onboarding/OnboardingWizard.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProjectStore } from '@/store/project.store'
import { useAuthStore } from '@/store/auth.store'
import { DogLogo } from '@/components/ui/DogLogo'
import { Button } from '@/components/ui'
import toast from 'react-hot-toast'

const STEPS = [
  {
    title: 'Bem-vindo ao Dumb Construtor!',
    sub: 'Seu sistema de orçamento de obras residenciais',
    icon: '🐕',
    content: (
      <div className="space-y-4 text-sm text-tx2">
        <p>Com o <strong className="text-amber">Dumb Construtor</strong> você planeja, orça e acompanha a construção da sua casa do início ao fim.</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['📋','Etapas da Obra','15 fases com MO e Material separados'],
            ['📊','Curva ABC','Identifique onde está o dinheiro'],
            ['💰','Fluxo de Caixa','Planeje mês a mês'],
            ['📏','Avanço Físico','Acompanhe o progresso real'],
            ['⚠️','Mapa de Riscos','Antecipe problemas'],
            ['🏪','Fornecedores','Compare cotações e abra lojas'],
          ].map(([icon, title, desc]) => (
            <div key={title} className="bg-bg2 border border-line2 rounded-lg p-3">
              <div className="text-xl mb-1">{icon}</div>
              <div className="text-xs font-semibold text-tx">{title}</div>
              <div className="text-[10px] text-tx3 mt-0.5">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    title: 'Como funciona?',
    sub: 'Em 3 passos simples',
    icon: '🔧',
    content: (
      <div className="space-y-4">
        {[
          { n: '1', t: 'Configure seu projeto', d: 'Defina a área, padrão de acabamento e tipo de mão de obra no painel de controles no topo de cada página.', color: '#f0a500' },
          { n: '2', t: 'Edite as etapas', d: 'Clique em ✏ em qualquer etapa para ajustar o custo total e a divisão entre Mão de Obra e Material.', color: '#3ecfb2' },
          { n: '3', t: 'Acompanhe a obra', d: 'Na aba Avanço Físico, insira o % executado de cada fase. A Curva S mostra planejado vs realizado automaticamente.', color: '#6c8fff' },
        ].map(s => (
          <div key={s.n} className="flex gap-4 items-start">
            <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-condensed font-bold text-bg text-lg" style={{ background: s.color }}>{s.n}</div>
            <div>
              <div className="text-sm font-semibold text-tx">{s.t}</div>
              <div className="text-xs text-tx3 mt-0.5 leading-relaxed">{s.d}</div>
            </div>
          </div>
        ))}
      </div>
    )
  },
  {
    title: 'Vamos criar seu primeiro projeto?',
    sub: 'Leva menos de 1 minuto',
    icon: '🏠',
    content: null, // handled separately with input
  },
]

interface OnboardingWizardProps { onComplete: () => void }

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step,     setStep]     = useState(0)
  const [projName, setProjName] = useState('')
  const [loading,  setLoading]  = useState(false)
  const { createProject }       = useProjectStore()
  const user                    = useAuthStore(s => s.user)
  const router                  = useRouter()

  async function handleFinish() {
    const name = projName.trim() || `Projeto de ${user?.name?.split(' ')[0] || 'Obra'}`
    setLoading(true)
    try {
      await createProject(name)
      toast.success('Projeto criado! Bem-vindo 🎉')
      onComplete()
      router.push('/dashboard')
    } catch { toast.error('Erro ao criar projeto') }
    finally { setLoading(false) }
  }

  const cur = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/95 backdrop-blur px-4">
      <div className="w-full max-w-lg bg-bg1 border border-line2 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Progress bar */}
        <div className="h-1 bg-line2">
          <div className="h-full bg-amber transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>

        <div className="p-8">
          {/* Logo + step indicator */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <DogLogo size={36} />
              <div>
                <div className="font-condensed text-sm font-bold uppercase text-amber">Dumb Construtor</div>
                <div className="font-mono text-[9px] text-tx3">Primeiro acesso</div>
              </div>
            </div>
            <div className="font-mono text-[10px] text-tx3">{step + 1}/{STEPS.length}</div>
          </div>

          {/* Content */}
          <div className="text-3xl mb-2">{cur.icon}</div>
          <h2 className="font-condensed text-xl font-bold uppercase mb-1">{cur.title}</h2>
          <p className="text-sm text-tx2 mb-6">{cur.sub}</p>

          {cur.content}

          {/* Last step - project name input */}
          {isLast && (
            <div className="space-y-3 mt-4">
              <label className="font-mono text-[9px] text-tx3 uppercase tracking-widest block">Nome do projeto</label>
              <input
                autoFocus
                value={projName}
                onChange={e => setProjName(e.target.value)}
                placeholder={`Casa de ${user?.name?.split(' ')[0] || 'Fulano'} — Campo Grande`}
                onKeyDown={e => e.key === 'Enter' && !loading && handleFinish()}
                className="w-full bg-bg2 border border-line2 rounded-lg px-4 py-3 text-sm text-tx outline-none focus:border-amber transition-colors"
              />
              <p className="text-[10px] text-tx3">Você pode renomear a qualquer momento na página de Projetos.</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <Button variant="secondary" onClick={() => setStep(s => s - 1)}>← Voltar</Button>
            )}
            <div className="flex-1" />
            {isLast ? (
              <Button onClick={handleFinish} loading={loading}>
                Criar projeto e começar →
              </Button>
            ) : (
              <Button onClick={() => setStep(s => s + 1)}>
                Próximo →
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
