import React from 'react'
import type { Slide } from '../types'
import { getSlideImageUrl, parseSlideText, type SlideBlock } from '../lib/slidePresentation'

function iconForTitle(titulo: string): string {
  const t = titulo.toLowerCase()
  if (/(resumo|conclus|fechament)/.test(t)) return 'flag'
  if (/(dica|truque|ouro)/.test(t)) return 'lightbulb'
  if (/(erro|cuidado|atenc|risco|nao esperar|nunca|evite|limite|alerta|perigo)/.test(t)) return 'warning'
  if (/(passo|fluxo|etapa|pipeline)/.test(t)) return 'route'
  if (/(seguran|lgpd|prote|cadeado|escudo)/.test(t)) return 'shield_lock'
  if (/(excel|planilha|tabela|dados|dashboard)/.test(t)) return 'table_chart'
  if (/(prompt|chat|conversa|persona)/.test(t)) return 'chat'
  if (/(autom|zapier|make|power automate)/.test(t)) return 'sync_alt'
  if (/(email|document|relatorio|ata|word)/.test(t)) return 'description'
  return 'auto_awesome'
}

function accentForTitle(titulo: string) {
  const t = titulo.toLowerCase()
  if (/(erro|cuidado|atenc|risco|alerta|perigo|nao|nunca|evite)/.test(t)) {
    return {
      name: 'Atencao',
      badge: 'bg-red-500/10 text-red-300 border-red-500/20',
      iconBg: 'bg-red-500/15',
      iconColor: 'text-red-300',
      line: 'from-red-400 via-amber-300 to-red-400',
    }
  }
  if (/(dica|truque|ouro|pratica|exemplo)/.test(t)) {
    return {
      name: 'Pratica',
      badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-300',
      line: 'from-amber-300 via-orange-300 to-amber-300',
    }
  }
  if (/(resumo|conclus|final|verde|certo)/.test(t)) {
    return {
      name: 'Resumo',
      badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-300',
      line: 'from-emerald-300 via-cyan-300 to-emerald-300',
    }
  }
  return {
    name: 'Conceito',
    badge: 'bg-cyan-500/10 text-cyan-200 border-cyan-500/20',
    iconBg: 'bg-cyan-500/15',
    iconColor: 'text-cyan-200',
    line: 'from-cyan-300 via-violet-300 to-emerald-300',
  }
}

function firstMeaningfulText(blocks: SlideBlock[]) {
  const paragraph = blocks.find(block => block.kind === 'paragraph')
  if (paragraph?.kind === 'paragraph') return paragraph.text

  const bullet = blocks.find(block => block.kind === 'bullet')
  if (bullet?.kind === 'bullet') return bullet.text

  const kv = blocks.find(block => block.kind === 'kv')
  if (kv?.kind === 'kv') return `${kv.label}: ${kv.value}`

  return 'Leia o slide e conecte a ideia com uma tarefa real do seu dia a dia.'
}

