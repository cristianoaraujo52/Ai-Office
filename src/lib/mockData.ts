import type { User, Modulo, Aula, Slide, Quiz, Progresso, Pergunta } from '../types'

export const mockUsers: User[] = [
  { id: '1', email: 'admin@iaoffice.com', nome: 'Admin Academy', role: 'admin', created_at: '2024-01-01' },
  { id: '2', email: 'aluno@iaoffice.com', nome: 'João Silva', role: 'aluno', created_at: '2024-01-10' },
  { id: '3', email: 'maria@iaoffice.com', nome: 'Maria Costa', role: 'aluno', created_at: '2024-01-15' },
  { id: '4', email: 'pedro@iaoffice.com', nome: 'Pedro Rocha', role: 'aluno', created_at: '2024-01-20' },
  { id: '5', email: 'ana@iaoffice.com', nome: 'Ana Lima', role: 'aluno', created_at: '2024-01-22' },
]

// ===================== HELPERS =====================

let _slideId = 0
const slide = (aula_id: string, titulo: string, texto: string, ordem: number): Slide => ({
  id: `s${++_slideId}`, aula_id, titulo, texto, ordem,
})

let _qId = 0, _pId = 0
const q = (
  aula_id: string,
  titulo: string,
  perguntas: { texto: string; opcoes: [string, string, string, string]; correta: 'a' | 'b' | 'c' | 'd' }[]
): Quiz => {
  const quiz_id = `q${++_qId}`
  return {
    id: quiz_id,
    aula_id,
    titulo,
    perguntas: perguntas.map<Pergunta>((p, i) => ({
      id: `p${++_pId}`,
      quiz_id,
      texto: p.texto,
      ordem: i + 1,
      resposta_correta: p.correta,
      opcoes: [
        { id: 'a', texto: p.opcoes[0] },
        { id: 'b', texto: p.opcoes[1] },
        { id: 'c', texto: p.opcoes[2] },
        { id: 'd', texto: p.opcoes[3] },
      ],
    })),
  }
}

type AulaInput = Omit<Aula, 'created_at' | 'ativo' | 'modulo_id'> & {
  slidesData?: { titulo: string; texto: string }[]
  quizData?: Parameters<typeof q>[2]
}

function buildAula(modulo_id: string, input: AulaInput): Aula {
  const slides: Slide[] = (input.slidesData || []).map((s, i) =>
    slide(input.id, s.titulo, s.texto, i + 1)
  )
  const quiz: Quiz | undefined = input.quizData
    ? q(input.id, `Quiz: ${input.titulo}`, input.quizData)
    : undefined
  const { slidesData, quizData, ...rest } = input
  return {
    ...rest,
    modulo_id,
    ativo: true,
    created_at: '2024-01-01',
    slides,
    materiais: [],
    quiz,
  }
}

function htmlFromAula(a: {
  objetivo?: string
  explicacao: string
  exemplos?: string[]
  passo_a_passo?: string[]
  dicas?: string[]
  erros_comuns?: string[]
  resumo?: string
  exercicio?: string
}): string {
  const blocks: string[] = []
  if (a.objetivo) blocks.push(`<h3>🎯 Objetivo da aula</h3><p>${a.objetivo}</p>`)
  blocks.push(`<h3>📖 Explicação</h3><div>${a.explicacao}</div>`)
  if (a.exemplos?.length)
    blocks.push(`<h3>💼 Exemplos no escritório</h3><ul>${a.exemplos.map(e => `<li>${e}</li>`).join('')}</ul>`)
  if (a.passo_a_passo?.length)
    blocks.push(`<h3>🪜 Passo a passo</h3><ol>${a.passo_a_passo.map(p => `<li>${p}</li>`).join('')}</ol>`)
  if (a.dicas?.length)
    blocks.push(`<h3>💡 Dicas importantes</h3><ul>${a.dicas.map(d => `<li>${d}</li>`).join('')}</ul>`)
  if (a.erros_comuns?.length)
    blocks.push(`<h3>⚠️ Erros comuns</h3><ul>${a.erros_comuns.map(e => `<li>${e}</li>`).join('')}</ul>`)
  if (a.resumo) blocks.push(`<h3>📌 Resumo final</h3><p>${a.resumo}</p>`)
  if (a.exercicio) blocks.push(`<h3>✏️ Exercício de fixação</h3><p>${a.exercicio}</p>`)
  return blocks.join('')
}

// ===================== MÓDULOS =====================

const M01_aulas: Aula[] = [
  buildAula('m01', {
    id: 'aula-1-1', titulo: 'O que é Inteligência Artificial', ordem: 1, duracao_min: 25,
    descricao: 'Fundamentos e evolução da IA aplicada ao escritório.',
    descricao_curta: 'Entenda o que é IA, sua história e por que ela importa para o profissional moderno.',
    objetivo: 'Compreender o conceito de Inteligência Artificial, sua evolução histórica e seu impacto no ambiente corporativo.',
    video_url: '',
    conteudo_html: htmlFromAula({
      objetivo: 'Compreender o conceito de Inteligência Artificial e por que ela está transformando o trabalho de escritório.',
      explicacao: '<p>Inteligência Artificial (IA) é a área da computação que cria sistemas capazes de executar tarefas que, até pouco tempo, só humanos conseguiam: entender linguagem, reconhecer padrões, tomar decisões e aprender com a experiência.</p><p>Diferente de um programa tradicional — que segue regras fixas escritas por um programador — uma IA <strong>aprende a partir de exemplos</strong>. Quanto mais dados ela vê, melhor ela fica.</p><p>No escritório, a IA aparece de três formas práticas: como <strong>assistente</strong> (ChatGPT, Copilot), como <strong>automação inteligente</strong> (e-mails classificados sozinhos) e como <strong>análise de dados</strong> (gráficos e insights gerados a partir de planilhas).</p>',
      exemplos: [
        'Você cola um e-mail confuso no ChatGPT e ele devolve um resumo em 3 linhas.',
        'O Outlook sugere uma resposta pronta com base no histórico da conversa.',
        'O Excel cria automaticamente um gráfico ao identificar tendências na sua planilha.',
      ],
      passo_a_passo: [
        'Identifique uma tarefa repetitiva que você faz toda semana.',
        'Pergunte: "Essa tarefa exige criatividade ou só repetição?"',
        'Se for repetitiva, anote como candidata a ser auxiliada por IA.',
        'Escolha uma ferramenta gratuita (ChatGPT, por exemplo) e teste com ela.',
      ],
      dicas: [
        'IA não é mágica — ela acerta mais quando você dá contexto claro.',
        'Comece pequeno: use IA em uma tarefa por dia até virar hábito.',
        'Sempre revise a saída da IA antes de enviar para outra pessoa.',
      ],
      erros_comuns: [
        'Achar que a IA "sabe tudo" — ela inventa quando não tem certeza.',
        'Colar informações confidenciais sem critério (sigilo de cliente, salários).',
        'Aceitar a primeira resposta sem refinar o pedido.',
      ],
      resumo: 'IA é um sistema que aprende com dados para executar tarefas cognitivas. No escritório, ela atua como assistente, automatizador e analista — sempre sob supervisão humana.',
      exercicio: 'Liste 5 tarefas que você fez na última semana. Marque com 🤖 as que poderiam ser feitas (ou auxiliadas) por IA. Compartilhe com um colega.',
    }),
    narracao: 'Olá! Bem-vindo à primeira aula do nosso curso. Hoje vamos descobrir juntos o que é Inteligência Artificial. Imagine um assistente que aprende com você, entende contexto e nunca dorme. É exatamente isso que a IA traz para o seu dia a dia. Vamos começar essa jornada?',
    resumo_audio: 'Resumo em áudio: IA é tecnologia que aprende com dados. No escritório, serve como assistente, automatizador e analista. Sempre revise as respostas antes de usar.',
    roteiro_video: 'Cena 1 (0–20s): Apresentação do instrutor e título da aula. Cena 2 (20–90s): Animação mostrando "computador antigo seguindo regras" vs "IA aprendendo". Cena 3 (90–180s): Três exemplos práticos no escritório. Cena 4 (180–240s): Mitos da IA. Cena 5 (240–300s): Call to action: "Pratique com ChatGPT hoje".',
    atividade_pratica: 'Abra o ChatGPT (ou outra ferramenta) e peça: "Liste 5 maneiras de eu usar IA na minha rotina como [seu cargo]". Imprima ou salve a resposta. Escolha uma das 5 sugestões para testar amanhã.',
    slidesData: [
      { titulo: 'O que é IA?', texto: 'Sistemas que aprendem com dados para realizar tarefas cognitivas — entender, decidir, criar.' },
      { titulo: 'IA × Automação tradicional', texto: 'Automação: segue regras fixas.\nIA: aprende e se adapta a situações novas.' },
      { titulo: '3 formas no escritório', texto: '• Assistente (ChatGPT, Copilot)\n• Automação inteligente (classificação)\n• Análise de dados (insights)' },
      { titulo: 'O que NÃO esperar da IA', texto: 'Ela não pensa como humano.\nElа não sabe tudo.\nElа pode inventar (alucinar).\nSempre revise.' },
      { titulo: 'Resumo', texto: 'IA é parceira, não substituta. Use com contexto, revise e cuide com dados sigilosos.' },
    ],
    quizData: [
      {
        texto: 'O que diferencia a IA de uma automação tradicional?',
        opcoes: [
          'A IA é mais rápida em execução.',
          'A IA aprende com dados e se adapta a situações novas, a automação segue regras fixas.',
          'A IA só funciona em nuvem.',
          'A IA precisa sempre de internet.',
        ], correta: 'b',
      },
      {
        texto: 'Qual é uma boa prática ao usar IA no trabalho?',
        opcoes: [
          'Colar dados confidenciais sem revisar.',
          'Aceitar a primeira resposta sem refinar.',
          'Revisar a saída antes de compartilhar com outras pessoas.',
          'Usar IA apenas em tarefas criativas.',
        ], correta: 'c',
      },
      {
        texto: 'Qual destes NÃO é exemplo típico de IA no escritório?',
        opcoes: [
          'Resumo automático de e-mail.',
          'Sugestão de resposta no Outlook.',
          'Cálculo simples de SOMA no Excel.',
          'Análise automática de tendências em dados.',
        ], correta: 'c',
      },
    ],
  }),
  buildAula('m01', {
    id: 'aula-1-2', titulo: 'IA no Cotidiano', ordem: 2, duracao_min: 20,
    descricao: 'Como a IA já faz parte da nossa vida diária e profissional.',
    descricao_curta: 'Reconheça a IA que você já usa todos os dias sem perceber.',
    objetivo: 'Identificar exemplos de IA presentes na rotina pessoal e profissional.',
    video_url: '',
    conteudo_html: htmlFromAula({
      objetivo: 'Reconhecer onde a IA já está presente no seu dia a dia, dentro e fora do escritório.',
      explicacao: '<p>Muito antes do ChatGPT, a IA já estava ao seu redor: no GPS que recalcula a rota, no streaming que recomenda séries, no banco que detecta fraudes em milissegundos.</p><p>No trabalho, ela aparece em ferramentas que você já usa: o Outlook prioriza e-mails importantes, o Teams gera resumo de reunião, o Excel sugere gráficos. A diferença agora é que <strong>você pode comandar a IA diretamente</strong> em vez de só usar o que ela faz nos bastidores.</p>',
      exemplos: [
        'GPS do Waze recalcula a rota com base no trânsito em tempo real.',
        'Outlook coloca e-mails importantes acima dos promocionais.',
        'Teams gera transcrição e ata da reunião automaticamente.',
        'Banco bloqueia uma compra suspeita antes de você perceber.',
      ],
      dicas: [
        'Observe um dia inteiro: liste tudo que a IA já decide por você.',
        'Procure no Office o ícone do Copilot — provavelmente já está disponível.',
        'Experimente o "modo IA" de ferramentas que você já usa antes de migrar para outras.',
      ],
      erros_comuns: [
        'Confundir "tem botão automático" com "tem IA".',
        'Não revisar o que a IA classifica como spam — perde mensagens importantes.',
      ],
      resumo: 'A IA já está em quase tudo que usamos. Reconhecê-la é o primeiro passo para usá-la com intenção.',
      exercicio: 'Faça uma lista de 10 ferramentas que você usa por dia. Ao lado de cada uma, marque um ✅ se ela já tem IA embutida.',
    }),
    narracao: 'Nesta aula, vamos abrir os olhos. A IA não está só no futuro — ela está no seu celular, no seu e-mail, no GPS da sua viagem para casa. Vem comigo descobrir.',
    resumo_audio: 'A IA já faz parte da rotina: GPS, e-mail, streaming, antifraude. Aprender a comandá-la diretamente é o próximo passo.',
    roteiro_video: 'Mostrar 5 ferramentas do dia a dia (GPS, Netflix, Outlook, banco, fotos do celular) e destacar onde a IA atua em cada uma.',
    atividade_pratica: 'Tire prints de 3 lugares onde você encontra IA no seu trabalho. Compartilhe no grupo do curso.',
    slidesData: [
      { titulo: 'A IA já está aqui', texto: 'Você usa IA o dia todo — só não percebe.' },
      { titulo: 'Em casa', texto: '• Netflix recomenda séries\n• GPS recalcula rota\n• Câmera reconhece rostos' },
      { titulo: 'No escritório', texto: '• Outlook prioriza e-mails\n• Teams transcreve reuniões\n• Excel sugere gráficos' },
      { titulo: 'O salto agora', texto: 'Antes a IA agia nos bastidores. Agora você pode comandá-la.' },
    ],
    quizData: [
      {
        texto: 'Qual destes é exemplo de IA no cotidiano?',
        opcoes: ['Calculadora de bolso.', 'Recomendação de séries da Netflix.', 'Caneta esferográfica.', 'Cafeteira com botão.'],
        correta: 'b',
      },
      {
        texto: 'O Copilot do Office é uma IA usada para...',
        opcoes: ['Substituir o usuário.', 'Apenas corrigir ortografia.', 'Auxiliar em escrita, análise e criação de conteúdo.', 'Apenas formatar documentos.'],
        correta: 'c',
      },
      {
        texto: 'Por que reconhecer a IA ao redor importa?',
        opcoes: ['Para temê-la mais.', 'Para usá-la com intenção e tirar mais valor dela.', 'Para desativá-la em todas as ferramentas.', 'Para ignorá-la.'],
        correta: 'b',
      },
    ],
  }),
  buildAula('m01', {
    id: 'aula-1-3', titulo: 'IA vs Automação', ordem: 3, duracao_min: 18,
    descricao: 'Entenda as diferenças fundamentais entre automação tradicional e IA.',
    descricao_curta: 'Quando usar automação simples e quando usar IA — e por quê.',
    objetivo: 'Distinguir automação tradicional de IA e decidir qual aplicar em cada situação.',
    video_url: '',
    conteudo_html: htmlFromAula({
      objetivo: 'Saber escolher entre automação tradicional e IA dependendo do problema.',
      explicacao: '<p>Automação tradicional é uma <strong>receita</strong>: "se chegar e-mail do fornecedor X, mova para a pasta Compras". Funciona perfeitamente quando o cenário é previsível.</p><p>IA é um <strong>cozinheiro que aprendeu mil receitas</strong>: você pede "organize meus e-mails por urgência" e ela decide caso a caso.</p><p>Use automação para regras estáveis. Use IA quando o contexto muda ou exige interpretação.</p>',
      exemplos: [
        'Automação: nota fiscal recebida → arquiva na pasta do mês.',
        'IA: e-mails de clientes → classifica em urgentes, dúvidas, reclamações.',
        'Híbrido: IA categoriza, automação envia para o departamento certo.',
      ],
      dicas: [
        'Comece automatizando o que tem regra clara. IA depois.',
        'Junte as duas: IA decide, automação executa.',
        'Documente cada fluxo para revisar depois.',
      ],
      erros_comuns: [
        'Usar IA onde uma fórmula simples resolveria.',
        'Usar regra fixa onde o contexto muda toda hora.',
        'Não medir o tempo economizado.',
      ],
      resumo: 'Automação resolve o previsível; IA resolve o ambíguo. O melhor resultado vem da combinação dos dois.',
      exercicio: 'Pegue um processo seu e divida em 3 colunas: passos automatizáveis, passos com IA, passos que continuam humanos.',
    }),
    narracao: 'Automação ou IA? Nem sempre a IA é a melhor escolha. Hoje você aprende a decidir entre elas.',
    resumo_audio: 'Automação é regra fixa. IA é decisão adaptativa. Combine os dois para máxima eficiência.',
    roteiro_video: 'Apresentar um fluxo de e-mails: parte fixa (filtro) vs parte interpretativa (urgência). Mostrar economia de tempo.',
    atividade_pratica: 'Escolha um processo do seu setor e desenhe um fluxograma indicando o que é regra fixa e o que precisa de interpretação.',
    slidesData: [
      { titulo: 'Automação', texto: 'Segue receita.\nResultado igual sempre.\nIdeal para regras claras.' },
      { titulo: 'Inteligência Artificial', texto: 'Interpreta contexto.\nDecide caso a caso.\nIdeal para situações variáveis.' },
      { titulo: 'Modelo híbrido', texto: 'IA decide → Automação executa.\nO melhor dos dois mundos.' },
      { titulo: 'Resumo', texto: 'Use a ferramenta certa para o problema certo.' },
    ],
    quizData: [
      {
        texto: 'Qual cenário é IDEAL para automação tradicional?',
        opcoes: [
          'Classificar emoções em mensagens de clientes.',
          'Mover toda nota fiscal recebida para uma pasta padrão.',
          'Resumir reuniões longas.',
          'Identificar sentimento em pesquisas.',
        ], correta: 'b',
      },
      {
        texto: 'Qual cenário é IDEAL para IA?',
        opcoes: [
          'Renomear arquivos seguindo um padrão fixo.',
          'Calcular soma de uma coluna.',
          'Resumir reuniões de 1 hora em 5 linhas.',
          'Enviar e-mail toda segunda-feira às 9h.',
        ], correta: 'c',
      },
      {
        texto: 'Qual é o modelo híbrido recomendado?',
        opcoes: [
          'IA decide e Automação executa.',
          'Automação decide e IA executa.',
          'Só usar IA.',
          'Só usar Automação.',
        ], correta: 'a',
      },
    ],
  }),
]

const M02_aulas: Aula[] = [
  buildAula('m02', {
    id: 'aula-2-1', titulo: 'Machine Learning', ordem: 1, duracao_min: 30,
    descricao: 'Entenda como as máquinas aprendem com dados.',
    descricao_curta: 'O conceito por trás da IA: aprender com exemplos em vez de seguir regras.',
    objetivo: 'Compreender o que é Machine Learning e seus principais tipos.',
    video_url: '',
    conteudo_html: htmlFromAula({
      objetivo: 'Entender o funcionamento básico do Machine Learning.',
      explicacao: '<p>Machine Learning (ML) é o motor da IA moderna. Em vez de programar regras manualmente, você dá <strong>exemplos</strong> ao computador e ele descobre o padrão sozinho.</p><p>Existem 3 tipos principais:</p><ul><li><strong>Supervisionado:</strong> aprende com exemplos rotulados ("isso é spam, isso não é").</li><li><strong>Não-supervisionado:</strong> encontra padrões sem rótulos (agrupar clientes parecidos).</li><li><strong>Por reforço:</strong> aprende por tentativa e erro (jogos, robótica).</li></ul>',
      exemplos: [
        'Filtro de spam aprende com cada e-mail marcado por você.',
        'Sistema de RH agrupa currículos similares automaticamente.',
        'Assistente de vendas prevê fechamento com base em histórico.',
      ],
      dicas: [
        'Quanto mais dados de qualidade, melhor o resultado.',
        'Dados ruins → resultado ruim. Sempre.',
        'Você não precisa programar ML para usá-lo — basta usar ferramentas que já o aplicam.',
      ],
      erros_comuns: [
        'Confiar 100% em previsões sem entender de onde vieram.',
        'Usar dados enviesados (que favorecem um grupo).',
      ],
      resumo: 'Machine Learning é o coração da IA: aprender com dados em vez de regras. Quanto mais bons exemplos, melhor.',
      exercicio: 'Pense em uma decisão repetitiva do seu trabalho. Se você desse 1000 exemplos a um computador, ele conseguiria prever a próxima?',
    }),
    narracao: 'Hoje começamos a entender o motor por trás da IA: o Machine Learning. Prepare-se — é mais simples do que parece.',
    resumo_audio: 'ML é aprender com exemplos. Três tipos: supervisionado, não-supervisionado e reforço.',
    roteiro_video: 'Animação: criança aprendendo a identificar frutas vs. computador aprendendo a identificar gatos. Mostrar os três tipos com exemplos.',
    atividade_pratica: 'Escolha uma tarefa do seu trabalho. Liste 10 exemplos que você usaria para "ensinar" um computador a fazê-la.',
    slidesData: [
      { titulo: 'Machine Learning', texto: 'Aprender com exemplos, não com regras.' },
      { titulo: 'Supervisionado', texto: 'Exemplos rotulados.\nIA aprende a classificar.' },
      { titulo: 'Não-supervisionado', texto: 'Encontra padrões em dados brutos.\nÚtil para descobertas.' },
      { titulo: 'Por reforço', texto: 'Aprende por tentativa e erro.\nUsado em jogos e robótica.' },
      { titulo: 'Dado é tudo', texto: 'Dado bom → IA boa.\nDado ruim → IA ruim.' },
    ],
    quizData: [
      {
        texto: 'O que é Machine Learning?',
        opcoes: ['Programação tradicional rápida.', 'Sistemas que aprendem a partir de dados.', 'Robôs físicos.', 'Internet das coisas.'],
        correta: 'b',
      },
      {
        texto: 'Aprendizado supervisionado precisa de...',
        opcoes: ['Nenhum dado.', 'Dados rotulados.', 'Apenas reforços.', 'Apenas regras.'],
        correta: 'b',
      },
      {
        texto: 'Qual é o maior risco do ML?',
        opcoes: ['Não ter internet.', 'Usar dados enviesados que reproduzem injustiças.', 'Consumir muita bateria.', 'Não rodar offline.'],
        correta: 'b',
      },
    ],
  }),
  buildAula('m02', {
    id: 'aula-2-2', titulo: 'Deep Learning e Redes Neurais', ordem: 2, duracao_min: 35,
    descricao: 'As redes neurais artificiais que potencializam a IA moderna.',
    descricao_curta: 'O que está por trás de reconhecer imagens, traduzir línguas e gerar texto.',
    objetivo: 'Entender o conceito de redes neurais e Deep Learning de forma intuitiva.',
    video_url: '',
    conteudo_html: htmlFromAula({
      objetivo: 'Compreender, sem matemática, o que são redes neurais e Deep Learning.',
      explicacao: '<p>Uma rede neural é inspirada no cérebro: camadas de "neurônios" artificiais que recebem informação, processam e passam adiante.</p><p>Deep Learning ("aprendizado profundo") é simplesmente uma rede neural com <strong>muitas camadas</strong>. Quanto mais camadas, mais sofisticados os padrões que ela consegue capturar.</p><p>É o que permite o ChatGPT entender contexto, o Google Translate traduzir nuances e o seu celular reconhecer seu rosto.</p>',
      exemplos: [
        'Reconhecimento facial do celular.',
        'Tradução automática preservando o tom.',
        'Geração de texto coerente em parágrafos longos.',
      ],
      dicas: [
        'Mais camadas ≠ sempre melhor. Custo computacional explode.',
        'Modelos pré-treinados são acessíveis: você não precisa treinar do zero.',
      ],
      erros_comuns: [
        'Achar que Deep Learning é "consciência".',
        'Misturar Deep Learning com IA Geral (AGI).',
      ],
      resumo: 'Deep Learning é uma rede neural com muitas camadas. É a tecnologia por trás dos avanços recentes mais impressionantes.',
      exercicio: 'Em uma frase, explique para um colega o que é Deep Learning sem usar a palavra "neurônio".',
    }),
    narracao: 'Redes neurais parecem complicadas — mas você vai sair desta aula explicando para a família.',
    resumo_audio: 'Deep Learning são redes neurais com muitas camadas. É o motor do ChatGPT, da tradução automática e do reconhecimento facial.',
    roteiro_video: 'Animação de neurônios artificiais em camadas processando uma imagem de gato. Mostrar como cada camada captura algo diferente.',
    atividade_pratica: 'Use o Google Translate em 3 frases idiomáticas em português → inglês. Avalie a tradução.',
    slidesData: [
      { titulo: 'Rede neural', texto: 'Camadas de "neurônios" que processam informação.' },
      { titulo: 'Deep = muitas camadas', texto: 'Mais profundidade = padrões mais ricos.' },
      { titulo: 'Onde aparece', texto: 'ChatGPT, tradutor, reconhecimento facial.' },
      { titulo: 'Limites', texto: 'Não é consciência. Não é AGI. É estatística sofisticada.' },
    ],
    quizData: [
      {
        texto: 'O que torna o Deep Learning "deep"?',
        opcoes: ['Muito dado.', 'Muitas camadas na rede neural.', 'Muita memória RAM.', 'Muita internet.'],
        correta: 'b',
      },
      {
        texto: 'Qual destes NÃO é Deep Learning?',
        opcoes: ['ChatGPT.', 'Reconhecimento facial.', 'Calculadora científica.', 'Tradutor automático.'],
        correta: 'c',
      },
      {
        texto: 'Deep Learning é o mesmo que consciência artificial?',
        opcoes: ['Sim.', 'Não — é apenas estatística sofisticada.', 'Sim, em modelos grandes.', 'Sim, quando online.'],
        correta: 'b',
      },
    ],
  }),
  buildAula('m02', {
    id: 'aula-2-3', titulo: 'IA Generativa e LLMs', ordem: 3, duracao_min: 40,
    descricao: 'Os modelos que criaram o ChatGPT, Claude e Gemini.',
    descricao_curta: 'O salto que trouxe a IA para o seu dia a dia: modelos que geram texto, imagem e código.',
    objetivo: 'Entender o que são LLMs (Modelos de Linguagem Grandes) e como diferem de IAs anteriores.',
    video_url: '',
    conteudo_html: htmlFromAula({
      objetivo: 'Compreender a IA Generativa e os LLMs por trás do ChatGPT, Claude e Gemini.',
      explicacao: '<p>IA Generativa é capaz de <strong>criar conteúdo novo</strong>: texto, imagem, código, áudio. Diferente de IAs anteriores que apenas classificavam ou previam.</p><p>LLMs (Large Language Models) foram treinados em bilhões de textos e aprenderam a prever a próxima palavra com tanta precisão que parecem entender o que escrevem.</p><p>São eles que dão vida ao <strong>ChatGPT</strong>, <strong>Claude</strong>, <strong>Gemini</strong> e <strong>Copilot</strong>.</p>',
      exemplos: [
        'Escrever um e-mail com tom adequado a partir de bullets.',
        'Gerar uma imagem para a apresentação.',
        'Resumir um PDF de 50 páginas em 1 página.',
      ],
      passo_a_passo: [
        'Escolha uma ferramenta (ChatGPT, Claude ou Gemini).',
        'Dê contexto claro: quem você é, o que precisa, para quem.',
        'Refine com instruções específicas até o resultado servir.',
      ],
      dicas: [
        'Quanto melhor o prompt, melhor a saída.',
        'Trate a IA como um estagiário inteligente: precisa de instrução.',
      ],
      erros_comuns: [
        'Achar que tudo é verdade — LLMs podem inventar (alucinação).',
        'Não revisar antes de publicar.',
      ],
      resumo: 'LLMs são a tecnologia por trás dos chatbots modernos. Geram conteúdo novo, mas precisam de supervisão.',
      exercicio: 'Peça ao ChatGPT que escreva um e-mail para seu chefe pedindo 2 dias de folga, com tom respeitoso. Refine 2 vezes.',
    }),
    narracao: 'A IA Generativa mudou tudo. Hoje você aprende por que ela é a estrela do momento.',
    resumo_audio: 'LLMs geram texto novo a partir de bilhões de exemplos. ChatGPT, Claude e Gemini são todos LLMs.',
    roteiro_video: 'Demo ao vivo: pedir um e-mail e um resumo. Mostrar refinamento de prompt em 3 iterações.',
    atividade_pratica: 'Escreva um e-mail profissional com a ajuda do ChatGPT em menos de 2 minutos.',
    slidesData: [
      { titulo: 'IA Generativa', texto: 'Cria conteúdo novo: texto, imagem, código.' },
      { titulo: 'LLM', texto: 'Modelo de Linguagem Grande, treinado em bilhões de textos.' },
      { titulo: 'Ferramentas', texto: 'ChatGPT • Claude • Gemini • Copilot' },
      { titulo: 'Cuidado', texto: 'Alucinação: pode inventar. Sempre revise.' },
      { titulo: 'Boa prática', texto: 'Trate como estagiário: contexto + instrução + revisão.' },
    ],
    quizData: [
      {
        texto: 'O que LLM significa?',
        opcoes: ['Last Language Module.', 'Large Language Model.', 'Light Learning Machine.', 'Logic Language Mapper.'],
        correta: 'b',
      },
      {
        texto: 'Alucinação em LLM significa...',
        opcoes: ['Travar o computador.', 'Inventar informação que parece correta.', 'Recusar responder.', 'Apagar dados.'],
        correta: 'b',
      },
      {
        texto: 'Qual destes NÃO é um LLM?',
        opcoes: ['ChatGPT.', 'Claude.', 'Excel.', 'Gemini.'],
        correta: 'c',
      },
    ],
  }),
]

