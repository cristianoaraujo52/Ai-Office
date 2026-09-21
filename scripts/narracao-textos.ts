/**
 * Monta os textos narrados (mesma função que o app usa) e o hash de cada um.
 * Saída: scripts/narracao-textos.json, lido por scripts/gerar-narracao.py.
 *
 * Executar tudo de uma vez:  npm run audio:narracao
 */
import { writeFileSync } from 'fs'
import { mockModulos } from '../src/lib/mockData'
import { comeceAquiPages } from '../src/data/comeceAquiPages'
import { getAudioDescriptionText } from '../src/lib/audioDescription'
import {
  aulaNarrationKey,
  comeceAquiNarrationKey,
  narrationHash,
  normalizeNarrationText,
} from '../src/lib/neuralNarration'

const itens: { key: string; hash: string; text: string }[] = []

for (const modulo of mockModulos) {
  for (const aula of modulo.aulas ?? []) {
    const text = getAudioDescriptionText(aula)
    if (text) itens.push({ key: aulaNarrationKey(aula.id), hash: narrationHash(text), text: normalizeNarrationText(text) })
  }
}

for (const page of comeceAquiPages) {
  if (page.narration) {
    itens.push({ key: comeceAquiNarrationKey(page.number), hash: narrationHash(page.narration), text: normalizeNarrationText(page.narration) })
  }
}

writeFileSync('scripts/narracao-textos.json', JSON.stringify(itens, null, 1), 'utf8')
console.log(`${itens.length} textos preparados (${itens.reduce((a, i) => a + i.text.length, 0).toLocaleString('pt-BR')} caracteres)`)
