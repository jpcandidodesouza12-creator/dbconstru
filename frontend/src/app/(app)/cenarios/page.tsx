// frontend/src/app/(app)/cenarios/page.tsx
'use client'
import { useCalc, fmtBRL, fmtK, COST_M2, MO_FACTOR, PHASES_DEF } from '@/hooks/useCalc'
import { useProjectStore } from '@/store/project.store'
import { Card, CardHeader, CardTitle, CardBody, KpiCard, EmptyState } from '@/components/ui'
import { BarChart } from '@/components/charts'

function scenCalc(sc: { area: number; std: 'low'|'med'|'high'; mo: 'empreiteira'|'proprio'; cont: number }) {
  const base = sc.area * COST_M2[sc.std] * MO_FACTOR[sc.mo]
  const moVal  = base * 0.45 // approx MO split
  const matVal = base - moVal
  const cont   = base * sc.cont / 100
  const grand  = base + cont
  return { base, moVal, matVal, cont, grand, perM2: grand / sc.area }
}

export default function CenariosPage() {
  const calc    = useCalc()
  const { current, setConfig } = useProjectStore()
  if (!current || !calc) return <EmptyState icon="⚖️" title="Nenhum projeto aberto" />

  const scenarios = current.config.scenarios || []
  const calcs     = scenarios.map(sc => scenCalc(sc))
  const base_c    = calcs[1] || calcs[0]

  const metrics: Array<{ k: keyof ReturnType<typeof scenCalc>; label: string; fmt: (v: number) => string }> = [
    { k: 'grand',  label: 'Total (c/ cont.)',  fmt: fmtK  },
    { k: 'base',   label: 'Custo Base',        fmt: fmtK  },
    { k: 'moVal',  label: 'Mão de Obra',       fmt: fmtK  },
    { k: 'matVal', label: 'Material',          fmt: fmtK  },
    { k: 'perM2',  label: 'R$/m²',            fmt: v => fmtBRL(v)+'/m²' },
  ]

  return (
    <div className="space-y-4">
      <div className="bg-amber/5 border border-amber/15 rounded-lg px-4 py-3 text-xs text-tx2">
        <strong className="text-amber">Comparador de Cenários:</strong> Compare 3 configurações lado a lado. O botão <strong>🔗 Usar</strong> ativa o cenário em todas as abas.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((sc, si) => {
          const c       = calcs[si]
          const isActive = current.config.activeScenario === si
          const allGrand = calcs.map(x => x.grand)
          const isBest   = c.grand === Math.min(...allGrand)
          const isWorst  = c.grand === Math.max(...allGrand)
          return (
            <Card key={si} accent={isActive ? '#f0a500' : undefined}>
              <CardBody>
                <div className="flex items-center justify-between mb-3">
                  <input
                    value={sc.name}
                    onChange={e => {
                      const s = [...scenarios]; s[si] = { ...s[si], name: e.target.value }
                      setConfig({ scenarios: s })
                    }}
                    className="font-condensed text-base font-bold uppercase bg-transparent border-b border-line2 focus:border-amber outline-none text-amber w-full mr-2"
                  />
                  <button
                    onClick={() => setConfig({ activeScenario: isActive ? null : si })}
                    className={`text-[9px] font-bold px-2 py-1 rounded border transition-all whitespace-nowrap ${isActive ? 'border-danger/40 text-danger bg-danger/8' : 'border-amber/30 text-amber bg-amber/8'}`}
                  >{isActive ? '✕ Soltar' : '🔗 Usar'}</button>
                </div>

                {/* Controls */}
                {[
                  { label: 'Área (m²)', min: 100, max: 220, step: 5, val: sc.area, key: 'area' as const },
                  { label: 'Contingência (%)', min: 5, max: 25, step: 1, val: sc.cont, key: 'cont' as const },
                ].map(ctrl => (
                  <div key={ctrl.key} className="mb-3">
                    <div className="flex justify-between mb-0.5">
                      <label className="font-mono text-[9px] text-tx3 uppercase tracking-widest">{ctrl.label}</label>
                      <span className="font-mono text-[10px] text-tx">{ctrl.val}{ctrl.key === 'cont' ? '%' : ' m²'}</span>
                    </div>
                    <input type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step} value={ctrl.val}
                      onChange={e => { const s = [...scenarios]; s[si] = { ...s[si], [ctrl.key]: +e.target.value }; setConfig({ scenarios: s }) }}
                      className="w-full" />
                  </div>
                ))}

                {/* Std */}
                <div className="mb-3">
                  <label className="font-mono text-[9px] text-tx3 uppercase tracking-widest block mb-1">Padrão</label>
                  <div className="flex gap-1">
                    {(['low','med','high'] as const).map(v => (
                      <button key={v}
                        onClick={() => { const s = [...scenarios]; s[si] = { ...s[si], std: v }; setConfig({ scenarios: s }) }}
                        className={`flex-1 py-1 text-[9px] font-bold rounded border transition-all ${sc.std===v ? 'bg-amber border-amber text-bg' : 'border-line2 text-tx2 hover:border-amber hover:text-amber'}`}>
                        {v==='low'?'Simples':v==='med'?'Médio':'Alto'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* MO */}
                <div className="mb-4">
                  <label className="font-mono text-[9px] text-tx3 uppercase tracking-widest block mb-1">Mão de Obra</label>
                  <div className="flex gap-1">
                    {(['empreiteira','proprio'] as const).map(v => (
                      <button key={v}
                        onClick={() => { const s = [...scenarios]; s[si] = { ...s[si], mo: v }; setConfig({ scenarios: s }) }}
                        className={`flex-1 py-1 text-[9px] font-bold rounded border transition-all ${sc.mo===v ? 'bg-amber border-amber text-bg' : 'border-line2 text-tx2 hover:border-amber hover:text-amber'}`}>
                        {v==='empreiteira'?'Empreit.':'Própria'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <div className="border-t border-line2 pt-3 space-y-2">
                  {metrics.map(m => {
                    const v    = c[m.k] as number
                    const ref  = base_c ? base_c[m.k] as number : v
                    const diff = si !== 1 && base_c ? ((v - ref) / ref * 100) : 0
                    const allV = calcs.map(x => x[m.k] as number)
                    const best = Math.min(...allV)
                    const worst= Math.max(...allV)
                    return (
                      <div key={m.k} className="flex items-baseline justify-between">
                        <span className="text-[10px] text-tx3">{m.label}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono text-xs font-semibold ${v===best?'text-ok':v===worst?'text-danger':''}`}>{m.fmt(v)}</span>
                          {si !== 1 && diff !== 0 && (
                            <span className={`font-mono text-[8px] px-1 rounded ${diff > 0 ? 'bg-danger/15 text-danger' : 'bg-ok/15 text-ok'}`}>
                              {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader><CardTitle>Comparativo Visual</CardTitle></CardHeader>
        <CardBody>
          <BarChart
            labels={scenarios.map(s => s.name)}
            datasets={[
              { label: 'Custo Base', data: calcs.map(c => c.base), backgroundColor: 'rgba(240,165,0,.7)', borderColor: '#f0a500', borderWidth: 1 },
              { label: 'Contingência', data: calcs.map(c => c.cont), backgroundColor: 'rgba(255,107,107,.5)', borderColor: '#ff6b6b', borderWidth: 1 },
            ]}
            height={220}
            stacked
          />
        </CardBody>
      </Card>
    </div>
  )
}
