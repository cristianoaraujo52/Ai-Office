# Exemplos de Uso Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar uma nova área autenticada com 28 exemplos práticos, imagens cinematográficas, explicações para iniciantes e prompts copiáveis.

**Architecture:** O catálogo ficará em `src/data/exemplosDeUso.ts`, com tipos e conteúdo independentes da interface. A página `ExemplosDeUso.tsx` controlará filtros, navegação, teclado, carregamento da imagem e cópia. `App.tsx` e `Sidebar.tsx` apenas integrarão rota e menu.

**Tech Stack:** React 19, TypeScript, React Router, Tailwind CSS, Clipboard API e testes Node com `tsx`.

---

### Task 1: Catálogo dos 28 exemplos

**Files:**
- Create: `src/data/exemplosDeUso.ts`
- Test: `tests/exemplosDeUsoData.test.ts`

- [ ] **Step 1: Write the failing test**

Criar um teste que importe `exemplosDeUso`, exija 28 itens, 7 por ferramenta, IDs e imagens únicos, arquivos PNG existentes e todos os campos didáticos preenchidos.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx tests/exemplosDeUsoData.test.ts`

Expected: FAIL porque `src/data/exemplosDeUso.ts` ainda não existe.

- [ ] **Step 3: Write minimal implementation**

Criar os tipos `FerramentaId` e `ExemploDeUso`, as configurações visuais das quatro ferramentas e os 28 exemplos com:

```ts
{
  id,
  ferramenta,
  numero,
  titulo,
  tarefa,
  porqueEstaFerramenta,
  imagem,
  passos,
  prompt,
  personalizar,
  resultadoEsperado,
  conferencia,
  dica,
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx tests/exemplosDeUsoData.test.ts`

Expected: PASS sem saída de erro.

### Task 2: Integração da nova área

**Files:**
- Create: `src/pages/ExemplosDeUso.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/Sidebar.tsx`
- Test: `tests/exemplosDeUsoIntegration.test.ts`

- [ ] **Step 1: Write the failing test**

Criar um teste estrutural que exija:

```ts
path="/exemplos-de-uso"
label: 'Exemplos de Uso'
import ExemplosDeUso from './pages/ExemplosDeUso'
Copiar prompt
ArrowLeft
ArrowRight
navigator.clipboard.writeText
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx tests/exemplosDeUsoIntegration.test.ts`

Expected: FAIL porque rota, menu e página ainda não existem.

- [ ] **Step 3: Write minimal implementation**

Criar página responsiva com:

- seletor de ChatGPT, Gemini, Copilot e Claude;
- imagem principal 16:9;
- navegação anterior/próximo e teclado;
- indicador global e por ferramenta;
- explicação da tarefa e da adequação da ferramenta;
- passos numerados;
- prompt completo em bloco selecionável;
- botão de cópia com fallback;
- listas de personalização, resultado e conferência;
- estados de carregamento e erro da imagem.

Adicionar a rota protegida e o item de menu.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx tests/exemplosDeUsoIntegration.test.ts`

Expected: PASS sem saída de erro.

### Task 3: Verificação técnica e visual

**Files:**
- Verify: `public/slides/exemplos-de-uso/*.png`
- Verify: all modified files

- [ ] **Step 1: Run focused tests**

Run:

```powershell
npx tsx tests/exemplosDeUsoData.test.ts
npx tsx tests/exemplosDeUsoIntegration.test.ts
```

Expected: ambos passam.

- [ ] **Step 2: Run project checks**

Run:

```powershell
npm.cmd run lint
npm.cmd run build
```

Expected: lint e build com exit code 0.

- [ ] **Step 3: Verify in browser**

Executar o app, abrir `/exemplos-de-uso` autenticado e conferir:

- imagem sem corte;
- filtros trocam para o primeiro slide correto;
- setas e teclado navegam;
- botão copia e mostra confirmação;
- versão móvel mantém leitura e controles utilizáveis.

