import React, { useEffect, useMemo, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'
import { useData } from '../../contexts/DataContext'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import { mockUsers } from '../../lib/mockData'
import type { Progresso, User } from '../../types'

export default function AdminMetricas() {
  const { modulos, isOffline } = useData()
  const [users, setUsers] = useState<User[]>([])
  const [progressos, setProgressos] = useState<Progresso[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      if (!isSupabaseConfigured) {
        setUsers(mockUsers)
        setProgressos([])
        setLoading(false)
        return
      }

      const [{ data: profiles }, { data: progressData }] = await Promise.all([
        supabase.from('profiles').select('id, email, nome, role, avatar_url, created_at'),
        supabase.from('progressos').select('*'),
      ])

      setUsers((profiles ?? []) as User[])
      setProgressos((progressData ?? []) as Progresso[])
      setLoading(false)
    }

    void load()
  }, [])

  const aulas = useMemo(() => modulos.flatMap(m => m.aulas ?? []), [modulos])
  const alunos = users.filter(u => u.role === 'aluno')
  const aulasConcluidas = progressos.filter(p => p.concluida).length
  const quizzesRealizados = progressos.filter(p => p.quiz_realizado).length
  const notas = progressos.map(p => p.quiz_nota).filter((n): n is number => typeof n === 'number')
  const notaMedia = notas.length ? notas.reduce((sum, n) => sum + n, 0) / notas.length : 0
  const conclusaoPossivel = Math.max(alunos.length * aulas.length, 1)
  const progressoMedio = Math.round((aulasConcluidas / conclusaoPossivel) * 100)

  const cards = [
    { icon: 'group', label: 'Alunos cadastrados', value: alunos.length, hint: 'Perfis com papel de aluno' },
    { icon: 'menu_book', label: 'Aulas publicadas', value: aulas.length, hint: `${modulos.length} módulos ativos` },
    { icon: 'task_alt', label: 'Aulas concluídas', value: aulasConcluidas, hint: `${progressoMedio}% de avanço médio` },
    { icon: 'quiz', label: 'Quizzes realizados', value: quizzesRealizados, hint: notaMedia ? `Nota média ${notaMedia.toFixed(1)}` : 'Sem notas registradas' },
  ]

  const modulesWithLessons = modulos.map(m => ({
    id: m.id,
    titulo: m.titulo,
    aulas: m.aulas?.length ?? 0,
    conclusoes: progressos.filter(p => p.modulo_id === m.id && p.concluida).length,
  }))

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar isAdmin />
      <div className="flex-1 ml-0 md:ml-[280px] flex flex-col">
        <TopBar
          title="Métricas"
          subtitle={isOffline ? 'Modo offline: dados de demonstração' : 'Indicadores reais da plataforma'}
        />
        <main className="flex-1 p-8 space-y-6 fade-in">
          <div>
            <h2 className="text-2xl font-bold text-white">Métricas da plataforma</h2>
            <p className="text-white/40 text-sm mt-1">
              Acompanhe alunos, aulas, conclusão de conteúdo e desempenho em quizzes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {cards.map(card => (
              <div key={card.label} className="bg-[#1e293b] border border-white/5 rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-[#8b5cf6]/10 rounded-lg">
                    <span className="material-symbols-outlined text-[#8b5cf6]" style={{ fontSize: '20px' }}>{card.icon}</span>
                  </div>
                  {loading && <span className="text-white/20 text-xs">carregando</span>}
                </div>
                <p className="text-white/50 text-xs mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-white">{card.value}</p>
                <p className="text-white/30 text-xs mt-2">{card.hint}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <section className="xl:col-span-8 bg-[#1e293b] border border-white/5 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-white/5">
                <h3 className="text-white font-semibold text-sm">Conclusões por módulo</h3>
              </div>
              <div className="divide-y divide-white/[0.03]">
                {modulesWithLessons.map(m => {
                  const max = Math.max(alunos.length * m.aulas, 1)
                  const percent = Math.round((m.conclusoes / max) * 100)
                  return (
                    <div key={m.id} className="p-5">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <p className="text-white text-sm font-medium">{m.titulo}</p>
                        <span className="text-white/40 text-xs">{m.conclusoes} conclusões</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full bg-[#8b5cf6]" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="xl:col-span-4 bg-[#1e293b] border border-white/5 rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Resumo operacional</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-white/40 text-xs">Progresso médio</p>
                  <p className="text-4xl font-bold text-white mt-1">{progressoMedio}%</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs">Carga horária total</p>
                  <p className="text-white text-lg font-semibold mt-1">
                    {modulos.reduce((sum, m) => sum + m.carga_horaria, 0)} horas
                  </p>
                </div>
                <div>
                  <p className="text-white/40 text-xs">Fonte dos dados</p>
                  <p className="text-white/60 text-sm mt-1">
                    {isOffline ? 'Dados locais de demonstração' : 'Supabase em tempo real'}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
