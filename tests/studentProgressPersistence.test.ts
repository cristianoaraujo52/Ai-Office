import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync('src/contexts/DataContext.tsx', 'utf8')

assert.ok(
  source.includes("upsert(supabasePayload, { onConflict: 'user_id,aula_id' })"),
  'Progresso deve usar a chave única user_id,aula_id',
)
assert.ok(
  source.includes('const { id: _localId') &&
    source.includes('...supabasePayload'),
  'O ID local não deve ser enviado como chave de inserção no Supabase',
)
