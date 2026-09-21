import React from 'react'

// Bloco base com shimmer
function Bone({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={className}
      style={{
        background: 'linear-gradient(90deg, #1e293b 25%, #283447 50%, #1e293b 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.6s ease infinite',
        borderRadius: 8,
        ...style,
      }}
    />
  )
}

// ── Dashboard Skeleton ────────────────────────────────────────
export function DashboardSkeleton() {
  return (
    <>
      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div className="flex-1 p-8 space-y-8">
        {/* Hero row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Welcome card */}
          <div className="lg:col-span-2 bg-[#1e293b] border border-white/5 rounded-2xl p-6 space-y-4">
            <Bone style={{ height: 28, width: '55%' }} />
            <Bone style={{ height: 14, width: '80%' }} />
            <Bone style={{ height: 14, width: '60%' }} />
            <div className="pt-4 space-y-2">
              <div className="flex justify-between">
                <Bone style={{ height: 10, width: 120 }} />
                <Bone style={{ height: 10, width: 40 }} />
              </div>
              <Bone style={{ height: 10, borderRadius: 99 }} />
              <div className="flex gap-6 pt-2">
                {[0,1,2].map(i => (
                  <div key={i} className="space-y-1">
                    <Bone style={{ height: 24, width: 40 }} />
                    <Bone style={{ height: 10, width: 80 }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Next lesson card */}
          <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-6 space-y-3">
            <Bone style={{ height: 10, width: 80 }} />
            <div className="pt-8 space-y-2">
              <Bone style={{ height: 20, width: '50%', borderRadius: 8 }} />
              <Bone style={{ height: 18, width: '85%' }} />
              <Bone style={{ height: 12, width: '70%' }} />
            </div>
            <div className="pt-4 flex justify-between items-center">
              <Bone style={{ height: 10, width: 40 }} />
              <Bone style={{ height: 30, width: 90, borderRadius: 8 }} />
            </div>
          </div>
        </div>

        {/* Section title */}
        <div className="flex justify-between items-center">
          <Bone style={{ height: 18, width: 160 }} />
          <Bone style={{ height: 12, width: 60 }} />
        </div>

        {/* Module grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#1e293b] border border-white/5 rounded-2xl overflow-hidden">
              <Bone style={{ height: 120, borderRadius: 0 }} />
              <div className="p-4 space-y-2">
                <div className="flex justify-between">
                  <Bone style={{ height: 10, width: 40 }} />
                  <Bone style={{ height: 10, width: 60 }} />
                </div>
                <Bone style={{ height: 16, width: '75%' }} />
                <Bone style={{ height: 10, width: '90%' }} />
                <Bone style={{ height: 6, borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ── Módulo Skeleton ───────────────────────────────────────────
export function ModuloSkeleton() {
  return (
    <>
      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div className="flex-1 p-6 md:p-10 max-w-3xl mx-auto w-full space-y-6">
        {/* Cover */}
        <Bone style={{ height: 200, borderRadius: 16 }} />
        {/* Title block */}
        <div className="space-y-2">
          <Bone style={{ height: 10, width: 60 }} />
          <Bone style={{ height: 28, width: '70%' }} />
          <Bone style={{ height: 14, width: '90%' }} />
          <Bone style={{ height: 14, width: '60%' }} />
        </div>
        {/* Progress */}
        <Bone style={{ height: 8, borderRadius: 99 }} />
        {/* Aulas */}
        <div className="space-y-3 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-[#1e293b] border border-white/5 rounded-xl">
              <Bone style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
              <div className="flex-1 space-y-1.5">
                <Bone style={{ height: 14, width: '65%' }} />
                <Bone style={{ height: 10, width: '40%' }} />
              </div>
              <Bone style={{ width: 30, height: 10 }} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ── Admin Skeleton ────────────────────────────────────────────
export function AdminSkeleton() {
  return (
    <>
      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div className="flex-1 p-8 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#1e293b] border border-white/5 rounded-xl p-5 space-y-3">
              <Bone style={{ width: 32, height: 32, borderRadius: 8 }} />
              <Bone style={{ height: 12, width: '80%' }} />
              <Bone style={{ height: 28, width: '50%' }} />
            </div>
          ))}
        </div>
        {/* Table skeleton */}
        <div className="bg-[#1e293b] border border-white/5 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <Bone style={{ height: 16, width: 140 }} />
          </div>
          <div className="divide-y divide-white/5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Bone style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
                <Bone style={{ height: 12, flex: 1 }} />
                <Bone style={{ height: 10, width: 80 }} />
                <Bone style={{ height: 24, width: 70, borderRadius: 8 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
