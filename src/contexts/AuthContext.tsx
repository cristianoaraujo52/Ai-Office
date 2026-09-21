import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '../types'
import { mockUsers } from '../lib/mockData'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { loadOrEnsureProfile, recordLoginOnce } from '../lib/authPersistence'

export interface RegisterResult {
  error?: string
  /** true quando o Supabase exige confirmar o e-mail antes do primeiro login */
  needsConfirmation?: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  register: (nome: string, email: string, password: string) => Promise<RegisterResult>
  logout: () => Promise<void>
  updateAvatar: (file: File) => Promise<{ error?: string }>
  updateNome: (nome: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      try {
        const stored = localStorage.getItem('ia_academy_user')
        if (stored) setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('ia_academy_user')
      }
      setLoading(false)
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null)
          setLoading(false)
          return
        }

        try {
          const profile = await loadOrEnsureProfile(session.user)
          setUser(profile)
          if (event === 'SIGNED_IN') {
            await recordLoginOnce(session.user.id).catch(error => {
              console.warn('[Auth] Não foi possível registrar o login:', error.message)
            })
          }
        } catch (profileError: any) {
          console.warn('[Auth] Erro ao carregar ou criar perfil:', profileError.message)
          setUser(null)
          await supabase.auth.signOut()
        }

        setLoading(false)
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured) {
      const found = mockUsers.find(u => u.email === email)
      if (!found) return { error: 'Usuário não encontrado.' }
      if (password !== 'senha123') return { error: 'Senha incorreta.' }
      setUser(found)
      localStorage.setItem('ia_academy_user', JSON.stringify(found))
      return {}
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }

    if (authData.user) {
      try {
        const profile = await loadOrEnsureProfile(authData.user)
        setUser(profile)
        await recordLoginOnce(authData.user.id).catch(recordError => {
          console.warn('[Auth] Não foi possível registrar o login:', recordError.message)
        })
      } catch (profileError: any) {
        return { error: `Erro ao carregar perfil: ${profileError.message}` }
      }
    }

    return {}
  }

  /**
   * Cadastro aberto de alunos. O papel é sempre 'aluno': o banco ignora qualquer
   * role enviado nos metadados (supabase/seguranca-cadastro-aberto.sql).
   * Com sessão imediata, o onAuthStateChange carrega o perfil e o Login redireciona.
   */
  const register = async (nome: string, email: string, password: string): Promise<RegisterResult> => {
    if (!isSupabaseConfigured) {
      return { error: 'O cadastro só está disponível com o banco de dados conectado.' }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })
    if (error) return { error: error.message }

    // Com confirmação de e-mail ligada, o Supabase não revela se o e-mail já existe:
    // devolve um usuário sem identidades.
    if (data.user && data.user.identities?.length === 0) {
      return { error: 'Este e-mail já está cadastrado. Use "Entrar" ou "Esqueci a senha".' }
    }

    return data.session ? {} : { needsConfirmation: true }
  }

  const updateAvatar = async (file: File): Promise<{ error?: string }> => {
    if (!user) return { error: 'Usuário não autenticado.' }

    if (!isSupabaseConfigured) {
      return new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = () => {
          const url = reader.result as string
          const updated = { ...user, avatar_url: url }
          setUser(updated)
          localStorage.setItem('ia_academy_user', JSON.stringify(updated))
          resolve({})
        }
        reader.onerror = () => resolve({ error: 'Erro ao ler o arquivo.' })
        reader.readAsDataURL(file)
      })
    }

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/avatar.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (uploadErr) return { error: uploadErr.message }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    const avatar_url = `${urlData.publicUrl}?t=${Date.now()}`

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ avatar_url })
      .eq('id', user.id)
    if (updateErr) return { error: updateErr.message }

    setUser({ ...user, avatar_url })
    return {}
  }

  /** O aluno corrige o próprio nome (usado no certificado). O papel não muda. */
  const updateNome = async (nome: string): Promise<{ error?: string }> => {
    if (!user) return { error: 'Usuário não autenticado.' }
    const clean = nome.replace(/\s+/g, ' ').trim().slice(0, 80)
    if (clean.length < 2) return { error: 'Informe seu nome completo.' }

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('profiles').update({ nome: clean }).eq('id', user.id)
      if (error) return { error: error.message }
    }

    const updated = { ...user, nome: clean }
    setUser(updated)
    if (!isSupabaseConfigured) localStorage.setItem('ia_academy_user', JSON.stringify(updated))
    return {}
  }

  const logout = async () => {
    if (!isSupabaseConfigured) {
      setUser(null)
      localStorage.removeItem('ia_academy_user')
      return
    }
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateAvatar, updateNome }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
