import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { UIProvider } from './contexts/UIContext'
import { GamificationProvider } from './contexts/GamificationContext'
import SearchPalette from './components/SearchPalette'
import PwaInstallBanner from './components/PwaInstallBanner'

import Login from './pages/Login'
import StudentDashboard from './pages/StudentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AulaView from './pages/AulaView'
import ModuloView from './pages/ModuloView'
import Certificate from './pages/Certificate'
import CursoApresentacao from './pages/CursoApresentacao'
import AdminModulos from './pages/admin/AdminModulos'
import AdminAulas from './pages/admin/AdminAulas'
import AdminUsuarios from './pages/admin/AdminUsuarios'
import AdminQuizzes from './pages/admin/AdminQuizzes'
import AdminCertificados from './pages/admin/AdminCertificados'
import AdminMetricas from './pages/admin/AdminMetricas'
import AdminConfiguracoes from './pages/admin/AdminConfiguracoes'
import Leaderboard from './pages/Leaderboard'
import AllFlashcards from './pages/AllFlashcards'
import MeusCursos from './pages/MeusCursos'
import TrilhaAprendizado from './pages/TrilhaAprendizado'
import Recursos from './pages/Recursos'
import ComeceAqui from './pages/ComeceAqui'
import ExemplosDeUso from './pages/ExemplosDeUso'

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-white/30">
        <span className="material-symbols-outlined text-[#8b5cf6]" style={{ fontSize: '32px' }}>progress_activity</span>
        <p className="text-sm">Carregando...</p>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <div key={location.pathname} className="page-transition">
      <Routes location={location}>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />

        {/* Student routes */}
        <Route path="/dashboard"     element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/comece-aqui"   element={<ProtectedRoute><ComeceAqui /></ProtectedRoute>} />
        <Route path="/exemplos-de-uso" element={<ProtectedRoute><ExemplosDeUso /></ProtectedRoute>} />
        <Route path="/apresentacao"  element={<ProtectedRoute><CursoApresentacao /></ProtectedRoute>} />
        <Route path="/cursos"        element={<ProtectedRoute><MeusCursos /></ProtectedRoute>} />
        <Route path="/trilha"        element={<ProtectedRoute><TrilhaAprendizado /></ProtectedRoute>} />
        <Route path="/recursos"      element={<ProtectedRoute><Recursos /></ProtectedRoute>} />
        <Route path="/configuracoes" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/modulo/:id"    element={<ProtectedRoute><ModuloView /></ProtectedRoute>} />
        <Route path="/aula/:id"      element={<ProtectedRoute><AulaView /></ProtectedRoute>} />
        <Route path="/certificado"   element={<ProtectedRoute><Certificate /></ProtectedRoute>} />
        <Route path="/leaderboard"   element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/flashcards"    element={<ProtectedRoute><AllFlashcards /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin"                   element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/modulos"           element={<ProtectedRoute adminOnly><AdminModulos /></ProtectedRoute>} />
        <Route path="/admin/aulas"             element={<ProtectedRoute adminOnly><AdminAulas /></ProtectedRoute>} />
        <Route path="/admin/aulas/nova"        element={<ProtectedRoute adminOnly><AdminAulas /></ProtectedRoute>} />
        <Route path="/admin/usuarios"          element={<ProtectedRoute adminOnly><AdminUsuarios /></ProtectedRoute>} />
        <Route path="/admin/quizzes"           element={<ProtectedRoute adminOnly><AdminQuizzes /></ProtectedRoute>} />
        <Route path="/admin/certificados"      element={<ProtectedRoute adminOnly><AdminCertificados /></ProtectedRoute>} />
        <Route path="/admin/metricas"          element={<ProtectedRoute adminOnly><AdminMetricas /></ProtectedRoute>} />
        <Route path="/admin/configuracoes"     element={<ProtectedRoute adminOnly><AdminConfiguracoes /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <UIProvider>
          <GamificationProvider>
            <BrowserRouter>
              <SearchPalette />
              <PwaInstallBanner />
              <AnimatedRoutes />
            </BrowserRouter>
          </GamificationProvider>
        </UIProvider>
      </DataProvider>
    </AuthProvider>
  )
}
