import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const moduloViewSource = readFileSync('src/pages/ModuloView.tsx', 'utf8')
const aulaViewSource = readFileSync('src/pages/AulaView.tsx', 'utf8')

assert.ok(
  moduloViewSource.includes('useAuth') &&
    moduloViewSource.includes("user?.role === 'admin'") &&
    moduloViewSource.includes('<Sidebar isAdmin={isAdmin} />'),
  'ModuloView deve renderizar a navegação de admin quando o usuário for admin',
)

assert.ok(
  moduloViewSource.includes("to={isAdmin ? '/admin' : '/dashboard'}"),
  'ModuloView deve voltar para o painel admin quando o usuário for admin',
)

assert.ok(
  aulaViewSource.includes('useAuth') &&
    aulaViewSource.includes("user?.role === 'admin'") &&
    aulaViewSource.includes("to={isAdmin ? '/admin' : '/dashboard'}"),
  'AulaView deve voltar para o painel admin quando o usuário for admin',
)

assert.ok(
  aulaViewSource.includes('!isAdmin &&') &&
    aulaViewSource.includes('Marcar como Concluída'),
  'AulaView não deve mostrar controle de conclusão de aluno para admin',
)
