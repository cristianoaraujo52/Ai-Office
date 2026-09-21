import React, { useEffect, useMemo, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import { mockUsers } from '../../lib/mockData'
import { createSupabaseAuthClient, isSupabaseConfigured, supabase } from '../../lib/supabase'
import { formatSupabaseAuthError, getSupabaseAuthCooldownSeconds } from '../../lib/supabaseAuthErrors'
import type { Progresso, User } from '../../types'

const DELETED_OFFLINE_USERS_KEY = 'ia_academy_deleted_mock_users'

function initials(nome: string) {
  return nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function getOfflineDeletedIds() {
  try {
    return JSON.parse(localStorage.getItem(DELETED_OFFLINE_USERS_KEY) ?? '[]') as string[]
  } catch {
    localStorage.removeItem(DELETED_OFFLINE_USERS_KEY)
    return []
  }
}

export default function AdminUsuarios() {
  const { user } = useAuth()
  const { modulos } = useData()
  const [users, setUsers] = useState<User[]>([])
  const [progressos, setProgressos] = useState<Progresso[]>([])
  const [loginHistory, setLoginHistory] = useState<Array<{ user_id: string; logged_at: string }>>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [authCooldownSeconds, setAuthCooldownSeconds] = useState(0)
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senhaTemporaria: '',
    role: 'aluno' as 'admin' | 'aluno',
  })

  const isOffline = !isSupabaseConfigured

  useEffect(() => {
    if (authCooldownSeconds <= 0) return
    const timer = window.setTimeout(() => {
      setAuthCooldownSeconds(seconds => Math.max(0, seconds - 1))
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [authCooldownSeconds])

  const loadUsers = async () => {
    setLoading(true)
    setError(null)

    if (isOffline) {
      const deletedIds = getOfflineDeletedIds()
      setUsers(mockUsers.filter(u => !deletedIds.includes(u.id)))
      setProgressos([])
      setLoginHistory([])
      setLoading(false)
      return
    }

    const [profilesResult, progressResult, loginResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, email, nome, role, avatar_url, created_at')
        .order('created_at', { ascending: false }),
      supabase.from('progressos').select('*'),
      supabase
        .from('login_history')
        .select('user_id, logged_at')
        .order('logged_at', { ascending: false }),
    ])

    const loadError = profilesResult.error ?? progressResult.error ?? loginResult.error
    if (loadError) {
      setError(`Não foi possível carregar o acompanhamento dos usuários: ${loadError.message}`)
      setUsers([])
      setProgressos([])
      setLoginHistory([])
    } else {
      setUsers((profilesResult.data ?? []) as User[])
      setProgressos((progressResult.data ?? []) as Progresso[])
      setLoginHistory(loginResult.data ?? [])
    }

    setLoading(false)
  }

  useEffect(() => { void loadUsers() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return users
    return users.filter(u =>
      u.nome.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term),
    )
  }, [search, users])

  const alunos = users.filter(u => u.role === 'aluno').length
  const admins = users.filter(u => u.role === 'admin').length
  const totalAulas = modulos.flatMap(modulo => modulo.aulas ?? []).length

  const trackingByUser = useMemo(() => {
    const map = new Map<string, {
      concluidas: number
      percent: number
      quizzes: number
      notaMedia: number | null
      ultimoAcesso: string | null
    }>()

    users.forEach(currentUser => {
      const userProgress = progressos.filter(progresso => progresso.user_id === currentUser.id)
      const concluidas = userProgress.filter(progresso => progresso.concluida).length
      const notas = userProgress
        .map(progresso => progresso.quiz_nota)
        .filter((nota): nota is number => typeof nota === 'number')

      map.set(currentUser.id, {
        concluidas,
        percent: totalAulas > 0 ? Math.round((concluidas / totalAulas) * 100) : 0,
        quizzes: userProgress.filter(progresso => progresso.quiz_realizado).length,
        notaMedia: notas.length ? notas.reduce((sum, nota) => sum + nota, 0) / notas.length : null,
        ultimoAcesso: loginHistory.find(login => login.user_id === currentUser.id)?.logged_at ?? null,
      })
    })

    return map
  }, [loginHistory, progressos, totalAulas, users])

  const save = async () => {
    if (saving) return
    if (authCooldownSeconds > 0) {
      setError(`Aguarde ${authCooldownSeconds} segundos antes de tentar cadastrar novamente.`)
      return
    }

    if (!form.nome.trim() || !form.email.trim()) {
      setError('Preencha nome e e-mail antes de salvar.')
      return
    }

    if (!isOffline) {
      if (form.senhaTemporaria.length < 6) {
        setError('A senha temporária precisa ter pelo menos 6 caracteres.')
        return
      }

      setError(null)
      setSaving(true)
      const authClient = createSupabaseAuthClient()
      const { data, error: signUpError } = await authClient.auth.signUp({
        email: form.email.trim(),
        password: form.senhaTemporaria,
        options: {
          data: {
            nome: form.nome.trim(),
            role: form.role,
          },
        },
      })

      if (signUpError) {
        const cooldownSeconds = getSupabaseAuthCooldownSeconds(signUpError.message)
        if (cooldownSeconds !== null) setAuthCooldownSeconds(cooldownSeconds)
        setError(formatSupabaseAuthError(signUpError.message))
        setSaving(false)
        return
      }

      const createdUserId = data.user?.id
      if (createdUserId) {
        // O trigger handle_new_user cria primeiro; esta RPC garante o perfil de forma idempotente.
        const { error: profileError } = await supabase.rpc('admin_ensure_profile', {
          target_id: createdUserId,
          target_email: form.email.trim(),
          target_nome: form.nome.trim(),
          target_role: form.role,
        })
        if (profileError) {
          setError(`Login criado, mas não foi possível garantir o perfil do aluno: ${profileError.message}`)
          setSaving(false)
          return
        }
      }

      await loadUsers()
      setShowModal(false)
      setForm({ nome: '', email: '', senhaTemporaria: '', role: 'aluno' })
      setSaving(false)
      return
    }

    const novo: User = {
      id: String(Date.now()),
      nome: form.nome.trim(),
      email: form.email.trim(),
      role: form.role,
      created_at: new Date().toISOString(),
    }
    setUsers(prev => [...prev, novo])
    setShowModal(false)
    setForm({ nome: '', email: '', senhaTemporaria: '', role: 'aluno' })
  }

  const del = async (id: string) => {
    const target = users.find(u => u.id === id)
    if (!target) return
    if (target.id === user?.id) {
      setError('Você não pode excluir o próprio usuário administrador enquanto está logado.')
      return
    }
    if (!confirm(`Excluir o usuário ${target.nome}? Esta ação remove também o progresso vinculado ao perfil.`)) return

    if (isOffline) {
      const deletedIds = Array.from(new Set([...getOfflineDeletedIds(), id]))
      localStorage.setItem(DELETED_OFFLINE_USERS_KEY, JSON.stringify(deletedIds))
      setUsers(prev => prev.filter(u => u.id !== id))
      return
    }

    setError(null)
    const { error: err } = await supabase.from('profiles').delete().eq('id', id)
    if (err) {
      setError(`Não foi possível excluir o usuário: ${err.message}`)
      return
    }
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar isAdmin />
      <div className="flex-1 ml-0 md:ml-[280px] flex flex-col">
        <TopBar
          title="Gerenciar Usuários"
          subtitle={isOffline ? 'Modo offline: alterações salvas neste navegador' : 'Perfis reais carregados do Supabase'}
        />
        <main className="flex-1 p-8 fade-in space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: 'group', label: 'Usuários', value: users.length },
              { icon: 'school', label: 'Alunos', value: alunos },
              { icon: 'admin_panel_settings', label: 'Administradores', value: admins },
            ].map(card => (
              <div key={card.label} className="bg-[#1e293b] border border-white/5 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#8b5cf6]" style={{ fontSize: '20px' }}>{card.icon}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                  <p className="text-white/40 text-xs">{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30" style={{ fontSize: '18px' }}>search</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar usuário..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#1e293b] border border-[#334155] rounded-lg text-white text-sm focus:outline-none focus:border-[#8b5cf6] placeholder-white/20 transition-colors"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/30 text-sm">{filtered.length} usuários</span>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#8b5cf6] text-white rounded-lg text-sm font-medium hover:bg-[#7c3aed] transition-all"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person_add</span>
                Novo Usuário
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="bg-[#1e293b] border border-white/5 rounded-xl overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/5">
                  {['Usuário', 'E-mail', 'Perfil', 'Último acesso', 'Progresso', 'Quizzes', 'Nota média', 'Cadastro', 'Ações'].map(h => (
                    <th key={h} className="py-3 px-5 text-white/30 text-xs uppercase tracking-wider font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {loading && (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-white/30 text-sm">Carregando usuários...</td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-white/30 text-sm">Nenhum usuário encontrado.</td>
                  </tr>
                )}
                {!loading && filtered.map(u => {
                  const tracking = trackingByUser.get(u.id)
                  return (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {initials(u.nome)}
                        </div>
                        <span className="text-white text-sm font-medium">{u.nome}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-white/50 text-sm">{u.email}</td>
                    <td className="py-4 px-5">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-400' : 'bg-[#8b5cf6]/10 text-[#8b5cf6]'}`}>
                        {u.role === 'admin' ? 'Administrador' : 'Aluno'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-white/40 text-xs whitespace-nowrap">
                      {tracking?.ultimoAcesso
                        ? new Date(tracking.ultimoAcesso).toLocaleString('pt-BR')
                        : 'Nunca entrou'}
                    </td>
                    <td className="py-4 px-5">
                      <div className="min-w-28">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-white/50">{tracking?.concluidas ?? 0}/{totalAulas}</span>
                          <span className="text-[#8b5cf6] font-bold">{tracking?.percent ?? 0}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full bg-[#8b5cf6]" style={{ width: `${tracking?.percent ?? 0}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-white/50 text-sm">{tracking?.quizzes ?? 0}</td>
                    <td className="py-4 px-5 text-white/50 text-sm">
                      {tracking?.notaMedia == null ? '—' : tracking.notaMedia.toFixed(1)}
                    </td>
                    <td className="py-4 px-5 text-white/30 text-xs">
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-4 px-5">
                      <button
                        onClick={() => void del(u.id)}
                        disabled={u.id === user?.id}
                        className="p-1.5 text-red-400/40 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title={u.id === user?.id ? 'Você está usando este usuário' : 'Excluir usuário'}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                      </button>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Novo Usuário</h3>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Nome completo', key: 'nome', type: 'text', placeholder: 'João Silva' },
                { label: 'E-mail', key: 'email', type: 'email', placeholder: 'joao@empresa.com' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-white/50 text-xs mb-1.5">{f.label}</label>
                  <input
                    type={f.type}
                    value={(form as any)[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
                    placeholder={f.placeholder}
                  />
                </div>
              ))}
              {!isOffline && (
                <div>
                  <label className="block text-white/50 text-xs mb-1.5">Senha temporária</label>
                  <input
                    type="password"
                    value={form.senhaTemporaria}
                    onChange={e => setForm(p => ({ ...p, senhaTemporaria: e.target.value }))}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              )}
              <div>
                <label className="block text-white/50 text-xs mb-1.5">Perfil</label>
                <select
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value as 'admin' | 'aluno' }))}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
                >
                  <option value="aluno">Aluno</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-[#334155] rounded-lg text-white/50 text-sm hover:text-white transition-all">Cancelar</button>
              <button
                onClick={() => void save()}
                disabled={saving || authCooldownSeconds > 0}
                className="flex-1 py-2 bg-[#8b5cf6] text-white rounded-lg text-sm font-medium hover:bg-[#7c3aed] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Salvando...' : authCooldownSeconds > 0 ? `Aguarde ${authCooldownSeconds}s` : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