// Helper for shorter aulas without full structure (para módulos seguintes — qualidade média)
function quickAula(modulo_id: string, opts: {
  id: string
  titulo: string
  ordem: number
  duracao_min: number
  descricao: string
  objetivo: string
  explicacao: string
  exemplos: string[]
  dicas: string[]
  erros: string[]
  resumo: string
  exercicio: string
  narracao: string
  slides: { titulo: string; texto: string }[]
  quiz: Parameters<typeof q>[2]
}): Aula {
  return buildAula(modulo_id, {
    id: opts.id,
    titulo: opts.titulo,
    ordem: opts.ordem,
    duracao_min: opts.duracao_min,
    descricao: opts.descricao,
    descricao_curta: opts.descricao,
    objetivo: opts.objetivo,
    video_url: '',
    conteudo_html: htmlFromAula({
      objetivo: opts.objetivo,
      explicacao: `<p>${opts.explicacao}</p>`,
      exemplos: opts.exemplos,
      dicas: opts.dicas,
      erros_comuns: opts.erros,
      resumo: opts.resumo,
      exercicio: opts.exercicio,
    }),
    narracao: opts.narracao,
    resumo_audio: opts.resumo,
    roteiro_video: `Apresentar ${opts.titulo}: contexto, exemplos práticos no escritório, dicas e chamada para prática.`,
    atividade_pratica: opts.exercicio,
    slidesData: opts.slides,
    quizData: opts.quiz,
  })
}

const M03_aulas: Aula[] = [
  quickAula('m03', {
    id: 'aula-3-1', titulo: 'ChatGPT na Prática', ordem: 1, duracao_min: 25,
    descricao: 'Como usar o ChatGPT para produtividade no trabalho.',
    objetivo: 'Aplicar o ChatGPT em tarefas reais do escritório.',
    explicacao: 'O ChatGPT é a IA generativa mais popular do mundo, criada pela OpenAI. Funciona como um assistente de conversação capaz de escrever, resumir, traduzir, analisar e brainstormar. A versão gratuita já resolve 80% das demandas do escritório.',
    exemplos: [
      'Resumir um e-mail longo em 3 bullets.',
      'Gerar pauta de reunião a partir de objetivos.',
      'Traduzir documentos com tom profissional.',
    ],
    dicas: [
      'Use o modelo mais recente sempre que possível.',
      'Salve seus prompts favoritos em um documento.',
      'Crie uma "GPT customizado" para tarefas recorrentes.',
    ],
    erros: [
      'Esquecer que ele não conhece dados internos da sua empresa.',
      'Confiar em datas, números ou fatos sem checar.',
    ],
    resumo: 'ChatGPT é o canivete suíço da IA generativa para o escritório. Use com intenção e revise sempre.',
    exercicio: 'Use o ChatGPT para reescrever um e-mail seu em 3 tons: formal, amigável e direto.',
    narracao: 'O ChatGPT virou rotina em milhões de escritórios. Nesta aula você aprende a tirar o máximo dele em minutos.',
    slides: [
      { titulo: 'ChatGPT', texto: 'Assistente conversacional da OpenAI.' },
      { titulo: 'O que ele faz bem', texto: 'Escrever, resumir, traduzir, analisar texto, brainstorm.' },
      { titulo: 'O que ele NÃO sabe', texto: 'Seus arquivos internos.\nEventos muito recentes.\nNúmeros sem fonte.' },
      { titulo: 'Truque ouro', texto: 'Dê contexto + papel + objetivo + restrições.' },
    ],
    quiz: [
      {
        texto: 'O ChatGPT é de qual empresa?',
        opcoes: ['Google.', 'OpenAI.', 'Microsoft.', 'Anthropic.'], correta: 'b',
      },
      {
        texto: 'O que ChatGPT NÃO consegue acessar sozinho?',
        opcoes: ['Linguagem natural.', 'Seus arquivos internos da empresa.', 'Texto colado por você.', 'Português brasileiro.'], correta: 'b',
      },
      {
        texto: 'O que sempre devemos fazer com a resposta do ChatGPT?',
        opcoes: ['Aceitar sem revisar.', 'Compartilhar imediatamente.', 'Revisar antes de enviar.', 'Ignorar.'], correta: 'c',
      },
    ],
  }),
  quickAula('m03', {
    id: 'aula-3-2', titulo: 'Claude e Gemini', ordem: 2, duracao_min: 25,
    descricao: 'Os modelos da Anthropic e Google para o ambiente corporativo.',
    objetivo: 'Comparar Claude e Gemini com o ChatGPT e escolher a ferramenta certa.',
    explicacao: 'Claude (Anthropic) é conhecido por respostas mais cuidadosas, longas e bem estruturadas. Gemini (Google) integra com o Workspace e tem acesso à internet em tempo real. Cada um brilha em um cenário.',
    exemplos: [
      'Claude: análise longa de contrato.',
      'Gemini: pesquisa rápida com dados atualizados.',
      'ChatGPT: criação de conteúdo de marketing.',
    ],
    dicas: [
      'Teste o mesmo prompt nas 3 e compare.',
      'Para textos longos, Claude costuma se sair melhor.',
      'Para integração com Gmail/Docs, Gemini é nativo.',
    ],
    erros: [
      'Achar que todos são iguais.',
      'Não testar antes de pagar pela versão Pro.',
    ],
    resumo: 'Claude e Gemini são fortes alternativas ao ChatGPT. Cada um tem força em um cenário.',
    exercicio: 'Faça o mesmo prompt nos 3 (versões gratuitas) e compare estilo, profundidade e velocidade.',
    narracao: 'O ChatGPT não está sozinho. Hoje você conhece os concorrentes — e por que vale ter mais de um.',
    slides: [
      { titulo: 'Claude (Anthropic)', texto: 'Respostas longas, cuidadosas, bem estruturadas.' },
      { titulo: 'Gemini (Google)', texto: 'Integração com Workspace.\nAcesso à internet em tempo real.' },
      { titulo: 'Quando usar cada um', texto: 'Claude: análises longas.\nGemini: pesquisa atualizada.\nChatGPT: versatilidade.' },
    ],
    quiz: [
      { texto: 'Claude é desenvolvido por qual empresa?', opcoes: ['Google.', 'Anthropic.', 'OpenAI.', 'Microsoft.'], correta: 'b' },
      { texto: 'Qual modelo integra nativamente com Google Docs?', opcoes: ['Claude.', 'Gemini.', 'ChatGPT.', 'Perplexity.'], correta: 'b' },
      { texto: 'Qual é o melhor uso para Claude?', opcoes: ['Pesquisa rápida.', 'Análises longas e bem estruturadas.', 'Geração de imagem.', 'Jogos.'], correta: 'b' },
    ],
  }),
  quickAula('m03', {
    id: 'aula-3-3', titulo: 'Microsoft Copilot', ordem: 3, duracao_min: 20,
    descricao: 'O assistente de IA do Microsoft 365.',
    objetivo: 'Usar o Copilot dentro de Word, Excel, Outlook e Teams.',
    explicacao: 'Copilot é a IA da Microsoft integrada ao Office 365. Funciona dentro dos seus arquivos: lê o Word, analisa o Excel, resume o Teams. É a IA com mais contexto corporativo nativo.',
    exemplos: [
      'No Word: "reescreva este parágrafo de forma mais formal".',
      'No Excel: "crie um gráfico que mostre a tendência destes dados".',
      'No Teams: "resuma a reunião e liste os próximos passos".',
    ],
    dicas: [
      'Verifique se sua empresa tem licença antes de usar.',
      'Funciona melhor quando o arquivo está bem estruturado.',
    ],
    erros: [
      'Esperar que ele substitua você — ele assiste.',
      'Não revisar as alterações.',
    ],
    resumo: 'Copilot é a IA mais integrada ao Office. Domine-o e seu Office vira um superpoder.',
    exercicio: 'No Word, peça ao Copilot para resumir um documento longo em 5 bullets.',
    narracao: 'Se você vive no Office, o Copilot é seu novo melhor amigo. Vem com a Microsoft, mora dentro dos seus arquivos.',
    slides: [
      { titulo: 'Copilot', texto: 'IA da Microsoft integrada ao Office 365.' },
      { titulo: 'Onde mora', texto: 'Word • Excel • Outlook • Teams • PowerPoint' },
      { titulo: 'Superpoder', texto: 'Lê o arquivo. Conhece o contexto. Age com você.' },
    ],
    quiz: [
      { texto: 'Copilot é integrado a qual suite?', opcoes: ['Google Workspace.', 'Microsoft 365.', 'Adobe.', 'Slack.'], correta: 'b' },
      { texto: 'Onde o Copilot NÃO está disponível?', opcoes: ['Word.', 'Excel.', 'Photoshop.', 'Teams.'], correta: 'c' },
      { texto: 'O Copilot age sozinho ou em parceria?', opcoes: ['Sozinho.', 'Em parceria com o usuário.', 'Apenas como visualizador.', 'Só em PDFs.'], correta: 'b' },
    ],
  }),
  quickAula('m03', {
    id: 'aula-3-4', titulo: 'Perplexity AI', ordem: 4, duracao_min: 15,
    descricao: 'A IA que pesquisa com fontes citadas.',
    objetivo: 'Usar Perplexity para pesquisas confiáveis com referência.',
    explicacao: 'Perplexity é uma IA de pesquisa: ela responde sua pergunta E mostra as fontes. Ideal para quando você precisa de informação atual e confiável.',
    exemplos: [
      'Pesquisa de mercado com fontes.',
      'Resumo de notícias do setor.',
      'Levantamento de concorrentes.',
    ],
    dicas: [
      'Sempre clique nas fontes — IA pode interpretar errado.',
      'Use no Pro mode para respostas mais profundas.',
    ],
    erros: [
      'Confiar no resumo sem ler as fontes.',
    ],
    resumo: 'Perplexity é o Google + ChatGPT. Pesquisa com IA mostrando referência.',
    exercicio: 'Pesquise "tendências de IA para escritório em 2025" no Perplexity e verifique 3 fontes.',
    narracao: 'Para pesquisar com confiança, Perplexity entrega o que o ChatGPT não pode: fontes citadas.',
    slides: [
      { titulo: 'Perplexity', texto: 'IA + busca + fontes citadas.' },
      { titulo: 'Quando usar', texto: 'Quando precisar de dado atualizado e verificável.' },
      { titulo: 'Cuidado', texto: 'Sempre cheque as fontes antes de citar.' },
    ],
    quiz: [
      { texto: 'O que diferencia Perplexity?', opcoes: ['Gera imagens.', 'Mostra fontes citadas.', 'Roda offline.', 'Só responde em inglês.'], correta: 'b' },
      { texto: 'Qual ação é obrigatória antes de citar uma resposta do Perplexity?', opcoes: ['Compartilhar nas redes.', 'Verificar as fontes.', 'Pagar o Pro.', 'Imprimir.'], correta: 'b' },
      { texto: 'Perplexity é melhor para...', opcoes: ['Brincadeira casual.', 'Pesquisa com referências.', 'Gerar planilhas.', 'Editar vídeo.'], correta: 'b' },
    ],
  }),
]

const M04_aulas: Aula[] = [
  quickAula('m04', {
    id: 'aula-4-1', titulo: 'LGPD e IA', ordem: 1, duracao_min: 25,
    descricao: 'O que a LGPD diz sobre uso de IA com dados pessoais.',
    objetivo: 'Entender as regras da LGPD aplicadas ao uso de IA.',
    explicacao: 'A Lei Geral de Proteção de Dados (LGPD) regula como dados pessoais podem ser coletados, tratados e compartilhados. Quando você usa IA, frequentemente está enviando dados a terceiros — e isso exige cuidado.',
    exemplos: [
      'NÃO cole CPF de cliente no ChatGPT.',
      'NÃO envie planilha de salários sem anonimizar.',
      'PODE colar texto sem dados pessoais.',
    ],
    dicas: [
      'Anonimize antes de enviar (substitua nomes por "Cliente A").',
      'Use ferramentas corporativas com contrato (Copilot empresarial, ChatGPT Enterprise).',
      'Documente decisões automatizadas — a LGPD exige rastreabilidade.',
    ],
    erros: [
      'Colar contrato com dados de cliente em IA pública.',
      'Achar que "ferramenta gratuita" significa "sem responsabilidade".',
    ],
    resumo: 'LGPD vale também para IA. Dado pessoal precisa de cuidado, mesmo (ou principalmente) ao usar IA.',
    exercicio: 'Liste 3 tipos de dado que você manipula e classifique: pode colar / precisa anonimizar / nunca enviar.',
    narracao: 'LGPD e IA caminham juntas. Aprender as regras protege você, o cliente e a empresa.',
    slides: [
      { titulo: 'LGPD em 1 frase', texto: 'Lei que protege dados pessoais no Brasil.' },
      { titulo: 'Regra de ouro', texto: 'Dado pessoal só vai para IA com base legal e cuidado.' },
      { titulo: 'Sinal verde', texto: 'Texto genérico, sem identificadores.' },
      { titulo: 'Sinal vermelho', texto: 'CPF, RG, salário, e-mail nominal, dado médico.' },
    ],
    quiz: [
      { texto: 'O que a LGPD protege?', opcoes: ['Marcas.', 'Dados pessoais.', 'Senhas Wi-Fi.', 'Logotipos.'], correta: 'b' },
      { texto: 'Posso colar CPF de cliente no ChatGPT gratuito?', opcoes: ['Sim, sempre.', 'Não — viola LGPD.', 'Sim, se for só um.', 'Sim, à noite.'], correta: 'b' },
      { texto: 'Qual é uma boa prática?', opcoes: ['Anonimizar antes de enviar.', 'Enviar tudo bruto.', 'Confiar na ferramenta.', 'Ignorar a LGPD.'], correta: 'a' },
    ],
  }),
  quickAula('m04', {
    id: 'aula-4-2', titulo: 'Listas Verde e Vermelha', ordem: 2, duracao_min: 20,
    descricao: 'O que você pode e o que não pode colar em IAs externas.',
    objetivo: 'Memorizar a lista verde (livre) e vermelha (proibido) de dados.',
    explicacao: 'Para acelerar decisões no dia a dia, use uma régua simples: lista verde = pode; lista vermelha = nunca. Em dúvida, classifique como vermelha.',
    exemplos: [
      'Verde: texto público, dúvida conceitual, modelo de e-mail.',
      'Vermelha: CPF, contrato com dados, salário, segredo de cliente.',
    ],
    dicas: [
      'Imprima a régua e cole no monitor.',
      'Tem dúvida? Trate como vermelha.',
    ],
    erros: [
      'Misturar as duas: parte verde + 1 dado vermelho.',
    ],
    resumo: 'Régua simples acelera decisão e protege você.',
    exercicio: 'Crie sua régua personalizada para a sua área de trabalho.',
    narracao: 'Duas listas. Memorize-as. Use-as. Sua reputação agradece.',
    slides: [
      { titulo: 'Lista verde', texto: 'Texto público.\nDúvida conceitual.\nModelo sem dados.' },
      { titulo: 'Lista vermelha', texto: 'CPF, RG, salário.\nDados de cliente.\nSegredo industrial.' },
      { titulo: 'Em dúvida', texto: 'Sempre trate como vermelha.' },
    ],
    quiz: [
      { texto: 'Modelo de e-mail genérico, sem nomes: que lista?', opcoes: ['Verde.', 'Vermelha.', 'Amarela.', 'Nenhuma.'], correta: 'a' },
      { texto: 'Contrato com nome do cliente: que lista?', opcoes: ['Verde.', 'Vermelha.', 'Amarela.', 'Azul.'], correta: 'b' },
      { texto: 'Em dúvida, tratar como?', opcoes: ['Verde.', 'Vermelha.', 'Cinza.', 'Roxa.'], correta: 'b' },
    ],
  }),
  quickAula('m04', {
    id: 'aula-4-3', titulo: 'Boas Práticas de Segurança', ordem: 3, duracao_min: 20,
    descricao: 'Senha forte, 2FA, ferramentas corporativas e revisão humana.',
    objetivo: 'Adotar práticas de segurança ao usar IA no trabalho.',
    explicacao: 'Além da LGPD, é essencial proteger sua conta e os fluxos onde a IA atua. Senha forte, autenticação em dois fatores, contas separadas para uso pessoal e corporativo.',
    exemplos: [
      'Usar gerenciador de senhas.',
      'Ativar 2FA em todas as contas de IA.',
      'Não compartilhar conta com colegas.',
    ],
    dicas: [
      'Revise periodicamente o histórico das suas IAs.',
      'Desative o uso de seus dados para treino quando possível.',
    ],
    erros: [
      'Usar a mesma senha em todas as IAs.',
      'Compartilhar a conta da empresa.',
    ],
    resumo: 'Segurança é hábito. Senha forte, 2FA, conta separada — e revisão constante.',
    exercicio: 'Ative 2FA nas suas contas de IA hoje.',
    narracao: 'Boas práticas evitam dores de cabeça. Hoje é dia de blindar suas contas.',
    slides: [
      { titulo: '4 práticas de ouro', texto: 'Senha forte\n2FA ativo\nConta separada\nRevisão periódica' },
      { titulo: 'Treino de modelo', texto: 'Desative o uso dos seus dados para treino quando puder.' },
    ],
    quiz: [
      { texto: '2FA significa...', opcoes: ['Two Factor Authentication.', 'Fast File Access.', 'Free For All.', 'Full Force Auth.'], correta: 'a' },
      { texto: 'Compartilhar conta corporativa é boa prática?', opcoes: ['Sim.', 'Não.', 'Sim, se forem 2.', 'Sim, no fim do mês.'], correta: 'b' },
      { texto: 'O que reduz risco?', opcoes: ['Senha igual em tudo.', '2FA ativo.', 'Login automático.', 'Nada.'], correta: 'b' },
    ],
  }),
]

const M05_aulas: Aula[] = [
  quickAula('m05', {
    id: 'aula-5-1', titulo: 'O que é Prompt', ordem: 1, duracao_min: 20,
    descricao: 'A arte de pedir bem para a IA.',
    objetivo: 'Entender o que é um prompt e por que ele determina o resultado.',
    explicacao: 'Prompt é a instrução que você dá à IA. Como em qualquer relação, instrução clara = resultado claro. Um prompt ruim culpa a ferramenta; um prompt bom revela todo o seu potencial.',
    exemplos: [
      'Prompt ruim: "escreva um e-mail".',
      'Prompt bom: "escreva um e-mail formal de cobrança ao fornecedor X sobre atraso de 5 dias na entrega do pedido 1234, tom firme mas cordial".',
    ],
    dicas: [
      'Quanto mais contexto, melhor.',
      'Especifique tom, tamanho, público e formato.',
      'Itere: refine até chegar onde quer.',
    ],
    erros: [
      'Esperar que a IA "adivinhe".',
      'Pedir tudo em uma única frase genérica.',
    ],
    resumo: 'Prompt é instrução. Boa instrução, bom resultado.',
    exercicio: 'Pegue um prompt seu de 1 linha e transforme em 5 linhas com contexto.',
    narracao: 'Aprender prompt é aprender a se comunicar com uma nova categoria de assistente.',
    slides: [
      { titulo: 'Prompt', texto: 'Instrução para a IA.' },
      { titulo: 'Receita', texto: 'Contexto + Papel + Objetivo + Restrições + Formato' },
      { titulo: 'Itere', texto: 'Primeiro prompt nunca é o ideal. Refine.' },
    ],
    quiz: [
      { texto: 'Prompt é...', opcoes: ['A IA.', 'A instrução que você dá à IA.', 'O computador.', 'A internet.'], correta: 'b' },
      { texto: 'Bom prompt tem...', opcoes: ['1 palavra.', 'Contexto, papel, objetivo, formato.', 'Apenas emojis.', 'Só sim ou não.'], correta: 'b' },
      { texto: 'O que fazer se o primeiro resultado não serve?', opcoes: ['Desistir.', 'Iterar e refinar.', 'Trocar de ferramenta.', 'Reiniciar o PC.'], correta: 'b' },
    ],
  }),
  quickAula('m05', {
    id: 'aula-5-2', titulo: 'Método CIFE', ordem: 2, duracao_min: 25,
    descricao: 'Contexto, Instrução, Formato, Exemplos — a fórmula universal.',
    objetivo: 'Aplicar o método CIFE para construir prompts profissionais.',
    explicacao: 'CIFE é uma estrutura para escrever prompts: Contexto (quem você é e o cenário), Instrução (o que quer), Formato (como entregar), Exemplos (modelos quando possível). Aplicar essa receita melhora o resultado em 80% dos casos.',
    exemplos: [
      'C: "Sou analista de RH de uma empresa de 200 pessoas." I: "Escreva um e-mail de feedback positivo para um colaborador." F: "3 parágrafos curtos." E: "Modelo: começar com a conquista, dar exemplo concreto, fechar com incentivo."',
    ],
    dicas: [
      'Sempre comece pelo contexto.',
      'Use exemplos sempre que possível — é o que mais melhora a saída.',
    ],
    erros: [
      'Pular o contexto.',
      'Não especificar formato.',
    ],
    resumo: 'CIFE: Contexto + Instrução + Formato + Exemplos. Aplique sempre.',
    exercicio: 'Reescreva um prompt seu seguindo CIFE rigorosamente.',
    narracao: 'Quatro letras. Uma fórmula. Resultado profissional. Vem aprender o CIFE.',
    slides: [
      { titulo: 'CIFE', texto: 'C: Contexto\nI: Instrução\nF: Formato\nE: Exemplos' },
      { titulo: 'Por quê funciona', texto: 'Reduz ambiguidade e direciona a IA.' },
      { titulo: 'Dica de ouro', texto: 'Exemplos elevam o resultado a outro nível.' },
    ],
    quiz: [
      { texto: 'O que CIFE significa?', opcoes: ['Contexto, Instrução, Formato, Exemplos.', 'Código, Imagem, Fórmula, Email.', 'Cor, Item, Fonte, Estilo.', 'Cliente, Item, Fatura, Entrega.'], correta: 'a' },
      { texto: 'Qual letra do CIFE costuma ser pulada?', opcoes: ['I.', 'C.', 'F.', 'E.'], correta: 'b' },
      { texto: 'O que mais eleva o resultado?', opcoes: ['Emojis.', 'Exemplos.', 'Tamanho do prompt.', 'Velocidade de digitação.'], correta: 'b' },
    ],
  }),
  quickAula('m05', {
    id: 'aula-5-3', titulo: 'Estrutura de Prompts Eficazes', ordem: 3, duracao_min: 25,
    descricao: 'Templates, papéis e restrições para resultados consistentes.',
    objetivo: 'Construir templates de prompt reutilizáveis.',
    explicacao: 'Prompts eficazes têm estrutura repetível. Defina papel ("você é um redator sênior"), público ("para um diretor financeiro"), objetivo, restrições ("máx. 200 palavras, sem jargão") e formato de saída. Salve isso como template.',
    exemplos: [
      'Template de "responder cliente bravo".',
      'Template de "resumir reunião".',
      'Template de "criar pauta".',
    ],
    dicas: [
      'Crie uma biblioteca de templates por tarefa.',
      'Use placeholders [ASSUNTO] [TOM] para reaproveitar.',
    ],
    erros: [
      'Refazer o mesmo prompt do zero toda vez.',
      'Não medir o que funciona.',
    ],
    resumo: 'Prompt = template + variáveis. Crie uma biblioteca.',
    exercicio: 'Crie 3 templates para tarefas recorrentes suas.',
    narracao: 'Quem usa template, ganha tempo todo dia. Vem montar a sua biblioteca.',
    slides: [
      { titulo: 'Estrutura', texto: 'Papel • Público • Objetivo • Restrições • Formato' },
      { titulo: 'Template', texto: 'Use [PLACEHOLDERS] para reuso.' },
      { titulo: 'Biblioteca', texto: 'Salve seus melhores prompts em um doc compartilhado.' },
    ],
    quiz: [
      { texto: 'O que é template de prompt?', opcoes: ['Um arquivo .doc.', 'Um molde reutilizável com placeholders.', 'A IA.', 'Um software.'], correta: 'b' },
      { texto: 'Por que usar templates?', opcoes: ['Ganha tempo e mantém qualidade.', 'É obrigatório.', 'A IA exige.', 'Para impressionar.'], correta: 'a' },
      { texto: 'Placeholder serve para...', opcoes: ['Decorar.', 'Substituir por valor variável.', 'Travar a IA.', 'Imprimir.'], correta: 'b' },
    ],
  }),
  quickAula('m05', {
    id: 'aula-5-4', titulo: 'Prompts para Escritório', ordem: 4, duracao_min: 25,
    descricao: 'Coletânea de prompts prontos para o dia a dia.',
    objetivo: 'Conhecer prompts validados para tarefas comuns no escritório.',
    explicacao: 'Uma boa biblioteca de prompts é um ativo. Esta aula traz exemplos prontos para e-mail, reunião, planilha e atendimento.',
    exemplos: [
      'E-mail: "Reescreva o e-mail abaixo no tom [formal/amigável], máx 150 palavras, sem jargões".',
      'Reunião: "Resuma a transcrição abaixo em decisões, pendências e responsáveis".',
      'Planilha: "Sugira fórmula para calcular X na coluna Y considerando Z".',
    ],
    dicas: [
      'Comece pela tarefa mais repetitiva sua.',
      'Compartilhe a biblioteca com a equipe.',
    ],
    erros: [
      'Não adaptar o template ao contexto.',
    ],
    resumo: 'Biblioteca pronta = produtividade pronta.',
    exercicio: 'Adapte 5 prompts desta aula ao seu cargo.',
    narracao: 'Hoje é dia de roubar bons prompts — e fazer eles trabalharem por você.',
    slides: [
      { titulo: 'Prompts úteis', texto: 'E-mail • Reunião • Planilha • Atendimento' },
      { titulo: 'Adapte', texto: 'Coloque seu cargo, sua empresa, seu cliente.' },
      { titulo: 'Compartilhe', texto: 'Equipe com biblioteca rende mais.' },
    ],
    quiz: [
      { texto: 'O que é uma biblioteca de prompts?', opcoes: ['Sala física.', 'Coleção de prompts prontos.', 'Site da OpenAI.', 'Livro de IA.'], correta: 'b' },
      { texto: 'Quem deve manter a biblioteca?', opcoes: ['Só o gestor.', 'Toda a equipe.', 'Só TI.', 'Só estagiários.'], correta: 'b' },
      { texto: 'O que falta em um template genérico?', opcoes: ['Cor.', 'Contexto específico do usuário.', 'Imagem.', 'Senha.'], correta: 'b' },
    ],
  }),
]

