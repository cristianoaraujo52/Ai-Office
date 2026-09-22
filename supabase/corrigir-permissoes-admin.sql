SELECT 1;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

DROP POLICY IF EXISTS "Admin – modulos"   ON public.modulos;
DROP POLICY IF EXISTS "Admin – aulas"     ON public.aulas;
DROP POLICY IF EXISTS "Admin – slides"    ON public.slides;
DROP POLICY IF EXISTS "Admin – materiais" ON public.materiais;
DROP POLICY IF EXISTS "Admin – quizzes"   ON public.quizzes;
DROP POLICY IF EXISTS "Admin – perguntas" ON public.perguntas;

CREATE POLICY "Admin – modulos"   ON public.modulos   FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin – aulas"     ON public.aulas     FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin – slides"    ON public.slides    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin – materiais" ON public.materiais FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin – quizzes"   ON public.quizzes   FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin – perguntas" ON public.perguntas FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

SELECT email, role FROM public.profiles WHERE role = 'admin' ORDER BY email;
