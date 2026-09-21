import React, { useState, useRef, useEffect, useCallback } from 'react'
import { streamChatCompletion, isOpenAIConfigured } from '../lib/openai'
import type { Aula } from '../types'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AiTutorProps {
  aula: Aula
}

function buildSystemPrompt(aula: Aula): string {
  const parts: string[] = [
    `Você é um tutor de IA especializado nesta aula: "${aula.titulo}".`,
    `Responda sempre em português do Brasil, de forma clara, didática e motivadora.`,
    `Seja conciso — máximo 3 parágrafos por resposta.`,
    `Se a pergunta não for relacionada à aula, redirecione gentilmente ao tema.`,
    ``,
    `Contexto da aula:`,
    aula.descricao || '',
  ]
  if (aula.objetivo) parts.push(`Objetivo: ${aula.objetivo}`)
  if (aula.resumo) parts.push(`Resumo: ${aula.resumo}`)
  if (aula.dicas?.length) parts.push(`Dicas: ${aula.dicas.join('; ')}`)
  return parts.filter(Boolean).join('\n')
}

const BoltIcon = ({ size = 22, color = 'white' }: { size?: number; color?: string }) => (
  <svg viewBox="0 0 48 46" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
      fill={color}
      fillOpacity="0.95"
    />
  </svg>
)

