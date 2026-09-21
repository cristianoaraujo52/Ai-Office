import type { User as AuthUser } from '@supabase/supabase-js'
import type { User } from '../types'
import { supabase } from './supabase'

const PROFILE_COLUMNS = 'id, nome, email, role, avatar_url, created_at'
const LOGIN_DEDUP_MS = 30_000
const loginRequestsInFlight = new Set<string>()

export async function loadOrEnsureProfile(authUser: AuthUser): Promise<User> {
  const firstAttempt = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', authUser.id)
    .maybeSingle()

  if (firstAttempt.error) throw firstAttempt.error
  if (firstAttempt.data) return firstAttempt.data as User

  const { error: ensureError } = await supabase.rpc('ensure_my_profile')
  if (ensureError) throw ensureError

  const secondAttempt = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', authUser.id)
    .single()

  if (secondAttempt.error) throw secondAttempt.error
  return secondAttempt.data as User
}

export async function recordLoginOnce(userId: string) {
  const key = `ia_academy_login_recorded_${userId}`
  const previous = Number(sessionStorage.getItem(key) ?? 0)
  const now = Date.now()
  if (
    now - previous < LOGIN_DEDUP_MS ||
    loginRequestsInFlight.has(userId)
  ) return

  loginRequestsInFlight.add(userId)
  try {
    const { error } = await supabase
      .from('login_history')
      .insert({ user_id: userId })

    if (error) throw error
    sessionStorage.setItem(key, String(now))
  } finally {
    loginRequestsInFlight.delete(userId)
  }
}
