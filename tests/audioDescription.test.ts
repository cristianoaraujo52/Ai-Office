import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { getAudioDescriptionText } from '../src/lib/audioDescription'
import type { Aula } from '../src/types'

const baseAula = {
  id: 'aula-test',
  modulo_id: 'm-test',
  titulo: 'Aula Teste',
  descricao: 'Descricao padrao da aula.',
  conteudo_html: '<h2>Conteudo principal</h2><p>Primeiro paragrafo da aula.</p>',
  video_url: '',
  ordem: 1,
  duracao_min: 10,
  ativo: true,
  created_at: '2026-06-12',
} satisfies Aula

assert.equal(
  getAudioDescriptionText({ ...baseAula, narracao: 'Narre este texto completo.' }),
  'Aula Teste. Descricao padrao da aula. Narre este texto completo. Conteudo principal Primeiro paragrafo da aula.',
)

assert.equal(
  getAudioDescriptionText({ ...baseAula, narracao: '   ', resumo_audio: 'Resumo falado.' }),
  'Aula Teste. Descricao padrao da aula. Resumo falado. Conteudo principal Primeiro paragrafo da aula.',
)

assert.equal(
  getAudioDescriptionText({ ...baseAula, resumo_audio: ' ', descricao_curta: 'Descricao curta.' }),
  'Aula Teste. Descricao padrao da aula. Descricao curta. Conteudo principal Primeiro paragrafo da aula.',
)

assert.equal(
  getAudioDescriptionText(baseAula),
  'Aula Teste. Descricao padrao da aula. Conteudo principal Primeiro paragrafo da aula.',
)

assert.equal(
  getAudioDescriptionText({
    ...baseAula,
    objetivo: 'Aprender o fluxo completo.',
    passo_a_passo: ['Abrir a ferramenta', 'Executar o prompt'],
    dicas: ['Revise o resultado'],
    erros_comuns: ['Confiar sem validar'],
    resumo: 'Resumo final da aula.',
    exercicio: 'Pratique com seu caso.',
    slides: [
      { id: 's1', aula_id: 'aula-test', titulo: 'Slide 1', texto: 'Texto do primeiro slide.', ordem: 1 },
    ],
  }),
  'Aula Teste. Descricao padrao da aula. Objetivo: Aprender o fluxo completo. Conteudo principal Primeiro paragrafo da aula. Passo a passo: Abrir a ferramenta. Executar o prompt. Dicas: Revise o resultado. Erros comuns: Confiar sem validar. Resumo: Resumo final da aula. Exercicio: Pratique com seu caso. Slides: Slide 1. Texto do primeiro slide.',
)

const aulaViewSource = readFileSync('src/pages/AulaView.tsx', 'utf8')

assert.ok(
  aulaViewSource.includes('speechSynthesis'),
  'A aba Audio deve usar a Web Speech API para tocar a audio descricao no navegador',
)

assert.ok(
  aulaViewSource.includes('Ouvir áudio descrição'),
  'A aba Audio deve exibir um botao claro para ouvir a audio descricao',
)
