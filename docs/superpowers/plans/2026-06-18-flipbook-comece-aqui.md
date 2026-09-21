# Flipbook “Comece aqui” Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar uma página introdutória com 49 imagens ordenadas, navegação simples e narração automática em português após ativação inicial do aluno.

**Architecture:** O conteúdo do flipbook ficará em um módulo estático tipado que relaciona cada imagem à sua transcrição acessível. Um controlador isolado encapsulará a Web Speech API, enquanto a página React cuidará apenas de estado visual, navegação, pré-carregamento e destino final. A rota protegida e o item do menu reutilizarão a estrutura atual da aplicação.

**Tech Stack:** React 19, TypeScript, React Router 7, Tailwind CSS, Web Speech API, testes Node executados com `tsx`.

---

## Estrutura de arquivos

- Criar `src/data/comeceAquiPages.ts`: fonte única da ordem, caminhos e textos das 49 páginas.
- Criar `src/lib/flipbookSpeech.ts`: seleção de voz e operações de fala testáveis.
- Criar `src/pages/ComeceAqui.tsx`: interface, navegação, carregamento e integração com voz.
- Criar `tests/comeceAquiPages.test.ts`: integridade da sequência e do conteúdo.
- Criar `tests/flipbookSpeech.test.ts`: comportamento do controlador de voz.
- Criar `tests/comeceAquiIntegration.test.ts`: presença da rota, menu e controles essenciais.
- Modificar `src/App.tsx`: registrar a rota protegida `/comece-aqui`.
- Modificar `src/components/Sidebar.tsx`: adicionar “Comece aqui” no topo do menu do aluno.

### Task 1: Conteúdo ordenado e acessível

**Files:**
- Create: `src/data/comeceAquiPages.ts`
- Create: `tests/comeceAquiPages.test.ts`

- [ ] **Step 1: Escrever o teste de integridade**

```ts
import assert from 'node:assert/strict'
import { comeceAquiPages } from '../src/data/comeceAquiPages'

assert.equal(comeceAquiPages.length, 49)
assert.equal(comeceAquiPages[0].image, '/flipbook/imagen01.png')
assert.equal(comeceAquiPages[48].image, '/flipbook/imagen49.png')

comeceAquiPages.forEach((page, index) => {
  const number = index + 1
  assert.equal(page.number, number)
  assert.equal(page.image, `/flipbook/imagen${String(number).padStart(2, '0')}.png`)
  assert.ok(page.narration.trim().length > 20, `Página ${number} precisa de narração`)
  assert.ok(page.alt.trim().length > 20, `Página ${number} precisa de texto alternativo`)
})
```

- [ ] **Step 2: Executar o teste e confirmar a falha**

Run: `npx tsx tests/comeceAquiPages.test.ts`

Expected: FAIL porque `src/data/comeceAquiPages.ts` ainda não existe.

- [ ] **Step 3: Transcrever e revisar as 49 imagens**

Para cada arquivo `public/flipbook/imagenNN.png`, registrar:

```ts
export interface ComeceAquiPage {
  number: number
  image: string
  alt: string
  narration: string
}

export const comeceAquiPages: ComeceAquiPage[] = [
  {
    number: 1,
    image: '/flipbook/imagen01.png',
    alt: 'Mulher usando um computador em um escritório, ao lado da mensagem de que qualquer pessoa pode aprender inteligência artificial.',
    narration: 'Página 1. Qualquer pessoa pode aprender inteligência artificial. A inteligência artificial não é só para especialistas. O futuro é para quem aprende hoje. Aprenda, pratique, aplique e evolua. Você não precisa ser especialista. Basta dar o primeiro passo. A imagem também mostra usos da inteligência artificial em e-mail, documentos, calendário e tarefas do dia a dia.',
  },
]
```

Antes de concluir este passo, o array deve conter 49 objetos completos, um para cada arquivo entre `imagen01.png` e `imagen49.png`, sem gerar as descrições apenas pelo nome do arquivo. O texto falado deve priorizar a mensagem principal, ler os textos relevantes em ordem natural e descrever apenas elementos visuais que ajudem a compreensão. Conferir manualmente nomes, números e acentos após qualquer extração automática.

- [ ] **Step 4: Executar o teste de integridade**

Run: `npx tsx tests/comeceAquiPages.test.ts`

Expected: PASS sem saída de erro.

### Task 2: Controlador de voz

**Files:**
- Create: `src/lib/flipbookSpeech.ts`
- Create: `tests/flipbookSpeech.test.ts`

- [ ] **Step 1: Escrever testes do controlador**

