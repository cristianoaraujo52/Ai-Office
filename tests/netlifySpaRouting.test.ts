import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

assert.ok(
  existsSync('public/_redirects'),
  'A publicação Netlify precisa de public/_redirects para abrir rotas diretas',
)

const redirects = readFileSync('public/_redirects', 'utf8').trim()

assert.equal(
  redirects,
  '/* /index.html 200',
  'Todas as rotas do React devem ser entregues pelo index.html',
)

assert.ok(
  existsSync('netlify.toml'),
  'A configuração da Netlify deve definir build e fallback SPA',
)

const netlifyConfig = readFileSync('netlify.toml', 'utf8')

assert.ok(netlifyConfig.includes('command = "npm run build"'))
assert.ok(netlifyConfig.includes('publish = "dist"'))
assert.ok(netlifyConfig.includes('from = "/*"'))
assert.ok(netlifyConfig.includes('to = "/index.html"'))
assert.ok(netlifyConfig.includes('status = 200'))
