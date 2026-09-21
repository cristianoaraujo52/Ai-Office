# M01 Slides Pilot Design

## Goal
Recreate the M01 slide experience for beginner students using short, guided slides and explanatory infographic-style visuals.

## Scope
This pilot covers M01 only:

- `aula-1-1`: O que e Inteligencia Artificial
- `aula-1-2`: IA no Cotidiano
- `aula-1-3`: IA vs Automacao

Each lesson gets exactly five slides. Every slide has a clear title, beginner-friendly text, and a dedicated visual asset under `public/slides/m01`.

## Learning Style
The slides must feel like hand-holding instruction for a non-technical audience:

- one idea per slide;
- short phrases;
- familiar office examples;
- visible steps and flows;
- no unexplained jargon;
- repeated reminder that IA helps, but the person reviews and decides.

## Slide Pattern
Each lesson follows the same five-slide rhythm:

1. Main idea in plain language.
2. Before and after comparison.
3. Guided step-by-step flow.
4. Real office example.
5. Summary and practice action.

## Visual Direction
Infographics are simple SVG assets, not decorative stock images. They use cards, arrows, numbered steps, and comparison layouts. Text inside visuals stays short so it remains readable in the slide renderer.

## Implementation Notes
Slides are currently overridden by `officialSlides` in `src/lib/mockData.ts`. The pilot will extend those slide records with `imagem_url` and replace only the M01 entries. Existing renderer behavior already supports slide-specific images through `imagem_url`.

## Verification
Add a data-level test that checks each M01 lesson has five official pilot slides and that each slide points to a `/slides/m01/*.svg` infographic.