```ts
import assert from 'node:assert/strict'
import { choosePortugueseVoice, createFlipbookUtterance } from '../src/lib/flipbookSpeech'

const voices = [
  { lang: 'en-US', name: 'English' },
  { lang: 'pt-PT', name: 'Português' },
  { lang: 'pt-BR', name: 'Luciana' },
] as SpeechSynthesisVoice[]

assert.equal(choosePortugueseVoice(voices)?.lang, 'pt-BR')

const utterance = createFlipbookUtterance('Texto da página', voices)
assert.equal(utterance.text, 'Texto da página')
assert.equal(utterance.lang, 'pt-BR')
assert.equal(utterance.rate, 0.92)
```

- [ ] **Step 2: Executar e confirmar a falha**

Run: `npx tsx tests/flipbookSpeech.test.ts`

Expected: FAIL porque `src/lib/flipbookSpeech.ts` ainda não existe.

- [ ] **Step 3: Implementar seleção e criação da fala**

```ts
export function choosePortugueseVoice(voices: SpeechSynthesisVoice[]) {
  return voices.find(voice => voice.lang.toLowerCase() === 'pt-br')
    ?? voices.find(voice => voice.lang.toLowerCase().startsWith('pt'))
}

export function createFlipbookUtterance(
  text: string,
  voices: SpeechSynthesisVoice[] = [],
) {
  const utterance = new SpeechSynthesisUtterance(text)
  const voice = choosePortugueseVoice(voices)
  utterance.lang = voice?.lang ?? 'pt-BR'
  utterance.voice = voice ?? null
  utterance.rate = 0.92
  utterance.pitch = 1
  return utterance
}

export function supportsSpeech() {
  return typeof window !== 'undefined'
    && 'speechSynthesis' in window
    && typeof SpeechSynthesisUtterance !== 'undefined'
}
```

- [ ] **Step 4: Executar o teste**

Run: `npx tsx tests/flipbookSpeech.test.ts`

Expected: PASS. Se o ambiente Node não possuir `SpeechSynthesisUtterance`, ajustar o teste para instalar um mock mínimo em `globalThis` antes de chamar a função.

### Task 3: Página do flipbook

**Files:**
- Create: `src/pages/ComeceAqui.tsx`
- Create: `tests/comeceAquiIntegration.test.ts`

- [ ] **Step 1: Escrever verificações da interface**

```ts
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const page = readFileSync('src/pages/ComeceAqui.tsx', 'utf8')

for (const label of [
  'Ativar áudio e começar',
  'Anterior',
  'Próxima',
  'Pausar',
  'Continuar',
  'Repetir página',
  'Iniciar o curso',
]) {
  assert.ok(page.includes(label), `Controle ausente: ${label}`)
}

assert.ok(page.includes('speechSynthesis.cancel()'))
assert.ok(page.includes('comeceAquiPages'))
assert.ok(page.includes('ArrowLeft'))
assert.ok(page.includes('ArrowRight'))
```

- [ ] **Step 2: Executar e confirmar a falha**

Run: `npx tsx tests/comeceAquiIntegration.test.ts`

Expected: FAIL porque a página ainda não existe.

- [ ] **Step 3: Implementar o estado e a navegação**

A página deverá:

- iniciar em `pageIndex = 0`;
- obter `page = comeceAquiPages[pageIndex]`;
- navegar sem ultrapassar `0` e `48`;
- cancelar a fala antes de qualquer troca;
- pré-carregar `comeceAquiPages[pageIndex + 1]?.image`;
- responder a `ArrowLeft` e `ArrowRight`;
- localizar `modulos.find(modulo => modulo.ordem === 1)` para o destino final;
- usar `/dashboard` como fallback.

Estrutura principal:

```tsx
const [pageIndex, setPageIndex] = useState(0)
const [audioEnabled, setAudioEnabled] = useState(false)
const [speechState, setSpeechState] = useState<'idle' | 'speaking' | 'paused'>('idle')
const [imageState, setImageState] = useState<'loading' | 'ready' | 'error'>('loading')
const page = comeceAquiPages[pageIndex]
const firstModule = modulos.find(modulo => modulo.ordem === 1)
const courseTarget = firstModule ? `/modulo/${firstModule.id}` : '/dashboard'
```

- [ ] **Step 4: Implementar ativação e narração automática**

O primeiro botão executará `setAudioEnabled(true)` e falará a página atual. Um efeito dependente de `pageIndex` falará automaticamente apenas quando `audioEnabled` for verdadeiro.

```tsx
const speakPage = useCallback(() => {
  if (!supportsSpeech()) {
    setSpeechUnsupported(true)
    return
  }

  window.speechSynthesis.cancel()
  const utterance = createFlipbookUtterance(
    page.narration,
    window.speechSynthesis.getVoices(),
  )
  utterance.onstart = () => setSpeechState('speaking')
  utterance.onend = () => setSpeechState('idle')
  utterance.onerror = () => setSpeechState('idle')
  window.speechSynthesis.speak(utterance)
}, [page.narration])
```

