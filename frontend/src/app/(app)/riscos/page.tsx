// frontend/src/app/(app)/riscos/page.tsx
'use client'
import { useMemo } from 'react'
import { useProjectStore } from '@/store/project.store'
import { Card, CardHeader, CardTitle, CardBody, KpiCard, Table, Th, Td, EmptyState } from '@/components/ui'

const RISKS_DEF = [
  { name: 'Atraso em aprovações na prefeitura',        cat: 'Prazo',     prob: 3, impact: 4, mit: 'Protocolar com antecedência; contratar despachante' },
  { name: 'Solo necessitando aterro adicional',        cat: 'Custo',     prob: 2, impact: 3, mit: 'Realizar sondagem SPT antes do início' },
  { name: 'Solo inadequado para fundação prevista',    cat: 'Custo',     prob: 2, impact: 5, mit: 'Contratar laudo SPT e ter plano B de fundação' },
  { name: 'Alta do preço de aço e cimento',            cat: 'Custo',     prob: 4, impact: 4, mit: 'Fechar contrato de fornecimento com antecedência' },
  { name: 'Falta de mão de obra especializada',        cat: 'Prazo',     prob: 3, impact: 3, mit: 'Contratar equipe com antecedência' },
  { name: 'Chuvas em período de cobertura',            cat: 'Prazo',     prob: 3, impact: 4, mit: 'Planejar execução no período seco de CG' },
  { name: 'Projeto elétrico subdimensionado',          cat: 'Qualidade', prob: 2, impact: 3, mit: 'Revisar projeto com engenheiro elétrico' },
  { name: 'Vazamentos ocultos antes de revestir',      cat: 'Qualidade', prob: 2, impact: 4, mit: 'Teste hidrostático antes de fechar paredes' },
  { name: 'Retrabalho por má aplicação de gesso',      cat: 'Custo',     prob: 3, impact: 3, mit: 'Usar profissional certificado' },
  { name: 'Atraso na entrega de esquadrias',           cat: 'Prazo',     prob: 4, impact: 3, mit: 'Pedir com 60 dias de antecedência' },
  { name: 'Eflorescência em paredes externas',         cat: 'Qualidade', prob: 3, impact: 2, mit: 'Tratar umidade antes de pintar' },
  { name: 'Quebra e retrabalho em pisos',              cat: 'Custo',     prob: 2, impact: 3, mit: 'Comprar 10% a mais de material' },
  { name: 'Louças fora de linha ou com defeito',       cat: 'Custo',     prob: 2, impact: 2, mit: 'Verificar antes da instalação' },
  { name: 'Fissuras na fachada por movimentação',      cat: 'Qualidade', prob: 3, impact: 3, mit: 'Usar argamassa com fibra e telas' },
  { name: 'Itens de ajuste não previstos na entrega', cat: 'Custo',     prob: 4, impact: 2, mit: 'Incluir reserva na contingência' },
]

function riskScore(r: { prob: number; impact: number }) { return r.prob * r.impact }
function riskLevel(s: number) { return s >= 17 ? 'Crítico' : s >= 10 ? 'Alto' : s >= 5 ? 'Médio' : 'Baixo' }
function riskColor(s: number) { return s >= 17 ? '#ff6b6b' : s >= 10 ? '#fb923c' : s >= 5 ? '#fbbf24' : '#4cde8a' }
function matClass(score: number) {
  if (score >= 17) return 'bg-red-500/20 border border-red-500/30'
  if (score >= 10) return 'bg-orange-500/15 border border-orange-500/25'
  if (score >= 5)  return 'bg-yellow-500/12 border border-yellow-500/20'
  return 'bg-green-500/10 border border-green-500/15'
}