const M06_aulas: Aula[] = [
  quickAula('m06', {
    id: 'aula-6-1', titulo: 'Personas e Papéis', ordem: 1, duracao_min: 25,
    descricao: 'Diga à IA quem ela deve "ser" para responder melhor.',
    objetivo: 'Aplicar a técnica de persona para refinar respostas da IA.',
    explicacao: 'Quando você dá um papel à IA ("você é um consultor sênior", "você é um redator publicitário"), a saída muda de qualidade. Isso direciona vocabulário, tom e foco.',
    exemplos: [
      '"Você é um auditor: revise este processo".',
      '"Você é um copywriter: reescreva este anúncio".',
    ],
    dicas: ['Seja específico no papel (nível de senioridade, área).'],
    erros: ['Persona genérica não muda nada.'],
    resumo: 'Persona é direção. Use sempre.',
    exercicio: 'Teste o mesmo prompt com 3 personas diferentes e compare.',
    narracao: 'Mude a persona, mude a resposta. Pequeno truque, grande efeito.',
    slides: [
      { titulo: 'Persona', texto: 'Diga à IA quem ela deve "ser".' },
      { titulo: 'Exemplo', texto: '"Você é um consultor com 20 anos de experiência..."' },
      { titulo: 'Efeito', texto: 'Vocabulário e foco mudam imediatamente.' },
    ],
    quiz: [
      { texto: 'O que persona faz?', opcoes: ['Trava a IA.', 'Direciona o tom e foco.', 'Acelera resposta.', 'Aumenta limite.'], correta: 'b' },
      { texto: 'Persona ruim é...', opcoes: ['Específica.', 'Genérica.', 'Detalhada.', 'Profissional.'], correta: 'b' },
      { texto: 'Persona deve incluir...', opcoes: ['Nome próprio.', 'Cargo e senioridade.', 'CPF.', 'Endereço.'], correta: 'b' },
    ],
  }),
  quickAula('m06', {
    id: 'aula-6-2', titulo: 'Cadeias de Prompts', ordem: 2, duracao_min: 30,
    descricao: 'Dividir tarefas complexas em etapas para a IA.',
    objetivo: 'Construir fluxos de prompts em cadeia.',
    explicacao: 'Tarefas complexas saem melhor em etapas: primeiro extrair, depois analisar, depois resumir. Cada passo é um prompt, alimentado pelo anterior. É a base da automação inteligente.',
    exemplos: [
      'Passo 1: extraia tópicos de uma reunião.',
      'Passo 2: priorize por urgência.',
      'Passo 3: gere e-mail de follow-up.',
    ],
    dicas: ['Documente a cadeia. Reuse.'],
    erros: ['Pedir tudo de uma vez e ter resultado fraco.'],
    resumo: 'Quebre o problema. A IA agradece.',
    exercicio: 'Pegue uma tarefa complexa e quebre em 3 prompts encadeados.',
    narracao: 'IA não é mágica. É processo. Quebrar em etapas é o segredo.',
    slides: [
      { titulo: 'Cadeia', texto: 'Vários prompts em sequência.' },
      { titulo: 'Vantagem', texto: 'Resultado profundo e auditável.' },
      { titulo: 'Quando usar', texto: 'Sempre que a tarefa tiver mais de uma etapa.' },
    ],
    quiz: [
      { texto: 'Cadeia de prompts é...', opcoes: ['1 prompt longo.', 'Vários prompts encadeados.', 'Um robô físico.', 'Plugin.'], correta: 'b' },
      { texto: 'Vantagem da cadeia?', opcoes: ['Mais rápido sempre.', 'Resultado mais profundo e auditável.', 'Mais barato.', 'Sem revisão.'], correta: 'b' },
      { texto: 'Quando NÃO usar cadeia?', opcoes: ['Tarefa simples e única.', 'Análise complexa.', 'Pipeline de dados.', 'Geração estruturada.'], correta: 'a' },
    ],
  }),
  quickAula('m06', {
    id: 'aula-6-3', titulo: 'Análise de Dados com IA', ordem: 3, duracao_min: 30,
    descricao: 'Colar tabela, pedir insights, gerar gráficos.',
    objetivo: 'Extrair conclusões de dados usando IA.',
    explicacao: 'IA é boa em encontrar padrões em dados. Cole uma tabela, peça insights, peça gráfico em código (Mermaid, Python). Funciona melhor com dados estruturados e contexto claro do que você procura.',
    exemplos: [
      '"Encontre padrões nas vendas deste trimestre".',
      '"Sugira 3 gráficos que melhor mostram esta evolução".',
    ],
    dicas: ['Anonimize antes.'],
    erros: ['Confiar em número que a IA "inventou".'],
    resumo: 'IA + dados = insight rápido. Mas confira sempre.',
    exercicio: 'Cole uma tabela (anonimizada) e peça 3 insights.',
    narracao: 'Análise de dados com IA é onde mais economiza tempo. Vem ver.',
    slides: [
      { titulo: 'Cole dados', texto: 'Tabela ou CSV em texto.' },
      { titulo: 'Peça insights', texto: 'Padrão, anomalia, tendência.' },
      { titulo: 'Confira', texto: 'Sempre valide os números.' },
    ],
    quiz: [
      { texto: 'Antes de colar tabela na IA pública?', opcoes: ['Compactar.', 'Anonimizar.', 'Criptografar.', 'Imprimir.'], correta: 'b' },
      { texto: 'IA é boa em achar...', opcoes: ['Senhas.', 'Padrões nos dados.', 'Fotos.', 'Endereços.'], correta: 'b' },
      { texto: 'Antes de citar um número da IA?', opcoes: ['Validar.', 'Compartilhar.', 'Imprimir.', 'Confiar cego.'], correta: 'a' },
    ],
  }),
  quickAula('m06', {
    id: 'aula-6-4', titulo: 'Criação de Conteúdo Avançado', ordem: 4, duracao_min: 30,
    descricao: 'Textos, apresentações e roteiros com qualidade profissional.',
    objetivo: 'Produzir conteúdo profissional combinando prompts e revisão.',
    explicacao: 'Para conteúdo de alto nível, combine: persona forte, exemplos do seu próprio estilo, revisão em ciclos. Use a IA como rascunho rápido — você como editor final.',
    exemplos: [
      'Apresentação de 10 slides para diretoria.',
      'Roteiro de vídeo institucional.',
      'Artigo para LinkedIn no seu estilo.',
    ],
    dicas: ['Treine a IA com 2-3 exemplos do seu próprio estilo.'],
    erros: ['Aceitar tudo de primeira.'],
    resumo: 'Combine persona + exemplos do seu estilo + revisão. Resultado: nível pro.',
    exercicio: 'Produza um post de LinkedIn no seu estilo, em 3 iterações.',
    narracao: 'Conteúdo de qualidade não nasce pronto. É IA + você. Vamos refinar juntos.',
    slides: [
      { titulo: 'Receita', texto: 'Persona + exemplo do seu estilo + revisão.' },
      { titulo: 'Iteração', texto: '3 rounds normalmente bastam.' },
      { titulo: 'Você é o editor', texto: 'Última palavra é sempre humana.' },
    ],
    quiz: [
      { texto: 'O que falta na IA em conteúdo de alto nível?', opcoes: ['Seu estilo pessoal.', 'Velocidade.', 'Vocabulário.', 'Memória.'], correta: 'a' },
      { texto: 'Iteração média recomendada?', opcoes: ['1 vez.', '3 vezes.', '20 vezes.', '0 vezes.'], correta: 'b' },
      { texto: 'Quem decide o resultado final?', opcoes: ['A IA.', 'O humano.', 'A internet.', 'O chefe.'], correta: 'b' },
    ],
  }),
]

const M07_aulas: Aula[] = [
  quickAula('m07', {
    id: 'aula-7-1', titulo: 'E-mails Profissionais', ordem: 1, duracao_min: 20,
    descricao: 'Escreva e responda e-mails em segundos com tom certo.',
    objetivo: 'Usar IA para acelerar a produção de e-mails de qualidade.',
    explicacao: 'E-mail consome horas. Com IA, você reduz para minutos. Cole bullets, peça draft, ajuste tom, envie. Templates por tipo (cobrança, agradecimento, reunião) aceleram ainda mais.',
    exemplos: [
      'Resposta a reclamação de cliente.',
      'Cobrança polida de fornecedor.',
      'Convocação de reunião com pauta.',
    ],
    dicas: ['Especifique sempre tom e tamanho.'],
    erros: ['Esquecer de revisar nome do destinatário.'],
    resumo: 'E-mail com IA: bullets → draft → ajuste → envia.',
    exercicio: 'Reescreva 3 e-mails seus desta semana usando IA.',
    narracao: 'Quantos e-mails você responde por dia? E se cada um tomasse 80% menos tempo?',
    slides: [
      { titulo: 'Fluxo', texto: 'Bullets → IA → ajuste → envia.' },
      { titulo: 'Sempre defina', texto: 'Tom, tamanho, destinatário, objetivo.' },
      { titulo: 'Revise', texto: 'Nome, dado, valores. Sempre.' },
    ],
    quiz: [
      { texto: 'O que sempre deve revisar?', opcoes: ['Cor da fonte.', 'Nome do destinatário e dados.', 'Tamanho do anexo.', 'Fonte.'], correta: 'b' },
      { texto: 'Antes do draft, dê...', opcoes: ['Café.', 'Bullets do conteúdo.', 'Música.', 'Imagem.'], correta: 'b' },
      { texto: 'Para que serve um template?', opcoes: ['Decorar.', 'Acelerar com qualidade.', 'Travar a IA.', 'Imprimir.'], correta: 'b' },
    ],
  }),
  quickAula('m07', {
    id: 'aula-7-2', titulo: 'Relatórios e Pareceres', ordem: 2, duracao_min: 30,
    descricao: 'Da matéria-prima ao relatório finalizado com IA.',
    objetivo: 'Produzir relatórios estruturados com auxílio de IA.',
    explicacao: 'IA é ótima em estruturar relatórios: introdução, contexto, análise, recomendação, conclusão. Cole dados e pontos, peça estrutura, revise. Para parecer, use persona de especialista (jurídico, técnico).',
    exemplos: ['Relatório de vendas trimestral.', 'Parecer de viabilidade.', 'Análise de fornecedor.'],
    dicas: ['Use estrutura padrão da sua empresa.'],
    erros: ['Citar dados que a IA "inventou".'],
    resumo: 'IA estrutura, você valida e assina.',
    exercicio: 'Produza um relatório de 1 página com IA hoje.',
    narracao: 'Relatórios não precisam ser sofrimento. Aprenda a delegar a estrutura.',
    slides: [
      { titulo: 'Estrutura', texto: 'Intro • Contexto • Análise • Recomendação • Conclusão' },
      { titulo: 'Sua parte', texto: 'Dado verídico e validação.' },
      { titulo: 'IA', texto: 'Forma, fluxo, redação.' },
    ],
    quiz: [
      { texto: 'A estrutura sai com IA. O que NÃO sai?', opcoes: ['Dados verídicos da sua empresa.', 'Fluxo.', 'Redação.', 'Tom.'], correta: 'a' },
      { texto: 'Persona ideal para parecer técnico?', opcoes: ['Especialista da área.', 'Estagiário.', 'Atendente.', 'Vendedor.'], correta: 'a' },
      { texto: 'O que checar antes de entregar?', opcoes: ['Dados e fonte.', 'Cor do título.', 'Tamanho da fonte.', 'Margem.'], correta: 'a' },
    ],
  }),
  quickAula('m07', {
    id: 'aula-7-3', titulo: 'Atas de Reunião', ordem: 3, duracao_min: 20,
    descricao: 'De transcrição a ata profissional em minutos.',
    objetivo: 'Gerar atas estruturadas a partir de transcrições.',
    explicacao: 'Cole a transcrição (do Teams, Meet, Zoom), peça à IA: "estruture em decisões, pendências, responsáveis e prazos". Em segundos, ata pronta. Sempre revise nomes e datas.',
    exemplos: ['Reunião semanal.', 'Comitê executivo.', 'Reunião com cliente.'],
    dicas: ['Padronize a estrutura para revisar mais rápido.'],
    erros: ['Não revisar responsáveis e prazos.'],
    resumo: 'Transcrição + prompt = ata em minutos.',
    exercicio: 'Pegue uma transcrição e gere ata. Compare com seu modelo manual.',
    narracao: 'Atas de reunião agora levam minutos. Quem souber, ganha tempo todo dia.',
    slides: [
      { titulo: 'Insumo', texto: 'Transcrição da reunião.' },
      { titulo: 'Saída', texto: 'Decisões, pendências, responsáveis, prazos.' },
      { titulo: 'Revise', texto: 'Nomes e datas — sempre.' },
    ],
    quiz: [
      { texto: 'O que pedir à IA para ata?', opcoes: ['Estrutura: decisões, pendências, responsáveis, prazos.', 'Fofocar.', 'Resumir trivialidades.', 'Repetir tudo.'], correta: 'a' },
      { texto: 'Sempre revisar...', opcoes: ['Nomes e datas.', 'Cor.', 'Fonte.', 'Margem.'], correta: 'a' },
      { texto: 'A IA precisa de qual insumo?', opcoes: ['Vídeo.', 'Transcrição.', 'Foto.', 'Áudio bruto sem texto.'], correta: 'b' },
    ],
  }),
  quickAula('m07', {
    id: 'aula-7-4', titulo: 'Comunicados Internos', ordem: 4, duracao_min: 20,
    descricao: 'Mensagens claras para toda empresa em qualquer tom.',
    objetivo: 'Produzir comunicados internos eficazes com IA.',
    explicacao: 'Comunicados internos precisam clareza, tom adequado e ação clara. IA ajuda a balancear: nem frio, nem confuso. Especifique público, urgência e ação esperada.',
    exemplos: ['Mudança de processo.', 'Aviso de manutenção.', 'Anúncio de evento.'],
    dicas: ['Comunicado curto vence comunicado longo.'],
    erros: ['Não deixar claro o que esperar do leitor.'],
    resumo: 'Curto, claro, com ação. IA ajuda nas 3.',
    exercicio: 'Produza um comunicado de mudança de processo em 100 palavras.',
    narracao: 'Comunicado claro evita reunião. Aprenda a fazer rápido e bem.',
    slides: [
      { titulo: 'Receita', texto: 'O que mudou + Por quê + O que fazer.' },
      { titulo: 'Limite', texto: 'Máx 100–150 palavras.' },
      { titulo: 'Tom', texto: 'Defina antes: formal, próximo, urgente.' },
    ],
    quiz: [
      { texto: 'O que sempre deve constar?', opcoes: ['O que fazer.', 'O CEP.', 'Histórico de 10 anos.', 'Foto.'], correta: 'a' },
      { texto: 'Tamanho ideal?', opcoes: ['100–150 palavras.', '2000 palavras.', '1 palavra.', '10 mil palavras.'], correta: 'a' },
      { texto: 'O que falta especificar no prompt?', opcoes: ['Cor.', 'Tom e ação.', 'Tamanho de fonte.', 'IP do servidor.'], correta: 'b' },
    ],
  }),
]

const M08_aulas: Aula[] = [
  quickAula('m08', {
    id: 'aula-8-1', titulo: 'Fórmulas com IA', ordem: 1, duracao_min: 25,
    descricao: 'Peça fórmulas em português, receba em PROCV/SOMASE/etc.',
    objetivo: 'Gerar fórmulas Excel a partir de descrição em português.',
    explicacao: 'Em vez de decorar PROCV, ÍNDICE, CORRESP, peça à IA. Descreva o que quer ("buscar nome do cliente na coluna B da aba Clientes a partir do CPF da célula A2"). IA devolve a fórmula pronta para colar.',
    exemplos: [
      'PROCV substituído por descrição.',
      'Fórmula matricial gerada em segundos.',
      'Macro VBA básica.',
    ],
    dicas: ['Sempre teste em poucos dados primeiro.'],
    erros: ['Confiar sem testar com casos extremos.'],
    resumo: 'Fórmula que você não lembra, IA gera. Você só testa.',
    exercicio: 'Peça à IA uma fórmula SOMASE para sua planilha de despesas.',
    narracao: 'Esqueceu fórmula? Esqueça. A IA virou seu dicionário Excel ao vivo.',
    slides: [
      { titulo: 'Antes', texto: 'Procurar PROCV no Google.' },
      { titulo: 'Agora', texto: 'Descrever em português → fórmula pronta.' },
      { titulo: 'Sempre', texto: 'Teste em 3 casos antes de confiar.' },
    ],
    quiz: [
      { texto: 'O que descrever para a IA?', opcoes: ['O que a fórmula deve fazer, em português.', 'O CEP.', 'A senha.', 'O Wi-Fi.'], correta: 'a' },
      { texto: 'O que fazer com a fórmula?', opcoes: ['Confiar cega.', 'Testar em alguns casos.', 'Imprimir.', 'Ignorar.'], correta: 'b' },
      { texto: 'IA gera VBA básico?', opcoes: ['Sim.', 'Não.', 'Só com plugin.', 'Só pagando.'], correta: 'a' },
    ],
  }),
  quickAula('m08', {
    id: 'aula-8-2', titulo: 'Tabelas e Dinâmicas', ordem: 2, duracao_min: 30,
    descricao: 'Organize dados e gere tabelas dinâmicas guiado por IA.',
    objetivo: 'Usar IA para projetar tabelas dinâmicas eficazes.',
    explicacao: 'IA ajuda a decidir o que vai em linhas, colunas, valores e filtros. Descreva sua planilha e o que quer ver — ela sugere a estrutura ideal e o passo a passo no Excel.',
    exemplos: ['Vendas por região e mês.', 'Despesas por categoria.', 'Equipe por projeto.'],
    dicas: ['Use Tabela Estruturada (Ctrl+T) antes da dinâmica.'],
    erros: ['Não nomear cabeçalhos claros.'],
    resumo: 'IA sugere estrutura. Você executa no Excel.',
    exercicio: 'Crie uma tabela dinâmica guiada por IA com sua planilha.',
    narracao: 'Tabela dinâmica assusta? Hoje a IA fica do seu lado.',
    slides: [
      { titulo: 'Passos', texto: 'Descreva → IA sugere → você executa.' },
      { titulo: 'Antes', texto: 'Sempre transforme em Tabela (Ctrl+T).' },
      { titulo: 'Cabeçalho', texto: 'Curto, claro, sem espaço extra.' },
    ],
    quiz: [
      { texto: 'Atalho para tabela estruturada?', opcoes: ['Ctrl+T.', 'Ctrl+C.', 'Ctrl+V.', 'Ctrl+Z.'], correta: 'a' },
      { texto: 'O que a IA sugere?', opcoes: ['A estrutura linhas/colunas/valores.', 'O preço.', 'A imagem.', 'O backup.'], correta: 'a' },
      { texto: 'Cabeçalho ideal?', opcoes: ['Curto e claro.', 'Longo.', 'Com emoji.', 'Em caixa alta colorida.'], correta: 'a' },
    ],
  }),
  quickAula('m08', {
    id: 'aula-8-3', titulo: 'Dashboards', ordem: 3, duracao_min: 30,
    descricao: 'Dashboard executivo no Excel com auxílio de IA.',
    objetivo: 'Estruturar e construir um dashboard com IA.',
    explicacao: 'Dashboard começa com perguntas-chave do gestor. Peça à IA para sugerir KPIs, gráficos e layout. Depois execute com tabelas dinâmicas e segmentações de dados.',
    exemplos: ['Dashboard de vendas.', 'Dashboard financeiro.', 'Dashboard de RH.'],
    dicas: ['Máx 5 KPIs principais. Mais é confusão.'],
    erros: ['Dashboard sem pergunta clara responde nada.'],
    resumo: 'Pergunta → KPI → gráfico. Nessa ordem.',
    exercicio: 'Construa um mini dashboard com 3 KPIs.',
    narracao: 'Dashboard não é arte — é decisão. A IA te ajuda a focar.',
    slides: [
      { titulo: 'Começa com', texto: 'Pergunta do tomador de decisão.' },
      { titulo: 'KPIs', texto: 'Máximo 5 principais.' },
      { titulo: 'Visual', texto: 'Limpo. Sem firula.' },
    ],
    quiz: [
      { texto: 'Dashboard começa com...', opcoes: ['Pergunta.', 'Cor.', 'Fonte.', 'Logo.'], correta: 'a' },
      { texto: 'Quantos KPIs principais?', opcoes: ['Até 5.', '50.', '100.', '0.'], correta: 'a' },
      { texto: 'Dashboard sem pergunta é...', opcoes: ['Útil.', 'Confuso.', 'Premiado.', 'Padrão ouro.'], correta: 'b' },
    ],
  }),
  quickAula('m08', {
    id: 'aula-8-4', titulo: 'Análise de Dados no Excel', ordem: 4, duracao_min: 30,
    descricao: 'Insights, anomalias e tendências guiados por IA.',
    objetivo: 'Extrair insights de planilhas com auxílio de IA.',
    explicacao: 'Cole uma amostra anonimizada na IA e peça: padrões, anomalias, tendências, recomendações. Use as conclusões como hipóteses — valide no Excel com a base completa.',
    exemplos: ['Análise de churn.', 'Análise de margem.', 'Análise de produtividade.'],
    dicas: ['IA dá hipótese; Excel dá prova.'],
    erros: ['Confiar 100% na hipótese sem validar.'],
    resumo: 'IA = hipótese. Excel = prova. Combinados, decisão sólida.',
    exercicio: 'Cole uma amostra, peça 3 hipóteses, valide 1 no Excel.',
    narracao: 'Análise de dados é arte de fazer perguntas. A IA é seu parceiro de hipóteses.',
    slides: [
      { titulo: 'Fluxo', texto: 'Amostra → IA → hipótese → validação.' },
      { titulo: 'Cuidado', texto: 'Anonimize antes de enviar.' },
      { titulo: 'Decisão', texto: 'Só após validar nos dados completos.' },
    ],
    quiz: [
      { texto: 'IA fornece...', opcoes: ['Hipótese.', 'Prova.', 'Backup.', 'CEP.'], correta: 'a' },
      { texto: 'O que valida a hipótese?', opcoes: ['Excel sobre base completa.', 'Foto.', 'Cor.', 'Imprimir.'], correta: 'a' },
      { texto: 'Antes de enviar amostra?', opcoes: ['Anonimizar.', 'Imprimir.', 'Gravar áudio.', 'Tirar print.'], correta: 'a' },
    ],
  }),
]

const M09_aulas: Aula[] = [
  quickAula('m09', {
    id: 'aula-9-1', titulo: 'Zapier com IA', ordem: 1, duracao_min: 30,
    descricao: 'Conecte apps e adicione IA no meio do fluxo.',
    objetivo: 'Construir um fluxo no Zapier com etapa de IA.',
    explicacao: 'Zapier conecta apps (Gmail, Sheets, Slack...) e dispara automações. Agora ele tem etapas de IA: classificar, resumir, gerar resposta. Você cria fluxos em minutos sem código.',
    exemplos: [
      'Novo e-mail → IA classifica → grava em planilha.',
      'Formulário → IA resume → notifica Slack.',
    ],
    dicas: ['Comece com 1 zap simples e expanda.'],
    erros: ['Criar zaps complexos demais antes de testar.'],
    resumo: 'Zapier + IA = automação inteligente sem programar.',
    exercicio: 'Crie um zap simples: novo e-mail → IA resume → Slack.',
    narracao: 'Zapier ficou ainda mais poderoso com IA dentro. Vem ver na prática.',
    slides: [
      { titulo: 'Zapier', texto: 'Conecta apps. Sem código.' },
      { titulo: 'IA no meio', texto: 'Classifica, resume, decide.' },
      { titulo: 'Comece simples', texto: '1 zap por vez. Expanda.' },
    ],
    quiz: [
      { texto: 'Zapier exige programar?', opcoes: ['Sim.', 'Não.', 'Só em JavaScript.', 'Só com plugin.'], correta: 'b' },
      { texto: 'IA no Zapier serve para...', opcoes: ['Decorar.', 'Classificar, resumir, decidir.', 'Logar.', 'Imprimir.'], correta: 'b' },
      { texto: 'Boa prática inicial?', opcoes: ['Começar simples.', 'Começar complexo.', 'Pular testes.', 'Ignorar logs.'], correta: 'a' },
    ],
  }),
  quickAula('m09', {
    id: 'aula-9-2', titulo: 'Make com IA', ordem: 2, duracao_min: 30,
    descricao: 'Visual, poderoso, com etapas avançadas.',
    objetivo: 'Comparar Make com Zapier e construir um fluxo.',
    explicacao: 'Make (ex-Integromat) é uma alternativa visual ao Zapier, com mais controle de fluxo e bom suporte a IA. Ideal quando o fluxo tem ramificações, iterações ou tratamento de erro.',
    exemplos: ['Pipeline de processamento de dados.', 'Workflow de aprovação.', 'Sincronização entre sistemas.'],
    dicas: ['Aprenda o conceito de "bundles" — é o que muda tudo.'],
    erros: ['Tentar fazer no Make o que é mais simples no Zapier.'],
    resumo: 'Make = controle visual avançado. Use quando Zapier ficar simples demais.',
    exercicio: 'Replique um zap seu no Make com 1 etapa extra.',
    narracao: 'Make é o Zapier crescido. Hoje você conhece a diferença.',
    slides: [
      { titulo: 'Make', texto: 'Visual. Avançado. Bom em ramificação.' },
      { titulo: 'Vs Zapier', texto: 'Zapier: simples e rápido.\nMake: controle profundo.' },
      { titulo: 'Bundles', texto: 'Conceito-chave. Estude antes.' },
    ],
    quiz: [
      { texto: 'Make é alternativa a...', opcoes: ['Excel.', 'Zapier.', 'Google.', 'Word.'], correta: 'b' },
      { texto: 'Quando preferir Make?', opcoes: ['Em fluxos com ramificação.', 'Em zaps de 1 passo.', 'Nunca.', 'Sempre.'], correta: 'a' },
      { texto: 'O que é "bundle"?', opcoes: ['Cor.', 'Conceito de pacote de dados no Make.', 'Plugin.', 'Logo.'], correta: 'b' },
    ],
  }),
  quickAula('m09', {
    id: 'aula-9-3', titulo: 'Power Automate com IA', ordem: 3, duracao_min: 30,
    descricao: 'Automação Microsoft + AI Builder.',
    objetivo: 'Construir fluxos no Power Automate com IA.',
    explicacao: 'Power Automate é a ferramenta de automação da Microsoft, integrada ao 365. Tem o AI Builder para extrair texto de documentos, classificar, prever. Ideal para empresas já no ecossistema Microsoft.',
    exemplos: ['Aprovação de pedidos.', 'Extração de dados de notas fiscais.', 'Sincronização SharePoint.'],
    dicas: ['Use templates prontos do Power Automate.'],
    erros: ['Reinventar o que já existe pronto.'],
    resumo: 'Power Automate = automação corporativa nativa Microsoft.',
    exercicio: 'Crie um fluxo simples: notificação no Teams a cada novo item em SharePoint.',
    narracao: 'Se sua empresa é Microsoft, Power Automate é onde a automação mora.',
    slides: [
      { titulo: 'Power Automate', texto: 'Automação Microsoft 365.' },
      { titulo: 'AI Builder', texto: 'IA dentro: OCR, classificação, previsão.' },
      { titulo: 'Templates', texto: 'Não comece do zero.' },
    ],
    quiz: [
      { texto: 'Power Automate é de qual empresa?', opcoes: ['Google.', 'Microsoft.', 'Adobe.', 'Apple.'], correta: 'b' },
      { texto: 'AI Builder serve para...', opcoes: ['Editar foto.', 'OCR, classificação e previsão.', 'Imprimir.', 'Jogar.'], correta: 'b' },
      { texto: 'Boa prática?', opcoes: ['Usar templates.', 'Sempre do zero.', 'Sem teste.', 'Sem documentação.'], correta: 'a' },
    ],
  }),
]

