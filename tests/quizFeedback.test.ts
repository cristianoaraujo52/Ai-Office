import assert from 'node:assert/strict'
import { buildQuizReview } from '../src/lib/quizFeedback'
import type { Quiz } from '../src/types'

const quiz: Quiz = {
  id: 'q1',
  aula_id: 'a1',
  titulo: 'Quiz de teste',
  perguntas: [
    {
      id: 'p1',
      quiz_id: 'q1',
      texto: 'O que diferencia IA de automacao tradicional?',
      opcoes: [
        { id: 'a', texto: 'Seguir regras fixas.' },
        { id: 'b', texto: 'Aprender com dados e adaptar respostas.' },
      ],
      resposta_correta: 'b',
      ordem: 1,
    },
    {
      id: 'p2',
      quiz_id: 'q1',
      texto: 'Qual e uma boa pratica?',
      opcoes: [
        { id: 'a', texto: 'Revisar a resposta antes de usar.' },
        { id: 'b', texto: 'Copiar sem conferir.' },
      ],
      resposta_correta: 'a',
      ordem: 2,
    },
  ],
}

const review = buildQuizReview(quiz, { p1: 'b', p2: 'b' })

assert.equal(review.score, 50)
assert.equal(review.correctCount, 1)
assert.equal(review.total, 2)
assert.equal(review.items[0].isCorrect, true)
assert.equal(review.items[0].selectedOption?.texto, 'Aprender com dados e adaptar respostas.')
assert.equal(review.items[1].isCorrect, false)
assert.equal(review.items[1].correctOption?.texto, 'Revisar a resposta antes de usar.')
assert.match(review.items[1].explanation, /resposta correta/i)
assert.match(review.summary, /1 de 2/i)

