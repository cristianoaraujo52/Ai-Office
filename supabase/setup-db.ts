/**
 * setup-db.ts — cria tabelas + usuários direto no Postgres
 * Roda com: npx tsx supabase/setup-db.ts
 */
import pg from 'pg'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const __dirname = dirname(fileURLToPath(import.meta.url))

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ref         = supabaseUrl.replace('https://', '').replace('.supabase.co', '')

// Senha do Postgres (Supabase > Project Settings > Database). Fica só no .env.local.
if (!process.env.SUPABASE_DB_PASSWORD) {
  console.error('Configure SUPABASE_DB_PASSWORD no .env.local'); process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Conexão direta com Postgres
const pool = new pg.Pool({
  host:     `db.${ref}.supabase.co`,
  port:     5432,
  database: 'postgres',
  user:     'postgres',
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl:      { rejectUnauthorized: false },
})

async function main() {
  console.log('📡 Conectando ao banco de dados...')
  const client = await pool.connect()
  console.log('✅ Conectado!\n')

  // Lê e executa o schema.sql
  console.log('🏗️  Criando tabelas...')
  const schema = readFileSync(resolve(__dirname, 'schema.sql'), 'utf-8')
  const persistenceFix = readFileSync(
    resolve(__dirname, 'fix-student-persistence.sql'),
    'utf-8',
  )
  try {
    await client.query(schema)
    await client.query(persistenceFix)
    console.log('✅ Tabelas criadas com sucesso!\n')
  } catch (err: any) {
    console.error('❌ Erro no schema:', err.message)
    client.release()
    await pool.end()
    process.exit(1)
  }

  client.release()
  await pool.end()

  // Cria/garante usuários via Admin API
  console.log('👤 Criando usuários...')
  const { data: listData } = await supabase.auth.admin.listUsers()
  const users = listData?.users ?? []

  // Admin
  let adminId: string
  const existingAdmin = users.find(u => u.email === 'admin@iaoffice.com')
  if (existingAdmin) {
    adminId = existingAdmin.id
    console.log('  ℹ️  Admin já existe:', adminId)
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@iaoffice.com',
      password: 'senha123',
      email_confirm: true,
      user_metadata: { nome: 'Admin Academy' },
    })
    if (error) { console.error('  ❌ Admin:', error.message); process.exit(1) }
    adminId = data.user!.id
    console.log('  ✅ Admin criado:', adminId)
  }

  // Aluno
  let alunoId: string
  const existingAluno = users.find(u => u.email === 'aluno@iaoffice.com')
  if (existingAluno) {
    alunoId = existingAluno.id
    console.log('  ℹ️  Aluno já existe:', alunoId)
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'aluno@iaoffice.com',
      password: 'senha123',
      email_confirm: true,
      user_metadata: { nome: 'João Silva' },
    })
    if (error) { console.error('  ❌ Aluno:', error.message); process.exit(1) }
    alunoId = data.user!.id
    console.log('  ✅ Aluno criado:', alunoId)
  }

  // Garante perfis com roles corretos
  console.log('\n📋 Configurando perfis...')
  await supabase.from('profiles').upsert({ id: adminId, email: 'admin@iaoffice.com', nome: 'Admin Academy', role: 'admin' })
  await supabase.from('profiles').upsert({ id: alunoId, email: 'aluno@iaoffice.com', nome: 'João Silva',    role: 'aluno' })
  console.log('  ✅ Perfis configurados!')

  console.log('\n🎉 Setup completo! Agora rode: npx tsx supabase/seed.ts')
}

main().catch(e => { console.error(e); process.exit(1) })
