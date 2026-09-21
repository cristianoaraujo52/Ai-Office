import React from 'react'
import { useParams, Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { ModuloSkeleton } from '../components/SkeletonLoader'

export default function ModuloView() {
  const { id } = useParams<{ id: string }>()
  const { modulos, progressos, loading } = useData()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const modulo = modulos.find(m => m.id === id)

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex-1 ml-0 md:ml-[280px] flex flex-col">
        <TopBar />
        <ModuloSkeleton />
      </div>
    </div>
  )

  if (!modulo) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white/50">
      Módulo não encontrado.
    </div>
  )

  const progressoMap: Record<string, boolean> = {}
  progressos.forEach(p => { progressoMap[p.aula_id] = p.concluida })

  const aulas = modulo.aulas || []
  const concluidas = aulas.filter(a => progressoMap[a.id]).length
  const percent = aulas.length > 0 ? Math.round((concluidas / aulas.length) * 100) : 0

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex-1 ml-0 md:ml-[280px] flex flex-col">
        <TopBar />
        <main className="flex-1 p-8 fade-in max-w-4xl mx-auto w-full">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/30 text-xs mb-6">
            <Link to={isAdmin ? '/admin' : '/dashboard'} className="hover:text-white transition-colors">Dashboard</Link>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
            <span className="text-white/60">{modulo.titulo}</span>
          </div>

          {/* Header */}
          <div className="bg-[#1e293b] border border-white/5 rounded-2xl mb-6 overflow-hidden">
            {/* Cover banner */}
            {modulo.cover_image && (
              <div className="relative w-full aspect-[21/9] bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e1b4b] overflow-hidden">
                <img
                  src={modulo.cover_image}
                  alt={modulo.titulo}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-[#1e293b]/40 to-transparent" />
              </div>
            )}
            <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-block px-2 py-0.5 bg-[#8b5cf6]/15 text-[#8b5cf6] text-xs rounded-lg mb-3 font-medium">
                  {modulo.titulo.split(' - ')[0]}
                </span>
                <h1 className="text-white font-bold text-2xl mb-2">{modulo.titulo.split(' - ')[1]}</h1>
                <p className="text-white/50 text-sm">{modulo.descricao}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[#8b5cf6] font-bold text-2xl">{percent}%</p>
                <p className="text-white/30 text-xs">concluído</p>
              </div>
            </div>
            <div className="mt-5">
              <progress className={`w-full h-2 ${percent === 100 ? 'progress-success' : ''}`} max={100} value={percent} />
              <div className="flex gap-4 mt-3">
                <span className="text-white/30 text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>menu_book</span>
                  {aulas.length} aulas
                </span>
                <span className="text-white/30 text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>schedule</span>
                  {modulo.carga_horaria}h de conteúdo
                </span>
                <span className="text-white/30 text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>check_circle</span>
                  {concluidas} de {aulas.length} concluídas
                </span>
              </div>
            </div>
            </div>
          </div>

          {/* Lessons */}
          <div className="space-y-3">
            {aulas.length === 0 ? (
              <div className="bg-[#1e293b] border border-white/5 rounded-xl p-8 text-center text-white/20">
                <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>menu_book</span>
                <p className="mt-2 text-sm">Nenhuma aula disponível ainda.</p>
              </div>
            ) : aulas.map((a, i) => {
              const isDone = progressoMap[a.id]
              return (
                <Link
                  key={a.id}
                  to={`/aula/${a.id}`}
                  className="flex items-center gap-4 bg-[#1e293b] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all group elevation-hover"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm transition-all ${
                    isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#8b5cf6]/10 text-[#8b5cf6] group-hover:bg-[#8b5cf6]/20'
                  }`}>
                    {isDone
                      ? <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      : i + 1
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-sm">{a.titulo}</h3>
                    <p className="text-white/40 text-xs truncate">{a.descricao}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-white/20 text-xs">{a.duracao_min} min</span>
                    {a.slides && a.slides.length > 0 && (
                      <span className="flex items-center gap-1 text-white/20 text-xs">
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>slideshow</span>
                        {a.slides.length}
                      </span>
                    )}
                    {a.quiz && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-[#8b5cf6]/10 text-[#8b5cf6] text-xs rounded-full">
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>quiz</span>
                        Quiz
                      </span>
                    )}
                    <span className="material-symbols-outlined text-white/20 group-hover:text-white/50 transition-colors" style={{ fontSize: '18px' }}>arrow_forward</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}
