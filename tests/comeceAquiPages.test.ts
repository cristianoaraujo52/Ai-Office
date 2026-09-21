import assert from 'node:assert/strict'
import { comeceAquiPages } from '../src/data/comeceAquiPages'

assert.equal(comeceAquiPages.length, 49)
assert.equal(comeceAquiPages[0].image, '/flipbook/imagen01.png')
assert.equal(comeceAquiPages[48].image, '/flipbook/imagen49.png')

comeceAquiPages.forEach((page, index) => {
  const number = index + 1
  assert.equal(page.number, number)
  assert.equal(page.image, `/flipbook/imagen${String(number).padStart(2, '0')}.png`)
  assert.ok(page.narration.trim().length > 20, `Página ${number} precisa de narração`)
  assert.ok(page.alt.trim().length > 20, `Página ${number} precisa de texto alternativo`)
})