Ao desmontar a página, executar `window.speechSynthesis.cancel()`.

- [ ] **Step 5: Implementar controles acessíveis**

- **Pausar:** `window.speechSynthesis.pause()` e estado `paused`.
- **Continuar:** `window.speechSynthesis.resume()` e estado `speaking`.
- **Repetir página:** cancelar e chamar `speakPage()`.
- Usar `aria-live="polite"` no contador e nas mensagens de erro.
- Usar o texto completo da página no `alt` da imagem.
- Exibir `Página {page.number} de {comeceAquiPages.length}`.

- [ ] **Step 6: Implementar carregamento e falha da imagem**

Ao mudar de página, voltar para `loading`. Usar `onLoad` e `onError` na imagem. Em erro, mostrar:

- número da página com falha;
- botão **Tentar novamente**, recriando a imagem por uma chave incremental;
- botões de navegação ainda disponíveis.

- [ ] **Step 7: Executar a verificação da interface**

Run: `npx tsx tests/comeceAquiIntegration.test.ts`

Expected: PASS.

### Task 4: Rota e menu do aluno

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Sidebar.tsx`
- Modify: `tests/comeceAquiIntegration.test.ts`

- [ ] **Step 1: Acrescentar testes de integração estática**

```ts
const app = readFileSync('src/App.tsx', 'utf8')
const sidebar = readFileSync('src/components/Sidebar.tsx', 'utf8')

assert.ok(app.includes("path=\"/comece-aqui\""))
assert.ok(app.includes("import ComeceAqui from './pages/ComeceAqui'"))
assert.ok(sidebar.includes("label: 'Comece aqui'"))
assert.ok(sidebar.indexOf("label: 'Comece aqui'") < sidebar.indexOf("label: 'Apresentação do Curso'"))
```

- [ ] **Step 2: Executar e confirmar a falha**

Run: `npx tsx tests/comeceAquiIntegration.test.ts`

Expected: FAIL nas verificações de rota e menu.

- [ ] **Step 3: Registrar a rota protegida**

Adicionar:

```tsx
import ComeceAqui from './pages/ComeceAqui'
```

E, antes da rota de apresentação:

```tsx
<Route
  path="/comece-aqui"
  element={<ProtectedRoute><ComeceAqui /></ProtectedRoute>}
/>
```

- [ ] **Step 4: Adicionar o primeiro item do menu**

No início de `studentNav`:

```ts
{ icon: 'auto_stories', label: 'Comece aqui', to: '/comece-aqui' },
```

O item não deve ser adicionado a `adminNav`.

- [ ] **Step 5: Executar o teste de integração**

Run: `npx tsx tests/comeceAquiIntegration.test.ts`

Expected: PASS.

### Task 5: Verificação funcional e regressão

**Files:**
- Verify: `src/data/comeceAquiPages.ts`
- Verify: `src/lib/flipbookSpeech.ts`
- Verify: `src/pages/ComeceAqui.tsx`
- Verify: `src/App.tsx`
- Verify: `src/components/Sidebar.tsx`

- [ ] **Step 1: Executar os testes da funcionalidade**

Run:

```powershell
npx tsx tests/comeceAquiPages.test.ts
npx tsx tests/flipbookSpeech.test.ts
npx tsx tests/comeceAquiIntegration.test.ts
```

Expected: todos passam sem erros.

- [ ] **Step 2: Executar a suíte existente**

Run:

```powershell
Get-ChildItem tests\*.test.ts | ForEach-Object { npx tsx $_.FullName }
```

Expected: todos os testes terminam com código `0`.

- [ ] **Step 3: Executar o build de produção**

Run: `npm.cmd run build`

Expected: TypeScript e Vite terminam com código `0`.

- [ ] **Step 4: Verificar no navegador**

Iniciar o Vite e confirmar:

1. “Comece aqui” é o primeiro item do menu do aluno.
2. A página começa em `imagen01.png`.
3. **Ativar áudio e começar** inicia a fala da página 1.
4. **Próxima** cancela a fala anterior e narra automaticamente a página seguinte.
5. **Pausar**, **Continuar** e **Repetir página** funcionam.
6. As setas do teclado navegam sem sair dos limites.
7. A página 49 oferece **Iniciar o curso** e abre o Módulo 1.
8. O layout continua legível em largura de celular.

- [ ] **Step 5: Registrar a limitação do ambiente**

Esta cópia do projeto não contém `.git`; portanto, os passos de commit não podem ser executados até que o projeto seja colocado dentro de um repositório Git.
