// frontend/src/app/(app)/fornecedores/page.tsx
'use client'
import { useProjectStore } from '@/store/project.store'
import { Card, CardHeader, CardTitle, CardBody, KpiCard, EmptyState, Button } from '@/components/ui'
import { fmtBRL, fmtK } from '@/hooks/useCalc'

const INSUMOS = [
  { id: 'cimento',  name: 'Cimento CP-II 50kg',        unit: 'sc',  ref: 42,   qty: 250 },
  { id: 'aco',      name: 'Aço CA-50 Ø10mm',           unit: 'kg',  ref: 8.2,  qty: 1800 },
  { id: 'tijolo',   name: 'Tijolo cerâmico (milheiro)', unit: 'mil', ref: 860,  qty: 10 },
  { id: 'areia',    name: 'Areia média lavada',         unit: 'm³',  ref: 150,  qty: 45 },
  { id: 'brita',    name: 'Brita 0 ou 1',              unit: 'm³',  ref: 190,  qty: 30 },
  { id: 'concreto', name: 'Concreto usinado fck25',     unit: 'm³',  ref: 420,  qty: 18 },
  { id: 'piso',     name: 'Porcelanato 60×60cm',        unit: 'm²',  ref: 95,   qty: 160 },
  { id: 'telha',    name: 'Telha fibrocimento 6mm',     unit: 'm²',  ref: 38,   qty: 180 },
]

type SupRow = { name: string; phone: string; price: string; link: string }

function defaultRows(): SupRow[] {
  return [
    { name: '', phone: '', price: '', link: '' },
    { name: '', phone: '', price: '', link: '' },
  ]
}

