import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Modulo, Aula, Slide, Quiz, Progresso, RespostaAtividade } from '../types'
import { mockModulos, mockProgressos } from '../lib/mockData'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { normalizeAula } from '../lib/normalizeAula'

// ─── tipos exportados ─────────────────────────────────────────
export interface DataContextValue {
  modulos:     Modulo[]
  progressos:  Progresso[]
  loading:     boolean
  error:       string | null
  /** true quando Supabase não está configurado — usa dados mock */
  isOffline:   boolean
  refresh:     () => Promise<void>
  // mutations (admin)
  saveModulo:  (data: Partial<Modulo> & { id?: string }) => Promise<void>
  deleteModulo:(id: string) => Promise<void>
  saveAula:    (aula: Partial<Aula> & { id: string; modulo_id: string }, slides?: Slide[]) => Promise<void>
  deleteAula:  (id: string) => Promise<void>
  saveQuiz:    (quiz: Quiz) => Promise<void>
  deleteQuiz:  (quizId: string, aulaId: string) => Promise<void>
  // mutations (aluno)
  saveProgresso:(p: Partial<Progresso> & { aula_id: string; modulo_id: string }) => Promise<void>
  saveResposta: (aula_id: string, resposta: string) => Promise<void>
  respostas:    RespostaAtividade[]
}

