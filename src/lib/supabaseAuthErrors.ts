export function getSupabaseAuthCooldownSeconds(message: string) {
  const match = message.match(/after\s+(\d+)\s+seconds?/i)
  if (!match) return null
  return Number(match[1])
}

export function formatSupabaseAuthError(message: string) {
  const cooldownSeconds = getSupabaseAuthCooldownSeconds(message)
  if (cooldownSeconds !== null) {
    return `O Supabase bloqueou novas tentativas por segurança. Aguarde ${cooldownSeconds} segundos e tente salvar novamente.`
  }

  if (/already registered|already exists|user.*exists/i.test(message)) {
    return 'Este e-mail já está cadastrado. Use outro e-mail ou recupere o acesso desse aluno.'
  }

  return `Não foi possível criar o login: ${message}`
}
