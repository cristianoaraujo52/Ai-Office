-- ATENÇÃO: NÃO RODE ESTE ARQUIVO. A política abaixo causa "infinite recursion" em profiles.
-- O fix-student-persistence.sql já cria as políticas de admin corretas (com is_admin()).

-- Permite que administradores gerenciem perfis na tela /admin/usuarios.
-- Execute no Supabase SQL Editor se a exclusao de usuarios retornar erro de RLS.

DROP POLICY IF EXISTS "Admin - gerenciar profiles" ON profiles;
DROP POLICY IF EXISTS "Admin – gerenciar profiles" ON profiles;

CREATE POLICY "Admin - gerenciar profiles" ON profiles
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);
