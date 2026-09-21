import assert from 'node:assert/strict'
import { normalizeAula } from '../src/lib/normalizeAula'

const aula = normalizeAula({
  id: 'aula-1',
  modulo_id: 'm01',
  titulo: 'Aula com quiz',
  descricao: '',
  conteudo_html: '',
  video_url: '',
  ordem: 1,
  duracao_min: 10,
  ativo: true,
  created_at: '2024-01-01',
  quizzes: {
    id: 'q1',
    aula_id: 'aula-1',
    titulo: 'Quiz da aula',
    perguntas: [
      {
        id: 'p1',
        quiz_id: 'q1',
        texto: 'Pergunta?',
        opcoes: [{ id: 'a', texto: 'Resposta' }],
        resposta_correta: 'a',
        ordem: 1,
      },
    ],
  },
})

assert.equal(aula.quiz?.id, 'q1')
assert.equal(aula.quiz?.perguntas.length, 1)
assert.equal('quizzes' in aula, false)

