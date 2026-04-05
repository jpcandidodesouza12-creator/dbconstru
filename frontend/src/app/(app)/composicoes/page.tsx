// frontend/src/app/(app)/composicoes/page.tsx
'use client'
import { useCalc, fmtBRL, fmtK, PHASES_DEF } from '@/hooks/useCalc'
import { useProjectStore } from '@/store/project.store'
import { Card, CardHeader, CardTitle, CardBody, Table, Th, Td, EmptyState } from '@/components/ui'

const CPU_DATA = [
  {phase:0, items:[{n:'Projeto arquitetônico',u:'m²',c:1,p:80,t:'MO'},{n:'Aprovação prefeitura',u:'vb',c:1,p:1500,t:'MAT'},{n:'ART/RRT por disciplina',u:'un',c:4,p:600,t:'MAT'},{n:'Projeto estrutural',u:'m²',c:1,p:35,t:'MO'}]},
  {phase:1, items:[{n:'Limpeza manual terreno',u:'m²',c:1,p:2.8,t:'MO'},{n:'Locação/marcação (madeira)',u:'m',c:3.5,p:12,t:'MAT'},{n:'Retroescavadeira + operador',u:'h',c:6,p:220,t:'MO'}]},
  {phase:2, items:[{n:'Concreto usinado fck25',u:'m³',c:.15,p:420,t:'MAT'},{n:'Aço CA-50 Ø10mm',u:'kg',c:8,p:8.2,t:'MAT'},{n:'Armador (oficial)',u:'h',c:5,p:18,t:'MO'},{n:'Servente',u:'h',c:6,p:10,t:'MO'},{n:'Forma plywood 12mm',u:'m²',c:1.1,p:48,t:'MAT'}]},
  {phase:3, items:[{n:'Concreto usinado fck25',u:'m³',c:.12,p:420,t:'MAT'},{n:'Aço CA-50/CA-60',u:'kg',c:12,p:8.2,t:'MAT'},{n:'Forma plywood (pilares)',u:'m²',c:2,p:48,t:'MAT'},{n:'Carpinteiro formas',u:'h',c:8,p:18,t:'MO'},{n:'Armador',u:'h',c:8,p:18,t:'MO'},{n:'Laje pré-moldada',u:'m²',c:1,p:95,t:'MAT'}]},
  {phase:4, items:[{n:'Tijolo cerâmico 9×14×19',u:'mil',c:.065,p:860,t:'MAT'},{n:'Cimento CP-II-F 50kg',u:'sc',c:2.5,p:42,t:'MAT'},{n:'Areia média lavada',u:'m³',c:.3,p:150,t:'MAT'},{n:'Pedreiro',u:'h',c:6,p:17,t:'MO'},{n:'Servente',u:'h',c:4,p:10,t:'MO'}]},
  {phase:5, items:[{n:'Madeiramento pinus tratado',u:'m³',c:.04,p:2800,t:'MAT'},{n:'Telha fibrocimento 6mm',u:'m²',c:1.15,p:38,t:'MAT'},{n:'Calha alumínio 200mm',u:'m',c:.5,p:45,t:'MAT'},{n:'Carpinteiro madeiramento',u:'h',c:8,p:18,t:'MO'},{n:'Manta asfáltica',u:'m²',c:.3,p:35,t:'MAT'}]},
  {phase:6, items:[{n:'Eletroduto PVC rígido Ø25',u:'m',c:3.5,p:6.5,t:'MAT'},{n:'Fio flexível 2,5mm²',u:'m',c:8,p:2.8,t:'MAT'},{n:'Disjuntor 16A bipolar',u:'un',c:.3,p:32,t:'MAT'},{n:'Eletricista (oficial)',u:'h',c:6,p:22,t:'MO'},{n:'Tomada/interruptor Nema',u:'un',c:.8,p:28,t:'MAT'}]},
  {phase:7, items:[{n:'Tubo PVC 25mm (água fria)',u:'m',c:4,p:8.5,t:'MAT'},{n:'Tubo PVC série N 100mm',u:'m',c:1.5,p:28,t:'MAT'},{n:'Caixa d\'água 1.000L',u:'un',c:.01,p:680,t:'MAT'},{n:'Encanador (oficial)',u:'h',c:6,p:22,t:'MO'},{n:'Fossa séptica 3.000L',u:'un',c:.01,p:2200,t:'MAT'}]},
  {phase:8, items:[{n:'Argamassa AC1 emboço',u:'sc 20kg',c:1.5,p:22,t:'MAT'},{n:'Gesso em pó reboque',u:'sc 20kg',c:1.2,p:18,t:'MAT'},{n:'Cerâmica/azulejo 30×45',u:'m²',c:.4,p:45,t:'MAT'},{n:'Pedreiro revestimentos',u:'h',c:8,p:17,t:'MO'},{n:'Servente',u:'h',c:5,p:10,t:'MO'}]},
  {phase:9, items:[{n:'Porta madeira maciça 80×210',u:'un',c:.07,p:680,t:'MAT'},{n:'Janela alumínio 100×80',u:'un',c:.05,p:520,t:'MAT'},{n:'Vidro temperado 6mm',u:'m²',c:.15,p:180,t:'MAT'},{n:'Montagem esquadrias',u:'un',c:.07,p:280,t:'MO'}]},
  {phase:10,items:[{n:'Fundo preparador p/ PVA',u:'L',c:.15,p:22,t:'MAT'},{n:'Tinta látex PVA interna',u:'L',c:.25,p:9,t:'MAT'},{n:'Tinta acrílica externa',u:'L',c:.15,p:15,t:'MAT'},{n:'Pintor (oficial) m²',u:'m²',c:1,p:15,t:'MO'}]},
  {phase:11,items:[{n:'Porcelanato polido 60×60',u:'m²',c:1.05,p:95,t:'MAT'},{n:'Argamassa AC-II colante',u:'sc',c:.06,p:28,t:'MAT'},{n:'Rejunte cimentício',u:'kg',c:.08,p:8,t:'MAT'},{n:'Ladrilhista',u:'m²',c:1,p:20,t:'MO'},{n:'Contrapiso (concreto magro)',u:'m²',c:1,p:32,t:'MAT'}]},
  {phase:12,items:[{n:'Bacia sanitária c/ caixa',u:'un',c:.013,p:520,t:'MAT'},{n:'Lavatório louça branca',u:'un',c:.013,p:280,t:'MAT'},{n:'Chuveiro elétrico 7500W',u:'un',c:.013,p:160,t:'MAT'},{n:'Torneira bica alta',u:'un',c:.02,p:180,t:'MAT'},{n:'Instalador hidráulico',u:'h',c:3,p:22,t:'MO'}]},
  {phase:13,items:[{n:'Textura acrílica fachada',u:'m²',c:.3,p:65,t:'MAT'},{n:'Concreto fck20 (calçada)',u:'m³',c:.03,p:380,t:'MAT'},{n:'Bloco vedação 14×19×39',u:'m²',c:.15,p:85,t:'MAT'},{n:'Pedreiro fachada/calçada',u:'h',c:4,p:17,t:'MO'},{n:'Portão metálico 3×2m',u:'un',c:.007,p:2800,t:'MAT'}]},
  {phase:14,items:[{n:'Limpeza pós-obra',u:'m²',c:1,p:12,t:'MO'},{n:'Produtos de limpeza',u:'vb',c:1,p:180,t:'MAT'},{n:'Ajustes finais (pedreiro)',u:'d',c:3,p:380,t:'MO'}]},
]

