/**
 * IA Office Academy — Seed Script
 * Popula o banco Supabase com módulos, aulas, slides e quizzes do mockData.
 *
 * Executar:  npm run db:seed
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

// ── helper ────────────────────────────────────────────────────
async function upsert(table: string, data: object | object[]) {
  const rows = Array.isArray(data) ? data : [data]
  if (rows.length === 0) return
  const { error } = await (supabase.from(table) as any).upsert(rows, { onConflict: 'id' })
  if (error) throw new Error(`[${table}] ${error.message}`)
}

// ── seed do curso ─────────────────────────────────────────────
async function seedCourse() {
  console.log('📚 Inserindo módulos, aulas, slides e quizzes...\n')

  // Limpa slides antigos — os ids são regenerados a cada versão do mockData,
  // então sem isso slides removidos/renomeados ficariam duplicados.
  const { error: delErr } = await supabase.from('slides').delete().neq('id', '')
  if (delErr) throw new Error(`[slides:cleanup] ${delErr.message}`)

  for (const modulo of mockModulos) {
    await upsert('modulos', {
      id:            modulo.id,
      titulo:        modulo.titulo,
      descricao:     modulo.descricao,
      ordem:         modulo.ordem,
      carga_horaria: modulo.carga_horaria,
      ativo:         modulo.ativo,
      cover_image:   modulo.cover_image ?? null,
      created_at:    modulo.created_at,
    })

    for (const aula of modulo.aulas ?? []) {
      await upsert('aulas', {
        id:               aula.id,
        modulo_id:        aula.modulo_id,
        titulo:           aula.titulo,
        descricao:        aula.descricao,
        descricao_curta:  aula.descricao_curta  ?? null,
        conteudo_html:    aula.conteudo_html,
        video_url:        aula.video_url,
        ordem:            aula.ordem,
        duracao_min:      aula.duracao_min,
        ativo:            aula.ativo,
        objetivo:         aula.objetivo         ?? null,
        passo_a_passo:    aula.passo_a_passo    ?? [],
        dicas:            aula.dicas            ?? [],
        erros_comuns:     aula.erros_comuns     ?? [],
        resumo:           aula.resumo           ?? null,
        exercicio:        aula.exercicio        ?? null,
        narracao:         aula.narracao         ?? null,
        resumo_audio:     aula.resumo_audio     ?? null,
        roteiro_video:    aula.roteiro_video    ?? null,
        atividade_pratica: aula.atividade_pratica ?? null,
        video_titulo:     aula.video_titulo     ?? null,
        video_canal:      aula.video_canal      ?? null,
        video_duracao:    aula.video_duracao    ?? null,
        created_at:       aula.created_at,
      })

      if (aula.slides?.length) {
        await upsert('slides', aula.slides.map(s => ({
          id: s.id, aula_id: s.aula_id, titulo: s.titulo,
          texto: s.texto, imagem_url: s.imagem_url ?? null, ordem: s.ordem,
        })))
      }

      if (aula.materiais?.length) {
        await upsert('materiais', aula.materiais.map(m => ({
          id: m.id, aula_id: m.aula_id, titulo: m.titulo, tipo: m.tipo, url: m.url,
        })))
      }

      if (aula.quiz) {
        const q = aula.quiz
        await upsert('quizzes', { id: q.id, aula_id: q.aula_id, titulo: q.titulo })
        if (q.perguntas?.length) {
          await upsert('perguntas', q.perguntas.map(p => ({
            id: p.id, quiz_id: p.quiz_id, texto: p.texto,
            opcoes: p.opcoes, resposta_correta: p.resposta_correta, ordem: p.ordem,
          })))
        }
      }
    }

    console.log(`  ✅ ${modulo.titulo}`)
  }
}

// ── main ──────────────────────────────────────────────────────
async function main() {
  console.log('\n🌱 IA Office Academy — Seed\n')
  await seedCourse()
  console.log('\n✅ Banco populado com sucesso!')
  console.log('\n👤 Agora crie suas contas em:')
  console.log('   Supabase → Authentication → Users → Add user')
  console.log('   admin@iaoffice.com  /  senha123  (role: admin)')
  console.log('   aluno@iaoffice.com  /  senha123  (role: aluno)\n')
}

main().catch(e => {
  console.error('\n❌ Erro no seed:', e.message)
  process.exit(1)
})
