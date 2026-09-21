import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const { data: aulas } = await sb.from('aulas').select('id, titulo').limit(3)
const { data: quizzes } = await sb.from('quizzes').select('id, aula_id, titulo').limit(5)

console.log('IDs das aulas:')
aulas?.forEach(a => console.log(`  "${a.id}" → ${a.titulo}`))

console.log('\nIDs dos quizzes (aula_id):')
quizzes?.forEach(q => console.log(`  aula_id="${q.aula_id}" → ${q.titulo}`))

// Verifica se há match
const aulaIds = new Set(aulas?.map(a => a.id))
const matches = quizzes?.filter(q => aulaIds.has(q.aula_id))
console.log(`\nQuizzes que batem com aulas: ${matches?.length} de ${quizzes?.length}`)
