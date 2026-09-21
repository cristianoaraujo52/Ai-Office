/**
 * Gera supabase/seed-conteudo.sql com o mesmo conteúdo que o seed.ts envia
 * (módulos, aulas, slides, materiais, quizzes e perguntas do mockData).
 * Serve para popular o banco colando no SQL Editor, sem precisar da service_role.
 *
 * Executar:  npx tsx supabase/seed-to-sql.ts
 */
import { writeFileSync } from 'fs'
import { mockModulos } from '../src/lib/mockData'

type Value = string | number | boolean | null | undefined | unknown[]

function lit(v: Value): string {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'number') return String(v)
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  if (Array.isArray(v)) return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`
  return `'${String(v).replace(/'/g, "''")}'`
}

function upsert(table: string, rows: Record<string, Value>[]): string {
  if (rows.length === 0) return ''
  const cols = Object.keys(rows[0])
  const values = rows.map((r) => `(${cols.map((c) => lit(r[c])).join(', ')})`).join(',\n  ')
  const updates = cols.filter((c) => c !== 'id').map((c) => `${c} = EXCLUDED.${c}`).join(', ')
  return `INSERT INTO public.${table} (${cols.join(', ')}) VALUES\n  ${values}\nON CONFLICT (id) DO UPDATE SET ${updates};\n\n`
}

// Sem comentários "--" no arquivo gerado: ao colar no SQL Editor eles já se perderam uma vez.
let sql = '\nBEGIN;\n\nDELETE FROM public.slides;\n\n'
let counts = { modulos: 0, aulas: 0, slides: 0, materiais: 0, quizzes: 0, perguntas: 0 }

for (const modulo of mockModulos) {
  sql += upsert('modulos', [{
    id: modulo.id, titulo: modulo.titulo, descricao: modulo.descricao, ordem: modulo.ordem,
    carga_horaria: modulo.carga_horaria, ativo: modulo.ativo,
    cover_image: modulo.cover_image ?? null, created_at: modulo.created_at,
  }])
  counts.modulos++

  for (const aula of modulo.aulas ?? []) {
    sql += upsert('aulas', [{
      id: aula.id, modulo_id: aula.modulo_id, titulo: aula.titulo, descricao: aula.descricao,
      descricao_curta: aula.descricao_curta ?? null, conteudo_html: aula.conteudo_html,
      video_url: aula.video_url, ordem: aula.ordem, duracao_min: aula.duracao_min, ativo: aula.ativo,
      objetivo: aula.objetivo ?? null, passo_a_passo: aula.passo_a_passo ?? [], dicas: aula.dicas ?? [],
      erros_comuns: aula.erros_comuns ?? [], resumo: aula.resumo ?? null, exercicio: aula.exercicio ?? null,
      narracao: aula.narracao ?? null, resumo_audio: aula.resumo_audio ?? null,
      roteiro_video: aula.roteiro_video ?? null, atividade_pratica: aula.atividade_pratica ?? null,
      video_titulo: aula.video_titulo ?? null, video_canal: aula.video_canal ?? null,
      video_duracao: aula.video_duracao ?? null, created_at: aula.created_at,
    }])
    counts.aulas++

    const slides = aula.slides ?? []
    sql += upsert('slides', slides.map((s) => ({
      id: s.id, aula_id: s.aula_id, titulo: s.titulo, texto: s.texto, imagem_url: s.imagem_url ?? null, ordem: s.ordem,
    })))
    counts.slides += slides.length

    const materiais = aula.materiais ?? []
    sql += upsert('materiais', materiais.map((m) => ({ id: m.id, aula_id: m.aula_id, titulo: m.titulo, tipo: m.tipo, url: m.url })))
    counts.materiais += materiais.length

    if (aula.quiz) {
      const q = aula.quiz
      sql += upsert('quizzes', [{ id: q.id, aula_id: q.aula_id, titulo: q.titulo }])
      counts.quizzes++
      const perguntas = q.perguntas ?? []
      sql += upsert('perguntas', perguntas.map((p) => ({
        id: p.id, quiz_id: p.quiz_id, texto: p.texto, opcoes: p.opcoes as unknown[],
        resposta_correta: p.resposta_correta, ordem: p.ordem,
      })))
      counts.perguntas += perguntas.length
    }
  }
}

sql += 'COMMIT;\n\n'
sql += `SELECT (SELECT count(*) FROM public.modulos) AS modulos, (SELECT count(*) FROM public.aulas) AS aulas, (SELECT count(*) FROM public.slides) AS slides, (SELECT count(*) FROM public.quizzes) AS quizzes, (SELECT count(*) FROM public.perguntas) AS perguntas;\n`

writeFileSync('supabase/seed-conteudo.sql', sql, 'utf8')
console.log('seed-conteudo.sql gerado:', counts, `${(Buffer.byteLength(sql) / 1024).toFixed(0)} KB`)
