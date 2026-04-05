// frontend/src/app/(app)/cronograma/page.tsx
'use client'
import { useCalc, fmtK, PHASES_DEF, TOTAL_MONTHS } from '@/hooks/useCalc'
import { useProjectStore } from '@/store/project.store'
import { Card, CardHeader, CardTitle, CardBody, KpiCard, EmptyState } from '@/components/ui'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default function CronogramaPage() {
  const calc    = useCalc()
  const current = useProjectStore(s => s.current)
  if (!current || !calc) return <EmptyState icon="📅" title="Nenhum projeto aberto" />

  const { phaseData, curM } = calc
  const activeCount = phaseData.filter(p => curM >= p.gs && curM < p.gs + p.dur).length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Duração Total"   value={`${TOTAL_MONTHS} meses`}  sub="início ao fim"              accent="#f0a500" />
        <KpiCard label="Mês Atual"       value={`M${current.config.curMonth}`} sub={`${MESES[(current.config.curMonth-1)%12]}`} accent="#3ecfb2" />
        <KpiCard label="Etapas Ativas"   value={String(activeCount)}       sub={`neste mês`}                 accent="#6c8fff" />
        <KpiCard label="Etapas Totais"   value="15"                         sub="fases da obra"              accent="#8892a4" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Diagrama de Gantt</CardTitle>
          <span className="font-mono text-[9px] text-tx3">Cronograma estimado · {TOTAL_MONTHS} meses</span>
        </CardHeader>
        <CardBody className="overflow-x-auto">
          <div style={{ minWidth: 700 }}>
            {/* Month headers */}
            <div className="flex mb-2 ml-44">
              {Array.from({ length: TOTAL_MONTHS }, (_, i) => (
                <div key={i} className={`flex-1 text-center font-mono text-[9px] border-l border-line py-1 ${i === curM ? 'text-amber bg-amber/5' : 'text-tx3'}`}>
                  M{i+1}<br />{MESES[i%12]}
                </div>
              ))}
            </div>
            {/* Gantt rows */}
            <div className="space-y-1.5">
              {phaseData.map((p, i) => {
                const left  = p.gs / TOTAL_MONTHS * 100
                const width = p.dur / TOTAL_MONTHS * 100
                const isActive = curM >= p.gs && curM < p.gs + p.dur
                const isDone   = curM >= p.gs + p.dur
                return (
                  <div key={i} className="flex items-center h-7">
                    <div className="w-44 flex-shrink-0 text-right pr-3 text-[10px] text-tx2 font-medium truncate" title={p.name}>
                      {p.name}
                    </div>
                    <div className="flex-1 h-full bg-bg3 rounded relative overflow-hidden">
                      {/* Current month marker */}
                      <div className="absolute top-0 bottom-0 w-px bg-amber/40 z-10"
                        style={{ left: `${(curM+0.5)/TOTAL_MONTHS*100}%` }} />
                      {/* Bar */}
                      <div
                        className="absolute top-1 bottom-1 rounded flex items-center px-2 overflow-hidden"
                        style={{
                          left: `${left}%`, width: `${width}%`,
                          background: isDone ? `${p.color}66` : isActive ? p.color : `${p.color}99`,
                          minWidth: 20,
                        }}
                      >
                        <span className="font-mono text-[9px] font-bold text-bg whitespace-nowrap">
                          {p.dur}m {isDone ? '✓' : isActive ? '▶' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="w-16 flex-shrink-0 pl-2 font-mono text-[9px] text-tx3 whitespace-nowrap">
                      {fmtK(p.total)}
                    </div>
                  </div>
                )
              })}
            </div>
            {/* Legend */}
            <div className="flex gap-4 mt-4 ml-44 font-mono text-[9px] text-tx3">
              <span>▶ Em andamento</span>
              <span>✓ Concluída</span>
              <span className="text-amber">│ Mês atual (M{current.config.curMonth})</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Phase list */}
      <Card>
        <CardHeader><CardTitle>Etapas por Período</CardTitle></CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {phaseData.map((p, i) => {
              const isActive = curM >= p.gs && curM < p.gs + p.dur
              const isDone   = curM >= p.gs + p.dur
              return (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${isActive ? 'border-amber/40 bg-amber/5' : isDone ? 'border-ok/20 bg-ok/5' : 'border-line2 bg-bg2'}`}>
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate">{p.name}</div>
                    <div className="font-mono text-[9px] text-tx3">
                      M{p.gs+1}–M{p.gs+p.dur} ({MESES[p.gs%12]}–{MESES[(p.gs+p.dur-1)%12]}) · {p.dur}m
                    </div>
                  </div>
                  <span className="text-[10px]">{isDone ? '✅' : isActive ? '🔵' : '⬜'}</span>
                </div>
              )
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
