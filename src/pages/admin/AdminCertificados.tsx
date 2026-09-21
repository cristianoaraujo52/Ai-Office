import React from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'
import { mockUsers } from '../../lib/mockData'

const mockCerts = [
  { id: '1', user_nome: 'João Silva', email: 'aluno@iaoffice.com', data: '2024-05-24', codigo: 'IA-2024-JS-8821', carga: 40 },
  { id: '2', user_nome: 'Maria Costa', email: 'maria@iaoffice.com', data: '2024-05-20', codigo: 'IA-2024-MC-3341', carga: 40 },
]

export default function AdminCertificados() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <Sidebar isAdmin />
      <div className="flex-1 ml-0 md:ml-[280px] flex flex-col">
        <TopBar title="Certificados" subtitle="Certificados emitidos pela plataforma" />
        <main className="flex-1 p-8 fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { icon: 'workspace_premium', label: 'Total Emitidos', value: String(mockCerts.length) },
              { icon: 'schedule', label: 'Este Mês', value: String(mockCerts.length) },
              { icon: 'verified', label: 'Taxa de Conclusão', value: '18%' },
            ].map(s => (
              <div key={s.label} className="bg-[#1e293b] border border-white/5 rounded-xl p-5 flex items-center gap-4">
                <div className="p-2.5 bg-amber-500/10 rounded-lg">
                  <span className="material-symbols-outlined text-amber-400" style={{ fontSize: '22px' }}>{s.icon}</span>
                </div>
                <div>
                  <p className="text-white/40 text-xs">{s.label}</p>
                  <p className="text-white font-bold text-xl">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#1e293b] border border-white/5 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h3 className="text-white font-semibold text-sm">Certificados Emitidos</h3>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/3 border-b border-white/5">
                  {['Aluno', 'E-mail', 'Data', 'Carga', 'Código', 'Ações'].map(h => (
                    <th key={h} className="py-3 px-5 text-white/30 text-xs uppercase tracking-wider font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/3">
                {mockCerts.map(c => (
                  <tr key={c.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold">
                          {c.user_nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <span className="text-white text-sm">{c.user_nome}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-white/50 text-sm">{c.email}</td>
                    <td className="py-4 px-5 text-white/50 text-sm">
                      {new Date(c.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-4 px-5 text-white/50 text-sm">{c.carga}h</td>
                    <td className="py-4 px-5">
                      <code className="text-[#8b5cf6] text-xs bg-[#8b5cf6]/10 px-2 py-0.5 rounded">{c.codigo}</code>
                    </td>
                    <td className="py-4 px-5">
                      <Link to="/certificado" className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all inline-flex">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}
