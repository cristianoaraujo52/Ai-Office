# Persistência de alunos, acessos e progresso

## Objetivo

Garantir que alunos cadastrados permaneçam visíveis no painel administrativo, consigam entrar normalmente e tenham acessos e progresso registrados no Supabase.

## Banco de dados e permissões

- Manter as tabelas e os usuários existentes.
- Corrigir as políticas de segurança para que:
  - cada aluno leia e atualize somente seu próprio perfil e progresso;
  - administradores leiam todos os perfis, progressos e históricos de acesso;
  - administradores gerenciem perfis sem depender de políticas recursivas frágeis.
- Criar uma função segura `is_admin()` para centralizar a verificação de administrador.
- Criar a tabela `login_history` com usuário e data/hora do acesso.
- Criar uma função segura para garantir que o perfil do usuário autenticado exista usando os metadados do Auth.

## Cadastro e login

- Após cadastrar um aluno pelo painel, confirmar que o perfil foi criado.
- Se o trigger não criar o perfil, chamar a função segura de garantia de perfil.
- Não considerar o cadastro concluído enquanto o perfil não puder ser carregado.
- Ao autenticar, garantir o perfil antes de carregar a aplicação.
- Registrar uma entrada no histórico a cada login real.
- Evitar registros duplicados causados pelo mesmo evento de autenticação.

## Progresso

- Continuar usando `progressos`, com um registro por aluno e aula.
- Fazer `upsert` pelo par `user_id` e `aula_id`, evitando depender de IDs locais gerados pelo navegador.
- Não substituir dados válidos já salvos ao atualizar quiz, tempo ou conclusão.
- Exibir erros de gravação ao aluno em vez de falhar silenciosamente.

## Acompanhamento administrativo

- Ampliar a página de usuários com:
  - último acesso;
  - quantidade de aulas concluídas;
  - porcentagem de progresso;
  - quantidade de quizzes realizados;
  - média das notas.
- Manter a busca e a listagem atuais.
- Recarregar os indicadores após cadastro.

## Migração dos dados atuais

- Não excluir nenhum usuário, perfil ou progresso.
- Criar perfis apenas para contas do Auth que estejam sem perfil.
- Aplicar as políticas e novas funções de forma idempotente.

## Verificação

- Confirmar que o administrador consegue listar todos os perfis.
- Confirmar que um aluno vê apenas o próprio perfil e progresso.
- Confirmar que um novo login gera histórico.
- Confirmar que concluir uma aula cria ou atualiza progresso.
- Confirmar que o painel mostra os indicadores individuais.
- Executar os testes e o build do projeto.
