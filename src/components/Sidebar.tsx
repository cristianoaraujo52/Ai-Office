import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useUI } from '../contexts/UIContext'

interface NavItem {
  icon: string
  label: string
  to: string
}

interface SidebarProps {
  isAdmin?: boolean
}

export default function Sidebar({ isAdmin }: SidebarProps) {
  const { user, logout } = useAuth()
  const { sidebarOpen, setSidebarOpen } = useUI()
  const navigate = useNavigate()

  const studentNav: NavItem[] = [
    { icon: 'auto_stories',       label: 'Comece aqui',             to: '/comece-aqui' },
    { icon: 'movie',              label: 'Exemplos de Uso',        to: '/exemplos-de-uso' },
    { icon: 'dashboard',          label: 'Dashboard',              to: '/dashboard' },
    { icon: 'play_circle',        label: 'Apresentação do Curso',  to: '/apresentacao' },
    { icon: 'school',             label: 'Meus Cursos',            to: '/cursos' },
    { icon: 'alt_route',          label: 'Trilha de Aprendizado',  to: '/trilha' },
    { icon: 'folder_open',        label: 'Recursos',               to: '/recursos' },
    { icon: 'leaderboard',         label: 'Ranking',                to: '/leaderboard' },
    { icon: 'style',               label: 'Meus Flashcards',        to: '/flashcards' },
    { icon: 'workspace_premium',  label: 'Certificado',            to: '/certificado' },
    { icon: 'settings',           label: 'Configurações',          to: '/configuracoes' },
  ]

  const adminNav: NavItem[] = [
    { icon: 'dashboard',          label: 'Dashboard',      to: '/admin' },
    { icon: 'group',              label: 'Usuários',       to: '/admin/usuarios' },
    { icon: 'library_books',      label: 'Módulos',        to: '/admin/modulos' },
    { icon: 'menu_book',          label: 'Aulas',          to: '/admin/aulas' },
    { icon: 'quiz',               label: 'Quizzes',        to: '/admin/quizzes' },
    { icon: 'workspace_premium',  label: 'Certificados',   to: '/admin/certificados' },
    { icon: 'bar_chart',          label: 'Métricas',       to: '/admin/metricas' },
    { icon: 'settings',           label: 'Configurações',  to: '/admin/configuracoes' },
  ]

  const navItems = isAdmin ? adminNav : studentNav

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const close = () => setSidebarOpen(false)

  return (
    <>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full w-[280px] bg-[#0a0c10] flex flex-col border-r border-white/5 z-50
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Brand */}
        <div className="px-6 py-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#8b5cf6] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>school</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-base leading-tight">IA Academy</h1>
            <p className="text-white/40 text-xs mt-0.5">{isAdmin ? 'Admin Panel' : 'Professional Series'}</p>
          </div>
          {/* Close button (mobile only) */}
          <button
            onClick={close}
            className="md:hidden p-1 text-white/30 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/dashboard'}
              onClick={close}
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center gap-3 px-4 py-3 bg-[#8b5cf6]/15 border-l-4 border-[#8b5cf6] text-white font-bold rounded-r-lg text-sm transition-all'
                  : 'flex items-center gap-3 px-4 py-3 text-white/50 hover:text-white/80 hover:bg-white/5 rounded-lg text-sm transition-all border-l-4 border-transparent'
              }
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/5 space-y-1">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-[#8b5cf6]/30 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.nome?.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.nome}</p>
              <p className="text-white/40 text-xs truncate">{user?.role === 'admin' ? 'Administrador' : 'Aluno'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-white/40 hover:text-white/70 text-sm rounded-lg hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  )
}
