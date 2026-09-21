import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useUI } from '../contexts/UIContext'
import { useGamification } from '../contexts/GamificationContext'
import { useData } from '../contexts/DataContext'
import AvatarUpload from './AvatarUpload'

interface TopBarProps {
  title?: string
  subtitle?: string
}

const BADGE_LABELS: Record<string, { label: string; icon: string }> = {
  primeira_aula: { label: '1ª Aula', icon: '🎯' },
  dedicado:      { label: 'Dedicado', icon: '📚' },
  expert:        { label: 'Expert', icon: '🧠' },
  streak_3:      { label: 'Streak 3d', icon: '🔥' },
  streak_7:      { label: 'Streak 7d', icon: '⚡' },
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const { user, logout } = useAuth()
  const { toggleSidebar, theme, toggleTheme } = useUI()
  const { xp, nivel, xpNoNivelAtual, xpParaProximoNivel, streak, badges } = useGamification()
  const { modulos, progressos } = useData()
  const navigate = useNavigate()

  const [showNotifs, setShowNotifs]   = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [notifsRead, setNotifsRead]   = useState(false)
  const [showAvatarUpload, setShowAvatarUpload] = useState(false)

  const notifRef   = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Fechar ao clicar fora
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Gerar notificações baseadas no progresso real
  const notifications = useMemo(() => {
    const items: { id: string; icon: string; title: string; desc: string; color: string; action?: () => void }[] = []
    const progressoMap: Record<string, boolean> = {}
    progressos.forEach(p => { progressoMap[p.aula_id] = p.concluida })

    for (const m of modulos) {
      const aulas = m.aulas ?? []
      if (aulas.length === 0) continue
      const done = aulas.filter(a => progressoMap[a.id]).length

      // Módulo com quiz disponível (concluiu ≥50% mas ainda não tem nota)
      const temQuiz = aulas.some(a => (a as any).quizzes?.length > 0)
      if (temQuiz && done > 0 && done < aulas.length) {
        items.push({
          id: `quiz-${m.id}`,
          icon: 'quiz',
          title: 'Quiz disponível',
          desc: `Teste seus conhecimentos em "${m.titulo.split(' - ').pop()}"`,
          color: '#f59e0b',
        })
      }

      // Módulo recém-desbloqueado (anterior 100% concluído, este com 0% e > ordem 1)
      if (m.ordem > 1 && done === 0) {
        const anterior = modulos.find(x => x.ordem === m.ordem - 1)
        const anteriorAulas = anterior?.aulas ?? []
        const anteriorConcluido =
          anteriorAulas.length > 0 && anteriorAulas.every(a => progressoMap[a.id])
        if (anteriorConcluido) {
          items.push({
            id: `unlock-${m.id}`,
            icon: 'lock_open',
            title: 'Novo módulo desbloqueado!',
            desc: `"${m.titulo.split(' - ').pop()}" está disponível para você`,
            color: '#8b5cf6',
            action: () => navigate(`/modulo/${m.id}`),
          })
        }
      }

      // Certificado disponível
      if (done === aulas.length && aulas.length > 0 && m.ordem === modulos.length) {
        items.push({
          id: 'certificado',
          icon: 'workspace_premium',
          title: 'Certificado disponível!',
          desc: 'Você concluiu o curso. Resgate seu certificado agora.',
          color: '#10b981',
          action: () => navigate('/certificado'),
        })
      }
    }

    // Streak ativo
    if (streak >= 3) {
      items.push({
        id: 'streak',
        icon: 'local_fire_department',
        title: `Streak de ${streak} dias!`,
        desc: 'Continue estudando hoje para manter sua sequência.',
        color: '#f97316',
      })
    }

    // XP milestone
    if (xp > 0 && xp % 100 < 20) {
      items.push({
        id: 'xp-level',
        icon: 'bolt',
        title: `Nível ${nivel} alcançado!`,
        desc: `Você acumulou ${xp} XP. Continue assim!`,
        color: '#8b5cf6',
      })
    }

    // Fallback
    if (items.length === 0) {
      items.push({
        id: 'welcome',
        icon: 'waving_hand',
        title: 'Bem-vindo ao IA Office Academy',
        desc: 'Comece pelo primeiro módulo e ganhe XP a cada aula concluída.',
        color: '#8b5cf6',
        action: () => navigate('/dashboard'),
      })
    }

    return items.slice(0, 5)
  }, [modulos, progressos, streak, xp, nivel, navigate])

  const hasUnread = !notifsRead && notifications.length > 0

  const handleSearch = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))
  }

  const initials = user?.nome?.split(' ').map(n => n[0]).slice(0, 2).join('') ?? '?'

  return (
    <>
    <header className="sticky top-0 z-40 w-full flex justify-between items-center h-16 px-4 md:px-6 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          aria-label="Abrir menu"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>menu</span>
        </button>
        <div>
          {title    && <h2 className="text-white font-semibold text-base">{title}</h2>}
          {subtitle && <p className="text-white/50 text-xs">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Busca */}
        <button
          onClick={handleSearch}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/8 rounded-lg text-white/30 text-xs hover:text-white/60 hover:border-white/15 transition-all"
          title="Buscar aulas (Ctrl+K)"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>search</span>
          <span className="hidden md:inline">Buscar...</span>
          <kbd className="hidden md:block text-[10px] border border-white/10 rounded px-1 py-0.5 font-mono">Ctrl K</kbd>
        </button>

        {/* XP Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#1e293b] border border-white/5 rounded-lg">
          <div className="flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[#8b5cf6]" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 1" }}>bolt</span>
              <span className="text-[#8b5cf6] text-xs font-bold">Nível {nivel}</span>
              {streak > 1 && <span className="text-amber-400 text-[10px] font-bold ml-1">🔥 {streak}</span>}
            </div>
            <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8b5cf6] rounded-full transition-all duration-500"
                style={{ width: `${(xpNoNivelAtual / xpParaProximoNivel) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-white/20 text-[10px]">{xp} XP</span>
        </div>

        {/* Tema */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Notificações */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifs(v => !v); setShowProfile(false); setNotifsRead(true) }}
            className="relative p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>notifications</span>
            {hasUnread && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full ring-2 ring-[#0f172a]" />
            )}
          </button>

          {showNotifs && (
            <div className="dropdown-in absolute right-0 top-full mt-2 w-80 bg-[#1e293b] border border-white/8 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <span className="text-white text-xs font-bold uppercase tracking-widest">Notificações</span>
                <span className="text-[10px] text-white/30">{notifications.length} item{notifications.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map(n => (
                  <button
                    key={n.id}
                    onClick={() => { n.action?.(); setShowNotifs(false) }}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/3 last:border-0"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${n.color}18`, border: `1px solid ${n.color}30` }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: '16px', color: n.color, fontVariationSettings: "'FILL' 1" }}
                      >{n.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold leading-tight">{n.title}</p>
                      <p className="text-white/40 text-[11px] mt-0.5 leading-relaxed">{n.desc}</p>
                    </div>
                    {n.action && (
                      <span className="material-symbols-outlined text-white/20 shrink-0 mt-1" style={{ fontSize: '14px' }}>chevron_right</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-white/5">
                <p className="text-[10px] text-white/20 text-center">Notificações baseadas no seu progresso</p>
              </div>
            </div>
          )}
        </div>

        {/* Avatar + dropdown de perfil */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setShowProfile(v => !v); setShowNotifs(false) }}
            className="w-8 h-8 rounded-full border border-white/10 overflow-hidden hover:border-[#8b5cf6]/50 transition-all"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#8b5cf6]/30 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
            )}
          </button>

          {showProfile && (
            <div className="dropdown-in absolute right-0 top-full mt-2 w-64 bg-[#1e293b] border border-white/8 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
              {/* Cabeçalho do perfil */}
              <div className="px-4 py-4 border-b border-white/5" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), transparent)' }}>
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full border border-[#8b5cf6]/30 overflow-hidden bg-[#8b5cf6]/40 flex items-center justify-center text-white text-sm font-bold">
                      {user?.avatar_url
                        ? <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        : initials}
                    </div>
                    <button
                      onClick={() => { setShowProfile(false); setShowAvatarUpload(true) }}
                      className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#8b5cf6] rounded-full flex items-center justify-center hover:bg-[#7c3aed] transition-colors"
                      title="Alterar foto"
                    >
                      <span className="material-symbols-outlined text-white" style={{ fontSize: '9px' }}>photo_camera</span>
                    </button>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{user?.nome}</p>
                    <p className="text-white/40 text-[11px] truncate">{user?.email}</p>
                  </div>
                </div>

                {/* XP + nível */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#8b5cf6]" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>bolt</span>
                    <span className="text-[#8b5cf6] text-xs font-bold">Nível {nivel}</span>
                    {streak > 1 && <span className="text-amber-400 text-xs font-bold">🔥 {streak}</span>}
                  </div>
                  <span className="text-white/30 text-[11px]">{xp} XP total</span>
                </div>
                <div className="mt-1.5 w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#8b5cf6] rounded-full transition-all duration-700"
                    style={{ width: `${(xpNoNivelAtual / xpParaProximoNivel) * 100}%` }}
                  />
                </div>
                <p className="text-white/20 text-[10px] mt-1">{xpNoNivelAtual}/{xpParaProximoNivel} XP para nível {nivel + 1}</p>
              </div>

              {/* Badges */}
              {badges.length > 0 && (
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">Conquistas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {badges.map(b => {
                      const info = BADGE_LABELS[b]
                      return info ? (
                        <span
                          key={b}
                          title={info.label}
                          className="text-[11px] px-2 py-0.5 bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 rounded-full text-[#a78bfa]"
                        >
                          {info.icon} {info.label}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="p-2">
                <button
                  onClick={() => { setShowProfile(false); setShowAvatarUpload(true) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all text-xs"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>photo_camera</span>
                  Alterar foto de perfil
                </button>
                <button
                  onClick={() => { navigate('/dashboard'); setShowProfile(false) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all text-xs"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>dashboard</span>
                  Meu Painel
                </button>
                <button
                  onClick={async () => { setShowProfile(false); await logout() }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-all text-xs"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
                  Sair da conta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>

    {showAvatarUpload && <AvatarUpload onClose={() => setShowAvatarUpload(false)} />}
    </>
  )
}
