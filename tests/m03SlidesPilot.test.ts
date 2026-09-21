import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { mockSlides } from '../src/lib/mockData'

const pilotLessonIds = ['aula-3-1', 'aula-3-2', 'aula-3-3', 'aula-3-4']

function getPngSize(filePath: string) {
  const file = readFileSync(filePath)
  return {
    width: file.readUInt32BE(16),
    height: file.readUInt32BE(20),
  }
}

for (const aulaId of pilotLessonIds) {
  const slides = mockSlides[aulaId] ?? []

  assert.equal(slides.length, 5, `${aulaId} deve ter 5 slides no piloto M03`)

  slides.forEach((slide, index) => {
    assert.equal(slide.ordem, index + 1)
    assert.ok(slide.titulo.length >= 3)
    assert.ok(slide.texto.length >= 45)
    assert.ok(
      slide.imagem_url?.startsWith(`/slides/m03/${aulaId}-`),
      `${slide.titulo} precisa apontar para um infografico do M03`,
    )

    const assetPath = join('public', slide.imagem_url!.replace(/^\//, ''))
    assert.ok(existsSync(assetPath), `${slide.imagem_url} deve existir em public`)
    assert.ok(slide.imagem_url?.endsWith('.png'), `${slide.imagem_url} deve usar PNG exportado`)
    assert.deepEqual(
      getPngSize(assetPath),
      { width: 3840, height: 2160 },
      `${slide.imagem_url} deve ser PNG 4K 16:9`,
    )
  })
}
