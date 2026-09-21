# Design — Aba “Exemplos de Uso”

Data: 23 de junho de 2026

## Objetivo

Adicionar ao aplicativo uma nova aba chamada **Exemplos de Uso**, destinada a pessoas com pouco conhecimento em inteligência artificial. A área ensinará tarefas práticas por meio de 28 slides infográficos cinematográficos, divididos igualmente entre ChatGPT, Gemini, Microsoft Copilot e Claude.

## Escopo aprovado

- 28 slides no total.
- 7 tarefas diferentes para cada ferramenta.
- Cada slide ensina uma tarefa completa e independente.
- Imagens produzidas externamente pelo usuário no gerador de imagens do GPT.
- Interfaces simuladas, inspiradas nas ferramentas, sem reprodução exata das interfaces reais.
- Formato visual 16:9, cinematográfico e consistente.
- Textos em português do Brasil.
- Linguagem simples para iniciantes.
- Prompt operacional completo exibido como texto selecionável no aplicativo.
- Botão **Copiar prompt** em cada slide.

## Organização do conteúdo

### ChatGPT

1. Criar um e-mail profissional.
2. Resumir um documento.
3. Analisar uma planilha.
4. Criar uma apresentação.
5. Planejar um projeto.
6. Criar uma imagem.
7. Pesquisar um tema.

### Gemini

1. Fazer pesquisa atualizada na web.
2. Resumir e explicar um PDF.
3. Criar uma resposta para um e-mail do Gmail.
4. Organizar informações de arquivos do Drive.
5. Criar um roteiro de vídeo.
6. Analisar uma imagem.
7. Planejar uma viagem.

### Microsoft Copilot

1. Criar um documento no Word.
2. Criar uma fórmula no Excel.
3. Analisar dados no Excel.
4. Criar uma apresentação no PowerPoint.
5. Resumir uma conversa no Outlook.
6. Criar uma ata de reunião no Teams.
7. Organizar tarefas no Microsoft 365.

### Claude

1. Revisar e melhorar um texto longo.
2. Comparar dois documentos.
3. Criar um relatório executivo.
4. Analisar um contrato.
5. Organizar uma pesquisa extensa.
6. Criar um procedimento operacional padrão.
7. Criar um artefato interativo.

## Estrutura visual dos slides

Cada slide terá:

1. Identificação da ferramenta e número da tarefa.
2. Título curto e orientado à ação.
3. Uma situação cotidiana que contextualiza a tarefa.
4. Uma interface simulada da ferramenta.
5. Três ou quatro passos numerados com setas e destaques.
6. Uma pequena amostra do prompt inserido.
7. Uma prévia clara do resultado esperado.
8. Uma dica ou alerta para iniciantes.

O texto dentro da imagem será deliberadamente curto. O prompt completo ficará fora da imagem, renderizado pelo aplicativo, para preservar legibilidade, acessibilidade e a função de copiar.

## Direção de arte

- Proporção 16:9 e resolução recomendada de 1536 × 864.
- Estética cinematográfica tecnológica, elegante e didática.
- Fundo escuro com luz volumétrica, profundidade e painéis translúcidos.
- Alto contraste e hierarquia visual clara.
- Interfaces simuladas grandes, sem excesso de elementos.
- Áreas seguras nas bordas para evitar cortes.
- Sem pessoas, mãos, teclados ou elementos decorativos que prejudiquem a leitura.
- Sem marcas-d’água.
- Cada ferramenta terá uma cor de identificação:
  - ChatGPT: verde-esmeralda e turquesa.
  - Gemini: azul, violeta e vermelho suave.
  - Copilot: azul-ciano, verde e magenta.
  - Claude: terracota, âmbar e creme.

## Experiência no aplicativo

- Item **Exemplos de Uso** no menu lateral.
- Página protegida pela autenticação existente.
- Navegação anterior/próximo.
- Navegação por teclado.
- Indicador “slide atual de 28”.
- Seletor ou miniaturas por ferramenta.
- Imagem principal do slide.
- Abaixo da imagem: explicação detalhada, prompt completo, campos para personalização, resultado esperado e conferência final.
- Botão **Copiar prompt**, com confirmação visual após a cópia.
- Layout responsivo.

## Dados

O conteúdo será mantido em arquivo TypeScript local, sem alteração no Supabase nesta primeira versão. Cada item terá:

- id;
- ferramenta;
- título;
- tarefa;
- descrição;
- imagem;
- passos;
- prompt;
- campos personalizáveis;
- resultado esperado;
- conferência;
- dica.

## Estados e tratamento de erros

- Placeholder durante o carregamento da imagem.
- Mensagem e tentativa novamente se a imagem não carregar.
- Estado de confirmação ao copiar o prompt.
- Fallback claro caso a API de área de transferência não esteja disponível.

## Testes previstos

- A rota e o item do menu existem.
- Há exatamente 28 exemplos.
- Há exatamente 7 exemplos para cada ferramenta.
- Todos possuem prompt, passos, imagem e resultado esperado.
- O botão copia o prompt correto.
- A navegação não ultrapassa os limites.
- A página mantém legibilidade em telas menores.

## Critérios de aceite

- O aluno entende a tarefa sem conhecimento prévio.
- Cada slide apresenta uma tarefa diferente.
- A indicação da melhor ferramenta é explicada sem prometer resultados absolutos.
- Os prompts podem ser copiados e adaptados.
- As imagens seguem uma identidade visual uniforme.
- O aplicativo compila e os testes passam.

