import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import { useData } from '../contexts/DataContext'
import { AdminSkeleton } from '../components/SkeletonLoader'
import { mockProgressos, mockUsers } from '../lib/mockData'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { Progresso, User } from '../types'

const DELETED_OFFLINE_USERS_KEY = 'ia_academy_deleted_mock_users'

type RecentActivityRow = {
  user: string
  initials: string
  actionType: string
  target: string
  time: string
  updatedAt: string
}

const actionBadgeClass = (type: string) => {
  if (type === 'completed') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
  if (type === 'started') return 'bg-blue-500/15 text-blue-400 border-blue-500/20'
  if (type === 'failed') return 'bg-red-500/15 text-red-400 border-red-500/20'
  if (type === 'certificate') return 'bg-amber-500/15 text-amber-400 border-amber-500/20'
  return 'bg-white/5 text-white/50'
}

const actionLabel = (type: string) => {
  if (type === 'completed') return 'Concluiu aula'
  if (type === 'started') return 'Iniciou módulo'
  if (type === 'failed') return 'Reprovou quiz'
  if (type === 'certificate') return 'Certificado'
  return type
}

function initials(nome: string) {
  return nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function getOfflineDeletedIds() {
  try {
    return JSON.parse(localStorage.getItem(DELETED_OFFLINE_USERS_KEY) ?? '[]') as string[]
  } catch {
    localStorage.removeItem(DELETED_OFFLINE_USERS_KEY)
    return []
  }
}

function relativeTime(dateValue: string) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'Data indisponível'

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))

  if (diffMinutes < 1) return 'agora'
  if (diffMinutes < 60) return `${diffMinutes} min atrás`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'} atrás`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'} atrás`

  return date.toLocaleDateString('pt-BR')
}

function progressActionType(progresso: Progresso) {
  if (progresso.quiz_realizado && typeof progresso.quiz_nota === 'number' && progresso.quiz_nota < 70) return 'failed'
  if (progresso.concluida) return 'completed'
  return 'started'
}

export default function AdminDashboard() {
  const { modulos, isOffline, loading } = useData()
  const [users, setUsers] = useState<User[]>([])
  const [progressos, setProgressos] = useState<Progresso[]>([])

  useEffect(() => {
    async function loadDashboardData() {
      if (!isSupabaseConfigured) {
        const deletedIds = getOfflineDeletedIds()
        const activeUsers = mockUsers.filter(u => !deletedIds.includes(u.id))
        setUsers(activeUsers)
        setProgressos(mockProgressos.filter(p => activeUsers.some(u => u.id === p.user_id)))
        return
      }

      const [{ data: profiles }, { data: progressData }] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, email, nome, role, avatar_url, created_at')
          .order('created_at', { ascending: false }),
        supabase
          .from('progressos')
          .select('*')
          .order('updated_at', { ascending: false }),
      ])

      setUsers((profiles ?? []) as User[])
      setProgressos((progressData ?? []) as Progresso[])
    }

    void loadDashboardData()
  }, [])

  const alunos = users.filter(u => u.role === 'aluno')
  const totalAulas = modulos.flatMap(m => m.aulas || []).length
  const statCards = [
    { icon: 'group', label: 'Total de Alunos', value: String(alunos.length), hint: isOffline ? 'dados locais' : 'perfis reais' },
    { icon: 'view_module', label: 'Total de Módulos', value: String(modulos.length), hint: 'conteúdo publicado' },
    { icon: 'menu_book', label: 'Total de Aulas', value: String(totalAulas), hint: 'aulas disponíveis' },
    { icon: 'bolt', label: 'Alunos Ativos', value: String(alunos.length), hint: isOffline ? 'modo demonstração' : 'com perfil ativo' },
  ]

  const recentRows = useMemo<RecentActivityRow[]>(() => {
    const userMap = new Map(users.map(u => [u.id, u]))
    const aulaMap = new Map(modulos.flatMap(m => (m.aulas ?? []).map(a => [a.id, a.titulo])))
    const moduloMap = new Map(modulos.map(m => [m.id, m.titulo]))

    return progressos
      .filter(p => userMap.has(p.user_id))
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5)
      .map(p => {
        const activityUser = userMap.get(p.user_id)!
        return {
          user: activityUser.nome,
          initials: initials(activityUser.nome),
          actionType: progressActionType(p),
          target: aulaMap.get(p.aula_id) ?? moduloMap.get(p.modulo_id) ?? 'Conteúdo do curso',
          time: relativeTime(p.updated_at),
          updatedAt: p.updated_at,
        }
      })
  }, [modulos, progressos, users])

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar isAdmin />
      <div className="flex-1 ml-0 md:ml-[280px] flex flex-col">
        <TopBar title="Overview" subtitle="Métricas e atividade da plataforma" />
        {loading ? <AdminSkeleton /> : null}
        <main className={`flex-1 p-8 space-y-8 fade-in overflow-y-auto ${loading ? 'hidden' : ''}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Painel Administrativo</h2>
              <p className="text-white/40 text-sm mt-1">Gerencie a IA Office Academy em um só lugar.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/admin/metricas" className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white/70 text-sm hover:text-white hover:border-white/20 transition-all">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>bar_chart</span>
                Ver métricas
              </Link>
              <Link to="/admin/aulas/nova" className="flex items-center gap-2 px-4 py-2 bg-[#8b5cf6] text-white rounded-lg text-sm font-medium hover:bg-[#7c3aed] transition-all shadow-lg shadow-[#8b5cf6]/20">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                Nova aula
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {statCards.map(s => (
              <div key={s.label} className="bg-[#1e293b] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-[#8b5cf6]/10 rounded-lg group-hover:bg-[#8b5cf6]/20 transition-colors">
                    <span className="material-symbols-outlined text-[#8b5cf6]" style={{ fontSize: '20px' }}>{s.icon}</span>
                  </div>
                </div>
                <p className="text-white/50 text-xs mb-1">{s.label}</p>
                <p className="text-3xl font-bold text-white">{s.value}</p>
                <p className="text-white/30 text-xs mt-2">{s.hint}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-[#1e293b] border border-white/5 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-white font-semibold text-sm">Atividade Recente</h3>
                <Link to="/admin/metricas" className="text-[#8b5cf6] text-xs hover:underline">Ver métricas</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/[0.03]">
                      {['Usuário', 'Ação', 'Alvo', 'Tempo'].map(h => (
                        <th key={h} className="py-3 px-5 text-white/30 text-xs uppercase tracking-wider font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {recentRows.map(row => (
                      <tr key={`${row.user}-${row.updatedAt}-${row.target}`} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#8b5cf6]/20 text-white flex items-center justify-center text-xs font-bold shrink-0">{row.initials}</div>
                            <span className="text-white text-sm font-medium whitespace-nowrap">{row.user}</span>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border whitespace-nowrap ${actionBadgeClass(row.actionType)}`}>
                            {actionLabel(row.actionType)}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-white/50 text-sm max-w-[260px] truncate">{row.target}</td>
                        <td className="py-4 px-5 text-white/30 text-xs whitespace-nowrap">{row.time}</td>
                      </tr>
                    ))}
                    {recentRows.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-white/30 text-sm">
                          Nenhuma atividade recente encontrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-5">
              <div className="bg-[#1e293b] border border-white/5 rounded-xl p-5">
                <h3 className="text-white font-semibold text-sm mb-4">Ações Rápidas</h3>
                <div className="space-y-2">
                  <Link to="/admin/aulas/nova" className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#8b5cf6] text-white rounded-lg text-sm font-medium hover:bg-[#7c3aed] transition-all">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
                    Nova aula
                  </Link>
                  <Link to="/admin/modulos" className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1e293b] border border-[#334155] text-white/70 rounded-lg text-sm hover:text-white hover:border-white/20 transition-all">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>create_new_folder</span>
                    Gerenciar módulos
                  </Link>
                  <Link to="/admin/usuarios" className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1e293b] border border-[#334155] text-white/70 rounded-lg text-sm hover:text-white hover:border-white/20 transition-all">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>manage_accounts</span>
                    Gerenciar usuários
                  </Link>
                </div>
              </div>

              <div className="bg-[#1e293b] border border-white/5 rounded-xl p-5 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold text-sm">Módulos</h3>
                  <Link to="/admin/modulos" className="text-[#8b5cf6] text-xs hover:underline">Gerenciar</Link>
                </div>
                <div className="space-y-2">
                  {modulos.slice(0, 6).map(m => (
                    <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                      <div className="w-6 h-6 rounded bg-[#8b5cf6]/15 flex items-center justify-center text-[#8b5cf6] text-xs font-bold shrink-0">
                        {m.ordem}
                      </div>
                      <span className="text-white/70 text-xs truncate flex-1">{m.titulo.split(' - ')[1] ?? m.titulo}</span>
                      <span className="text-white/30 text-xs shrink-0">{m.aulas?.length || 0} aulas</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b] border border-white/5 rounded-xl p-5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-white font-semibold text-sm">Alunos Cadastrados</h3>
              <Link to="/admin/usuarios" className="text-[#8b5cf6] text-xs hover:underline">Ver todos</Link>
            </div>
            <div className="space-y-3">
              {alunos.slice(0, 6).map(u => (
                <div key={u.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <div className="w-9 h-9 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {initials(u.nome)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{u.nome}</p>
                    <p className="text-white/40 text-xs">{u.email}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">Ativo</span>
                </div>
              ))}
              {alunos.length === 0 && (
                <p className="text-white/30 text-sm py-6 text-center">Nenhum aluno cadastrado.</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
