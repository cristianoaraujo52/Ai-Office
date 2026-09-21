import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const helper = readFileSync('src/lib/authPersistence.ts', 'utf8')
const auth = readFileSync('src/contexts/AuthContext.tsx', 'utf8')

assert.ok(helper.includes('loadOrEnsureProfile'))
assert.ok(helper.includes("rpc('ensure_my_profile')"))
assert.ok(helper.includes('recordLoginOnce'))
assert.ok(helper.includes('loginRequestsInFlight'))
assert.ok(
  helper.includes("from('login_history')") &&
    helper.includes(".insert({ user_id: userId })"),
)
assert.ok(auth.includes('loadOrEnsureProfile'))
assert.ok(auth.includes('recordLoginOnce'))