const M10_aulas: Aula[] = [
  quickAula('m10', {
    id: 'aula-10-1', titulo: 'POPs com IA', ordem: 1, duracao_min: 25,
    descricao: 'Procedimentos Operacionais Padrão gerados em minutos.',
    objetivo: 'Documentar processos como POPs com auxílio de IA.',
    explicacao: 'POP é a documentação de um processo passo a passo. Com IA: descreva como você faz, peça estrutura em POP, revise. O que tomaria 2 horas vira 15 minutos.',
    exemplos: ['POP de fechamento mensal.', 'POP de atendimento.', 'POP de onboarding.'],
    dicas: ['Inclua o "por quê" de cada passo.'],
    erros: ['POP genérico vira papel de gaveta.'],
    resumo: 'POP bom é específico e usado. IA acelera, você refina.',
    exercicio: 'Documente seu processo mais repetitivo como POP.',
    narracao: 'POP não precisa ser chato. Com IA, vira ágil e útil.',
    slides: [
      { titulo: 'POP', texto: 'Documento de processo passo a passo.' },
      { titulo: 'IA acelera', texto: '2h → 15min.' },
      { titulo: 'Bom POP', texto: 'Específico. Usado. Atualizado.' },
    ],
    quiz: [
      { texto: 'O que POP significa?', opcoes: ['Procedimento Operacional Padrão.', 'Plano Online de Produção.', 'Política Operacional Privada.', 'Padrão Oficial Profissional.'], correta: 'a' },
      { texto: 'POP bom é...', opcoes: ['Genérico.', 'Específico e usado.', 'Decorativo.', 'Confidencial sempre.'], correta: 'b' },
      { texto: 'Por que IA acelera POP?', opcoes: ['Estrutura passo a passo.', 'Imprime.', 'Pinta.', 'Edita vídeo.'], correta: 'a' },
    ],
  }),
  quickAula('m10', {
    id: 'aula-10-2', titulo: 'Fluxogramas', ordem: 2, duracao_min: 25,
    descricao: 'Diagrame processos com IA gerando código Mermaid.',
    objetivo: 'Gerar fluxogramas de processo a partir de texto.',
    explicacao: 'Descreva um processo em texto e peça à IA para gerar código Mermaid (ou draw.io). Cole no editor compatível e tenha o fluxograma profissional em segundos.',
    exemplos: ['Fluxograma de aprovação.', 'Fluxograma de atendimento.', 'Fluxograma de compras.'],
    dicas: ['Use Mermaid: leve, free, integra com vários apps.'],
    erros: ['Fluxograma sem decisão clara.'],
    resumo: 'Texto → IA → código Mermaid → fluxograma.',
    exercicio: 'Crie um fluxograma do seu processo de aprovação.',
    narracao: 'Diagrama profissional em minutos? A IA + Mermaid mostra como.',
    slides: [
      { titulo: 'Mermaid', texto: 'Linguagem de diagrama em texto.' },
      { titulo: 'Fluxo', texto: 'Descrição → IA → código → diagrama.' },
      { titulo: 'Onde ver', texto: 'mermaid.live, Notion, Obsidian, GitHub.' },
    ],
    quiz: [
      { texto: 'Mermaid é...', opcoes: ['Editor de vídeo.', 'Linguagem de diagrama em texto.', 'IA.', 'Planilha.'], correta: 'b' },
      { texto: 'Onde testar?', opcoes: ['mermaid.live.', 'Photoshop.', 'PowerPoint.', 'Outlook.'], correta: 'a' },
      { texto: 'Fluxograma bom tem...', opcoes: ['Decisões claras.', 'Apenas caixas.', 'Sem direção.', 'Só cor.'], correta: 'a' },
    ],
  }),
  quickAula('m10', {
    id: 'aula-10-3', titulo: 'Checklists Inteligentes', ordem: 3, duracao_min: 20,
    descricao: 'Listas de verificação geradas e atualizadas com IA.',
    objetivo: 'Criar checklists eficazes para garantir consistência.',
    explicacao: 'Checklist é o "antídoto contra esquecimento". IA gera checklists completos para qualquer processo, e você refina com a realidade da sua operação.',
    exemplos: ['Checklist de fim de mês.', 'Checklist de evento.', 'Checklist de onboarding.'],
    dicas: ['Máx 10 itens por checklist — depois divida.'],
    erros: ['Checklist gigante que ninguém usa.'],
    resumo: 'Checklist bom: curto, claro, usado todo dia.',
    exercicio: 'Crie checklist para sua tarefa mais crítica.',
    narracao: 'Pequenas listas, grandes resultados. Bem-vindo aos checklists inteligentes.',
    slides: [
      { titulo: 'Checklist', texto: 'Antídoto contra esquecimento.' },
      { titulo: 'Tamanho', texto: 'Máx 10 itens. Divida se passar.' },
      { titulo: 'Uso', texto: 'Só vale se for usado.' },
    ],
    quiz: [
      { texto: 'Tamanho ideal?', opcoes: ['Até 10.', '100.', '1.', '50.'], correta: 'a' },
      { texto: 'Checklist gigante é...', opcoes: ['Ótimo.', 'Ignorado.', 'Premiado.', 'Padrão.'], correta: 'b' },
      { texto: 'O que define checklist bom?', opcoes: ['Decoração.', 'Curto, claro, usado.', 'Cor.', 'Imagem.'], correta: 'b' },
    ],
  }),
]

const M11_aulas: Aula[] = [
  quickAula('m11', {
    id: 'aula-11-1', titulo: 'IA no RH', ordem: 1, duracao_min: 25,
    descricao: 'Triagem, JDs, feedbacks e onboarding.',
    objetivo: 'Aplicar IA em processos de RH.',
    explicacao: 'No RH a IA acelera triagem (resumir currículos), redação (job descriptions, anúncios), feedback (templates de avaliação) e onboarding (planos personalizados). Atenção redobrada com dado pessoal.',
    exemplos: ['Resumo de currículo.', 'JD para vaga técnica.', 'Avaliação de desempenho.'],
    dicas: ['Anonimize dados de candidato.'],
    erros: ['Discriminação por viés do modelo.'],
    resumo: 'IA no RH: ganho real, com cuidado redobrado de dado e viés.',
    exercicio: 'Gere uma JD para uma vaga atual do seu time.',
    narracao: 'RH é onde IA mais economiza tempo — e mais exige responsabilidade.',
    slides: [
      { titulo: 'Onde aplicar', texto: 'Triagem • JD • Feedback • Onboarding' },
      { titulo: 'Cuidado especial', texto: 'Dados pessoais (LGPD) e viés.' },
      { titulo: 'Sempre', texto: 'Decisão final humana.' },
    ],
    quiz: [
      { texto: 'Risco principal no RH com IA?', opcoes: ['Bateria.', 'Dados pessoais e viés.', 'Cor.', 'Som.'], correta: 'b' },
      { texto: 'Decisão final deve ser...', opcoes: ['Da IA.', 'Humana.', 'Sorteio.', 'Aleatória.'], correta: 'b' },
      { texto: 'O que anonimizar?', opcoes: ['Nome e dados de candidato.', 'Cor.', 'Fonte.', 'Logo.'], correta: 'a' },
    ],
  }),
  quickAula('m11', {
    id: 'aula-11-2', titulo: 'IA no Financeiro', ordem: 2, duracao_min: 25,
    descricao: 'Conciliação, análise de despesa e relatórios.',
    objetivo: 'Aplicar IA em rotinas financeiras.',
    explicacao: 'No financeiro: extração de dados de notas fiscais, conciliação bancária assistida, análise de despesa por categoria, relatórios gerenciais. IA reduz horas de tarefa repetitiva.',
    exemplos: ['Extração de dados de NFs.', 'Análise de despesa por centro de custo.', 'Relatório gerencial.'],
    dicas: ['Use Power Automate + AI Builder para extrair NFs.'],
    erros: ['Confiar em totais sem validar.'],
    resumo: 'IA acelera. Você fecha os números.',
    exercicio: 'Use IA para resumir suas despesas do mês por categoria.',
    narracao: 'O financeiro é o playground perfeito da IA — mas valida tudo.',
    slides: [
      { titulo: 'Onde aplicar', texto: 'Extração de NF • Conciliação • Análise • Relatório' },
      { titulo: 'Ganho', texto: 'Horas de tempo de volta.' },
      { titulo: 'Cuidado', texto: 'Valide totais.' },
    ],
    quiz: [
      { texto: 'O que IA acelera no financeiro?', opcoes: ['Tarefas repetitivas.', 'Decisão estratégica final.', 'Senha.', 'Login.'], correta: 'a' },
      { texto: 'O que sempre validar?', opcoes: ['Totais.', 'Cor.', 'Fonte.', 'Foto.'], correta: 'a' },
      { texto: 'Ferramenta Microsoft para extrair NFs?', opcoes: ['Power Automate + AI Builder.', 'Photoshop.', 'Outlook.', 'Teams.'], correta: 'a' },
    ],
  }),
  quickAula('m11', {
    id: 'aula-11-3', titulo: 'IA em Compras', ordem: 3, duracao_min: 25,
    descricao: 'Cotações, contratos e análise de fornecedor.',
    objetivo: 'Aplicar IA em rotinas de compras.',
    explicacao: 'Compras: comparação de cotações, redação de e-mails de negociação, análise de cláusulas contratuais, scoring de fornecedor. Reduz horas e dá visão estratégica.',
    exemplos: ['Comparativo de 3 cotações.', 'E-mail de negociação.', 'Análise rápida de cláusula contratual.'],
    dicas: ['Sempre revise cláusula contratual com humano antes de assinar.'],
    erros: ['Confiar em "resumo de contrato" sem ler o original em pontos críticos.'],
    resumo: 'IA acelera análise. Decisão é sua.',
    exercicio: 'Use IA para comparar 2 cotações reais.',
    narracao: 'Compras com IA viram estratégicas. Vem ver como.',
    slides: [
      { titulo: 'Onde aplicar', texto: 'Cotações • Negociação • Contratos • Fornecedor' },
      { titulo: 'Atenção', texto: 'Cláusulas críticas: leia o original.' },
      { titulo: 'Decisão', texto: 'Sua. Sempre.' },
    ],
    quiz: [
      { texto: 'Para cláusula contratual crítica, o que fazer?', opcoes: ['Confiar no resumo.', 'Ler o original.', 'Ignorar.', 'Apagar.'], correta: 'b' },
      { texto: 'IA ajuda em quais tarefas?', opcoes: ['Cotações, negociação, análise.', 'Café.', 'Calculadora.', 'Senha.'], correta: 'a' },
      { texto: 'Decisão final?', opcoes: ['Humana.', 'IA.', 'Sorteio.', 'Random.'], correta: 'a' },
    ],
  }),
  quickAula('m11', {
    id: 'aula-11-4', titulo: 'IA em Operações', ordem: 4, duracao_min: 25,
    descricao: 'POPs, escalas e indicadores.',
    objetivo: 'Aplicar IA em operações e processos.',
    explicacao: 'Operações: padronização de processos (POPs), montagem de escalas, monitoramento de indicadores, identificação de gargalos. IA dá clareza sobre onde ajustar.',
    exemplos: ['POPs padronizados.', 'Escala otimizada.', 'Alertas de SLA.'],
    dicas: ['Comece pelo processo de maior dor.'],
    erros: ['Otimizar processos pouco relevantes.'],
    resumo: 'IA mostra o gargalo. Você decide onde investir.',
    exercicio: 'Liste 3 processos da operação e priorize 1 para otimizar.',
    narracao: 'Operações é onde IA faz diferença em escala. Bora descobrir.',
    slides: [
      { titulo: 'Onde aplicar', texto: 'POP • Escala • Indicador • Gargalo' },
      { titulo: 'Prioridade', texto: 'Comece pela maior dor.' },
      { titulo: 'Resultado', texto: 'Clareza para decidir.' },
    ],
    quiz: [
      { texto: 'Por onde começar?', opcoes: ['Maior dor.', 'Menor dor.', 'Sorteio.', 'Aleatório.'], correta: 'a' },
      { texto: 'O que IA entrega em operações?', opcoes: ['Clareza para decidir.', 'Senha.', 'Foto.', 'Música.'], correta: 'a' },
      { texto: 'O que NÃO fazer?', opcoes: ['Otimizar irrelevante.', 'Documentar.', 'Medir.', 'Iterar.'], correta: 'a' },
    ],
  }),
  quickAula('m11', {
    id: 'aula-11-5', titulo: 'IA no Atendimento', ordem: 5, duracao_min: 25,
    descricao: 'Respostas, classificação e resumo de tickets.',
    objetivo: 'Aplicar IA no atendimento ao cliente.',
    explicacao: 'Atendimento: classificação de tickets, sugestão de resposta, resumo de histórico, detecção de sentimento. Atendente fica mais rápido e mais preparado para o contato.',
    exemplos: ['Classificação de tickets.', 'Sugestão de resposta.', 'Resumo do histórico do cliente.'],
    dicas: ['Cliente sempre fala com humano se quiser.'],
    erros: ['Forçar bot quando o cliente quer humano.'],
    resumo: 'IA ajuda o atendente. O atendente atende o cliente.',
    exercicio: 'Use IA para classificar 5 tickets seus.',
    narracao: 'Atendimento com IA não substitui empatia — multiplica capacidade.',
    slides: [
      { titulo: 'Onde aplicar', texto: 'Classificação • Sugestão • Resumo • Sentimento' },
      { titulo: 'Regra de ouro', texto: 'Humano sempre disponível.' },
      { titulo: 'Empatia', texto: 'IA acelera, humano conecta.' },
    ],
    quiz: [
      { texto: 'IA substitui o atendente?', opcoes: ['Sim.', 'Não — multiplica.', 'Talvez.', 'Sempre.'], correta: 'b' },
      { texto: 'O cliente deve ter acesso a...', opcoes: ['Humano.', 'Bot apenas.', 'Email apenas.', 'Robô.'], correta: 'a' },
      { texto: 'O que NÃO fazer?', opcoes: ['Forçar bot quando cliente quer humano.', 'Treinar atendente.', 'Medir resultado.', 'Iterar.'], correta: 'a' },
    ],
  }),
]

const M12_aulas: Aula[] = [
  quickAula('m12', {
    id: 'aula-12-1', titulo: 'Aplicação Prática', ordem: 1, duracao_min: 30,
    descricao: 'Projeto integrador: aplique tudo no seu trabalho.',
    objetivo: 'Aplicar técnicas do curso em um caso real seu.',
    explicacao: 'Hora de juntar. Escolha um processo do seu trabalho. Documente como é hoje. Use prompts, automação e IA Generativa para redesenhá-lo. Meça o ganho. Esse é o seu projeto final.',
    exemplos: ['Redesenho do processo de e-mail de cobrança.', 'Pipeline de triagem com IA.', 'Dashboard com IA.'],
    dicas: ['Escolha algo que você executa toda semana — mede ganho rápido.'],
    erros: ['Querer mudar 10 processos. Faça 1, mas faça bem.'],
    resumo: 'Foque em 1 processo. Aplique, meça, documente.',
    exercicio: 'Defina seu projeto: processo escolhido, ganho esperado, prazo.',
    narracao: 'Hora de aplicar. Escolha 1 processo. Transforme-o. Meça.',
    slides: [
      { titulo: 'Projeto final', texto: '1 processo seu. Antes × Depois.' },
      { titulo: 'O que medir', texto: 'Tempo • Qualidade • Custo' },
      { titulo: 'Foco', texto: '1 processo bem feito > 10 pela metade.' },
    ],
    quiz: [
      { texto: 'Quantos processos no projeto final?', opcoes: ['1.', '10.', '100.', '0.'], correta: 'a' },
      { texto: 'O que medir?', opcoes: ['Tempo, qualidade, custo.', 'Cor.', 'Logo.', 'Música.'], correta: 'a' },
      { texto: 'Escolha um processo...', opcoes: ['Que você faz toda semana.', 'Que você nunca faz.', 'Aleatório.', 'Do colega.'], correta: 'a' },
    ],
  }),
  quickAula('m12', {
    id: 'aula-12-2', titulo: 'Plano de Adoção', ordem: 2, duracao_min: 25,
    descricao: 'Como levar IA para a sua equipe.',
    objetivo: 'Estruturar plano de adoção de IA na sua equipe.',
    explicacao: 'Adoção tem 3 pilares: pessoas (treinar), processos (escolher onde aplicar primeiro), políticas (segurança, LGPD, governança). Comece pequeno, mostre ganho, expanda.',
    exemplos: ['Piloto de 30 dias com 3 pessoas.', 'Política de uso interno.', 'Treinamento por área.'],
    dicas: ['Mostre ROI antes de pedir orçamento.'],
    erros: ['Comprar licença antes de saber se vai usar.'],
    resumo: 'Pessoas + Processos + Políticas. Piloto. Mede. Escala.',
    exercicio: 'Esboce um plano de adoção em 1 página.',
    narracao: 'Adoção é jornada. Não evento. Vamos planejar o seu caminho.',
    slides: [
      { titulo: '3 pilares', texto: 'Pessoas • Processos • Políticas' },
      { titulo: 'Piloto', texto: '30 dias, 3 pessoas, 1 processo.' },
      { titulo: 'ROI', texto: 'Mede antes de escalar.' },
    ],
    quiz: [
      { texto: 'Quais os 3 pilares de adoção?', opcoes: ['Pessoas, Processos, Políticas.', 'PC, Mouse, Teclado.', 'Café, Bolo, Sono.', 'Foto, Vídeo, Áudio.'], correta: 'a' },
      { texto: 'Como começar?', opcoes: ['Piloto pequeno.', 'Tudo de uma vez.', 'Comprando licença em massa.', 'Sem treinar.'], correta: 'a' },
      { texto: 'O que mostrar antes de escalar?', opcoes: ['ROI.', 'Logo.', 'Cor.', 'Foto.'], correta: 'a' },
    ],
  }),
  quickAula('m12', {
    id: 'aula-12-3', titulo: 'Certificação e Próximos Passos', ordem: 3, duracao_min: 20,
    descricao: 'Conclua o curso e planeje sua continuidade.',
    objetivo: 'Conquistar o certificado e definir próximos passos.',
    explicacao: 'Parabéns! Você está pronto. Emita seu certificado, atualize seu LinkedIn, e continue aprendendo: novos modelos chegam todo mês. Mantenha uma rotina semanal de experimentação.',
    exemplos: ['Atualizar LinkedIn.', 'Criar rotina de experimentação semanal.', 'Trazer 1 colega para o curso.'],
    dicas: ['IA evolui rápido. Reserve 30 min/semana só para explorar novidades.'],
    erros: ['Parar de praticar.'],
    resumo: 'Certificou? Praticou? Continue. A jornada começa agora.',
    exercicio: 'Defina sua rotina de continuidade: o que estudar a cada semana.',
    narracao: 'Você chegou ao fim. E é só o começo. Parabéns.',
    slides: [
      { titulo: 'Parabéns!', texto: 'Você completou a jornada.' },
      { titulo: 'Próximos passos', texto: 'Atualize LinkedIn • Continue experimentando • Compartilhe' },
      { titulo: 'Rotina', texto: '30 min/semana para explorar.' },
    ],
    quiz: [
      { texto: 'O que fazer após certificar?', opcoes: ['Continuar praticando.', 'Parar.', 'Apagar tudo.', 'Esquecer.'], correta: 'a' },
      { texto: 'IA evolui...', opcoes: ['Rápido — reserve tempo semanal.', 'Lento.', 'Nunca muda.', 'Só de ano em ano.'], correta: 'a' },
      { texto: 'Boa prática contínua?', opcoes: ['Experimentar 1 ferramenta nova / semana.', 'Nada.', 'Esperar.', 'Ler 1 vez por ano.'], correta: 'a' },
    ],
  }),
]

// ===================== M13 / M14 — MÓDULOS DAS APRESENTAÇÕES OFICIAIS =====================
// Conteúdo extraído de public/covers/slides_ferramentas_ia.pptx e slides_social_media_ia.pptx

