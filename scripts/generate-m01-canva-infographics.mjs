import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = join(process.cwd(), 'public', 'slides', 'm01')
mkdirSync(outDir, { recursive: true })

const C = {
  bg: '#020817',
  panel: '#07162b',
  panel2: '#0a203a',
  stroke: '#1e5c88',
  cyan: '#28d9ff',
  blue: '#4aa3ff',
  text: '#f8fbff',
  muted: '#c7d5e8',
  dim: '#6f8fb2',
  green: '#53f0b4',
  amber: '#ffd166',
  pink: '#ff77a8',
  violet: '#9b8cff',
}

const slides = [
  {
    file: 'aula-1-1-01.svg',
    tag: 'CONCEITO',
    title: ['IA e um assistente', 'de rascunho'],
    subtitle: 'Ela ajuda voce a comecar melhor.',
    intro: 'A IA transforma ideias soltas em rascunhos claros, economizando tempo e desbloqueando sua criatividade.',
    stepsTitle: 'COMO FUNCIONA',
    steps: [
      ['Voce entrega', 'Tarefa + contexto', 'Explique o que precisa e para quem.'],
      ['A IA organiza', 'Texto + ideias', 'Ela estrutura as informacoes.'],
      ['Voce revisa', 'Corrige + decide', 'Voce tem o controle final.'],
    ],
    remember: ['PARA LEMBRAR', 'Voce entrega -> A IA organiza -> Voce revisa'],
    benefitsTitle: 'BENEFICIOS',
    benefits: [
      ['Mais produtividade', 'Economize tempo no comeco.'],
      ['Ideias com clareza', 'Organize pensamentos soltos.'],
      ['Mais qualidade', 'Rascunhos prontos para evoluir.'],
    ],
    practicesTitle: 'BOAS PRATICAS',
    practices: [
      ['Seja claro no pedido', 'Mais contexto, melhor resultado.'],
      ['Revise com criterio', 'A IA sugere, voce decide.'],
      ['Use como ponto de partida', 'Aprimore antes de enviar.'],
    ],
    final: 'IA e sua parceira, nao o piloto.',
    final2: 'Use, revise, aprimore e faca acontecer!',
    accent: C.cyan,
  },
  {
    file: 'aula-1-1-02.svg',
    tag: 'ANTES E DEPOIS',
    title: ['Do zero ao rascunho', 'em minutos'],
    subtitle: 'A IA reduz a tela em branco.',
    intro: 'Em vez de comecar sozinho, voce pede uma base inicial e usa seu criterio para melhorar.',
    stepsTitle: 'A MUDANCA',
    steps: [
      ['Antes', 'Comecar do zero', 'Mais tempo para organizar ideias.'],
      ['Com IA', 'Receber uma base', 'Um rascunho aparece rapido.'],
      ['Final', 'Revisar e aprovar', 'Voce melhora antes de usar.'],
    ],
    remember: ['PARA LEMBRAR', 'A IA acelera o inicio. Voce garante a qualidade final.'],
    benefitsTitle: 'GANHOS',
    benefits: [
      ['Menos bloqueio', 'A primeira versao nasce rapido.'],
      ['Mais foco', 'Voce trabalha no que importa.'],
      ['Mais ritmo', 'Tarefas simples andam melhor.'],
    ],
    practicesTitle: 'CUIDADOS',
    practices: [
      ['Nao copie sem ler', 'Sempre revise o texto.'],
      ['Confira dados', 'Datas e numeros precisam fonte.'],
      ['Ajuste o tom', 'Adapte para seu publico.'],
    ],
    final: 'A IA tira voce do zero.',
    final2: 'Voce transforma o rascunho em trabalho bom.',
    accent: C.green,
  },
  {
    file: 'aula-1-1-03.svg',
    tag: 'PASSO A PASSO',
    title: ['Use IA com', 'seguranca'],
    subtitle: 'Siga a ordem para evitar erro.',
    intro: 'O segredo para leigos e usar um fluxo simples: pedir, receber, revisar e so entao aplicar.',
    stepsTitle: 'FLUXO SEGURO',
    steps: [
      ['1. Explique', 'Tarefa simples', 'Diga exatamente o que quer.'],
      ['2. Contexto', 'Para quem e formato', 'Mostre objetivo e publico.'],
      ['3. Revise', 'Antes de usar', 'Confira nomes, numeros e tom.'],
    ],
    remember: ['PARA LEMBRAR', 'Prompt bom + revisao humana = resultado confiavel.'],
    benefitsTitle: 'BENEFICIOS',
    benefits: [
      ['Menos retrabalho', 'O pedido fica mais claro.'],
      ['Mais controle', 'Voce acompanha cada etapa.'],
      ['Mais confianca', 'Erros aparecem antes.'],
    ],
    practicesTitle: 'BOAS PRATICAS',
    practices: [
      ['Use frases simples', 'Nao precisa falar tecnico.'],
      ['Peça formato', 'Lista, tabela ou e-mail.'],
      ['Refine depois', 'Melhore em rodadas curtas.'],
    ],
    final: 'Nao pule a revisao.',
    final2: 'Ela e a parte mais importante do processo.',
    accent: C.amber,
  },
  {
    file: 'aula-1-1-04.svg',
    tag: 'EXEMPLO',
    title: ['E-mail longo vira', 'resposta clara'],
    subtitle: 'A IA organiza a bagunca.',
    intro: 'Cole um e-mail grande e peca um resumo com pendencias. Depois voce decide a resposta.',
    stepsTitle: 'EXEMPLO PRATICO',
    steps: [
      ['Entrada', 'E-mail grande', 'Muitas ideias misturadas.'],
      ['IA resume', '3 linhas + acoes', 'Ela separa o essencial.'],
      ['Voce responde', 'Texto revisado', 'A resposta final e sua.'],
    ],
    remember: ['PROMPT MODELO', 'Resuma em 3 linhas e liste o que preciso responder.'],
    benefitsTitle: 'BENEFICIOS',
    benefits: [
      ['Menos confusao', 'Pedidos ficam visiveis.'],
      ['Mais rapidez', 'Voce encontra o ponto central.'],
      ['Resposta melhor', 'Fica mais facil decidir.'],
    ],
    practicesTitle: 'CUIDADOS',
    practices: [
      ['Ocultar sigilo', 'Nao cole dados sensiveis.'],
      ['Conferir sentido', 'Veja se entendeu certo.'],
      ['Personalizar tom', 'Adapte antes de enviar.'],
    ],
    final: 'A IA organiza o caminho.',
    final2: 'Voce escolhe a melhor resposta.',
    accent: C.blue,
  },
  {
    file: 'aula-1-1-05.svg',
    tag: 'REGRA DE OURO',
    title: ['IA ajuda.', 'Voce decide.'],
    subtitle: 'Nunca envie sem revisar.',
    intro: 'A IA pode errar com confianca. Por isso, sua revisao e parte do trabalho, nao detalhe.',
    stepsTitle: 'CHECKLIST',
    steps: [
      ['Nomes', 'Pessoas e empresas', 'Confira a escrita correta.'],
      ['Numeros', 'Valores e datas', 'Valide na fonte original.'],
      ['Tom', 'Publico e objetivo', 'Ajuste a linguagem final.'],
    ],
    remember: ['PARA LEMBRAR', 'Se envolve cliente, dinheiro ou lei, revise com calma.'],
    benefitsTitle: 'EVITA PROBLEMAS',
    benefits: [
      ['Erro publico', 'Informacao errada enviada.'],
      ['Tom inadequado', 'Mensagem fria ou dura.'],
      ['Dado sensivel', 'Risco de confidencialidade.'],
    ],
    practicesTitle: 'BOAS PRATICAS',
    practices: [
      ['Leia em voz alta', 'Ajuda a pegar estranhezas.'],
      ['Compare com fonte', 'Cheque dados importantes.'],
      ['Peca versao melhor', 'Refine antes de aprovar.'],
    ],
    final: 'A IA e copiloto.',
    final2: 'O volante continua com voce.',
    accent: C.pink,
  },
  {
    file: 'aula-1-2-01.svg',
    tag: 'COTIDIANO',
    title: ['A IA ja esta', 'perto de voce'],
    subtitle: 'Ela aparece em ferramentas comuns.',
    intro: 'Mesmo antes do ChatGPT, a IA ja ajudava em sugestoes, filtros, alertas e recomendacoes.',
    stepsTitle: 'ONDE APARECE',
    steps: [
      ['Celular', 'Sugestoes', 'Corretor e reconhecimento.'],
      ['Banco', 'Alertas', 'Fraude e risco.'],
      ['E-mail', 'Filtros', 'Spam e prioridade.'],
    ],
    remember: ['PARA LEMBRAR', 'Quando uma ferramenta sugere ou classifica, pode haver IA.'],
    benefitsTitle: 'GANHOS',
    benefits: [
      ['Mais praticidade', 'Menos passos manuais.'],
      ['Mais rapidez', 'Decisoes simples aceleram.'],
      ['Mais contexto', 'Ferramentas ficam inteligentes.'],
    ],
    practicesTitle: 'OBSERVE',
    practices: [
      ['Procure sugestoes', 'Onde a ferramenta antecipa?'],
      ['Veja filtros', 'O que ela separa sozinha?'],
      ['Teste recursos', 'Use com cuidado e curiosidade.'],
    ],
    final: 'A IA nao chegou do nada.',
    final2: 'Ela ja fazia parte da sua rotina.',
    accent: C.violet,
  },
  {
    file: 'aula-1-2-02.svg',
    tag: 'MUDANCA',
    title: ['Agora voce conversa', 'com a IA'],
    subtitle: 'Antes ela ficava escondida.',
    intro: 'A grande virada e poder pedir ajuda em linguagem simples, como se estivesse explicando para uma pessoa.',
    stepsTitle: 'ANTES E AGORA',
    steps: [
      ['Antes', 'IA invisivel', 'Sugestoes automaticas.'],
      ['Agora', 'Pedido em texto', 'Voce escreve o que precisa.'],
      ['Depois', 'Revisao humana', 'Voce aprova o resultado.'],
    ],
    remember: ['PARA LEMBRAR', 'Escrever bem o pedido melhora a resposta.'],
    benefitsTitle: 'BENEFICIOS',
    benefits: [
      ['Acesso facil', 'Nao precisa programar.'],
      ['Mais autonomia', 'Voce pede direto.'],
      ['Mais aprendizado', 'Cada teste ensina algo.'],
    ],
    practicesTitle: 'BOAS PRATICAS',
    practices: [
      ['Explique objetivo', 'Para que serve o texto?'],
      ['Defina publico', 'Quem vai ler?'],
      ['Peça formato', 'Lista, e-mail ou tabela.'],
    ],
    final: 'Fale com clareza.',
    final2: 'A IA responde melhor quando entende o contexto.',
    accent: C.cyan,
  },
  {
    file: 'aula-1-2-03.svg',
    tag: 'IDENTIFIQUE',
    title: ['Quatro sinais', 'de IA'],
    subtitle: 'Procure esses sinais no trabalho.',
    intro: 'Voce nao precisa saber tecnologia para reconhecer IA: observe o comportamento da ferramenta.',
    stepsTitle: 'SINAIS',
    steps: [
      ['Sugere', 'Completa ideias', 'Antecipacao de texto.'],
      ['Organiza', 'Classifica dados', 'Separa por padroes.'],
      ['Gera', 'Texto ou resumo', 'Cria uma primeira versao.'],
    ],
    remember: ['PARA LEMBRAR', 'Sugestao, filtro e geracao sao pistas fortes de IA.'],
    benefitsTitle: 'ONDE OLHAR',
    benefits: [
      ['E-mail', 'Spam e respostas sugeridas.'],
      ['Office', 'Copilot e resumos.'],
      ['Celular', 'Fotos e teclado.'],
    ],
    practicesTitle: 'TREINO',
    practices: [
      ['Liste ferramentas', 'As que usa todo dia.'],
      ['Marque sinais', 'Sugere, filtra ou gera?'],
      ['Teste com calma', 'Sem dados sigilosos.'],
    ],
    final: 'Perceber e o primeiro passo.',
    final2: 'Depois voce aprende a usar com intencao.',
    accent: C.green,
  },
  {
    file: 'aula-1-2-04.svg',
    tag: 'ESCRITORIO',
    title: ['E-mail e o exemplo', 'mais facil'],
    subtitle: 'A IA ajuda a organizar a caixa.',
    intro: 'A caixa de entrada e cheia de repeticao, prioridade e texto. Por isso e um otimo lugar para comecar.',
    stepsTitle: 'FLUXO',
    steps: [
      ['Caixa cheia', 'Muitos e-mails', 'Tudo misturado.'],
      ['IA separa', 'Urgente ou nao', 'Cria prioridade.'],
      ['Voce responde', 'Com controle', 'Aprova antes de enviar.'],
    ],
    remember: ['PARA LEMBRAR', 'A IA organiza. A resposta final continua humana.'],
    benefitsTitle: 'BENEFICIOS',
    benefits: [
      ['Menos sobrecarga', 'Prioridade fica clara.'],
      ['Mais foco', 'Responda o essencial.'],
      ['Mais padrao', 'Mensagens ficam melhores.'],
    ],
    practicesTitle: 'BOAS PRATICAS',
    practices: [
      ['Comece com resumo', 'Nao envie de primeira.'],
      ['Peça tom adequado', 'Formal, cordial ou direto.'],
      ['Revise nomes', 'Evite erro simples.'],
    ],
    final: 'E-mail e o laboratorio ideal.',
    final2: 'Teste com uma mensagem real e simples.',
    accent: C.amber,
  },
  {
    file: 'aula-1-2-05.svg',
    tag: 'PRATICA',
    title: ['Ache IA em', '3 ferramentas'],
    subtitle: 'Treine o olhar de iniciante.',
    intro: 'Esta atividade ajuda voce a sair da teoria e enxergar IA em tarefas que ja fazem parte do seu dia.',
    stepsTitle: 'ATIVIDADE',
    steps: [
      ['Abra', 'Ferramenta diaria', 'E-mail, celular ou Office.'],
      ['Procure', 'Sugestao ou resumo', 'Veja o que ela faz sozinha.'],
      ['Anote', 'O que revisar', 'Separe ajuda de decisao.'],
    ],
    remember: ['PARA LEMBRAR', 'Toda IA precisa de uso consciente e revisao humana.'],
    benefitsTitle: 'RESULTADO',
    benefits: [
      ['Mais percepcao', 'Voce reconhece recursos.'],
      ['Mais seguranca', 'Sabe onde revisar.'],
      ['Mais autonomia', 'Testa sem medo.'],
    ],
    practicesTitle: 'DICAS',
    practices: [
      ['Nao use dados reais sensiveis', 'Comece com exemplos simples.'],
      ['Compare antes e depois', 'Veja se ajudou mesmo.'],
      ['Guarde bons prompts', 'Reaproveite depois.'],
    ],
    final: 'A melhor forma de aprender e testar.',
    final2: 'Pequeno, pratico e com revisao.',
    accent: C.blue,
  },
  {
    file: 'aula-1-3-01.svg',
    tag: 'DIFERENCA',
    title: ['IA nao e', 'automacao comum'],
    subtitle: 'Cada uma resolve um tipo de tarefa.',
    intro: 'Automacao segue regra fixa. IA interpreta contexto. Entender isso evita confusao.',
    stepsTitle: 'COMPARE',
    steps: [
      ['Automacao', 'Regra fixa', 'Se X acontece, faca Y.'],
      ['IA', 'Interpreta contexto', 'Entende textos diferentes.'],
      ['Voce', 'Supervisiona', 'Escolhe o uso correto.'],
    ],
    remember: ['PARA LEMBRAR', 'Automacao executa regra. IA ajuda a interpretar.'],
    benefitsTitle: 'QUANDO USAR',
    benefits: [
      ['Regra clara', 'Use automacao.'],
      ['Texto variavel', 'Use IA.'],
      ['Processo completo', 'Combine as duas.'],
    ],
    practicesTitle: 'CUIDADOS',
    practices: [
      ['Nao complique', 'Regra simples nao precisa IA.'],
      ['Nao automatize erro', 'Teste antes.'],
      ['Revise decisao', 'IA pode classificar mal.'],
    ],
    final: 'Ferramenta certa para o problema certo.',
    final2: 'Esse e o segredo da produtividade.',
    accent: C.pink,
  },
  {
    file: 'aula-1-3-02.svg',
    tag: 'AUTOMACAO',
    title: ['Quando a regra', 'e clara'],
    subtitle: 'Use para repeticao previsivel.',
    intro: 'Automacao e perfeita quando voce consegue escrever uma regra objetiva e repetir sempre igual.',
    stepsTitle: 'EXEMPLO',
    steps: [
      ['Se acontece X', 'Chegou nota fiscal', 'Condicao clara.'],
      ['Faca Y', 'Mover para pasta', 'Acao definida.'],
      ['Resultado', 'Sempre igual', 'Pouca interpretacao.'],
    ],
    remember: ['PARA LEMBRAR', 'Automacao e uma receita. Ela nao interpreta contexto complexo.'],
    benefitsTitle: 'BENEFICIOS',
    benefits: [
      ['Consistencia', 'Sempre faz igual.'],
      ['Velocidade', 'Economiza clique.'],
      ['Padronizacao', 'Processo fica previsivel.'],
    ],
    practicesTitle: 'BOAS PRATICAS',
    practices: [
      ['Documente a regra', 'Escreva o passo a passo.'],
      ['Teste com exemplo', 'Veja se funciona.'],
      ['Revise excecoes', 'O que foge da regra?'],
    ],
    final: 'Regra fixa combina com automacao.',
    final2: 'Contexto variavel pede IA.',
    accent: C.violet,
  },
  {
    file: 'aula-1-3-03.svg',
    tag: 'IA',
    title: ['Quando precisa', 'entender contexto'],
    subtitle: 'Use quando cada caso muda.',
    intro: 'A IA ajuda quando a tarefa envolve linguagem, prioridade, intencao ou interpretacao.',
    stepsTitle: 'EXEMPLO',
    steps: [
      ['Entrada', 'Textos diferentes', 'Cada mensagem muda.'],
      ['IA le', 'Compara sentido', 'Busca padroes.'],
      ['Voce confere', 'Decisao final', 'Corrige se precisar.'],
    ],
    remember: ['PARA LEMBRAR', 'IA classifica melhor com contexto claro e exemplos.'],
    benefitsTitle: 'BENEFICIOS',
    benefits: [
      ['Lida com variacao', 'Nem tudo precisa regra fixa.'],
      ['Resume rapido', 'Ajuda a entender volume.'],
      ['Apoia decisao', 'Mostra caminhos possiveis.'],
    ],
    practicesTitle: 'CUIDADOS',
    practices: [
      ['Dê exemplos', 'Mostre o padrao esperado.'],
      ['Peça justificativa', 'Entenda a classificacao.'],
      ['Revise amostras', 'Confira antes de confiar.'],
    ],
    final: 'IA interpreta, mas nao e infalivel.',
    final2: 'Use como apoio de decisao.',
    accent: C.cyan,
  },
  {
    file: 'aula-1-3-04.svg',
    tag: 'DECISAO',
    title: ['Escolha com', '3 perguntas'],
    subtitle: 'Um mapa simples para nao confundir.',
    intro: 'Quando surgir uma tarefa, responda tres perguntas antes de escolher a ferramenta.',
    stepsTitle: 'MAPA RAPIDO',
    steps: [
      ['Regra clara?', 'Automacao', 'Repete sempre igual.'],
      ['Texto muda?', 'IA', 'Precisa interpretar.'],
      ['Decide e executa?', 'IA + automacao', 'Cada uma no seu papel.'],
    ],
    remember: ['PARA LEMBRAR', 'Comece pequeno, teste e so depois aumente o fluxo.'],
    benefitsTitle: 'GANHOS',
    benefits: [
      ['Menos erro', 'Escolha mais consciente.'],
      ['Mais economia', 'Nao use IA sem necessidade.'],
      ['Mais controle', 'Voce sabe o papel de cada etapa.'],
    ],
    practicesTitle: 'DICAS',
    practices: [
      ['Desenhe o processo', 'Entrada, decisao e saida.'],
      ['Marque regras fixas', 'Automatize essas partes.'],
      ['Marque interpretacao', 'Use IA nessas partes.'],
    ],
    final: 'Decidir antes evita retrabalho.',
    final2: 'A ferramenta certa deixa tudo mais simples.',
    accent: C.green,
  },
  {
    file: 'aula-1-3-05.svg',
    tag: 'COMBINACAO',
    title: ['O melhor dos', 'dois mundos'],
    subtitle: 'Rapido, controlado e facil de revisar.',
    intro: 'O fluxo mais forte combina IA para entender, pessoa para revisar e automacao para executar.',
    stepsTitle: 'FLUXO IDEAL',
    steps: [
      ['IA entende', 'Analisa contexto', 'Resume ou classifica.'],
      ['Voce revisa', 'Aprova decisao', 'Corrige se necessario.'],
      ['Automacao faz', 'Executa acao', 'Registra e avisa.'],
    ],
    remember: ['PARA LEMBRAR', 'IA decide melhor com supervisao. Automacao executa melhor com regra.'],
    benefitsTitle: 'BENEFICIOS',
    benefits: [
      ['Mais velocidade', 'Menos trabalho manual.'],
      ['Mais seguranca', 'Humano no ponto critico.'],
      ['Mais rastreio', 'Processo fica documentado.'],
    ],
    practicesTitle: 'BOAS PRATICAS',
    practices: [
      ['Defina revisao', 'Quem aprova?'],
      ['Defina gatilho', 'Quando executa?'],
      ['Monitore resultado', 'Melhore o fluxo.'],
    ],
    final: 'IA e automacao juntas multiplicam resultado.',
    final2: 'Voce continua no controle.',
    accent: C.teal,
  },
]