export default function SlideRenderer({
  slide,
  index,
  total,
}: {
  slide: Slide
  index: number
  total: number
}) {
  const blocks = parseSlideText(slide.texto)
  const visualUrl = getSlideImageUrl(slide)
  const icon = iconForTitle(slide.titulo)
  const accent = accentForTitle(slide.titulo)

  const bullets = blocks.filter(block => block.kind === 'bullet') as Extract<SlideBlock, { kind: 'bullet' }>[]
  const kvs = blocks.filter(block => block.kind === 'kv') as Extract<SlideBlock, { kind: 'kv' }>[]
  const paragraphs = blocks.filter(block => block.kind === 'paragraph') as Extract<SlideBlock, { kind: 'paragraph' }>[]
  const hasDenseContent = bullets.length + kvs.length + paragraphs.length > 5
  const learningText = firstMeaningfulText(blocks)
  const isInfographicVisual = visualUrl?.startsWith('/slides/')

  if (isInfographicVisual && visualUrl) {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#07111f] shadow-2xl md:aspect-[16/9]">
        <img
          src={visualUrl}
          alt={slide.titulo}
          className="h-full min-h-[420px] w-full object-contain"
          onError={event => { (event.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
        <div className="pointer-events-none absolute bottom-3 right-4 rounded-md border border-white/10 bg-[#07111f]/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/45">
          {index + 1}/{total}
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#07111f] shadow-2xl md:aspect-[16/9]">
      {visualUrl && !isInfographicVisual && (
        <img
          src={visualUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25"
          onError={event => { (event.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
      )}
      <div className={`absolute inset-0 ${isInfographicVisual ? 'bg-[#07111f]' : 'bg-[linear-gradient(110deg,rgba(7,17,31,.98)_0%,rgba(7,17,31,.92)_43%,rgba(7,17,31,.45)_100%)]'}`} />
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="relative grid min-h-[620px] grid-cols-1 gap-5 p-5 md:h-full md:min-h-0 md:grid-cols-[minmax(280px,.62fr)_minmax(0,1.38fr)] md:p-7">
        <section className="flex min-w-0 flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent.iconBg}`}>
                <span className={`material-symbols-outlined ${accent.iconColor}`} style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>
                  {icon}
                </span>
              </div>
              <div className="min-w-0">
                <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${accent.badge}`}>
                  {accent.name} · Slide {String(index + 1).padStart(2, '0')} de {String(total).padStart(2, '0')}
                </span>
                <h2 className="mt-2 max-w-2xl text-balance text-2xl font-black leading-tight text-white md:text-3xl">
                  {slide.titulo}
                </h2>
              </div>
            </div>
          </div>

          <div className={`mt-4 h-1.5 w-24 rounded-full bg-gradient-to-r ${accent.line}`} />

          <div className="mt-5 min-h-0 flex-1 overflow-hidden">
            {bullets.length === 0 && kvs.length === 0 ? (
              <div className="flex h-full items-center">
                <p className="max-w-2xl text-pretty text-lg font-medium leading-relaxed text-white/82 md:text-xl">
                  {paragraphs.map(paragraph => paragraph.text).join(' ')}
                </p>
              </div>
            ) : (
              <div className="grid h-full gap-4 overflow-hidden">
                {kvs.length > 0 && (
                  <div className="grid gap-2">
                    {kvs.slice(0, hasDenseContent ? 3 : 5).map((kv, i) => (
                      <div key={`${kv.label}-${i}`} className="grid grid-cols-[118px_minmax(0,1fr)] gap-3 rounded-xl border border-white/8 bg-white/[0.045] px-3 py-2.5">
                        <span className={`truncate text-xs font-bold ${accent.iconColor}`}>{kv.label}</span>
                        <span className="text-sm leading-snug text-white/72">{kv.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {bullets.length > 0 && (
                  <div className={`grid gap-2.5 ${bullets.length >= 4 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {bullets.slice(0, hasDenseContent ? 6 : 8).map((bullet, i) => (
                      <div key={`${bullet.text}-${i}`} className="group flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.04] p-3">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${accent.iconBg}`}>
                          <span className={`text-xs font-black ${accent.iconColor}`}>{bullet.emphasis || i + 1}</span>
                        </div>
                        <p className="text-sm font-medium leading-snug text-white/80">{bullet.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {paragraphs.length > 0 && (
                  <div className="rounded-xl border border-white/8 bg-black/15 px-4 py-3">
                    <p className="text-sm leading-relaxed text-white/65">
                      {paragraphs.slice(0, 2).map(paragraph => paragraph.text).join(' ')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <aside className="relative min-h-[310px] min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] md:min-h-0">
          {visualUrl ? (
            <img
              src={visualUrl}
              alt={slide.titulo}
              className={`h-full w-full ${isInfographicVisual ? 'object-contain p-2 md:p-3' : 'object-cover'}`}
              onError={event => { (event.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[#101827]">
              <span className="material-symbols-outlined text-white/15" style={{ fontSize: '96px' }}>{icon}</span>
            </div>
          )}
          {!isInfographicVisual && <div className="absolute inset-0 bg-gradient-to-t from-[#07111f] via-[#07111f]/20 to-transparent" />}
          {!isInfographicVisual && <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-[#07111f]/82 p-4 backdrop-blur-md">
            <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-cyan-200/80">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>psychology_alt</span>
              Para lembrar
            </p>
            <p className="line-clamp-4 text-sm font-medium leading-relaxed text-white/82">{learningText}</p>
          </div>}
        </aside>

        <div className="absolute bottom-2 left-5 right-5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/32 md:bottom-3 md:left-7 md:right-7">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>school</span>
            IA Office Academy
          </span>
          <span>{index + 1}/{total}</span>
        </div>
      </div>
    </div>
  )
}
