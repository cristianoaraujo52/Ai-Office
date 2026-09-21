import assert from 'node:assert/strict'
import { choosePortugueseVoice, createFlipbookUtterance } from '../src/lib/flipbookSpeech'

class MockUtterance {
  text: string
  lang = ''
  rate = 1
  pitch = 1
  voice: SpeechSynthesisVoice | null = null

  constructor(text: string) {
    this.text = text
  }
}

Object.assign(globalThis, { SpeechSynthesisUtterance: MockUtterance })

const voices = [
  { lang: 'en-US', name: 'English' },
  { lang: 'pt-PT', name: 'Português' },
  { lang: 'pt-BR', name: 'Luciana' },
] as SpeechSynthesisVoice[]

assert.equal(choosePortugueseVoice(voices)?.lang, 'pt-BR')

// Com várias vozes pt-BR, a neural/natural tem prioridade sobre a local.
const withNatural = [
  { lang: 'pt-BR', name: 'Microsoft Maria - Portuguese (Brazil)' },
  { lang: 'pt-BR', name: 'Microsoft Francisca Online (Natural) - Portuguese (Brazil)' },
] as SpeechSynthesisVoice[]
assert.match(choosePortugueseVoice(withNatural)?.name ?? '', /Natural/)

const utterance = createFlipbookUtterance('Texto da página', voices)
assert.equal(utterance.text, 'Texto da página')
assert.equal(utterance.lang, 'pt-BR')
assert.equal(utterance.rate, 0.92)
