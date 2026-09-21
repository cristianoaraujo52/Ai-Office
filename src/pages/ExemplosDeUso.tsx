import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import { exemplosDeUso, ferramentas, type FerramentaId } from '../data/exemplosDeUso'
import { useAuth } from '../contexts/AuthContext'

type ImageState = 'loading' | 'ready' | 'error'
type CopyState = 'idle' | 'copied' | 'error'

const ferramentaIds: FerramentaId[] = ['chatgpt', 'gemini', 'copilot', 'claude']

export default function ExemplosDeUso() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageState, setImageState] = useState<ImageState>('loading')
  const [imageRetry, setImageRetry] = useState(0)
  const [copyState, setCopyState] = useState<CopyState>('idle')

  const exemplo = exemplosDeUso[currentIndex]
  const ferramenta = ferramentas[exemplo.ferramenta]
  const ferramentaIndex = exemplosDeUso
    .filter(item => item.ferramenta === exemplo.ferramenta)
    .findIndex(item => item.id === exemplo.id)

  const groupedIndexes = useMemo(() => {
    return ferramentaIds.reduce<Record<FerramentaId, number[]>>((groups, id) => {
      groups[id] = exemplosDeUso
        .map((item, index) => item.ferramenta === id ? index : -1)
        .filter(index => index >= 0)
      return groups
    }, { chatgpt: [], gemini: [], copilot: [], claude: [] })
  }, [])

  const goTo = useCallback((index: number) => {
    setImageState('loading')
    setCurrentIndex(Math.max(0, Math.min(exemplosDeUso.length - 1, index)))
    setCopyState('idle')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const selectFerramenta = (id: FerramentaId) => {
    const firstIndex = groupedIndexes[id][0]
    if (firstIndex !== undefined) goTo(firstIndex)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.matches('input, textarea, [contenteditable="true"]')) return
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goTo(currentIndex - 1)
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        goTo(currentIndex + 1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, goTo])

  useEffect(() => {
    const next = exemplosDeUso[currentIndex + 1]
    if (!next) return
    const image = new Image()
    image.src = next.imagem
  }, [currentIndex])

  const copyPrompt = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(exemplo.prompt)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = exemplo.prompt
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        const copied = document.execCommand('copy')
        document.body.removeChild(textarea)
        if (!copied) throw new Error('Cópia não disponível')
      }
      setCopyState('copied')
      window.setTimeout(() => setCopyState('idle'), 2400)
    } catch {
      setCopyState('error')
    }
  }

  return (
    <div className="min-h-screen bg-[#07101d] flex">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex-1 ml-0 md:ml-[280px] min-w-0">
        <TopBar
          title="Exemplos de Uso"
          subtitle="28 tarefas guiadas com prompts prontos para copiar"
        />

        <main className="relative overflow-hidden px-3 py-5 sm:px-6 lg:px-8 lg:py-8">
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute -top-40 right-[5%] h-[32rem] w-[32rem] rounded-full blur-3xl opacity-15 transition-colors duration-700"
              style={{ background: ferramenta.cor }}
            />
            <div className="absolute bottom-[25%] -left-40 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-[1500px] space-y-5">
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#0b1626]/85 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <div
                    className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em]"
                    style={{ color: ferramenta.cor, borderColor: `${ferramenta.cor}45`, background: ferramenta.corSuave }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>movie</span>
                    Laboratório prático
                  </div>
                  <h1 className="max-w-4xl text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
                    Veja a tarefa. Copie o prompt.
                    <span className="block text-white/45">Faça você mesmo.</span>
                  </h1>
                  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/55 sm:text-base">
                    Cada exemplo mostra uma tela simulada e explica o processo sem presumir experiência anterior.
                    Substitua os campos entre colchetes antes de usar o prompt.
                  </p>
                </div>
                <div className="min-w-52">
                  <div className="flex items-center justify-between text-xs font-bold text-white/55">
                    <span>Progresso</span>
                    <span>{currentIndex + 1} de {exemplosDeUso.length}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${((currentIndex + 1) / exemplosDeUso.length) * 100}%`,
                        background: `linear-gradient(90deg, ${ferramenta.cor}, #ffffff)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>

            <nav className="grid grid-cols-2 gap-2 lg:grid-cols-4" aria-label="Escolher ferramenta">
              {ferramentaIds.map(id => {
                const item = ferramentas[id]
                const active = exemplo.ferramenta === id
                return (
                  <button
                    key={id}
                    onClick={() => selectFerramenta(id)}
                    aria-pressed={active}
                    className={`group flex min-h-20 items-center gap-3 rounded-2xl border px-4 text-left transition-all ${
                      active ? 'bg-white/[0.08] shadow-lg' : 'border-white/8 bg-white/[0.025] hover:bg-white/[0.05]'
                    }`}
                    style={active ? { borderColor: `${item.cor}70`, boxShadow: `0 14px 40px ${item.cor}14` } : undefined}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ color: item.cor, background: item.corSuave }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>{item.icone}</span>
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black text-white">{item.nome}</span>
                      <span className="mt-0.5 block text-[11px] text-white/40">7 tarefas práticas</span>
                    </span>
                  </button>
                )
              })}
            </nav>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,.65fr)]">
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#020711] shadow-[0_28px_90px_rgba(0,0,0,.48)]">
                  <div className="relative aspect-video">
                    {imageState === 'loading' && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#020711]">
                        <div className="flex flex-col items-center gap-3 text-white/40">
                          <span className="material-symbols-outlined animate-spin" style={{ fontSize: '34px', color: ferramenta.cor }}>progress_activity</span>
                          <span className="text-sm">Carregando infográfico...</span>
                        </div>
                      </div>
                    )}
                    {imageState === 'error' ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
                        <span className="material-symbols-outlined text-amber-300" style={{ fontSize: '48px' }}>broken_image</span>
                        <div>
                          <h2 className="font-black text-white">Não foi possível carregar esta imagem</h2>
                          <p className="mt-1 text-sm text-white/45">O conteúdo e o prompt continuam disponíveis ao lado.</p>
                        </div>
                        <button
                          onClick={() => {
                            setImageState('loading')
                            setImageRetry(value => value + 1)
                          }}
                          className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10"
                        >
                          Tentar novamente
                        </button>
                      </div>
                    ) : (
                      <img
                        key={`${exemplo.imagem}-${imageRetry}`}
                        src={exemplo.imagem}
                        alt={`Infográfico: ${exemplo.titulo} usando ${ferramenta.nome}`}
                        className={`h-full w-full object-contain transition duration-500 ${imageState === 'ready' ? 'scale-100 opacity-100' : 'scale-[1.01] opacity-0'}`}
                        onLoad={() => setImageState('ready')}
                        onError={() => setImageState('error')}
                      />
                    )}
                  </div>
                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/75 backdrop-blur">
                    <span style={{ color: ferramenta.cor }}>{ferramenta.nome}</span>
                    <span className="text-white/25">•</span>
                    Exemplo {String(exemplo.numero).padStart(2, '0')}
                  </div>
                </div>

                <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0b1626]/90 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={() => goTo(currentIndex - 1)}
                    disabled={currentIndex === 0}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-bold text-white/65 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-25"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>arrow_back</span>
                    Anterior
                  </button>

                  <div className="flex items-center justify-center gap-1.5">
                    {groupedIndexes[exemplo.ferramenta].map((index, dotIndex) => (
                      <button
                        key={index}
                        onClick={() => goTo(index)}
                        aria-label={`Abrir exemplo ${dotIndex + 1} de ${ferramenta.nome}`}
                        className={`h-2.5 rounded-full transition-all ${index === currentIndex ? 'w-8' : 'w-2.5 bg-white/15 hover:bg-white/30'}`}
                        style={index === currentIndex ? { background: ferramenta.cor } : undefined}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => goTo(currentIndex + 1)}
                    disabled={currentIndex === exemplosDeUso.length - 1}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-black text-[#051018] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-25"
                    style={{ background: ferramenta.cor }}
                  >
                    Próximo
                    <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>arrow_forward</span>
                  </button>
                </div>
              </div>

              <aside className="flex flex-col rounded-3xl border border-white/10 bg-[#0b1626]/90 p-5 shadow-xl shadow-black/20 sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: ferramenta.cor }}>
                  Tarefa {ferramentaIndex + 1} de 7
                </p>
                <h2 className="mt-3 text-2xl font-black leading-tight text-white sm:text-3xl">{exemplo.titulo}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{exemplo.tarefa}</p>

                <div className="mt-5 rounded-2xl border border-white/8 p-4" style={{ background: ferramenta.corSuave }}>
                  <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest" style={{ color: ferramenta.cor }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>psychology</span>
                    Por que usar {ferramenta.nome}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{exemplo.porqueEstaFerramenta}</p>
                </div>

                <div className="mt-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.18em] text-white/40">Faça assim</h3>
                  <ol className="mt-3 space-y-3">
                    {exemplo.passos.map((passo, index) => (
                      <li key={passo} className="flex gap-3">
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black"
                          style={{ color: ferramenta.cor, background: ferramenta.corSuave }}
                        >
                          {index + 1}
                        </span>
                        <span className="pt-1 text-sm leading-snug text-white/70">{passo}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mt-auto pt-6 text-[11px] text-white/30">
                  <span className="material-symbols-outlined mr-1" style={{ fontSize: '14px' }}>keyboard</span>
                  Use as setas do teclado para navegar
                </div>
              </aside>
            </section>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,.7fr)]">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0b1626]/90">
                <div className="flex flex-col gap-3 border-b border-white/8 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: ferramenta.cor }}>Prompt completo</p>
                    <h3 className="mt-1 text-xl font-black text-white">Copie, personalize e envie</h3>
                  </div>
                  <button
                    onClick={copyPrompt}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-black text-[#061019] transition hover:-translate-y-0.5 hover:brightness-110"
                    style={{ background: copyState === 'copied' ? '#6ee7b7' : ferramenta.cor }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      {copyState === 'copied' ? 'check_circle' : copyState === 'error' ? 'error' : 'content_copy'}
                    </span>
                    {copyState === 'copied' ? 'Prompt copiado!' : copyState === 'error' ? 'Selecione e copie' : 'Copiar prompt'}
                  </button>
                </div>
                <pre className="max-h-[680px] overflow-auto whitespace-pre-wrap p-5 font-mono text-[13px] leading-7 text-white/72 selection:bg-cyan-300 selection:text-slate-950 sm:p-7">
                  {exemplo.prompt}
                </pre>
              </div>

              <div className="space-y-5">
                <InfoCard
                  icon="tune"
                  title="O que personalizar"
                  color={ferramenta.cor}
                  items={exemplo.personalizar}
                />
                <div className="rounded-3xl border border-emerald-400/15 bg-emerald-400/[0.07] p-5">
                  <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>flag</span>
                    Resultado esperado
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">{exemplo.resultadoEsperado}</p>
                </div>
                <InfoCard
                  icon="fact_check"
                  title="Antes de usar o resultado"
                  color="#fbbf24"
                  items={exemplo.conferencia}
                />
                <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
                  <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/45">
                    <span className="material-symbols-outlined text-amber-300" style={{ fontSize: '18px' }}>lightbulb</span>
                    Dica de ouro
                  </p>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-white/75">{exemplo.dica}</p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

function InfoCard({
  icon,
  title,
  color,
  items,
}: {
  icon: string
  title: string
  color: string
  items: string[]
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0b1626]/90 p-5">
      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em]" style={{ color }}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span>
        {title}
      </p>
      <ul className="mt-3 space-y-2.5">
        {items.map(item => (
          <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-white/65">
            <span className="material-symbols-outlined mt-0.5 shrink-0" style={{ color, fontSize: '17px' }}>check_circle</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
