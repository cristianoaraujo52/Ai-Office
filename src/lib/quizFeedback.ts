import type { Opcao, Pergunta, Quiz } from '../types'

export interface QuizReviewItem {
  pergunta: Pergunta
  selectedOption?: Opcao
  correctOption?: Opcao
  isCorrect: boolean
  explanation: string
}

export interface QuizReview {
  items: QuizReviewItem[]
  correctCount: number
  total: number
  score: number
  summary: string
}

function optionLabel(option?: Opcao) {
  if (!option) return 'nenhuma alternativa'
  return `${option.id.toUpperCase()}) ${option.texto}`
}

function buildExplanation(isCorrect: boolean, selected?: Opcao, correct?: Opcao) {
  if (isCorrect) {
    return `Voce acertou porque a alternativa ${optionLabel(correct)} representa a ideia principal da pergunta.`
  }

  return `A resposta correta e ${optionLabel(correct)}. Compare com a sua escolha (${optionLabel(selected)}) e repare na palavra-chave que muda o sentido.`
}

export function buildQuizReview(quiz: Quiz, answers: Record<string, string>): QuizReview {
  const items = quiz.perguntas.map(pergunta => {
    const selectedOption = pergunta.opcoes.find(op => op.id === answers[pergunta.id])
    const correctOption = pergunta.opcoes.find(op => op.id === pergunta.resposta_correta)
    const isCorrect = selectedOption?.id === correctOption?.id

    return {
      pergunta,
      selectedOption,
      correctOption,
      isCorrect,
      explanation: buildExplanation(isCorrect, selectedOption, correctOption),
    }
  })

  const correctCount = items.filter(item => item.isCorrect).length
  const total = quiz.perguntas.length
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0
  const summary = `Voce acertou ${correctCount} de ${total} pergunta${total === 1 ? '' : 's'}.`

  return { items, correctCount, total, score, summary }
}