const M13_aulas: Aula[] = [
  buildAula('m13', {
    id: 'aula-13-1', titulo: 'Agenda Inteligente com IA', ordem: 1, duracao_min: 30,
    descricao: 'Priorize o que importa, elimine o ruído e proteja seu tempo produtivo.',
    descricao_curta: 'Matriz de Eisenhower por IA, time blocking e gestão de convites.',
    objetivo: 'Usar IA para priorizar a semana, criar blocos de tempo e responder convites com estratégia.',
    video_url: '',
    conteudo_html: htmlFromAula({
      objetivo: 'Usar IA para priorizar a semana, criar blocos de tempo e responder convites com estratégia.',
      explicacao: '<p>A IA aplica a Matriz de Eisenhower em segundos: você lista as tarefas da semana, e ela classifica em Q1 (fazer agora), Q2 (agendar), Q3 (delegar) e Q4 (eliminar), estima o tempo de cada uma e sugere um cronograma. Com time blocking, a IA monta blocos de trabalho profundo, reuniões e e-mails respeitando suas preferências de horário.</p>',
      exemplos: [
        'Classificar as 10 tarefas da semana em Q1–Q4 com cronograma de 5 dias úteis.',
        'Criar plano de time blocking com trabalho profundo nas manhãs e buffer entre reuniões.',
        'Recusar um convite de reunião propondo data alternativa com tom respeitoso.',
      ],
      dicas: [
        'Defina seu expediente e preferências no prompt — a IA monta a agenda em volta delas.',
        'Antes de aceitar uma reunião, peça pauta, duração e se sua presença é obrigatória.',
      ],
      erros_comuns: ['Aceitar todos os convites sem filtrar pela matriz de prioridade.'],
      resumo: 'IA classifica prioridades (Eisenhower), monta time blocking e redige respostas a convites — você protege o tempo produtivo.',
      exercicio: 'Liste as 10 tarefas desta semana e peça à IA: classificação Q1–Q4, estimativa de tempo e cronograma para 5 dias.',
    }),
    narracao: 'Sua agenda não precisa mandar em você. Nesta aula, a IA vira sua assistente de priorização.',
    resumo_audio: 'Eisenhower com IA, time blocking e respostas estratégicas a convites de reunião.',
    roteiro_video: 'Demonstrar a classificação Q1–Q4 por IA e a criação de um plano de time blocking semanal.',
    atividade_pratica: 'Monte seu time blocking da próxima semana com IA usando suas tarefas reais.',
    slidesData: [
      { titulo: 'Agenda Inteligente com IA', texto: 'Priorize o que importa, elimine o ruído e proteja seu tempo produtivo.\n• Eisenhower com IA\n• Time Blocking\n• Alertas de Prazo\n• Reagendamentos' },
      { titulo: 'Priorizando a Semana com IA', texto: 'Matriz de Eisenhower aplicada por IA em segundos.\nQ1 · Fazer agora: deadlines vencendo, crises ativas, reuniões críticas.\nQ2 · Agendar: projetos estratégicos, desenvolvimento, planejamento.\nQ3 · Delegar: reuniões de status, pedidos de terceiros, aprovações simples.\nQ4 · Eliminar: reuniões sem pauta, e-mails não urgentes, relatórios automáticos.\nPrompt: "Aqui estão minhas tarefas da semana: [LISTAR]. Classifique em Q1/Q2/Q3/Q4, estime tempo de cada uma e sugira um cronograma para 5 dias úteis."' },
      { titulo: 'Time Blocking com IA', texto: 'Prompt: "Crie um plano de time blocking para minha semana com base nas atividades abaixo. Meu expediente: 8h às 18h."\n• Trabalho profundo: manhãs (9h-12h)\n• Reuniões: terças e quintas à tarde\n• Buffer de 30min entre reuniões\n• Reservar 1h por dia para e-mails' },
      { titulo: 'Resposta a Convites de Reunião', texto: 'Aceitar com pauta: "Aceite o convite de [TÍTULO] e sugira incluir os itens [A,B,C] na pauta. Tom cordial."\nRecusar com alternativa: "Recuse o convite de [TÍTULO] no dia [DATA] por conflito de agenda e proponha [DATA ALT]. Tom respeitoso."\nPedir mais informações: "Antes de aceitar [REUNIÃO], solicite pauta, duração estimada e se minha presença é obrigatória."' },
    ],
    quizData: [
      { texto: 'No método Eisenhower com IA, tarefas Q4 devem ser...', opcoes: ['Feitas agora.', 'Agendadas.', 'Delegadas.', 'Eliminadas.'], correta: 'd' },
      { texto: 'O que é time blocking?', opcoes: ['Bloquear o celular.', 'Reservar blocos de tempo na agenda para tipos de trabalho.', 'Recusar todas as reuniões.', 'Trabalhar sem pausas.'], correta: 'b' },
      { texto: 'Antes de aceitar uma reunião, é estratégico pedir...', opcoes: ['Café.', 'Pauta, duração e se sua presença é obrigatória.', 'Mudança de sala.', 'Lista de presentes.'], correta: 'b' },
    ],
  }),
  buildAula('m13', {
    id: 'aula-13-2', titulo: 'Controle de Tarefas com IA', ordem: 2, duracao_min: 30,
    descricao: 'Transforme reuniões, e-mails e anotações em tarefas acionáveis.',
    descricao_curta: 'Captura, estruturação, relatório diário e delegação com IA.',
    objetivo: 'Capturar tarefas de qualquer fonte, estruturá-las e gerar relatórios de status com IA.',
    video_url: '',
    conteudo_html: htmlFromAula({
      objetivo: 'Capturar tarefas de qualquer fonte, estruturá-las e gerar relatórios de status com IA.',
      explicacao: '<p>E-mails, atas e anotações soltas viram tarefas estruturadas: a IA extrai cada ação com responsável e prazo. Uma tarefa ideal tem título com verbo de ação, contexto, responsável, deadline, dependências e critério de conclusão. No fim do dia, a IA gera seu relatório standup: o que fiz, o que farei, bloqueios e alertas.</p>',
      exemplos: [
        'Extrair de um e-mail todas as ações com responsável e prazo sugerido.',
        'Transformar anotações desorganizadas em lista de tarefas com prioridade e deadline.',
        'Gerar relatório diário no formato standup para enviar ao time.',
      ],
      dicas: [
        'Delegue com contexto: tarefa, entrega esperada, deadline, critério de sucesso e a quem recorrer.',
        'Use a IA para criar lembretes de deadline com o impacto do não cumprimento.',
      ],
      erros_comuns: ['Tarefas sem responsável ou sem critério claro de conclusão.'],
      resumo: 'IA captura, estrutura e acompanha tarefas — de qualquer fonte para uma lista acionável com relatório diário.',
      exercicio: 'Cole as anotações de uma reunião recente e peça à IA todas as ações em formato Quem · O quê · Até quando.',
    }),
    narracao: 'Tarefa esquecida é prazo perdido. Vamos colocar a IA para capturar e cobrar por você.',
    resumo_audio: 'Captura de tarefas de e-mails, atas e anotações; estrutura ideal de tarefa; relatório standup diário.',
    roteiro_video: 'Demonstrar extração de tarefas de uma ata e geração do relatório standup.',
    atividade_pratica: 'Gere seu relatório standup de hoje com IA a partir da sua lista real de tarefas.',
    slidesData: [
      { titulo: 'Capturando Tarefas com IA', texto: 'Fontes de captura:\n• E-mails: "Leia este e-mail e extraia todas as ações que preciso tomar, com responsável e prazo sugerido."\n• Ata de Reunião: "Analise a ata abaixo e liste todas as tarefas por responsável, em formato: Quem · O quê · Até quando."\n• Anotações Livres: "Transforme estas anotações desorganizadas em uma lista de tarefas estruturada com prioridade e deadline."' },
      { titulo: 'Estrutura de Tarefa Ideal', texto: 'Título: verbo de ação + objeto claro\nContexto: por que existe essa tarefa?\nResponsável: quem executa / quem aprova?\nDeadline: data + horário + tipo (hard/soft)\nDependências: o que precisa acontecer antes?\nResultado: como saber se está concluído?' },
      { titulo: 'Relatório Diário (Daily Standup)', texto: 'Prompt: "Com base nas tarefas abaixo, gere meu relatório de status diário no formato standup:\n1. O que fiz hoje (concluídas)\n2. O que farei amanhã (próximas)\n3. Bloqueios (o que está travado e por quê)\n4. Alertas (deadlines em risco)\nTom direto, máx 10 linhas, para enviar ao time e liderança."' },
      { titulo: 'Delegação com Contexto', texto: 'Delegar com clareza: "Preciso delegar a tarefa [NOME] para [PESSOA]. Crie uma mensagem de delegação com: contexto, o que precisa ser entregue, deadline, critério de sucesso e a quem recorrer em caso de dúvida."\nAlerta de deadline: "Crie um lembrete urgente para [PESSOA] sobre a tarefa [NOME] com deadline em [DATA]. Inclua o impacto do não cumprimento e alternativas de prazo."' },
    ],
    quizData: [
      { texto: 'Uma tarefa bem estruturada começa com...', opcoes: ['Um emoji.', 'Verbo de ação + objeto claro.', 'O nome do chefe.', 'A data de criação.'], correta: 'b' },
      { texto: 'O relatório standup contém...', opcoes: ['Apenas elogios.', 'Feito, próximo, bloqueios e alertas.', 'Histórico de 1 ano.', 'Somente prazos.'], correta: 'b' },
      { texto: 'Ao delegar com IA, inclua sempre...', opcoes: ['Pressão e urgência.', 'Contexto, entrega, deadline e critério de sucesso.', 'Só o título da tarefa.', 'Cópia para toda a empresa.'], correta: 'b' },
    ],
  }),
  buildAula('m13', {
    id: 'aula-13-3', titulo: 'Apresentações e Roteiros com IA', ordem: 3, duracao_min: 35,
    descricao: 'Da ideia à apresentação executiva pronta — com estrutura de narrativa profissional.',
    descricao_curta: 'Narrativa, roteiro slide a slide, conteúdo e notas do apresentador.',
    objetivo: 'Construir apresentações completas com IA: narrativa, estrutura, conteúdo por slide e notas de fala.',
    video_url: '',
    conteudo_html: htmlFromAula({
      objetivo: 'Construir apresentações completas com IA: narrativa, estrutura, conteúdo por slide e notas de fala.',
      explicacao: '<p>Antes dos slides, a narrativa: com BAB + PARA você define o problema, a ação desejada do público e o argumento que conecta os dois. A IA gera a estrutura slide a slide com mensagem principal de cada um, e depois desenvolve cada slide: título forte, bullets enxutos, visual sugerido e script de fala de 60 segundos.</p>',
      exemplos: [
        'Gerar estrutura de 8 slides: capa, problema, impacto, solução, como funciona, resultados, investimento, CTA.',
        'Desenvolver um slide específico com título, mensagem, bullets, visual e nota do apresentador.',
      ],
      dicas: [
        'Peça consistência: "Mantenha coerência com o slide anterior [colar texto]".',
        'Notas do apresentador: gancho, dados de suporte, transição, objeções prováveis e call-to-action.',
      ],
      erros_comuns: ['Começar pelos slides sem definir a narrativa e a ação desejada do público.'],
      resumo: 'Narrativa primeiro (BAB + PARA), depois estrutura, conteúdo por slide e notas de fala — tudo acelerado pela IA.',
      exercicio: 'Escolha uma ideia que você precisa apresentar e peça à IA a estrutura completa com mensagem principal de cada slide.',
    }),
    narracao: 'Apresentação boa começa antes do primeiro slide. A IA vira seu co-autor de narrativa.',
    resumo_audio: 'Estrutura de narrativa com BAB e PARA, roteiro slide a slide e notas do apresentador com IA.',
    roteiro_video: 'Do brief à estrutura de 8 slides gerada por IA, com desenvolvimento de um slide completo.',
    atividade_pratica: 'Gere a estrutura de uma apresentação real sua com título e mensagem principal por slide.',
    slidesData: [
      { titulo: 'Apresentações e Roteiros com IA', texto: 'Da ideia à apresentação executiva pronta — com estrutura de narrativa profissional.\n• Estrutura de Narrativa\n• Roteiro Slide a Slide\n• Conteúdo por Seção\n• Notas do Apresentador' },
      { titulo: 'Do Brief ao Roteiro Completo', texto: 'Passo 1 — Definir a narrativa (BAB + PARA):\nB — Antes: qual problema ou contexto a apresentação aborda?\nA — Depois: qual decisão ou ação você quer que o público tome?\nB — Ponte: que argumento conecta os dois?\nPrompt: "Preciso criar uma apresentação de [DURAÇÃO] para [PÚBLICO]. Contexto: [SITUAÇÃO]. Objetivo: que ao final o público [AÇÃO]. Crie título, sumário executivo e estrutura de [N] slides com mensagem principal em 1 frase."' },
      { titulo: 'Estrutura Gerada pela IA', texto: '1. Capa + Contexto\n2. O Problema\n3. Impacto & Urgência\n4. Nossa Solução\n5. Como Funciona\n6. Resultados Esperados\n7. Investimento & Prazo\n8. Próximos Passos + CTA' },
      { titulo: 'Conteúdo por Slide e Notas do Apresentador', texto: 'Prompt: "Para o slide [N] — [TÍTULO], crie:\n1. Título (máx 8 palavras, afirmação forte)\n2. Mensagem principal (1 frase impactante)\n3. Conteúdo (3–5 bullets, máx 10 palavras cada)\n4. Visual sugerido (gráfico ou imagem)\n5. Nota do apresentador (script de fala, 60 segundos)"\nNas notas inclua: gancho de abertura, dados de suporte, transição, antecipação de objeção e call-to-action.' },
    ],
    quizData: [
      { texto: 'O que vem antes de montar os slides?', opcoes: ['Escolher a fonte.', 'Definir a narrativa e a ação desejada do público.', 'Escolher as cores.', 'Imprimir o roteiro.'], correta: 'b' },
      { texto: 'A nota do apresentador gerada pela IA deve conter...', opcoes: ['O texto integral dos slides.', 'Gancho, dados, transição, objeções e CTA.', 'Apenas a duração.', 'Piadas obrigatórias.'], correta: 'b' },
      { texto: 'Para coerência entre slides, peça à IA...', opcoes: ['Slides idênticos.', 'Manter consistência com o slide anterior.', 'Ignorar o contexto.', 'Usar outro idioma.'], correta: 'b' },
    ],
  }),
  buildAula('m13', {
    id: 'aula-13-4', titulo: 'Um Dia de Trabalho com IA Integrada', ordem: 4, duracao_min: 25,
    descricao: 'Como e-mail, agenda, tarefas, planilhas, documentos e apresentações se conectam em um fluxo real.',
    descricao_curta: 'O fluxo completo do dia com IA e o desafio prático integrador.',
    objetivo: 'Integrar as 6 frentes de IA em um fluxo único de trabalho e medir o ganho de tempo.',
    video_url: '',
    conteudo_html: htmlFromAula({
      objetivo: 'Integrar as 6 frentes de IA em um fluxo único de trabalho e medir o ganho de tempo.',
      explicacao: '<p>Quando e-mail, agenda, tarefas, planilhas, documentos e apresentações usam IA de forma integrada, o ganho acumulado chega a cerca de 6h15 por dia — 31h por semana, 125h por mês por colaborador. A IA não substitui: você pensa, decide e cria; ela executa mais rápido o que você já sabe fazer.</p>',
      exemplos: [
        'Triagem matinal de e-mails → tarefas extraídas → agenda priorizada → relatório no fim do dia.',
        'Dados da planilha → sumário executivo → slide de apresentação para a liderança.',
      ],
      dicas: ['Comece integrando duas frentes (e-mail + tarefas) e expanda aos poucos.'],
      erros_comuns: ['Tentar adotar as 6 frentes no mesmo dia e abandonar tudo na primeira semana.'],
      resumo: 'A integração das 6 frentes economiza ~6h15/dia. Você decide, a IA executa.',
      exercicio: 'Complete o desafio integrador: e-mail (10 min), agenda (8), tarefas (8), planilha (8), documento (8) e apresentação (10).',
    }),
    narracao: 'Hora de juntar tudo: um dia inteiro de trabalho com IA do início ao fim.',
    resumo_audio: 'Fluxo integrado de IA nas 6 frentes do dia: até 6h15 economizadas por dia.',
    roteiro_video: 'Simular um dia de trabalho usando IA em cada frente, somando o tempo economizado.',
    atividade_pratica: 'Execute o desafio das 6 frentes com situações reais da sua rotina e anote o tempo economizado.',
    slidesData: [
      { titulo: 'O Que Você Aprende Neste Módulo', texto: '• E-mail com IA: analisar, classificar, redigir respostas, triar por prioridade\n• Agenda Inteligente: organizar por prioridade, time-blocks, reagendamentos\n• Controle de Tarefas: capturar, estruturar, delegar e rastrear\n• Planilhas e Sumários: estrutura, fórmulas, sumário executivo, tendências\n• Documentos e Relatórios: resumir, extrair insights, criar minutas\n• Apresentações e Roteiros: narrativa, roteiro, conteúdo por slide' },
      { titulo: 'Um Dia de Trabalho com IA Integrada', texto: 'Resultado acumulado das 6 ferramentas conectadas em um fluxo real:\n6h15: economizadas por dia com IA\n31h/semana: por colaborador\n125h/mês: por colaborador\n~15 dias: de produtividade recuperados' },
      { titulo: 'Desafio: Dia Completo com IA', texto: '1. E-mail (10 min): cole 5 e-mails e peça classificação, resumo e resposta para o mais urgente.\n2. Agenda (8 min): 10 tarefas da semana → Q1-Q4 + time blocking de 5 dias.\n3. Tarefas (8 min): anotações de reunião → ações com responsável e deadline.\n4. Planilha (8 min): tabela de dados → sumário executivo com insights e anomalias.\n5. Documento (8 min): relatório de 2-3 páginas → resumo + 3 pontos + próximo passo.\n6. Apresentação (10 min): ideia → estrutura completa de slides.' },
      { titulo: 'A IA Não Substitui', texto: 'Você pensa, decide e cria.\nA IA executa mais rápido o que você já sabe fazer.\nE-mail ✓ Agenda ✓ Tarefas ✓ Planilhas ✓ Documentos ✓ Apresentações ✓' },
    ],
    quizData: [
      { texto: 'Qual o papel da IA no fluxo integrado?', opcoes: ['Substituir o profissional.', 'Executar mais rápido o que você já sabe fazer.', 'Tomar decisões finais.', 'Eliminar reuniões.'], correta: 'b' },
      { texto: 'Como adotar as 6 frentes com sucesso?', opcoes: ['Todas no mesmo dia.', 'Começar por duas e expandir aos poucos.', 'Nunca integrar.', 'Só usar e-mail.'], correta: 'b' },
      { texto: 'O ganho estimado da integração completa é de cerca de...', opcoes: ['10 minutos por dia.', '6h15 por dia.', '1h por mês.', 'Nenhum ganho.'], correta: 'b' },
    ],
  }),
]

const M14_aulas: Aula[] = [
  buildAula('m14', {
    id: 'aula-14-1', titulo: 'Instagram com IA', ordem: 1, duracao_min: 40,
    descricao: 'Calendário editorial, legendas, Reels, hashtags, agendamento e métricas com IA.',
    descricao_curta: '7 aplicações práticas — do planejamento à análise de métricas.',
    objetivo: 'Planejar, criar e analisar conteúdo de Instagram com apoio de IA.',
    video_url: '',
    conteudo_html: htmlFromAula({
      objetivo: 'Planejar, criar e analisar conteúdo de Instagram com apoio de IA.',
      explicacao: '<p>A IA cobre todo o ciclo do Instagram: calendário editorial mensal, legendas com gancho + desenvolvimento + CTA + hashtags, roteiros de Reels cena a cena, scripts de carrossel, conjuntos estratégicos de hashtags e análise de métricas do Insights. O agendamento fica por conta do Meta Business Suite (grátis).</p>',
      exemplos: [
        'Calendário editorial do mês com dia, formato, tema, gancho e CTA de cada post.',
        'Roteiro de Reels de 30s com texto na tela, narração, ação visual e duração por cena.',
        'Análise de métricas: o que funciona, o que melhorar e 3 testes A/B.',
      ],
      dicas: [
        'Monte 3 conjuntos de hashtags: alcance amplo (>1M), nicho médio (100k–1M) e nicho específico (<100k).',
        'Gancho nos 3 primeiros segundos do Reels e na 1ª linha da legenda.',
      ],
      erros_comuns: ['Publicar sem calendário e medir nada — consistência supera perfeição.'],
      resumo: 'IA planeja, escreve e analisa; Meta Business Suite agenda de graça; você decide e publica.',
      exercicio: 'Gere o calendário editorial do próximo mês para o seu perfil com o prompt da aula.',
    }),
    narracao: 'Do planejamento ao Reels pronto: o Instagram inteiro acelerado por IA.',
    resumo_audio: 'Calendário editorial, legendas, Reels, hashtags, agendamento e métricas com IA.',
    roteiro_video: 'Gerar calendário, legenda e roteiro de Reels ao vivo com IA.',
    atividade_pratica: 'Crie 1 legenda educativa completa (gancho, desenvolvimento, CTA, hashtags) para um post real.',
    slidesData: [
      { titulo: 'Instagram com IA', texto: '7 aplicações práticas — do planejamento à análise de métricas:\n• Calendário Editorial\n• Legendas & Ganchos\n• Roteiro de Reels\n• Estratégia de Hashtags\n• Agendamento Automático\n• Métricas com IA' },
      { titulo: 'Planejamento Mensal com IA', texto: '1. Defina o perfil: nicho, público, tom, objetivo, frequência.\n2. Use o prompt: cole no ChatGPT ou Claude.\n3. Exporte para planilha: tabela com status e responsável.\n4. Refine: datas comemorativas e tendências.\nPrompt: "Atue como estrategista de redes sociais do nicho [NICHO]. Crie calendário editorial para [MÊS] com [N] posts/semana. Para cada post: dia, formato (feed/carrossel/Reels/Stories), tema, gancho de abertura, tipo de CTA. Organize em tabela."' },
      { titulo: 'Legendas de Alto Engajamento', texto: 'Estrutura ideal:\nGancho: para o scroll na 1ª linha\nDesenvolvimento: parágrafos curtos\nCTA: salvar, comentar, clicar no link\nHashtags: 5–15 relevantes ao nicho\nPrompt: "Crie legenda para post educativo sobre [TEMA]. Estrutura: (1) gancho que gere curiosidade, (2) 3–4 parágrafos curtos e didáticos, (3) CTA para salvar ou comentar palavra-chave, (4) 10 hashtags do nicho. Limite: 2200 caracteres."' },
      { titulo: 'Roteiros de Reels e Carrossel', texto: 'Reels: "Crie roteiro para Reels de [30s/60s] sobre [TEMA]. Para cada cena: texto na tela, narração, ação visual e duração. Gancho nos primeiros 3 segundos. Terminar com CTA claro."\nCarrossel: "Crie script completo do carrossel sobre [TEMA]. Para cada slide: número e título (máx 6 palavras), texto do corpo (máx 3 linhas), visual sugerido. Slide 1 = capa com gancho forte. Último slide = CTA."' },
      { titulo: 'Hashtags e Agendamento Automático', texto: 'Conjuntos de hashtags:\n• Alcance amplo: >1M posts · 5 hashtags\n• Nicho médio: 100k–1M posts · 5 hashtags\n• Nicho específico: <100k posts · 5 hashtags\n• Localidade: cidade/estado · 2–3 hashtags\nMeta Business Suite (grátis): business.facebook.com → Criar Post → colar legenda da IA → Agendar → calendário visual.' },
      { titulo: 'Automação e Métricas', texto: 'Resposta automática de DM: Configurações → Ferramentas de Negócios → Mensagens Automáticas → ative boas-vindas com template gerado pela IA. ManyChat para automação avançada por palavra-chave.\nPrompt de métricas: "Analise as métricas do Instagram e forneça: (1) o que está funcionando, (2) o que melhorar, (3) padrões dos posts de maior engajamento, (4) estratégia para o próximo mês, (5) 3 testes A/B."' },
    ],
    quizData: [
      { texto: 'A 1ª linha de uma legenda deve conter...', opcoes: ['Hashtags.', 'O gancho que para o scroll.', 'A assinatura.', 'O link.'], correta: 'b' },
      { texto: 'Qual ferramenta gratuita agenda posts do Instagram?', opcoes: ['Photoshop.', 'Meta Business Suite.', 'Excel.', 'Zapier.'], correta: 'b' },
      { texto: 'Um bom mix de hashtags combina...', opcoes: ['Só as mais populares.', 'Alcance amplo + nicho médio + nicho específico + localidade.', 'Hashtags aleatórias.', 'Nenhuma hashtag.'], correta: 'b' },
    ],
  }),
  buildAula('m14', {
    id: 'aula-14-2', titulo: 'LinkedIn com IA', ordem: 2, duracao_min: 40,
    descricao: 'Autoridade profissional, networking e geração de oportunidades com IA.',
    descricao_curta: 'Perfil otimizado, 4 formatos de post, mensagens de conexão e agendamento.',
    objetivo: 'Otimizar o perfil, criar posts de alto impacto e fazer networking estratégico com IA.',
    video_url: '',
    conteudo_html: htmlFromAula({
      objetivo: 'Otimizar o perfil, criar posts de alto impacto e fazer networking estratégico com IA.',
      explicacao: '<p>No LinkedIn, a IA otimiza headline e resumo, gera posts em 4 formatos (autoridade, storytelling, posicionamento e conquista), escreve mensagens de conexão que são aceitas e sequências de follow-up que geram oportunidades. O agendamento pode ser nativo (ícone de relógio) ou via Buffer gratuito.</p>',
      exemplos: [
        '5 opções de headline combinando cargo + resultado + diferencial + palavras-chave.',
        'Post de autoridade com gancho forte, 3 insights práticos, caso real e pergunta para debate.',
        'Sequência de 3 mensagens: agradecer, aprofundar e pedir a reunião de forma natural.',
      ],
      dicas: [
        'Mensagem de conexão: mencione algo específico do perfil, 1 frase de motivo, sem pitch — máx 300 caracteres.',
        'Resumo "Sobre": impacto na 1ª frase, trajetória, conquistas com números, valores e CTA.',
      ],
      erros_comuns: ['Enviar pitch de venda na primeira mensagem de conexão.'],
      resumo: 'Perfil otimizado + posts consistentes + networking com contexto = autoridade e oportunidades.',
      exercicio: 'Gere 5 headlines para o seu perfil com o prompt da aula e escolha a melhor.',
    }),
    narracao: 'LinkedIn é vitrine profissional. Com IA, sua autoridade cresce post a post.',
    resumo_audio: 'Headline e resumo otimizados, 4 formatos de post, mensagens de conexão e agendamento.',
    roteiro_video: 'Otimizar um perfil real e gerar um post de autoridade com IA.',
    atividade_pratica: 'Escreva e publique 1 post de autoridade gerado e revisado com IA.',
    slidesData: [
      { titulo: 'LinkedIn com IA', texto: 'Autoridade profissional · Networking · Geração de oportunidades\n• Otimizar Perfil\n• Posts & Carrosséis\n• Networking & DMs\n• Calendário & Agendamento\n• Análise de Métricas' },
      { titulo: 'Headline, Resumo e Cargos com IA', texto: 'Headline: "Crie 5 headlines para LinkedIn de [CARGO]. Área: [ÁREA]. Competências: [3]. Diferencial: [ÚNICO]. Objetivo: [RECOLOCAÇÃO/AUTORIDADE/NEGÓCIOS]. Máx 220 caracteres, combine cargo + resultado + diferencial + palavras-chave."\nSeção Sobre (resumo):\n1ª frase: o que você faz e para quem (impacto)\nTrajetória: 2–3 linhas do caminho\nConquistas: realizações com números\nValores: forma de trabalho\nCTA: como entrar em contato\nLimite: 2600 caracteres · tom profissional + humano' },
      { titulo: 'Posts de Alto Impacto — 4 Formatos', texto: 'Autoridade: gancho forte + 3 pontos com insight prático + caso real + pergunta para debate (800–1200 caracteres).\nStorytelling: abertura no momento mais tenso → contexto → ação → resultado + lição → aplicação prática.\nPosicionamento: abertura polêmica → por que a maioria erra → meu argumento → reconhecer perspectiva oposta → CTA para debate.\nMarco/Conquista: comece pelo esforço e aprendizado, agradeça de forma específica, termine com reflexão útil.' },
      { titulo: 'Conexões e Follow-ups com IA', texto: 'Mensagem de conexão: "Crie mensagem de conexão LinkedIn para [CARGO]. Contexto: [COMO CONHECE]. Pontos em comum: [SETOR/CIDADE]. Regras: mencione algo específico do perfil, 1 frase de motivo, sem pitch. Limite: 300 caracteres."\nSequência de 3 mensagens:\nMSG 1 (após aceitação): agradecer + compartilhar algo relevante\nMSG 2 (dia 7–10): aprofundar relação + curiosidade sobre o trabalho deles\nMSG 3 (dia 14): o pedido (reunião/call) de forma natural' },
      { titulo: 'Agendando Posts e Planejando o Mês', texto: 'LinkedIn nativo: Iniciar post → ícone de relógio ⏰ → escolher data e hora.\nBuffer (grátis): buffer.com → conectar perfil → criar posts em lote → agendar pelo calendário visual.\nPrompt: "Crie calendário de 4 semanas para [CARGO/PERFIL]. Objetivo: [AUTORIDADE/NETWORKING/NEGÓCIOS]. Frequência: [N] posts/semana. Para cada post: dia, formato, tema, gancho, objetivo. Varie formatos: texto, carrossel, poll, artigo."' },
    ],
    quizData: [
      { texto: 'Uma boa mensagem de conexão...', opcoes: ['Já vende no primeiro contato.', 'Menciona algo específico do perfil e não faz pitch.', 'É genérica para todos.', 'Tem 2000 caracteres.'], correta: 'b' },
      { texto: 'O post de storytelling abre com...', opcoes: ['A conclusão.', 'O momento mais tenso da história.', 'Hashtags.', 'Um pedido de like.'], correta: 'b' },
      { texto: 'Na sequência de networking, o pedido de reunião vem...', opcoes: ['Na 1ª mensagem.', 'Na 3ª mensagem, de forma natural.', 'Nunca.', 'Antes da conexão.'], correta: 'b' },
    ],
  }),
  buildAula('m14', {
    id: 'aula-14-3', titulo: 'Instagram vs LinkedIn: Estratégia por Plataforma', ordem: 3, duracao_min: 20,
    descricao: 'Objetivo, conteúdo e ferramentas de cada plataforma — lado a lado.',
    descricao_curta: 'Quando usar cada rede e como manter a consistência.',
    objetivo: 'Escolher a plataforma, o formato e a frequência certos para cada objetivo.',
    video_url: '',
    conteudo_html: htmlFromAula({
      objetivo: 'Escolher a plataforma, o formato e a frequência certos para cada objetivo.',
      explicacao: '<p>Instagram: marca, venda B2C e engajamento, com conteúdo visual e emocional (Reels, carrossel, Stories), 3–7× por semana. LinkedIn: autoridade, networking, B2B e carreira, com conteúdo educativo, cases e dados (post de texto, carrossel PDF, poll), 3–5× por semana. Em ambos, a IA escreve — você decide, publica e se relaciona.</p>',
      exemplos: [
        'Lançamento B2C → Reels no Instagram; case de projeto → post de autoridade no LinkedIn.',
        'Mesmo tema adaptado: tom leve e visual no Instagram, profissional e com dados no LinkedIn.',
      ],
      dicas: ['Consistência supera perfeição: comece com 1 post, depois 3, depois o mês inteiro.'],
      erros_comuns: ['Postar o mesmo texto idêntico nas duas plataformas sem adaptar tom e formato.'],
      resumo: 'Cada plataforma tem objetivo, tom e formato próprios. A IA acelera a produção; a estratégia é sua.',
      exercicio: 'Pegue 1 tema do seu trabalho e crie com IA duas versões: uma para Instagram e uma para LinkedIn.',
    }),
    narracao: 'Mesma mensagem, plataformas diferentes. Aprenda a adaptar em vez de duplicar.',
    resumo_audio: 'Instagram para B2C e engajamento; LinkedIn para autoridade e B2B. Adapte tom e formato.',
    roteiro_video: 'Comparar lado a lado o mesmo tema publicado nas duas plataformas.',
    atividade_pratica: 'Monte seu plano: qual plataforma priorizar, frequência e os 4 primeiros temas.',
    slidesData: [
      { titulo: 'O Que Usar em Cada Plataforma', texto: 'Objetivo — Instagram: marca, venda B2C, engajamento · LinkedIn: autoridade, networking, B2B, carreira\nConteúdo que engaja — Instagram: visual, emocional, entretenimento · LinkedIn: educativo, cases, opinião, dados\nFormatos — Instagram: Reels, carrossel, Stories · LinkedIn: post de texto, carrossel PDF, poll\nTom — Instagram: leve, próximo, visual · LinkedIn: profissional, direto, com dados\nFrequência — Instagram: 3–7×/semana · LinkedIn: 3–5×/semana' },
      { titulo: 'Ferramentas de IA por Plataforma', texto: 'Instagram: ChatGPT/Claude para legenda + Meta Business Suite para agendar.\nLinkedIn: ChatGPT/Claude para post + Buffer ou agendamento nativo.\nAutomação permitida — Instagram: ManyChat para DMs com palavra-chave · LinkedIn: agendamento de posts.\nAnálise — Instagram Insights → prompt de análise · LinkedIn Analytics → prompt de estratégia.' },
      { titulo: 'Consistência Supera Perfeição', texto: 'Comece com 1 post. Depois 3. Depois o mês inteiro.\nA IA escreve. Você decide, publica e se relaciona.\nInstagram ✓ LinkedIn ✓ Legendas ✓ Reels ✓ Hashtags ✓ Automação ✓' },
    ],
    quizData: [
      { texto: 'Para gerar autoridade B2B, a melhor plataforma é...', opcoes: ['Instagram.', 'LinkedIn.', 'Stories.', 'ManyChat.'], correta: 'b' },
      { texto: 'O conteúdo que mais engaja no Instagram é...', opcoes: ['Educativo com dados.', 'Visual e emocional.', 'Relatórios técnicos.', 'Artigos longos.'], correta: 'b' },
      { texto: '"Consistência supera perfeição" significa...', opcoes: ['Publicar qualquer coisa.', 'Manter frequência regular em vez de esperar o post perfeito.', 'Nunca revisar.', 'Postar 1 vez por ano.'], correta: 'b' },
    ],
  }),
]

