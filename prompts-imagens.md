# Prompts para gerar imagens dos módulos (Nano Banana 2 / Gemini 3.1 Flash Image)

## Como usar

1. Abra o painel da ferramenta (inference.sh, ou outro de sua escolha).
2. Cole o **PROMPT** de cada módulo.
3. Configure:
   - **Aspect ratio:** `16:9`
   - **Resolution:** `1K` (suficiente para web)
   - **Num images:** `1`
4. Baixe e salve com o **NOME DO ARQUIVO** indicado em `public/covers/` do projeto.
5. Após subir tudo, me avise — eu integro no Dashboard e no AulaView.

## Estilo visual base (aplica a todos)

> Modern abstract digital illustration, dark navy background (#0f172a) with vibrant violet/purple highlights (#8b5cf6), glowing neon accents, soft bloom, depth and motion, minimalist, no text, no logos, no human faces, cinematic 16:9 composition, premium editorial look — like a Stripe/Linear marketing hero.

## TESTE (gere primeiro)

**Arquivo:** `test.png`

```
Modern abstract digital illustration for an online AI course. Dark navy background (#0f172a) with vibrant violet/purple glow (#8b5cf6). Floating geometric neural network nodes interconnected by glowing lines, subtle office icons (laptop, document, gear) emerging from the network. Soft bloom, depth of field, motion blur on light particles. Minimalist, professional, futuristic. No text, no logos, no human faces. Cinematic 16:9 editorial composition.
```

---

## M01 — Fundamentos da IA

**Arquivo:** `m01-fundamentos.png`

```
Abstract glowing neural network forming a stylized brain silhouette, dark navy background (#0f172a), violet and purple light trails (#8b5cf6), subtle particles and gradients, depth and motion. Minimalist, clean, premium editorial style. No text, no logos, no human faces. 16:9 cinematic.
```

## M02 — Conceitos Essenciais (ML, Deep Learning, LLMs)

**Arquivo:** `m02-conceitos.png`

```
Layered neural network visualization with multiple translucent stacked planes, glowing connection lines flowing between layers, dark navy background (#0f172a), violet and indigo highlights (#8b5cf6), data points as small glowing dots. Cinematic, abstract, premium. No text, no logos, no faces. 16:9.
```

## M03 — Ferramentas de IA (ChatGPT, Claude, Gemini, Copilot, Perplexity)

**Arquivo:** `m03-ferramentas.png`

```
Abstract floating chat bubbles and dialog UI elements arranged as a constellation, glowing softly in violet and purple (#8b5cf6) over a dark navy background (#0f172a), connected by light beams. Minimalist, modern, editorial. No text inside the bubbles, no logos, no faces. 16:9 cinematic.
```

## M04 — Segurança e LGPD

**Arquivo:** `m04-seguranca.png`

```
Abstract glowing shield made of geometric circuits and data lines, protective light barrier, dark navy background (#0f172a), violet and electric purple glow (#8b5cf6), padlock motif subtly integrated, soft particles. Premium, secure, professional. No text, no logos, no faces. 16:9 cinematic.
```

## M05 — Engenharia de Prompt

**Arquivo:** `m05-prompt.png`

```
Abstract minimalist illustration of a glowing cursor blinking on a terminal-like surface, geometric typography blocks floating around, dark navy background (#0f172a), violet and magenta accents (#8b5cf6), depth and bloom. Clean, editorial, futuristic. No readable text, no logos, no faces. 16:9.
```

## M06 — Técnicas Avançadas

**Arquivo:** `m06-tecnicas-avancadas.png`

```
Abstract chain of interconnected glowing nodes branching out like a flowchart in 3D space, dark navy background (#0f172a), violet and electric purple (#8b5cf6) glowing connections, sense of orchestration and complexity. Premium, cinematic, editorial. No text, no logos, no faces. 16:9.
```

## M07 — Documentação Corporativa

**Arquivo:** `m07-documentacao.png`

```
Abstract stack of translucent floating documents with glowing edges, soft violet light beams (#8b5cf6) emanating from them, dark navy background (#0f172a), particles, depth. Clean, professional, editorial. No readable text, no logos, no faces. 16:9.
```

## M08 — IA para Excel

**Arquivo:** `m08-excel.png`

```
Abstract glowing data grid in 3D perspective, cells lit up with violet and purple gradients (#8b5cf6), data peaks rising like a bar chart silhouette, dark navy background (#0f172a), soft particles and light beams. Premium, editorial, futuristic. No text, no logos, no faces. 16:9.
```

## M09 — Automação (Zapier, Make, Power Automate)

**Arquivo:** `m09-automacao.png`

```
Abstract orchestration diagram: glowing geometric shapes connected by flowing light streams, gears and arrows subtly integrated, dark navy background (#0f172a), violet and electric purple glow (#8b5cf6), sense of motion and synchronization. Cinematic, premium. No text, no logos, no faces. 16:9.
```

## M10 — Processos Administrativos

**Arquivo:** `m10-processos.png`

```
Abstract minimalist flowchart in 3D with glowing nodes and connection arrows, checklist icon subtly integrated, dark navy background (#0f172a), violet and purple highlights (#8b5cf6), depth, particles. Clean, structured, editorial. No text, no logos, no faces. 16:9.
```

## M11 — Casos de Uso por Área (RH, Financeiro, Compras, Operações, Atendimento)

**Arquivo:** `m11-casos-uso.png`

```
Abstract collage of glowing department icons (people silhouette as abstract shape, dollar abstract, gear, headset abstract) arranged as a constellation connected by light lines, dark navy background (#0f172a), violet and purple glow (#8b5cf6). Minimalist, editorial. No readable text, no logos, no real faces. 16:9.
```

## M12 — Projeto Final

**Arquivo:** `m12-projeto-final.png`

```
Abstract glowing trophy or summit silhouette made of geometric particles ascending toward a bright violet light source, dark navy background (#0f172a), purple and electric violet bloom (#8b5cf6), sense of achievement and culmination. Cinematic, premium, inspirational. No text, no logos, no faces. 16:9.
```

---

## Após gerar

1. Salve todas em `C:\Users\crist\Downloads\ia-office-academy\public\covers\` com os nomes indicados.
2. Me avise (pode ser só "subi as imagens").
3. Eu atualizo `mockData.ts` para apontar `coverImage` por módulo e atualizo o **Dashboard** para mostrar a thumbnail nos cards dos módulos.

## Dica de qualidade

Se a primeira saída não convencer, use estes refinamentos:
- Adicione `, more abstract, less literal` se ficar muito ilustrativo.
- Adicione `, more vibrant, higher contrast` se ficar apagado.
- Adicione `, less elements, more breathing room` se ficar carregado.
- Mude `1K` para `2K` se quiser mais nitidez (custo +50%).
