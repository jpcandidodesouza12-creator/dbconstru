// frontend/src/app/(app)/projetos/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProjectStore } from '@/store/project.store'
import { Card, CardBody, Button, EmptyState, Spinner, Badge } from '@/components/ui'
import { Project } from '@/types'
import { fmtK } from '@/hooks/useCalc'
import { COST_M2 } from '@/hooks/useCalc'
import toast from 'react-hot-toast'

const STATUS_LABEL: Record<string, string> = {
  PLANNING: 'Planejamento', IN_PROGRESS: 'Em andamento',
  PAUSED: 'Pausado', COMPLETED: 'Concluído', CANCELLED: 'Cancelado',
}
const STATUS_COLOR: Record<string, 'amber'|'green'|'blue'|'gray'|'red'> = {
  PLANNING: 'amber', IN_PROGRESS: 'green', PAUSED: 'gray', COMPLETED: 'green', CANCELLED: 'red',
}

export default function ProjetosPage() {
  const router = useRouter()
  const { projects, current, isLoading, fetchProjects, createProject, updateProject, deleteProject, fetchProject } = useProjectStore()
  const [creating,  setCreating]  = useState(false)
  const [newName,   setNewName]   = useState('')
  const [editId,    setEditId]    = useState<string | null>(null)
  const [editName,  setEditName]  = useState('')

  useEffect(() => { fetchProjects() }, [fetchProjects])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const p = await createProject(newName.trim())
      setNewName('')
      toast.success('Projeto criado!')
      router.push('/dashboard')
    } catch { toast.error('Erro ao criar projeto') }
    finally { setCreating(false) }
  }

  async function handleRename(id: string) {
    if (!editName.trim()) { setEditId(null); return }
    try {
      await updateProject(id, { name: editName.trim() })
      toast.success('Nome atualizado')
    } catch { toast.error('Erro ao renomear') }
    setEditId(null)
  }

  async function handleOpen(id: string) {
    await fetchProject(id)
    router.push('/dashboard')
  }

  async function handleDelete(p: Project) {
    if (!confirm(`Excluir o projeto "${p.name}"? Esta ação não pode ser desfeita.`)) return
    try { await deleteProject(p.id) }
    catch (e: any) { toast.error(e?.response?.data?.error?.message || 'Erro ao excluir') }
  }

  const stdLabel = { LOW: 'Simples', MED: 'Médio', HIGH: 'Alto' }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-condensed text-2xl font-bold uppercase">Meus Projetos</h1>
        <p className="text-sm text-tx2 mt-1">Gerencie todos os seus orçamentos de obras</p>
      </div>

      {/* Create new */}
      <Card accent="#f0a500">
        <CardBody>
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="Nome do novo projeto (ex: Casa Térrea 150m² — Campo Grande)"
              className="flex-1 bg-bg2 border border-line2 rounded-lg px-4 py-3 text-sm text-tx outline-none focus:border-amber transition-colors"
            />
            <Button type="submit" loading={creating} disabled={!newName.trim()}>
              + Criar Projeto
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : projects.length === 0 ? (
        <EmptyState icon="🏗️" title="Nenhum projeto ainda" desc="Crie seu primeiro projeto acima." />
      ) : (
        <div className="space-y-3">
          {projects.map(p => {
            const isActive = current?.id === p.id
            const config   = p.config as any
            const area     = config?.area || p.area
            const std      = config?.std || p.standard?.toLowerCase()
            const estimVal = area * (COST_M2[std as keyof typeof COST_M2] || COST_M2.med)
            return (
              <Card key={p.id} accent={isActive ? '#f0a500' : undefined}>
                <CardBody>
                  <div className="flex items-start gap-4 flex-wrap">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-bg3 border border-line2 flex items-center justify-center text-2xl flex-shrink-0">🏠</div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {editId === p.id ? (
                        <div className="flex gap-2 mb-1">
                          <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleRename(p.id); if (e.key === 'Escape') setEditId(null) }}
                            className="font-condensed text-lg font-bold bg-bg2 border border-amber rounded px-2 py-0.5 text-tx outline-none flex-1"
                          />
                          <Button size="sm" onClick={() => handleRename(p.id)}>✓</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>✕</Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-condensed text-lg font-bold">{p.name}</h3>
                          {isActive && <Badge color="amber">Aberto</Badge>}
                          <Badge color={STATUS_COLOR[p.status] || 'gray'}>{STATUS_LABEL[p.status] || p.status}</Badge>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-3 text-xs text-tx3">
                        <span className="font-mono">{area}m²</span>
                        <span>·</span>
                        <span>Padrão {stdLabel[std?.toUpperCase() as keyof typeof stdLabel] || 'Médio'}</span>
                        <span>·</span>
                        <span className="font-mono text-amber">{fmtK(estimVal)}</span>
                        <span>·</span>
                        <span>Atualizado {new Date(p.updatedAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0 flex-wrap">
                      {!isActive && (
                        <Button size="sm" onClick={() => handleOpen(p.id)}>📂 Abrir</Button>
                      )}
                      <Button size="sm" variant="secondary" onClick={() => { setEditId(p.id); setEditName(p.name) }}>✏ Renomear</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(p)}>🗑 Excluir</Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
