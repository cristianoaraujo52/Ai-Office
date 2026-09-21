import assert from 'node:assert/strict'
import { getSlideImageUrl, parseSlideText } from '../src/lib/slidePresentation'

const blocks = parseSlideText('• Primeiro conceito\n- Segundo conceito\n1. Terceiro conceito\nDefinicao: texto simples')

assert.equal(blocks.filter(block => block.kind === 'bullet').length, 3)
assert.deepEqual(blocks[0], { kind: 'bullet', text: 'Primeiro conceito' })
assert.deepEqual(blocks[2], { kind: 'bullet', text: 'Terceiro conceito', emphasis: '1' })
assert.deepEqual(blocks[3], { kind: 'kv', label: 'Definicao', value: 'texto simples' })

assert.equal(
  getSlideImageUrl({ aula_id: 'aula-8-1', imagem_url: undefined }),
  '/covers/m08-excel-v2.webp',
)

assert.equal(
  getSlideImageUrl({ aula_id: 'aula-4-2', imagem_url: '/custom.webp' }),
  '/custom.webp',
)
