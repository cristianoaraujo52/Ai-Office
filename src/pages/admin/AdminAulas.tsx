import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'
import SlideRenderer from '../../components/SlideRenderer'
import { useData } from '../../contexts/DataContext'
import type { Aula, Material, Modulo, Slide } from '../../types'

type EditorTab = 'basico' | 'conteudo' | 'slides' | 'materiais' | 'audio'

const EMPTY_FORM = {
  titulo: '', descricao: '', descricao_curta: '', video_url: '',
  conteudo_html: '', duracao_min: 20, modulo_id: '',
  objetivo: '', passo_a_passo: [] as string[], dicas: [] as string[],
  erros_comuns: [] as string[], resumo: '', exercicio: '',
  narracao: '', resumo_audio: '', roteiro_video: '', atividade_pratica: '',
  video_titulo: '', video_canal: '', video_duracao: '',
  slides: [] as Slide[],
  materiais: [] as Material[],
}

type AulaForm = typeof EMPTY_FORM

function ArrayEditor({
  label, icon, values, placeholder, color = 'purple',
  onChange,
}: {
  label: string; icon: string; values: string[]; placeholder: string
  color?: 'purple' | 'amber' | 'red'; onChange: (v: string[]) => void
}) {
  const [newVal, setNewVal] = useState('')
  const colorMap = {
    purple: { dot: 'bg-[#8b5cf6]', btn: 'bg-[#8b5cf6] hover:bg-[#7c3aed]', ring: 'focus:border-[#8b5cf6]' },
    amber: { dot: 'bg-amber-400', btn: 'bg-amber-500 hover:bg-amber-600', ring: 'focus:border-amber-400' },
    red: { dot: 'bg-red-400', btn: 'bg-red-500 hover:bg-red-600', ring: 'focus:border-red-400' },
  }
  const c = colorMap[color]

  const add = () => {
    if (newVal.trim()) { onChange([...values, newVal.trim()]); setNewVal('') }
  }

  return (
    <div>
      <label className="flex items-center gap-1.5 text-white/50 text-xs mb-2">
        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{icon}</span>
        {label}
      </label>
      <div className="space-y-1.5 mb-2">
        {values.length === 0 && (
          <p className="text-white/20 text-xs italic px-1">Nenhum item ainda.</p>
        )}
        {values.map((v, i) => (
          <div key={i} className="flex items-center gap-2 group">
            <div className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
            <span className="flex-1 text-white/80 text-sm leading-snug">{v}</span>
            <button
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-red-400/60 hover:text-red-400 transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={newVal}
          onChange={e => setNewVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder}
          className={`flex-1 bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm focus:outline-none ${c.ring} transition-colors`}
        />
        <button
          onClick={add}
          className={`px-3 py-2 ${c.btn} text-white rounded-lg text-xs font-medium transition-colors`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
        </button>
      </div>
    </div>
  )
}

function SlideEditorItem({
  slide, index, total, onSave, onDelete,
}: {
  slide: Slide; index: number; total: number; onSave: (s: Slide) => void; onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const [local, setLocal] = useState({
    titulo: slide.titulo,
    texto: slide.texto,
    imagem_url: slide.imagem_url || '',
  })

  // Live preview slide built from current local state
  const previewSlide: Slide = {
    ...slide,
    titulo: local.titulo || 'Slide sem título',
    texto: local.texto || '',
    imagem_url: local.imagem_url || undefined,
  }

  const save = () => {
    onSave({ ...slide, titulo: local.titulo, texto: local.texto, imagem_url: local.imagem_url || undefined })
    setOpen(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setLocal(p => ({ ...p, imagem_url: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  return (
    <div className="bg-[#0f172a] border border-white/5 rounded-xl overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.03] transition-colors"
        onClick={() => setOpen(!open)}
      >
        {/* Drag handle */}
        <span
          className="material-symbols-outlined text-white/20 hover:text-white/50 cursor-grab active:cursor-grabbing shrink-0 select-none"
          style={{ fontSize: '18px' }}
          onClick={e => e.stopPropagation()}
        >
          drag_indicator
        </span>
        <div className="w-7 h-7 rounded-lg bg-[#8b5cf6]/15 flex items-center justify-center text-[#8b5cf6] text-xs font-bold shrink-0">
          {index + 1}
        </div>
        <span className="flex-1 text-white text-sm font-medium truncate">{slide.titulo || 'Slide sem título'}</span>
        <span className={`material-symbols-outlined text-white/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} style={{ fontSize: '18px' }}>
          expand_more
        </span>
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="p-1 text-red-400/40 hover:text-red-400 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
        </button>
      </div>

      {/* Editor + Live Preview (split view) */}
      {open && (
        <div className="border-t border-white/5">
          <div className="grid grid-cols-2 gap-0">
            {/* Left: Editor */}
            <div className="px-4 pb-4 pt-3 space-y-3 border-r border-white/5">
              <p className="text-white/30 text-[10px] uppercase tracking-widest font-medium flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>edit</span>
                Editor
              </p>
              <div>
                <label className="block text-white/40 text-xs mb-1">Título do Slide</label>
                <input
                  value={local.titulo}
                  onChange={e => setLocal(p => ({ ...p, titulo: e.target.value }))}
                  className="w-full bg-[#0a0c10] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
                />
              </div>
              <div>
                <label className="block text-white/40 text-xs mb-1">Conteúdo</label>
                <textarea
                  value={local.texto}
                  onChange={e => setLocal(p => ({ ...p, texto: e.target.value }))}
                  rows={7}
                  className="w-full bg-[#0a0c10] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#8b5cf6] resize-none transition-colors font-mono leading-relaxed"
                  placeholder={'• item 1\n• item 2\nChave: Valor\n\nTexto livre'}
                />
                <p className="text-white/20 text-[10px] mt-1 leading-relaxed">
                  <span className="text-white/40">•</span> bullets &nbsp;|&nbsp;
                  <span className="text-white/40">Chave: Valor</span> pares &nbsp;|&nbsp;
                  <span className="text-white/40">1. item</span> numerado &nbsp;|&nbsp;
                  texto livre
                </p>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-white/40 text-xs mb-1.5">Imagem lateral (opcional)</label>
                <div className="flex items-center gap-2">
                  {local.imagem_url && (
                    <div className="relative w-24 h-14 rounded-lg overflow-hidden shrink-0 border border-white/10">
                      <img src={local.imagem_url} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="flex items-center gap-1.5 px-3 py-2 bg-[#0a0c10] border border-[#334155] rounded-lg text-white/50 text-xs cursor-pointer hover:text-white hover:border-[#8b5cf6]/40 transition-all">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>upload</span>
                    {local.imagem_url ? 'Trocar imagem' : 'Adicionar imagem'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  {local.imagem_url && (
                    <button
                      onClick={() => setLocal(p => ({ ...p, imagem_url: '' }))}
                      className="text-red-400/50 text-xs hover:text-red-400 transition-colors flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>close</span>
                      Remover
                    </button>
                  )}
                </div>
                {local.imagem_url && (
                  <p className="text-white/20 text-[10px] mt-1">A imagem aparece no lado direito do slide</p>
                )}
              </div>

              <button
                onClick={save}
                className="w-full py-2 bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 text-[#8b5cf6] rounded-lg text-xs font-medium hover:bg-[#8b5cf6]/30 transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span>
                Aplicar alterações
              </button>
            </div>

            {/* Right: Live Preview */}
            <div className="px-4 pb-4 pt-3">
              <p className="text-white/30 text-[10px] uppercase tracking-widest font-medium flex items-center gap-1 mb-3">
                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>visibility</span>
                Preview ao vivo
              </p>
              <div className="transform scale-[0.72] origin-top-left w-[139%]">
                <SlideRenderer slide={previewSlide} index={index} total={total} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminAulas() {
  const { modulos: dbModulos, saveAula, deleteAula, isOffline } = useData()
  const [searchParams] = useSearchParams()
  const [modulos, setModulos] = useState<Modulo[]>(dbModulos)
  const [selectedModulo, setSelectedModulo] = useState<string>(searchParams.get('modulo') || 'all')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Aula | null>(null)
  const [tab, setTab] = useState<EditorTab>('basico')
  const [form, setForm] = useState<AulaForm>({ ...EMPTY_FORM, modulo_id: dbModulos[0]?.id || '' })
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (dbModulos.length) {
      setModulos(dbModulos)
      if (!form.modulo_id && dbModulos[0]) setForm(f => ({ ...f, modulo_id: dbModulos[0].id }))
    }
  }, [dbModulos]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const moduloId = searchParams.get('modulo')
    if (moduloId) setSelectedModulo(moduloId)
  }, [searchParams])

  const allAulas = modulos.flatMap(m =>
    (m.aulas || []).map(a => ({ ...a, moduloTitulo: m.titulo, moduloId: m.id }))
  )

  const filtered = allAulas.filter(a => {
    const matchMod = selectedModulo === 'all' || a.modulo_id === selectedModulo
    const matchSearch = !search || a.titulo.toLowerCase().includes(search.toLowerCase())
    return matchMod && matchSearch
  })

  const openNew = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, modulo_id: modulos[0]?.id || '' })
    setTab('basico')
    setSaveError(null)
    setShowModal(true)
  }

  const openEdit = (a: Aula) => {
    setEditing(a)
    setForm({
      titulo: a.titulo, descricao: a.descricao, descricao_curta: a.descricao_curta || '',
      video_url: a.video_url, conteudo_html: a.conteudo_html, duracao_min: a.duracao_min,
      modulo_id: a.modulo_id, objetivo: a.objetivo || '',
      passo_a_passo: [...(a.passo_a_passo || [])],
      dicas: [...(a.dicas || [])],
      erros_comuns: [...(a.erros_comuns || [])],
      resumo: a.resumo || '', exercicio: a.exercicio || '',
      narracao: a.narracao || '', resumo_audio: a.resumo_audio || '',
      roteiro_video: a.roteiro_video || '', atividade_pratica: a.atividade_pratica || '',
      video_titulo: a.video_titulo || '', video_canal: a.video_canal || '',
      video_duracao: a.video_duracao || '',
      slides: [...(a.slides || [])],
      materiais: [...(a.materiais || [])],
    })
    setTab('basico')
    setSaveError(null)
    setShowModal(true)
  }

  const save = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      const id = editing?.id || `aula-${Date.now()}`
      const aulaPayload: Partial<Aula> & { id: string; modulo_id: string } = {
        ...form,
        id,
        modulo_id: form.modulo_id,
        ordem: editing?.ordem ?? 99,
        ativo: editing?.ativo ?? true,
        created_at: editing?.created_at ?? new Date().toISOString(),
        materiais: form.materiais.map(m => ({ ...m, aula_id: id })),
      }
      // Optimistic UI update (DataContext will also update for Supabase)
      if (editing) {
        setModulos(prev => prev.map(m => ({
          ...m, aulas: (m.aulas || []).map(a => a.id === editing.id ? { ...a, ...aulaPayload, slides: form.slides, materiais: aulaPayload.materiais } : a),
        })))
      } else {
        setModulos(prev => prev.map(m => m.id === form.modulo_id
          ? { ...m, aulas: [...(m.aulas || []), { ...aulaPayload, slides: form.slides, materiais: aulaPayload.materiais } as Aula] }
          : m
        ))
      }
      await saveAula(aulaPayload, form.slides)
      setShowModal(false)
    } catch (err) {
      setModulos(dbModulos)
      const msg = err instanceof Error ? err.message : String(err)
      setSaveError(/row-level security|permission denied/i.test(msg)
        ? 'Sem permissão para gravar: sua conta não está como admin no banco. Rode supabase/corrigir-permissoes-admin.sql e entre de novo.'
        : `Não foi possível salvar: ${msg}`)
    } finally {
      setSaving(false)
    }
  }

  const del = async (id: string) => {
    if (!confirm('Excluir esta aula?')) return
    setModulos(prev => prev.map(m => ({ ...m, aulas: (m.aulas || []).filter(a => a.id !== id) })))
    await deleteAula(id).catch(() => setModulos(dbModulos))
  }

  // Drag & drop state for slides
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  const reorderSlides = (from: number, to: number) => {
    if (from === to) return
    const slides = [...form.slides]
    const [item] = slides.splice(from, 1)
    slides.splice(to, 0, item)
    setForm(p => ({ ...p, slides: slides.map((s, i) => ({ ...s, ordem: i + 1 })) }))
  }

  // Slide helpers
  const addSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      aula_id: editing?.id || 'new',
      titulo: 'Novo Slide',
      texto: '• Item 1\n• Item 2\n• Item 3',
      ordem: form.slides.length + 1,
    }
    setForm(p => ({ ...p, slides: [...p.slides, newSlide] }))
  }

  const updateSlide = (index: number, s: Slide) => {
    setForm(p => ({ ...p, slides: p.slides.map((sl, i) => i === index ? s : sl) }))
  }

  const deleteSlide = (index: number) => {
    setForm(p => ({ ...p, slides: p.slides.filter((_, i) => i !== index) }))
  }

  const addMaterial = () => {
    const newMaterial: Material = {
      id: `material-${Date.now()}`,
      aula_id: editing?.id || 'new',
      titulo: 'Novo material',
      tipo: 'link',
      url: '',
    }
    setForm(p => ({ ...p, materiais: [...p.materiais, newMaterial] }))
  }

  const updateMaterial = (index: number, material: Material) => {
    setForm(p => ({
      ...p,
      materiais: p.materiais.map((m, i) => i === index ? material : m),
    }))
  }

  const deleteMaterial = (index: number) => {
    setForm(p => ({ ...p, materiais: p.materiais.filter((_, i) => i !== index) }))
  }

  const f = (key: keyof AulaForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }))

  const tabs: { id: EditorTab; label: string; icon: string; count?: number }[] = [
    { id: 'basico', label: 'Básico', icon: 'info' },
    { id: 'conteudo', label: 'Conteúdo Didático', icon: 'menu_book' },
    { id: 'slides', label: 'Slides', icon: 'slideshow', count: form.slides.length },
    { id: 'materiais', label: 'Materiais', icon: 'folder_open', count: form.materiais.length },
    { id: 'audio', label: 'Áudio & Script', icon: 'mic' },
  ]

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar isAdmin />
      <div className="flex-1 min-w-0 ml-0 md:ml-[280px] flex flex-col">
        <TopBar title="Gerenciar Aulas" subtitle="Edite o conteúdo didático completo" />
        <main className="flex-1 p-8 fade-in">

          {/* Header bar */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex-1 relative min-w-[200px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30" style={{ fontSize: '16px' }}>search</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar aulas..."
                className="w-full bg-[#1e293b] border border-white/5 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedModulo('all')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${selectedModulo === 'all' ? 'bg-[#8b5cf6] text-white' : 'bg-[#1e293b] border border-[#334155] text-white/50 hover:text-white'}`}
              >
                Todos ({allAulas.length})
              </button>
              {modulos.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModulo(m.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${selectedModulo === m.id ? 'bg-[#8b5cf6] text-white' : 'bg-[#1e293b] border border-[#334155] text-white/50 hover:text-white'}`}
                >
                  {m.titulo.split(' - ')[0]} ({m.aulas?.length || 0})
                </button>
              ))}
            </div>
            <button
              onClick={openNew}
              className="flex items-center gap-2 px-4 py-2 bg-[#8b5cf6] text-white rounded-lg text-sm font-medium hover:bg-[#7c3aed] transition-all shrink-0"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
              Nova Aula
            </button>
          </div>

          {/* Table */}
          <div className="bg-[#1e293b] border border-white/5 rounded-xl overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="border-b border-white/5">
                  {['Título', 'Módulo', 'Duração', 'Slides', 'Quiz', 'Áudio', 'Ações'].map(h => (
                    <th key={h} className="py-3 px-5 text-white/30 text-xs uppercase tracking-wider font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-white/20 text-sm">
                      Nenhuma aula encontrada.
                    </td>
                  </tr>
                ) : filtered.map(a => (
                  <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-5">
                      <button type="button" onClick={() => openEdit(a)} title="Editar aula (vídeo, textos, slides)"
                        className="text-white text-sm font-medium text-left hover:text-[#8b5cf6] transition-colors">
                        {a.titulo}
                      </button>
                      <p className="text-white/30 text-xs truncate max-w-[220px]">{a.descricao}</p>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 bg-[#8b5cf6]/10 text-[#8b5cf6] text-xs rounded-lg">
                        {(a as any).moduloTitulo?.split(' - ')[0]}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-white/50 text-sm">{a.duracao_min} min</td>
                    <td className="py-3.5 px-5">
                      <span className={`text-sm font-medium ${(a.slides?.length || 0) > 0 ? 'text-emerald-400' : 'text-white/20'}`}>
                        {a.slides?.length || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      {a.quiz ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-white/10 inline-block" />
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      {a.narracao ? (
                        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-white/10 inline-block" />
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex gap-1">
                        <Link
                          to={`/aula/${a.id}`}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-white/5 border border-white/10 text-white/60 rounded-lg text-xs hover:text-white hover:bg-white/10 transition-all"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>visibility</span>
                          Ver aula
                        </Link>
                        <button
                          onClick={() => openEdit(a)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#8b5cf6] rounded-lg text-xs hover:bg-[#8b5cf6]/20 transition-all"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                          Editar
                        </button>
                        <button
                          onClick={() => del(a.id)}
                          className="p-1.5 text-red-400/40 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Full-screen Editor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl fade-in">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
              <div>
                <h3 className="text-white font-bold text-lg">
                  {editing ? `Editando: ${editing.titulo}` : 'Nova Aula'}
                </h3>
                <p className="text-white/30 text-xs mt-0.5">
                  {editing ? `ID: ${editing.id} · ${form.slides.length} slides` : 'Preencha as informações abaixo'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white transition-colors p-1">
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>close</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/5 shrink-0 px-4">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm transition-all border-b-2 -mb-px ${
                    tab === t.id
                      ? 'border-[#8b5cf6] text-white font-medium'
                      : 'border-transparent text-white/40 hover:text-white/70'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{t.icon}</span>
                  {t.label}
                  {t.count !== undefined && t.count > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#8b5cf6]/20 text-[#8b5cf6] text-[10px] font-bold">
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-6">

              {/* ─── TAB: BÁSICO ─── */}
              {tab === 'basico' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-white/50 text-xs mb-1.5">Título da Aula *</label>
                    <input value={form.titulo} onChange={f('titulo')}
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
                      placeholder="Ex: O que é Inteligência Artificial?" />
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs mb-1.5">Módulo</label>
                    <select value={form.modulo_id} onChange={e => setForm(p => ({ ...p, modulo_id: e.target.value }))}
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors">
                      {modulos.map(m => <option key={m.id} value={m.id}>{m.titulo}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs mb-1.5">Duração (min)</label>
                    <input type="number" value={form.duracao_min} onChange={e => setForm(p => ({ ...p, duracao_min: Number(e.target.value) }))}
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
                      min={1} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-white/50 text-xs mb-1.5">Descrição (sidebar / lista)</label>
                    <input value={form.descricao} onChange={f('descricao')}
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
                      placeholder="Breve descrição exibida nos cards" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-white/50 text-xs mb-1.5">Descrição curta (banner da aula)</label>
                    <input value={form.descricao_curta} onChange={f('descricao_curta')}
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
                      placeholder="Texto de destaque exibido no topo da aula" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-white/50 text-xs mb-1.5">URL do Vídeo YouTube</label>
                    <input value={form.video_url} onChange={f('video_url')}
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
                      placeholder="https://www.youtube.com/watch?v=..." />
                    {form.video_url && (
                      <p className="text-[#8b5cf6] text-xs mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>check_circle</span>
                        URL detectada
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs mb-1.5">Título do Vídeo</label>
                    <input value={form.video_titulo} onChange={f('video_titulo')}
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
                      placeholder="Nome exibido no player" />
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs mb-1.5">Canal / Duração</label>
                    <div className="flex gap-2">
                      <input value={form.video_canal} onChange={f('video_canal')}
                        className="flex-1 bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
                        placeholder="Canal" />
                      <input value={form.video_duracao} onChange={f('video_duracao')}
                        className="w-24 bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
                        placeholder="12:34" />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-white/50 text-xs mb-1.5">Conteúdo HTML (aba Conteúdo)</label>
                    <textarea value={form.conteudo_html} onChange={f('conteudo_html')}
                      rows={6}
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] resize-none transition-colors font-mono"
                      placeholder="<h2>Título</h2><p>Conteúdo em HTML...</p>" />
                  </div>
                </div>
              )}

              {/* ─── TAB: CONTEÚDO DIDÁTICO ─── */}
              {tab === 'conteudo' && (
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center gap-1.5 text-white/50 text-xs mb-1.5">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>flag</span>
                      Objetivo da Aula
                    </label>
                    <textarea value={form.objetivo} onChange={f('objetivo')}
                      rows={3}
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] resize-none transition-colors"
                      placeholder="Ao final desta aula, você será capaz de..." />
                  </div>

                  <ArrayEditor
                    label="Passo a Passo" icon="route" color="purple"
                    values={form.passo_a_passo}
                    placeholder="Descreva um passo..."
                    onChange={v => setForm(p => ({ ...p, passo_a_passo: v }))}
                  />

                  <ArrayEditor
                    label="Dicas Práticas" icon="lightbulb" color="amber"
                    values={form.dicas}
                    placeholder="Adicione uma dica..."
                    onChange={v => setForm(p => ({ ...p, dicas: v }))}
                  />

                  <ArrayEditor
                    label="Erros Comuns (evite!)" icon="warning" color="red"
                    values={form.erros_comuns}
                    placeholder="Descreva um erro comum..."
                    onChange={v => setForm(p => ({ ...p, erros_comuns: v }))}
                  />

                  <div>
                    <label className="flex items-center gap-1.5 text-white/50 text-xs mb-1.5">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>summarize</span>
                      Resumo da Aula
                    </label>
                    <textarea value={form.resumo} onChange={f('resumo')}
                      rows={4}
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] resize-none transition-colors"
                      placeholder="Resumo do conteúdo apresentado..." />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-white/50 text-xs mb-1.5">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>assignment</span>
                      Exercício Prático
                    </label>
                    <textarea value={form.exercicio} onChange={f('exercicio')}
                      rows={4}
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] resize-none transition-colors"
                      placeholder="Descrição do exercício para o aluno..." />
                  </div>
                </div>
              )}

              {/* ─── TAB: SLIDES ─── */}
              {tab === 'slides' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-white/50 text-sm">
                      {form.slides.length === 0
                        ? 'Nenhum slide ainda.'
                        : `${form.slides.length} slide${form.slides.length > 1 ? 's' : ''}`}
                    </p>
                    <button
                      onClick={addSlide}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#8b5cf6] text-white rounded-lg text-sm font-medium hover:bg-[#7c3aed] transition-all"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                      Novo Slide
                    </button>
                  </div>

                  {form.slides.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-white/10 rounded-xl">
                      <span className="material-symbols-outlined text-white/20 mb-2" style={{ fontSize: '40px' }}>slideshow</span>
                      <p className="text-white/30 text-sm">Clique em "Novo Slide" para começar</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {form.slides.map((s, i) => (
                        <div
                          key={s.id}
                          draggable
                          onDragStart={() => setDragIdx(i)}
                          onDragOver={e => { e.preventDefault(); setDragOverIdx(i) }}
                          onDragEnd={() => { setDragIdx(null); setDragOverIdx(null) }}
                          onDrop={e => { e.preventDefault(); if (dragIdx !== null) reorderSlides(dragIdx, i); setDragOverIdx(null) }}
                          className={`transition-all duration-150 rounded-xl ${
                            dragIdx === i ? 'opacity-40 scale-[0.98]' : ''
                          } ${
                            dragOverIdx === i && dragIdx !== i
                              ? 'ring-2 ring-[#8b5cf6] ring-offset-1 ring-offset-[#0f172a]'
                              : ''
                          }`}
                        >
                          <SlideEditorItem
                            slide={s}
                            index={i}
                            total={form.slides.length}
                            onSave={updated => updateSlide(i, updated)}
                            onDelete={() => deleteSlide(i)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB: ÁUDIO & SCRIPT ─── */}
              {tab === 'materiais' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Materiais complementares</h4>
                      <p className="text-white/35 text-xs mt-1">
                        Links, PDFs, vídeos e arquivos exibidos na aba Conteúdo da aula.
                      </p>
                    </div>
                    <button
                      onClick={addMaterial}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#8b5cf6] text-white rounded-lg text-sm font-medium hover:bg-[#7c3aed] transition-all"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                      Novo Material
                    </button>
                  </div>

                  {form.materiais.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-white/10 rounded-xl">
                      <span className="material-symbols-outlined text-white/20 mb-2" style={{ fontSize: '40px' }}>folder_open</span>
                      <p className="text-white/30 text-sm">Nenhum material complementar cadastrado.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {form.materiais.map((material, index) => (
                        <div key={material.id} className="bg-[#0f172a] border border-white/5 rounded-xl p-4">
                          <div className="grid grid-cols-[1fr_140px_auto] gap-3 items-start">
                            <div className="space-y-2">
                              <label className="block text-white/40 text-xs">Título</label>
                              <input
                                value={material.titulo}
                                onChange={e => updateMaterial(index, { ...material, titulo: e.target.value })}
                                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
                                placeholder="Ex: Apostila da aula"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-white/40 text-xs">Tipo</label>
                              <select
                                value={material.tipo}
                                onChange={e => updateMaterial(index, { ...material, tipo: e.target.value as Material['tipo'] })}
                                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
                              >
                                <option value="link">Link</option>
                                <option value="pdf">PDF</option>
                                <option value="video">Vídeo</option>
                                <option value="outro">Outro</option>
                              </select>
                            </div>
                            <button
                              onClick={() => deleteMaterial(index)}
                              className="mt-6 p-2 text-red-400/50 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
                              title="Remover material"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                            </button>
                          </div>
                          <div className="mt-3">
                            <label className="block text-white/40 text-xs mb-2">URL</label>
                            <input
                              value={material.url}
                              onChange={e => updateMaterial(index, { ...material, url: e.target.value })}
                              className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
                              placeholder="https://..."
                            />
                          </div>
                          {material.url && (
                            <a
                              href={material.url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 inline-flex items-center gap-1.5 text-[#8b5cf6] text-xs hover:text-[#a78bfa] transition-colors"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>open_in_new</span>
                              Testar material
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === 'audio' && (
                <div className="space-y-5">
                  <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-2 text-xs text-amber-400/80">
                    <span className="material-symbols-outlined shrink-0" style={{ fontSize: '14px' }}>info</span>
                    Estes textos são exibidos na aba "Áudio" da aula e podem ser usados para gerar narração por TTS ou gravar áudio posteriormente.
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-white/50 text-xs mb-1.5">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>mic</span>
                      Narração completa
                    </label>
                    <textarea value={form.narracao} onChange={f('narracao')}
                      rows={6}
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] resize-none transition-colors"
                      placeholder="Texto completo para narração em áudio..." />
                    <p className="text-white/20 text-xs mt-1">
                      {form.narracao.split(' ').filter(Boolean).length} palavras · ~{Math.ceil(form.narracao.split(' ').filter(Boolean).length / 140)} min de áudio
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-white/50 text-xs mb-1.5">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>volume_up</span>
                      Resumo em áudio (versão curta)
                    </label>
                    <textarea value={form.resumo_audio} onChange={f('resumo_audio')}
                      rows={4}
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] resize-none transition-colors"
                      placeholder="Versão reduzida para podcast ou resumo em áudio..." />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-white/50 text-xs mb-1.5">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>videocam</span>
                      Roteiro de Vídeo
                    </label>
                    <textarea value={form.roteiro_video} onChange={f('roteiro_video')}
                      rows={6}
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] resize-none transition-colors font-mono"
                      placeholder="[ABERTURA] Olá! Hoje vamos falar sobre...&#10;[TELA: abrir ChatGPT]&#10;[VOZ] ..." />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-white/50 text-xs mb-1.5">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>school</span>
                      Atividade Prática (aba Atividade)
                    </label>
                    <textarea value={form.atividade_pratica} onChange={f('atividade_pratica')}
                      rows={5}
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] resize-none transition-colors"
                      placeholder="Descreva a atividade prática guiada..." />
                  </div>
                </div>
              )}
            </div>

            {saveError && (
              <div role="alert" className="mx-6 mb-2 px-4 py-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 text-sm">
                {saveError}
              </div>
            )}
            {/* Modal footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-white/5 shrink-0 bg-[#0a0c10] rounded-b-2xl">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-[#334155] rounded-lg text-white/50 text-sm hover:text-white hover:border-white/20 transition-all">
                Cancelar
              </button>
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 bg-[#8b5cf6] text-white rounded-lg text-sm font-bold hover:bg-[#7c3aed] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                <span className={`material-symbols-outlined ${saving ? 'animate-spin' : ''}`} style={{ fontSize: '18px' }}>{saving ? 'progress_activity' : 'save'}</span>
                {saving ? 'Salvando...' : editing ? 'Salvar Alterações' : 'Criar Aula'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
