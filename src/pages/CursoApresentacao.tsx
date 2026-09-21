import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'

export default function CursoApresentacao() {
  const { user } = useAuth()
  const { modulos, progressos } = useData()

  const progressoMap = useMemo(() => {
    const map: Record<string, boolean> = {}
    progressos.forEach(p => { map[p.aula_id] = p.concluida })
    return map
  }, [progressos])

  const isLocked = (m: typeof modulos[0]) => {
    if (user?.role === 'admin') return false
    if (m.ordem === 1) return false
    const anterior = modulos.find(x => x.ordem === m.ordem - 1)
    if (!anterior) return false
    const anteriorAulas = anterior.aulas ?? []
    return !(anteriorAulas.length > 0 && anteriorAulas.every(a => progressoMap[a.id]))
  }

  const totalAulas = modulos.reduce((sum, m) => sum + (m.aulas?.length || 0), 0)
  const totalHoras = modulos.reduce((sum, m) => sum + m.carga_horaria, 0)
  const totalSlides = modulos
    .flatMap(m => m.aulas || [])
    .reduce((sum, a) => sum + (a.slides?.length || 0), 0)
  const totalQuizzes = modulos
    .flatMap(m => m.aulas || [])
    .filter(a => a.quiz).length

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[280px] flex flex-col">
        <TopBar title="Apresentação do Curso" subtitle="IA Office Academy — Professional Series" />
        <main className="flex-1 fade-in">
          {/* Hero */}
          <section className="relative overflow-hidden border-b border-white/5">
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full blur-3xl opacity-40"
                style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.45) 0%, transparent 70%)' }}
              />
              <div
                className="absolute -bottom-32 -right-32 w-[520px] h-[520px] rounded-full blur-3xl opacity-30"
                style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.45) 0%, transparent 70%)' }}
              />
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
                  backgroundSize: '50px 50px',
                }}
              />
            </div>
            <div className="relative px-10 py-16 max-w-6xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border border-[#8b5cf6]/30 text-[#8b5cf6] bg-[#8b5cf6]/10 mb-5">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>auto_awesome</span>
                Curso completo
              </span>
              <h1 className="text-white font-black text-4xl md:text-5xl leading-tight mb-4">
                Inteligência Artificial<br />
                <span className="bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] bg-clip-text text-transparent">aplicada ao escritório</span>
              </h1>
              <p className="text-white/60 text-lg max-w-3xl leading-relaxed">
                Do iniciante ao avançado: domine as ferramentas, técnicas e processos que estão transformando o trabalho corporativo. {modulos.length} módulos · {totalAulas} aulas · {totalHoras}h de conteúdo.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-3xl">
                {[
                  { icon: 'view_module', label: 'Módulos', value: modulos.length },
                  { icon: 'menu_book', label: 'Aulas', value: totalAulas },
                  { icon: 'slideshow', label: 'Slides', value: totalSlides },
                  { icon: 'quiz', label: 'Quizzes', value: totalQuizzes },
                ].map(s => (
                  <div key={s.label} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 backdrop-blur">
                    <span className="material-symbols-outlined text-[#8b5cf6] mb-2 block" style={{ fontSize: '20px' }}>{s.icon}</span>
                    <p className="text-white font-bold text-2xl">{s.value}</p>
                    <p className="text-white/40 text-xs uppercase tracking-widest">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 mt-8">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#8b5cf6] text-white text-sm font-bold hover:bg-[#7c3aed] transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_arrow</span>
                  Começar agora
                </Link>
                {modulos[0] && (
                  <Link
                    to={`/modulo/${modulos.find(m => m.ordem === 1)?.id ?? modulos[0].id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 text-white/80 text-sm font-medium hover:bg-white/5 transition-colors"
                  >
                    Ver Módulo 1
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                  </Link>
                )}
              </div>
            </div>
          </section>

          {/* Curriculum */}
          <section className="px-10 py-12 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-2xl">Currículo completo</h2>
              <span className="text-white/40 text-sm">{modulos.length} módulos</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {modulos.map(m => {
                const aulas = m.aulas || []
                const locked = isLocked(m)
                const done = aulas.filter(a => progressoMap[a.id]).length
                const concluido = aulas.length > 0 && done === aulas.length
                return (
                  <Link
                    key={m.id}
                    to={locked ? '#' : `/modulo/${m.id}`}
                    onClick={locked ? e => e.preventDefault() : undefined}
                    className={`group bg-[#1e293b] border rounded-xl overflow-hidden transition-all flex flex-col ${
                      locked
                        ? 'border-white/5 opacity-50 cursor-not-allowed'
                        : 'border-white/5 hover:border-[#8b5cf6]/40 elevation-hover'
                    }`}
                  >
                    {/* Cover */}
                    <div className="relative w-full aspect-video bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e1b4b] overflow-hidden">
                      {m.cover_image && (
                        <img
                          src={m.cover_image}
                          alt={m.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-transparent to-transparent" />
                      <span className="absolute top-3 left-3 inline-flex px-2 py-0.5 bg-black/40 backdrop-blur rounded-md text-white text-[10px] font-bold uppercase tracking-widest">
                        {m.titulo.split(' - ')[0]}
                      </span>
                      {locked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                          <span className="material-symbols-outlined text-white/60" style={{ fontSize: '36px' }}>lock</span>
                        </div>
                      )}
                      {concluido && (
                        <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
                          <span className="material-symbols-outlined text-white" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>check</span>
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className={`font-bold text-base mb-1.5 transition-colors ${locked ? 'text-white/50' : 'text-white group-hover:text-[#a78bfa]'}`}>
                        {m.titulo.split(' - ')[1]}
                      </h3>
                      <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-2">{m.descricao}</p>
                      <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/5">
                        <div className="flex items-center gap-3 text-white/40 text-xs">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>menu_book</span>
                            {aulas.length}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                            {m.carga_horaria}h
                          </span>
                          {!locked && done > 0 && (
                            <span className="flex items-center gap-1 text-emerald-400">
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                              {done}/{aulas.length}
                            </span>
                          )}
                        </div>
                        {locked
                          ? <span className="material-symbols-outlined text-white/20" style={{ fontSize: '18px' }}>lock</span>
                          : <span className="material-symbols-outlined text-white/30 group-hover:text-[#8b5cf6] transition-colors" style={{ fontSize: '18px' }}>arrow_forward</span>
                        }
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* What you'll learn */}
          <section className="px-10 py-12 max-w-6xl mx-auto border-t border-white/5">
            <h2 className="text-white font-bold text-2xl mb-6">O que você vai dominar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: 'hub', title: 'Fundamentos', desc: 'Como a IA funciona e onde ela aparece no seu dia.' },
                { icon: 'chat', title: 'Ferramentas', desc: 'ChatGPT, Claude, Gemini, Copilot e Perplexity na prática.' },
                { icon: 'edit_note', title: 'Prompts', desc: 'Método CIFE, personas e templates reutilizáveis.' },
                { icon: 'shield_lock', title: 'Segurança', desc: 'LGPD, dados sensíveis e boas práticas.' },
                { icon: 'table_chart', title: 'Excel com IA', desc: 'Fórmulas, dashboards e análise de dados.' },
                { icon: 'sync_alt', title: 'Automação', desc: 'Zapier, Make e Power Automate inteligentes.' },
                { icon: 'description', title: 'Documentação', desc: 'E-mails, relatórios, atas e comunicados.' },
                { icon: 'emoji_events', title: 'Adoção real', desc: 'Plano para levar IA para a sua equipe.' },
              ].map(item => (
                <div key={item.title} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-[#8b5cf6]/15 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[#8b5cf6]" style={{ fontSize: '18px' }}>{item.icon}</span>
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="px-10 py-12 max-w-6xl mx-auto border-t border-white/5">
            <div className="bg-gradient-to-br from-[#8b5cf6]/15 to-[#6366f1]/10 border border-[#8b5cf6]/20 rounded-2xl p-10 text-center">
              <h2 className="text-white font-bold text-2xl mb-2">Pronto para começar?</h2>
              <p className="text-white/60 text-base mb-6 max-w-xl mx-auto">
                Sua jornada para dominar IA aplicada ao escritório começa em {modulos[0]?.titulo.split(' - ')[1]}.
              </p>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#8b5cf6] text-white text-sm font-bold hover:bg-[#7c3aed] transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_arrow</span>
                Acessar meu Dashboard
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
