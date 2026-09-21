import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const dashboardSource = readFileSync('src/pages/AdminDashboard.tsx', 'utf8')

assert(
  !dashboardSource.includes('recentActivity'),
  'AdminDashboard nao deve usar atividade recente fixa de mockData',
)

assert(
  dashboardSource.includes("from('progressos')") &&
    dashboardSource.includes('setProgressos') &&
    dashboardSource.includes('userMap'),
  'AdminDashboard deve montar Atividade Recente a partir de progressos e usuarios reais',
)

assert(
  !/Ã|Â/.test(dashboardSource),
  'AdminDashboard nao deve conter textos com acentuacao quebrada',
)
