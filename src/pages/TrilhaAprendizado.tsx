import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'

export default function TrilhaAprendizado() {
  const { user } = useAuth()
  const { modulos, progressos, loading } = useData()

  const progressoMap = useMemo(() => {
    const map: Record<string, boolean> = {}
    progressos.forEach(p => { map[p.aula_id] = p.concluida })
    return map
  }, [progressos])

  const modulosOrdenados = useMemo(() =>
    [...modulos].sort((a, b) => a.ordem - b.ordem)
  , [modulos])

  const getModuloInfo = (m: typeof modulos[0]) => {
    const aulas = m.aulas || []
    const done = aulas.filter(a => progressoMap[a.id]).length
    const percent = aulas.length > 0 ? Math.round((done / aulas.length) * 100) : 0
    const isConcluido = aulas.length > 0 && done === aulas.length
    const isLocked = (() => {
      if (m.ordem === 1) return false
      const anterior = modulos.find(x => x.ordem === m.ordem - 1)
      if (!anterior) return false
      const anteriorAulas = anterior.aulas ?? []
      return !(anteriorAulas.length > 0 && anteriorAulas.every(a => progressoMap[a.id]))
    })()
    const inProgress = !isConcluido && !isLocked && done > 0
    return { done, percent, isConcluido, isLocked, inProgress, total: aulas.length }
  }

  const totalAulas = modulos.flatMap(m => m.aulas || []).length
  const aulasConcluidas = progressos.filter(p => p.concluida).length
  const modulosConcluidos = modulos.filter(m => {
    const a = m.aulas || []
    return a.length > 0 && a.every(au => progressoMap[au.id])
  }).length
  const percentGeral = totalAulas > 0 ? Math.round((aulasConcluidas / totalAulas) * 100) : 0

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[280px] flex flex-col">
        <TopBar title="Trilha de Aprendizado" subtitle="Sua jornada no programa de IA" />
        <main className="flex-1 p-8 fade-in">
          <div className="max-w-2xl mx-auto space-y-8">

            {/* Progresso geral */}
            <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <h3 className="text-white font-semibold">Progresso na Trilha</h3>
                  <p className="text-white/40 text-xs mt-0.5">{modulosConcluidos} de {modulos.length} módulos concluídos</p>
                </div>
                <span className="text-[#8b5cf6] font-bold text-3xl">{percentGeral}%</span>
              </div>
              <progress className="w-full h-3" max={100} value={percentGeral} />
              <div className="flex gap-6 mt-4 text-center">
                <div>
                  <p className="text-white font-bold text-xl">{aulasConcluidas}</p>
                  <p className="text-white/30 text-xs">Aulas concluídas</p>
                </div>
                <div>
                  <p className="text-white font-bold text-xl">{totalAulas - aulasConcluidas}</p>
                  <p className="text-white/30 text-xs">Aulas restantes</p>
                </div>
                <div>
                  <p className="text-white font-bold text-xl">{modulos.reduce((s, m) => s + m.carga_horaria, 0)}h</p>
                  <p className="text-white/30 text-xs">Carga total</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-28 bg-[#1e293b] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="relative">
                {/* Linha vertical */}
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-white/5" />

                <div className="space-y-4">
                  {modulosOrdenados.map((m, idx) => {
                    const { done, percent, isConcluido, isLocked, inProgress, total } = getModuloInfo(m)

                    const nodeColor = isConcluido ? 'bg-emerald-500 ring-emerald-500/30'
                      : inProgress ? 'bg-[#8b5cf6] ring-[#8b5cf6]/30'
                      : isLocked ? 'bg-[#1e293b] ring-white/5'
                      : 'bg-[#8b5cf6]/30 ring-[#8b5cf6]/10'

                    return (
                      <div key={m.id} className="relative flex gap-5">
                        {/* Node */}
                        <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0 ring-4 transition-all ${nodeColor}`}>
                          {isConcluido
                            ? <span className="material-symbols-outlined text-white" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            : isLocked
                            ? <span className="material-symbols-outlined text-white/30" style={{ fontSize: '20px' }}>lock</span>
                            : <span className="text-white font-bold text-sm">{m.ordem}</span>
                          }
                        </div>

                        {/* Card */}
                        <Link
                          to={isLocked ? '#' : `/modulo/${m.id}`}
                          className={`flex-1 mb-1 bg-[#1e293b] border rounded-xl p-4 transition-all ${
                            isLocked
                              ? 'border-white/5 opacity-50 cursor-not-allowed'
                              : inProgress
                              ? 'border-[#8b5cf6]/30 hover:border-[#8b5cf6]/50 elevation-hover'
                              : isConcluido
                              ? 'border-emerald-500/20 hover:border-emerald-500/30 elevation-hover'
                              : 'border-white/5 hover:border-white/10 elevation-hover'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium mb-0.5 ${isConcluido ? 'text-emerald-400' : inProgress ? 'text-[#8b5cf6]' : 'text-white/30'}`}>
                                {m.titulo.split(' - ')[0]}
                              </p>
                              <h4 className="text-white font-semibold text-sm">{m.titulo.split(' - ')[1] ?? m.titulo}</h4>
                              <p className="text-white/40 text-xs mt-1 line-clamp-1">{m.descricao}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={`font-bold text-lg ${isConcluido ? 'text-emerald-400' : 'text-[#8b5cf6]'}`}>{percent}%</p>
                              <p className="text-white/30 text-xs">{done}/{total} aulas</p>
                            </div>
                          </div>

                          {!isLocked && (
                            <div className="mt-3">
                              <progress
                                className={`w-full h-1.5 ${isConcluido ? 'progress-success' : ''}`}
                                max={100} value={percent}
                              />
                            </div>
                          )}

                          {/* Aulas preview */}
                          {!isLocked && (m.aulas || []).length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {(m.aulas || []).slice(0, 6).map(a => (
                                <span
                                  key={a.id}
                                  className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                    progressoMap[a.id]
                                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                      : 'bg-white/3 border-white/5 text-white/30'
                                  }`}
                                >
                                  {a.titulo.length > 20 ? a.titulo.slice(0, 20) + '…' : a.titulo}
                                </span>
                              ))}
                              {(m.aulas || []).length > 6 && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full border bg-white/3 border-white/5 text-white/20">
                                  +{(m.aulas || []).length - 6} mais
                                </span>
                              )}
                            </div>
                          )}
                        </Link>
                      </div>
                    )
                  })}

                  {/* Fim da trilha */}
                  <div className="relative flex gap-5 items-center">
                    <div className={`z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0 ring-4 ${
                      percentGeral === 100
                        ? 'bg-amber-500 ring-amber-500/30'
                        : 'bg-[#1e293b] ring-white/5'
                    }`}>
                      <span className="material-symbols-outlined" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1", color: percentGeral === 100 ? 'white' : '#334155' }}>
                        emoji_events
                      </span>
                    </div>
                    <div className={`flex-1 text-sm font-semibold ${percentGeral === 100 ? 'text-amber-400' : 'text-white/20'}`}>
                      {percentGeral === 100 ? '🎉 Trilha concluída! Resgate seu certificado.' : 'Certificado de Conclusão'}
                    </div>
                    {percentGeral === 100 && (
                      <Link to="/certificado" className="px-4 py-2 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-medium hover:bg-amber-500/25 transition-all">
                        Ver certificado
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