export default function RiscosPage() {
  const { current, updateRisk } = useProjectStore()

  const risks = useMemo(() => {
    if (!current) return RISKS_DEF.map(r => ({ ...r }))
    const saved = current.risks || []
    return RISKS_DEF.map((def, i) => saved[i] ? { ...def, ...saved[i] } : { ...def })
  }, [current])

  if (!current) return <EmptyState icon="⚠️" title="Nenhum projeto aberto" />

  // Build 5x5 matrix
  const matrix: Array<Array<typeof risks[0][]>> = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => []))
  risks.forEach(r => {
    if (r.prob >= 1 && r.prob <= 5 && r.impact >= 1 && r.impact <= 5)
      matrix[5 - r.prob][r.impact - 1].push(r)
  })

  const crit = risks.filter(r => riskScore(r) >= 17).length
  const high = risks.filter(r => riskScore(r) >= 10 && riskScore(r) < 17).length
  const med  = risks.filter(r => riskScore(r) >= 5  && riskScore(r) < 10).length
  const low  = risks.filter(r => riskScore(r) < 5).length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Críticos (≥17)"  value={String(crit)} sub="máxima atenção"    accent="#ff6b6b" />
        <KpiCard label="Altos (10–16)"   value={String(high)} sub="monitorar de perto" accent="#fb923c" />
        <KpiCard label="Médios (5–9)"    value={String(med)}  sub="atenção moderada"  accent="#fbbf24" />
        <KpiCard label="Baixos (1–4)"    value={String(low)}  sub="controle padrão"   accent="#4cde8a" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Risk table */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader><CardTitle>Registro de Riscos</CardTitle><span className="font-mono text-[9px] text-tx3">{risks.length} riscos · edite P e I diretamente</span></CardHeader>
            <Table>
              <thead><tr><Th center>#</Th><Th>Risco</Th><Th center>Cat.</Th><Th center>P</Th><Th center>I</Th><Th center>Score</Th><Th center>Nível</Th><Th>Mitigação</Th></tr></thead>
              <tbody>
                {risks.map((r, i) => {
                  const sc = riskScore(r)
                  return (
                    <tr key={i} className="hover:bg-white/[.01]">
                      <Td center><span className="font-mono text-[10px] text-tx3">{i+1}</span></Td>
                      <Td><span className="text-xs font-medium">{r.name}</span></Td>
                      <Td center><span className="text-[9px] px-1.5 py-0.5 rounded bg-bg3 text-tx3">{r.cat}</span></Td>
                      <Td center>
                        <input type="number" min="1" max="5" value={r.prob}
                          onChange={e => updateRisk(i, { prob: Math.min(5, Math.max(1, +e.target.value)) })}
                          className="w-10 bg-bg2 border border-line2 rounded px-1.5 py-1 font-mono text-xs text-center text-tx outline-none focus:border-amber" />
                      </Td>
                      <Td center>
                        <input type="number" min="1" max="5" value={r.impact}
                          onChange={e => updateRisk(i, { impact: Math.min(5, Math.max(1, +e.target.value)) })}
                          className="w-10 bg-bg2 border border-line2 rounded px-1.5 py-1 font-mono text-xs text-center text-tx outline-none focus:border-amber" />
                      </Td>
                      <Td center><span className="font-mono text-xs font-bold" style={{ color: riskColor(sc) }}>{sc}</span></Td>
                      <Td center>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${riskColor(sc)}22`, color: riskColor(sc) }}>
                          {riskLevel(sc)}
                        </span>
                      </Td>
                      <Td><span className="text-[10px] text-tx3">{r.mit}</span></Td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </Card>
        </div>

        {/* Matrix */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Matriz 5×5</CardTitle><span className="font-mono text-[9px] text-tx3">P × I</span></CardHeader>
            <CardBody>
              <div className="text-[9px] text-tx3 mb-2 font-mono">Impacto →</div>
              <div className="grid gap-1" style={{ gridTemplateColumns: 'auto repeat(5, 1fr)' }}>
                {/* Column headers */}
                <div className="text-[8px] text-tx3 font-mono flex items-end justify-center pb-1">P↓\I</div>
                {[1,2,3,4,5].map(v => (
                  <div key={v} className="text-center font-mono text-[9px] text-tx3 pb-1">{v}</div>
                ))}
                {/* Rows */}
                {[5,4,3,2,1].map(prob => (
                  <>
                    <div key={`p${prob}`} className="font-mono text-[9px] text-tx3 flex items-center justify-center">{prob}</div>
                    {[1,2,3,4,5].map(imp => {
                      const sc   = prob * imp
                      const dots = matrix[5 - prob][imp - 1]
                      return (
                        <div key={imp} className={`rounded min-h-12 flex flex-col items-center justify-center gap-0.5 p-1 ${matClass(sc)}`}>
                          <div className="font-mono text-[8px] opacity-40">{sc}</div>
                          {dots.map((d, di) => (
                            <div key={di} className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-bg"
                              style={{ background: riskColor(sc) }} title={d.name}>
                              {risks.indexOf(d) + 1}
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </>
                ))}
              </div>
              <div className="mt-3 space-y-1">
                {[['Crítico','#ff6b6b','≥17'],['Alto','#fb923c','10–16'],['Médio','#fbbf24','5–9'],['Baixo','#4cde8a','1–4']].map(([l,c,r]) => (
                  <div key={l} className="flex items-center gap-2 text-[9px]">
                    <div className="w-2.5 h-2.5 rounded" style={{ background: `${c}33`, border: `1px solid ${c}55` }} />
                    <span style={{ color: c }}>{l}</span>
                    <span className="text-tx3">Score {r}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
