import React, { useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  onClose: () => void
}

export default function AvatarUpload({ onClose }: Props) {
  const { user, updateAvatar } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) { setError('Selecione uma imagem (JPG, PNG, WebP).'); return }
    if (f.size > 2 * 1024 * 1024) { setError('Imagem maior que 2 MB. Escolha uma menor.'); return }
    setError(null)
    setFile(f)
    const url = URL.createObjectURL(f)
    setPreview(url)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleSave = async () => {
    if (!file) return
    setSaving(true)
    setError(null)
    const { error: err } = await updateAvatar(file)
    setSaving(false)
    if (err) { setError(err); return }
    onClose()
  }

  const initials = user?.nome?.split(' ').map(n => n[0]).slice(0, 2).join('') ?? '?'
  const current = preview ?? user?.avatar_url ?? null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-5" style={{ animation: 'pageEnter 0.25s ease forwards' }}>
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-base">Foto de Perfil</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {/* Preview */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-2 border-[#8b5cf6]/40 overflow-hidden bg-[#1e293b] flex items-center justify-center">
              {current ? (
                <img src={current} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-2xl font-bold">{initials}</span>
              )}
            </div>
            <button
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 bg-[#8b5cf6] rounded-full flex items-center justify-center hover:bg-[#7c3aed] transition-colors"
            >
              <span className="material-symbols-outlined text-white" style={{ fontSize: '14px' }}>photo_camera</span>
            </button>
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-white/10 hover:border-[#8b5cf6]/50 rounded-xl p-6 text-center cursor-pointer transition-all group"
        >
          <span className="material-symbols-outlined text-white/20 group-hover:text-[#8b5cf6]/60 transition-colors" style={{ fontSize: '32px' }}>upload</span>
          <p className="text-white/40 text-sm mt-2">Arraste uma imagem ou <span className="text-[#8b5cf6]">clique para selecionar</span></p>
          <p className="text-white/20 text-xs mt-1">JPG, PNG ou WebP · máx. 2 MB</p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />

        {error && (
          <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-white/10 rounded-xl text-white/50 text-sm hover:text-white hover:border-white/20 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!file || saving}
            className="flex-1 py-2.5 bg-[#8b5cf6] text-white rounded-xl text-sm font-medium hover:bg-[#7c3aed] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>progress_activity</span> Salvando...</>
            ) : 'Salvar foto'}
          </button>
        </div>
      </div>
    </div>
  )
}
