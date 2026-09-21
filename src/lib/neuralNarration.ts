import { useEffect, useState } from 'react'

/**
 * Narração com voz neural pré-gerada (edge-tts, pt-BR-FranciscaNeural).
 *
 * Os MP3 ficam em public/audio/narracao/<chave>.mp3 e o manifest.json guarda o hash
 * do texto usado em cada um. O app só toca o MP3 quando o hash bate com o texto
 * atual — se a aula for editada no painel admin, cai para a voz do navegador em vez
 * de narrar um texto desatualizado.
 *
 * Gerar/atualizar os áudios: npm run audio:narracao
 */

export const NARRATION_VOICE_LABEL = 'Francisca (voz neural)'
const BASE = '/audio/narracao'

export type NarrationManifest = Record<string, string>

/** Normaliza espaços para que diferenças de formatação não invalidem o áudio. */
export function normalizeNarrationText(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

/** FNV-1a 32 bits em hex — o mesmo valor é gravado no manifest pelo script de geração. */
export function narrationHash(text: string) {
  const normalized = normalizeNarrationText(text)
  let hash = 0x811c9dc5
  for (let i = 0; i < normalized.length; i++) {
    hash ^= normalized.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export const aulaNarrationKey = (aulaId: string) => aulaId
export const comeceAquiNarrationKey = (pageNumber: number) => `comece-${String(pageNumber).padStart(2, '0')}`

/** URL do MP3 se existir áudio gerado para exatamente este texto; senão null. */
export function narrationUrl(manifest: NarrationManifest | null, key: string, text: string) {
  if (!manifest || !text) return null
  return manifest[key] === narrationHash(text) ? `${BASE}/${key}.mp3?v=${manifest[key]}` : null
}

let manifestPromise: Promise<NarrationManifest> | null = null

export function loadNarrationManifest() {
  manifestPromise ??= fetch(`${BASE}/manifest.json`, { cache: 'no-cache' })
    .then(res => (res.ok ? res.json() : {}))
    .catch(() => ({}))
  return manifestPromise
}

export function useNarrationManifest() {
  const [manifest, setManifest] = useState<NarrationManifest | null>(null)
  useEffect(() => {
    let active = true
    loadNarrationManifest().then(m => { if (active) setManifest(m) })
    return () => { active = false }
  }, [])
  return manifest
}
