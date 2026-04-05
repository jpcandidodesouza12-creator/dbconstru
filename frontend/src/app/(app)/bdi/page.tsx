// frontend/src/app/(app)/bdi/page.tsx
'use client'
import { useCalc, fmtBRL, fmtK } from '@/hooks/useCalc'
import { useProjectStore } from '@/store/project.store'
import { Card, CardHeader, CardTitle, CardBody, KpiCard, EmptyState } from '@/components/ui'

const BDI_FIELDS = [
  { key: 'ac',  label: 'AC — Administração Central',    desc: 'Overhead, pessoal adm., infraestrutura' },
  { key: 'cf',  label: 'CF — Despesas Financeiras',     desc: 'Capital de giro, encargos, antecipações' },
  { key: 's',   label: 'S — Seguros e Garantias',       desc: 'Seguro obra, garantias contratuais' },
  { key: 'mi',  label: 'MI — Mobilização/Desmob.',      desc: 'Canteiro, instalações provisórias' },
  { key: 'l',   label: 'L — Lucro',                     desc: 'Remuneração da construtora / empreiteira' },
  { key: 'iss', label: 'ISS — Campo Grande',             desc: 'Decreto Municipal — 3% sobre serviços' },
  { key: 'pis', label: 'PIS + COFINS',                  desc: 'Incidência sobre faturamento (cumulativo)' },
] as const

const REF: Record<string, string> = { low: '15–20%', med: '18–25%', high: '20–30%' }

export default function BDIPage() {
  const calc   = useCalc()
  const { current, setConfig } = useProjectStore()

  if (!current || !calc) return <EmptyState icon="📐" title="Nenhum projeto aberto" />

  const { bdiPct, grandBDI, totalBase } = calc
  const bdi  = current.config.bdi
  const std  = current.config.std
  const ref  = REF[std]
  const inRange = bdiPct >= 15 && bdiPct <= (std === 'high' ? 30 : std === 'med' ? 25 : 20)

  function updateBdi(key: keyof typeof bdi, val: number) {
    setConfig({ bdi: { ...bdi, [key]: val } })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="BDI Calculado"     value={`${bdiPct.toFixed(2)}%`}  sub={`Ref. padrão ${std}: ${ref}`}          accent={inRange ? '#4cde8a' : '#ff6b6b'} />
        <KpiCard label="Custo Direto"      value={fmtK(totalBase)}           sub="sem BDI"                               accent="#8892a4" />
        <KpiCard label="Custo Final c/ BDI" value={fmtK(grandBDI)}          sub="custo direto × (1 + BDI/100)"          accent="#f0a500" />
        <KpiCard label="Status"            value={inRange ? '✓ Ok' : '⚠ Fora'} sub={inRange ? 'dentro da faixa recomendada' : 'revisar componentes'} accent={inRange ? '#4cde8a' : '#fb923c'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input fields */}
        <Card>
          <CardHeader><CardTitle>Componentes do BDI</CardTitle><span className="font-mono text-[9px] text-tx3">Fórmula IBEC · Obras Residenciais Privadas</span></CardHeader>
          <CardBody className="space-y-0">
            {BDI_FIELDS.map(f => (
              <div key={f.key} className="flex items-center gap-3 py-3 border-b border-line/50 last:border-0">
                <div className="flex-1">
                  <div className="text-xs font-semibold">{f.label}</div>
                  <div className="text-[10px] text-tx3 mt-0.5">{f.desc}</div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <input
                    type="number" min="0" max="30" step="0.1"
                    value={bdi[f.key]}
                    onChange={e => updateBdi(f.key, parseFloat(e.target.value) || 0)}
                    className="w-16 bg-bg2 border border-line2 rounded px-2 py-1.5 font-mono text-xs text-tx text-right outline-none focus:border-amber transition-colors"
                  />
                  <span className="font-mono text-[10px] text-tx3">%</span>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Resultado</CardTitle></CardHeader>
            <CardBody className="space-y-2">
              {BDI_FIELDS.map(f => (
                <div key={f.key} className="flex justify-between items-center py-1.5 border-b border-line/40 last:border-0">
                  <span className="text-xs text-tx2">{f.key.toUpperCase()}</span>
                  <span className="font-mono text-xs">{bdi[f.key].toFixed(2)}%</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 border-t-2 border-amber/30">
                <span className="font-condensed font-bold text-sm uppercase text-amber">BDI Calculado</span>
                <span className="font-mono font-bold text-base text-amber">{bdiPct.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-tx2">Custo Direto</span>
                <span className="font-mono text-xs">{fmtBRL(totalBase)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-line2">
                <span className="font-semibold text-sm">Custo Final c/ BDI</span>
                <span className="font-mono font-bold text-sm text-amber">{fmtBRL(grandBDI)}</span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="font-mono text-[10px] text-tx2 leading-relaxed">
                <div className="text-amber font-bold mb-2">Fórmula IBEC:</div>
                <div className="bg-bg2 rounded p-3 text-tx3">
                  BDI = &#123;[(1 + AC + CF + S + MI) / (1 – T – L)] – 1&#125; × 100<br />
                  onde T = ISS + PIS/COFINS<br /><br />
                  Custo Final = Custo Direto × (1 + BDI/100)
                </div>
                <div className="mt-3 text-tx3">
                  Referência para padrão <span className="text-amber font-bold">{std}</span>: <span className="text-amber">{ref}</span><br />
                  Seu BDI está <span className={inRange ? 'text-ok' : 'text-danger'} style={{fontWeight:'bold'}}>{inRange ? 'dentro da faixa recomendada ✓' : 'fora da faixa ⚠'}</span>
                </div>
                <div className="mt-3 text-tx3 border-t border-line2 pt-3">
                  ISS Campo Grande: 3% (Dec. Municipal 11.399)<br />
                  Ref.: TCU Acórdão 2622/2013 · IBEC · CEF
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
