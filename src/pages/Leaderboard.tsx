import React, { useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { useGamification } from '../contexts/GamificationContext'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { mockProgressos, mockUsers } from '../lib/mockData'
import type { Progresso, User } from '../types'

function calcXpFromProgressos(progressos: Progresso[], userId: string): number {
  return progressos
    .filter(p => p.user_id === userId)
    .reduce((sum, p) => {
      let pts = 0
      if (p.concluida) pts += 10
      if (p.quiz_realizado && typeof p.quiz_nota === 'number' && p.quiz_nota >= 70) pts += 20
      return sum + pts
    }, 0)
}

function initials(nome: string) {
  return nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

const MEDAL = ['🥇', '🥈', '🥉']
const RANK_COLORS = [
  'from-amber-500/20 to-amber-500/5 border-amber-500/30',
  'from-slate-400/20 to-slate-400/5 border-slate-400/30',
  'from-orange-600/20 to-orange-600/5 border-orange-600/30',
]

export default function Leaderboard() {
  const { user } = useAuth()
  const { isOffline } = useData()
  const { xp: myXp, nivel, streak } = useGamification()
  const isAdmin = user?.role === 'admin'

  const [allUsers, setAllUsers] = useState<User[]>([])
  const [allProgressos, setAllProgressos] = useState<Progresso[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    async function load() {
      setLoadingData(true)
      if (!isSupabaseConfigured) {
        setAllUsers(mockUsers.filter(u => u.role === 'aluno'))
        setAllProgressos(mockProgressos)
        setLoadingData(false)
        return
      }
      const [{ data: profiles }, { data: progressData }] = await Promise.all([
        supabase.from('profiles').select('id, email, nome, role, created_at').eq('role', 'aluno'),
        supabase.from('progressos').select('user_id, aula_id, concluida, quiz_realizado, quiz_nota'),
      ])
      setAllUsers((profiles ?? []) as User[])
      setAllProgressos((progressData ?? []) as Progresso[])
      setLoadingData(false)
    }
    void load()
  }, [isOffline])

  const ranking = useMemo(() => {
    const entries = allUsers.map(u => {
      const baseXp = calcXpFromProgressos(allProgressos, u.id)
      // Para o próprio usuário, usa o XP real do GamificationContext (mais preciso)
      const xp = u.id === user?.id ? Math.max(baseXp, myXp) : baseXp
      return { user: u, xp }
    })

    // Se o usuário atual não aparecer na lista (admin visualizando), injeta
    if (!isAdmin && user && !entries.find(e => e.user.id === user.id)) {
      entries.push({ user: { id: user.id, email: user.email, nome: user.nome, role: 'aluno', created_at: '' }, xp: myXp })
    }

    return entries.sort((a, b) => b.xp - a.xp)
  }, [allUsers, allProgressos, user, myXp, isAdmin])

  const myRank = ranking.findIndex(e => e.user.id === user?.id) + 1

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex-1 ml-0 md:ml-[280px] flex flex-col">
        <TopBar title="Leaderboard" subtitle="Ranking de XP da plataforma" />
        <main className="flex-1 p-8 max-w-3xl mx-auto w-full space-y-8 fade-in">

          {/* My position card */}
          {!isAdmin && user && (
            <div className="bg-gradient-to-r from-[#8b5cf6]/20 to-[#8b5cf6]/5 border border-[#8b5cf6]/30 rounded-2xl p-5 flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-[#8b5cf6]/30 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {initials(user.nome)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-base truncate">{user.nome}</p>
                <p className="text-white/40 text-xs mt-0.5">Nível {nivel} · {streak} dias de streak</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[#8b5cf6] font-bold text-2xl">{myXp} XP</p>
                {myRank > 0 && (
                  <p className="text-white/40 text-xs mt-0.5">
                    {myRank <= 3 ? MEDAL[myRank - 1] : `#${myRank}`} no ranking
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Ranking list */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-base">Ranking Geral</h3>
              <span className="text-white/30 text-xs">{ranking.length} alunos</span>
            </div>

            {loadingData ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-[#1e293b] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : ranking.length === 0 ? (
              <div className="text-center py-16 text-white/20">
                <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>leaderboard</span>
                <p className="mt-2 text-sm">Nenhum dado disponível ainda.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {ranking.map((entry, idx) => {
                  const isMe = entry.user.id === user?.id
                  const isTop3 = idx < 3
                  return (
                    <div
                      key={entry.user.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        isMe
                          ? 'bg-gradient-to-r from-[#8b5cf6]/15 to-transparent border-[#8b5cf6]/30 ring-1 ring-[#8b5cf6]/20'
                          : isTop3
                          ? `bg-gradient-to-r ${RANK_COLORS[idx]} border`
                          : 'bg-[#1e293b] border-white/5 hover:border-white/10'
                      }`}
                    >
                      {/* Position */}
                      <div className="w-8 text-center shrink-0">
                        {isTop3 ? (
                          <span className="text-xl">{MEDAL[idx]}</span>
                        ) : (
                          <span className="text-white/30 text-sm font-bold">#{idx + 1}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        isMe ? 'bg-[#8b5cf6]/40 text-white' : 'bg-[#334155] text-white/60'
                      }`}>
                        {initials(entry.user.nome)}
                      </div>

                      {/* Name + XP bar */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium text-sm truncate ${isMe ? 'text-white' : 'text-white/70'}`}>
                            {entry.user.nome}
                          </p>
                          {isMe && (
                            <span className="text-xs px-1.5 py-0.5 bg-[#8b5cf6]/20 text-[#8b5cf6] rounded-full shrink-0">você</span>
                          )}
                        </div>
                        {/* Mini XP bar relative to #1 */}
                        {ranking[0]?.xp > 0 && (
                          <div className="mt-1.5 h-1 bg-white/5 rounded-full overflow-hidden w-full">
                            <div
                              className={`h-full rounded-full transition-all ${isMe ? 'bg-[#8b5cf6]' : isTop3 ? 'bg-amber-400/60' : 'bg-white/20'}`}
                              style={{ width: `${Math.max(4, (entry.xp / ranking[0].xp) * 100)}%` }}
                            />
                          </div>
                        )}
                      </div>

                      {/* XP */}
                      <div className="text-right shrink-0">
                        <p className={`font-bold text-base ${isMe ? 'text-[#8b5cf6]' : isTop3 ? 'text-white' : 'text-white/60'}`}>
                          {entry.xp}
                        </p>
                        <p className="text-white/30 text-xs">XP</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* XP legend */}
          <div className="bg-[#1e293b] border border-white/5 rounded-xl p-4">
            <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">Como ganhar XP</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { icon: 'play_circle', label: 'Aula concluída', xp: '+10 XP' },
                { icon: 'quiz', label: 'Quiz aprovado (≥70%)', xp: '+20 XP' },
                { icon: 'assignment', label: 'Atividade enviada', xp: '+15 XP' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#8b5cf6]" style={{ fontSize: '16px' }}>{item.icon}</span>
                  <div>
                    <p className="text-white/60 text-xs">{item.label}</p>
                    <p className="text-[#8b5cf6] text-xs font-bold">{item.xp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