// ===================== EXPORT FINAL =====================

export const mockModulos: Modulo[] = [
  { id: 'm01', titulo: 'M01 - Fundamentos da IA', descricao: 'Conceitos básicos, IA no cotidiano e diferença entre IA e automação.', ordem: 1, carga_horaria: 4, ativo: true, created_at: '2024-01-01', aulas: M01_aulas, cover_image: '/covers/m01-fundamentos-v2.webp' },
  { id: 'm02', titulo: 'M02 - Conceitos Essenciais', descricao: 'Machine Learning, Deep Learning, IA Generativa e LLMs.', ordem: 2, carga_horaria: 5, ativo: true, created_at: '2024-01-01', aulas: M02_aulas, cover_image: '/covers/m02-conceitos-v2.webp' },
  { id: 'm03', titulo: 'M03 - Ferramentas de IA', descricao: 'ChatGPT, Claude, Gemini, Copilot e Perplexity.', ordem: 3, carga_horaria: 4, ativo: true, created_at: '2024-01-01', aulas: M03_aulas, cover_image: '/covers/m03-ferramentas-v2.webp' },
  { id: 'm04', titulo: 'M04 - Segurança e LGPD', descricao: 'Dados sensíveis, listas verde e vermelha, boas práticas.', ordem: 4, carga_horaria: 3, ativo: true, created_at: '2024-01-01', aulas: M04_aulas, cover_image: '/covers/m04-seguranca-v2.webp' },
  { id: 'm05', titulo: 'M05 - Engenharia de Prompt', descricao: 'Método CIFE, estrutura de prompts e exemplos práticos.', ordem: 5, carga_horaria: 5, ativo: true, created_at: '2024-01-01', aulas: M05_aulas, cover_image: '/covers/m05-prompt-v2.webp' },
  { id: 'm06', titulo: 'M06 - Técnicas Avançadas', descricao: 'Personas, cadeias de prompts, análise e criação.', ordem: 6, carga_horaria: 5, ativo: true, created_at: '2024-01-01', aulas: M06_aulas, cover_image: '/covers/m06-tecnicas-avancadas-v2.webp' },
  { id: 'm07', titulo: 'M07 - Documentação Corporativa', descricao: 'E-mails, relatórios, atas e comunicados com IA.', ordem: 7, carga_horaria: 4, ativo: true, created_at: '2024-01-01', aulas: M07_aulas, cover_image: '/covers/m07-documentos-v2.webp' },
  { id: 'm08', titulo: 'M08 - IA para Excel', descricao: 'Fórmulas, tabelas, dashboards e análise de dados.', ordem: 8, carga_horaria: 4, ativo: true, created_at: '2024-01-01', aulas: M08_aulas, cover_image: '/covers/m08-excel-v2.webp' },
  { id: 'm09', titulo: 'M09 - Automação', descricao: 'Zapier, Make e Power Automate com IA.', ordem: 9, carga_horaria: 5, ativo: true, created_at: '2024-01-01', aulas: M09_aulas, cover_image: '/covers/m09-automacao-v2.webp' },
  { id: 'm10', titulo: 'M10 - Processos Administrativos', descricao: 'POP, fluxogramas e checklists com IA.', ordem: 10, carga_horaria: 4, ativo: true, created_at: '2024-01-01', aulas: M10_aulas, cover_image: '/covers/m10-processos-v2.webp' },
  { id: 'm11', titulo: 'M11 - Casos de Uso por Área', descricao: 'RH, Financeiro, Compras, Operações e Atendimento.', ordem: 11, carga_horaria: 6, ativo: true, created_at: '2024-01-01', aulas: M11_aulas, cover_image: '/covers/m11-casos-uso-v2.webp' },
  { id: 'm12', titulo: 'M12 - Projeto Final', descricao: 'Aplicação prática, plano de adoção e certificação.', ordem: 12, carga_horaria: 5, ativo: true, created_at: '2024-01-01', aulas: M12_aulas, cover_image: '/covers/m12-projeto-final-v2.webp' },
  { id: 'm13', titulo: 'M13 - Produtividade com IA', descricao: 'Agenda inteligente, controle de tarefas, apresentações e o fluxo do dia integrado com IA.', ordem: 13, carga_horaria: 4, ativo: true, created_at: '2024-01-01', aulas: M13_aulas, cover_image: '/covers/m13-produtividade-v2.webp' },
  { id: 'm14', titulo: 'M14 - Instagram & LinkedIn com IA', descricao: 'Conteúdo, legendas, hashtags, automações, networking e calendário editorial com IA.', ordem: 14, carga_horaria: 4, ativo: true, created_at: '2024-01-01', aulas: M14_aulas, cover_image: '/covers/m14-instagram-linkedin-v2.webp' },
]