export default function ComposicoesPage() {
  const calc    = useCalc()
  const current = useProjectStore(s => s.current)
  if (!current || !calc) return <EmptyState icon="🔩" title="Nenhum projeto aberto" />
  const { phaseData, cfg } = calc

  return (
    <div className="space-y-2">
      <div className="text-xs text-tx3 px-1 mb-2">
        Insumos por etapa com coeficientes de consumo · ref. <strong className="text-tx2">SINAPI/TCPO</strong> · Campo Grande-MS 2026 · valores por m² construído
      </div>
      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Etapa / Insumo</Th>
              <Th center>Un.</Th>
              <Th right>Coef.</Th>
              <Th right>Preço Un.</Th>
              <Th right>Subtotal</Th>
              <Th center>Tipo</Th>
            </tr>
          </thead>
          <tbody>
            {CPU_DATA.map(cd => {
              const p   = phaseData[cd.phase]
              return (
                <>
                  {/* Phase header row */}
                  <tr key={`ph-${cd.phase}`} className="bg-bg2">
                    <td colSpan={6} className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: PHASES_DEF[cd.phase].color }} />
                        <span className="font-condensed font-bold text-sm uppercase">{PHASES_DEF[cd.phase].name}</span>
                        <span className="text-[10px] text-tx3 flex-1">{PHASES_DEF[cd.phase].sub}</span>
                        <span className="font-mono text-xs font-bold text-amber">{fmtBRL(p.total)}</span>
                      </div>
                    </td>
                  </tr>
                  {/* Item rows */}
                  {cd.items.map((item, ii) => {
                    const sub = item.c * item.p * cfg.area
                    return (
                      <tr key={`${cd.phase}-${ii}`} className="hover:bg-white/[.01]">
                        <Td className="pl-8">
                          <span className="text-[10px] text-tx3 mr-2">↳</span>
                          <span className="text-xs">{item.n}</span>
                        </Td>
                        <Td center><span className="font-mono text-[10px] text-tx3">{item.u}</span></Td>
                        <Td right><span className="font-mono text-xs">{item.c}</span></Td>
                        <Td right><span className="font-mono text-xs">{fmtBRL(item.p)}</span></Td>
                        <Td right><span className="font-mono text-xs font-semibold">{fmtK(sub)}</span></Td>
                        <Td center>
                          <span className={`font-mono text-[9px] px-2 py-0.5 rounded ${item.t==='MO' ? 'bg-mo/15 text-mo' : 'bg-mat/15 text-mat'}`}>
                            {item.t}
                          </span>
                        </Td>
                      </tr>
                    )
                  })}
                </>
              )
            })}
          </tbody>
        </Table>
      </Card>
    </div>
  )
}
