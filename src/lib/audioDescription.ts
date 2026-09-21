import type { Aula } from '../types'

type AudioDescriptionAula = Pick<
  Aula,
  | 'titulo'
  | 'descricao'
  | 'descricao_curta'
  | 'objetivo'
  | 'conteudo_html'
  | 'passo_a_passo'
  | 'dicas'
  | 'erros_comuns'
  | 'resumo'
  | 'exercicio'
  | 'narracao'
  | 'resumo_audio'
  | 'slides'
>

function cleanText(text?: string | null) {
  return (text ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

function sentence(text?: string | null) {
  const cleaned = cleanText(text)
  if (!cleaned) return ''
  return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`
}

function addSection(parts: string[], label: string, value?: string | null) {
  const text = cleanText(value)
  if (text) parts.push(sentence(`${label}: ${text}`))
}

function addListSection(parts: string[], label: string, values?: string[]) {
  const text = values?.map(cleanText).filter(Boolean).join('. ')
  if (text) parts.push(sentence(`${label}: ${text}`))
}

export function getAudioDescriptionText(aula?: AudioDescriptionAula | null) {
  if (!aula) return ''

  const parts: string[] = []
  const titulo = cleanText(aula.titulo)
  const descricao = cleanText(aula.descricao)
  const openingAudio = cleanText(aula.narracao) || cleanText(aula.resumo_audio) || cleanText(aula.descricao_curta)

  if (titulo) parts.push(sentence(titulo))
  if (descricao) parts.push(sentence(descricao))
  if (openingAudio && openingAudio !== descricao) parts.push(sentence(openingAudio))
  addSection(parts, 'Objetivo', aula.objetivo)

  const content = cleanText(aula.conteudo_html)
  if (content) parts.push(sentence(content))

  addListSection(parts, 'Passo a passo', aula.passo_a_passo)
  addListSection(parts, 'Dicas', aula.dicas)
  addListSection(parts, 'Erros comuns', aula.erros_comuns)
  addSection(parts, 'Resumo', aula.resumo)
  addSection(parts, 'Exercicio', aula.exercicio)

  const slidesText = aula.slides
    ?.slice()
    .sort((a, b) => a.ordem - b.ordem)
    .map(slide => [cleanText(slide.titulo), cleanText(slide.texto)].filter(Boolean).join('. '))
    .filter(Boolean)
    .join('. ')

  if (slidesText) parts.push(sentence(`Slides: ${slidesText}`))

  return parts
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+\./g, '.')
    .replace(/\.{2,}/g, '.')
    .trim()
}