export default function AiTutor({ aula }: AiTutorProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return

    const userMsg: ChatMessage = { role: 'user', content: input.trim() }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setLoading(true)

    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    let accumulated = ''
    try {
      await streamChatCompletion(
        [{ role: 'system', content: buildSystemPrompt(aula) }, ...history],
        (chunk) => {
          accumulated += chunk
          setMessages(prev => {
            const next = [...prev]
            next[next.length - 1] = { role: 'assistant', content: accumulated }
            return next
          })
        }
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      setMessages(prev => {
        const next = [...prev]
        next[next.length - 1] = { role: 'assistant', content: `⚠️ ${msg}` }
        return next
      })
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, aula])

  if (!isOpenAIConfigured) return null

  return (
    <>
      <style>{`
        @keyframes ai-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(134,59,255,0.7), 0 0 20px rgba(134,59,255,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(134,59,255,0), 0 0 35px rgba(134,59,255,0.6); }
        }
        @keyframes ai-scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400px); }
        }
        @keyframes ai-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes ai-fadein {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ai-typing {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes ai-orbit {
          from { transform: rotate(0deg) translateX(18px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(18px) rotate(-360deg); }
        }
        .ai-panel { animation: ai-fadein 0.25s ease forwards; }
        .ai-scan-line {
          position: absolute; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(167,139,250,0.4), transparent);
          animation: ai-scan 3s linear infinite;
          pointer-events: none;
        }
        .ai-dot { animation: ai-typing 1.4s infinite ease-in-out; }
        .ai-dot:nth-child(2) { animation-delay: 0.2s; }
        .ai-dot:nth-child(3) { animation-delay: 0.4s; }
        .ai-msg-in { animation: ai-fadein 0.18s ease forwards; }
        .ai-status { animation: ai-blink 2s ease infinite; }
      `}</style>

      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        title="Tutor IA"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        style={{
          background: open
            ? 'linear-gradient(135deg, #4c1d95 0%, #1e1040 100%)'
            : 'linear-gradient(135deg, #863bff 0%, #5b21b6 100%)',
          animation: open ? 'none' : 'ai-pulse 2.5s ease infinite',
          boxShadow: '0 0 24px rgba(134,59,255,0.5)',
        }}
      >
        {open ? (
          <span className="material-symbols-outlined text-white/70" style={{ fontSize: '24px' }}>close</span>
        ) : (
          <BoltIcon size={24} color="white" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="ai-panel fixed bottom-24 right-6 z-50 flex flex-col overflow-hidden"
          style={{
            width: '320px',
            height: '460px',
            background: 'linear-gradient(160deg, #0a0a1a 0%, #0d0d2b 50%, #080818 100%)',
            border: '1px solid rgba(134,59,255,0.35)',
            borderRadius: '16px',
            boxShadow: '0 0 0 1px rgba(134,59,255,0.1), 0 0 40px rgba(134,59,255,0.15), 0 24px 60px rgba(0,0,0,0.7)',
          }}
        >
          {/* Scan line effect */}
          <div className="ai-scan-line" />

          {/* Grid overlay */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: '16px', overflow: 'hidden',
            backgroundImage: 'linear-gradient(rgba(134,59,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(134,59,255,0.03) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />

          {/* Corner accents */}
          {[
            { top: 0, left: 0, borderTop: '2px solid #863bff', borderLeft: '2px solid #863bff', borderRadius: '16px 0 0 0' },
            { top: 0, right: 0, borderTop: '2px solid #863bff', borderRight: '2px solid #863bff', borderRadius: '0 16px 0 0' },
            { bottom: 0, left: 0, borderBottom: '2px solid #863bff', borderLeft: '2px solid #863bff', borderRadius: '0 0 0 16px' },
            { bottom: 0, right: 0, borderBottom: '2px solid #863bff', borderRight: '2px solid #863bff', borderRadius: '0 0 16px 0' },
          ].map((style, i) => (
            <div key={i} style={{ position: 'absolute', width: '16px', height: '16px', ...style, zIndex: 10 }} />
          ))}

          {/* Header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(134,59,255,0.2)',
            background: 'linear-gradient(90deg, rgba(134,59,255,0.12) 0%, rgba(134,59,255,0.04) 100%)',
            display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, position: 'relative', zIndex: 1,
          }}>
            {/* Avatar */}
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
              background: 'linear-gradient(135deg, #863bff, #5b21b6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 12px rgba(134,59,255,0.5)',
              border: '1px solid rgba(167,139,250,0.3)',
            }}>
              <BoltIcon size={16} color="white" />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#e2d9ff', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Tutor IA
                </span>
                <div className="ai-status" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
              </div>
              <p style={{ color: 'rgba(167,139,250,0.6)', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
                {aula.titulo}
              </p>
            </div>

            <button
              onClick={() => setMessages([])}
              title="Limpar chat"
              style={{ color: 'rgba(167,139,250,0.3)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(167,139,250,0.8)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(167,139,250,0.3)')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete_sweep</span>
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative', zIndex: 1 }}>
            {messages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: '12px' }}>
                {/* Hologram icon */}
                <div style={{ position: 'relative', width: '64px', height: '64px' }}>
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(134,59,255,0.2) 0%, transparent 70%)',
                    animation: 'ai-pulse 2s ease infinite',
                  }} />
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(134,59,255,0.2), rgba(91,33,182,0.1))',
                    border: '1px solid rgba(134,59,255,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(134,59,255,0.3)',
                  }}>
                    <BoltIcon size={28} color="#a78bfa" />
                  </div>
                </div>

                <div>
                  <p style={{ color: 'rgba(226,217,255,0.8)', fontSize: '11px', lineHeight: '1.7', letterSpacing: '0.02em' }}>
                    SISTEMA INICIALIZADO<br />
                    <span style={{ color: 'rgba(167,139,250,0.5)', fontSize: '10px' }}>Pronto para auxiliar em</span>
                  </p>
                  <p style={{ color: '#a78bfa', fontSize: '11px', fontWeight: 600, marginTop: '3px' }}>
                    {aula.titulo}
                  </p>
                </div>

                {/* Quick prompts */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginTop: '4px' }}>
                  {['O que vou aprender?', 'Resumo rápido', 'Dicas práticas'].map(q => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      style={{
                        fontSize: '10px', padding: '5px 10px',
                        background: 'rgba(134,59,255,0.08)',
                        border: '1px solid rgba(134,59,255,0.25)',
                        borderRadius: '4px', color: 'rgba(167,139,250,0.7)',
                        cursor: 'pointer', transition: 'all 0.2s',
                        letterSpacing: '0.02em',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(134,59,255,0.2)'
                        e.currentTarget.style.color = '#c4b5fd'
                        e.currentTarget.style.borderColor = 'rgba(134,59,255,0.5)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(134,59,255,0.08)'
                        e.currentTarget.style.color = 'rgba(167,139,250,0.7)'
                        e.currentTarget.style.borderColor = 'rgba(134,59,255,0.25)'
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className="ai-msg-in" style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'assistant' && (
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '4px', flexShrink: 0,
                    background: 'linear-gradient(135deg, #863bff, #5b21b6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginRight: '6px', marginTop: '2px',
                    boxShadow: '0 0 8px rgba(134,59,255,0.4)',
                  }}>
                    <BoltIcon size={10} color="white" />
                  </div>
                )}
                <div style={{
                  maxWidth: '78%',
                  padding: '8px 11px',
                  fontSize: '11px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  ...(msg.role === 'user' ? {
                    background: 'linear-gradient(135deg, #863bff, #6d28d9)',
                    color: 'white',
                    borderRadius: '10px 10px 2px 10px',
                    boxShadow: '0 0 12px rgba(134,59,255,0.3)',
                  } : {
                    background: 'rgba(134,59,255,0.07)',
                    color: 'rgba(226,217,255,0.85)',
                    border: '1px solid rgba(134,59,255,0.2)',
                    borderRadius: '2px 10px 10px 10px',
                  }),
                }}>
                  {msg.content || (
                    <span style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '2px 0' }}>
                      {[0, 1, 2].map(j => (
                        <span key={j} className="ai-dot" style={{
                          width: '5px', height: '5px', borderRadius: '50%',
                          background: 'rgba(167,139,250,0.6)', display: 'inline-block',
                          animationDelay: `${j * 0.2}s`,
                        }} />
                      ))}
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '12px', borderTop: '1px solid rgba(134,59,255,0.15)',
            background: 'rgba(134,59,255,0.04)', flexShrink: 0, position: 'relative', zIndex: 1,
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Digite sua pergunta..."
                disabled={loading}
                style={{
                  flex: 1, background: 'rgba(10,10,30,0.8)',
                  border: '1px solid rgba(134,59,255,0.25)',
                  borderRadius: '6px', padding: '8px 12px',
                  color: 'rgba(226,217,255,0.9)', fontSize: '11px',
                  outline: 'none', letterSpacing: '0.02em',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  opacity: loading ? 0.5 : 1,
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'rgba(134,59,255,0.7)'
                  e.currentTarget.style.boxShadow = '0 0 12px rgba(134,59,255,0.2)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(134,59,255,0.25)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                style={{
                  width: '34px', height: '34px', flexShrink: 0, borderRadius: '6px',
                  background: input.trim() && !loading
                    ? 'linear-gradient(135deg, #863bff, #5b21b6)'
                    : 'rgba(134,59,255,0.15)',
                  border: '1px solid rgba(134,59,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  boxShadow: input.trim() && !loading ? '0 0 12px rgba(134,59,255,0.4)' : 'none',
                }}
              >
                <span className="material-symbols-outlined text-white" style={{ fontSize: '15px', opacity: input.trim() && !loading ? 1 : 0.3 }}>send</span>
              </button>
            </div>
            <p style={{ textAlign: 'center', marginTop: '7px', fontSize: '9px', color: 'rgba(134,59,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              IA · Powered by OpenAI
            </p>
          </div>
        </div>
      )}
    </>
  )
}
