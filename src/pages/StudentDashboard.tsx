import React, { useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { DashboardSkeleton } from '../components/SkeletonLoader'
import type { Modulo } from '../types'

export default function StudentDashboard() {
  const { user } = useAuth()
  const { modulos, progressos, loading } = useData()

  const progressoMap = useMemo(() => {
    const map: Record<string, boolean> = {}
    progressos.forEach(p => { map[p.aula_id] = p.concluida })
    return map
  }, [progressos])

  const stats = useMemo(() => {
    const allAulas = modulos.flatMap(m => m.aulas || [])
    const totalAulas = allAulas.length
    const concluidas = allAulas.filter(a => progressoMap[a.id]).length
    const percent = totalAulas > 0 ? Math.round((concluidas / totalAulas) * 100) : 0
    const modulosConcluidos = modulos.filter(m =>
      (m.aulas?.length || 0) > 0 && (m.aulas || []).every(a => progressoMap[a.id])
    ).length
    const tempoTotal = progressos.reduce((sum, p) => sum + p.tempo_estudo, 0)
    return { totalAulas, concluidas, percent, modulosConcluidos, tempoTotal }
  }, [modulos, progressoMap, progressos])

  const getModuloStatus = (m: Modulo) => {
    const aulas = m.aulas || []
    if (aulas.length === 0) return { status: 'locked' as const, percent: 0 }
    const done = aulas.filter(a => progressoMap[a.id]).length
    if (done === aulas.length) return { status: 'completed' as const, percent: 100 }
    if (done > 0) return { status: 'in_progress' as const, percent: Math.round((done / aulas.length) * 100) }
    // Primeiro módulo sempre desbloqueado; demais dependem do anterior estar concluído
    if (m.ordem === 1) return { status: 'in_progress' as const, percent: 0 }
    const anterior = modulos.find(x => x.ordem === m.ordem - 1)
    const anteriorConcluido = anterior
      ? (anterior.aulas ?? []).length > 0 && (anterior.aulas ?? []).every(a => progressoMap[a.id])
      : true
    if (anteriorConcluido) return { status: 'in_progress' as const, percent: 0 }
    return { status: 'locked' as const, percent: 0 }
  }

  const handleShareLinkedIn = useCallback(() => {
    const text = `Estou avançando no IA Office Academy! 🎓\n\n✅ ${stats.concluidas} aulas concluídas\n📊 ${stats.percent}% do curso completo\n🏆 ${stats.modulosConcluidos} módulo${stats.modulosConcluidos !== 1 ? 's' : ''} finalizado${stats.modulosConcluidos !== 1 ? 's' : ''}\n\nAprendendo IA aplicada ao ambiente corporativo com tecnologia de ponta.\n\n#IA #InteligenciaArtificial #DesenvolvimentoProfissional #IAOfficeAcademy`
    window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  }, [stats])

  const nextAula = useMemo(() => {
    for (const m of modulos) {
      for (const a of (m.aulas || [])) {
        if (!progressoMap[a.id]) return { aula: a, modulo: m }
      }
    }
    return null
  }, [modulos, progressoMap])

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[280px] flex flex-col">
        <TopBar title="Dashboard" subtitle={`Bem-vindo de volta, ${user?.nome?.split(' ')[0]}`} />
        {loading ? <DashboardSkeleton /> : null}
        <main className={`flex-1 p-8 space-y-8 fade-in ${loading ? 'hidden' : ''}`}>
          {/* Hero cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Welcome + Progress */}
            <div className="lg:col-span-2 bg-[#1e293b] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Olá, {user?.nome?.split(' ')[0]}! 👋</h2>
                <p className="text-white/50 text-sm max-w-lg">
                  Continue sua jornada no <span className="text-[#8b5cf6]">IA Office Academy</span>. Você está dominando IA aplicada ao ambiente corporativo.
                </p>
              </div>
              <div className="mt-8">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-white/40 text-xs uppercase tracking-widest font-medium">Progresso Geral</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#8b5cf6] font-bold text-lg">{stats.percent}%</span>
                    {stats.concluidas > 0 && (
                      <button
                        onClick={handleShareLinkedIn}
                        title="Compartilhar no LinkedIn"
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0077b5]/15 border border-[#0077b5]/30 text-[#0077b5] rounded-lg text-xs font-medium hover:bg-[#0077b5]/25 transition-all"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        Compartilhar
                      </button>
                    )}
                  </div>
                </div>
                <progress className="w-full h-3" max={100} value={stats.percent} />
                <div className="flex gap-6 mt-4">
                  <div className="text-center">
                    <p className="text-white font-bold text-xl">{stats.concluidas}</p>
                    <p className="text-white/40 text-xs">Aulas concluídas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-xl">{stats.modulosConcluidos}</p>
                    <p className="text-white/40 text-xs">Módulos completos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-xl">{stats.tempoTotal}min</p>
                    <p className="text-white/40 text-xs">Tempo de estudo</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Next lesson */}
            {nextAula && (
              <Link
                to={`/aula/${nextAula.aula.id}`}
                className="bg-[#1e293b] border border-white/5 rounded-2xl p-6 flex flex-col relative overflow-hidden hover:border-[#8b5cf6]/30 transition-all group elevation-hover cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b5cf6]/15 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                <div className="flex items-center gap-2 mb-auto">
                  <span className="material-symbols-outlined text-[#8b5cf6]" style={{ fontSize: '20px' }}>play_circle</span>
                  <span className="text-[#8b5cf6] text-xs font-bold uppercase tracking-widest">Próxima Aula</span>
                </div>
                <div className="mt-8 relative z-10">
                  <span className="inline-block px-2 py-1 bg-[#8b5cf6]/15 text-[#8b5cf6] text-xs rounded-lg mb-2 font-medium">
                    {nextAula.modulo.titulo.split(' - ')[0]}
                  </span>
                  <h3 className="text-white font-semibold text-base mb-2">{nextAula.aula.titulo}</h3>
                  <p className="text-white/40 text-sm line-clamp-2">{nextAula.aula.descricao}</p>
                </div>
                <div className="mt-6 flex items-center justify-between z-10">
                  <span className="text-white/30 text-xs">{nextAula.aula.duracao_min} min</span>
                  <span className="bg-white text-[#0f172a] text-xs font-bold px-3 py-1.5 rounded-lg group-hover:bg-[#8b5cf6] group-hover:text-white transition-colors">
                    Continuar
                  </span>
                </div>
              </Link>
            )}
          </div>

          {/* Modules grid */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold text-base">Currículo do Curso</h3>
              <span className="text-white/30 text-sm">{modulos.length} Módulos</span>
            </div>
            {loading && modulos.length === 0 && (
              <div className="flex items-center justify-center py-16 text-white/30 gap-3">
                <span className="material-symbols-outlined animate-spin text-[#8b5cf6]" style={{ fontSize: '24px' }}>progress_activity</span>
                <span className="text-sm">Carregando módulos...</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {modulos.map(m => {
                const { status, percent } = getModuloStatus(m)
                return (
                  <Link
                    key={m.id}
                    to={status !== 'locked' ? `/modulo/${m.id}` : '#'}
                    className={`bg-[#1e293b] border rounded-xl flex flex-col transition-all overflow-hidden relative ${
                      status === 'locked'
                        ? 'border-white/5 opacity-50 cursor-not-allowed'
                        : status === 'in_progress'
                        ? 'border-[#8b5cf6]/40 ring-1 ring-[#8b5cf6]/20 hover:border-[#8b5cf6]/60 elevation-hover'
                        : 'border-white/5 hover:border-white/10 elevation-hover'
                    }`}
                  >
                    {status === 'in_progress' && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8b5cf6] rounded-l-xl z-10" />
                    )}
                    {/* Cover */}
                    <div className="relative w-full aspect-video bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e1b4b] overflow-hidden">
                      {m.cover_image && (
                        <img
                          src={m.cover_image}
                          alt={m.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-transparent to-transparent" />
                      {status === 'locked' && (
                        <div className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-sm flex items-center justify-center">
                          <span className="material-symbols-outlined text-white/40" style={{ fontSize: '32px' }}>lock</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-xs font-medium ${status === 'in_progress' ? 'text-[#8b5cf6]' : 'text-white/30'}`}>
                        {m.titulo.split(' - ')[0]}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${
                        status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' :
                        status === 'in_progress' ? 'bg-[#8b5cf6]/15 text-[#8b5cf6]' :
                        'bg-white/5 text-white/30'
                      }`}>
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                          {status === 'completed' ? 'check_circle' : status === 'in_progress' ? 'play_arrow' : 'lock'}
                        </span>
                        {status === 'completed' ? 'Concluído' : status === 'in_progress' ? 'Em Progresso' : 'Bloqueado'}
                      </span>
                    </div>
                    <h4 className="text-white font-semibold text-sm mb-1">{m.titulo.split(' - ')[1]}</h4>
                    <p className="text-white/40 text-xs mb-5 mt-auto line-clamp-2">{m.descricao}</p>
                    {status !== 'locked' && (
                      <progress className={`w-full h-2 ${status === 'completed' ? 'progress-success' : ''}`} max={100} value={percent} />
                    )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