// ===================== SLIDES DAS APRESENTAÇÕES OFICIAIS =====================
// Conteúdo real extraído dos decks em public/covers:
//   slides_ia_administrativo.pptx  → M01–M05, M08–M12 (curso base, 12 módulos)
//   slides_estruturas_prompt.pptx  → M05/M06 (frameworks CREATE, RTF, CoT, RISEN, APE, TRACE, BAB, PARA)
//   slides_ferramentas_ia.pptx     → M06/M07/M08 (e-mail, documentos, planilhas) e M13
//   slides_office_passo_a_passo.pptx → M07/M08 (Word, Excel, Outlook, Gmail)
//   slides_social_media_ia.pptx    → M14 (Instagram & LinkedIn)
const officialSlides: Record<string, { titulo: string; texto: string; imagem_url?: string }[]> = {
  // ── M01 · slides_ia_administrativo (slides 2–5) ──
  'aula-1-1': [
    { titulo: 'IA em uma Frase Simples', texto: 'Inteligência Artificial é uma ferramenta que aprende com exemplos e ajuda você a ler, resumir, escrever, organizar e decidir melhor. Pense nela como um assistente que prepara um rascunho para você revisar.', imagem_url: '/slides/m01/aula-1-1-01.png' },
    { titulo: 'Antes e Depois da IA', texto: 'Antes: você fazia tudo manualmente, começava do zero e gastava tempo organizando ideias. Com IA: você entrega contexto, recebe um primeiro rascunho e usa seu julgamento para corrigir, melhorar e aprovar.', imagem_url: '/slides/m01/aula-1-1-02.png' },
    { titulo: 'O Caminho Correto', texto: '1. Explique a tarefa em palavras simples\n2. Dê contexto: para quem, objetivo e formato\n3. Peça uma primeira versão\n4. Revise nomes, números e tom\n5. Use apenas depois da sua aprovação', imagem_url: '/slides/m01/aula-1-1-03.png' },
    { titulo: 'Exemplo: E-mail Longo', texto: 'Você cola um e-mail grande e pede: "resuma em 3 linhas e liste o que eu preciso responder". A IA organiza a informação. Você confere se ela entendeu certo e decide a resposta final.', imagem_url: '/slides/m01/aula-1-1-04.png' },
    { titulo: 'Regra de Ouro', texto: 'IA ajuda, mas você decide. Use a IA para acelerar o começo da tarefa, não para desligar sua atenção. Sempre revise informações importantes antes de enviar para cliente, colega ou liderança.', imagem_url: '/slides/m01/aula-1-1-05.png' },
  ],
  'aula-1-2': [
    { titulo: 'Você Já Usa IA', texto: 'A IA não está só em ferramentas avançadas. Ela aparece no celular, no banco, no e-mail, no mapa e nas plataformas que você usa todos os dias, muitas vezes sem perceber.', imagem_url: '/slides/m01/aula-1-2-01.png' },
    { titulo: 'Antes Invisível, Agora Conversável', texto: 'Antes a IA trabalhava escondida: filtrava spam, sugeria rotas e recomendava vídeos. Agora você pode conversar com ela diretamente e pedir ajuda para tarefas do trabalho.', imagem_url: '/slides/m01/aula-1-2-02.png' },
    { titulo: 'Como Reconhecer IA', texto: '1. A ferramenta sugere algo para você?\n2. Ela aprende com seu comportamento?\n3. Ela organiza ou classifica informações?\n4. Ela gera texto, imagem, resumo ou resposta?\nSe sim, provavelmente existe IA ali.', imagem_url: '/slides/m01/aula-1-2-03.png' },
    { titulo: 'Exemplo no Escritório', texto: 'No e-mail, a IA pode separar spam, sugerir resposta, resumir uma conversa longa e destacar uma mensagem urgente. Você continua conferindo antes de responder.', imagem_url: '/slides/m01/aula-1-2-04.png' },
    { titulo: 'Prática de Hoje', texto: 'Abra três ferramentas que você usa no trabalho e procure recursos de IA. Anote: onde ela aparece, qual tarefa ela facilita e o que você ainda precisa revisar manualmente.', imagem_url: '/slides/m01/aula-1-2-05.png' },
  ],
  'aula-1-3': [
    { titulo: 'IA Não É Automação Comum', texto: 'Automação tradicional segue uma regra fixa. IA interpreta contexto e ajuda quando a situação muda. As duas são úteis, mas resolvem problemas diferentes.', imagem_url: '/slides/m01/aula-1-3-01.png' },
    { titulo: 'Antes: Regra Fixa', texto: 'Na automação comum, você define: "se chegar e-mail do fornecedor, mover para a pasta Compras". Ela funciona muito bem quando a regra é clara e repetida.', imagem_url: '/slides/m01/aula-1-3-02.png' },
    { titulo: 'Com IA: Interpretação', texto: 'Com IA, você pode pedir: "leia estes e-mails e separe por urgência". Ela compara linguagem, contexto e intenção. Depois, você revisa a classificação.', imagem_url: '/slides/m01/aula-1-3-03.png' },
    { titulo: 'Escolha em 3 Perguntas', texto: '1. A tarefa tem regra clara? Use automação\n2. A tarefa exige entender texto ou contexto? Use IA\n3. Precisa decidir e executar? Use IA para decidir e automação para executar', imagem_url: '/slides/m01/aula-1-3-04.png' },
    { titulo: 'O Melhor dos Dois Mundos', texto: 'Use IA para entender, resumir ou classificar. Use automação para mover, enviar, registrar ou avisar. O profissional acompanha o processo e corrige quando necessário.', imagem_url: '/slides/m01/aula-1-3-05.png' },
  ],
  // ── M02 · Conceitos Essenciais ──
  'aula-2-1': [
    { titulo: 'Machine Learning', texto: 'Machine Learning é aprender com exemplos, não com regras escritas uma por uma. Em vez de programar cada situação, você mostra dados e a IA procura padrões para prever ou classificar novos casos.', imagem_url: '/slides/m02/aula-2-1-01.png' },
    { titulo: 'Aprendizado Supervisionado', texto: 'No aprendizado supervisionado, a IA aprende com exemplos que já têm resposta correta. É como ensinar com gabarito: "este e-mail é spam", "este não é". Depois ela tenta classificar novos e-mails.', imagem_url: '/slides/m02/aula-2-1-02.png' },
    { titulo: 'Não-Supervisionado', texto: 'No não-supervisionado, a IA recebe dados sem rótulos prontos e tenta encontrar grupos ou padrões escondidos. Um exemplo é agrupar clientes parecidos para entender comportamentos diferentes.', imagem_url: '/slides/m02/aula-2-1-03.png' },
    { titulo: 'Aprendizado por Reforço', texto: 'No aprendizado por reforço, a IA tenta uma ação, recebe recompensa ou erro e ajusta a próxima tentativa. Ela melhora praticando, como em jogos, robótica ou simulações de decisão.', imagem_url: '/slides/m02/aula-2-1-04.png' },
    { titulo: 'Dado É Tudo', texto: 'A qualidade dos dados define a qualidade do resultado. Dado bom ajuda a IA a acertar. Dado ruim, incompleto ou enviesado pode gerar previsões erradas e decisões injustas.', imagem_url: '/slides/m02/aula-2-1-05.png' },
  ],
  'aula-2-2': [
    { titulo: 'Rede Neural', texto: 'Uma rede neural processa informação em camadas. A entrada passa por pequenos cálculos conectados e cada camada transforma um pouco o sinal até chegar a um resultado útil.', imagem_url: '/slides/m02/aula-2-2-01.png' },
    { titulo: 'Deep = Muitas Camadas', texto: 'Deep Learning é uma rede neural com muitas camadas. Quanto mais camadas, mais ricos podem ser os padrões capturados, como formas em imagens, nuances em textos e relações complexas.', imagem_url: '/slides/m02/aula-2-2-02.png' },
    { titulo: 'Onde Aparece', texto: 'Deep Learning aparece em ferramentas comuns: chatbots que entendem contexto, tradutores automáticos que preservam sentido e reconhecimento facial que identifica padrões em imagens.', imagem_url: '/slides/m02/aula-2-2-03.png' },
    { titulo: 'Limites', texto: 'Deep Learning não é consciência, não é AGI e não entende como uma pessoa. Ele calcula padrões de forma sofisticada e por isso ainda precisa de supervisão humana.', imagem_url: '/slides/m02/aula-2-2-04.png' },
    { titulo: 'Modelos Pré-Treinados', texto: 'Você não precisa treinar uma rede neural do zero. Hoje, modelos prontos aparecem em ferramentas que escrevem, traduzem, resumem e analisam documentos para uso no trabalho.', imagem_url: '/slides/m02/aula-2-2-05.png' },
  ],
  'aula-2-3': [
    { titulo: 'IA Generativa', texto: 'IA Generativa cria conteúdo novo, como texto, imagem, código e áudio. Ela não apenas classifica: ela produz uma primeira versão que você pode revisar e melhorar.', imagem_url: '/slides/m02/aula-2-3-01.png' },
    { titulo: 'LLM', texto: 'LLM significa Modelo de Linguagem Grande. Ele foi treinado com muitos textos, aprende padrões de linguagem e gera respostas prevendo a próxima palavra de forma muito precisa.', imagem_url: '/slides/m02/aula-2-3-02.png' },
    { titulo: 'Ferramentas com LLM', texto: 'ChatGPT, Claude, Gemini e Copilot usam modelos de linguagem para responder pedidos. A lógica é parecida: você dá contexto e instrução, recebe uma resposta e revisa antes de usar.', imagem_url: '/slides/m02/aula-2-3-03.png' },
    { titulo: 'Cuidado: Alucinação', texto: 'A IA pode inventar datas, números, links, leis ou nomes com aparência de certeza. Sempre verifique informações importantes em fonte confiável antes de publicar ou decidir.', imagem_url: '/slides/m02/aula-2-3-04.png' },
    { titulo: 'Boa Prática', texto: 'Trate a IA como um estagiário inteligente: dê contexto, explique a tarefa, peça o formato desejado e revise dados, tom e sentido antes de enviar ou compartilhar.', imagem_url: '/slides/m02/aula-2-3-05.png' },
  ],
  // ── M03 · Ferramentas de IA ──
  'aula-3-1': [
    { titulo: 'ChatGPT na Prática', texto: 'O ChatGPT funciona como um assistente de conversa para tarefas de escritório. Você escreve um pedido, a IA organiza uma resposta e você revisa antes de usar.', imagem_url: '/slides/m03/aula-3-1-01.png' },
    { titulo: 'O Que Ele Faz Bem', texto: 'Ele ajuda muito em tarefas de texto: escrever e-mails, resumir mensagens longas, traduzir, analisar textos e gerar ideias. Comece por tarefas simples e revise sempre.', imagem_url: '/slides/m03/aula-3-1-02.png' },
    { titulo: 'O Que Ele Não Sabe', texto: 'O ChatGPT não acessa sozinho seus arquivos internos, dados da empresa ou números sem fonte. Se você não der contexto suficiente, ele pode adivinhar errado.', imagem_url: '/slides/m03/aula-3-1-03.png' },
    { titulo: 'Truque de Ouro', texto: 'Use a fórmula: contexto + papel + objetivo + restrições. Explique quem você é, o que precisa, como quer receber e quais limites a resposta deve respeitar.', imagem_url: '/slides/m03/aula-3-1-04.png' },
    { titulo: 'Prática: 3 Tons', texto: 'Cole um e-mail seu e peça três versões: formal, amigável e direta. Compare os tons, escolha o melhor para o público e ajuste antes de enviar.', imagem_url: '/slides/m03/aula-3-1-05.png' },
  ],
  'aula-3-2': [
    { titulo: 'Claude', texto: 'Claude é uma alternativa forte para documentos longos, análises cuidadosas e respostas bem estruturadas. Use quando precisar de profundidade e organização.', imagem_url: '/slides/m03/aula-3-2-01.png' },
    { titulo: 'Gemini', texto: 'Gemini se destaca quando a tarefa envolve Google Workspace, pesquisa atualizada e integração com ferramentas como Gmail, Docs e Drive. Ainda assim, revise a resposta.', imagem_url: '/slides/m03/aula-3-2-02.png' },
    { titulo: 'Quando Usar Cada Um', texto: 'ChatGPT é versátil para criação e conversa. Claude costuma ajudar em análises longas. Gemini é útil para pesquisa atualizada e integração com o ambiente Google.', imagem_url: '/slides/m03/aula-3-2-03.png' },
    { titulo: 'Compare o Mesmo Prompt', texto: 'Teste a mesma tarefa em três ferramentas e compare estilo, profundidade e velocidade. Essa prática ajuda a escolher a melhor opção antes de pagar uma versão Pro.', imagem_url: '/slides/m03/aula-3-2-04.png' },
    { titulo: 'Erro Comum', texto: 'Não trate todas as ferramentas como iguais. Cada uma tem forças diferentes. Escolher pela tarefa reduz retrabalho e melhora a qualidade da revisão.', imagem_url: '/slides/m03/aula-3-2-05.png' },
  ],
  'aula-3-3': [
    { titulo: 'Microsoft Copilot', texto: 'Copilot é a IA integrada ao Microsoft 365. Ele trabalha dentro de arquivos e aplicativos como Word, Excel, Outlook e Teams, sempre com revisão humana.', imagem_url: '/slides/m03/aula-3-3-01.png' },
    { titulo: 'Onde o Copilot Aparece', texto: 'No Word ele revisa texto. No Excel analisa dados. No Outlook ajuda com e-mails. No Teams resume reuniões. No PowerPoint apoia apresentações.', imagem_url: '/slides/m03/aula-3-3-02.png' },
    { titulo: 'Superpoder: Contexto', texto: 'A força do Copilot é estar dentro do fluxo de trabalho. Ele pode usar o contexto do arquivo aberto, mas funciona melhor quando documentos e planilhas estão organizados.', imagem_url: '/slides/m03/aula-3-3-03.png' },
    { titulo: 'Copilot em Ação', texto: 'Peça ações claras: no Word, reescreva formal; no Excel, mostre tendência; no Teams, liste próximos passos. Depois confira se a sugestão faz sentido.', imagem_url: '/slides/m03/aula-3-3-04.png' },
    { titulo: 'Copilot Não Substitui Você', texto: 'Copilot assiste, mas você decide. Verifique dados, revise alterações, confirme permissões e aprove o conteúdo antes de enviar ou compartilhar.', imagem_url: '/slides/m03/aula-3-3-05.png' },
  ],
  'aula-3-4': [
    { titulo: 'Perplexity AI', texto: 'Perplexity é uma IA de pesquisa com fontes citadas. Ela ajuda a transformar uma pergunta em resposta organizada, mas as fontes precisam ser abertas e verificadas.', imagem_url: '/slides/m03/aula-3-4-01.png' },
    { titulo: 'Quando Usar Perplexity', texto: 'Use Perplexity para pesquisa de mercado, notícias do setor e levantamento de concorrentes. Ele é útil quando você precisa de informação atual e verificável.', imagem_url: '/slides/m03/aula-3-4-02.png' },
    { titulo: 'Sempre Confira as Fontes', texto: 'Antes de citar uma resposta, clique no link, veja a data, confirme a origem e compare com outra fonte. Não use apenas o resumo gerado pela IA.', imagem_url: '/slides/m03/aula-3-4-03.png' },
    { titulo: 'Busca + Conversa', texto: 'A busca tradicional entrega muitos links. A IA de pesquisa organiza um resumo com fontes. Isso acelera o trabalho, mas a validação continua sendo sua.', imagem_url: '/slides/m03/aula-3-4-04.png' },
    { titulo: 'Prática com Fontes', texto: 'Pesquise uma tendência, abra três fontes e anote o que foi confirmado. Uma boa pesquisa termina com evidência verificável, não só com uma resposta bonita.', imagem_url: '/slides/m03/aula-3-4-05.png' },
  ],
  // ── M04 · Segurança e LGPD ──
  'aula-4-1': [
    { titulo: 'LGPD em 1 Frase', texto: 'A LGPD é a lei que protege dados pessoais no Brasil. Se uma informação identifica uma pessoa, como nome, CPF, e-mail ou telefone, ela exige cuidado antes de ser usada com IA.', imagem_url: '/slides/m04/aula-4-1-01.png' },
    { titulo: 'IA Também Envolve Dados', texto: 'Quando você cola informação em uma ferramenta de IA, pode estar enviando dados para terceiros. Usar IA não elimina responsabilidade sobre clientes, funcionários e contratos.', imagem_url: '/slides/m04/aula-4-1-02.png' },
    { titulo: 'Regra de Ouro', texto: 'Dado pessoal em IA externa exige base legal, necessidade e cuidado. Antes de enviar, pergunte: tem autorização, é necessário, posso anonimizar e a ferramenta é corporativa?', imagem_url: '/slides/m04/aula-4-1-03.png' },
    { titulo: 'Anonimize Antes', texto: 'Antes de usar IA, troque dados reais por exemplos fictícios. Cliente A, Funcionário B e Empresa X ajudam a preservar o contexto sem expor pessoas reais.', imagem_url: '/slides/m04/aula-4-1-04.png' },
    { titulo: 'Prática LGPD', texto: 'Liste os dados que você usa no trabalho, classifique o risco e escolha a ação: pode usar, precisa anonimizar ou nunca deve enviar. Segurança começa antes do prompt.', imagem_url: '/slides/m04/aula-4-1-05.png' },
  ],
  'aula-4-2': [
    { titulo: 'Lista Verde', texto: 'A lista verde reúne informações de baixo risco: texto público, dúvida conceitual, modelo sem dados, template fictício e checklist genérico. Sem dados reais, o risco cai muito.', imagem_url: '/slides/m04/aula-4-2-01.png' },
    { titulo: 'Lista Vermelha', texto: 'A lista vermelha reúne dados que nunca entram em IA pública: CPF, RG, salário, dados bancários, dados de saúde, contratos com cliente e segredos da empresa.', imagem_url: '/slides/m04/aula-4-2-02.png' },
    { titulo: 'Em Dúvida', texto: 'Quando você não tiver certeza de que o conteúdo é seguro, trate como vermelho e não envie. A pressa de usar IA não vale um vazamento de dados.', imagem_url: '/slides/m04/aula-4-2-03.png' },
    { titulo: 'Erro: Misturar Dados', texto: 'Um documento quase seguro deixa de ser seguro se tiver um único dado sensível. Um CPF, nome real ou valor confidencial contamina todo o conteúdo.', imagem_url: '/slides/m04/aula-4-2-04.png' },
    { titulo: 'Régua Rápida', texto: 'Use três zonas de decisão: verde pode usar, amarelo anonimiza antes, vermelho nunca envia. Em dúvida, suba o nível de proteção.', imagem_url: '/slides/m04/aula-4-2-05.png' },
  ],
  'aula-4-3': [
    { titulo: '4 Práticas de Ouro', texto: 'Segurança é hábito: use senha forte, ative 2FA, separe conta pessoal da corporativa e faça revisão periódica dos acessos e históricos.', imagem_url: '/slides/m04/aula-4-3-01.png' },
    { titulo: 'Ative 2FA', texto: '2FA adiciona uma segunda etapa de proteção. Mesmo que a senha vaze, o código no celular ou aplicativo autenticador ajuda a impedir acesso indevido.', imagem_url: '/slides/m04/aula-4-3-02.png' },
    { titulo: 'Contas Separadas', texto: 'Separe uso pessoal e corporativo. Conta pessoal serve para estudos e exemplos fictícios. Conta corporativa deve seguir ferramentas aprovadas e políticas internas.', imagem_url: '/slides/m04/aula-4-3-03.png' },
    { titulo: 'Dados Para Treino', texto: 'Quando possível, abra as configurações de privacidade e desative o uso dos seus dados para treino de modelo. Confirme sempre a política da empresa.', imagem_url: '/slides/m04/aula-4-3-04.png' },
    { titulo: 'Revisão Periódica', texto: 'Todo mês, revise histórico, apague conversas sensíveis, cheque permissões e atualize senhas quando necessário. Proteção melhora quando vira rotina.', imagem_url: '/slides/m04/aula-4-3-05.png' },
  ],
  // ── M05 · Engenharia de Prompt ──
  'aula-5-1': [
    { titulo: 'O Que É Prompt', texto: 'Prompt é a instrução que você dá para a IA. Você escreve um pedido, a IA interpreta, responde e você revisa antes de usar. Boa instrução gera melhor resposta.', imagem_url: '/slides/m05/aula-5-1-01.png' },
    { titulo: 'Prompt Ruim x Prompt Bom', texto: 'Um pedido vago, como "escreva um e-mail", gera resposta genérica. Um pedido com objetivo, destinatário, tom e contexto produz um resultado muito mais útil.', imagem_url: '/slides/m05/aula-5-1-02.png' },
    { titulo: 'Receita de Prompt', texto: 'Use a receita: contexto, papel, objetivo, restrições e formato. Diga quem você é, qual papel a IA deve assumir, o que precisa e como quer receber.', imagem_url: '/slides/m05/aula-5-1-03.png' },
    { titulo: 'Itere e Refine', texto: 'O primeiro prompt raramente é o ideal. Faça o pedido, leia a resposta, peça ajustes e aprove a versão final apenas depois de revisar.', imagem_url: '/slides/m05/aula-5-1-04.png' },
    { titulo: 'Prática: Melhore Seu Prompt', texto: 'Pegue um pedido de uma linha e transforme em uma instrução completa: cargo, tema, público, formato e limites. Pedido vago vira comando claro.', imagem_url: '/slides/m05/aula-5-1-05.png' },
  ],
  'aula-5-2': [
    { titulo: 'Método CIFE', texto: 'CIFE é uma estrutura simples para escrever prompts profissionais: Contexto, Instrução, Formato e Exemplos. Quatro partes reduzem ambiguidade.', imagem_url: '/slides/m05/aula-5-2-01.png' },
    { titulo: 'C de Contexto', texto: 'Contexto responde: quem sou, qual é a situação, para quem é e qual objetivo. Sem contexto, a IA tenta adivinhar o cenário.', imagem_url: '/slides/m05/aula-5-2-02.png' },
    { titulo: 'I de Instrução', texto: 'Instrução é o comando claro. Use verbos de ação como crie, resuma, liste, revise, compare e transforme. Evite pedidos vagos como "fale sobre".', imagem_url: '/slides/m05/aula-5-2-03.png' },
    { titulo: 'F de Formato', texto: 'Formato define como a resposta deve chegar: tabela, lista numerada, e-mail formal, três parágrafos ou checklist. Diga como quer receber.', imagem_url: '/slides/m05/aula-5-2-04.png' },
    { titulo: 'E de Exemplos', texto: 'Exemplos calibram a IA. Quando você mostra um modelo esperado, a resposta fica mais alinhada ao padrão, ao tom e à estrutura que deseja.', imagem_url: '/slides/m05/aula-5-2-05.png' },
  ],
  'aula-5-3': [
    { titulo: 'Prompt Eficaz Tem Estrutura', texto: 'Um prompt eficaz combina papel, público, objetivo, restrições e formato. Essa estrutura deixa o resultado mais previsível e reduz retrabalho.', imagem_url: '/slides/m05/aula-5-3-01.png' },
    { titulo: 'Template Reutilizável', texto: 'Transforme bons prompts em moldes com lacunas. Preencha papel, entrega, público, tom e formato para criar novos pedidos rapidamente.', imagem_url: '/slides/m05/aula-5-3-02.png' },
    { titulo: 'Use Placeholders', texto: 'Placeholders como [ASSUNTO], [TOM], [CLIENTE], [PRAZO] e [FORMATO] permitem trocar só as partes variáveis e reaproveitar o mesmo prompt.', imagem_url: '/slides/m05/aula-5-3-03.png' },
    { titulo: 'Biblioteca de Prompts', texto: 'Organize seus melhores prompts por categoria: e-mails, reuniões, planilhas, atendimento e relatórios. Uma biblioteca compartilhada aumenta a produtividade da equipe.', imagem_url: '/slides/m05/aula-5-3-04.png' },
    { titulo: 'Meça o Que Funciona', texto: 'Avalie cada prompt pelo resultado, tempo economizado, qualidade e revisão necessária. Teste, salve o melhor e reutilize o que já funcionou.', imagem_url: '/slides/m05/aula-5-3-05.png' },
  ],
  'aula-5-4': [
    { titulo: 'Prompts Para Escritório', texto: 'Comece pelas tarefas mais repetitivas: e-mail, reunião, planilha e atendimento. Cada tarefa pode ter um prompt modelo para acelerar o trabalho.', imagem_url: '/slides/m05/aula-5-4-01.png' },
    { titulo: 'Prompt Para E-mail', texto: 'Um bom prompt de e-mail define objetivo, destinatário, tom, tamanho e ação final. Defina o tom antes de enviar e revise nomes, dados e pedidos.', imagem_url: '/slides/m05/aula-5-4-02.png' },
    { titulo: 'Prompt Para Reunião', texto: 'Cole anotações ou transcrição e peça que a IA organize decisões, pendências, responsáveis e prazos. Reunião boa termina com próximos passos claros.', imagem_url: '/slides/m05/aula-5-4-03.png' },
    { titulo: 'Prompt Para Planilha', texto: 'Descreva o cálculo, explique as colunas, informe onde a fórmula será usada e peça explicação. A IA cria melhor quando entende a planilha.', imagem_url: '/slides/m05/aula-5-4-04.png' },
    { titulo: 'Adapte ao Seu Cargo', texto: 'Escolha cinco prompts, troque para sua área e salve na biblioteca. Prompt bom fica ainda melhor quando vira parte do seu jeito de trabalhar.', imagem_url: '/slides/m05/aula-5-4-05.png' },
  ],
  // ── M06 · Técnicas Avançadas ──
  'aula-6-1': [
    { titulo: 'Persona: Papel da IA', texto: 'Persona é dizer à IA quem ela deve ser antes de responder. Quando você define o papel, a resposta muda em vocabulário, foco e profundidade.', imagem_url: '/slides/m06/aula-6-1-01.png' },
    { titulo: 'Como Montar a Persona', texto: 'Uma boa persona combina cargo, senioridade, área e objetivo. Em vez de pedir só "revise", diga: atue como consultor sênior e revise buscando gargalos.', imagem_url: '/slides/m06/aula-6-1-02.png' },
    { titulo: 'Mesmo Pedido, Olhares Diferentes', texto: 'O mesmo texto pode ser revisado por um auditor, copywriter ou analista de RH. Cada persona muda o critério de análise e o tipo de melhoria sugerida.', imagem_url: '/slides/m06/aula-6-1-03.png' },
    { titulo: 'Persona Fraca x Forte', texto: 'Persona genérica como "você é especialista" ajuda pouco. Persona forte informa experiência, área, foco da análise e tipo de entrega esperada.', imagem_url: '/slides/m06/aula-6-1-04.png' },
    { titulo: 'Prática com 3 Personas', texto: 'Teste o mesmo prompt com três personas diferentes e compare tom, profundidade, foco e utilidade. Salve a persona que entregou o melhor resultado.', imagem_url: '/slides/m06/aula-6-1-05.png' },
  ],
  'aula-6-2': [
    { titulo: 'Cadeia de Prompts', texto: 'Cadeia de prompts é dividir uma tarefa complexa em etapas. Primeiro extrair, depois analisar, depois resumir e só então gerar a ação final.', imagem_url: '/slides/m06/aula-6-2-01.png' },
    { titulo: 'Por Que Quebrar a Tarefa', texto: 'Um prompt enorme costuma gerar resposta confusa. Em cadeia, cada etapa fica clara, revisável e mais fácil de corrigir antes de seguir adiante.', imagem_url: '/slides/m06/aula-6-2-02.png' },
    { titulo: 'Exemplo com Reunião', texto: 'Use a cadeia assim: cole a transcrição, extraia os tópicos, priorize por urgência e gere um e-mail de follow-up com responsáveis e prazos.', imagem_url: '/slides/m06/aula-6-2-03.png' },
    { titulo: 'Documente a Cadeia', texto: 'Para reutilizar o processo, registre cada passo com entrada, saída esperada e próximo prompt. Isso transforma improviso em método de trabalho.', imagem_url: '/slides/m06/aula-6-2-04.png' },
    { titulo: 'Quando Usar Cadeia', texto: 'Use um prompt único para tarefas simples. Use cadeia quando houver várias etapas, como relatórios, reuniões, análises de dados e apresentações.', imagem_url: '/slides/m06/aula-6-2-05.png' },
  ],
  'aula-6-3': [
    { titulo: 'Dados Entram, Insights Saem', texto: 'A IA ajuda a transformar tabela ou CSV em insights. O melhor resultado vem quando você envia dados organizados e explica o que quer descobrir.', imagem_url: '/slides/m06/aula-6-3-01.png' },
    { titulo: 'Prepare Antes de Colar', texto: 'Antes de enviar dados, anonimize informações sensíveis, selecione as colunas certas, explique o contexto e defina a pergunta de análise.', imagem_url: '/slides/m06/aula-6-3-02.png' },
    { titulo: 'Peça Insights Específicos', texto: 'Não peça apenas "analise". Peça padrões, anomalias, tendências, gráficos recomendados e ações sugeridas para transformar dados em decisão.', imagem_url: '/slides/m06/aula-6-3-03.png' },
    { titulo: 'Valide os Números', texto: 'A IA pode interpretar errado ou inventar números. Sempre confira totais, períodos, fórmulas e valores críticos na fonte original antes de usar.', imagem_url: '/slides/m06/aula-6-3-04.png' },
    { titulo: 'Prompt Base de Análise', texto: 'Use um modelo: analise estes dados e entregue resumo executivo, três tendências, anomalias, gráficos recomendados e ações sugeridas.', imagem_url: '/slides/m06/aula-6-3-05.png' },
  ],
  'aula-6-4': [
    { titulo: 'Conteúdo Avançado com IA', texto: 'Para criar conteúdo profissional, combine persona forte, exemplos do seu estilo e revisão em ciclos. A IA acelera o rascunho, mas você dirige.', imagem_url: '/slides/m06/aula-6-4-01.png' },
    { titulo: 'Ensine Seu Estilo', texto: 'Cole dois ou três textos seus e peça para a IA observar tom, vocabulário, ritmo e formalidade. Depois solicite o novo conteúdo nesse padrão.', imagem_url: '/slides/m06/aula-6-4-02.png' },
    { titulo: 'Formatos Profissionais', texto: 'Com bons prompts, a IA pode ajudar em apresentações, roteiros, posts e relatórios. O segredo é informar público, objetivo, formato e critério de qualidade.', imagem_url: '/slides/m06/aula-6-4-03.png' },
    { titulo: 'Revise em 3 Rodadas', texto: 'Trabalhe em ciclos: gere o rascunho, ajuste o tom, corte excessos e refine a versão final. Cada rodada resolve um tipo de problema.', imagem_url: '/slides/m06/aula-6-4-04.png' },
    { titulo: 'Você é o Editor Final', texto: 'A IA produz opções, mas a decisão final é humana. Antes de publicar, confira clareza, dados corretos, tom adequado e objetivo cumprido.', imagem_url: '/slides/m06/aula-6-4-05.png' },
  ],
  // ── M07 · ferramentas_ia (4–6, 14–15) + office_passo_a_passo (3, 4, 11, 13, 14) ──
  'aula-7-1': [
    { titulo: 'E-mail com IA', texto: 'Use IA para transformar bullets em uma resposta profissional. Informe contexto, destinatario, tom, objetivo e limite de tamanho. A IA cria o rascunho e voce revisa antes de enviar.', imagem_url: '/slides/m07/aula-7-1-01.png' },
    { titulo: 'Triagem Inteligente', texto: 'Classifique a caixa de entrada em urgente, importante, informativo e delegavel. A IA ajuda a resumir cada mensagem, sugerir prioridade e indicar a proxima acao.', imagem_url: '/slides/m07/aula-7-1-02.png' },
    { titulo: 'Resposta por Tipo', texto: 'Cada e-mail exige um tom: reclamacao pede empatia, follow-up pede leveza, fornecedor pede firmeza e comunicado urgente pede clareza. Defina o tipo antes do rascunho.', imagem_url: '/slides/m07/aula-7-1-03.png' },
    { titulo: 'Outlook e Gmail', texto: 'No Outlook ou Gmail, use IA para redigir e refinar mensagens. Depois organize a rotina com regras, filtros, labels e pastas para reduzir repeticao manual.', imagem_url: '/slides/m07/aula-7-1-04.png' },
    { titulo: 'Checklist de Envio', texto: 'Antes de clicar em enviar, confira nome, dados, valores, anexos, tom e chamada para acao. A IA acelera o texto, mas a aprovacao final continua humana.', imagem_url: '/slides/m07/aula-7-1-05.png' },
  ],
  'aula-7-2': [
    { titulo: 'Documento Longo', texto: 'Use IA para transformar documentos extensos em estrutura de trabalho. Peca partes principais, resumo executivo, riscos, obrigacoes e proximos passos.', imagem_url: '/slides/m07/aula-7-2-01.png' },
    { titulo: 'Relatorio Executivo', texto: 'Um bom relatorio com IA combina contexto, indicadores, analise, recomendacao e conclusao. Forneca dados reais e peca uma entrega objetiva para decisao.', imagem_url: '/slides/m07/aula-7-2-02.png' },
    { titulo: 'Parecer com Persona', texto: 'Para parecer tecnico, defina a persona: area, senioridade, criterio de avaliacao e formato esperado. A IA organiza argumentos, mas voce valida evidencias.', imagem_url: '/slides/m07/aula-7-2-03.png' },
    { titulo: 'Word com IA', texto: 'No Word, gere rascunho por secoes: objetivo, contexto, analise, recomendacao e fechamento. Aplique estilos, revise linguagem e finalize no padrao da empresa.', imagem_url: '/slides/m07/aula-7-2-04.png' },
    { titulo: 'Valide os Dados', texto: 'Nunca entregue relatorio sem conferir fonte, periodo, valores, premissas e conclusoes. IA melhora forma e fluxo, mas nao substitui verificacao dos numeros.', imagem_url: '/slides/m07/aula-7-2-05.png' },
  ],
  'aula-7-3': [
    { titulo: 'Ata em Minutos', texto: 'Cole a transcricao ou anotacoes da reuniao e peca uma ata com participantes, decisoes, pendencias, responsaveis e prazos. O ganho vem da estrutura pronta.', imagem_url: '/slides/m07/aula-7-3-01.png' },
    { titulo: 'Mapa da Reuniao', texto: 'Separe conversa de compromisso. A IA pode identificar topicos, acordos, duvidas, acoes e riscos para transformar a reuniao em acompanhamento claro.', imagem_url: '/slides/m07/aula-7-3-02.png' },
    { titulo: 'Tabela de Acoes', texto: 'Toda ata profissional precisa deixar claro quem faz o que e ate quando. Peca uma tabela com responsavel, tarefa, prazo, status e observacoes.', imagem_url: '/slides/m07/aula-7-3-03.png' },
    { titulo: 'Revisao da Ata', texto: 'Antes de circular, revise nomes, datas, decisoes, prazos e anexos. Erros pequenos em ata criam cobrancas erradas e desalinhamento entre equipes.', imagem_url: '/slides/m07/aula-7-3-04.png' },
    { titulo: 'Follow-up Automatico', texto: 'Depois da ata aprovada, use IA para gerar uma mensagem de acompanhamento com resumo, pendencias, responsaveis, chamada para acao e prazo de retorno.', imagem_url: '/slides/m07/aula-7-3-05.png' },
  ],
  'aula-7-4': [
    { titulo: 'Comunicado Claro', texto: 'Comunicado interno bom responde: o que mudou, por que mudou, quem e afetado, o que fazer agora e qual prazo seguir. Clareza reduz retrabalho.', imagem_url: '/slides/m07/aula-7-4-01.png' },
    { titulo: 'Publico e Tom', texto: 'A mesma mensagem muda conforme o leitor. Informe se o publico e equipe, lideranca, cliente interno ou toda a empresa, e defina tom formal, proximo ou urgente.', imagem_url: '/slides/m07/aula-7-4-02.png' },
    { titulo: 'Comunicado Curto', texto: 'Limite o comunicado a 100 ou 150 palavras quando possivel. Use titulo claro, contexto rapido, acao esperada, prazo e canal para duvidas.', imagem_url: '/slides/m07/aula-7-4-03.png' },
    { titulo: 'Evite Ruido', texto: 'Evite jargao, ambiguidade, excesso de historico e frases sem acao. Um comunicado bom permite que a pessoa saiba exatamente o que fazer depois de ler.', imagem_url: '/slides/m07/aula-7-4-04.png' },
    { titulo: 'Prompt Base', texto: 'Use um modelo simples: escreva para este publico, com este objetivo, neste tom, em ate este tamanho, deixando clara a acao esperada e o prazo.', imagem_url: '/slides/m07/aula-7-4-05.png' },
  ],
  'aula-8-1': [
    { titulo: 'IA para Planilhas', texto: 'Voce descreve em linguagem simples e a IA ajuda a criar a formula. O fluxo ideal e explicar objetivo, contexto da planilha, formula sugerida, colar no Excel e conferir o resultado.', imagem_url: '/slides/m08/aula-8-1-01.png' },
    { titulo: 'Prompt de Formula', texto: 'Um bom prompt informa objetivo, colunas, linha inicial, celula de destino e regra de calculo. Quanto mais clara a descricao da planilha, melhor a formula sugerida.', imagem_url: '/slides/m08/aula-8-1-02.png' },
    { titulo: 'Formulas Mais Pedidas', texto: 'A IA ajuda em demandas comuns: somar com condicao, buscar valor, classificar faixas e contar itens. Use a resposta como ponto de partida e teste na planilha.', imagem_url: '/slides/m08/aula-8-1-03.png' },
    { titulo: 'Corrigir Erros', texto: 'Quando a formula falhar, copie a mensagem de erro, explique onde ela foi colada e peca diagnostico. A IA pode sugerir ajuste de intervalo, separador ou sintaxe.', imagem_url: '/slides/m08/aula-8-1-04.png' },
    { titulo: 'Conferir Resultado', texto: 'Formula pronta ainda precisa validacao. Confira celula correta, intervalo correto, separador, resultado esperado e um teste manual simples antes de usar.', imagem_url: '/slides/m08/aula-8-1-05.png' },
  ],
  'aula-8-2': [
    { titulo: 'Tabela Bem Preparada', texto: 'Antes da analise, organize a base: sem linhas vazias, uma coluna por campo, cabecalhos claros, dados consistentes e tabela estruturada com Ctrl+T.', imagem_url: '/slides/m08/aula-8-2-01.png' },
    { titulo: 'Dinamica Guiada por IA', texto: 'Descreva o que quer descobrir e peca sugestao de linhas, colunas, valores e filtros. A IA orienta a estrutura; voce executa no Excel e valida.', imagem_url: '/slides/m08/aula-8-2-02.png' },
    { titulo: 'Pergunta de Negocio', texto: 'Toda tabela dinamica deve responder uma decisao. Comece pela pergunta, escolha os campos, monte a tabela, leia o insight e defina a acao.', imagem_url: '/slides/m08/aula-8-2-03.png' },
    { titulo: 'Segmentacao e Filtros', texto: 'Filtros e segmentacoes permitem analisar recortes de mes, regiao, categoria e responsavel sem refazer tudo. Eles transformam uma base em varias leituras.', imagem_url: '/slides/m08/aula-8-2-04.png' },
    { titulo: 'Erros em Dinamicas', texto: 'Dados ruins geram analise ruim. Corrija cabecalho vazio, data como texto, categoria duplicada, valor em branco e total misturado antes de confiar no resultado.', imagem_url: '/slides/m08/aula-8-2-05.png' },
  ],
  'aula-8-3': [
    { titulo: 'Dashboard com IA', texto: 'Dashboard bom segue uma ordem simples: pergunta, KPI, base, grafico e decisao. A IA ajuda a desenhar a estrutura, mas a pergunta vem do negocio.', imagem_url: '/slides/m08/aula-8-3-01.png' },
    { titulo: 'KPIs Principais', texto: 'Use no maximo cinco indicadores por tela. Poucos KPIs bem escolhidos facilitam leitura, reduzem confusao e ajudam a lideranca a decidir rapido.', imagem_url: '/slides/m08/aula-8-3-02.png' },
    { titulo: 'Grafico Certo', texto: 'Cada pergunta pede uma visualizacao: linha para tendencia, barra para comparacao, pizza para participacao e cartao para indicador. Valide se o grafico responde.', imagem_url: '/slides/m08/aula-8-3-03.png' },
    { titulo: 'Layout Executivo', texto: 'Organize a leitura: KPIs no topo, grafico principal ao centro, filtros laterais e alertas no rodape. A decisao precisa aparecer sem procurar informacao.', imagem_url: '/slides/m08/aula-8-3-04.png' },
    { titulo: 'Revisao do Dashboard', texto: 'Bonito nao basta. Confira pergunta clara, dados atualizados, filtros funcionando, graficos coerentes e acao recomendada antes de apresentar.', imagem_url: '/slides/m08/aula-8-3-05.png' },
  ],
  'aula-8-4': [
    { titulo: 'Insights com IA', texto: 'Dados brutos viram hipoteses quando voce pede padroes, tendencias, anomalias e recomendacoes. A IA encontra pistas; o Excel confirma a prova.', imagem_url: '/slides/m08/aula-8-4-01.png' },
    { titulo: 'Amostra Anonimizada', texto: 'Antes de usar IA, remova nomes, oculte identificadores, mantenha contexto e envie apenas uma amostra segura. Protecao de dados vem antes da analise.', imagem_url: '/slides/m08/aula-8-4-02.png' },
    { titulo: 'Prompt de Analise', texto: 'Um bom prompt de analise informa contexto, objetivo, colunas, periodo e entrega esperada. Assim a IA sabe o que observar e como responder.', imagem_url: '/slides/m08/aula-8-4-03.png' },
    { titulo: 'Validar no Excel', texto: 'IA sugere e Excel comprova. Confirme conclusoes com formula, filtro, grafico e base completa antes de transformar uma hipotese em decisao.', imagem_url: '/slides/m08/aula-8-4-04.png' },
    { titulo: 'Plano de Acao', texto: 'Insight bom termina em decisao. Conecte insight, evidencia, prioridade, responsavel e proximo passo para transformar analise em resultado acompanhavel.', imagem_url: '/slides/m08/aula-8-4-05.png' },
  ],
  // ── M09 / M10 · ia_administrativo (23–24) ──
  'aula-9-1': [
    { titulo: 'Automacao com IA', texto: 'Quando uma tarefa se repete, tem regra clara e consome tempo, ela pode virar automacao. O fluxo ideal conecta entrada, IA, acao e registro com revisao humana nos pontos criticos.', imagem_url: '/slides/m09/aula-9-1-01.png' },
    { titulo: 'Zapier com IA', texto: 'Zapier conecta ferramentas sem programar e permite colocar IA no meio do processo. Um e-mail pode ser classificado, resumido e registrado automaticamente.', imagem_url: '/slides/m09/aula-9-1-02.png' },
    { titulo: 'Gatilho e Acao', texto: 'Toda automacao comeca com um gatilho claro e uma acao definida. Se algo acontece, o fluxo executa o proximo passo de forma padronizada.', imagem_url: '/slides/m09/aula-9-1-03.png' },
    { titulo: 'IA no Meio do Fluxo', texto: 'A IA entra no fluxo para classificar, resumir ou decidir a rota. Depois, a automacao executa a acao correta: urgente, acompanhar ou arquivar.', imagem_url: '/slides/m09/aula-9-1-04.png' },
    { titulo: 'Comece Simples', texto: 'Automacao boa nasce pequena. Crie um zap por vez, teste com dados reais controlados, corrija falhas e so entao expanda para processos maiores.', imagem_url: '/slides/m09/aula-9-1-05.png' },
  ],
  'aula-9-2': [
    { titulo: 'Make com IA', texto: 'Make e indicado quando o fluxo precisa de mais controle visual, ramificacoes e tratamento de dados. Ele ajuda a enxergar cada etapa como parte de um mapa.', imagem_url: '/slides/m09/aula-9-2-01.png' },
    { titulo: 'Cenario Visual', texto: 'No Make, cada modulo faz uma parte do trabalho: receber, transformar, analisar com IA, decidir rota e enviar resultado. O processo fica visivel e auditavel.', imagem_url: '/slides/m09/aula-9-2-02.png' },
    { titulo: 'Bundles e Dados', texto: 'Cada etapa recebe um pacote de dados, transforma e envia para a proxima etapa. A IA pode enriquecer esse pacote com resumo, prioridade ou classificacao.', imagem_url: '/slides/m09/aula-9-2-03.png' },
    { titulo: 'Rotas e Condicoes', texto: 'Make permite caminhos diferentes conforme regra ou classificacao. Se for urgente, segue uma rota; se for informativo, pode registrar ou arquivar.', imagem_url: '/slides/m09/aula-9-2-04.png' },
    { titulo: 'Quando Usar Make', texto: 'Use Make quando precisar visualizar, ramificar, tratar erro e transformar dados com mais detalhe. Para fluxos simples, uma ferramenta mais direta pode bastar.', imagem_url: '/slides/m09/aula-9-2-05.png' },
  ],
  'aula-9-3': [
    { titulo: 'Power Automate com IA', texto: 'Power Automate combina automacao corporativa com etapas de IA. Ele e forte em ambientes com documentos, aprovacoes, equipes e registros internos.', imagem_url: '/slides/m09/aula-9-3-01.png' },
    { titulo: 'Aprovacoes', texto: 'Automacoes corporativas padronizam aprovacoes: solicitar, avaliar, aprovar, registrar e notificar. Cada pedido precisa de pessoa certa, prazo claro e status visivel.', imagem_url: '/slides/m09/aula-9-3-02.png' },
    { titulo: 'Extracao de Documentos', texto: 'A IA pode ler documentos, separar campos como cliente, data, valor, categoria e status, e alimentar tabelas ou sistemas sem digitacao manual repetitiva.', imagem_url: '/slides/m09/aula-9-3-03.png' },
    { titulo: 'Templates Prontos', texto: 'Nao reinvente o que ja existe. Comece por templates prontos, adapte campos, teste o fluxo e publique apenas depois de validar no processo real.', imagem_url: '/slides/m09/aula-9-3-04.png' },
    { titulo: 'Governanca da Automacao', texto: 'Automacao com IA precisa de dono do fluxo, permissoes, cuidado com dados sensiveis, logs e plano de erro. Sem governanca, o ganho vira risco.', imagem_url: '/slides/m09/aula-9-3-05.png' },
  ],
  'aula-10-1': [
    { titulo: 'POP com IA', texto: 'A IA acelera a criacao de procedimentos operacionais padrao. Voce descreve o processo real, recebe uma estrutura inicial e valida cada etapa antes de publicar.', imagem_url: '/slides/m10/aula-10-1-01.png' },
    { titulo: 'Estrutura do POP', texto: 'Um POP profissional organiza objetivo, abrangencia, responsavel, passo a passo e evidencias. Essa estrutura permite que qualquer pessoa execute o processo do mesmo jeito.', imagem_url: '/slides/m10/aula-10-1-02.png' },
    { titulo: 'Do Jeito Que Voce Faz', texto: 'O melhor POP nasce da pratica real da equipe. Primeiro descreva como o trabalho acontece hoje, depois use IA para organizar, padronizar e melhorar a versao final.', imagem_url: '/slides/m10/aula-10-1-03.png' },
    { titulo: 'Pontos de Atencao', texto: 'POP util mostra onde o processo costuma falhar. Inclua erros comuns, excecoes, riscos, conferencias e evidencias para reduzir retrabalho e duvidas.', imagem_url: '/slides/m10/aula-10-1-04.png' },
    { titulo: 'POP Vivo', texto: 'Um POP bom nao fica parado. Ele deve ser usado, revisado, ajustado, aprovado e atualizado conforme a equipe aprende com a rotina.', imagem_url: '/slides/m10/aula-10-1-05.png' },
  ],
  'aula-10-2': [
    { titulo: 'Fluxograma com IA', texto: 'A IA transforma uma descricao textual de processo em um primeiro diagrama. Depois a equipe revisa o fluxo para confirmar se ele representa a pratica real.', imagem_url: '/slides/m10/aula-10-2-01.png' },
    { titulo: 'Mermaid', texto: 'Mermaid permite escrever diagramas como texto. A IA pode gerar um codigo simples com inicio, processo, decisao e fim para colar em ferramentas compativeis.', imagem_url: '/slides/m10/aula-10-2-02.png' },
    { titulo: 'Decisoes Claras', texto: 'Fluxograma bom mostra onde existe decisao e qual caminho seguir em cada resposta. Se a decisao for ambigua, o processo fica dificil de executar.', imagem_url: '/slides/m10/aula-10-2-03.png' },
    { titulo: 'Revisar o Fluxo', texto: 'O diagrama precisa bater com a pratica. Confira inicio claro, responsaveis, decisoes, excecoes e fim definido antes de compartilhar.', imagem_url: '/slides/m10/aula-10-2-04.png' },
    { titulo: 'Do Fluxograma ao POP', texto: 'Visualize primeiro e documente depois. O fluxograma ajuda a enxergar etapas, responsaveis e evidencias antes de transformar tudo em procedimento escrito.', imagem_url: '/slides/m10/aula-10-2-05.png' },
  ],
  'aula-10-3': [
    { titulo: 'Checklist Inteligente', texto: 'Checklist inteligente transforma conhecimento do processo em verificacao simples e repetivel. Ele ajuda a equipe a lembrar o que precisa ser conferido.', imagem_url: '/slides/m10/aula-10-3-01.png' },
    { titulo: 'Checklist Curto', texto: 'Checklist grande demais deixa de ser usado. Mantenha no maximo dez itens por lista e divida por etapa quando a rotina for mais longa.', imagem_url: '/slides/m10/aula-10-3-02.png' },
    { titulo: 'Antes, Durante e Depois', texto: 'Organizar o checklist por momento ajuda a equipe a verificar o que importa na hora certa: antes de comecar, durante a execucao e depois da entrega.', imagem_url: '/slides/m10/aula-10-3-03.png' },
    { titulo: 'Responsavel e Evidencia', texto: 'Checklist profissional mostra item, responsavel, prazo, evidencia e status. Assim ele deixa de ser so uma caixa marcada e vira registro auditavel.', imagem_url: '/slides/m10/aula-10-3-04.png' },
    { titulo: 'Melhoria Continua', texto: 'Checklist bom evolui com a pratica. Quando um erro real aparece, transforme o aprendizado em novo item, treine a equipe e revise de novo.', imagem_url: '/slides/m10/aula-10-3-05.png' },
  ],
  // M11 - Casos de Uso por Area
  'aula-11-1': [
    { titulo: 'IA no RH', texto: 'No RH, a IA acelera triagem, descricao de vagas, feedbacks e onboarding. O ganho de tempo e real, mas dados pessoais, vies e decisao final exigem cuidado humano.', imagem_url: '/slides/m11/aula-11-1-01.png' },
    { titulo: 'Triagem Assistida', texto: 'Use IA para resumir curriculos, comparar criterios objetivos e organizar candidatos. Antes disso, anonimizar dados reduz risco e deixa a analise mais justa.', imagem_url: '/slides/m11/aula-11-1-02.png' },
    { titulo: 'JD com IA', texto: 'Uma boa descricao de vaga nasce de contexto claro: missao do cargo, responsabilidades, requisitos, diferenciais e etapas do processo seletivo.', imagem_url: '/slides/m11/aula-11-1-03.png' },
    { titulo: 'Feedback com IA', texto: 'A IA ajuda a estruturar feedbacks em fato, impacto, orientacao e proximo passo. A conversa final precisa manter empatia, contexto e responsabilidade.', imagem_url: '/slides/m11/aula-11-1-04.png' },
    { titulo: 'Onboarding Inteligente', texto: 'Transforme os primeiros 30 dias em plano claro com documentos, acessos, treinamentos, responsaveis e primeiras entregas adaptadas ao cargo.', imagem_url: '/slides/m11/aula-11-1-05.png' },
  ],
  'aula-11-2': [
    { titulo: 'IA no Financeiro', texto: 'No financeiro, a IA acelera extracao de dados, conciliacao, analise de despesas e relatorios. Rapidez ajuda, mas rigor nos numeros continua obrigatorio.', imagem_url: '/slides/m11/aula-11-2-01.png' },
    { titulo: 'Extrair Dados', texto: 'Notas fiscais e documentos podem virar tabelas com fornecedor, data, valor, categoria e centro de custo. Campos criticos precisam ser conferidos na origem.', imagem_url: '/slides/m11/aula-11-2-02.png' },
    { titulo: 'Analise de Despesas', texto: 'A IA ajuda a encontrar padroes, categorias, anomalias e variacoes. Depois, o Excel ou sistema financeiro confirma valores, filtros e premissas.', imagem_url: '/slides/m11/aula-11-2-03.png' },
    { titulo: 'Relatorio Gerencial', texto: 'Relatorio bom conecta numero, causa, impacto e recomendacao. Use IA para transformar dados em explicacao executiva clara e acionavel.', imagem_url: '/slides/m11/aula-11-2-04.png' },
    { titulo: 'Checklist Financeiro', texto: 'Antes de confiar, confira totais, periodo, fonte, categoria, duplicidades e aprovacao. A IA acelera a analise, mas voce fecha os numeros.', imagem_url: '/slides/m11/aula-11-2-05.png' },
  ],
  'aula-11-3': [
    { titulo: 'IA em Compras', texto: 'Compras com IA fica mais estrategico: comparar propostas, preparar negociacoes, revisar contratos e avaliar fornecedores com criterios mais claros.', imagem_url: '/slides/m11/aula-11-3-01.png' },
    { titulo: 'Comparativo de Cotacoes', texto: 'Preco nao e tudo. Compare preco, prazo, condicao, garantia e risco para evitar decisoes baseadas em um unico numero.', imagem_url: '/slides/m11/aula-11-3-02.png' },
    { titulo: 'Negociacao com IA', texto: 'A IA ajuda a escrever mensagens firmes, claras e profissionais quando recebe objetivo, limite, argumento, concessao possivel e proxima acao.', imagem_url: '/slides/m11/aula-11-3-03.png' },
    { titulo: 'Contratos com IA', texto: 'Use IA para resumir e marcar riscos em clausulas como multa, prazo, reajuste e rescisao. Em pontos criticos, leia o original antes de assinar.', imagem_url: '/slides/m11/aula-11-3-04.png' },
    { titulo: 'Scoring de Fornecedor', texto: 'Avalie fornecedores por preco, prazo, qualidade, historico e risco. A pontuacao organiza a escolha, mas a aprovacao final continua humana.', imagem_url: '/slides/m11/aula-11-3-05.png' },
  ],
  'aula-11-4': [
    { titulo: 'IA em Operacoes', texto: 'Em operacoes, a IA ajuda a mapear processos, medir indicadores, priorizar ajustes e acompanhar gargalos. Comece pela maior dor operacional.', imagem_url: '/slides/m11/aula-11-4-01.png' },
    { titulo: 'Maior Dor Primeiro', texto: 'Nao otimize o que quase nao importa. Priorize processos de alta frequencia e alto impacto, onde o ganho aparece para a equipe e para o cliente.', imagem_url: '/slides/m11/aula-11-4-02.png' },
    { titulo: 'Escalas com IA', texto: 'A IA sugere cenarios de escala considerando demanda, disponibilidade, habilidades, folgas e prioridades. O gestor valida restricoes e realidade do time.', imagem_url: '/slides/m11/aula-11-4-03.png' },
    { titulo: 'Indicadores e SLA', texto: 'A IA ajuda a explicar variacoes em SLA, tempo medio, volume, atrasos e retrabalho. Indicadores bem definidos viram acoes corretivas melhores.', imagem_url: '/slides/m11/aula-11-4-04.png' },
    { titulo: 'Gargalos Operacionais', texto: 'Melhorar operacoes e encontrar o ponto que segura o fluxo, agir sobre a causa, definir responsavel e acompanhar se o atraso caiu.', imagem_url: '/slides/m11/aula-11-4-05.png' },
  ],
  'aula-11-5': [
    { titulo: 'IA no Atendimento', texto: 'A IA ajuda a classificar tickets, resumir historico, sugerir respostas e detectar sentimento. O atendente ganha velocidade sem perder empatia.', imagem_url: '/slides/m11/aula-11-5-01.png' },
    { titulo: 'Classificar Tickets', texto: 'Tickets podem ser separados por tema, urgencia e rota de atendimento. Prioridade certa organiza a fila e leva cada caso para a equipe correta.', imagem_url: '/slides/m11/aula-11-5-02.png' },
    { titulo: 'Resumo do Historico', texto: 'Antes de responder, a IA resume problema, tentativas, promessas, prazo e proximo passo. O atendente entende o contexto sem reler tudo.', imagem_url: '/slides/m11/aula-11-5-03.png' },
    { titulo: 'Sugestao de Resposta', texto: 'A IA prepara o rascunho em tom empatico, objetivo, tecnico ou urgente. O atendente adapta, confere dados e aprova a resposta final.', imagem_url: '/slides/m11/aula-11-5-04.png' },
    { titulo: 'Sentimento e Escalada', texto: 'Quando o cliente demonstra frustracao, urgencia ou risco, a IA sinaliza prioridade. O atendimento humano assume a rota segura.', imagem_url: '/slides/m11/aula-11-5-05.png' },
  ],
  // M12 - Projeto Final
  'aula-12-1': [
    { titulo: 'Projeto Final', texto: 'Escolha um processo real do seu trabalho e mostre a transformacao. O foco e simples: um processo, antes e depois, resultado medido.', imagem_url: '/slides/m12/aula-12-1-01.png' },
    { titulo: 'Antes x Depois', texto: 'Compare o processo manual com o processo apoiado por IA. Mostre onde havia demora, retrabalho ou confusao e como a nova versao melhora a rotina.', imagem_url: '/slides/m12/aula-12-1-02.png' },
    { titulo: 'O Que Medir', texto: 'Projeto bom termina em evidencia. Meça tempo economizado, qualidade da entrega e custo ou retrabalho reduzido para provar o valor da mudanca.', imagem_url: '/slides/m12/aula-12-1-03.png' },
    { titulo: 'Use Tudo Que Aprendeu', texto: 'Combine prompts, documentos, planilhas e automacao em uma solucao simples. O objetivo nao e usar tudo por enfeite, e resolver melhor uma tarefa real.', imagem_url: '/slides/m12/aula-12-1-04.png' },
    { titulo: 'Entrega Final', texto: 'Apresente o processo redesenhado, o ganho medido e os proximos passos. A entrega final deve mostrar o que mudou, quanto melhorou e como manter.', imagem_url: '/slides/m12/aula-12-1-05.png' },
  ],
  'aula-12-2': [
    { titulo: 'Plano de Adocao', texto: 'Adotar IA na equipe exige tres pilares: pessoas treinadas, processos bem escolhidos e politicas claras de seguranca, LGPD e revisao humana.', imagem_url: '/slides/m12/aula-12-2-01.png' },
    { titulo: 'Piloto de 30 Dias', texto: 'Comece pequeno: tres pessoas, um processo e resultado medido. O piloto reduz risco, gera aprendizado e mostra se vale escalar.', imagem_url: '/slides/m12/aula-12-2-02.png' },
    { titulo: 'Treine a Equipe', texto: 'Treinamento bom usa tarefas reais do dia a dia. Demonstre, pratique, revise e repita ate a IA virar parte natural da rotina.', imagem_url: '/slides/m12/aula-12-2-03.png' },
    { titulo: 'Governanca e Seguranca', texto: 'IA na empresa precisa de regras claras: dados sensiveis, permissoes, LGPD, revisao humana e registro de uso. Limites protegem pessoas e decisoes.', imagem_url: '/slides/m12/aula-12-2-04.png' },
    { titulo: 'ROI Antes de Escalar', texto: 'Antes de comprar mais licencas ou expandir, prove ganho com dados do piloto. Mostre tempo economizado, custo evitado e qualidade melhorada.', imagem_url: '/slides/m12/aula-12-2-05.png' },
  ],
  'aula-12-3': [
    { titulo: 'Parabens!', texto: 'Voce completou a jornada. Agora o certificado representa uma habilidade pratica: usar IA com criterio, seguranca e foco em resultado.', imagem_url: '/slides/m12/aula-12-3-01.png' },
    { titulo: 'Certificado e LinkedIn', texto: 'Transforme a conclusao do curso em evidencia profissional. Emita o certificado, atualize seu perfil e adicione o projeto final como exemplo real.', imagem_url: '/slides/m12/aula-12-3-02.png' },
    { titulo: '30 Minutos por Semana', texto: 'IA muda rapido. Reserve um bloco semanal para testar, aplicar, salvar prompts e compartilhar aprendizados com a equipe.', imagem_url: '/slides/m12/aula-12-3-03.png' },
    { titulo: 'Continue Explorando', texto: 'Novas ferramentas surgem o tempo todo. Use metodo: descubra, teste em tarefa real, avalie valor e adote apenas o que ajuda.', imagem_url: '/slides/m12/aula-12-3-04.png' },
    { titulo: 'Plano Pessoal de Evolucao', texto: 'A jornada continua quando aprendizado vira habito. Escolha uma tarefa real, salve um prompt, melhore um processo e compartilhe um resultado.', imagem_url: '/slides/m12/aula-12-3-05.png' },
  ],
  // M13 - Produtividade com IA
  'aula-13-1': [
    { titulo: 'Agenda Inteligente', texto: 'A IA ajuda a organizar a semana para priorizar o que importa, reduzir ruido e proteger blocos de trabalho produtivo.', imagem_url: '/slides/m13/aula-13-1-01.png' },
    { titulo: 'Eisenhower com IA', texto: 'Classifique tarefas em fazer agora, agendar, delegar ou eliminar. A matriz reduz improviso e mostra onde seu tempo deve ir primeiro.', imagem_url: '/slides/m13/aula-13-1-02.png' },
    { titulo: 'Time Blocking', texto: 'Transforme uma lista solta de tarefas em agenda executavel. Separe trabalho profundo, reunioes, e-mails, pausas e buffers.', imagem_url: '/slides/m13/aula-13-1-03.png' },
    { titulo: 'Convites de Reuniao', texto: 'Antes de aceitar, peça pauta, duracao e confirme se sua presenca e obrigatoria. A IA ajuda a aceitar, recusar ou pedir contexto com elegancia.', imagem_url: '/slides/m13/aula-13-1-04.png' },
    { titulo: 'Cronograma Semanal', texto: 'A IA sugere um plano de 5 dias com prioridade, estimativa de tempo e alertas de prazo. Voce ajusta conforme energia e contexto real.', imagem_url: '/slides/m13/aula-13-1-05.png' },
  ],
  'aula-13-2': [
    { titulo: 'Controle de Tarefas', texto: 'E-mails, atas e anotacoes viram tarefas acionaveis com quem faz, o que entrega, ate quando e com qual prioridade.', imagem_url: '/slides/m13/aula-13-2-01.png' },
    { titulo: 'Captura de Tarefas', texto: 'A IA extrai acoes de e-mails, reunioes e notas livres. Tarefa nao capturada vira atraso; tarefa capturada vira compromisso visivel.', imagem_url: '/slides/m13/aula-13-2-02.png' },
    { titulo: 'Tarefa Ideal', texto: 'Uma tarefa clara tem verbo, contexto, responsavel, deadline, dependencias e criterio de conclusao. Isso reduz retrabalho e duvida.', imagem_url: '/slides/m13/aula-13-2-03.png' },
    { titulo: 'Relatorio Standup', texto: 'Resuma o dia em quatro blocos: fiz hoje, farei amanha, bloqueios e alertas. O time acompanha progresso sem longas reunioes.', imagem_url: '/slides/m13/aula-13-2-04.png' },
    { titulo: 'Delegacao com Contexto', texto: 'Delegar bem e explicar contexto, entrega esperada, prazo, criterio de sucesso e onde buscar apoio. Clareza acompanha a tarefa.', imagem_url: '/slides/m13/aula-13-2-05.png' },
  ],
  'aula-13-3': [
    { titulo: 'Apresentacoes com IA', texto: 'Apresentacao boa comeca pela narrativa, nao pelo layout. A IA ajuda a sair do brief para roteiro, slides e fala.', imagem_url: '/slides/m13/aula-13-3-01.png' },
    { titulo: 'BAB + PARA', texto: 'Defina o antes, o depois e a ponte. Depois conecte publico, acao desejada e argumento central para orientar toda a apresentacao.', imagem_url: '/slides/m13/aula-13-3-02.png' },
    { titulo: 'Roteiro Slide a Slide', texto: 'Cada slide precisa defender uma mensagem. A IA cria a estrutura, mas voce valida se a sequencia leva o publico para a decisao certa.', imagem_url: '/slides/m13/aula-13-3-03.png' },
    { titulo: 'Conteudo por Slide', texto: 'Peça titulo forte, mensagem principal, 3 a 5 bullets, visual sugerido e nota do apresentador. O slide fica objetivo e apresentavel.', imagem_url: '/slides/m13/aula-13-3-04.png' },
    { titulo: 'Notas do Apresentador', texto: 'Notas bem feitas trazem gancho, dado de suporte, transicao, objecao provavel e CTA. Elas ajudam a falar com seguranca em 60 segundos.', imagem_url: '/slides/m13/aula-13-3-05.png' },
  ],
  'aula-13-4': [
    { titulo: 'IA Integrada', texto: 'O maior ganho aparece quando e-mail, agenda, tarefas, planilhas, documentos e apresentacoes se conectam em um fluxo real de trabalho.', imagem_url: '/slides/m13/aula-13-4-01.png' },
    { titulo: '6 Frentes Conectadas', texto: 'IA integrada nao e ferramenta isolada. E um sistema de apoio para o dia inteiro, sempre com revisao humana no centro.', imagem_url: '/slides/m13/aula-13-4-02.png' },
    { titulo: '6h15 por Dia', texto: 'Pequenos ganhos em varias tarefas se acumulam. A estimativa de produtividade recuperada depende da rotina, mas o efeito composto e real.', imagem_url: '/slides/m13/aula-13-4-03.png' },
    { titulo: 'Desafio Integrador', texto: 'Execute seis tarefas reais com IA: e-mail, agenda, tarefas, planilha, documento e apresentacao. No fim, registre o tempo economizado.', imagem_url: '/slides/m13/aula-13-4-04.png' },
    { titulo: 'A IA Nao Substitui', texto: 'Voce pensa, decide e cria. A IA organiza, rascunha e acelera. A responsabilidade e a decisao final continuam humanas.', imagem_url: '/slides/m13/aula-13-4-05.png' },
  ],
  // M14 - Instagram & LinkedIn com IA
  'aula-14-1': [
    { titulo: 'Instagram com IA', texto: 'A IA acelera o ciclo inteiro do Instagram: planejar, criar, agendar, publicar, medir e melhorar. A estrategia e a decisao continuam humanas.', imagem_url: '/slides/m14/aula-14-1-01.png' },
    { titulo: 'Planejamento Mensal', texto: 'Calendario editorial com IA transforma improviso em consistencia. Defina dia, formato, tema, gancho, CTA, status e responsavel.', imagem_url: '/slides/m14/aula-14-1-02.png' },
    { titulo: 'Legendas que Engajam', texto: 'Uma legenda forte prende atencao na primeira linha, entrega valor em paragrafos curtos, chama para acao e usa hashtags relevantes.', imagem_url: '/slides/m14/aula-14-1-03.png' },
    { titulo: 'Reels e Carrossel', texto: 'A IA transforma uma ideia em roteiro cena a cena ou slide a slide, com gancho rapido, sequencia visual e chamada para acao.', imagem_url: '/slides/m14/aula-14-1-04.png' },
    { titulo: 'Hashtags e Metricas', texto: 'Combine hashtags amplas, de nicho e locais. Depois acompanhe alcance, salvamentos, comentarios e cliques para melhorar o proximo mes.', imagem_url: '/slides/m14/aula-14-1-05.png' },
  ],
  'aula-14-2': [
    { titulo: 'LinkedIn com IA', texto: 'No LinkedIn, a IA ajuda a transformar experiencia em autoridade visivel, posts consistentes, networking com contexto e oportunidades profissionais.', imagem_url: '/slides/m14/aula-14-2-01.png' },
    { titulo: 'Perfil Otimizado', texto: 'Um perfil forte mostra cargo, resultado, diferencial, palavras-chave e chamada para contato. A IA ajuda a melhorar headline, sobre e experiencias.', imagem_url: '/slides/m14/aula-14-2-02.png' },
    { titulo: 'Posts de Alto Impacto', texto: 'Use formatos como autoridade, storytelling, posicionamento e conquista. Post bom cria percepcao de autoridade e abre conversa qualificada.', imagem_url: '/slides/m14/aula-14-2-03.png' },
    { titulo: 'Networking com IA', texto: 'Mensagem boa menciona algo especifico do perfil, explica o motivo da conexao e evita pitch na primeira abordagem. Contexto vem antes do pedido.', imagem_url: '/slides/m14/aula-14-2-04.png' },
    { titulo: 'Calendario LinkedIn', texto: 'Autoridade cresce com consistencia. Planeje quatro semanas com textos, carrosseis, enquetes e artigos alinhados a autoridade, networking ou negocios.', imagem_url: '/slides/m14/aula-14-2-05.png' },
  ],
  'aula-14-3': [
    { titulo: 'Instagram vs LinkedIn', texto: 'Cada plataforma tem um papel. Instagram favorece marca, visual e engajamento; LinkedIn favorece autoridade, carreira, B2B e networking.', imagem_url: '/slides/m14/aula-14-3-01.png' },
    { titulo: 'Mesmo Tema, Duas Versoes', texto: 'Nao copie o mesmo texto nas duas redes. Adapte tom, formato e objetivo para o comportamento de cada publico.', imagem_url: '/slides/m14/aula-14-3-02.png' },
    { titulo: 'Ferramentas por Plataforma', texto: 'Cada plataforma tem fluxos proprios para criar, agendar, automatizar e analisar. Use IA para produzir e interpretar dados com criterio.', imagem_url: '/slides/m14/aula-14-3-03.png' },
    { titulo: 'Consistencia Supera Perfeicao', texto: 'Comece com um post, depois tres, depois o mes inteiro. O melhor plano e aquele que voce consegue manter, medir e melhorar.', imagem_url: '/slides/m14/aula-14-3-04.png' },
    { titulo: 'IA Escreve. Voce Decide.', texto: 'A IA rascunha, voce revisa, publica, responde e aprende. Estrategia, voz e relacionamento continuam sendo responsabilidade humana.', imagem_url: '/slides/m14/aula-14-3-05.png' },
  ],
}

