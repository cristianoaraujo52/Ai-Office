import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const adminModulosSource = readFileSync('src/pages/admin/AdminModulos.tsx', 'utf8')
const adminAulasSource = readFileSync('src/pages/admin/AdminAulas.tsx', 'utf8')

assert.ok(
  adminModulosSource.includes('Aulas deste modulo') ||
    adminModulosSource.includes('Aulas deste módulo'),
  'O modal de modulo deve mostrar as aulas do modulo selecionado',
)

assert.ok(
  adminModulosSource.includes("to={`/admin/aulas?modulo=${editing.id}`}"),
  'O modal de modulo deve ter link direto para gerenciar as aulas daquele modulo',
)

assert.ok(
  adminModulosSource.includes("to={`/modulo/${editing.id}`}"),
  'O modal de modulo deve ter link para visualizar o modulo como aluno/admin',
)

assert.ok(
  adminAulasSource.includes('useSearchParams') &&
    adminAulasSource.includes("searchParams.get('modulo')"),
  'AdminAulas deve ler ?modulo=... para abrir filtrado pelo modulo escolhido',
)
