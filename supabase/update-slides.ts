/**
 * IA Office Academy — Atualização de Slides
 * Sincroniza SOMENTE a tabela `slides` com o conteúdo do mockData
 * (incluindo os slides oficiais extraídos das apresentações em public/covers).
 *
 * Mais rápido que o seed completo — use quando alterar apenas slides.
 * Não toca em módulos, aulas, quizzes, usuários nem progresso.
 *
 * Executar:  npm run db:slides
 */

import { createClient } from '@supabase/supabase-js'
import { mockModulos } from '../src/lib/mockData'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
  console.error('❌  Configure VITE_SUPABASE_URL no .env.local'); process.exit(1)
}
if (!serviceRoleKey || serviceRoleKey === 'YOUR_SERVICE_ROLE_KEY') {
  console.error('❌  Configure SUPABASE_SERVICE_ROLE_KEY no .env.local'); process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  console.log('\n🖼️  IA Office Academy — Atualização de Slides\n')

  // Substituição completa: remove todos os slides e insere a versão atual.
  // Os ids dos slides são regenerados a cada versão do mockData, então o
  // delete evita duplicados de versões antigas.
  const { error: delErr } = await supabase.from('slides').delete().neq('id', '')
  if (delErr) throw new Error(`[slides:cleanup] ${delErr.message}`)

  let total = 0
  for (const modulo of mockModulos) {
    let countModulo = 0
    for (const aula of modulo.aulas ?? []) {
      if (!aula.slides?.length) continue
      const { error } = await supabase.from('slides').insert(
        aula.slides.map(s => ({
          id: s.id, aula_id: s.aula_id, titulo: s.titulo,
          texto: s.texto, imagem_url: s.imagem_url ?? null, ordem: s.ordem,
        })),
      )
      if (error) throw new Error(`[slides:${aula.id}] ${error.message}`)
      countModulo += aula.slides.length
    }
    total += countModulo
    console.log(`  ✅ ${modulo.titulo} — ${countModulo} slides`)
  }

  console.log(`\n✅ ${total} slides sincronizados com sucesso!\n`)
}

main().catch(e => {
  console.error('\n❌ Erro na atualização de slides:', e.message)
  process.exit(1)
})
