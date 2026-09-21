import assert from 'node:assert/strict'
import {
  formatSupabaseAuthError,
  getSupabaseAuthCooldownSeconds,
} from '../src/lib/supabaseAuthErrors'

assert.equal(
  getSupabaseAuthCooldownSeconds('For security purposes, you can only request this after 54 seconds.'),
  54,
)

assert.equal(
  getSupabaseAuthCooldownSeconds('User already registered'),
  null,
)

assert.equal(
  formatSupabaseAuthError('For security purposes, you can only request this after 54 seconds.'),
  'O Supabase bloqueou novas tentativas por segurança. Aguarde 54 segundos e tente salvar novamente.',
)

assert.equal(
  formatSupabaseAuthError('User already registered'),
  'Este e-mail já está cadastrado. Use outro e-mail ou recupere o acesso desse aluno.',
)
