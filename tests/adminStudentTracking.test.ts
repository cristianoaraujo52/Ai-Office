import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync('src/pages/admin/AdminUsuarios.tsx', 'utf8')

assert.ok(source.includes("from('progressos')"))
assert.ok(source.includes("from('login_history')"))
assert.ok(source.includes('Último acesso'))
assert.ok(source.includes('Progresso'))
assert.ok(source.includes('Nota média'))
assert.ok(source.includes("rpc('admin_ensure_profile'"))
