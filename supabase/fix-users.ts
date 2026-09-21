import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function criarUsuario(email: string, nome: string, role: string) {
  console.log(`\n── ${email} ──`)

  // Tenta criar
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: 'senha123',
    email_confirm: true,
    user_metadata: { nome, role },
  })

  let userId: string

  if (error) {
    console.log(`  ⚠️  Criação: ${error.message}`)
    // Busca existente
    const { data: list } = await supabase.auth.admin.listUsers()
    const found = list?.users?.find(u => u.email === email)
    if (!found) { console.log('  ❌ Não encontrado'); return }
    userId = found.id
    console.log(`  ℹ️  Já existe: ${userId}`)
  } else {
    userId = data.user!.id
    console.log(`  ✅ Criado: ${userId}`)
  }

  // Perfil
  console.log(`  📋 Inserindo perfil...`)
  const { error: pErr } = await supabase
    .from('profiles')
    .upsert({ id: userId, email, nome, role }, { onConflict: 'id' })

  if (pErr) console.log(`  ❌ Perfil: ${pErr.message}`)
  else console.log(`  ✅ Perfil OK (role=${role})`)
}

async function main() {
  console.log('🚀 Criando usuários e perfis...')
  await criarUsuario('admin@iaoffice.com', 'Admin Academy', 'admin')
  await criarUsuario('aluno@iaoffice.com', 'João Silva', 'aluno')
  console.log('\n✅ Concluído!')
}

main().catch(e => { console.error('FATAL:', e); process.exit(1) })
