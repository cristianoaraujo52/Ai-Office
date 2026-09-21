import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { comeceAquiPages } from '../data/comeceAquiPages'
import { createFlipbookUtterance, supportsSpeech } from '../lib/flipbookSpeech'

type SpeechState = 'idle' | 'speaking' | 'paused'
type ImageState = 'loading' | 'ready' | 'error'

export default function ComeceAqui() {
  const { user } = useAuth()
  const { modulos } = useData()
  const isAdmin = user?.role === 'admin'
  const [pageIndex, setPageIndex] = useState(0)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [speechState, setSpeechState] = useState<SpeechState>('idle')
  const [speechUnsupported, setSpeechUnsupported] = useState(false)
  const [imageState, setImageState] = useState<ImageState>('loading')
  const [imageRetry, setImageRetry] = useState(0)
  const speechTokenRef = useRef(0)

  const page = comeceAquiPages[pageIndex]
  const isFirstPage = pageIndex === 0
  const isLastPage = pageIndex === comeceAquiPages.length - 1
  const firstModule = modulos.find(modulo => modulo.ordem === 1)
  const courseTarget = firstModule ? `/modulo/${firstModule.id}` : '/dashboard'

  const cancelSpeech = useCallback(() => {
    speechTokenRef.current += 1
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setSpeechState('idle')
  }, [])

  const speakPage = useCallback(() => {
    if (!supportsSpeech()) {
      setSpeechUnsupported(true)
      setSpeechState('idle')
      return
    }

    speechTokenRef.current += 1
    const token = speechTokenRef.current
    window.speechSynthesis.cancel()

    const utterance = createFlipbookUtterance(
      page.narration,
      window.speechSynthesis.getVoices(),
    )

    utterance.onstart = () => {
      if (speechTokenRef.current === token) setSpeechState('speaking')
    }
    utterance.onend = () => {
      if (speechTokenRef.current === token) setSpeechState('idle')
    }
    utterance.onerror = () => {
      if (speechTokenRef.current === token) setSpeechState('idle')
    }

    setSpeechUnsupported(false)
    setSpeechState('speaking')
    window.speechSynthesis.speak(utterance)
  }, [page.narration])

  useEffect(() => {
    if (audioEnabled) speakPage()
    return () => {
      speechTokenRef.current += 1
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [audioEnabled, pageIndex, speakPage])

  useEffect(() => {
    const nextPage = comeceAquiPages[pageIndex + 1]
    if (!nextPage) return
    const image = new Image()
    image.src = nextPage.image
  }, [pageIndex])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && pageIndex > 0) {
        event.preventDefault()
        cancelSpeech()
        setPageIndex(index => index - 1)
      }
      if (event.key === 'ArrowRight' && pageIndex < comeceAquiPages.length - 1) {
        event.preventDefault()
        cancelSpeech()
        setPageIndex(index => index + 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cancelSpeech, pageIndex])

  useEffect(() => {
    setImageState('loading')
  }, [pageIndex, imageRetry])

  const goToPage = (nextIndex: number) => {
    cancelSpeech()
    setPageIndex(Math.max(0, Math.min(comeceAquiPages.length - 1, nextIndex)))
  }

  const pauseSpeech = () => {
    if (!supportsSpeech()) return
    window.speechSynthesis.pause()
    setSpeechState('paused')
  }

  const continueSpeech = () => {
    if (!supportsSpeech()) return
    window.speechSynthesis.resume()
    setSpeechState('speaking')
  }

  const activateAudio = () => {
    if (!supportsSpeech()) {
      setSpeechUnsupported(true)
      return
    }
    setAudioEnabled(true)
  }

  return (
    <div className="min-h-screen bg-[#07101f] flex">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex-1 ml-0 md:ml-[280px] flex flex-col min-w-0">
        <TopBar title="Comece aqui" subtitle="Um guia visual antes da sua primeira aula" />

        <main className="relative flex-1 overflow-hidden px-3 py-4 sm:px-6 sm:py-6">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
          </div>

          <div className="relative mx-auto flex w-full max-w-[1500px] flex-col gap-4">
            <section className="flex flex-col gap-3 rounded-2xl border border-cyan-400/15 bg-[#0b1628]/90 p-4 shadow-2xl shadow-black/30 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300/70">Guia para iniciantes</p>
                <h1 className="mt-1 text-xl font-black text-white sm:text-2xl">Veja, ouça e avance no seu ritmo</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="min-w-28 text-right" aria-live="polite">
                  <p className="text-sm font-bold text-white">Página {page.number} de {comeceAquiPages.length}</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                      style={{ width: `${(page.number / comeceAquiPages.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-[0_28px_80px_rgba(0,0,0,0.45)]">
              <div className="relative flex min-h-[280px] items-center justify-center bg-[#020817] sm:min-h-[420px]">
                {imageState === 'loading' && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#020817]">
                    <div className="flex flex-col items-center gap-3 text-white/45">
                      <span className="material-symbols-outlined animate-spin text-cyan-400" style={{ fontSize: '34px' }}>progress_activity</span>
                      <p className="text-sm">Carregando página {page.number}...</p>
                    </div>
                  </div>
                )}

                {imageState === 'error' ? (
                  <div className="flex max-w-md flex-col items-center gap-4 p-8 text-center" aria-live="polite">
                    <span className="material-symbols-outlined text-amber-400" style={{ fontSize: '48px' }}>broken_image</span>
                    <div>
                      <h2 className="font-bold text-white">Não foi possível carregar a página {page.number}</h2>
                      <p className="mt-1 text-sm text-white/50">Você pode tentar novamente ou continuar usando os botões abaixo.</p>
                    </div>
                    <button
                      onClick={() => setImageRetry(value => value + 1)}
                      className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-2.5 text-sm font-bold text-cyan-200 hover:bg-cyan-400/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
                    >
                      Tentar novamente
                    </button>
                  </div>
                ) : (
                  <img
                    key={`${page.image}-${imageRetry}`}
                    src={page.image}
                    alt={page.alt}
                    className={`block h-auto max-h-[70vh] w-full object-contain transition-opacity duration-300 ${imageState === 'ready' ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageState('ready')}
                    onError={() => setImageState('error')}
                  />
                )}

                {!audioEnabled && !speechUnsupported && (
                  <div className="absolute inset-0 z-20 flex items-end justify-center bg-gradient-to-t from-black/85 via-black/15 to-transparent p-5 sm:items-center sm:bg-black/45">
                    <div className="max-w-lg rounded-2xl border border-cyan-300/30 bg-[#07101f]/95 p-5 text-center shadow-2xl backdrop-blur sm:p-7">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-300">
                        <span className="material-symbols-outlined" style={{ fontSize: '30px' }}>record_voice_over</span>
                      </div>
                      <h2 className="mt-3 text-xl font-black text-white">Ative a leitura automática</h2>
                      <p className="mt-2 text-sm leading-relaxed text-white/60">
                        Depois do primeiro toque, cada nova página será lida automaticamente.
                      </p>
                      <button
                        onClick={activateAudio}
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3.5 text-sm font-black text-[#03111c] shadow-lg shadow-cyan-500/20 hover:bg-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '21px' }}>volume_up</span>
                        Ativar áudio e começar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {speechUnsupported && (
              <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100" aria-live="polite">
                A narração automática não está disponível neste navegador. Você ainda pode navegar normalmente pelas páginas.
              </div>
            )}

            <section className="grid gap-3 rounded-2xl border border-white/10 bg-[#0b1628]/90 p-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => goToPage(pageIndex - 1)}
                  disabled={isFirstPage}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-white/75 hover:border-white/20 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
                  Anterior
                </button>

                {audioEnabled && !speechUnsupported && (
                  <>
                    {speechState === 'speaking' ? (
                      <button
                        onClick={pauseSpeech}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-2.5 text-sm font-bold text-cyan-200 hover:bg-cyan-400/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>pause</span>
                        Pausar
                      </button>
                    ) : speechState === 'paused' ? (
                      <button
                        onClick={continueSpeech}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-2.5 text-sm font-bold text-cyan-200 hover:bg-cyan-400/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>play_arrow</span>
                        Continuar
                      </button>
                    ) : null}

                    <button
                      onClick={speakPage}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-white/70 hover:border-white/20 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>replay</span>
                      Repetir página
                    </button>
                  </>
                )}
              </div>

              <div className="hidden items-center gap-2 px-4 text-xs text-white/35 lg:flex">
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>keyboard</span>
                Use as setas do teclado
              </div>

              <div className="flex justify-start lg:justify-end">
                {isLastPage ? (
                  <Link
                    to={courseTarget}
                    onClick={cancelSpeech}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-emerald-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200 sm:w-auto"
                  >
                    Iniciar o curso
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>school</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => goToPage(pageIndex + 1)}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-[#03111c] shadow-lg shadow-cyan-500/20 hover:bg-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 sm:w-auto"
                  >
                    Próxima
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
                  </button>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
