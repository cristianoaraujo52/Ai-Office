import type { Aula, Quiz, Slide } from '../types'

type RawAula = Omit<Partial<Aula>, 'quiz'> & {
  quizzes?: Quiz | Quiz[] | null
  quiz?: Quiz | null
}

function normalizeQuiz(raw: RawAula): Quiz | undefined {
  if (Array.isArray(raw.quizzes)) return raw.quizzes[0] ?? undefined
  if (raw.quizzes) return raw.quizzes
  return raw.quiz ?? undefined
}

export function normalizeAula(raw: RawAula): Aula {
  const { quizzes: _quizzes, quiz: _quiz, ...aula } = raw

  return {
    ...(aula as Aula),
    quiz: normalizeQuiz(raw),
    slides: [...(raw.slides ?? [])].sort((a: Slide, b: Slide) => a.ordem - b.ordem),
    passo_a_passo: raw.passo_a_passo ?? [],
    dicas: raw.dicas ?? [],
    erros_comuns: raw.erros_comuns ?? [],
  }
}

