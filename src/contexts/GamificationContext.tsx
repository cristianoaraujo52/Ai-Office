import React, {
  createContext, useContext, useState, useEffect, useCallback,
  useRef, type ReactNode,
} from 'react'

interface GamificacaoData {
  xp: number
  nivel: number
  streak: number
  ultimaAtividade: string
  badges: string[]
}

interface XPToast {
  id: number
  amount: number
  reason: string
}

interface GamificationContextType {
  xp: number
  nivel: number
  streak: number
  badges: string[]
  xpParaProximoNivel: number
  xpNoNivelAtual: number
  addXP: (amount: number, reason: string) => void
  toasts: XPToast[]
}

const STORAGE_KEY = 'ia_academy_gamificacao'
const XP_POR_NIVEL = 100

function calcNivel(xp: number) {
  return Math.floor(xp / XP_POR_NIVEL) + 1
}

function getStoredData(): GamificacaoData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as GamificacaoData
  } catch { /* ignore */ }
  return { xp: 0, nivel: 1, streak: 0, ultimaAtividade: '', badges: [] }
}

function checkStreak(data: GamificacaoData): GamificacaoData {
  const hoje = new Date().toDateString()
  if (data.ultimaAtividade === hoje) return data

  const ontem = new Date(Date.now() - 86_400_000).toDateString()
  const novoStreak = data.ultimaAtividade === ontem ? data.streak + 1 : 1
  return { ...data, streak: novoStreak, ultimaAtividade: hoje }
}

function checkBadges(data: GamificacaoData): GamificacaoData {
  const badges = new Set(data.badges)
  if (data.xp >= 10)  badges.add('primeira_aula')
  if (data.xp >= 100) badges.add('dedicado')
  if (data.xp >= 300) badges.add('expert')
  if (data.streak >= 3)  badges.add('streak_3')
  if (data.streak >= 7)  badges.add('streak_7')
  return { ...data, badges: Array.from(badges) }
}

const GamificationContext = createContext<GamificationContextType | null>(null)

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<GamificacaoData>(getStoredData)
  const [toasts, setToasts] = useState<XPToast[]>([])
  const toastIdRef = useRef(0)

  useEffect(() => {
    const updated = checkStreak(data)
    if (updated.streak !== data.streak) {
      setData(updated)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const addXP = useCallback((amount: number, reason: string) => {
    setData(prev => {
      const next = checkBadges({ ...prev, xp: prev.xp + amount, nivel: calcNivel(prev.xp + amount) })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })

    const id = ++toastIdRef.current
    setToasts(prev => [...prev, { id, amount, reason }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  const xpNoNivelAtual = data.xp % XP_POR_NIVEL
  const xpParaProximoNivel = XP_POR_NIVEL

  return (
    <GamificationContext.Provider value={{
      xp: data.xp,
      nivel: data.nivel,
      streak: data.streak,
      badges: data.badges,
      xpNoNivelAtual,
      xpParaProximoNivel,
      addXP,
      toasts,
    }}>
      {children}
      {/* XP Toast notifications */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className="flex items-center gap-2 px-4 py-2 bg-[#8b5cf6] text-white rounded-full text-sm font-bold shadow-lg shadow-[#8b5cf6]/30 animate-bounce"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>bolt</span>
            +{t.amount} XP — {t.reason}
          </div>
        ))}
      </div>
    </GamificationContext.Provider>
  )
}

export function useGamification() {
  const ctx = useContext(GamificationContext)
  if (!ctx) throw new Error('useGamification deve ser usado dentro de GamificationProvider')
  return ctx
}
