import React, { useState, useEffect, useRef } from 'react'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'
import { useData } from '../../contexts/DataContext'
import type { Quiz, Pergunta, Opcao, Aula } from '../../types'
import { chatCompletion, isOpenAIConfigured } from '../../lib/openai'

type QuizMap = Record<string, Quiz>

const LETTERS = ['a', 'b', 'c', 'd'] as const
type Letter = typeof LETTERS[number]

const EMPTY_PERGUNTA = {
  texto: '',
  opcoes: ['', '', '', ''] as string[],
  resposta: 'a' as Letter,
}

function PerguntaCard({
  pergunta, index, onUpdate, onDelete,
}: {
  pergunta: Pergunta
  index: number
  onUpdate: (p: Pergunta) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState({
    texto: pergunta.texto,
    opcoes: pergunta.opcoes.map(o => o.texto),
    resposta: pergunta.resposta_correta as Letter,
  })

  const save = () => {
    const opcoes: Opcao[] = LETTERS.map((id, i) => ({ id, texto: local.opcoes[i] }))
    onUpdate({ ...pergunta, texto: local.texto, opcoes, resposta_correta: local.resposta })
    setEditing(false)
  }

  const cancel = () => {
    setLocal({
      texto: pergunta.texto,
      opcoes: pergunta.opcoes.map(o => o.texto),
      resposta: pergunta.resposta_correta as Letter,
    })
    setEditing(false)
  }

  return (
    <div className={`bg-[#0f172a] border rounded-xl overflow-hidden transition-all ${editing ? 'border-[#8b5cf6]/40' : 'border-white/5 hover:border-white/10'}`}>
      {/* Read mode */}
      {!editing && (
        <div className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <p className="text-white text-sm leading-snug">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#8b5cf6]/20 text-[#8b5cf6] text-xs font-bold mr-2 shrink-0">
                {index + 1}
              </span>
              {pergunta.texto}
            </p>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => setEditing(true)}
                className="p-1.5 text-white/30 hover:text-[#8b5cf6] hover:bg-[#8b5cf6]/10 rounded-lg transition-all"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 text-red-400/30 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {pergunta.opcoes.map(op => (
              <div
                key={op.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                  op.id === pergunta.resposta_correta
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-white/[0.03] text-white/40 border border-white/5'
                }`}
              >
                <span className="font-bold uppercase shrink-0">{op.id})</span>
                <span className="truncate">{op.texto}</span>
                {op.id === pergunta.resposta_correta && (
                  <span className="material-symbols-outlined ml-auto shrink-0" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit mode */}
      {editing && (
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#8b5cf6]/20 text-[#8b5cf6] text-xs font-bold">
              {index + 1}
            </span>
            <p className="text-[#8b5cf6] text-xs font-medium uppercase tracking-widest">Editando pergunta</p>
          </div>

          <div>
            <label className="block text-white/40 text-xs mb-1">Texto da Pergunta</label>
            <textarea
              value={local.texto}
              onChange={e => setLocal(p => ({ ...p, texto: e.target.value }))}
              rows={2}
              className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#8b5cf6] resize-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-white/40 text-xs">Opções — clique no ✓ para marcar a correta</label>
            {LETTERS.map((id, i) => (
              <div key={id} className="flex items-center gap-2">
                <button
                  onClick={() => setLocal(p => ({ ...p, resposta: id }))}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    local.resposta === id
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  {id.toUpperCase()}
                </button>
                <input
                  value={local.opcoes[i]}
                  onChange={e => {
                    const opcoes = [...local.opcoes]
                    opcoes[i] = e.target.value
                    setLocal(p => ({ ...p, opcoes }))
                  }}
                  className={`flex-1 border rounded-lg px-3 py-2 text-white text-sm focus:outline-none transition-colors ${
                    local.resposta === id
                      ? 'bg-emerald-500/5 border-emerald-500/30 focus:border-emerald-400'
                      : 'bg-[#1e293b] border-[#334155] focus:border-[#8b5cf6]'
                  }`}
                  placeholder={`Opção ${id.toUpperCase()}`}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={cancel}
              className="flex-1 py-2 border border-[#334155] rounded-lg text-white/40 text-xs hover:text-white hover:border-white/20 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={save}
              className="flex-1 py-2 bg-[#8b5cf6] text-white rounded-lg text-xs font-medium hover:bg-[#7c3aed] transition-all flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span>
              Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminQuizzes() {
  const { modulos: dbModulos, saveQuiz, deleteQuiz: ctxDeleteQuiz, isOffline } = useData()
  const [quizMap, setQuizMap] = useState<QuizMap>({})
  const [moduleFilter, setModuleFilter] = useState<string>('all')
  const [selectedAulaId, setSelectedAulaId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPergunta, setNewPergunta] = useState({ ...EMPTY_PERGUNTA })
  const [saving, setSaving] = useState(false)
  const [generatingAI, setGeneratingAI] = useState(false)
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync quizMap from context data (modulos have embedded quizzes)
  useEffect(() => {
    const map: QuizMap = {}
    dbModulos.forEach(m => {
      (m.aulas || []).forEach(a => { if (a.quiz) map[a.id] = a.quiz })
    })
    setQuizMap(map)
  }, [dbModulos])

  const allAulas: (Aula & { moduloTitulo: string; moduloId: string })[] = dbModulos.flatMap(m =>
    (m.aulas || []).map(a => ({ ...a, moduloTitulo: m.titulo, moduloId: m.id }))
  )

  const filteredAulas = moduleFilter === 'all'
    ? allAulas
    : allAulas.filter(a => a.modulo_id === moduleFilter)

  const selectedAula = allAulas.find(a => a.id === selectedAulaId) || null
  const selectedQuiz = selectedAulaId ? quizMap[selectedAulaId] || null : null

  const hasQuiz = (aulaId: string) => Boolean(quizMap[aulaId])
  const quizCount = (aulaId: string) => quizMap[aulaId]?.perguntas?.length || 0

  // Auto-save quiz to Supabase after changes
  const persistQuiz = (quiz: Quiz) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(async () => {
      setSaving(true)
      try { await saveQuiz(quiz) } finally { setSaving(false) }
    }, 800)
  }

  // Create a new quiz for an aula that doesn't have one
  const createQuiz = (aula: Aula) => {
    const quiz: Quiz = {
      id: `quiz-${aula.id}`,
      aula_id: aula.id,
      titulo: `Quiz: ${aula.titulo}`,
      perguntas: [],
    }
    setQuizMap(prev => ({ ...prev, [aula.id]: quiz }))
    setSelectedAulaId(aula.id)
    saveQuiz(quiz)
  }

  const addPergunta = () => {
    if (!selectedAulaId || !selectedQuiz) return
    const opcoes: Opcao[] = LETTERS.map((id, i) => ({ id, texto: newPergunta.opcoes[i] }))
    const p: Pergunta = {
      id: `p-${Date.now()}`,
      quiz_id: selectedQuiz.id,
      texto: newPergunta.texto,
      opcoes,
      resposta_correta: newPergunta.resposta,
      ordem: selectedQuiz.perguntas.length + 1,
    }
    const updated = { ...selectedQuiz, perguntas: [...selectedQuiz.perguntas, p] }
    setQuizMap(prev => ({ ...prev, [selectedAulaId]: updated }))
    setNewPergunta({ ...EMPTY_PERGUNTA })
    setShowAddModal(false)
    persistQuiz(updated)
  }

  const updatePergunta = (perguntaId: string, updated: Pergunta) => {
    if (!selectedAulaId || !selectedQuiz) return
    const newQuiz = {
      ...selectedQuiz,
      perguntas: selectedQuiz.perguntas.map(p => p.id === perguntaId ? updated : p),
    }
    setQuizMap(prev => ({ ...prev, [selectedAulaId]: newQuiz }))
    persistQuiz(newQuiz)
  }

  const deletePergunta = (perguntaId: string) => {
    if (!selectedAulaId || !selectedQuiz) return
    const newQuiz = {
      ...selectedQuiz,
      perguntas: selectedQuiz.perguntas.filter(p => p.id !== perguntaId),
    }
    setQuizMap(prev => ({ ...prev, [selectedAulaId]: newQuiz }))
    persistQuiz(newQuiz)
  }

  const deleteQuiz = (aulaId: string) => {
    const quiz = quizMap[aulaId]
    if (!quiz || !confirm('Excluir este quiz e todas as perguntas?')) return
    setQuizMap(prev => { const next = { ...prev }; delete next[aulaId]; return next })
    if (selectedAulaId === aulaId) setSelectedAulaId(null)
    ctxDeleteQuiz(quiz.id, aulaId)
  }

  const updateQuizTitle = (title: string) => {
    if (!selectedAulaId || !selectedQuiz) return
    const newQuiz = { ...selectedQuiz, titulo: title }
    setQuizMap(prev => ({ ...prev, [selectedAulaId]: newQuiz }))
    persistQuiz(newQuiz)
  }

  const gerarQuizComIA = async () => {
    if (!selectedAulaId || !selectedQuiz || !selectedAula) return
    setGeneratingAI(true)
    try {
      const context = [
        `Aula: ${selectedAula.titulo}`,
        selectedAula.descricao ? `Descrição: ${selectedAula.descricao}` : '',
        selectedAula.objetivo ? `Objetivo: ${selectedAula.objetivo}` : '',
        selectedAula.conteudo_html
          ? `Conteúdo: ${selectedAula.conteudo_html.replace(/<[^>]+>/g, ' ').slice(0, 2000)}`
          : '',
      ].filter(Boolean).join('\n')

      const prompt = `Crie exatamente 5 perguntas de múltipla escolha sobre o conteúdo abaixo.

${context}

Responda APENAS com JSON válido no formato:
[
  {
    "texto": "Pergunta aqui?",
    "opcoes": ["Opção A", "Opção B", "Opção C", "Opção D"],
    "resposta_correta": "a"
  }
]
A propriedade resposta_correta deve ser "a", "b", "c" ou "d" (letra minúscula).
Não inclua nenhum texto fora do JSON.`

      const raw = await chatCompletion(
        [{ role: 'user', content: prompt }],
        { model: 'gpt-4o-mini', temperature: 0.6, max_tokens: 1500 }
      )

      const parsed: Array<{ texto: string; opcoes: string[]; resposta_correta: string }> =
        JSON.parse(raw.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, ''))

      const novasPerguntas: Pergunta[] = parsed.map((q, i) => ({
        id: `p-ai-${Date.now()}-${i}`,
        quiz_id: selectedQuiz.id,
        texto: q.texto,
        opcoes: LETTERS.map((id, idx) => ({ id, texto: q.opcoes[idx] ?? '' })),
        resposta_correta: q.resposta_correta,
        ordem: (selectedQuiz.perguntas?.length ?? 0) + i + 1,
      }))

      const updated = { ...selectedQuiz, perguntas: [...(selectedQuiz.perguntas ?? []), ...novasPerguntas] }
      setQuizMap(prev => ({ ...prev, [selectedAulaId]: updated }))
      persistQuiz(updated)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      alert(`Erro ao gerar quiz: ${msg}`)
    } finally {
      setGeneratingAI(false)
    }
  }

  const withQuiz = allAulas.filter(a => hasQuiz(a.id)).length
  const totalPerguntas = Object.values(quizMap).reduce((s, q) => s + (q.perguntas?.length || 0), 0)

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar isAdmin />
      <div className="flex-1 ml-0 md:ml-[280px] flex flex-col">
        <TopBar title="Gerenciar Quizzes" subtitle={isOffline ? '⚠️ Modo offline — dados não persistidos' : saving ? '💾 Salvando...' : 'Crie, edite e organize os quizzes do curso'} />
        <main className="flex-1 flex flex-col fade-in overflow-hidden">

          {/* Stats bar */}
          <div className="px-8 pt-6 pb-4 flex gap-4">
            {[
              { icon: 'quiz', label: 'Total de Quizzes', value: withQuiz, color: 'text-[#8b5cf6]', bg: 'bg-[#8b5cf6]/10' },
              { icon: 'help', label: 'Total de Perguntas', value: totalPerguntas, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { icon: 'menu_book', label: 'Aulas sem Quiz', value: allAulas.length - withQuiz, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3 bg-[#1e293b] border border-white/5 rounded-xl px-4 py-3">
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <span className={`material-symbols-outlined ${s.color}`} style={{ fontSize: '18px' }}>{s.icon}</span>
                </div>
                <div>
                  <p className={`font-bold text-lg ${s.color}`}>{s.value}</p>
                  <p className="text-white/30 text-xs">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-1 overflow-hidden px-8 pb-8 gap-5">

            {/* Left panel: aula list */}
            <div className="w-56 shrink-0 flex flex-col gap-3 overflow-hidden">
              {/* Module filter */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setModuleFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${moduleFilter === 'all' ? 'bg-[#8b5cf6] text-white' : 'bg-[#1e293b] border border-white/5 text-white/40 hover:text-white'}`}
                >
                  Todos
                </button>
                {dbModulos.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setModuleFilter(m.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${moduleFilter === m.id ? 'bg-[#8b5cf6] text-white' : 'bg-[#1e293b] border border-white/5 text-white/40 hover:text-white'}`}
                  >
                    {m.titulo.split(' - ')[0]}
                  </button>
                ))}
              </div>

              {/* Aula list */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {filteredAulas.map(a => {
                  const active = selectedAulaId === a.id
                  const hasQ = hasQuiz(a.id)
                  const count = quizCount(a.id)

                  return (
                    <div
                      key={a.id}
                      onClick={() => { setSelectedAulaId(a.id); if (!hasQ) createQuiz(a) }}
                      className={`group p-3 rounded-xl border cursor-pointer transition-all ${
                        active
                          ? 'bg-[#8b5cf6]/10 border-[#8b5cf6]/40'
                          : hasQ
                          ? 'bg-[#1e293b] border-white/5 hover:border-white/15'
                          : 'bg-[#1e293b]/50 border-white/3 hover:border-[#8b5cf6]/20 hover:bg-[#8b5cf6]/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <p className={`text-sm font-medium truncate ${active ? 'text-white' : 'text-white/80'}`}>
                          {a.titulo}
                        </p>
                        {hasQ ? (
                          <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] rounded-full shrink-0 ml-1.5 font-bold">
                            {count}Q
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-[#8b5cf6]/10 text-[#8b5cf6] text-[10px] rounded-full shrink-0 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            + criar
                          </span>
                        )}
                      </div>
                      <p className="text-white/30 text-[11px]">{a.moduloTitulo?.split(' - ')[0]}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right panel: quiz editor */}
            <div className="flex-1 overflow-y-auto">
              {!selectedAulaId ? (
                <div className="flex flex-col items-center justify-center h-full text-white/20 gap-3">
                  <span className="material-symbols-outlined" style={{ fontSize: '52px' }}>quiz</span>
                  <p className="text-sm">Selecione uma aula para editar o quiz</p>
                  <p className="text-xs text-white/15">Aulas sem quiz: clique para criar automaticamente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Quiz header */}
                  <div className="bg-[#1e293b] border border-white/5 rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-white/40 text-xs mb-1">Título do Quiz</p>
                        <input
                          value={selectedQuiz?.titulo || ''}
                          onChange={e => updateQuizTitle(e.target.value)}
                          className="w-full bg-transparent text-white font-semibold text-base focus:outline-none border-b border-white/10 focus:border-[#8b5cf6] pb-1 transition-colors"
                        />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isOpenAIConfigured && (
                          <button
                            onClick={gerarQuizComIA}
                            disabled={generatingAI}
                            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-all disabled:opacity-50"
                            title="Gerar 5 perguntas automaticamente com IA"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>
                              {generatingAI ? 'progress_activity' : 'smart_toy'}
                            </span>
                            {generatingAI ? 'Gerando...' : 'Gerar com IA'}
                          </button>
                        )}
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-[#8b5cf6] text-white rounded-lg text-sm font-medium hover:bg-[#7c3aed] transition-all"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                          Nova Pergunta
                        </button>
                        <button
                          onClick={() => deleteQuiz(selectedAulaId)}
                          className="p-2 text-red-400/40 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete_sweep</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-3 text-xs text-white/30">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>help</span>
                        {selectedQuiz?.perguntas?.length || 0} pergunta(s)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>menu_book</span>
                        {selectedAula?.titulo}
                      </span>
                    </div>
                  </div>

                  {/* Perguntas */}
                  {!selectedQuiz?.perguntas?.length ? (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/10 rounded-xl">
                      <span className="material-symbols-outlined text-white/20 mb-2" style={{ fontSize: '36px' }}>help_outline</span>
                      <p className="text-white/30 text-sm mb-3">Nenhuma pergunta ainda</p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#8b5cf6] text-white rounded-lg text-sm font-medium hover:bg-[#7c3aed] transition-all"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                        Adicionar primeira pergunta
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedQuiz.perguntas.map((p, i) => (
                        <PerguntaCard
                          key={p.id}
                          pergunta={p}
                          index={i}
                          onUpdate={updated => updatePergunta(p.id, updated)}
                          onDelete={() => deletePergunta(p.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 w-full max-w-lg space-y-5 shadow-2xl fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold">Nova Pergunta</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/50 text-xs mb-1.5">Texto da Pergunta *</label>
                <textarea
                  value={newPergunta.texto}
                  onChange={e => setNewPergunta(p => ({ ...p, texto: e.target.value }))}
                  rows={3}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] resize-none transition-colors"
                  placeholder="Escreva a pergunta..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-white/50 text-xs">
                  Opções — clique na letra para marcar como correta
                </label>
                {LETTERS.map((id, i) => (
                  <div key={id} className="flex items-center gap-2">
                    <button
                      onClick={() => setNewPergunta(p => ({ ...p, resposta: id }))}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                        newPergunta.resposta === id
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-[#0f172a] border border-[#334155] text-white/40 hover:border-[#8b5cf6]/50'
                      }`}
                    >
                      {id.toUpperCase()}
                    </button>
                    <input
                      value={newPergunta.opcoes[i]}
                      onChange={e => {
                        const opcoes = [...newPergunta.opcoes]
                        opcoes[i] = e.target.value
                        setNewPergunta(p => ({ ...p, opcoes }))
                      }}
                      onKeyDown={e => e.key === 'Enter' && i < 3 && (document.querySelectorAll('.opcao-input')[i + 1] as HTMLElement)?.focus()}
                      className={`opcao-input flex-1 border rounded-lg px-3 py-2 text-white text-sm focus:outline-none transition-colors ${
                        newPergunta.resposta === id
                          ? 'bg-emerald-500/5 border-emerald-500/30 focus:border-emerald-400'
                          : 'bg-[#0f172a] border-[#334155] focus:border-[#8b5cf6]'
                      }`}
                      placeholder={`Opção ${id.toUpperCase()}`}
                    />
                  </div>
                ))}
                <p className="text-white/20 text-xs mt-1">
                  Resposta correta selecionada: <span className="text-emerald-400 font-bold">{newPergunta.resposta.toUpperCase()}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setShowAddModal(false); setNewPergunta({ ...EMPTY_PERGUNTA }) }}
                className="flex-1 py-2.5 border border-[#334155] rounded-lg text-white/50 text-sm hover:text-white hover:border-white/20 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={addPergunta}
                disabled={!newPergunta.texto.trim()}
                className="flex-1 py-2.5 bg-[#8b5cf6] text-white rounded-lg text-sm font-bold hover:bg-[#7c3aed] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                Adicionar Pergunta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
