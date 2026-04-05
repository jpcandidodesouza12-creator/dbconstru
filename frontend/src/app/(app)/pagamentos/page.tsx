// frontend/src/app/(app)/pagamentos/page.tsx
'use client'
import { useCalc, fmtBRL, fmtK } from '@/hooks/useCalc'
import { useProjectStore } from '@/store/project.store'
import { Card, CardHeader, CardTitle, CardBody, KpiCard, Table, Th, Td, EmptyState } from '@/components/ui'
import { BarChart } from '@/components/charts'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default function PagamentosPage() {
  const calc    = useCalc()
  const { current, setPayments } = useProjectStore()
  if (!current || !calc) return <EmptyState icon="💳" title="Nenhum projeto aberto" />

  const { grand, totalMo, totalMat } = calc
  const pay = current.payments || { entrada: 20, parcelas: 12, startM: 0 }
  const entradaVal = grand * pay.entrada / 100
  const restante   = grand - entradaVal
  const parcVal    = restante / pay.parcelas

  type Row = { n: string; mes: string; val: number; mo: number; mat: number; saldo: number; isEntrada: boolean }
  const rows: Row[] = []
  let saldo = grand
  rows.push({ n: 'Entrada', mes: `M1 ${MESES[pay.startM % 12]}`, val: entradaVal, mo: entradaVal * totalMo / grand, mat: entradaVal * totalMat / grand, saldo: grand - entradaVal, isEntrada: true })
  saldo -= entradaVal
  for (let p = 1; p <= pay.parcelas; p++) {
    saldo -= parcVal
    rows.push({ n: `Parcela ${p}/${pay.parcelas}`, mes: `M${p+1} ${MESES[(pay.startM+p)%12]}`, val: parcVal, mo: parcVal * totalMo / grand, mat: parcVal * totalMat / grand, saldo: Math.max(0, saldo), isEntrada: false })
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader><CardTitle>Parâmetros</CardTitle></CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="font-mono text-[9px] text-tx3 uppercase tracking-widest block mb-1">Entrada (%)</label>
              <div className="font-mono text-2xl font-bold mb-1">{pay.entrada}%</div>
              <input type="range" min="0" max="80" step="5" value={pay.entrada} onChange={e => setPayments({ entrada: +e.target.value })} className="w-full" />
              <div className="font-mono text-[10px] text-amber mt-1">= {fmtK(entradaVal)}</div>
            </div>
            <div>
              <label className="font-mono text-[9px] text-tx3 uppercase tracking-widest block mb-1">Nº de Parcelas</label>
              <div className="font-mono text-2xl font-bold mb-1">{pay.parcelas}×</div>
              <input type="range" min="1" max="36" step="1" value={pay.parcelas} onChange={e => setPayments({ parcelas: +e.target.value })} className="w-full" />
              <div className="font-mono text-[10px] text-mo mt-1">{fmtK(parcVal)}/mês</div>
            </div>
            <div>
              <label className="font-mono text-[9px] text-tx3 uppercase tracking-widest block mb-1">Mês de início</label>
              <select value={pay.startM} onChange={e => setPayments({ startM: +e.target.value })}
                className="w-full bg-bg2 border border-line2 rounded px-3 py-2 text-sm text-tx outline-none focus:border-amber">
                {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Geral"    value={fmtK(grand)}        sub="base + contingência" accent="#f0a500" />
        <KpiCard label="Entrada"        value={fmtK(entradaVal)}   sub={`${pay.entrada}% do total`} accent="#ff6b6b" />
        <KpiCard label="Parcela Mensal" value={fmtK(parcVal)}      sub={`${pay.parcelas}× mensais`} accent="#3ecfb2" />
        <KpiCard label="Restante"       value={fmtK(restante)}     sub={`${100-pay.entrada}% parcelado`} accent="#6c8fff" />
      </div>

      <Card>
        <CardHeader><CardTitle>Fluxo de Pagamentos</CardTitle></CardHeader>
        <CardBody>
          <BarChart
            labels={rows.map(r => r.n.length > 12 ? r.n.slice(0,11)+'…' : r.n)}
            datasets={[
              { label: 'MO',       data: rows.map(r => r.mo),    backgroundColor: 'rgba(62,207,178,.7)',  stack: 's' },
              { label: 'Material', data: rows.map(r => r.mat),   backgroundColor: 'rgba(108,143,255,.7)', stack: 's' },
              { label: 'Saldo',    data: rows.map(r => r.saldo), type: 'line', borderColor: '#ff6b6b', yAxisID: 'y2', tension: 0.4, borderWidth: 2, pointRadius: 2 },
            ]}
            height={220} stacked y2
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Tabela de Amortização</CardTitle></CardHeader>
        <Table>
          <thead><tr><Th>#</Th><Th>Competência</Th><Th right>Valor</Th><Th right>MO</Th><Th right>Material</Th><Th right>Saldo Devedor</Th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={r.isEntrada ? 'bg-amber/5' : 'hover:bg-white/[.01]'}>
                <Td><span className="font-mono text-[10px] text-tx3">{r.n}</span></Td>
                <Td><span className="font-mono text-xs font-semibold">{r.mes}</span></Td>
                <Td right><span className={`font-mono text-xs font-semibold ${r.isEntrada ? 'text-amber' : ''}`}>{fmtK(r.val)}</span></Td>
                <Td right><span className="font-mono text-[11px] text-mo">{fmtK(r.mo)}</span></Td>
                <Td right><span className="font-mono text-[11px] text-mat">{fmtK(r.mat)}</span></Td>
                <Td right><span className="font-mono text-[11px] text-tx3">{fmtK(r.saldo)}</span></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  )
}
