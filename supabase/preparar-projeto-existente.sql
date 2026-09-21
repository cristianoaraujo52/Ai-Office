-- ============================================================
--  Prepara um projeto Supabase que JÁ TEM as tabelas da versão antiga
--  (modules/lessons/slides/quizzes/user_progress/profiles com full_name e role 'student')
--  para receber o schema do app original (modulos/aulas/slides/quizzes/perguntas...).
--
--  Não apaga nada: slides e quizzes antigas viram legacy_slides / legacy_quizzes,
--  e profiles é adaptada preservando os usuários existentes.
--  O setup-projeto-dhgq.sql já inclui este arquivo antes do setup completo.
-- ============================================================

-- Tabelas antigas cujo nome colide com o schema novo
ALTER TABLE IF EXISTS public.slides  RENAME TO legacy_slides;
ALTER TABLE IF EXISTS public.quizzes RENAME TO legacy_quizzes;

-- Políticas antigas de profiles (o schema novo cria as suas)
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can do everything on profiles" ON public.profiles;

-- Colunas que o app original usa
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nome       TEXT NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email      TEXT NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Preenche nome/email a partir do cadastro existente
UPDATE public.profiles p
SET nome  = CASE WHEN p.nome = '' THEN COALESCE(NULLIF(TRIM(p.full_name), ''), split_part(u.email, '@', 1)) ELSE p.nome END,
    email = CASE WHEN p.email = '' THEN COALESCE(u.email, '') ELSE p.email END
FROM auth.users u
WHERE u.id = p.id;

-- Papel: 'student' (versão antiga) -> 'aluno' (original)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
UPDATE public.profiles SET role = 'aluno' WHERE role IS NULL OR role = 'student';
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'aluno';
ALTER TABLE public.profiles ALTER COLUMN role SET NOT NULL;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'aluno'));
