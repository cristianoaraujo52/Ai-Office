export interface User {
  id: string
  email: string
  nome: string
  role: 'admin' | 'aluno'
  avatar_url?: string
  created_at: string
}

export interface Modulo {
  id: string
  titulo: string
  descricao: string
  ordem: number
  carga_horaria: number
  ativo: boolean
  created_at: string
  aulas?: Aula[]
  progresso?: number
  status?: 'locked' | 'in_progress' | 'completed'
  cover_image?: string
}

export interface Aula {
  id: string
  modulo_id: string
  titulo: string
  descricao: string
  conteudo_html: string
  video_url: string
  ordem: number
  duracao_min: number
  ativo: boolean
  created_at: string
  slides?: Slide[]
  materiais?: Material[]
  quiz?: Quiz
  descricao_curta?: string
  objetivo?: string
  passo_a_passo?: string[]
  dicas?: string[]
  erros_comuns?: string[]
  resumo?: string
  exercicio?: string
  narracao?: string
  resumo_audio?: string
  roteiro_video?: string
  atividade_pratica?: string
  video_titulo?: string
  video_canal?: string
  video_duracao?: string
}

export interface Slide {
  id: string
  aula_id: string
  titulo: string
  texto: string
  imagem_url?: string
  ordem: number
}

export interface Material {
  id: string
  aula_id: string
  titulo: string
  tipo: 'pdf' | 'link' | 'video' | 'outro'
  url: string
}

export interface Quiz {
  id: string
  aula_id: string
  titulo: string
  perguntas: Pergunta[]
}

export interface Pergunta {
  id: string
  quiz_id: string
  texto: string
  opcoes: Opcao[]
  resposta_correta: string
  ordem: number
}

export interface Opcao {
  id: string
  texto: string
}

export interface Progresso {
  id: string
  user_id: string
  aula_id: string
  modulo_id: string
  concluida: boolean
  tempo_estudo: number
  quiz_realizado: boolean
  quiz_nota?: number
  updated_at: string
}

export interface Certificado {
  id: string
  user_id: string
  user_nome: string
  curso: string
  carga_horaria: number
  data_conclusao: string
  codigo: string
}

export interface DashboardAdminStats {
  total_alunos: number
  total_modulos: number
  total_aulas: number
  alunos_ativos: number
  progresso_medio: number
}

export interface RespostaAtividade {
  id: string
  user_id: string
  aula_id: string
  resposta: string
  feedback_ia?: string
  created_at: string
}
