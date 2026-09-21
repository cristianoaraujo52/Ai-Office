import React, { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PwaInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem('pwa_banner_dismissed') === '1'
  )
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Já instalado como PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setPrompt(null)
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('pwa_banner_dismissed', '1')
  }

  if (installed || dismissed || !prompt) return null

  return (
    <div
      className="fixed bottom-24 left-4 z-50 max-w-xs fade-in"
      style={{
        background: 'linear-gradient(135deg, #1a1040 0%, #0f0a28 100%)',
        border: '1px solid rgba(139,92,246,0.35)',
        borderRadius: '14px',
        boxShadow: '0 0 30px rgba(139,92,246,0.15), 0 16px 40px rgba(0,0,0,0.5)',
        padding: '14px',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: 'linear-gradient(135deg, #863bff, #5b21b6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 12px rgba(134,59,255,0.4)',
        }}>
          <span className="material-symbols-outlined text-white" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>install_mobile</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-bold mb-0.5">Instalar IA Academy</p>
          <p className="text-white/40 text-[11px] leading-relaxed">
            Adicione à tela inicial para acesso rápido, sem abrir o navegador.
          </p>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="flex-1 py-1.5 text-white text-xs font-semibold rounded-lg transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #863bff, #5b21b6)', boxShadow: '0 0 10px rgba(134,59,255,0.3)' }}
            >
              Instalar
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-white/30 text-xs rounded-lg hover:text-white/60 hover:bg-white/5 transition-all"
            >
              Agora não
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-white/20 hover:text-white/50 transition-colors shrink-0"
          style={{ marginTop: -2 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
        </button>
      </div>
    </div>
  )
}
