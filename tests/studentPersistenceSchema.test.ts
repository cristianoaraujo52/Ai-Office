import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const sql = readFileSync('supabase/fix-student-persistence.sql', 'utf8')
const setup = readFileSync('supabase/setup-db.ts', 'utf8')

assert.ok(sql.includes('FUNCTION public.is_admin()'))
assert.ok(sql.includes('FUNCTION public.ensure_my_profile()'))
assert.ok(sql.includes('FUNCTION public.admin_ensure_profile'))
assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.login_history'))
assert.ok(sql.includes('ON public.profiles FOR SELECT'))
assert.ok(sql.includes('ON public.progressos FOR SELECT'))
assert.ok(sql.includes('INSERT INTO public.profiles'))
assert.ok(sql.includes('FROM auth.users'))
assert.ok(setup.includes('fix-student-persistence.sql'))
