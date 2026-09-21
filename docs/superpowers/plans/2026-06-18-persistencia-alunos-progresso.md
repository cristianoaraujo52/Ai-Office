# Persistência de Alunos e Progresso Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir persistência, permissões e acompanhamento de alunos, acessos e progresso.

**Architecture:** Uma migração SQL idempotente criará funções de segurança, políticas RLS e histórico de login. O frontend garantirá o perfil no cadastro/login, registrará acessos e fará upsert de progresso pela chave aluno-aula. O painel administrativo combinará perfis, progresso e último acesso.

**Tech Stack:** React 19, TypeScript, Supabase Auth/Postgres/RLS, Node `tsx`.

---

### Task 1: Migração e políticas

**Files:**
- Create: `supabase/fix-student-persistence.sql`
- Test: `tests/studentPersistenceSchema.test.ts`

- [ ] Criar teste estático exigindo `is_admin`, `ensure_my_profile`, `login_history`, políticas administrativas e chave de upsert.
- [ ] Executar o teste e confirmar falha.
- [ ] Criar SQL idempotente, sem apagar dados.
- [ ] Aplicar a migração no banco atual.
- [ ] Confirmar que admin lista todos os perfis e aluno somente o próprio.

### Task 2: Perfil e histórico no login

**Files:**
- Modify: `src/contexts/AuthContext.tsx`
- Create: `src/lib/authPersistence.ts`
- Test: `tests/authPersistence.test.ts`

- [ ] Criar teste para garantia de perfil e registro único de login.
- [ ] Confirmar falha.
- [ ] Implementar `loadOrEnsureProfile` e `recordLogin`.
- [ ] Integrar no login e no evento de autenticação.
- [ ] Confirmar aprovação do teste.

### Task 3: Cadastro administrativo confiável

**Files:**
- Modify: `src/pages/admin/AdminUsuarios.tsx`
- Modify: `tests/adminUserCreation.test.ts`

- [ ] Alterar o teste para exigir confirmação real do perfil e fallback seguro.
- [ ] Confirmar falha.
- [ ] Após `signUp`, aguardar perfil; se ausente, autenticar temporariamente o usuário criado, chamar `ensure_my_profile` e sair desse cliente isolado.
- [ ] Só fechar o modal após o perfil aparecer na listagem.
- [ ] Confirmar aprovação.

### Task 4: Gravação correta do progresso

**Files:**
- Modify: `src/contexts/DataContext.tsx`
- Create: `tests/studentProgressPersistence.test.ts`

- [ ] Criar teste exigindo `upsert(payload, { onConflict: 'user_id,aula_id' })`.
- [ ] Confirmar falha.
- [ ] Remover ID local do payload Supabase e usar a chave única aluno-aula.
- [ ] Manter ID somente no modo offline.
- [ ] Confirmar aprovação.

### Task 5: Acompanhamento por aluno

**Files:**
- Modify: `src/pages/admin/AdminUsuarios.tsx`
- Create: `tests/adminStudentTracking.test.ts`

- [ ] Criar teste exigindo consultas a `progressos` e `login_history`.
- [ ] Confirmar falha.
- [ ] Calcular aulas concluídas, porcentagem, quizzes, nota média e último acesso por usuário.
- [ ] Exibir as colunas no painel.
- [ ] Confirmar aprovação.

### Task 6: Verificação completa

- [ ] Executar todos os testes.
- [ ] Executar TypeScript e build.
- [ ] Testar no Supabase: listagem administrativa, login registrado e gravação real de progresso.
- [ ] Confirmar que os usuários atuais permanecem no banco.

Esta cópia não possui repositório Git ativo; os passos de commit não se aplicam.
