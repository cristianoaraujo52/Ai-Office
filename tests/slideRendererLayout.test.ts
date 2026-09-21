import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync('src/components/SlideRenderer.tsx', 'utf8')

assert.ok(
  source.includes('visualUrl && !isInfographicVisual'),
  'SlideRenderer deve impedir que infograficos sejam usados como fundo ampliado atras do texto',
)

assert.ok(
  source.includes('object-contain'),
  'SlideRenderer deve usar object-contain para nao cortar infograficos didaticos',
)

assert.ok(
  source.includes('isInfographicVisual'),
  'SlideRenderer deve tratar infograficos de aula como assets didaticos, nao como foto decorativa',
)

assert.ok(
  source.includes('if (isInfographicVisual && visualUrl)'),
  'SlideRenderer deve exibir infograficos como slide inteiro, sem duplicar texto do site ao lado',
)
