import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const adminAulasSource = readFileSync('src/pages/admin/AdminAulas.tsx', 'utf8')
const dataContextSource = readFileSync('src/contexts/DataContext.tsx', 'utf8')

assert.ok(
  adminAulasSource.includes("type EditorTab = 'basico' | 'conteudo' | 'slides' | 'materiais' | 'audio'"),
  'AdminAulas deve ter uma aba de Materiais para revisar, adicionar e editar materiais da aula',
)

assert.ok(
  adminAulasSource.includes("to={`/aula/${a.id}`}"),
  'AdminAulas deve oferecer link para visualizar a aula como o aluno ve',
)

assert.ok(
  adminAulasSource.includes('addMaterial') &&
    adminAulasSource.includes('updateMaterial') &&
    adminAulasSource.includes('deleteMaterial'),
  'AdminAulas deve permitir adicionar, editar e remover materiais complementares',
)

assert.ok(
  dataContextSource.includes("await supabase.from('materiais').delete().eq('aula_id', aula.id)") &&
    dataContextSource.includes("await supabase.from('materiais').insert("),
  'saveAula deve substituir os materiais da aula no Supabase junto com o restante da aula',
)

assert.ok(
  dataContextSource.includes('{ ...a, ...aula, slides, materiais }'),
  'saveAula offline deve preservar materiais editados na aula',
)
