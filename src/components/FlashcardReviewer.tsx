import React, { useState, useCallback } from 'react'
import { chatCompletion, isOpenAIConfigured } from '../lib/openai'
import type { Aula } from '../types'

interface Flashcard {
  frente: string
  verso: string
}

interface FlashcardReviewerProps {
  aula: Aula
}

type Phase = 'idle' | 'loading' | 'reviewing' | 'done'

function buildFlashcardPrompt(aula: Aula): string {
  const parts = [
    `Crie exatamente 6 flashcards de revisão para a aula: "${aula.titulo}".`,
    `Cada flashcard deve ter uma pergunta objetiva na frente e uma resposta clara e didática no verso.`,
    `Responda APENAS com JSON válido neste formato (sem markdown, sem texto extra):`,
    `[{"frente":"pergunta aqui","verso":"resposta aqui"}, ...]`,
    ``,
    `Contexto da aula:`,
    aula.descricao || '',
  ]
  if (aula.objetivo) parts.push(`Objetivo: ${aula.objetivo}`)
  if (aula.resumo) parts.push(`Resumo: ${aula.resumo}`)
  if (aula.dicas?.length) parts.push(`Pontos-chave: ${aula.dicas.join('; ')}`)
  return parts.filter(Boolean).join('\n')
}

