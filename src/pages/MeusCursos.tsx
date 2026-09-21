import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import type { Modulo } from '../types/index'

type Filter = 'todos' | 'em_progresso' | 'concluido' | 'bloqueado'

export default function MeusCursos() {
  const { user } = useAuth()
  const { modulos, progressos, loading } = useData()
  const [filter, setFilter] = useState<Filter>('todos')
  const [search, setSearch] = useState('')

  const progressoMap = useMemo(() => {
    const map: Record<string, boolean> = {}
    progressos.forEach(p => { map[p.aula_id] = p.concluida })
    return map
  }, [progressos])

  const getStatus = (m: Modulo) => {
    const aulas = m.aulas || []
    if (aulas.length === 0) return 'bloqueado' as const
    const done = aulas.filter(a => progressoMap[a.id]).length
    if (done === aulas.length) return 'concluido' as const
    if (done > 0) return 'em_progresso' as const
    if (m.ordem === 1) return 'em_progresso' as const
    const anterior = modulos.find(x => x.ordem === m.ordem - 1)
    const anteriorOk = anterior
      ? (anterior.aulas ?? []).length > 0 && (anterior.aulas ?? []).every(a => progressoMap[a.id])
      : true
    return anteriorOk ? 'em_progresso' as const : 'bloqueado' as const
  }

  const getPercent = (m: Modulo) => {
    const aulas = m.aulas || []
    if (aulas.length === 0) return 0
    return Math.round((aulas.filter(a => progressoMap[a.id]).length / aulas.length) * 100)
  }

  const filtered = useMemo(() => modulos.filter(m => {
    const status = getStatus(m)
    if (filter !== 'todos' && status !== filter) return false
    if (search && !m.titulo.toLowerCase().includes(search.toLowerCase()) &&
        !m.descricao.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [modulos, filter, search, progressoMap])

  const counts = useMemo(() => ({
    todos: modulos.length,
    em_progresso: modulos.filter(m => getStatus(m) === 'em_progresso').length,
    concluido: modulos.filter(m => getStatus(m) === 'concluido').length,
    bloqueado: modulos.filter(m => getStatus(m) === 'bloqueado').length,
  }), [modulos, progressoMap])

  const STATUS_CONFIG = {
    concluido:    { label: 'Concluído',     icon: 'check_circle', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/20' },
    em_progresso: { label: 'Em Progresso',  icon: 'play_arrow',   color: 'text-[#8b5cf6]',  bg: 'bg-[#8b5cf6]/15 border-[#8b5cf6]/20' },
    bloqueado:    { label: 'Bloqueado',     icon: 'lock',         color: 'text-white/30',    bg: 'bg-white/5 border-white/10' },
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[280px] flex flex-col">
        <TopBar title="Meus Cursos" subtitle="Todos os módulos do programa" />
        <main className="flex-1 p-8 space-y-6 fade-in">

          {/* Filtros + busca */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2 flex-wrap">
              {(['todos', 'em_progresso', 'concluido', 'bloqueado'] as Filter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                    filter === f
                      ? 'bg-[#8b5cf6] text-white'
                      : 'bg-[#1e293b] border border-white/5 text-white/50 hover:text-white'
                  }`}
                >
                  {f === 'todos' ? 'Todos' : f === 'em_progresso' ? 'Em Progresso' : f === 'concluido' ? 'Concluídos' : 'Bloqueados'}
                  <span className="ml-1.5 text-[10px] opacity-60">{counts[f]}</span>
                </button>
              ))}
            </div>
            <div className="relative sm:ml-auto">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30" style={{ fontSize: '16px' }}>search</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar módulo..."
                className="pl-9 pr-4 py-1.5 bg-[#1e293b] border border-white/5 rounded-lg text-white/70 text-sm focus:outline-none focus:border-[#8b5cf6] placeholder-white/20 w-full sm:w-48"
              />
            </div>
          </div>

          {/* Lista de módulos */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-[#1e293b] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-white/20">
              <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>search_off</span>
              <p className="mt-2 text-sm">Nenhum módulo encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(m => {
                const status = getStatus(m)
                const percent = getPercent(m)
                const cfg = STATUS_CONFIG[status]
                const aulas = m.aulas || []
                const done = aulas.filter(a => progressoMap[a.id]).length
                const isLocked = status === 'bloqueado'
                return (
                  <Link
                    key={m.id}
                    to={isLocked ? '#' : `/modulo/${m.id}`}
                    className={`bg-[#1e293b] border rounded-xl overflow-hidden transition-all flex ${
                      isLocked ? 'border-white/5 opacity-50 cursor-not-allowed' :
                      status === 'em_progresso' ? 'border-[#8b5cf6]/30 hover:border-[#8b5cf6]/50 elevation-hover' :
                      'border-white/5 hover:border-white/10 elevation-hover'
                    }`}
                  >
                    {/* Sidebar color */}
                    <div className={`w-1 shrink-0 ${status === 'concluido' ? 'bg-emerald-500' : status === 'em_progresso' ? 'bg-[#8b5cf6]' : 'bg-white/10'}`} />

                    {/* Cover */}
                    <div className="w-24 shrink-0 bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] relative overflow-hidden">
                      {m.cover_image && (
                        <img src={m.cover_image} alt="" className="w-full h-full object-cover"
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white/10 font-bold text-3xl">{m.ordem}</span>
                      </div>
                    </div>

                    <div className="flex-1 p-4 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <p className="text-white/40 text-xs">{m.titulo.split(' - ')[0]}</p>
                          <h3 className="text-white font-semibold text-sm leading-tight">{m.titulo.split(' - ')[1] ?? m.titulo}</h3>
                        </div>
                        <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${cfg.bg} ${cfg.color}`}>
                          <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>{cfg.icon}</span>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-white/40 text-xs mt-1 line-clamp-1">{m.descricao}</p>
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-xs text-white/30">
                          <span>{done}/{aulas.length} aulas</span>
                          <span>{percent}%</span>
                        </div>
                        <progress
                          className={`w-full h-1.5 ${status === 'concluido' ? 'progress-success' : ''}`}
                          max={100} value={percent}
                        />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
