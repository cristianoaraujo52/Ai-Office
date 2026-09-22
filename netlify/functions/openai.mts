// Proxy da OpenAI: a chave fica só no servidor (variável OPENAI_API_KEY na Netlify)
// e apenas usuários logados no Supabase podem usar.

const ROTAS: Record<string, string> = {
  chat: 'https://api.openai.com/v1/chat/completions',
  speech: 'https://api.openai.com/v1/audio/speech',
}

const MODELOS_PERMITIDOS = new Set(['gpt-4o-mini', 'tts-1'])

function erro(status: number, message: string) {
  return new Response(JSON.stringify({ error: { message } }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function usuarioLogado(authorization: string | null): Promise<boolean> {
  const url = process.env.VITE_SUPABASE_URL
  const anon = process.env.VITE_SUPABASE_ANON_KEY
  if (!authorization?.startsWith('Bearer ') || !url || !anon) return false
  const res = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anon, Authorization: authorization },
  })
  return res.ok
}

export default async (req: Request) => {
  if (req.method === 'GET') {
    return Response.json({ configured: Boolean(process.env.OPENAI_API_KEY) })
  }
  if (req.method !== 'POST') return erro(405, 'Método não permitido')

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return erro(503, 'OPENAI_API_KEY não configurada na Netlify')

  const destino = ROTAS[new URL(req.url).searchParams.get('op') ?? '']
  if (!destino) return erro(400, 'Operação inválida')

  if (!(await usuarioLogado(req.headers.get('Authorization')))) {
    return erro(401, 'Faça login para usar a IA')
  }

  const body = await req.json().catch(() => null)
  if (!body || !MODELOS_PERMITIDOS.has(body.model)) return erro(400, 'Modelo não permitido')

  const upstream = await fetch(destino, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  })

  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json' },
  })
}
