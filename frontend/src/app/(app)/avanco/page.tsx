// frontend/src/app/(app)/avanco/page.tsx
'use client'
import { useCalc, fmtBRL, fmtK, PHASES_DEF, TOTAL_MONTHS } from '@/hooks/useCalc'
import { useProjectStore } from '@/store/project.store'
import { Card, CardHeader, CardTitle, CardBody, KpiCard, Table, Th, Td, EmptyState } from '@/components/ui'
import { LineChart } from '@/components/charts'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default function AvancoPage() {
  const calc    = useCalc()
  const { current, setConfig, setProgress } = useProjectStore()
  if (!current || !calc) return <EmptyState icon="📏" title="Nenhum projeto aberto" />

  const { phaseData, totalBase, totalExec, totalPlan, curM, moByMonth, matByMonth, planPct } = calc
  const execPct   = totalBase > 0 ? totalExec / totalBase * 100 : 0
  const planPctG  = totalBase > 0 ? totalPlan / totalBase * 100 : 0
  const desvio    = totalExec - totalPlan
  const totalByM  = moByMonth.map((v, i) => v + matByMonth[i])
  const planCum   = totalByM.reduce((a: number[], v, i) => [...a, (a[i-1]||0)+v], [])
  const realByM   = Array(TOTAL_MONTHS).fill(0)
  phaseData.forEach((p, i) => {
    for (let m = p.gs; m < p.gs + p.dur && m <= curM; m++) {
      realByM[m] += (p.total / p.dur) * (p.exec / 100)
    }
  })
  const realCum = realByM.reduce((a: number[], v, i) => [...a, (a[i-1]||0)+v], [])

  return (
    <div className="space-y-4">
      {/* Month slider */}
      <Card>
        <CardHeader><CardTitle>Mês Atual da Obra</CardTitle></CardHeader>
        <CardBody>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="font-mono text-4xl font-bold text-amber">M{current.config.curMonth}</div>
            <div className="flex-1 min-w-48">
              <input
                type="range" min="1" max={TOTAL_MONTHS} step="1"
                value={current.config.curMonth}
                onChange={e => setConfig({ curMonth: +e.target.value })}
                className="w-full"
              />
              <div className="flex justify-between font-mono text-[9px] text-tx3 mt-1"><span>M1</span><span>M{TOTAL_MONTHS}</span></div>
            </div>
            <div className="text-xs text-tx3">
              Etapas ativas:<br />
              <span className="text-tx2">{phaseData.filter(p => curM >= p.gs && curM < p.gs + p.dur).map(p => p.name).join(', ') || '—'}</span>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Orçado Total"        value={fmtK(totalBase)}  sub="custo base"                         accent="#8892a4" />
        <KpiCard label="Realizado"           value={fmtK(totalExec)}  sub={`${execPct.toFixed(1)}% do orçado`} accent="#3ecfb2" progress={execPct} />
        <KpiCard label={`Planejado (M${current.config.curMonth})`} value={fmtK(totalPlan)} sub={`${planPctG.toFixed(1)}% do orçado`} accent="#8892a4" progress={planPctG} />
        <KpiCard label="Desvio Global"       value={(desvio > 0 ? '+' : '') + fmtK(desvio)} sub={desvio > 0 ? 'acima do plano' : desvio < 0 ? 'abaixo do plano' : 'no plano'} accent={desvio > 0 ? '#ff6b6b' : desvio < 0 ? '#4cde8a' : '#8892a4'} />
      </div>

      {/* S-curve */}
      <Card>
        <CardHeader><CardTitle>Curva S — Planejado vs Realizado</CardTitle><span className="font-mono text-[9px] text-tx3">acumulado mês a mês</span></CardHeader>
        <CardBody>
          <LineChart
            labels={Array.from({ length: TOTAL_MONTHS }, (_, i) => `M${i+1} ${MESES[i%12]}`)}
            datasets={[
              { label: 'Planejado',  data: planCum,                      borderColor: '#8892a4', backgroundColor: 'rgba(136,146,164,.1)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 1 },
              { label: 'Realizado',  data: realCum.map((v, i) => i <= curM ? v : null), borderColor: '#f0a500', backgroundColor: 'rgba(240,165,0,.08)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 3 },
            ]}
            height={240}
          />
        </CardBody>
      </Card>

      {/* Phase progress table */}
      <Card>
        <CardHeader><CardTitle>Avanço por Etapa</CardTitle><span className="font-mono text-[9px] text-tx3">insira o % executado real</span></CardHeader>
        <Table>
          <thead><tr><Th>Etapa</Th><Th center>Planejado</Th><Th center>Executado</Th><Th right>Orçado</Th><Th right>Realizado</Th><Th right>Desvio</Th><Th center>Status</Th></tr></thead>
          <tbody>
            {phaseData.map((p, i) => {
              const plan  = planPct(p)
              const orc   = p.total
              const real  = p.total * (p.exec / 100)
              const dev   = real - orc * (plan / 100)
              const status = p.exec >= 100 ? '✅' : p.exec > plan ? '🟡' : p.exec > 0 ? '🔵' : plan > 0 ? '⚠️' : '⬜'
              return (
                <tr key={i} className="hover:bg-white/[.01]">
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                      <div>
                        <div className="text-xs font-semibold">{p.name}</div>
                        {/* Double progress bar */}
                        <div className="w-28 mt-1 space-y-0.5">
                          <div className="h-1 bg-line2 rounded-full overflow-hidden"><div className="h-full bg-tx3 rounded-full" style={{ width: `${plan}%` }} /></div>
                          <div className="h-1 bg-line2 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${p.exec}%`, background: p.color }} /></div>
                        </div>
                      </div>
                    </div>
                  </Td>
                  <Td center><span className="font-mono text-[10px] text-tx3">{plan}%</span></Td>
                  <Td center onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1 justify-center">
                      <input
                        type="number" min="0" max="100" value={p.exec}
                        onChange={e => setProgress(i, Math.min(100, Math.max(0, +e.target.value)))}
                        className="w-14 bg-bg2 border border-line2 rounded px-2 py-1 font-mono text-[11px] text-center text-tx outline-none focus:border-amber"
                      />
                      <span className="font-mono text-[10px] text-tx3">%</span>
                    </div>
                  </Td>
                  <Td right><span className="font-mono text-[11px]">{fmtK(orc)}</span></Td>
                  <Td right><span className="font-mono text-[11px] text-mo">{fmtK(real)}</span></Td>
                  <Td right>
                    <span className={`font-mono text-[11px] ${dev > 0 ? 'text-danger' : dev < 0 ? 'text-ok' : 'text-tx3'}`}>
                      {dev !== 0 ? (dev > 0 ? '+' : '') + fmtK(dev) : '—'}
                    </span>
                  </Td>
                  <Td center><span className="text-sm">{status}</span></Td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </Card>
    </div>
  )
}
