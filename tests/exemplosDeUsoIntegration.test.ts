import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const app = readFileSync('src/App.tsx', 'utf8')
const sidebar = readFileSync('src/components/Sidebar.tsx', 'utf8')
const page = readFileSync('src/pages/ExemplosDeUso.tsx', 'utf8')

assert.ok(app.includes("import ExemplosDeUso from './pages/ExemplosDeUso'"))
assert.ok(app.includes('path="/exemplos-de-uso"'))
assert.ok(sidebar.includes("label: 'Exemplos de Uso'"))
assert.ok(sidebar.includes("to: '/exemplos-de-uso'"))

for (const expected of [
  'Copiar prompt',
  'ArrowLeft',
  'ArrowRight',
  'navigator.clipboard.writeText',
  'Tentar novamente',
  'Por que usar',
  'Resultado esperado',
  'Antes de usar o resultado',
]) {
  assert.ok(page.includes(expected), `ExemplosDeUso deve conter: ${expected}`)
}

