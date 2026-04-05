// frontend/src/app/(app)/abc/page.tsx
'use client'
import { useMemo } from 'react'
import { useCalc, fmtBRL, fmtK, PHASES_DEF } from '@/hooks/useCalc'
import { Card, CardHeader, CardTitle, CardBody, KpiCard, Table, Th, Td, EmptyState, Badge } from '@/components/ui'
import { BarChart } from '@/components/charts'
import { useProjectStore } from '@/store/project.store'

export default function ABCPage() {
  const calc    = useCalc()
  const current = useProjectStore(s => s.current)

  const abc = useMemo(() => {
    if (!calc) return []
    const { phaseData, totalBase } = calc
    const sorted = [...phaseData].map((p, i) => ({ ...p, origIdx: i })).sort((a, b) => b.total - a.total)
    let acc = 0
    return sorted.map((p, rank) => {
      const pp = p.total / totalBase * 100
      acc += pp
      return { ...p, rank: rank + 1, pp, acc, cls: acc <= 50 ? 'A' : acc <= 80 ? 'B' : 'C' }
    })
  }, [calc])

  if (!current || !calc) return <EmptyState icon="📊" title="Nenhum projeto aberto" />

  const { totalBase, totalMo, totalMat } = calc
  const classA = abc.filter(r => r.cls === 'A')
  const classB = abc.filter(r => r.cls === 'B')
  const classC = abc.filter(r => r.cls === 'C')

  const grp = {
    A: { mo: classA.reduce((a, p) => a + p.moVal, 0), mat: classA.reduce((a, p) => a + p.matVal, 0) },
    B: { mo: classB.reduce((a, p) => a + p.moVal, 0), mat: classB.reduce((a, p) => a + p.matVal, 0) },
    C: { mo: classC.reduce((a, p) => a + p.moVal, 0), mat: classC.reduce((a, p) => a + p.matVal, 0) },
  }

  const clsColor = { A: '#f0a500', B: '#3ecfb2', C: '#6c8fff' }
  const clsLabel = { A: 'Alto impacto', B: 'Médio impacto', C: 'Baixo impacto' }

  return (
    <div className="space-y-4">
      <div className="bg-amber/5 border border-amber/15 rounded-lg px-4 py-3 text-xs text-tx2">
        <strong className="text-amber">Curva ABC:</strong> Princípio de Pareto — 20% das etapas representam ~80% dos custos.
        Use para priorizar negociações com fornecedores e controle de custos. Ref.: SINAPI/Caixa, ABNT NBR 12721.
      </div>

      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Classe A — 0–50%" value={`${classA.length} etapa${classA.length!==1?'s':''}`} sub={`${fmtK(classA.reduce((a,p)=>a+p.total,0))} · prioridade máxima`} accent="#f0a500" />
        <KpiCard label="Classe B — 50–80%" value={`${classB.length} etapa${classB.length!==1?'s':''}`} sub={`${fmtK(classB.reduce((a,p)=>a+p.total,0))} · atenção moderada`} accent="#3ecfb2" />
        <KpiCard label="Classe C — 80–100%" value={`${classC.length} etapa${classC.length!==1?'s':''}`} sub={`${fmtK(classC.reduce((a,p)=>a+p.total,0))} · controle padrão`} accent="#6c8fff" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ranking ABC</CardTitle>
          <span className="font-mono text-[9px] text-tx3">ordenado por impacto financeiro</span>
        </CardHeader>
        <Table>
          <thead>
            <tr>
              <Th center>ABC</Th>
              <Th center>Rank</Th>
              <Th>Etapa</Th>
              <Th right>Total</Th>
              <Th right>Part. %</Th>
              <Th right>Acumul. %</Th>
              <Th right>MO</Th>
              <Th right>Material</Th>
              <Th center>Foco</Th>
            </tr>
          </thead>
          <tbody>
            {abc.map(r => (
              <tr key={r.origIdx} className="hover:bg-white/[.01]">
                <Td center>
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: `${clsColor[r.cls as keyof typeof clsColor]}22`, color: clsColor[r.cls as keyof typeof clsColor] }}>
                    {r.cls}
                  </span>
                </Td>
                <Td center><span className="font-mono text-[10px] text-tx3">{r.rank}º</span></Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                    <span className="text-xs font-semibold">{r.name}</span>
                  </div>
                </Td>
                <Td right><span className="font-mono text-xs font-semibold">{fmtBRL(r.total)}</span></Td>
                <Td right><span className="font-mono text-[10px] text-amber">{r.pp.toFixed(2)}%</span></Td>
                <Td right>
                  <span className="font-mono text-[10px] font-bold" style={{ color: clsColor[r.cls as keyof typeof clsColor] }}>
                    {r.acc.toFixed(1)}%
                  </span>
                </Td>
                <Td right><span className="font-mono text-[10px] text-mo">{fmtBRL(r.moVal)}</span></Td>
                <Td right><span className="font-mono text-[10px] text-mat">{fmtBRL(r.matVal)}</span></Td>
                <Td center>
                  <span className="text-[10px]">
                    {r.cls === 'A' ? '🔴 Máxima' : r.cls === 'B' ? '🟡 Moderada' : '🟢 Padrão'}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Pareto — Custo Acumulado</CardTitle></CardHeader>
          <CardBody>
            <BarChart
              labels={abc.map(r => r.name.length > 12 ? r.name.slice(0, 11) + '…' : r.name)}
              datasets={[
                { label: 'Custo', data: abc.map(r => r.total), backgroundColor: abc.map(r => `${clsColor[r.cls as keyof typeof clsColor]}b3`), yAxisID: 'y' },
                { label: 'Acumul. %', data: abc.map(r => r.acc), type: 'line', borderColor: '#f0a500', backgroundColor: 'rgba(240,165,0,.08)', fill: true, yAxisID: 'y2', tension: 0.4, borderWidth: 2, pointRadius: 2 },
              ]}
              height={220}
              y2
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>MO vs Material por Classe</CardTitle></CardHeader>
          <CardBody>
            <BarChart
              labels={['Classe A', 'Classe B', 'Classe C']}
              datasets={[
                { label: 'Mão de Obra', data: ['A','B','C'].map(c => grp[c as 'A'|'B'|'C'].mo),  backgroundColor: 'rgba(62,207,178,.7)',  borderWidth: 1, borderColor: '#3ecfb2' },
                { label: 'Material',    data: ['A','B','C'].map(c => grp[c as 'A'|'B'|'C'].mat), backgroundColor: 'rgba(108,143,255,.7)', borderWidth: 1, borderColor: '#6c8fff' },
              ]}
              height={220}
              stacked
            />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