export default function FornecedoresPage() {
  const { current, setSupplier, addSupplierRow, removeSupplierRow } = useProjectStore()
  if (!current) return <EmptyState icon="🏪" title="Nenhum projeto aberto" />

  const suppliers = current.suppliers || {}

  // Calculate total savings across all insumos
  let totalSavings = 0
  let totalCotacoes = 0
  INSUMOS.forEach(ins => {
    const rows: SupRow[] = suppliers[ins.id] || defaultRows()
    const prices = rows.map(r => r.price ? +r.price : null).filter(v => v !== null && v! > 0) as number[]
    if (prices.length >= 2) {
      const best = Math.min(...prices)
      const avg  = prices.reduce((a, v) => a + v, 0) / prices.length
      totalSavings += (avg - best) * ins.qty
      totalCotacoes += prices.length
    }
  })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Insumos Monitorados" value={String(INSUMOS.length)}       sub="principais materiais"         accent="#f0a500" />
        <KpiCard label="Cotações Registradas" value={String(totalCotacoes)}       sub="preços inseridos"             accent="#3ecfb2" />
        <KpiCard label="Economia Estimada"   value={fmtK(totalSavings)}           sub="vs preço médio das cotações"  accent="#4cde8a" />
        <KpiCard label="Ref. SINAPI"         value="Jun/2025"                      sub="Sinduscon-MS base"            accent="#8892a4" />
      </div>

      <div className="space-y-3">
        {INSUMOS.map(ins => {
          const rows: SupRow[] = suppliers[ins.id] || defaultRows()
          const prices  = rows.map(r => r.price ? +r.price : null).filter(v => v !== null && v! > 0) as number[]
          const best    = prices.length > 0 ? Math.min(...prices) : null
          const savings = prices.length >= 2 ? (prices.reduce((a,v)=>a+v,0)/prices.length - best!) : 0

          return (
            <Card key={ins.id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber flex-shrink-0" />
                  <span className="font-condensed font-bold text-sm uppercase">{ins.name}</span>
                  <span className="font-mono text-[10px] text-tx3">{ins.unit}</span>
                </div>
                <span className="font-mono text-[9px] text-tx3">
                  Ref. SINAPI: {fmtBRL(ins.ref)}/{ins.unit} · Qt. est.: {ins.qty} {ins.unit} · Ref. total: {fmtBRL(ins.ref * ins.qty)}
                </span>
              </CardHeader>
              <CardBody>
                {/* Header row */}
                <div className="grid grid-cols-[1fr_1fr_100px_100px_32px] gap-2 mb-2 font-mono text-[9px] text-tx3 uppercase tracking-wider">
                  <span>Fornecedor</span><span>Contato</span>
                  <span className="text-right">Preço/{ins.unit}</span>
                  <span className="text-right">Total Est.</span>
                  <span />
                </div>

                <div className="space-y-2">
                  {rows.map((row, ri) => {
                    const isBest = best !== null && row.price && +row.price === best
                    const hasLink = !!(row.link?.trim())
                    return (
                      <div key={ri} className="space-y-1">
                        <div className="grid grid-cols-[1fr_1fr_100px_100px_32px] gap-2 items-center">
                          <input value={row.name} placeholder="Nome do fornecedor"
                            onChange={e => setSupplier(ins.id, ri, { name: e.target.value })}
                            className="bg-bg2 border border-line2 rounded px-2 py-1.5 text-xs text-tx outline-none focus:border-amber transition-colors" />
                          <input value={row.phone} placeholder="Tel / contato"
                            onChange={e => setSupplier(ins.id, ri, { phone: e.target.value })}
                            className="bg-bg2 border border-line2 rounded px-2 py-1.5 text-xs text-tx outline-none focus:border-amber transition-colors" />
                          <input type="number" value={row.price} placeholder={String(ins.ref)}
                            onChange={e => setSupplier(ins.id, ri, { price: e.target.value })}
                            className={`bg-bg2 border rounded px-2 py-1.5 font-mono text-xs text-right text-tx outline-none transition-colors ${isBest ? 'border-ok text-ok' : 'border-line2 focus:border-amber'}`} />
                          <span className={`font-mono text-[10px] text-right ${isBest ? 'text-ok' : 'text-tx3'}`}>
                            {row.price ? fmtK(+row.price * ins.qty) : '—'}
                          </span>
                          <button onClick={() => removeSupplierRow(ins.id, ri)}
                            className="w-7 h-7 rounded border border-line2 text-tx3 hover:border-danger hover:text-danger transition-all text-xs">✕</button>
                        </div>
                        {/* Link row */}
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] text-tx3 flex-shrink-0">🔗</span>
                          <input value={row.link || ''} placeholder="Link da loja para cotação online (URL)"
                            onChange={e => setSupplier(ins.id, ri, { link: e.target.value })}
                            className="flex-1 bg-bg3 border border-line2 rounded px-2 py-1 font-mono text-[10px] text-tx outline-none focus:border-amber transition-colors" />
                          <a
                            href={hasLink ? row.link : '#'}
                            target="_blank" rel="noopener"
                            onClick={e => !hasLink && e.preventDefault()}
                            className={`font-mono text-[10px] px-3 py-1 rounded border transition-all ${hasLink ? 'border-mat/40 text-mat bg-mat/8 hover:bg-mat/15' : 'border-line2 text-tx3 opacity-40 cursor-not-allowed'}`}
                          >
                            Abrir ↗
                          </a>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Add row + savings */}
                <div className="flex items-center justify-between mt-3">
                  {rows.length < 4 ? (
                    <button onClick={() => addSupplierRow(ins.id)}
                      className="text-[10px] px-3 py-1.5 border border-dashed border-line2 rounded text-tx3 hover:border-amber hover:text-amber transition-all">
                      + Adicionar fornecedor
                    </button>
                  ) : <div />}
                  {best !== null && prices.length >= 2 && (
                    <div className="text-[10px] text-ok">
                      ✓ Melhor: {fmtBRL(best)}/{ins.unit} · Economia: {fmtBRL(savings)}/{ins.unit} ({fmtBRL(savings * ins.qty)} total)
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
