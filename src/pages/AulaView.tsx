import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { extractYoutubeId, getYoutubeWatchUrl, getYoutubeThumbnail } from '../lib/youtube'
import SlideRenderer from '../components/SlideRenderer'
import { buildQuizReview } from '../lib/quizFeedback'
import { getAudioDescriptionText } from '../lib/audioDescription'
import { useAuth } from '../contexts/AuthContext'
import { useGamification } from '../contexts/GamificationContext'
import AiTutor from '../components/AiTutor'
import FlashcardReviewer from '../components/FlashcardReviewer'
import ConfettiBlast from '../components/ConfettiBlast'
import { isOpenAIConfigured, textToSpeech, type TTSVoice } from '../lib/openai'
import { generateLessonSummary, printAsPDF } from '../lib/pdfExport'

type Tab = 'video' | 'slides' | 'conteudo' | 'audio' | 'atividade' | 'quiz' | 'flashcards' | 'notas'

const getYouTubeId = extractYoutubeId

export default function AulaView() {
  const { id } = useParams<{ id: string }>()
  const { modulos, progressos, saveProgresso, saveResposta } = useData()
  const { user } = useAuth()
  const { addXP } = useGamification()
  const isAdmin = user?.role === 'admin'
  const [activeTab, setActiveTab] = useState<Tab>('video')
  const [slideIdx, setSlideIdx] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [moduloConcluido, setModuloConcluido] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechUnsupported, setSpeechUnsupported] = useState(false)
  const [atividadeTexto, setAtividadeTexto] = useState('')
  const [atividadeSalva, setAtividadeSalva] = useState(false)
  const [savingAtividade, setSavingAtividade] = useState(false)
  const [notas, setNotas] = useState('')
  const [notasSalvas, setNotasSalvas] = useState(false)
  const notasTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [ttsLoading, setTtsLoading] = useState(false)
  const [ttsUrl, setTtsUrl] = useState<string | null>(null)
  const [ttsVoice, setTtsVoice] = useState<TTSVoice>('nova')
  const [ttsError, setTtsError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const tempoRef = useRef<number>(Date.now())

  let aula = null
  let modulo = null
  for (const m of modulos) {
    const found = (m.aulas || []).find(a => a.id === id)
    if (found) {
      aula = found
      modulo = m
      break
    }
  }

  const concluida = useMemo(
    () => progressos.some(p => p.aula_id === id && p.concluida),
    [progressos, id]
  )

  const handleConcluir = useCallback(async () => {
    if (!aula || !modulo || concluida || saving || isAdmin) return
    setSaving(true)
    try {
      const tempoEstudo = Math.round((Date.now() - tempoRef.current) / 60000)
      await saveProgresso({ aula_id: aula.id, modulo_id: modulo.id, concluida: true, tempo_estudo: tempoEstudo })
      addXP(10, 'Aula concluída!')

      // Verifica se esta era a última aula do módulo
      const aulaIds = (modulo.aulas || []).map(a => a.id)
      const outrasJaConcluidas = aulaIds
        .filter(aid => aid !== aula.id)
        .every(aid => progressos.some(p => p.aula_id === aid && p.concluida))
      if (outrasJaConcluidas && aulaIds.length > 1) {
        setShowConfetti(true)
        setModuloConcluido(true)
      }
    } finally {
      setSaving(false)
    }
  }, [aula, modulo, concluida, saving, isAdmin, saveProgresso, addXP, progressos])

  const handleDownloadPDF = useCallback(async () => {
    if (!aula || pdfLoading) return
    setPdfLoading(true)
    try {
      const summaryHtml = await generateLessonSummary(aula)
      printAsPDF(summaryHtml, aula.titulo)
    } catch (err) {
      console.error('PDF error:', err)
    } finally {
      setPdfLoading(false)
    }
  }, [aula, pdfLoading])

  const handleGenerateTTS = useCallback(async () => {
    if (!aula || ttsLoading) return
    setTtsLoading(true)
    setTtsError(null)
    // Revoga URL anterior para liberar memória
    if (ttsUrl) URL.revokeObjectURL(ttsUrl)
    setTtsUrl(null)
    try {
      const rawHtml = aula.conteudo_html ?? ''
      const plainText = rawHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      const narrationText = aula.narracao
        || aula.descricao_curta
        || (plainText.length > 60 ? plainText : aula.descricao)
        || aula.titulo
      const blob = await textToSpeech(narrationText, ttsVoice)
      const url = URL.createObjectURL(blob)
      setTtsUrl(url)
    } catch (err) {
      setTtsError(err instanceof Error ? err.message : 'Erro ao gerar narração.')
    } finally {
      setTtsLoading(false)
    }
  }, [aula, ttsLoading, ttsUrl, ttsVoice])

  // Limpa o áudio ao trocar de aula
  useEffect(() => {
    setTtsUrl(null)
    setTtsError(null)
  }, [id])

  const quiz = aula?.quiz
  const audioDescriptionText = useMemo(() => getAudioDescriptionText(aula), [aula])

  const handleEnviarAtividade = useCallback(async () => {
    if (!aula || !atividadeTexto.trim() || savingAtividade || isAdmin) return
    setSavingAtividade(true)
    try {
      await saveResposta(aula.id, atividadeTexto.trim())
      setAtividadeSalva(true)
      addXP(15, 'Atividade enviada!')
    } finally {
      setSavingAtividade(false)
    }
  }, [aula, atividadeTexto, savingAtividade, isAdmin, saveResposta, addXP])

  const handleSubmitQuiz = useCallback(async () => {
    if (!quiz || !aula || !modulo) return
    const review = buildQuizReview(quiz, quizAnswers)
    setQuizSubmitted(true)
    await saveProgresso({
      aula_id: aula.id,
      modulo_id: modulo.id,
      quiz_realizado: true,
      quiz_nota: review.score,
    })
    if (review.score >= 70) {
      addXP(20, `Quiz ${review.score}% — aprovado!`)
    }
  }, [quiz, aula, modulo, quizAnswers, saveProgresso, addXP])

  const quizReview = useMemo(() => {
    if (!quiz || !quizSubmitted) return null
    return buildQuizReview(quiz, quizAnswers)
  }, [quiz, quizAnswers, quizSubmitted])

  const handleToggleAudioDescription = useCallback(() => {
    if (!audioDescriptionText) return

    if (
      typeof window === 'undefined' ||
      !('speechSynthesis' in window) ||
      typeof SpeechSynthesisUtterance === 'undefined'
    ) {
      setSpeechUnsupported(true)
      return
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(audioDescriptionText)
    utterance.lang = 'pt-BR'
    utterance.rate = 0.95
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    setSpeechUnsupported(false)
    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }, [audioDescriptionText, isSpeaking])

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [id])

  // Carrega notas do localStorage quando a aula muda
  useEffect(() => {
    if (!id) return
    const saved = localStorage.getItem(`notas_aula_${id}`) ?? ''
    setNotas(saved)
    setNotasSalvas(false)
  }, [id])

  const handleNotasChange = useCallback((texto: string) => {
    setNotas(texto)
    setNotasSalvas(false)
    if (notasTimerRef.current) clearTimeout(notasTimerRef.current)
    notasTimerRef.current = setTimeout(() => {
      localStorage.setItem(`notas_aula_${id}`, texto)
      setNotasSalvas(true)
    }, 800)
  }, [id])

  if (!aula || !modulo) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white/50">
      Aula não encontrada.
    </div>
  )

  const slides = aula.slides || []
  const videoId = getYouTubeId(aula.video_url)

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'video', label: 'Vídeo', icon: 'play_circle' },
    { id: 'slides', label: 'Slides', icon: 'slideshow' },
    { id: 'conteudo', label: 'Conteúdo', icon: 'article' },
    { id: 'audio', label: 'Áudio', icon: 'volume_up' },
    { id: 'atividade', label: 'Atividade', icon: 'assignment' },
    { id: 'quiz', label: 'Quiz', icon: 'quiz' },
    { id: 'flashcards', label: 'Flashcards', icon: 'style' },
    { id: 'notas', label: 'Notas', icon: 'edit_note' },
  ]

  const watchUrl = getYoutubeWatchUrl(aula.video_url)
  const thumbUrl = getYoutubeThumbnail(aula.video_url, 'hq')

  const moduloAulas = modulo.aulas || []
  const currentIdx = moduloAulas.findIndex(a => a.id === id)
  const prevAula = currentIdx > 0 ? moduloAulas[currentIdx - 1] : null
  const nextAulaItem = currentIdx < moduloAulas.length - 1 ? moduloAulas[currentIdx + 1] : null

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      {/* Sidebar with lesson list */}
      <aside className="fixed left-0 top-0 h-full w-[280px] bg-[#0a0c10] flex flex-col border-r border-white/5 z-50">
        <div className="px-6 py-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#8b5cf6] flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontSize: '18px' }}>school</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-sm">IA Academy</h1>
            <p className="text-white/30 text-xs">{isAdmin ? 'Admin Panel' : 'Professional Series'}</p>
          </div>
        </div>

        {/* Module lessons list */}
        <div className="flex-1 overflow-y-auto px-4">
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2 px-2 py-2 text-white/40 hover:text-white text-xs mb-4 transition-colors rounded-lg hover:bg-white/5">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
            {isAdmin ? 'Painel Admin' : 'Dashboard'}
          </Link>

          {/* Module cover thumbnail */}
          {modulo.cover_image && (
            <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden mb-3 border border-white/5">
              <img
                src={modulo.cover_image}
                alt={modulo.titulo}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-transparent to-transparent" />
              <div className="absolute bottom-1.5 left-2 right-2">
                <p className="text-white text-[10px] font-bold uppercase tracking-widest drop-shadow">
                  {modulo.titulo.split(' - ')[0]}
                </p>
              </div>
            </div>
          )}
          <p className="text-white/30 text-xs uppercase tracking-widest font-medium mb-3 px-2">
            {modulo.titulo}
          </p>

          <div className="space-y-1 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-px before:bg-white/5">
            {moduloAulas.map((a, i) => {
              const isCurrent = a.id === id
              const isDone = progressos.some(p => p.aula_id === a.id && p.concluida)
              return (
                <Link
                  key={a.id}
                  to={`/aula/${a.id}`}
                  className={`flex items-center gap-3 pl-9 pr-3 py-2.5 rounded-lg text-xs transition-all relative ${
                    isCurrent ? 'bg-[#8b5cf6]/15 text-white font-bold' : isDone ? 'text-white/50 hover:text-white hover:bg-white/3' : 'text-white/30 hover:text-white/50 hover:bg-white/3'
                  }`}
                >
                  {/* Node */}
                  <div className={`absolute left-3 w-5 h-5 rounded-full flex items-center justify-center z-10 text-xs ${
                    isCurrent ? 'bg-[#8b5cf6] ring-4 ring-[#0a0c10]' :
                    isDone ? 'bg-emerald-500' : 'bg-[#1e293b] border border-white/10'
                  }`}>
                    {isDone && !isCurrent
                      ? <span className="material-symbols-outlined text-white" style={{ fontSize: '12px' }}>check</span>
                      : isCurrent
                      ? <span className="material-symbols-outlined text-white" style={{ fontSize: '12px' }}>play_arrow</span>
                      : <span className="text-white/20 text-xs font-bold">{i + 1}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{a.titulo}</div>
                    <div className="text-white/20 text-xs">{a.duracao_min} min</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-[280px] flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#0f172a]/90 backdrop-blur-md border-b border-white/5 flex justify-between items-center h-14 px-6">
          <div className="flex items-center gap-4">
            <div className="h-5 w-px bg-white/10" />
            <h2 className="text-white text-sm font-medium">{aula.titulo}</h2>
            <span className="px-2 py-0.5 bg-[#8b5cf6]/15 text-[#8b5cf6] text-xs rounded-full">{modulo.titulo.split(' - ')[0]}</span>
          </div>
          <div className="flex items-center gap-2">
            {isOpenAIConfigured && (
              <button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                title="Gerar resumo em PDF"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e293b] border border-[#334155] text-white/50 hover:text-white hover:border-white/20 rounded-lg text-xs transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                  {pdfLoading ? 'progress_activity' : 'picture_as_pdf'}
                </span>
                {pdfLoading ? 'Gerando...' : 'Resumo PDF'}
              </button>
            )}
            {!isAdmin && (
              <button
                onClick={handleConcluir}
                disabled={concluida || saving}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all disabled:cursor-default ${
                  concluida
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : 'bg-[#1e293b] border border-[#334155] text-white/70 hover:text-white hover:border-white/20'
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: concluida ? "'FILL' 1" : "'FILL' 0" }}>
                  {saving ? 'progress_activity' : 'check_circle'}
                </span>
                {concluida ? 'Concluída! ✓' : saving ? 'Salvando...' : 'Marcar como Concluída'}
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Video */}
            <div className="w-full aspect-video bg-[#0f172a] rounded-2xl overflow-hidden border border-white/5 relative">
              {videoId ? (
                <>
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={aula.titulo}
                  />
                  {watchUrl && (
                    <a
                      href={watchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur text-white text-xs font-medium transition-all"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>open_in_new</span>
                      Abrir no YouTube
                    </a>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center flex-col gap-3 text-white/40 p-8 text-center">
                  {thumbUrl ? (
                    <img src={thumbUrl} alt={aula.titulo} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                  ) : null}
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined" style={{ fontSize: '64px', fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                    <p className="text-sm">Vídeo em breve</p>
                    <p className="text-xs text-white/30 max-w-md">Esta aula ainda não tem vídeo configurado. Estude pelo Conteúdo, Slides e Atividade ao lado.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-[#1e293b] border border-white/5 rounded-2xl overflow-hidden">
              <div className="flex border-b border-white/5 bg-[#0f172a]/40 px-2 pt-2 gap-1">
                {tabs.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-t-lg transition-all ${
                      activeTab === t.id
                        ? 'bg-[#1e293b] text-[#8b5cf6] border-b-2 border-[#8b5cf6]'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* SLIDES TAB */}
                {activeTab === 'slides' && (
                  <div className="space-y-5">
                    {slides.length === 0 ? (
                      <div className="text-center py-12 text-white/20">
                        <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>slideshow</span>
                        <p className="mt-2 text-sm">Nenhum slide cadastrado para esta aula.</p>
                      </div>
                    ) : (
                      <>
                        <div className="relative group">
                          <SlideRenderer
                            slide={slides[slideIdx]}
                            index={slideIdx}
                            total={slides.length}
                          />
                          {/* Controls on hover */}
                          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <button
                              onClick={() => setSlideIdx(Math.max(0, slideIdx - 1))}
                              disabled={slideIdx === 0}
                              className="pointer-events-auto w-10 h-10 rounded-full bg-[#1e293b]/90 border border-white/10 flex items-center justify-center text-white hover:bg-[#334155] transition-all disabled:opacity-30"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
                            </button>
                            <button
                              onClick={() => setSlideIdx(Math.min(slides.length - 1, slideIdx + 1))}
                              disabled={slideIdx === slides.length - 1}
                              className="pointer-events-auto w-10 h-10 rounded-full bg-[#1e293b]/90 border border-white/10 flex items-center justify-center text-white hover:bg-[#334155] transition-all disabled:opacity-30"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {slides.map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setSlideIdx(i)}
                                className={`w-2 h-2 rounded-full transition-all ${i === slideIdx ? 'bg-[#8b5cf6] w-5' : 'bg-white/20 hover:bg-white/40'}`}
                              />
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSlideIdx(Math.max(0, slideIdx - 1))}
                              disabled={slideIdx === 0}
                              className="px-4 py-1.5 border border-[#334155] rounded-lg text-white/60 text-xs hover:text-white hover:border-white/20 disabled:opacity-30 transition-all"
                            >Anterior</button>
                            <button
                              onClick={() => setSlideIdx(Math.min(slides.length - 1, slideIdx + 1))}
                              disabled={slideIdx === slides.length - 1}
                              className="px-4 py-1.5 bg-[#8b5cf6] text-white rounded-lg text-xs hover:bg-[#7c3aed] disabled:opacity-30 transition-all"
                            >Próximo</button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* CONTEÚDO TAB */}
                {activeTab === 'conteudo' && (
                  <div
                    className="prose prose-invert prose-sm max-w-none text-white/80"
                    dangerouslySetInnerHTML={{ __html: aula.conteudo_html }}
                  />
                )}

                {/* VIDEO TAB */}
                {activeTab === 'video' && (
                  <div className="space-y-3">
                    <h3 className="text-white font-semibold">{aula.titulo}</h3>
                    <p className="text-white/50 text-sm">{aula.descricao}</p>
                    <div className="flex items-center gap-4 pt-2">
                      <span className="flex items-center gap-1 text-white/30 text-xs">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                        {aula.duracao_min} minutos
                      </span>
                      <span className="flex items-center gap-1 text-white/30 text-xs">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>slideshow</span>
                        {slides.length} slides
                      </span>
                      {aula.materiais && aula.materiais.length > 0 && (
                        <span className="flex items-center gap-1 text-white/30 text-xs">
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>folder_open</span>
                          {aula.materiais.length} materiais
                        </span>
                      )}
                    </div>
                    {/* Materials */}
                    {aula.materiais && aula.materiais.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-white/50 text-xs uppercase tracking-widest font-medium">Material Complementar</h4>
                        {aula.materiais.map(m => (
                          <a key={m.id} href={m.url} className="flex items-center gap-3 p-3 bg-white/3 rounded-lg hover:bg-white/5 transition-all group border border-transparent hover:border-white/10">
                            <span className="material-symbols-outlined text-[#8b5cf6]" style={{ fontSize: '18px' }}>
                              {m.tipo === 'pdf' ? 'picture_as_pdf' : m.tipo === 'link' ? 'link' : 'folder_open'}
                            </span>
                            <span className="text-white/70 text-sm group-hover:text-white transition-colors">{m.titulo}</span>
                            <span className="material-symbols-outlined text-white/20 ml-auto" style={{ fontSize: '16px' }}>open_in_new</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ÁUDIO TAB */}
                {activeTab === 'audio' && (
                  <div className="space-y-5">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#8b5cf6]" style={{ fontSize: '20px' }}>volume_up</span>
                      Recursos de Áudio
                    </h3>

                    {/* OpenAI TTS */}
                    {isOpenAIConfigured && (
                      <div className="bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] border border-[#8b5cf6]/30 rounded-xl p-5 space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#8b5cf6]" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>record_voice_over</span>
                          <div>
                            <h4 className="text-white font-semibold text-sm">Narração por IA</h4>
                            <p className="text-white/40 text-xs">Voz gerada pela OpenAI TTS a partir do conteúdo da aula</p>
                          </div>
                        </div>

                        {/* Voice selector */}
                        <div className="flex flex-wrap gap-2">
                          {(['nova', 'shimmer', 'alloy', 'echo', 'onyx', 'fable'] as TTSVoice[]).map(v => (
                            <button
                              key={v}
                              onClick={() => { setTtsVoice(v); setTtsUrl(null) }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                                ttsVoice === v
                                  ? 'bg-[#8b5cf6] text-white'
                                  : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>

                        {/* Player or generate button */}
                        {ttsUrl ? (
                          <div className="space-y-2">
                            <audio
                              ref={audioRef}
                              src={ttsUrl}
                              controls
                              className="w-full h-10"
                              style={{ accentColor: '#8b5cf6' }}
                            />
                            <button
                              onClick={handleGenerateTTS}
                              disabled={ttsLoading}
                              className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>refresh</span>
                              Gerar novamente
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={handleGenerateTTS}
                            disabled={ttsLoading}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all"
                          >
                            {ttsLoading ? (
                              <>
                                <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>progress_activity</span>
                                Gerando narração...
                              </>
                            ) : (
                              <>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                                Gerar narração com IA
                              </>
                            )}
                          </button>
                        )}

                        {ttsError && (
                          <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{ttsError}</p>
                        )}
                      </div>
                    )}

                    {audioDescriptionText && (
                      <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                        <div>
                          <h4 className="text-white font-medium text-sm">Áudio descrição da aula</h4>
                          <p className="text-white/45 text-xs mt-1">
                            Reproduz a narração usando a voz do navegador.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleToggleAudioDescription}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-medium transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            {isSpeaking ? 'stop_circle' : 'play_circle'}
                          </span>
                          {isSpeaking ? 'Parar áudio' : 'Ouvir áudio descrição'}
                        </button>
                      </div>
                    )}
                    {speechUnsupported && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-amber-200 text-sm">
                        Seu navegador não liberou leitura por voz nesta sessão. Tente novamente após clicar na página ou use Chrome/Edge atualizados.
                      </div>
                    )}
                    {aula.descricao_curta && (
                      <div className="bg-[#0f172a] border border-white/5 rounded-xl p-4">
                        <h4 className="text-white/50 text-xs uppercase tracking-widest font-medium mb-2">Descrição curta</h4>
                        <p className="text-white/70 text-sm leading-relaxed">{aula.descricao_curta}</p>
                      </div>
                    )}
                    {aula.narracao && (
                      <div className="bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 rounded-xl p-4">
                        <h4 className="text-[#8b5cf6] text-xs uppercase tracking-widest font-medium mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>mic</span>
                          Texto para narração
                        </h4>
                        <p className="text-white/80 text-sm leading-relaxed italic">"{aula.narracao}"</p>
                      </div>
                    )}
                    {aula.resumo_audio && (
                      <div className="bg-[#0f172a] border border-white/5 rounded-xl p-4">
                        <h4 className="text-white/50 text-xs uppercase tracking-widest font-medium mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>summarize</span>
                          Resumo em áudio
                        </h4>
                        <p className="text-white/70 text-sm leading-relaxed">{aula.resumo_audio}</p>
                      </div>
                    )}
                    {aula.roteiro_video && (
                      <div className="bg-[#0f172a] border border-white/5 rounded-xl p-4">
                        <h4 className="text-white/50 text-xs uppercase tracking-widest font-medium mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>movie</span>
                          Roteiro para vídeo
                        </h4>
                        <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{aula.roteiro_video}</p>
                      </div>
                    )}
                    {!audioDescriptionText && !aula.roteiro_video && (
                      <div className="text-center py-12 text-white/20">
                        <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>volume_off</span>
                        <p className="mt-2 text-sm">Recursos de áudio não disponíveis nesta aula.</p>
                      </div>
                    )}
                    <p className="text-white/30 text-xs">
                      Dica: a leitura usa a voz disponível no navegador. Para áudio profissional, estes textos também podem ser usados em ferramentas TTS como ElevenLabs, Azure Speech ou Google Cloud TTS.
                    </p>
                  </div>
                )}

                {/* ATIVIDADE TAB */}
                {activeTab === 'atividade' && (
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Atividade Prática</h3>
                    <div className="bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 rounded-xl p-5">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-[#8b5cf6]" style={{ fontSize: '20px' }}>assignment</span>
                        <div>
                          <h4 className="text-white font-medium mb-2">Atividade: {aula.titulo}</h4>
                          {aula.atividade_pratica ? (
                            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{aula.atividade_pratica}</p>
                          ) : (
                            <>
                              <p className="text-white/60 text-sm leading-relaxed">
                                Com base no que você aprendeu nesta aula, realize as seguintes tarefas:
                              </p>
                              <ol className="mt-3 space-y-2 text-white/60 text-sm list-decimal list-inside">
                                <li>Identifique 3 situações do seu trabalho atual onde você poderia aplicar os conceitos aprendidos.</li>
                                <li>Escreva um parágrafo descrevendo como cada situação seria transformada com o uso da IA.</li>
                                <li>Compartilhe sua análise com um colega e discuta as possibilidades.</li>
                              </ol>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {atividadeSalva ? (
                      <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        Atividade enviada com sucesso! +15 XP ganhos.
                      </div>
                    ) : (
                      <>
                        <textarea
                          value={atividadeTexto}
                          onChange={e => setAtividadeTexto(e.target.value)}
                          className="w-full h-32 bg-[#0f172a] border border-[#334155] rounded-xl p-4 text-white/80 text-sm focus:outline-none focus:border-[#8b5cf6] resize-none placeholder-white/20"
                          placeholder="Escreva sua resposta aqui..."
                        />
                        <button
                          onClick={handleEnviarAtividade}
                          disabled={!atividadeTexto.trim() || savingAtividade || isAdmin}
                          className="px-5 py-2 bg-[#8b5cf6] text-white text-sm rounded-lg hover:bg-[#7c3aed] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {savingAtividade
                            ? <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>progress_activity</span> Enviando...</>
                            : <><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span> Enviar Atividade</>
                          }
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* QUIZ TAB */}
                {activeTab === 'quiz' && (
                  <div className="space-y-5">
                    {!quiz ? (
                      <div className="text-center py-12 text-white/20">
                        <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>quiz</span>
                        <p className="mt-2 text-sm">Nenhum quiz disponível para esta aula.</p>
                      </div>
                    ) : quizSubmitted && quizReview ? (
                      <div className="space-y-5">
                        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] p-5">
                          <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#8b5cf6]/10 to-transparent pointer-events-none" />
                          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${quizReview.score >= 70 ? 'bg-emerald-500/15' : 'bg-amber-500/15'}`}>
                                <span
                                  className={`material-symbols-outlined text-3xl ${quizReview.score >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}
                                  style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                  {quizReview.score >= 70 ? 'verified' : 'psychology_alt'}
                                </span>
                              </div>
                              <div>
                                <p className="text-white/40 text-xs uppercase tracking-widest font-medium">Revisão guiada</p>
                                <h3 className="text-white font-bold text-xl mt-1">
                                  {quizReview.score >= 70 ? 'Muito bem, você entendeu a ideia central.' : 'Boa tentativa. Agora vamos revisar juntos.'}
                                </h3>
                                <p className="text-white/50 text-sm mt-1">{quizReview.summary}</p>
                              </div>
                            </div>
                            <div className="text-left md:text-right">
                              <p className={`text-4xl font-black ${quizReview.score >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>{quizReview.score}%</p>
                              <p className="text-white/30 text-xs">pontuação</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {quizReview.items.map((item, i) => (
                            <div
                              key={item.pergunta.id}
                              className={`rounded-2xl border p-4 ${item.isCorrect ? 'bg-emerald-500/[0.04] border-emerald-500/20' : 'bg-amber-500/[0.04] border-amber-500/20'}`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.isCorrect ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                                  <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>
                                    {item.isCorrect ? 'check_circle' : 'tips_and_updates'}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <p className="text-white/85 text-sm font-medium">
                                      <span className="text-white/35 mr-2">{i + 1}.</span>
                                      {item.pergunta.texto}
                                    </p>
                                    <span className={`self-start sm:self-auto px-2 py-0.5 rounded-full text-[11px] font-bold border ${item.isCorrect ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                      {item.isCorrect ? 'Acertou' : 'Revisar'}
                                    </span>
                                  </div>

                                  <div className="grid md:grid-cols-2 gap-2 mt-3">
                                    <div className="rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2">
                                      <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Sua resposta</p>
                                      <p className={`text-sm ${item.isCorrect ? 'text-emerald-300' : 'text-amber-300'}`}>
                                        {item.selectedOption ? `${item.selectedOption.id.toUpperCase()}) ${item.selectedOption.texto}` : 'Não respondida'}
                                      </p>
                                    </div>
                                    <div className="rounded-xl bg-emerald-500/[0.04] border border-emerald-500/10 px-3 py-2">
                                      <p className="text-emerald-300/60 text-[10px] uppercase tracking-widest mb-1">Resposta correta</p>
                                      <p className="text-emerald-300 text-sm">
                                        {item.correctOption ? `${item.correctOption.id.toUpperCase()}) ${item.correctOption.texto}` : 'Resposta nao cadastrada'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mt-3 flex gap-2 rounded-xl bg-[#0f172a]/70 border border-white/5 px-3 py-2.5">
                                    <span className="material-symbols-outlined text-[#8b5cf6] shrink-0" style={{ fontSize: '16px' }}>school</span>
                                    <p className="text-white/60 text-sm leading-relaxed">{item.explanation}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button onClick={() => { setQuizSubmitted(false); setQuizAnswers({}) }} className="px-5 py-2 border border-[#334155] text-white/60 text-sm rounded-lg hover:text-white hover:border-white/20 transition-all">
                            Tentar novamente
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <h3 className="text-white font-semibold">{quiz.titulo}</h3>
                          <span className="text-white/30 text-xs">{quiz.perguntas.length} perguntas</span>
                        </div>
                        <div className="space-y-6">
                          {quiz.perguntas.map((p, pi) => (
                            <div key={p.id} className="space-y-3">
                              <p className="text-white/80 text-sm">
                                <span className="text-[#8b5cf6] font-bold mr-2">{pi + 1}.</span>
                                {p.texto}
                              </p>
                              <div className="space-y-2">
                                {p.opcoes.map(op => (
                                  <button
                                    key={op.id}
                                    onClick={() => setQuizAnswers(prev => ({ ...prev, [p.id]: op.id }))}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm transition-all border ${
                                      quizAnswers[p.id] === op.id
                                        ? 'bg-[#8b5cf6]/15 border-[#8b5cf6] text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                                        : 'glass-card border-transparent hover:border-white/10 text-white/60 hover:text-white/80'
                                    }`}
                                  >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                                      quizAnswers[p.id] === op.id ? 'bg-[#8b5cf6] text-white' : 'bg-white/5 text-white/40'
                                    }`}>
                                      {op.id.toUpperCase()}
                                    </div>
                                    {op.texto}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                          <span className="text-white/30 text-xs">
                            {Object.keys(quizAnswers).length} de {quiz.perguntas.length} respondidas
                          </span>
                          <button
                            onClick={handleSubmitQuiz}
                            disabled={Object.keys(quizAnswers).length < quiz.perguntas.length}
                            className="px-6 py-2 bg-[#8b5cf6] text-white text-sm rounded-lg font-medium hover:bg-[#7c3aed] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          >
                            Enviar Respostas
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {/* FLASHCARDS TAB */}
                {activeTab === 'flashcards' && (
                  <FlashcardReviewer aula={aula} />
                )}

                {/* NOTAS TAB */}
                {activeTab === 'notas' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold text-base">Minhas Anotações</h3>
                        <p className="text-white/40 text-xs mt-0.5">Salvo automaticamente enquanto você escreve</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {notasSalvas ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            Salvo
                          </span>
                        ) : notas.length > 0 ? (
                          <span className="flex items-center gap-1 text-white/30">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>pending</span>
                            Salvando...
                          </span>
                        ) : null}
                        <span className="text-white/20">{notas.length} caracteres</span>
                      </div>
                    </div>

                    <textarea
                      value={notas}
                      onChange={e => handleNotasChange(e.target.value)}
                      placeholder={`Anote os pontos principais de "${aula.titulo}"...\n\n• Conceitos importantes\n• Dúvidas para pesquisar\n• Aplicações práticas no trabalho`}
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-xl p-4 text-white/80 text-sm focus:outline-none focus:border-[#8b5cf6] resize-none placeholder-white/15 leading-relaxed transition-colors"
                      style={{ minHeight: '320px' }}
                    />

                    {notas.length > 0 && (
                      <div className="flex justify-between items-center pt-1">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(notas).catch(() => {})
                          }}
                          className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>content_copy</span>
                          Copiar notas
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Apagar todas as notas desta aula?')) {
                              handleNotasChange('')
                              localStorage.removeItem(`notas_aula_${id}`)
                            }
                          }}
                          className="flex items-center gap-1.5 text-white/20 hover:text-red-400 text-xs transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                          Limpar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pb-6">
              {prevAula ? (
                <Link to={`/aula/${prevAula.id}`} className="flex items-center gap-2 px-4 py-2 border border-[#334155] rounded-lg text-white/50 text-sm hover:text-white hover:border-white/20 transition-all">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
                  {prevAula.titulo}
                </Link>
              ) : <div />}
              {nextAulaItem ? (
                <Link to={`/aula/${nextAulaItem.id}`} className="flex items-center gap-2 px-4 py-2 bg-[#8b5cf6] text-white rounded-lg text-sm font-medium hover:bg-[#7c3aed] transition-all">
                  {nextAulaItem.titulo}
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                </Link>
              ) : (
                <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm hover:bg-emerald-500/25 transition-all">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                  {isAdmin ? 'Voltar ao Admin' : 'Módulo Concluído!'}
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Tutor IA flutuante */}
      <AiTutor aula={aula} />

      {/* Confetti + modal de módulo concluído */}
      {showConfetti && <ConfettiBlast onDone={() => setShowConfetti(false)} />}
      {moduloConcluido && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
          <div className="bg-[#0f172a] border border-[#8b5cf6]/40 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl" style={{ animation: 'pageEnter 0.35s ease forwards' }}>
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#34d399] flex items-center justify-center shadow-lg shadow-[#8b5cf6]/30">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '40px', fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
            </div>
            <h2 className="text-white font-bold text-2xl mb-2">Módulo Concluído!</h2>
            <p className="text-white/50 text-sm mb-1">
              Você finalizou <span className="text-white font-semibold">{modulo.titulo.split(' - ').pop()}</span>
            </p>
            <p className="text-[#8b5cf6] text-sm font-medium mb-6">+10 XP ganhos</p>
            <div className="flex gap-3">
              <Link
                to={`/modulo/${modulo.id}`}
                className="flex-1 py-2.5 border border-[#334155] rounded-xl text-white/60 text-sm hover:text-white hover:border-white/20 transition-all"
                onClick={() => setModuloConcluido(false)}
              >
                Ver módulo
              </Link>
              <Link
                to={isAdmin ? '/admin' : '/dashboard'}
                className="flex-1 py-2.5 bg-[#8b5cf6] text-white rounded-xl text-sm font-medium hover:bg-[#7c3aed] transition-all"
                onClick={() => setModuloConcluido(false)}
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
