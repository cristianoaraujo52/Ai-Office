import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'
import { useData } from '../../contexts/DataContext'
import type { Modulo } from '../../types'

export default function AdminModulos() {
  const { modulos: dbModulos, saveModulo, deleteModulo, isOffline } = useData()
  const [modulos, setModulos] = useState<Modulo[]>(dbModulos)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Modulo | null>(null)
  const [form, setForm] = useState({ titulo: '', descricao: '', carga_horaria: 4, cover_image: '' })
  const [saving, setSaving] = useState(false)

  // Sync when data from context loads/changes
  useEffect(() => { if (dbModulos.length) setModulos(dbModulos) }, [dbModulos])

  const openNew = () => {
    setEditing(null)
    setForm({ titulo: '', descricao: '', carga_horaria: 4, cover_image: '' })
    setShowModal(true)
  }
  const openEdit = (m: Modulo) => {
    setEditing(m)
    setForm({ titulo: m.titulo, descricao: m.descricao, carga_horaria: m.carga_horaria, cover_image: m.cover_image || '' })
    setShowModal(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      const newId = editing?.id ?? `m${Date.now()}`
      const payload = {
        id: newId,
        ...form,
        cover_image: form.cover_image || undefined,
        ordem: editing?.ordem ?? modulos.length + 1,
        ativo: editing?.ativo ?? true,
      }
      await saveModulo(payload)
      // In offline mode: update local state manually (Supabase mode updates via useEffect)
      if (isOffline) {
        if (editing) {
          setModulos(prev => prev.map(m => m.id === editing.id ? { ...m, ...payload } as Modulo : m))
        } else {
          setModulos(prev => [...prev, { ...payload, created_at: new Date().toISOString(), aulas: [] } as Modulo])
        }
      }
    } finally {
      setSaving(false)
      setShowModal(false)
    }
  }

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(p => ({ ...p, cover_image: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  const toggleAtivo = async (id: string) => {
    const m = modulos.find(x => x.id === id)
    if (!m) return
    setModulos(prev => prev.map(x => x.id === id ? { ...x, ativo: !x.ativo } : x))
    await saveModulo({ id, ativo: !m.ativo }).catch(() => {
      setModulos(prev => prev.map(x => x.id === id ? { ...x, ativo: m.ativo } : x))
    })
  }
  const del = async (id: string) => {
    if (!confirm('Excluir este módulo e todas as suas aulas?')) return
    setModulos(prev => prev.filter(m => m.id !== id))
    await deleteModulo(id).catch(() => setModulos(dbModulos))
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar isAdmin />
      <div className="flex-1 ml-0 md:ml-[280px] flex flex-col">
        <TopBar title="Gerenciar Módulos" subtitle={isOffline ? '⚠️ Modo offline — configure o Supabase para persistir dados' : 'Crie e edite os módulos do curso'} />
        <main className="flex-1 p-8 fade-in">
          <div className="flex justify-between items-center mb-6">
            <p className="text-white/50 text-sm">{modulos.length} módulos cadastrados</p>
            <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#8b5cf6] text-white rounded-lg text-sm font-medium hover:bg-[#7c3aed] transition-all">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
              Novo Módulo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modulos.map(m => (
              <div key={m.id} className={`bg-[#1e293b] border rounded-xl overflow-hidden space-y-0 transition-all ${m.ativo ? 'border-white/5 hover:border-white/10' : 'border-white/3 opacity-50'}`}>
                {/* Cover thumbnail */}
                <div className="relative w-full aspect-video bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e1b4b] overflow-hidden">
                  {m.cover_image && (
                    <img src={m.cover_image} alt={m.titulo} className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-transparent to-transparent" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/40 backdrop-blur rounded-md text-white text-[10px] font-bold">
                    {m.titulo.split(' - ')[0]}
                  </span>
                </div>
                <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold text-sm">{m.titulo.split(' - ')[1] || m.titulo}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${m.ativo ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/30'}`}>
                    {m.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p className="text-white/40 text-xs">{m.descricao}</p>
                <div className="flex items-center gap-3 text-white/30 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>menu_book</span>
                    {m.aulas?.length || 0} aulas
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>schedule</span>
                    {m.carga_horaria}h
                  </span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => openEdit(m)} className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-[#334155] rounded-lg text-white/50 text-xs hover:text-white hover:border-white/20 transition-all">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                    Editar
                  </button>
                  <button onClick={() => toggleAtivo(m.id)} className="py-1.5 px-3 border border-[#334155] rounded-lg text-white/50 text-xs hover:text-white hover:border-white/20 transition-all">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{m.ativo ? 'visibility_off' : 'visibility'}</span>
                  </button>
                  <button onClick={() => del(m.id)} className="py-1.5 px-3 border border-red-500/20 rounded-lg text-red-400/50 text-xs hover:text-red-400 hover:border-red-500/40 transition-all">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                  </button>
                </div>
                </div>{/* end p-4 */}
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">{editing ? 'Editar Módulo' : 'Novo Módulo'}</h3>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>
            <div className="space-y-4">
              {editing && (
                <div className="bg-[#0f172a] border border-[#334155] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-white font-medium text-sm">Aulas deste modulo</h4>
                      <p className="text-white/35 text-xs mt-0.5">
                        {editing.aulas?.length || 0} aula{(editing.aulas?.length || 0) === 1 ? '' : 's'} cadastrada{(editing.aulas?.length || 0) === 1 ? '' : 's'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/modulo/${editing.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-white/10 rounded-lg text-white/60 text-xs hover:text-white hover:bg-white/5 transition-all"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>visibility</span>
                        Ver modulo
                      </Link>
                      <Link
                        to={`/admin/aulas?modulo=${editing.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#8b5cf6] rounded-lg text-white text-xs font-medium hover:bg-[#7c3aed] transition-all"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit_note</span>
                        Gerenciar aulas
                      </Link>
                    </div>
                  </div>

                  {(editing.aulas?.length || 0) > 0 ? (
                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                      {editing.aulas?.map(aula => (
                        <div key={aula.id} className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] rounded-lg">
                          <span className="w-6 h-6 rounded-md bg-[#8b5cf6]/15 text-[#8b5cf6] text-xs font-bold flex items-center justify-center shrink-0">
                            {aula.ordem}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-white/80 text-xs font-medium truncate">{aula.titulo}</p>
                            <p className="text-white/30 text-[10px] truncate">{aula.descricao}</p>
                          </div>
                          <Link
                            to={`/aula/${aula.id}`}
                            className="p-1 text-white/35 hover:text-white transition-colors"
                            title="Ver aula"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-white/25 text-xs border border-dashed border-white/10 rounded-lg">
                      Nenhuma aula neste modulo ainda.
                    </div>
                  )}
                </div>
              )}

              {/* Cover image upload */}
              <div>
                <label className="block text-white/50 text-xs mb-1.5">Imagem de Capa (16:9)</label>
                <div className="flex gap-3 items-start">
                  <div className="w-40 aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e1b4b] border border-white/10 shrink-0 relative">
                    {form.cover_image ? (
                      <img src={form.cover_image} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white/20" style={{ fontSize: '28px' }}>image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    <label className="flex items-center gap-1.5 px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white/50 text-xs cursor-pointer hover:text-white hover:border-[#8b5cf6]/40 transition-all w-fit">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>upload</span>
                      {form.cover_image ? 'Trocar imagem' : 'Fazer upload'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                    </label>
                    {form.cover_image && (
                      <button
                        onClick={() => setForm(p => ({ ...p, cover_image: '' }))}
                        className="text-red-400/50 text-xs hover:text-red-400 transition-colors flex items-center gap-1 w-fit"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>close</span>
                        Remover capa
                      </button>
                    )}
                    <p className="text-white/20 text-[10px] leading-relaxed max-w-[140px]">
                      PNG, JPG ou WEBP.<br/>Recomendado: 1280×720px
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-white/50 text-xs mb-1.5">Título</label>
                <input value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  placeholder="Ex: M01 - Fundamentos da IA" />
              </div>
              <div>
                <label className="block text-white/50 text-xs mb-1.5">Descrição</label>
                <textarea value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] resize-none transition-colors h-24"
                  placeholder="Descrição do módulo..." />
              </div>
              <div>
                <label className="block text-white/50 text-xs mb-1.5">Carga Horária (horas)</label>
                <input type="number" value={form.carga_horaria} onChange={e => setForm(p => ({ ...p, carga_horaria: Number(e.target.value) }))}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  min={1} max={20} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-[#334155] rounded-lg text-white/50 text-sm hover:text-white hover:border-white/20 transition-all">
                Cancelar
              </button>
              <button onClick={save} disabled={saving} className="flex-1 py-2 bg-[#8b5cf6] text-white rounded-lg text-sm font-medium hover:bg-[#7c3aed] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }}>progress_activity</span>}
                {editing ? 'Salvar' : 'Criar Módulo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