function esc(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function txt(x, y, value, size, weight = 700, fill = C.text, anchor = 'start') {
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="Segoe UI, Arial, sans-serif" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${esc(value)}</text>`
}

function wrap(x, y, value, max, size, weight = 500, fill = C.muted, line = 1.25) {
  const words = String(value).split(' ')
  const lines = []
  let current = ''
  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > max && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }
  if (current) lines.push(current)
  return lines.slice(0, 3).map((part, i) => txt(x, y + i * size * line, part, size, weight, fill)).join('')
}

function icon(cx, cy, accent, type) {
  const common = `stroke="${accent}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"`
  if (type === 0) {
    return `<circle cx="${cx}" cy="${cy}" r="44" fill="${accent}" opacity=".16"/><path d="M${cx - 24} ${cy} H${cx + 24} M${cx} ${cy - 24} V${cy + 24}" ${common}/>`
  }
  if (type === 1) {
    return `<circle cx="${cx}" cy="${cy}" r="44" fill="${accent}" opacity=".16"/><path d="M${cx - 26} ${cy + 2} L${cx - 6} ${cy + 24} L${cx + 28} ${cy - 24}" ${common}/>`
  }
  if (type === 2) {
    return `<circle cx="${cx}" cy="${cy}" r="44" fill="${accent}" opacity=".16"/><path d="M${cx - 20} ${cy + 26} L${cx + 26} ${cy - 20} L${cx + 10} ${cy - 36} L${cx - 36} ${cy + 10} Z M${cx - 28} ${cy + 32} L${cx - 8} ${cy + 26}" ${common}/>`
  }
  if (type === 3) {
    return `<circle cx="${cx}" cy="${cy}" r="44" fill="${accent}" opacity=".16"/><path d="M${cx - 22} ${cy + 20} V${cy - 20} H${cx + 22} V${cy + 20} Z M${cx - 14} ${cy - 4} H${cx + 14} M${cx - 14} ${cy + 10} H${cx + 8}" ${common}/>`
  }
  return `<circle cx="${cx}" cy="${cy}" r="44" fill="${accent}" opacity=".16"/><path d="M${cx - 24} ${cy + 22} C${cx - 8} ${cy - 16} ${cx + 10} ${cy - 16} ${cx + 26} ${cy + 22} M${cx - 12} ${cy + 20} L${cx} ${cy - 28} L${cx + 12} ${cy + 20}" ${common}/>`
}

function robot(accent) {
  return `<g id="robot-illustration" filter="url(#soft)">
    <ellipse cx="1465" cy="212" rx="265" ry="190" fill="${accent}" opacity=".08"/>
    <rect x="1330" y="130" width="250" height="170" rx="74" fill="#dff7ff" opacity=".98"/>
    <rect x="1362" y="158" width="186" height="116" rx="54" fill="#062052"/>
    <path d="M1407 218 Q1422 198 1437 218 M1475 218 Q1490 198 1505 218" stroke="${accent}" stroke-width="10" stroke-linecap="round" fill="none"/>
    <path d="M1425 246 Q1455 270 1485 246" stroke="${accent}" stroke-width="8" stroke-linecap="round" fill="none"/>
    <circle cx="1315" cy="210" r="40" fill="#7ddcff"/><circle cx="1595" cy="210" r="40" fill="#7ddcff"/>
    <rect x="1368" y="302" width="184" height="118" rx="58" fill="#bfeeff"/>
    <path d="M1352 360 C1285 370 1260 430 1320 468" stroke="#bfeeff" stroke-width="34" stroke-linecap="round" fill="none"/>
    <path d="M1568 360 C1635 372 1660 430 1600 468" stroke="#bfeeff" stroke-width="34" stroke-linecap="round" fill="none"/>
    <rect x="1260" y="455" width="390" height="70" rx="20" fill="#dff7ff" opacity=".9"/>
    <path d="M1305 484 H1535 M1305 508 H1455" stroke="#45bdf2" stroke-width="8" stroke-linecap="round"/>
    <rect x="1202" y="182" width="156" height="84" rx="28" fill="#0e74b8" opacity=".65"/>
    <circle cx="1242" cy="224" r="8" fill="#c8f7ff"/><circle cx="1280" cy="224" r="8" fill="#c8f7ff"/><circle cx="1318" cy="224" r="8" fill="#c8f7ff"/>
    <path d="M1698 132 L1710 160 L1740 170 L1710 180 L1698 208 L1686 180 L1656 170 L1686 160 Z" fill="${accent}" opacity=".8"/>
  </g>`
}

function stepCard(x, y, step, accent, i) {
  return `<g filter="url(#soft)">
    <rect x="${x}" y="${y}" width="330" height="205" rx="34" fill="${C.panel}" stroke="${accent}" stroke-opacity=".45" stroke-width="2"/>
    ${icon(x + 68, y + 68, accent, i)}
    ${wrap(x + 128, y + 68, step[0], 15, 29, 850, C.text)}
    ${wrap(x + 128, y + 108, step[1], 18, 21, 800, accent)}
    ${wrap(x + 34, y + 160, step[2], 32, 21, 500, C.muted)}
  </g>`
}

function listItem(x, y, item, accent, i) {
  return `<g>
    ${icon(x + 34, y + 34, accent, i)}
    ${wrap(x + 86, y + 25, item[0], 22, 24, 850, C.text)}
    ${wrap(x + 86, y + 58, item[1], 32, 19, 500, C.muted)}
    <path d="M${x + 86} ${y + 92} H${x + 385}" stroke="${C.line}" stroke-width="2"/>
  </g>`
}

function render(s) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${C.bg}"/>
      <stop offset="1" stop-color="#06182e"/>
    </linearGradient>
    <radialGradient id="glow" cx="76%" cy="16%" r="62%">
      <stop offset="0" stop-color="${s.accent}" stop-opacity=".32"/>
      <stop offset=".58" stop-color="${s.accent}" stop-opacity=".08"/>
      <stop offset="1" stop-color="${s.accent}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000" flood-opacity=".35"/>
    </filter>
    <marker id="arrow" markerWidth="20" markerHeight="20" refX="16" refY="10" orient="auto">
      <path d="M2 2 L18 10 L2 18 Z" fill="${s.accent}"/>
    </marker>
  </defs>
  <rect width="1920" height="1080" fill="url(#bg)"/>
  <rect width="1920" height="1080" fill="url(#glow)"/>
  <g opacity=".09" stroke="${C.line}" stroke-width="2">
    ${Array.from({ length: 13 }, (_, i) => `<path d="M${i * 160} 0 V1080"/>`).join('')}
    ${Array.from({ length: 8 }, (_, i) => `<path d="M0 ${i * 150} H1920"/>`).join('')}
  </g>

  <rect x="86" y="70" width="210" height="52" rx="26" fill="${s.accent}"/>
  ${txt(126, 105, s.tag, 23, 900, '#03101f')}
  ${txt(86, 206, s.title[0], 74, 900, C.text)}
  ${txt(86, 290, s.title[1], 74, 900, s.accent)}
  ${wrap(90, 352, s.subtitle, 40, 34, 850, C.text)}
  <path d="M90 410 H220" stroke="${s.accent}" stroke-width="4" stroke-linecap="round"/>
  ${wrap(90, 475, s.intro, 52, 27, 500, C.muted)}
  ${robot(s.accent)}

  <path d="M90 610 H660" stroke="${C.line}" stroke-width="2"/>
  ${txt(760, 622, s.stepsTitle, 30, 900, s.accent, 'middle')}
  <path d="M860 610 H1830" stroke="${C.line}" stroke-width="2"/>
  ${stepCard(86, 665, s.steps[0], s.accent, 0)}
  <path d="M430 770 H510" stroke="${s.accent}" stroke-width="12" stroke-linecap="round" marker-end="url(#arrow)"/>
  ${stepCard(540, 665, s.steps[1], s.accent, 1)}
  <path d="M884 770 H964" stroke="${s.accent}" stroke-width="12" stroke-linecap="round" marker-end="url(#arrow)"/>
  ${stepCard(994, 665, s.steps[2], s.accent, 2)}

  <g filter="url(#soft)">
    <rect x="1385" y="665" width="445" height="205" rx="34" fill="${C.panel2}" stroke="${s.accent}" stroke-opacity=".45" stroke-width="2"/>
    ${icon(1448, 728, s.accent, 3)}
    ${txt(1512, 718, s.remember[0], 22, 900, s.accent)}
    ${wrap(1512, 765, s.remember[1], 30, 21, 700, C.text)}
  </g>

  <path d="M90 910 H185" stroke="${C.line}" stroke-width="2"/>
  ${txt(225, 924, s.benefitsTitle, 28, 900, s.accent)}
  <path d="M450 910 H850" stroke="${C.line}" stroke-width="2"/>
  <path d="M1010 910 H1090" stroke="${C.line}" stroke-width="2"/>
  ${txt(1130, 924, s.practicesTitle, 28, 900, s.accent)}
  <path d="M1425 910 H1830" stroke="${C.line}" stroke-width="2"/>
  ${listItem(86, 950, s.benefits[0], s.accent, 0)}
  ${listItem(485, 950, s.benefits[1], s.accent, 1)}
  ${listItem(884, 950, s.benefits[2], s.accent, 2)}
  ${listItem(1125, 950, s.practices[0], s.accent, 3)}
  ${listItem(1455, 950, s.practices[1], s.accent, 4)}

  <rect x="86" y="1028" width="1744" height="1" fill="${s.accent}" opacity=".35"/>
</svg>`
}

for (const slide of slides) {
  writeFileSync(join(outDir, slide.file), render(slide), 'utf8')
}

console.log(`Generated ${slides.length} landscape infographics from reference model in ${outDir}`)
