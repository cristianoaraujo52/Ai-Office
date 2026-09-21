import React from 'react'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'
import { isSupabaseConfigured } from '../../lib/supabase'

const settings = [
  {
    icon: 'database',
    title: 'Banco de dados',
    description: isSupabaseConfigured
      ? 'Supabase configurado. Os dados administrativos são salvos no banco.'
      : 'Supabase não configurado. O app está usando dados locais de demonstração.',
    status: isSupabaseConfigured ? 'Conectado' : 'Offline',
  },
  {
    icon: 'manage_accounts',
    title: 'Usuários',
    description: 'A exclusão remove o perfil da plataforma e impede que o usuário apareça novamente nas listas.',
    status: 'Gerenciado por perfis',
  },
  {
    icon: 'image',
    title: 'Capas dos módulos',
    description: 'As 14 capas novas estão salvas em WEBP, no formato 16:9, dentro de public/covers.',
    status: 'Atualizado',
  },
  {
    icon: 'analytics',
    title: 'Métricas',
    description: 'Os indicadores usam perfis, progresso dos alunos, aulas publicadas e quizzes realizados.',
    status: 'Ativo',
  },
]

export default function AdminConfiguracoes() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar isAdmin />
      <div className="flex-1 ml-0 md:ml-[280px] flex flex-col">
        <TopBar title="Configurações" subtitle="Estado geral da plataforma e opções administrativas" />
        <main className="flex-1 p-8 space-y-6 fade-in">
          <div>
            <h2 className="text-2xl font-bold text-white">Configurações da plataforma</h2>
            <p className="text-white/40 text-sm mt-1">
              Revise conexões, comportamento dos usuários e recursos ativos do curso.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {settings.map(item => (
              <section key={item.title} className="bg-[#1e293b] border border-white/5 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#8b5cf6]" style={{ fontSize: '22px' }}>{item.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold">{item.title}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-white/45 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </section>
            ))}
          </div>

          <section className="bg-[#1e293b] border border-white/5 rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Boas práticas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                'Crie logins novos pelo Supabase Authentication antes de gerenciar perfis.',
                'Não exclua o próprio administrador enquanto estiver usando o painel.',
                'Depois de alterar capas ou conteúdo, rode o build para validar a aplicação.',
              ].map(text => (
                <div key={text} className="rounded-xl bg-[#0f172a] border border-white/5 p-4">
                  <p className="text-white/55 text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
