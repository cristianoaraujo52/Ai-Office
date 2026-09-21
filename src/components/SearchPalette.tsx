import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../contexts/DataContext'

interface SearchResult {
  type: 'aula' | 'modulo'
  id: string
  label: string
  sublabel: string
  icon: string
}

export default function SearchPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const { modulos } = useData()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  // Ctrl+K / Cmd+K para abrir
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const results = useMemo<SearchResult[]>(() => {
    const q = query.toLowerCase().trim()

    const aulas: SearchResult[] = modulos.flatMap(m =>
      (m.aulas ?? [])
        .filter(a =>
          !q ||
          a.titulo.toLowerCase().includes(q) ||
          (a.descricao ?? '').toLowerCase().includes(q)
        )
        .map(a => ({
          type: 'aula' as const,
          id: a.id,
          label: a.titulo,
          sublabel: m.titulo.split(' - ').slice(1).join(' - ') || m.titulo,
          icon: 'play_circle',
        }))
    )

    const mods: SearchResult[] = modulos
      .filter(m => !q || m.titulo.toLowerCase().includes(q) || (m.descricao ?? '').toLowerCase().includes(q))
      .map(m => ({
        type: 'modulo' as const,
        id: m.id,
        label: m.titulo.split(' - ').slice(1).join(' - ') || m.titulo,
        sublabel: `${m.aulas?.length ?? 0} aulas`,
        icon: 'folder',
      }))

    return [...aulas, ...mods].slice(0, 9)
  }, [query, modulos])

  useEffect(() => { setSelectedIdx(0) }, [results])

  const go = (item: SearchResult) => {
    navigate(item.type === 'aula' ? `/aula/${item.id}` : `/modulo/${item.id}`)
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl mx-4 fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-[#1e293b] border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5">
            <span className="material-symbols-outlined text-white/30" style={{ fontSize: '20px' }}>search</span>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setSelectedIdx(i => Math.min(i + 1, results.length - 1))
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  setSelectedIdx(i => Math.max(i - 1, 0))
                }
                if (e.key === 'Enter' && results[selectedIdx]) {
                  go(results[selectedIdx])
                }
              }}
              placeholder="Buscar aulas, módulos..."
              className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-white/30"
            />
            <kbd className="hidden sm:block text-white/20 text-[11px] border border-white/10 rounded px-1.5 py-0.5 font-mono">
              Esc
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-72 overflow-y-auto py-1.5">
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center text-white/30 text-sm">
                Nenhum resultado para "{query}"
              </div>
            ) : (
              results.map((item, i) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => go(item)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    i === selectedIdx
                      ? 'bg-[#8b5cf6]/15 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    i === selectedIdx ? 'bg-[#8b5cf6]/20' : 'bg-white/5'
                  }`}>
                    <span className={`material-symbols-outlined ${i === selectedIdx ? 'text-[#8b5cf6]' : 'text-white/40'}`} style={{ fontSize: '15px' }}>
                      {item.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.label}</div>
                    <div className="text-xs text-white/30 truncate">{item.sublabel}</div>
                  </div>
                  {i === selectedIdx && (
                    <kbd className="text-white/20 text-[11px] border border-white/10 rounded px-1.5 py-0.5 font-mono shrink-0">↵</kbd>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-white/5 flex gap-4 text-white/20 text-[11px]">
            <span>↑↓ navegar</span>
            <span>↵ abrir</span>
            <span>Esc fechar</span>
            <span className="ml-auto flex items-center gap-1">
              <kbd className="border border-white/10 rounded px-1 font-mono">Ctrl</kbd>
              <span>+</span>
              <kbd className="border border-white/10 rounded px-1 font-mono">K</kbd>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
