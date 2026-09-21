import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const page = readFileSync('src/pages/ComeceAqui.tsx', 'utf8')

for (const label of [
  'Ativar áudio e começar',
  'Anterior',
  'Próxima',
  'Pausar',
  'Continuar',
  'Repetir página',
  'Iniciar o curso',
]) {
  assert.ok(page.includes(label), `Controle ausente: ${label}`)
}

assert.ok(page.includes('speechSynthesis.cancel()'))
assert.ok(page.includes('comeceAquiPages'))
assert.ok(page.includes('ArrowLeft'))
assert.ok(page.includes('ArrowRight'))

const app = readFileSync('src/App.tsx', 'utf8')
const sidebar = readFileSync('src/components/Sidebar.tsx', 'utf8')

assert.ok(app.includes('path="/comece-aqui"'))
assert.ok(app.includes("import ComeceAqui from './pages/ComeceAqui'"))
assert.ok(sidebar.includes("label: 'Comece aqui'"))
assert.ok(sidebar.indexOf("label: 'Comece aqui'") < sidebar.indexOf("label: 'Apresenta"))
