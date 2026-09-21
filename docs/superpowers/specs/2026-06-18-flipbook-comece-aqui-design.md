# Flipbook “Comece aqui”

## Objetivo

Criar uma introdução visual simples para alunos totalmente leigos acessarem antes de iniciar o curso.

## Entrada e navegação

- Adicionar o item **Comece aqui** no topo do menu lateral do aluno, antes de **Apresentação do Curso**.
- O item abrirá uma página própria na rota `/comece-aqui`.
- A página seguirá o mesmo tema visual e a mesma estrutura de navegação do restante da plataforma.
- A área administrativa não receberá esse item.

## Conteúdo do flipbook

- Usar as 49 imagens existentes em `public/flipbook`.
- Preservar rigorosamente a ordem:
  - `imagen01.png`
  - `imagen02.png`
  - …
  - `imagen49.png`
- Exibir uma imagem por vez, centralizada e ajustada à tela sem cortar seu conteúdo.
- Mostrar um contador simples, como **1 de 49**.

## Controles

- Exibir botões grandes e claros: **Anterior** e **Próxima**.
- Desabilitar **Anterior** na primeira imagem.
- Permitir navegação pelas setas esquerda e direita do teclado.
- Na imagem 49, substituir **Próxima** por **Iniciar o curso**.
- **Iniciar o curso** levará o aluno ao Módulo 1, identificado pelo módulo de ordem `1`.
- Se o Módulo 1 não estiver disponível, o botão levará ao dashboard.

## Narração automática e audiodescrição

- Cada página terá um texto de narração correspondente ao conteúdo legível da imagem.
- Na primeira visita, exibir o botão grande **Ativar áudio e começar**, pois navegadores podem bloquear voz automática antes de uma ação do usuário.
- Depois da ativação, narrar automaticamente a página atual e cada nova página aberta.
- Ao trocar de página, interromper imediatamente a fala anterior antes de iniciar a nova.
- Exibir controles claros para **Pausar**, **Continuar** e **Repetir página**.
- Usar a Web Speech API já adotada pelo curso, priorizando uma voz em português do Brasil quando disponível.
- Se a voz automática não estiver disponível no dispositivo, manter o flipbook utilizável e mostrar uma mensagem curta explicando que a narração não pôde ser iniciada.
- A preferência de áudio ativo será mantida durante a visita ao flipbook, mas o navegador poderá exigir nova ativação após fechar ou recarregar a página.

## Experiência em celular e acessibilidade

- O flipbook será responsivo para computador, tablet e celular.
- Os botões terão áreas grandes de clique e texto explícito, evitando controles difíceis para iniciantes.
- Cada imagem terá uma descrição acessível com seu número e o texto correspondente à página.
- O foco do teclado permanecerá visível.
- A página não terá animação pesada de virada de papel; será usada uma transição leve entre imagens para preservar desempenho e legibilidade.

## Carregamento e falhas

- A imagem seguinte poderá ser pré-carregada para reduzir a espera ao avançar.
- Durante o carregamento, será exibido um indicador simples.
- Se uma imagem não carregar, a página informará qual número falhou e permitirá tentar novamente ou continuar.

## Componentes

- `ComeceAqui`: página responsável pela navegação, contador, teclado e destino final.
- Lista estática e ordenada com os caminhos das 49 imagens.
- Arquivo de conteúdo com a transcrição/audiodescrição correspondente a cada imagem.
- Controle de voz isolado, responsável por iniciar, pausar, continuar, repetir e cancelar a narração.
- Nova rota protegida `/comece-aqui`.
- Novo item no menu lateral do aluno.

## Verificação

- Confirmar que existem exatamente 49 páginas.
- Confirmar que a sequência começa em `imagen01.png` e termina em `imagen49.png`.
- Testar os limites: não voltar antes da página 1 e não avançar além da página 49.
- Testar navegação por botões e teclado.
- Testar a ativação inicial da voz, a narração automática ao trocar de página e o cancelamento da fala anterior.
- Testar os controles de pausar, continuar e repetir.
- Testar o funcionamento sem suporte à Web Speech API.
- Testar o destino de **Iniciar o curso**.
- Executar testes automatizados relevantes e o build de produção.