export default function FlashcardReviewer({ aula }: FlashcardReviewerProps) {
  const [phase, setPhase]           = useState<Phase>('idle')
  const [cards, setCards]           = useState<Flashcard[]>([])
  const [current, setCurrent]       = useState(0)
  const [flipped, setFlipped]       = useState(false)
  const [known, setKnown]           = useState<boolean[]>([])
  const [error, setError]           = useState<string | null>(null)

  const generate = useCallback(async () => {
    setPhase('loading')
    setError(null)
    setCards([])
    setCurrent(0)
    setFlipped(false)
    setKnown([])
    try {
      const raw = await chatCompletion([
        { role: 'system', content: 'Você é um especialista em pedagogia. Responda APENAS com JSON válido, sem markdown.' },
        { role: 'user',   content: buildFlashcardPrompt(aula) },
      ], { temperature: 0.6, max_tokens: 900 })

      // Strip possible markdown fences
      const clean = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
      const parsed: Flashcard[] = JSON.parse(clean)
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Formato inválido')
      setCards(parsed)
      setPhase('reviewing')
      // Persiste para revisão global
      localStorage.setItem(`flashcards_${aula.id}`, JSON.stringify({ titulo: aula.titulo, cards: parsed }))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar flashcards')
      setPhase('idle')
    }
  }, [aula])

  const handleKnown = (knew: boolean) => {
    setKnown(prev => {
      const next = [...prev]
      next[current] = knew
      return next
    })
    setFlipped(false)
    setTimeout(() => {
      if (current + 1 >= cards.length) {
        setPhase('done')
      } else {
        setCurrent(c => c + 1)
      }
    }, 180)
  }

  const restart = () => {
    setCurrent(0)
    setFlipped(false)
    setKnown([])
    setPhase('reviewing')
  }

  if (!isOpenAIConfigured) return (
    <div className="text-center py-12 text-white/20">
      <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>key_off</span>
      <p className="mt-2 text-sm">Chave OpenAI não configurada.</p>
    </div>
  )

  /* ── IDLE / ERROR ── */
  if (phase === 'idle') return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <div style={{
        width: 72, height: 72, borderRadius: 16,
        background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(91,33,182,0.1))',
        border: '1px solid rgba(139,92,246,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 24px rgba(139,92,246,0.2)',
      }}>
        <span className="material-symbols-outlined text-[#a78bfa]" style={{ fontSize: '36px', fontVariationSettings: "'FILL' 1" }}>style</span>
      </div>
      <div className="text-center">
        <h3 className="text-white font-semibold text-base mb-1">Revisão por Flashcards</h3>
        <p className="text-white/40 text-sm max-w-sm">A IA vai gerar 6 cartões de revisão baseados no conteúdo desta aula. Clique no cartão para revelar a resposta.</p>
      </div>
      {error && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
          {error}
        </div>
      )}
      <button
        onClick={generate}
        className="flex items-center gap-2 px-6 py-2.5 text-white text-sm font-semibold rounded-xl transition-all hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #863bff, #5b21b6)', boxShadow: '0 0 20px rgba(134,59,255,0.4)' }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
        Gerar Flashcards com IA
      </button>
    </div>
  )

  /* ── LOADING ── */
  if (phase === 'loading') return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div style={{ position: 'relative', width: 64, height: 64 }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '2px solid transparent',
          borderTopColor: '#8b5cf6',
          animation: 'spin 1s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 8,
          background: 'rgba(139,92,246,0.1)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="material-symbols-outlined text-[#8b5cf6]" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>psychology</span>
        </div>
      </div>
      <p className="text-white/50 text-sm">Gerando flashcards com IA...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  /* ── DONE ── */
  if (phase === 'done') {
    const total    = cards.length
    const knewCount = known.filter(Boolean).length
    const missed   = total - knewCount
    const pct      = Math.round((knewCount / total) * 100)

    return (
      <div className="flex flex-col items-center justify-center py-10 gap-6">
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: pct >= 70 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
          border: `2px solid ${pct >= 70 ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 24px ${pct >= 70 ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
        }}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '40px', color: pct >= 70 ? '#34d399' : '#fbbf24', fontVariationSettings: "'FILL' 1" }}
          >
            {pct >= 70 ? 'emoji_events' : 'psychology_alt'}
          </span>
        </div>

        <div className="text-center">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Resultado da revisão</p>
          <h3 className="text-white font-bold text-2xl">{pct}%</h3>
          <p className="text-white/50 text-sm mt-1">
            {pct >= 70 ? 'Excelente domínio do conteúdo!' : 'Continue praticando para fixar melhor.'}
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <span className="text-emerald-400 font-bold text-2xl">{knewCount}</span>
            <span className="text-emerald-400/60 text-xs">Sabia</span>
          </div>
          <div className="flex flex-col items-center gap-1 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <span className="text-red-400 font-bold text-2xl">{missed}</span>
            <span className="text-red-400/60 text-xs">Não sabia</span>
          </div>
        </div>

        {/* Missed cards recap */}
        {missed > 0 && (
          <div className="w-full max-w-md space-y-2">
            <p className="text-white/30 text-xs uppercase tracking-widest text-center mb-3">Cartões para revisar</p>
            {cards.filter((_, i) => !known[i]).map((c, i) => (
              <div key={i} className="bg-[#0f172a] border border-red-500/15 rounded-xl p-3">
                <p className="text-white/70 text-xs font-medium">{c.frente}</p>
                <p className="text-white/40 text-xs mt-1 border-t border-white/5 pt-1">{c.verso}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={restart}
            className="flex items-center gap-2 px-5 py-2 border border-[#334155] text-white/60 text-sm rounded-xl hover:text-white hover:border-white/20 transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>replay</span>
            Revisar novamente
          </button>
          <button
            onClick={generate}
            className="flex items-center gap-2 px-5 py-2 text-white text-sm rounded-xl transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #863bff, #5b21b6)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            Novos flashcards
          </button>
        </div>
      </div>
    )
  }

  /* ── REVIEWING ── */
  const card = cards[current]
  const progress = ((current) / cards.length) * 100

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .fc-card { perspective: 1000px; width: 100%; max-width: 420px; height: 220px; cursor: pointer; }
        .fc-inner { position: relative; width: 100%; height: 100%; transition: transform 0.5s cubic-bezier(.4,0,.2,1); transform-style: preserve-3d; }
        .fc-inner.flipped { transform: rotateY(180deg); }
        .fc-face { position: absolute; inset: 0; backface-visibility: hidden; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; text-align: center; }
        .fc-front { background: linear-gradient(135deg, #1a1040 0%, #0f0a28 100%); border: 1px solid rgba(139,92,246,0.35); box-shadow: 0 0 30px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.05); }
        .fc-back { background: linear-gradient(135deg, #0a1f14 0%, #061510 100%); border: 1px solid rgba(16,185,129,0.35); box-shadow: 0 0 30px rgba(16,185,129,0.12), inset 0 1px 0 rgba(255,255,255,0.05); transform: rotateY(180deg); }
        .fc-card-slide-in { animation: fc-slide 0.2s ease forwards; }
        @keyframes fc-slide { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>

      {/* Progress */}
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/30 text-xs">{current + 1} de {cards.length}</span>
          <span className="text-[#8b5cf6] text-xs font-bold">{Math.round(((known.filter(Boolean).length) / cards.length) * 100)}% dominado</span>
        </div>
        <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
          <div className="h-full bg-[#8b5cf6] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Card */}
      <div className="fc-card fc-card-slide-in" key={current} onClick={() => setFlipped(f => !f)}>
        <div className={`fc-inner ${flipped ? 'flipped' : ''}`}>
          {/* Front */}
          <div className="fc-face fc-front">
            <div style={{
              width: 32, height: 32, borderRadius: 8, marginBottom: 12,
              background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined text-[#a78bfa]" style={{ fontSize: '16px' }}>help</span>
            </div>
            <p className="text-white font-semibold text-sm leading-relaxed">{card.frente}</p>
            <p className="text-white/25 text-xs mt-3">Clique para revelar</p>
          </div>

          {/* Back */}
          <div className="fc-face fc-back">
            <div style={{
              width: 32, height: 32, borderRadius: 8, marginBottom: 12,
              background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
            </div>
            <p className="text-white/90 text-sm leading-relaxed">{card.verso}</p>
          </div>
        </div>
      </div>

      <p className="text-white/25 text-xs">
        {flipped ? 'Você sabia a resposta?' : 'Toque no cartão para ver a resposta'}
      </p>

      {/* Action buttons — only shown after flip */}
      <div className={`flex gap-3 transition-all duration-300 ${flipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
        <button
          onClick={() => handleKnown(false)}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          Não sabia
        </button>
        <button
          onClick={() => handleKnown(true)}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>check</span>
          Sabia!
        </button>
      </div>

      {/* Skip (without flipping) */}
      {!flipped && (
        <button
          onClick={() => setFlipped(true)}
          className="text-white/20 text-xs hover:text-white/40 transition-colors"
        >
          Revelar resposta
        </button>
      )}
    </div>
  )
}
