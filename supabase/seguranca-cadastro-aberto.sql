BEGIN;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, role)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'nome'), ''), split_part(NEW.email, '@', 1)),
    COALESCE(NEW.email, ''),
    'aluno'
  )
  ON CONFLICT (id) DO UPDATE SET
    nome = CASE WHEN public.profiles.nome = '' THEN EXCLUDED.nome ELSE public.profiles.nome END,
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_my_profile()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_id UUID := auth.uid();
  claims JSONB := auth.jwt();
BEGIN
  IF current_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  INSERT INTO public.profiles (id, nome, email, role)
  VALUES (
    current_id,
    COALESCE(
      NULLIF(trim(claims->'user_metadata'->>'nome'), ''),
      split_part(COALESCE(claims->>'email', ''), '@', 1)
    ),
    COALESCE(claims->>'email', ''),
    'aluno'
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_my_profile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_my_profile() TO authenticated;

CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND auth.uid() IS NOT NULL
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Somente administradores podem alterar o papel de um usuário';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_role ON public.profiles;
CREATE TRIGGER protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

COMMIT;

SELECT 'ok: cadastro sempre cria aluno; só admin muda papel' AS resultado;
