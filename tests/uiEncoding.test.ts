import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const filesWithUserFacingText = [
  'src/pages/AulaView.tsx',
]

const mojibakePattern = /Ã|âœ|ðŸ|â”|â•|�/

for (const file of filesWithUserFacingText) {
  const source = readFileSync(file, 'utf8')
  assert.equal(
    mojibakePattern.test(source),
    false,
    `${file} nao deve conter texto UTF-8 corrompido em labels da interface`,
  )
}

// Conteúdo offline das aulas (modo sem Supabase). Padrão mais estrito que o acima,
// porque "NÃO" em caixa alta é legítimo: só acusa Ã seguido de byte de continuação
// UTF-8 lido como Latin-1 (ex.: "Ã£", "Ã§"), "â€" ou emoji corrompido.
const strictMojibake = /Ã[\x80-\xBF]|â€|ðŸ|�/
const mockSource = readFileSync('src/lib/mockData.ts', 'utf8')
assert.equal(
  strictMojibake.test(mockSource),
  false,
  'src/lib/mockData.ts nao deve conter texto UTF-8 corrompido (ex.: "JoÃ£o" em vez de "João")',
)
