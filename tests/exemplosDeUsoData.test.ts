import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { exemplosDeUso } from '../src/data/exemplosDeUso'

assert.equal(exemplosDeUso.length, 28)

for (const ferramenta of ['chatgpt', 'gemini', 'copilot', 'claude']) {
  assert.equal(
    exemplosDeUso.filter(exemplo => exemplo.ferramenta === ferramenta).length,
    7,
    `${ferramenta} deve ter exatamente 7 exemplos`,
  )
}

assert.equal(new Set(exemplosDeUso.map(exemplo => exemplo.id)).size, 28)
assert.equal(new Set(exemplosDeUso.map(exemplo => exemplo.imagem)).size, 28)

for (const exemplo of exemplosDeUso) {
  assert.ok(exemplo.titulo.trim().length >= 8, `${exemplo.id}: título ausente`)
  assert.ok(exemplo.tarefa.trim().length >= 30, `${exemplo.id}: tarefa pouco explicada`)
  assert.ok(exemplo.porqueEstaFerramenta.trim().length >= 30, `${exemplo.id}: justificativa ausente`)
  assert.ok(exemplo.passos.length >= 4, `${exemplo.id}: precisa de quatro passos`)
  assert.ok(exemplo.prompt.trim().length >= 180, `${exemplo.id}: prompt precisa ser detalhado`)
  assert.ok(exemplo.personalizar.length >= 3, `${exemplo.id}: campos para personalizar ausentes`)
  assert.ok(exemplo.resultadoEsperado.trim().length >= 30, `${exemplo.id}: resultado esperado ausente`)
  assert.ok(exemplo.conferencia.length >= 3, `${exemplo.id}: conferência insuficiente`)
  assert.ok(exemplo.dica.trim().length >= 20, `${exemplo.id}: dica ausente`)
  assert.ok(exemplo.imagem.endsWith('.png'), `${exemplo.id}: imagem deve ser PNG`)
  assert.ok(
    existsSync(join('public', exemplo.imagem.replace(/^\//, ''))),
    `${exemplo.id}: arquivo ${exemplo.imagem} não encontrado`,
  )
}

