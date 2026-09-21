import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'

interface Flashcard { frente: string; verso: string }
interface SavedDeck { titulo: string; cards: Flashcard[]; aulaId: string }

function loadAllDecks(): SavedDeck[] {
  const decks: SavedDeck[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith('flashcards_')) continue
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const { titulo, cards } = JSON.parse(raw) as { titulo: string; cards: Flashcard[] }
      decks.push({ aulaId: key.replace('flashcards_', ''), titulo, cards })
    } catch { /* skip */ }
  }
  return decks
}

export default function AllFlashcards() {
  const { user } = useAuth()
  const { modulos } = useData()
  const isAdmin = user?.role === 'admin'

  const [decks, setDecks] = useState<SavedDeck[]>([])
  const [activeDeck, setActiveDeck] = useState<SavedDeck | null>(null)
  const [cardIdx, setCardIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState<boolean[]>([])

  useEffect(() => { setDecks(loadAllDecks()) }, [])

  const totalCards = useMemo(() => decks.reduce((s, d) => s + d.cards.length, 0), [decks])

  const startDeck = (deck: SavedDeck) => {
    setActiveDeck(deck)
    setCardIdx(0)
    setFlipped(false)
    setKnown([])
  }

  const handleKnown = (knew: boolean) => {
    setKnown(prev => { const n = [...prev]; n[cardIdx] = knew; return n })
    setFlipped(false)
    setTimeout(() => {
      if (cardIdx + 1 >= (activeDeck?.cards.length ?? 0)) {
        setActiveDeck(null)
      } else {
        setCardIdx(i => i + 1)
      }
    }, 150)
  }

  const clearAll = () => {
    if (!window.confirm('Apagar todos os flashcards salvos?')) return
    decks.forEach(d => localStorage.removeItem(`flashcards_${d.aulaId}`))
    setDecks([])
    setActiveDeck(null)
  }

  /* ── Modo revisão ── */
  if (activeDeck) {
    const card = activeDeck.cards[cardIdx]
    const progress = Math.round(((cardIdx) / activeDeck.cards.length) * 100)
    return (
      <div className="min-h-screen bg-[#0f172a] flex">
        <Sidebar isAdmin={isAdmin} />
        <div className="flex-1 ml-0 md:ml-[280px] flex flex-col">
          <TopBar title="Revisão" subtitle={activeDeck.titulo} />
          <main className="flex-1 p-8 flex flex-col items-center justify-center gap-6 max-w-2xl mx-auto w-full">
            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs text-white/40">
                <span>{cardIdx + 1} / {activeDeck.cards.length}</span>
                <span>{known.filter(Boolean).length} acertados</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#8b5cf6] rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div
              className="w-full cursor-pointer"
              style={{ perspective: '1000px', minHeight: 260 }}
              onClick={() => setFlipped(f => !f)}
            >
              <div style={{
                position: 'relative', width: '100%', minHeight: 260,
                transformStyle: 'preserve-3d',
                transition: 'transform 0.45s ease',
                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}>
                {/* Frente */}
                <div style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0 }}
                  className="bg-[#1e293b] border border-[#8b5cf6]/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4">
                  <span className="material-symbols-outlined text-[#8b5cf6]" style={{ fontSize: '32px' }}>help</span>
                  <p className="text-white font-semibold text-lg leading-relaxed">{card.frente}</p>
                  <p className="text-white/30 text-xs mt-2">Clique para revelar</p>
                </div>
                {/* Verso */}
                <div style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0, transform: 'rotateY(180deg)' }}
                  className="bg-[#0f2918] border border-emerald-500/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4">
                  <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                  <p className="text-white font-semibold text-lg leading-relaxed">{card.verso}</p>
                </div>
              </div>
            </div>

            {flipped && (
              <div className="flex gap-4 w-full">
                <button onClick={() => handleKnown(false)}
                  className="flex-1 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                  Não sabia
                </button>
                <button onClick={() => handleKnown(true)}
                  className="flex-1 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span>
                  Sabia!
                </button>
              </div>
            )}

            <button onClick={() => setActiveDeck(null)} className="text-white/30 hover:text-white text-xs transition-colors">
              ← Voltar para decks
            </button>
          </main>
        </div>
      </div>
    )
  }

  /* ── Lista de decks ── */
  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex-1 ml-0 md:ml-[280px] flex flex-col">
        <TopBar title="Meus Flashcards" subtitle="Revisão de todos os decks gerados" />
        <main className="flex-1 p-8 max-w-3xl mx-auto w-full space-y-8 fade-in">

          {decks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-20 h-20 rounded-2xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#8b5cf6]" style={{ fontSize: '40px', fontVariationSettings: "'FILL' 1" }}>style</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Nenhum flashcard ainda</h3>
                <p className="text-white/40 text-sm mt-1 max-w-sm">Acesse uma aula, vá na aba <strong className="text-white/60">Flashcards</strong> e gere cartões com IA. Eles aparecerão aqui para revisão global.</p>
              </div>
              <Link to="/dashboard" className="px-5 py-2.5 bg-[#8b5cf6] text-white rounded-xl text-sm font-medium hover:bg-[#7c3aed] transition-all">
                Ir para o Dashboard
              </Link>
            </div>
          ) : (
            <>
              {/* Resumo */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Decks salvos', value: decks.length, icon: 'layers' },
                  { label: 'Total de cartões', value: totalCards, icon: 'style' },
                  { label: 'Aulas com revisão', value: decks.length, icon: 'school' },
                ].map(s => (
                  <div key={s.label} className="bg-[#1e293b] border border-white/5 rounded-xl p-4 text-center">
                    <span className="material-symbols-outlined text-[#8b5cf6]" style={{ fontSize: '24px' }}>{s.icon}</span>
                    <p className="text-white font-bold text-2xl mt-1">{s.value}</p>
                    <p className="text-white/40 text-xs">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Decks */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Decks disponíveis</h3>
                  <button onClick={clearAll} className="text-white/20 hover:text-red-400 text-xs transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                    Limpar tudo
                  </button>
                </div>
                <div className="space-y-3">
                  {decks.map(deck => (
                    <div key={deck.aulaId}
                      className="bg-[#1e293b] border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:border-[#8b5cf6]/30 transition-all group">
                      <div className="w-10 h-10 rounded-lg bg-[#8b5cf6]/15 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[#8b5cf6]" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>style</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{deck.titulo}</p>
                        <p className="text-white/40 text-xs mt-0.5">{deck.cards.length} cartões</p>
                      </div>
                      <button
                        onClick={() => startDeck(deck)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#8b5cf6]/15 text-[#8b5cf6] rounded-lg text-sm font-medium hover:bg-[#8b5cf6] hover:text-white transition-all"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>play_arrow</span>
                        Revisar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
