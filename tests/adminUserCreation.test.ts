import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const adminUsuariosSource = readFileSync('src/pages/admin/AdminUsuarios.tsx', 'utf8')

assert(
  adminUsuariosSource.includes('senhaTemporaria'),
  'AdminUsuarios deve pedir uma senha temporária para criar login do aluno',
)

assert(
  adminUsuariosSource.includes('.auth.signUp') &&
    adminUsuariosSource.includes('options:') &&
    adminUsuariosSource.includes('data:') &&
    adminUsuariosSource.includes('nome: form.nome.trim()') &&
    adminUsuariosSource.includes('role: form.role'),
  'AdminUsuarios deve criar o usuário no Supabase Auth com metadados para o trigger criar o profile',
)

assert(
  adminUsuariosSource.includes('handle_new_user') &&
    adminUsuariosSource.includes("rpc('admin_ensure_profile'"),
  'AdminUsuarios deve confirmar o trigger e usar fallback administrativo seguro para garantir o profile',
)

assert(
  !adminUsuariosSource.includes('Para criar um usuário com login, use o painel Authentication do Supabase'),
  'AdminUsuarios não deve bloquear cadastro real de alunos quando o Supabase está configurado',
)
