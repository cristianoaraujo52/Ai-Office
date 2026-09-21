# M01 Slides Pilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace M01 slides with beginner-friendly, infographic-backed pilot slides.

**Architecture:** Keep the existing data-driven slide renderer. Update only M01 slide data in `src/lib/mockData.ts`, extend the local `officialSlides` record to carry `imagem_url`, and add SVG infographics under `public/slides/m01`.

**Tech Stack:** React, TypeScript, Vite, static SVG assets, Node `assert` tests via `tsx`.

---

### Task 1: Add M01 Slide Data Test

**Files:**
- Create: `tests/m01SlidesPilot.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict'
import { mockSlides } from '../src/lib/mockData'

const pilotLessonIds = ['aula-1-1', 'aula-1-2', 'aula-1-3']

for (const aulaId of pilotLessonIds) {
  const slides = mockSlides[aulaId] ?? []

  assert.equal(slides.length, 5, `${aulaId} deve ter 5 slides no piloto`)

  slides.forEach((slide, index) => {
    assert.equal(slide.ordem, index + 1)
    assert.ok(slide.titulo.length >= 8)
    assert.ok(slide.texto.length >= 60)
    assert.ok(
      slide.imagem_url?.startsWith(`/slides/m01/${aulaId}-`),
      `${slide.titulo} precisa apontar para um infografico do M01`,
    )
    assert.ok(slide.imagem_url?.endsWith('.svg'))
  })
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx.cmd tsx tests\m01SlidesPilot.test.ts`

Expected: failure because current M01 official slides do not have five slides per lesson and do not include `imagem_url`.

### Task 2: Add SVG Infographic Assets

**Files:**
- Create: `public/slides/m01/aula-1-1-01.svg` through `public/slides/m01/aula-1-3-05.svg`

- [ ] **Step 1: Add simple SVGs**

Each SVG uses 1280x800 viewBox, dark background, readable labels, cards, arrows, and numbered steps.

### Task 3: Replace M01 Official Slides

**Files:**
- Modify: `src/lib/mockData.ts`

- [ ] **Step 1: Extend the official slide type**

Use:

```ts
const officialSlides: Record<string, { titulo: string; texto: string; imagem_url?: string }[]> = {
```

- [ ] **Step 2: Replace M01 entries**

Replace `aula-1-1`, `aula-1-2`, and add `aula-1-3` with five beginner-friendly slide records each. Every record includes `imagem_url`.

- [ ] **Step 3: Preserve imagem_url during mapping**

Use:

```ts
id: `os${++_osId}`, aula_id: a.id, titulo: s.titulo, texto: s.texto, imagem_url: s.imagem_url, ordem: i + 1,
```

### Task 4: Verify

**Files:**
- Test: `tests/m01SlidesPilot.test.ts`
- Existing tests: `tests/slidePresentation.test.ts`, `tests/normalizeAula.test.ts`, `tests/quizFeedback.test.ts`

- [ ] **Step 1: Run the pilot test**

Run: `npx.cmd tsx tests\m01SlidesPilot.test.ts`

Expected: exit code 0.

- [ ] **Step 2: Run existing tests**

Run:

```powershell
npx.cmd tsx tests\normalizeAula.test.ts
npx.cmd tsx tests\quizFeedback.test.ts
npx.cmd tsx tests\slidePresentation.test.ts
```

Expected: exit code 0 for each.

- [ ] **Step 3: Build the app**

Run: `npm.cmd run build`

Expected: TypeScript and Vite build exit code 0.
