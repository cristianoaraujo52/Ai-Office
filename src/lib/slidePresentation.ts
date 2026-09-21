export type SlideBlock =
  | { kind: 'bullet'; text: string; emphasis?: string }
  | { kind: 'kv'; label: string; value: string }
  | { kind: 'paragraph'; text: string }

const MODULE_IMAGES: Record<string, string> = {
  '1': '/covers/m01-fundamentos-v2.webp',
  '2': '/covers/m02-conceitos-v2.webp',
  '3': '/covers/m03-ferramentas-v2.webp',
  '4': '/covers/m04-seguranca-v2.webp',
  '5': '/covers/m05-prompt-v2.webp',
  '6': '/covers/m06-tecnicas-avancadas-v2.webp',
  '7': '/covers/m07-documentos-v2.webp',
  '8': '/covers/m08-excel-v2.webp',
  '9': '/covers/m09-automacao-v2.webp',
  '10': '/covers/m10-processos-v2.webp',
  '11': '/covers/m11-casos-uso-v2.webp',
  '12': '/covers/m12-projeto-final-v2.webp',
  '13': '/covers/m13-produtividade-v2.webp',
  '14': '/covers/m14-instagram-linkedin-v2.webp',
}

export function parseSlideText(texto: string): SlideBlock[] {
  const lines = texto.split('\n').map(line => line.trim()).filter(Boolean)

  return lines.map<SlideBlock>(line => {
    const bullet = line.match(/^(?:[•\-*]|â€¢)\s+(.*)$/)
    if (bullet) return { kind: 'bullet', text: bullet[1] }

    const numbered = line.match(/^(\d+)[.)]\s+(.*)$/)
    if (numbered) return { kind: 'bullet', text: numbered[2], emphasis: numbered[1] }

    const keyValue = line.match(/^([^:]{2,42}):\s+(.+)$/)
    if (keyValue) return { kind: 'kv', label: keyValue[1].trim(), value: keyValue[2].trim() }

    return { kind: 'paragraph', text: line }
  })
}

export function getSlideImageUrl(slide: { aula_id: string; imagem_url?: string }) {
  if (slide.imagem_url) return slide.imagem_url

  const match = slide.aula_id.match(/^aula-(\d+)-/)
  if (!match) return undefined

  return MODULE_IMAGES[match[1]]
}
