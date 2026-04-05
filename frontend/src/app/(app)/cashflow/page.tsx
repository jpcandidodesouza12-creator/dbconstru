// frontend/src/app/(app)/cashflow/page.tsx
'use client'
import { useCalc, fmtBRL, fmtK, PHASES_DEF, TOTAL_MONTHS } from '@/hooks/useCalc'
import { useProjectStore } from '@/store/project.store'
import { Card, CardHeader, CardTitle, CardBody, KpiCard, Table, Th, Td, EmptyState } from '@/components/ui'
import { BarChart } from '@/components/charts'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default function CashflowPage() {
  const calc    = useCalc()
  const current = useProjectStore(s => s.current)
  if (!current || !calc) return <EmptyState icon="💰" title="Nenhum projeto aberto" />

  const { moByMonth, matByMonth, totalByMonth, cumByMonth, totalBase, totalMo, totalMat } = calc
  const peakMonth = totalByMonth.indexOf(Math.max(...totalByMonth))
  const avgMonth  = totalByMonth.reduce((a, v) => a + v, 0) / TOTAL_MONTHS

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Custo Base Total" value={fmtK(totalBase)} sub="total da obra" accent="#f0a500" />
        <KpiCard label="MO Total"         value={fmtK(totalMo)}   sub={`${(totalMo/totalBase*100).toFixed(0)}% do total`} accent="#3ecfb2" />
        <KpiCard label="Material Total"   value={fmtK(totalMat)}  sub={`${(totalMat/totalBase*100).toFixed(0)}% do total`} accent="#6c8fff" />
        <KpiCard label="Mês Pico"         value={`M${peakMonth+1} ${MESES[peakMonth%12]}`} sub={fmtK(totalByMonth[peakMonth])} accent="#fb923c" />
      </div>

      <Card>
        <CardHeader><CardTitle>Fluxo de Caixa Mensal</CardTitle><span className="font-mono text-[9px] text-tx3">MO + Material por mês · linha = acumulado</span></CardHeader>
        <CardBody>
          <BarChart
            labels={Array.from({ length: TOTAL_MONTHS }, (_, i) => `M${i+1} ${MESES[i%12]}`)}
            datasets={[
              { label: 'Mão de Obra', data: moByMonth,  backgroundColor: 'rgba(62,207,178,.7)',  stack: 's' },
              { label: 'Material',    data: matByMonth, backgroundColor: 'rgba(108,143,255,.7)', stack: 's' },
              { label: 'Acumulado',   data: cumByMonth, type: 'line', borderColor: '#f0a500', backgroundColor: 'rgba(240,165,0,.06)', fill: true, yAxisID: 'y2', tension: 0.4, borderWidth: 2, pointRadius: 2 },
            ]}
            height={260}
            stacked
            y2
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Tabela de Desembolso</CardTitle></CardHeader>
        <Table>
          <thead>
            <tr>
              <Th>Mês</Th>
              <Th right>MO (R$)</Th>
              <Th right>Material (R$)</Th>
              <Th right>Total Mês</Th>
              <Th right>% do Total</Th>
              <Th right>Acumulado</Th>
              <Th>Etapas Ativas</Th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: TOTAL_MONTHS }, (_, m) => {
              const active = PHASES_DEF.filter(p => m >= p.gs && m < p.gs + p.dur)
              return (
                <tr key={m} className={`hover:bg-white/[.01] ${m === peakMonth ? 'bg-orange-500/5' : ''}`}>
                  <Td><span className="font-mono text-xs font-semibold">M{m+1} {MESES[m%12]}</span></Td>
                  <Td right><span className="font-mono text-[11px] text-mo">{fmtK(moByMonth[m])}</span></Td>
                  <Td right><span className="font-mono text-[11px] text-mat">{fmtK(matByMonth[m])}</span></Td>
                  <Td right><span className={`font-mono text-xs font-semibold ${m===peakMonth?'text-orange-400':''}`}>{fmtK(totalByMonth[m])}</span></Td>
                  <Td right><span className="font-mono text-[10px] text-tx3">{(totalByMonth[m]/totalBase*100).toFixed(1)}%</span></Td>
                  <Td right><span className="font-mono text-[11px] text-amber">{fmtK(cumByMonth[m])}</span></Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {active.map(p => (
                        <span key={p.name} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${p.color}22`, color: p.color }}>
                          {p.name.split(' ')[0]}
                        </span>
                      ))}
                    </div>
                  </Td>
                </tr>
              )
            })}
            <tr className="bg-bg2 font-bold">
              <td className="px-3 py-2.5 font-condensed uppercase text-amber text-sm">TOTAL</td>
              <td className="px-3 py-2.5 text-right font-mono text-xs text-mo">{fmtBRL(totalMo)}</td>
              <td className="px-3 py-2.5 text-right font-mono text-xs text-mat">{fmtBRL(totalMat)}</td>
              <td className="px-3 py-2.5 text-right font-mono text-sm text-amber">{fmtBRL(totalBase)}</td>
              <td className="px-3 py-2.5 text-right font-mono text-xs text-tx3">100%</td>
              <td colSpan={2} />
            </tr>
          </tbody>
        </Table>
      </Card>
    </div>
  )
}
