import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import Sidebar from '../components/Sidebar'

const nameConfirmKey = (userId: string) => `ia_academy_cert_nome_${userId}`

function readConfirmedName(userId?: string) {
  if (!userId) return null
  try { return localStorage.getItem(nameConfirmKey(userId)) } catch { return null }
}

export default function Certificate() {
  const { user, updateNome } = useAuth()
  const { modulos, progressos, loading } = useData()
  const isAdmin = user?.role === 'admin'

  // Conclusão = todas as aulas ativas dos módulos ativos marcadas como concluídas.
  const { totalAulas, concluidas, dataConclusao } = useMemo(() => {
    const aulaIds = new Set(
      modulos.filter(m => m.ativo !== false)
        .flatMap(m => (m.aulas ?? []).filter(a => a.ativo !== false).map(a => a.id)),
    )
    const feitas = progressos.filter(p => p.concluida && aulaIds.has(p.aula_id))
    const ultima = feitas.map(p => p.updated_at).filter(Boolean).sort().pop()
    return { totalAulas: aulaIds.size, concluidas: new Set(feitas.map(p => p.aula_id)).size, dataConclusao: ultima }
  }, [modulos, progressos])

  const cursoConcluido = totalAulas > 0 && concluidas >= totalAulas
  const percent = totalAulas ? Math.round((concluidas / totalAulas) * 100) : 0

  // O aluno confirma (ou corrige) o nome antes de imprimir/baixar.
  const [confirmedName, setConfirmedName] = useState(() => readConfirmedName(user?.id))
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [nameError, setNameError] = useState('')
  const [savingName, setSavingName] = useState(false)
  const nameConfirmed = isAdmin || (!!user?.nome && confirmedName === user.nome)

  const confirmName = (nome: string) => {
    if (!user) return
    try { localStorage.setItem(nameConfirmKey(user.id), nome) } catch { /* sem armazenamento: pede de novo na próxima vez */ }
    setConfirmedName(nome)
  }

  const saveName = async () => {
    setSavingName(true)
    setNameError('')
    const result = await updateNome(nameDraft)
    setSavingName(false)
    if (result.error) { setNameError(result.error); return }
    setEditingName(false)
    confirmName(nameDraft.replace(/\s+/g, ' ').trim().slice(0, 80))
  }

  const conclusao = dataConclusao ? new Date(dataConclusao) : new Date()
  const today = conclusao.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  // Código estável por aluno (antes era sorteado a cada renderização e não servia para conferência).
  const certCode = `IA-${conclusao.getFullYear()}-${(user?.id ?? '').replace(/-/g, '').slice(0, 8).toUpperCase()}`

  const handlePrint = () => window.print()

  const handleDownload = () => {
    // Use browser print to PDF
    window.print()
  }

  if (!isAdmin && (loading || !cursoConcluido)) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex">
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[280px] flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center bg-[#1e293b] border border-[#334155] rounded-2xl p-8">
            <span className="material-symbols-outlined text-white/30" style={{ fontSize: '56px' }}>
              {loading ? 'hourglass_top' : 'lock'}
            </span>
            <h2 className="text-white text-xl font-bold mt-3">
              {loading ? 'Carregando seu progresso...' : 'Certificado bloqueado'}
            </h2>
            {!loading && (
              <>
                <p className="text-white/50 text-sm mt-2">
                  Conclua todas as {totalAulas} aulas do curso para liberar seu certificado.
                </p>
                <div className="mt-6 text-left">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-white/50">{concluidas} de {totalAulas} aulas</span>
                    <span className="text-[#8b5cf6] font-semibold">{percent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-[#8b5cf6] rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                </div>
                <Link to="/dashboard" className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-medium rounded-lg transition-colors">
                  Continuar estudando
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[280px] flex flex-col">
        {/* Toolbar */}
        <div className="sticky top-0 z-40 bg-[#0f172a]/90 backdrop-blur-md border-b border-white/5 flex justify-between items-center h-14 px-6 no-print">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
              Dashboard
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <h2 className="text-white text-sm font-medium">Meu Certificado</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              disabled={!nameConfirmed}
              title={nameConfirmed ? undefined : 'Confirme seu nome primeiro'}
              className="flex items-center gap-2 px-4 py-1.5 bg-[#8b5cf6] text-white rounded-lg text-xs font-medium hover:bg-[#7c3aed] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
              Baixar PDF
            </button>
            <button
              onClick={handlePrint}
              disabled={!nameConfirmed}
              title={nameConfirmed ? undefined : 'Confirme seu nome primeiro'}
              className="flex items-center gap-2 px-4 py-1.5 bg-[#1e293b] border border-[#334155] text-white/70 rounded-lg text-xs hover:text-white hover:border-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>print</span>
              Imprimir
            </button>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent('Certificado de IA para o Escritório — IA Office Academy')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-1.5 bg-[#0077B5] text-white rounded-lg text-xs font-medium hover:bg-[#006396] transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>share</span>
              LinkedIn
            </a>
          </div>
        </div>

        {!nameConfirmed && (
          <div className="no-print mx-4 md:mx-8 mt-6 bg-[#1e293b] border border-[#8b5cf6]/40 rounded-xl p-4">
            {!editingName ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#8b5cf6]">badge</span>
                  <div>
                    <p className="text-white text-sm font-medium">Confira como seu nome vai aparecer no certificado</p>
                    <p className="text-white text-lg font-bold mt-0.5">{user?.nome}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setNameDraft(user?.nome ?? ''); setNameError(''); setEditingName(true) }}
                    className="px-4 py-2 bg-[#0f172a] border border-[#334155] text-white/80 rounded-lg text-sm hover:border-[#8b5cf6]/50 transition-colors"
                  >
                    Corrigir nome
                  </button>
                  <button
                    onClick={() => { if (user?.nome) confirmName(user.nome) }}
                    className="px-4 py-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Está correto
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); saveName() }} className="flex flex-col gap-2">
                <label htmlFor="cert-nome" className="text-white text-sm font-medium">Nome completo para o certificado</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="cert-nome" value={nameDraft} maxLength={80} autoFocus
                    onChange={e => setNameDraft(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white text-sm focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6]"
                  />
                  <button type="button" onClick={() => setEditingName(false)} className="px-4 py-2 text-white/60 text-sm hover:text-white">Cancelar</button>
                  <button disabled={savingName} className="px-4 py-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-lg text-sm font-medium disabled:opacity-50">
                    {savingName ? 'Salvando...' : 'Salvar e confirmar'}
                  </button>
                </div>
                {nameError && <p className="text-red-400 text-xs">{nameError}</p>}
              </form>
            )}
          </div>
        )}

        {/* Certificate */}
        <main className="flex-1 flex items-center justify-center p-8 fade-in">
          <div
            className="relative w-full max-w-5xl bg-[#0a0c10] shadow-2xl overflow-hidden border-[16px] border-[#131b2e]"
            style={{ aspectRatio: '1.414 / 1' }}
          >
            {/* Inner borders */}
            <div className="absolute inset-4 border-2 border-[#8b5cf6] opacity-10 pointer-events-none" />
            <div className="absolute inset-8 border border-[#D4AF37] opacity-30 pointer-events-none" />

            {/* Background pattern */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(168,127,251,0.08) 1px, transparent 0)',
                backgroundSize: '24px 24px'
              }}
            />

            {/* Corner glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#8b5cf6] opacity-10 rounded-bl-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D4AF37] opacity-5 rounded-tr-full blur-3xl" />

            <div className="relative h-full flex flex-col items-center justify-between py-12 px-16">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="flex flex-col items-center">
                  <div className="bg-[#D4AF37] p-3 rounded-xl mb-3 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                    <span className="material-symbols-outlined text-[#131b2e]" style={{ fontSize: '40px', fontVariationSettings: "'FILL' 1" }}>school</span>
                  </div>
                  <h1 className="text-[#bec6e0] text-sm uppercase tracking-[0.3em] font-bold">IA Office Academy</h1>
                </div>
                <div className="w-40 h-px bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent mx-auto" />
                <h2 className="text-5xl font-black tracking-tight uppercase gold-text">
                  CERTIFICADO DE CONCLUSÃO
                </h2>
              </div>

              {/* Recipient */}
              <div className="text-center space-y-4">
                <p className="text-white/40 text-sm italic">Conferimos este certificado a</p>
                <div className="py-2">
                  <span className="text-5xl font-bold text-white border-b-2 border-[#8b5cf6]/40 pb-2">
                    {user?.nome || 'João Silva'}
                  </span>
                </div>
                <p className="text-white/50 text-sm leading-relaxed max-w-2xl mx-auto">
                  por ter concluído com êxito o curso de{' '}
                  <strong className="text-[#8b5cf6]">Inteligência Artificial para o Escritório</strong>,
                  abrangendo conceitos essenciais, ferramentas generativas, segurança, ética e automação de
                  processos administrativos, demonstrando proficiência nas tecnologias que moldam o futuro do trabalho.
                </p>
              </div>

              {/* Footer */}
              <div className="w-full grid grid-cols-3 items-end">
                {/* Signature */}
                <div className="flex flex-col items-start gap-2">
                  <div className="w-40 h-px bg-[#bec6e0]/30" />
                  <p className="text-white text-xs font-bold">Diretor da Academia</p>
                  <p className="text-white/30 text-xs uppercase tracking-tight">IA Office Academy</p>
                </div>

                {/* Stats */}
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                    Carga Horária: <strong className="text-[#8b5cf6]">40 horas</strong>
                  </div>
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
                    Data de Conclusão: <strong className="text-[#8b5cf6]">{today}</strong>
                  </div>
                  <div className="mt-2 px-4 py-1.5 bg-[#131b2e] border border-[#8b5cf6]/20 rounded-full flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#D4AF37]" style={{ fontSize: '14px' }}>verified</span>
                    <span className="text-[#bec6e0] text-xs">{certCode}</span>
                  </div>
                </div>

                {/* Gold seal */}
                <div className="flex justify-end">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <div className="absolute inset-0 bg-[#D4AF37] rounded-full opacity-10 animate-pulse" />
                    <div className="absolute inset-2 border-4 border-[#D4AF37] border-double rounded-full opacity-60" />
                    <div className="z-10 bg-gradient-to-br from-[#FFD700] via-[#D4AF37] to-[#B8860B] w-20 h-20 rounded-full flex flex-col items-center justify-center text-[#131b2e] shadow-lg">
                      <span className="material-symbols-outlined" style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                      <span className="text-[7px] font-black uppercase tracking-[0.2em]">Authentic</span>
                    </div>
                    <div className="absolute -bottom-3 flex gap-1">
                      <div className="w-3.5 h-10 bg-[#8b5cf6]/70 shadow-md" style={{ transform: 'skewY(12deg)' }} />
                      <div className="w-3.5 h-10 bg-[#8b5cf6]/70 shadow-md" style={{ transform: 'skewY(-12deg)' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative corner */}
            <div className="absolute bottom-4 right-4 text-[#8b5cf6] opacity-10 pointer-events-none">
              <span className="material-symbols-outlined" style={{ fontSize: '100px' }}>auto_awesome</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
