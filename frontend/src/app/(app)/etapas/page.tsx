// frontend/src/app/(app)/etapas/page.tsx
'use client'
import { useState } from 'react'
import { useCalc, fmtBRL, fmtK, PHASES_DEF } from '@/hooks/useCalc'
import { useProjectStore } from '@/store/project.store'
import { ProjectControls } from '@/components/forms/ProjectControls'
import { Card, CardHeader, CardTitle, CardBody, Button, Table, Th, Td, KpiCard, EmptyState } from '@/components/ui'
import { DoughnutChart } from '@/components/charts'

interface EditState { total: string; moPct: string }

export default function EtapasPage() {
  const calc = useCalc()
  const { current, setPhaseOverride, resetPhase, setExpandedRow, expandedRow } = useProjectStore()
  const [editVals, setEditVals] = useState<Record<number, EditState>>({})

  if (!current || !calc) return <EmptyState icon="📋" title="Nenhum projeto aberto" desc="Abra ou crie um projeto para ver as etapas." />

  const { phaseData, totalBase, totalMo, totalMat, cont, grand } = calc

  function openEdit(i: number) {
    const p = phaseData[i]
    setEditVals(prev => ({ ...prev, [i]: { total: Math.round(p.total).toString(), moPct: p.moPct.toFixed(1) } }))
    setExpandedRow(expandedRow === i ? null : i)
  }

  function applyEdit(i: number) {
    const v = editVals[i]
    if (!v) return
    setPhaseOverride(i, {
      total: v.total ? parseFloat(v.total) : null,
      moPct: v.moPct ? Math.min(100, Math.max(0, parseFloat(v.moPct))) : null,
    })
    setExpandedRow(null)
  }

  function syncEdit(i: number, field: keyof EditState, value: string) {
    setEditVals(prev => {
      const cur = prev[i] || { total: '', moPct: '' }
      const updated = { ...cur, [field]: value }
      // Cross-sync: if editing moPct, recalc MO/Mat display only
      return { ...prev, [i]: updated }
    })
  }

  const maxTotal = Math.max(...phaseData.map(p => p.total))

  return (
    <div className="space-y-4">
      <ProjectControls />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Custo Base Total"  value={fmtK(totalBase)}  sub={`${current.config.area}m² · ${current.config.std}`} accent="#f0a500" />
        <KpiCard label="Mão de Obra"       value={fmtK(totalMo)}    sub={`${(totalMo/totalBase*100).toFixed(1)}% do base`}     accent="#3ecfb2" progress={totalMo/totalBase*100} />
        <KpiCard label="Material"          value={fmtK(totalMat)}   sub={`${(totalMat/totalBase*100).toFixed(1)}% do base`}    accent="#6c8fff" progress={totalMat/totalBase*100} />
        <KpiCard label="Total c/ Cont."    value={fmtK(grand)}      sub={`+ ${current.config.cont}% contingência`}            accent="#ffc84a" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Main table */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Etapas da Obra</CardTitle>
              <span className="font-mono text-[9px] text-tx3">15 fases · clique em ✏ para editar</span>
            </CardHeader>
            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Etapa</Th>
                  <Th>MO vs Mat.</Th>
                  <Th right>Total</Th>
                  <Th right>MO</Th>
                  <Th right>Material</Th>
                  <Th center>Prazo</Th>
                  <Th center>Ed.</Th>
                </tr>
              </thead>
              <tbody>
                {phaseData.map((p, i) => {
                  const moP = p.moPct.toFixed(0)
                  const matP = (100 - p.moPct).toFixed(0)
                  const isExp = expandedRow === i
                  const ev = editVals[i]
                  const editTotal = ev ? parseFloat(ev.total) || p.total : p.total
                  const editMoPct = ev ? parseFloat(ev.moPct) || p.moPct : p.moPct
                  return (
                    <>
                      <tr key={i} className={`cursor-pointer ${isExp ? 'bg-white/[.02]' : 'hover:bg-white/[.01]'}`} onClick={() => openEdit(i)}>
                        <Td center>
                          <span className="font-mono text-[10px] text-tx3 relative">
                            {String(i + 1).padStart(2, '0')}
                            {p.modified && <span className="absolute -top-0.5 -right-2 w-1.5 h-1.5 rounded-full bg-amber inline-block" />}
                          </span>
                        </Td>
                        <Td>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                            <div>
                              <div className="text-xs font-semibold">{p.name}</div>
                              <div className="text-[10px] text-tx3">{p.sub}</div>
                            </div>
                          </div>
                        </Td>
                        <Td>
                          <div className="min-w-[90px]">
                            <div className="h-1.5 bg-line2 rounded-full overflow-hidden flex">
                              <div className="bg-mo h-full" style={{ width: `${moP}%` }} />
                              <div className="bg-mat h-full" style={{ width: `${matP}%` }} />
                            </div>
                            <div className="flex justify-between font-mono text-[9px] mt-0.5">
                              <span className="text-mo">MO {moP}%</span>
                              <span className="text-mat">Mat {matP}%</span>
                            </div>
                          </div>
                        </Td>
                        <Td right><span className="font-mono text-xs font-semibold">{fmtBRL(p.total)}</span></Td>
                        <Td right><span className="font-mono text-xs text-mo">{fmtBRL(p.moVal)}</span></Td>
                        <Td right><span className="font-mono text-xs text-mat">{fmtBRL(p.matVal)}</span></Td>
                        <Td center><span className="font-mono text-[10px] text-tx3">{p.dur}m</span></Td>
                        <Td center onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => openEdit(i)}
                            className={`w-6 h-6 rounded border text-[11px] transition-all ${isExp ? 'border-amber text-amber bg-amber/10' : 'border-line2 text-tx3 hover:border-amber hover:text-amber'}`}
                          >✏</button>
                        </Td>
                      </tr>
                      {/* Edit panel */}
                      {isExp && (
                        <tr key={`ep-${i}`}>
                          <td colSpan={8} className="p-0">
                            <div className="bg-bg3 border-t border-line2 p-4 animate-slide-in">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                                {/* Total */}
                                <div>
                                  <div className="font-mono text-[9px] text-amber uppercase tracking-widest mb-2">Custo Total</div>
                                  <label className="font-mono text-[9px] text-tx3 block mb-1">Valor total (R$)</label>
                                  <input type="number" value={ev?.total ?? Math.round(p.total)} onChange={e => syncEdit(i, 'total', e.target.value)}
                                    className="w-full bg-bg2 border border-line2 rounded px-3 py-1.5 font-mono text-xs text-tx outline-none focus:border-amber" />
                                  <label className="font-mono text-[9px] text-tx3 block mt-2 mb-1">% do custo base</label>
                                  <input type="number" value={ev ? ((parseFloat(ev.total)||p.total)/calc.base*100).toFixed(2) : (p.total/calc.base*100).toFixed(2)}
                                    onChange={e => syncEdit(i, 'total', String(parseFloat(e.target.value)/100*calc.base))}
                                    className="w-full bg-bg2 border border-line2 rounded px-3 py-1.5 font-mono text-xs text-tx outline-none focus:border-amber" />
                                </div>
                                {/* MO */}
                                <div>
                                  <div className="font-mono text-[9px] text-mo uppercase tracking-widest mb-2">Mão de Obra</div>
                                  <label className="font-mono text-[9px] text-tx3 block mb-1">Valor MO (R$)</label>
                                  <input type="number" value={ev ? Math.round(editTotal * editMoPct / 100) : Math.round(p.moVal)}
                                    onChange={e => { const t = parseFloat(ev?.total||'') || p.total; syncEdit(i, 'moPct', String(parseFloat(e.target.value)/t*100)) }}
                                    className="w-full bg-bg2 border border-mo/40 rounded px-3 py-1.5 font-mono text-xs text-tx outline-none focus:border-mo" />
                                  <label className="font-mono text-[9px] text-tx3 block mt-2 mb-1">% MO desta etapa</label>
                                  <input type="number" value={ev?.moPct ?? p.moPct.toFixed(1)} min="0" max="100"
                                    onChange={e => syncEdit(i, 'moPct', e.target.value)}
                                    className="w-full bg-bg2 border border-mo/40 rounded px-3 py-1.5 font-mono text-xs text-tx outline-none focus:border-mo" />
                                </div>
                                {/* Material */}
                                <div>
                                  <div className="font-mono text-[9px] text-mat uppercase tracking-widest mb-2">Material</div>
                                  <label className="font-mono text-[9px] text-tx3 block mb-1">Valor Material (R$)</label>
                                  <input type="number" value={ev ? Math.round(editTotal * (100-editMoPct) / 100) : Math.round(p.matVal)}
                                    onChange={e => { const t = parseFloat(ev?.total||'') || p.total; syncEdit(i, 'moPct', String((1 - parseFloat(e.target.value)/t)*100)) }}
                                    className="w-full bg-bg2 border border-mat/40 rounded px-3 py-1.5 font-mono text-xs text-tx outline-none focus:border-mat" />
                                  <label className="font-mono text-[9px] text-tx3 block mt-2 mb-1">% Material</label>
                                  <input type="number" value={ev ? (100 - parseFloat(ev.moPct||'0')).toFixed(1) : (100-p.moPct).toFixed(1)} readOnly
                                    className="w-full bg-bg2 border border-mat/40 rounded px-3 py-1.5 font-mono text-xs text-tx3 outline-none cursor-not-allowed" />
                                </div>
                              </div>
                              {/* Drag slider */}
                              <div className="mb-3 max-w-sm">
                                <label className="font-mono text-[9px] text-tx3 block mb-1">Divisão MO / Material</label>
                                <input type="range" min="0" max="100" value={ev ? parseFloat(ev.moPct||'50') : p.moPct}
                                  onChange={e => syncEdit(i, 'moPct', e.target.value)} className="w-full" />
                                <div className="flex justify-between font-mono text-[9px] mt-0.5">
                                  <span className="text-mo">MO {ev ? parseFloat(ev.moPct||'0').toFixed(0) : p.moPct.toFixed(0)}%</span>
                                  <span className="text-mat">Mat {ev ? (100-parseFloat(ev.moPct||'0')).toFixed(0) : (100-p.moPct).toFixed(0)}%</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => applyEdit(i)}>✓ Aplicar</Button>
                                <Button size="sm" variant="danger" onClick={() => { resetPhase(i); setExpandedRow(null) }}>↺ Restaurar</Button>
                                <Button size="sm" variant="ghost" onClick={() => setExpandedRow(null)}>Cancelar</Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
                {/* Totals */}
                <tr className="bg-bg2">
                  <td colSpan={3} className="px-3 py-2.5 font-condensed font-bold text-sm uppercase text-amber">TOTAL BASE</td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold text-sm text-amber">{fmtBRL(totalBase)}</td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold text-xs text-mo">{fmtBRL(totalMo)}</td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold text-xs text-mat">{fmtBRL(totalMat)}</td>
                  <td colSpan={2} />
                </tr>
              </tbody>
            </Table>
          </Card>
        </div>

        {/* Right: donut + stacked bars */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Distribuição %</CardTitle></CardHeader>
            <CardBody className="flex justify-center">
              <DoughnutChart
                labels={PHASES_DEF.map(p => p.name)}
                data={phaseData.map(p => +(p.total/totalBase*100).toFixed(2))}
                colors={PHASES_DEF.map(p => p.color)}
                centerLabel={fmtK(totalBase)}
                size={180}
              />
            </CardBody>
          </Card>
          <Card>
            <CardHeader><CardTitle>MO vs Material</CardTitle></CardHeader>
            <CardBody className="space-y-2">
              {phaseData.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                  <div className="w-24 text-[10px] text-tx2 truncate">{p.name}</div>
                  <div className="flex-1 h-2.5 bg-line2 rounded-full overflow-hidden flex">
                    <div className="bg-mo h-full" style={{ width: `${p.total/maxTotal*100*p.moPct/100}%` }} />
                    <div className="bg-mat h-full" style={{ width: `${p.total/maxTotal*100*(100-p.moPct)/100}%` }} />
                  </div>
                  <div className="font-mono text-[9px] text-tx3 w-14 text-right">{fmtK(p.total)}</div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