const DataContext = createContext<DataContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────
export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  const [modulos,    setModulos]    = useState<Modulo[]>([])
  const [progressos, setProgressos] = useState<Progresso[]>([])
  const [respostas,  setRespostas]  = useState<RespostaAtividade[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [isOffline,  setIsOffline]  = useState(!isSupabaseConfigured)

  // ── carregar módulos ────────────────────────────────────────
  const loadModulos = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setModulos(mockModulos)
      setIsOffline(true)
      return
    }

    const { data, error: err } = await supabase
      .from('modulos')
      .select(`
        *,
        aulas (
          *,
          slides (*),
          quizzes (
            *,
            perguntas (*)
          ),
          materiais (*)
        )
      `)
      .order('ordem')
      .order('ordem', { referencedTable: 'aulas' })

    if (err) {
      console.warn('[DataContext] Supabase error, usando mock:', err.message)
      setModulos(mockModulos)
      setIsOffline(true)
      return
    }

    setModulos((data ?? []).map(m => ({ ...m, aulas: (m.aulas ?? []).map(normalizeAula) })))
    setIsOffline(false)
  }, [])

  // ── carregar progressos ─────────────────────────────────────
  const loadProgressos = useCallback(async () => {
    if (!user) { setProgressos([]); return }

    if (!isSupabaseConfigured) {
      setProgressos(mockProgressos.filter(p => p.user_id === user.id))
      return
    }

    const { data, error: err } = await supabase
      .from('progressos')
      .select('*')
      .eq('user_id', user.id)

    if (err) {
      setProgressos(mockProgressos.filter(p => p.user_id === user.id))
      return
    }
    setProgressos(data ?? [])
  }, [user])

  // ── refresh (exposto para uso externo) ──────────────────────
  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await Promise.all([loadModulos(), loadProgressos()])
    } catch (e: any) {
      setError(e.message ?? 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [loadModulos, loadProgressos])

  // Carrega ao montar e sempre que o usuário mudar (login/logout)
  useEffect(() => { refresh() }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ═══ MUTATIONS (admin) ══════════════════════════════════════

  const saveModulo = useCallback(async (data: Partial<Modulo> & { id?: string }) => {
    const payload = {
      id:            data.id || `m${Date.now()}`,
      titulo:        data.titulo        ?? '',
      descricao:     data.descricao     ?? '',
      ordem:         data.ordem         ?? modulos.length + 1,
      carga_horaria: data.carga_horaria ?? 4,
      ativo:         data.ativo         ?? true,
      cover_image:   data.cover_image   ?? undefined,
      created_at:    new Date().toISOString(),
    }

    if (isSupabaseConfigured && !isOffline) {
      const { error: err } = await supabase.from('modulos').upsert(payload)
      if (err) throw new Error(err.message)
      await loadModulos()
    } else {
      setModulos(prev => {
        const idx = prev.findIndex(m => m.id === payload.id)
        if (idx >= 0) {
          const next = [...prev]; next[idx] = { ...next[idx], ...payload }; return next
        }
        return [...prev, { ...payload, aulas: [] }]
      })
    }
  }, [modulos.length, isOffline, loadModulos])

  const deleteModulo = useCallback(async (id: string) => {
    if (isSupabaseConfigured && !isOffline) {
      const { error: err } = await supabase.from('modulos').delete().eq('id', id)
      if (err) throw new Error(err.message)
      await loadModulos()
    } else {
      setModulos(prev => prev.filter(m => m.id !== id))
    }
  }, [isOffline, loadModulos])

  const saveAula = useCallback(async (
    aula: Partial<Aula> & { id: string; modulo_id: string },
    slides: Slide[] = [],
  ) => {
    const materiais = aula.materiais ?? []

    if (isSupabaseConfigured && !isOffline) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { slides: _s, quiz: _q, materiais: _m, quizzes: _qq, ...aulaData } = aula as any
      const { error: aulaErr } = await supabase.from('aulas').upsert(aulaData)
      if (aulaErr) throw new Error(aulaErr.message)

      // Substitui slides da aula
      await supabase.from('slides').delete().eq('aula_id', aula.id)
      if (slides.length > 0) {
        const { error: slidesErr } = await supabase.from('slides').insert(
          slides.map(s => ({
            id: s.id, aula_id: aula.id, titulo: s.titulo,
            texto: s.texto, imagem_url: s.imagem_url ?? null, ordem: s.ordem,
          }))
        )
        if (slidesErr) throw new Error(slidesErr.message)
      }

      await supabase.from('materiais').delete().eq('aula_id', aula.id)
      if (materiais.length > 0) {
        const { error: materiaisErr } = await supabase.from('materiais').insert(
          materiais.map(m => ({
            id: m.id, aula_id: aula.id, titulo: m.titulo,
            tipo: m.tipo, url: m.url,
          }))
        )
        if (materiaisErr) throw new Error(materiaisErr.message)
      }
      await loadModulos()
    } else {
      setModulos(prev => prev.map(m => {
        if (m.id !== aula.modulo_id) return m
        const exists = (m.aulas ?? []).some(a => a.id === aula.id)
        return {
          ...m,
          aulas: exists
            ? (m.aulas ?? []).map(a => a.id === aula.id ? { ...a, ...aula, slides, materiais } : a)
            : [...(m.aulas ?? []), { ...aula, slides, materiais } as Aula],
        }
      }))
    }
  }, [isOffline, loadModulos])

  const deleteAula = useCallback(async (id: string) => {
    if (isSupabaseConfigured && !isOffline) {
      const { error: err } = await supabase.from('aulas').delete().eq('id', id)
      if (err) throw new Error(err.message)
      await loadModulos()
    } else {
      setModulos(prev => prev.map(m => ({ ...m, aulas: (m.aulas ?? []).filter(a => a.id !== id) })))
    }
  }, [isOffline, loadModulos])

  const saveQuiz = useCallback(async (quiz: Quiz) => {
    if (isSupabaseConfigured && !isOffline) {
      const { perguntas, ...quizData } = quiz
      const { error: qErr } = await supabase.from('quizzes').upsert(quizData)
      if (qErr) throw new Error(qErr.message)

      // Substitui todas as perguntas
      await supabase.from('perguntas').delete().eq('quiz_id', quiz.id)
      if (perguntas.length > 0) {
        const { error: pErr } = await supabase.from('perguntas').insert(
          perguntas.map(p => ({
            id: p.id, quiz_id: quiz.id, texto: p.texto,
            opcoes: p.opcoes, resposta_correta: p.resposta_correta, ordem: p.ordem,
          }))
        )
        if (pErr) throw new Error(pErr.message)
      }
      await loadModulos()
    } else {
      setModulos(prev => prev.map(m => ({
        ...m,
        aulas: (m.aulas ?? []).map(a => a.id === quiz.aula_id ? { ...a, quiz } : a),
      })))
    }
  }, [isOffline, loadModulos])

  const deleteQuiz = useCallback(async (quizId: string, aulaId: string) => {
    if (isSupabaseConfigured && !isOffline) {
      const { error: err } = await supabase.from('quizzes').delete().eq('id', quizId)
      if (err) throw new Error(err.message)
      await loadModulos()
    } else {
      setModulos(prev => prev.map(m => ({
        ...m,
        aulas: (m.aulas ?? []).map(a => a.id === aulaId ? { ...a, quiz: undefined } : a),
      })))
    }
  }, [isOffline, loadModulos])

  // ═══ MUTATIONS (aluno) ══════════════════════════════════════

  const saveResposta = useCallback(async (aula_id: string, resposta: string) => {
    if (!user) return
    const payload: RespostaAtividade = {
      id: `resp_${Date.now()}`,
      user_id: user.id,
      aula_id,
      resposta,
      created_at: new Date().toISOString(),
    }

    if (isSupabaseConfigured && !isOffline) {
      // Tenta salvar — tabela respostas_atividades pode não existir no schema
      const { error: err } = await supabase.from('respostas_atividades').insert(payload)
      if (err) {
        // Fallback para localStorage se tabela não existir ainda
        console.warn('[DataContext] respostas_atividades não encontrada, salvando local:', err.message)
      }
    }

    // Sempre persiste local como cache/fallback
    setRespostas(prev => [...prev, payload])
    const stored = JSON.parse(localStorage.getItem('ia_academy_respostas') ?? '[]') as RespostaAtividade[]
    localStorage.setItem('ia_academy_respostas', JSON.stringify([...stored, payload]))
  }, [user, isOffline])

  const saveProgresso = useCallback(async (
    p: Partial<Progresso> & { aula_id: string; modulo_id: string }
  ) => {
    if (!user) return
    const existing = progressos.find(pr => pr.aula_id === p.aula_id)
    const payload: Progresso = {
      id:             existing?.id ?? `prog_${Date.now()}`,
      user_id:        user.id,
      aula_id:        p.aula_id,
      modulo_id:      p.modulo_id,
      concluida:      p.concluida      ?? existing?.concluida      ?? false,
      tempo_estudo:   p.tempo_estudo   ?? existing?.tempo_estudo   ?? 0,
      quiz_realizado: p.quiz_realizado ?? existing?.quiz_realizado ?? false,
      quiz_nota:      p.quiz_nota      ?? existing?.quiz_nota,
      updated_at:     new Date().toISOString(),
    }

    if (isSupabaseConfigured && !isOffline) {
      const { id: _localId, ...supabasePayload } = payload
      const { error: err } = await supabase
        .from('progressos')
        .upsert(supabasePayload, { onConflict: 'user_id,aula_id' })
      if (err) throw new Error(err.message)
      await loadProgressos()
    } else {
      setProgressos(prev => {
        const idx = prev.findIndex(pr => pr.aula_id === p.aula_id)
        const next = [...prev]
        if (idx >= 0) next[idx] = payload; else next.push(payload)
        return next
      })
    }
  }, [user, progressos, isOffline, loadProgressos])

  // ─── value ────────────────────────────────────────────────────
  return (
    <DataContext.Provider value={{
      modulos, progressos, respostas, loading, error, isOffline, refresh,
      saveModulo, deleteModulo,
      saveAula,  deleteAula,
      saveQuiz,  deleteQuiz,
      saveProgresso, saveResposta,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData deve ser usado dentro de DataProvider')
  return ctx
}
