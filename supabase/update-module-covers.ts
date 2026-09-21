/**
 * IA Office Academy - Atualizacao de Capas dos Modulos
 * Sincroniza SOMENTE o campo `cover_image` da tabela `modulos`.
 *
 * Executar: npm run db:covers
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { mockModulos } from '../src/lib/mockData'

config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
  console.error('Configure VITE_SUPABASE_URL no .env.local')
  process.exit(1)
}

if (!serviceRoleKey || serviceRoleKey === 'YOUR_SERVICE_ROLE_KEY') {
  console.error('Configure SUPABASE_SERVICE_ROLE_KEY no .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  console.log('\nIA Office Academy - Atualizacao de Capas dos Modulos\n')

  for (const modulo of mockModulos) {
    const { error } = await supabase
      .from('modulos')
      .update({ cover_image: modulo.cover_image ?? null })
      .eq('id', modulo.id)

    if (error) throw new Error(`[modulos:${modulo.id}] ${error.message}`)

    console.log(`  ${modulo.id}: ${modulo.cover_image ?? 'sem capa'}`)
  }

  console.log(`\n${mockModulos.length} capas sincronizadas com sucesso.\n`)
}

main().catch(error => {
  console.error('\nErro na atualizacao de capas:', error.message)
  process.exit(1)
})
