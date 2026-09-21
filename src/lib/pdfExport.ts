import { chatCompletion } from './openai'
import type { Aula } from '../types'

export async function generateLessonSummary(aula: Aula): Promise<string> {
  const rawHtml = aula.conteudo_html ?? ''
  const plain = rawHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

  const prompt = `Você é um assistente educacional. Crie um resumo estruturado da aula abaixo para download em PDF.

Aula: ${aula.titulo}
Descrição: ${aula.descricao}
Objetivo: ${aula.objetivo ?? ''}
Conteúdo: ${plain.slice(0, 3000)}

Retorne APENAS HTML limpo (sem <!DOCTYPE>, sem <html>, sem <body>), usando estas tags:
- <h1> para o título da aula
- <h2> para seções (Objetivo, Conceitos-chave, Pontos Principais, Aplicação Prática, Para Revisar)
- <p> para parágrafos
- <ul><li> para listas
- <strong> para destaques

O resumo deve ter entre 400 e 600 palavras. Escreva em português brasileiro.`

  const html = await chatCompletion(
    [{ role: 'user', content: prompt }],
    { model: 'gpt-4o-mini', temperature: 0.4, max_tokens: 1200 }
  )
  return html.trim()
}

export function printAsPDF(summaryHtml: string, aulaTitle: string) {
  const win = window.open('', '_blank')
  if (!win) return

  win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Resumo — ${aulaTitle}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Georgia', serif;
      font-size: 13px;
      line-height: 1.75;
      color: #1a1a2e;
      max-width: 720px;
      margin: 0 auto;
      padding: 48px 40px;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 20px;
      margin-bottom: 28px;
      border-bottom: 2px solid #8b5cf6;
    }
    .logo {
      width: 36px; height: 36px;
      background: #8b5cf6;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: bold; font-size: 18px;
      flex-shrink: 0;
    }
    .brand { font-size: 11px; color: #6b7280; letter-spacing: 0.05em; text-transform: uppercase; }
    h1 { font-size: 22px; color: #1e1b4b; margin-bottom: 6px; }
    h2 {
      font-size: 13px;
      font-weight: 700;
      color: #8b5cf6;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-top: 24px;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid #e5e7eb;
    }
    p { margin-bottom: 10px; color: #374151; }
    ul { padding-left: 20px; margin-bottom: 10px; }
    li { margin-bottom: 5px; color: #374151; }
    strong { color: #1e1b4b; }
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      font-size: 10px;
      color: #9ca3af;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { padding: 0; }
      @page { margin: 2cm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">⚡</div>
    <div>
      <div class="brand">IA Office Academy · Resumo da Aula</div>
      <div style="font-size:11px;color:#6b7280;">Gerado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
    </div>
  </div>
  ${summaryHtml}
  <div class="footer">
    <span>IA Office Academy</span>
    <span>${aulaTitle}</span>
  </div>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`)
  win.document.close()
}
