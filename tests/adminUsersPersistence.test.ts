import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const adminUsuariosSource = readFileSync('src/pages/admin/AdminUsuarios.tsx', 'utf8')
const authContextSource = readFileSync('src/contexts/AuthContext.tsx', 'utf8')
const appSource = readFileSync('src/App.tsx', 'utf8')
const schemaSource = readFileSync('supabase/schema.sql', 'utf8')

assert(
  adminUsuariosSource.includes("from('profiles')"),
  'AdminUsuarios deve carregar usuários reais da tabela profiles quando o Supabase estiver configurado',
)

assert(
  adminUsuariosSource.includes("delete().eq('id', id)"),
  'AdminUsuarios deve excluir o profile no Supabase para a exclusão persistir após novo login',
)

assert(
  !authContextSource.includes('Perfil não encontrado, criando') &&
    !authContextSource.includes("supabase.from('profiles').upsert"),
  'AuthContext não deve recriar automaticamente profiles apagados pelo admin',
)

assert(
  appSource.includes('AdminMetricas') &&
    appSource.includes('AdminConfiguracoes') &&
    !appSource.includes('path="/admin/metricas" element={<ProtectedRoute adminOnly><AdminDashboard') &&
    !appSource.includes('path="/admin/configuracoes" element={<ProtectedRoute adminOnly><AdminDashboard'),
  'Rotas de métricas e configurações devem apontar para páginas próprias, não para o dashboard',
)

assert(
  schemaSource.includes('gerenciar profiles') &&
    schemaSource.includes('ON profiles FOR ALL'),
  'Schema deve permitir que administradores gerenciem profiles via RLS',
)
