import { supabase } from './supabase'

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY ?? ''

// Chave direta só no desenvolvimento local; no site publicado a chave fica na
// função netlify/functions/openai.mts e nunca vai para o navegador.
const hasDirectKey =
  Boolean(OPENAI_API_KEY) &&
  !OPENAI_API_KEY.startsWith('sk-sua') &&
  OPENAI_API_KEY.length > 20

export const isOpenAIConfigured = hasDirectKey || import.meta.env.PROD

const DIRECT_URLS = {
  chat: 'https://api.openai.com/v1/chat/completions',
  speech: 'https://api.openai.com/v1/audio/speech',
} as const

async function openaiFetch(op: keyof typeof DIRECT_URLS, body: unknown): Promise<Response> {
  if (hasDirectKey) {
    return fetch(DIRECT_URLS[op], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify(body),
    })
  }
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Faça login para usar a IA')
  return fetch(`/.netlify/functions/openai?op=${op}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function chatCompletion(
  messages: ChatMessage[],
  options?: { model?: string; temperature?: number; max_tokens?: number }
): Promise<string> {
  const res = await openaiFetch('chat', {
    model: options?.model ?? 'gpt-4o-mini',
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.max_tokens ?? 1024,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error?.message ?? `OpenAI error: ${res.status}`)
  }
  const data = await res.json()
  return data.choices[0].message.content as string
}

export type TTSVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'

export async function textToSpeech(input: string, voice: TTSVoice = 'nova'): Promise<Blob> {
  const res = await openaiFetch('speech', {
    model: 'tts-1',
    input: input.slice(0, 4096),
    voice,
    response_format: 'mp3',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error?.message ?? `OpenAI TTS error: ${res.status}`)
  }
  return res.blob()
}

export async function streamChatCompletion(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  options?: { model?: string }
): Promise<void> {
  const res = await openaiFetch('chat', {
    model: options?.model ?? 'gpt-4o-mini',
    messages,
    temperature: 0.7,
    max_tokens: 800,
    stream: true,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error?.message ?? `OpenAI error: ${res.status}`)
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value)
    for (const line of chunk.split('\n')) {
      if (!line.startsWith('data: ')) continue
      const raw = line.slice(6).trim()
      if (raw === '[DONE]') return
      try {
        const parsed = JSON.parse(raw)
        const content = parsed.choices?.[0]?.delta?.content
        if (content) onChunk(content)
      } catch { /* ignore parse errors */ }
    }
  }
}
