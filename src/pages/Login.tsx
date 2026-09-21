import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login, register, user } = useAuth()
  const [mode, setMode] = useState<'entrar' | 'cadastro'>('entrar')
  const [nome, setNome] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [info, setInfo] = useState('')
  const isCadastro = mode === 'cadastro'
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redireciona quando o usuário é definido (modo Supabase: via onAuthStateChange)
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    }
  }, [user, navigate])

  const switchMode = (next: 'entrar' | 'cadastro') => {
    setMode(next)
    setError('')
    setInfo('')
    setPassword('')
    setConfirmPassword('')
  }

  const handleCadastro = async () => {
    if (nome.trim().length < 2) { setError('Informe seu nome completo.'); return }
    if (password.length < 6) { setError('A senha precisa ter pelo menos 6 caracteres.'); return }
    if (password !== confirmPassword) { setError('As senhas não conferem.'); return }

    setLoading(true)
    const result = await register(nome.trim(), email.trim(), password)
    setLoading(false)
    if (result.error) { setError(result.error); return }
    if (result.needsConfirmation) {
      switchMode('entrar')
      setInfo(`Conta criada! Enviamos um link de confirmação para ${email.trim()}. Confirme o e-mail e depois entre com sua senha.`)
    }
    // Sem confirmação de e-mail: o login é automático e o useEffect acima redireciona.
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')
    if (isCadastro) { await handleCadastro(); return }
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.error) { setError(result.error); return }
    // Modo offline: redireciona via localStorage
    const stored = localStorage.getItem('ia_academy_user')
    if (stored) {
      const u = JSON.parse(stored)
      navigate(u.role === 'admin' ? '/admin' : '/dashboard')
    }
    // Modo Supabase: redirecionamento feito pelo useEffect acima
  }

  // Só a conta de demonstração de aluno fica exposta; o acesso de admin é restrito.
  const quickLoginAluno = () => {
    setEmail('aluno@iaoffice.com')
    setPassword('senha123')
  }

  return (
    <div className="min-h-screen flex items-center justify-center tech-pattern p-4">
      <div className="w-full max-w-md bg-[#1e293b]/80 backdrop-blur-sm rounded-2xl border border-[#334155] p-8 shadow-2xl relative overflow-hidden fade-in">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8b5cf6] to-[#131b2e]" />

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-[#8b5cf6] flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-white" style={{ fontSize: '28px' }}>school</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-1">
            IA Office <span className="text-[#8b5cf6]">Academy</span>
          </h1>
          <p className="text-white/50 text-sm">Curso de IA para o Ambiente Corporativo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isCadastro && (
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5" htmlFor="nome">Nome completo</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30" style={{ fontSize: '18px' }}>badge</span>
                <input
                  id="nome" type="text" required autoComplete="name" maxLength={80}
                  value={nome} onChange={e => setNome(e.target.value)}
                  placeholder="Como deve aparecer no certificado"
                  className="w-full pl-10 pr-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-colors"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5" htmlFor="email">E-mail</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30" style={{ fontSize: '18px' }}>mail</span>
              <input
                id="email" type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-10 pr-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-medium text-white/70" htmlFor="password">Senha</label>
              {!isCadastro && (
                <a href="#" className="text-xs text-[#8b5cf6] hover:text-[#a78bfa] transition-colors">Esqueci a senha</a>
              )}
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30" style={{ fontSize: '18px' }}>lock</span>
              <input
                id="password" type={showPwd ? 'text' : 'password'} required
                autoComplete={isCadastro ? 'new-password' : 'current-password'}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-colors"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{showPwd ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>

          {isCadastro && (
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5" htmlFor="confirm-password">Confirmar senha</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30" style={{ fontSize: '18px' }}>lock_reset</span>
                <input
                  id="confirm-password" type={showPwd ? 'text' : 'password'} required autoComplete="new-password"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  className="w-full pl-10 pr-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-colors"
                />
              </div>
              <p className="text-white/30 text-xs mt-1.5">Mínimo de 6 caracteres.</p>
            </div>
          )}

          {info && (
            <div className="flex items-start gap-2 text-emerald-300 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2" role="status">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>mark_email_read</span>
              {info}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#8b5cf6] text-white font-semibold text-sm rounded-lg hover:bg-[#7c3aed] transition-colors shadow-lg shadow-[#8b5cf6]/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>progress_activity</span>
                {isCadastro ? 'Criando conta...' : 'Entrando...'}
              </>
            ) : (
              <>
                {isCadastro ? 'Criar conta' : 'Entrar'}
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{isCadastro ? 'person_add' : 'arrow_forward'}</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-white/50 text-sm mt-5">
          {isCadastro ? 'Já tem conta?' : 'Ainda não tem conta?'}{' '}
          <button
            type="button"
            onClick={() => switchMode(isCadastro ? 'entrar' : 'cadastro')}
            className="text-[#8b5cf6] hover:text-[#a78bfa] font-medium transition-colors"
          >
            {isCadastro ? 'Entrar' : 'Criar conta'}
          </button>
        </p>

        {/* Quick access */}
        {!isCadastro && (
        <div className="mt-8 pt-6 border-t border-[#334155]">
          <p className="text-center text-white/30 text-xs mb-3">Acesso rápido para demonstração</p>
          <button
            type="button"
            onClick={quickLoginAluno}
            className="w-full py-2 px-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white/60 text-xs hover:text-white hover:border-[#8b5cf6]/50 transition-all flex items-center gap-2 justify-center"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>person</span>
            Entrar como aluno de demonstração
          </button>
          <p className="text-center text-white/20 text-xs mt-3">Conta compartilhada só para conhecer o curso. Para salvar seu progresso, crie sua conta.</p>
        </div>
        )}
      </div>
    </div>
  )
}
