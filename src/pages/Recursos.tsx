import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'

export default function Recursos() {
  const { user } = useAuth()
  const { modulos, progressos } = useData()

  const progressoMap = useMemo(() => {
    const map: Record<string, boolean> = {}
    progressos.forEach(p => { map[p.aula_id] = p.concluida })
    return map
  }, [progressos])

  // Agrega todos os materiais de todas as aulas
  const materiais = useMemo(() => {
    const list: { titulo: string; url: string; tipo: string; aulaTitulo: string; aulaId: string; moduloTitulo: string }[] = []
    for (const m of modulos) {
      for (const a of (m.aulas || [])) {
        for (const mat of (a.materiais || [])) {
          list.push({
            titulo: mat.titulo,
            url: mat.url,
            tipo: mat.tipo ?? 'link',
            aulaTitulo: a.titulo,
            aulaId: a.id,
            moduloTitulo: m.titulo.split(' - ')[1] ?? m.titulo,
          })
        }
      }
    }
    return list
  }, [modulos])

  // Notas salvas
  const notasSalvas = useMemo(() => {
    const items: { aulaId: string; aulaTitulo: string; chars: number }[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith('notas_aula_')) continue
      const content = localStorage.getItem(key) ?? ''
      if (!content.trim()) continue
      const aulaId = key.replace('notas_aula_', '')
      const aula = modulos.flatMap(m => m.aulas || []).find(a => a.id === aulaId)
      if (aula) items.push({ aulaId, aulaTitulo: aula.titulo, chars: content.length })
    }
    return items
  }, [modulos])

  // Decks de flashcards salvos
  const flashcardDecks = useMemo(() => {
    const items: { aulaId: string; titulo: string; count: number }[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith('flashcards_')) continue
      try {
        const { titulo, cards } = JSON.parse(localStorage.getItem(key) ?? '{}')
        items.push({ aulaId: key.replace('flashcards_', ''), titulo, count: cards?.length ?? 0 })
      } catch { /* skip */ }
    }
    return items
  }, [modulos])

  const tipoIcon = (tipo: string) => {
    if (tipo === 'pdf') return 'picture_as_pdf'
    if (tipo === 'video') return 'play_circle'
    if (tipo === 'slide') return 'slideshow'
    return 'link'
  }

  const tipoColor = (tipo: string) => {
    if (tipo === 'pdf') return 'text-red-400 bg-red-500/10 border-red-500/20'
    if (tipo === 'video') return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    if (tipo === 'slide') return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    return 'text-[#8b5cf6] bg-[#8b5cf6]/10 border-[#8b5cf6]/20'
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[280px] flex flex-col">
        <TopBar title="Recursos" subtitle="Materiais, notas e ferramentas de estudo" />
        <main className="flex-1 p-8 space-y-8 fade-in max-w-4xl mx-auto w-full">

          {/* Quick links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: 'style',              label: 'Flashcards',  desc: `${flashcardDecks.length} deck${flashcardDecks.length !== 1 ? 's' : ''}`,  to: '/flashcards',   color: 'text-[#8b5cf6]', bg: 'bg-[#8b5cf6]/10' },
              { icon: 'leaderboard',        label: 'Ranking',     desc: 'Ver meu XP',                                                               to: '/leaderboard',  color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { icon: 'workspace_premium',  label: 'Certificado', desc: 'Minha conquista',                                                           to: '/certificado',  color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { icon: 'edit_note',          label: 'Anotações',   desc: `${notasSalvas.length} aula${notasSalvas.length !== 1 ? 's' : ''} com notas`, to: '/dashboard',   color: 'text-sky-400', bg: 'bg-sky-500/10' },
            ].map(item => (
              <Link key={item.to + item.label} to={item.to}
                className="bg-[#1e293b] border border-white/5 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-white/10 elevation-hover transition-all text-center">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                  <span className={`material-symbols-outlined ${item.color}`} style={{ fontSize: '20px' }}>{item.icon}</span>
                </div>
                <p className="text-white text-xs font-semibold">{item.label}</p>
                <p className="text-white/30 text-[10px]">{item.desc}</p>
              </Link>
            ))}
          </div>

          {/* Notas salvas */}
          {notasSalvas.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-400" style={{ fontSize: '18px' }}>edit_note</span>
                Minhas Anotações
                <span className="text-white/30 text-sm font-normal">({notasSalvas.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {notasSalvas.map(n => (
                  <Link key={n.aulaId} to={`/aula/${n.aulaId}`}
                    className="flex items-center gap-3 bg-[#1e293b] border border-white/5 rounded-xl p-3 hover:border-sky-500/20 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-sky-400" style={{ fontSize: '16px' }}>edit_note</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-xs font-medium truncate group-hover:text-white transition-colors">{n.aulaTitulo}</p>
                      <p className="text-white/30 text-[10px]">{n.chars} caracteres</p>
                    </div>
                    <span className="material-symbols-outlined text-white/20 group-hover:text-white/50" style={{ fontSize: '16px' }}>arrow_forward</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Flashcard decks */}
          {flashcardDecks.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8b5cf6]" style={{ fontSize: '18px' }}>style</span>
                Decks de Flashcards
                <span className="text-white/30 text-sm font-normal">({flashcardDecks.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {flashcardDecks.map(d => (
                  <Link key={d.aulaId} to="/flashcards"
                    className="flex items-center gap-3 bg-[#1e293b] border border-white/5 rounded-xl p-3 hover:border-[#8b5cf6]/30 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#8b5cf6]" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>style</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-xs font-medium truncate group-hover:text-white transition-colors">{d.titulo}</p>
                      <p className="text-white/30 text-[10px]">{d.count} cartões</p>
                    </div>
                    <span className="material-symbols-outlined text-white/20 group-hover:text-white/50" style={{ fontSize: '16px' }}>arrow_forward</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Materiais complementares */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400" style={{ fontSize: '18px' }}>folder_open</span>
              Material Complementar
              <span className="text-white/30 text-sm font-normal">({materiais.length})</span>
            </h3>
            {materiais.length === 0 ? (
              <div className="text-center py-10 text-white/20">
                <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>folder_open</span>
                <p className="mt-2 text-xs">Nenhum material complementar disponível nas aulas.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {materiais.map((mat, i) => (
                  <a key={i} href={mat.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-[#1e293b] border border-white/5 rounded-xl p-3 hover:border-white/10 transition-all group">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${tipoColor(mat.tipo)}`}>
                      <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>{tipoIcon(mat.tipo)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-xs font-medium truncate group-hover:text-white transition-colors">{mat.titulo}</p>
                      <p className="text-white/30 text-[10px]">{mat.moduloTitulo} · {mat.aulaTitulo}</p>
                    </div>
                    <span className="material-symbols-outlined text-white/20 group-hover:text-white/50" style={{ fontSize: '16px' }}>open_in_new</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