// Aplica os slides oficiais às aulas correspondentes
let _osId = 0
for (const m of mockModulos) {
  for (const a of m.aulas ?? []) {
    const oficial = officialSlides[a.id]
    if (oficial) {
      a.slides = oficial.map((s, i) => ({
        id: `os${++_osId}`, aula_id: a.id, titulo: s.titulo, texto: s.texto, imagem_url: s.imagem_url, ordem: i + 1,
      }))
    }
  }
}

export const mockProgressos: Progresso[] = [
  { id: 'pr1', user_id: '2', aula_id: 'aula-1-1', modulo_id: 'm01', concluida: true, tempo_estudo: 25, quiz_realizado: true, quiz_nota: 90, updated_at: '2024-05-01' },
  { id: 'pr2', user_id: '2', aula_id: 'aula-1-2', modulo_id: 'm01', concluida: true, tempo_estudo: 20, quiz_realizado: false, updated_at: '2024-05-02' },
  { id: 'pr3', user_id: '2', aula_id: 'aula-1-3', modulo_id: 'm01', concluida: true, tempo_estudo: 18, quiz_realizado: false, updated_at: '2024-05-03' },
  { id: 'pr4', user_id: '2', aula_id: 'aula-2-1', modulo_id: 'm02', concluida: true, tempo_estudo: 30, quiz_realizado: false, updated_at: '2024-05-05' },
  { id: 'pr5', user_id: '2', aula_id: 'aula-2-2', modulo_id: 'm02', concluida: false, tempo_estudo: 15, quiz_realizado: false, updated_at: '2024-05-06' },
]

// Compat com versão antiga
export const mockSlides: Record<string, Slide[]> = mockModulos
  .flatMap(m => m.aulas || [])
  .reduce<Record<string, Slide[]>>((acc, a) => {
    if (a.slides && a.slides.length) acc[a.id] = a.slides
    return acc
  }, {})

export const mockQuizzes: Record<string, Quiz> = mockModulos
  .flatMap(m => m.aulas || [])
  .reduce<Record<string, Quiz>>((acc, a) => {
    if (a.quiz) acc[a.id] = a.quiz
    return acc
  }, {})

export const recentActivity = [
  { user: 'João Silva', initials: 'JS', action: 'Concluiu Aula', target: 'Fundamentos da IA', time: '2 min atrás', actionType: 'completed' },
  { user: 'Maria Costa', initials: 'MC', action: 'Iniciou Módulo', target: 'Machine Learning', time: '15 min atrás', actionType: 'started' },
  { user: 'Pedro Rocha', initials: 'PR', action: 'Reprovou Quiz', target: 'Segurança e LGPD', time: '1 hora atrás', actionType: 'failed' },
  { user: 'Ana Lima', initials: 'AL', action: 'Concluiu Aula', target: 'IA para Excel', time: '3 horas atrás', actionType: 'completed' },
  { user: 'Carlos Mendes', initials: 'CM', action: 'Emitiu Certificado', target: 'Curso Completo', time: '5 horas atrás', actionType: 'certificate' },
]
