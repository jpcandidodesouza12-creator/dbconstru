// frontend/src/app/(app)/diario/page.tsx
'use client'
import { useState } from 'react'
import { useProjectStore } from '@/store/project.store'
import { PHASES_DEF } from '@/hooks/useCalc'
import { Card, CardHeader, CardTitle, CardBody, Button, EmptyState, KpiCard } from '@/components/ui'
import toast from 'react-hot-toast'

const TIPOS = [
  { value: 'progresso',  label: '✅ Progresso',  color: '#4cde8a' },
  { value: 'problema',   label: '🚨 Problema',   color: '#ff6b6b' },
  { value: 'mudanca',    label: '🔄 Mudança',    color: '#fbbf24' },
  { value: 'pagamento',  label: '💳 Pagamento',  color: '#3ecfb2' },
  { value: 'vistoria',   label: '🔍 Vistoria',   color: '#6c8fff' },
] as const

type TipoType = typeof TIPOS[number]['value']

export default function DiarioPage() {
  const { current, addDiaryEntry, deleteDiaryEntry } = useProjectStore()
  const [date,     setDate]     = useState(new Date().toISOString().slice(0, 10))
  const [phaseIdx, setPhaseIdx] = useState(-1)
  const [tipo,     setTipo]     = useState<TipoType>('progresso')
  const [desc,     setDesc]     = useState('')
  const [filter,   setFilter]   = useState<string>('all')

  if (!current) return <EmptyState icon="📝" title="Nenhum projeto aberto" />

  const diary   = current.diary || []
  const sorted  = [...diary].sort((a, b) => b.date.localeCompare(a.date))
  const filtered = filter === 'all' ? sorted : sorted.filter(e => e.type === filter)

  function handleAdd() {
    if (!desc.trim()) { toast.error('Descreva o registro'); return }
    addDiaryEntry({ date, phaseIdx, type: tipo, desc: desc.trim() })
    setDesc('')
    toast.success('Registro adicionado!')
  }

  const countByTipo = (t: string) => diary.filter(e => e.type === t).length
  const tipoColor = (t: string) => TIPOS.find(x => x.value === t)?.color || '#8892a4'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
        {TIPOS.map(t => (
          <KpiCard key={t.value} label={t.label.split(' ').slice(1).join(' ')} value={String(countByTipo(t.value))} accent={t.color} />
        ))}
      </div>

      {/* New entry form */}
      <Card>
        <CardHeader><CardTitle>📝 Nova Entrada</CardTitle></CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="font-mono text-[9px] text-tx3 uppercase tracking-widest block mb-1">Data</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full bg-bg2 border border-line2 rounded px-3 py-2 text-sm text-tx outline-none focus:border-amber" />
            </div>
            <div>
              <label className="font-mono text-[9px] text-tx3 uppercase tracking-widest block mb-1">Etapa</label>
              <select value={phaseIdx} onChange={e => setPhaseIdx(+e.target.value)}
                className="w-full bg-bg2 border border-line2 rounded px-3 py-2 text-sm text-tx outline-none focus:border-amber">
                <option value={-1}>— Geral —</option>
                {PHASES_DEF.map((p, i) => <option key={i} value={i}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="font-mono text-[9px] text-tx3 uppercase tracking-widest block mb-1">Tipo</label>
              <select value={tipo} onChange={e => setTipo(e.target.value as TipoType)}
                className="w-full bg-bg2 border border-line2 rounded px-3 py-2 text-sm text-tx outline-none focus:border-amber">
                {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-1 flex items-end">
              <Button onClick={handleAdd} className="w-full">＋ Registrar</Button>
            </div>
          </div>
          <div>
            <label className="font-mono text-[9px] text-tx3 uppercase tracking-widest block mb-1">Descrição</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
              placeholder="Descreva o acontecimento, decisão, observação ou ocorrência da obra..."
              className="w-full bg-bg2 border border-line2 rounded px-3 py-2 text-sm text-tx outline-none focus:border-amber resize-none" />
          </div>
        </CardBody>
      </Card>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all ${filter==='all' ? 'bg-amber border-amber text-bg' : 'border-line2 text-tx2 hover:border-amber hover:text-amber'}`}>
          Todos ({diary.length})
        </button>
        {TIPOS.map(t => (
          <button key={t.value} onClick={() => setFilter(t.value)}
            className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all ${filter===t.value ? 'text-bg' : 'border-line2 text-tx2 hover:text-tx'}`}
            style={filter===t.value ? { background: t.color, borderColor: t.color } : {}}>
            {t.label} ({countByTipo(t.value)})
          </button>
        ))}
      </div>

      {/* Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
          <span className="font-mono text-[9px] text-tx3">{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</span>
        </CardHeader>
        {filtered.length === 0 ? (
          <CardBody>
            <div className="text-center py-10 text-tx3 text-sm">
              Nenhum registro ainda. Adicione a primeira entrada acima.
            </div>
          </CardBody>
        ) : (
          <div className="divide-y divide-line/50">
            {filtered.map(entry => {
              const tipoInfo = TIPOS.find(t => t.value === entry.type)
              const phase    = entry.phaseIdx >= 0 ? PHASES_DEF[entry.phaseIdx]?.name : 'Geral'
              return (
                <div key={entry.id} className="flex items-start gap-3 px-4 py-3 hover:bg-white/[.01] transition-colors">
                  <div className="w-1 self-stretch rounded-full flex-shrink-0 mt-1" style={{ background: tipoColor(entry.type) }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-[10px] font-bold text-tx2">{entry.date}</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${tipoColor(entry.type)}22`, color: tipoColor(entry.type) }}>
                        {tipoInfo?.label}
                      </span>
                      <span className="text-[10px] text-tx3">{phase}</span>
                    </div>
                    <p className="text-xs text-tx2 leading-relaxed">{entry.desc}</p>
                  </div>
                  <button onClick={() => deleteDiaryEntry(entry.id)}
                    className="text-tx3 hover:text-danger text-xs px-2 py-1 rounded transition-colors flex-shrink-0">✕</button>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
