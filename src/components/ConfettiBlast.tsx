import React, { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  rotation: number
  rotationSpeed: number
  opacity: number
  shape: 'rect' | 'circle'
}

const COLORS = ['#8b5cf6', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#60a5fa', '#ffffff']

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a)
}

export default function ConfettiBlast({ onDone }: { onDone?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Particle[] = Array.from({ length: 160 }, () => ({
      x: randomBetween(canvas.width * 0.2, canvas.width * 0.8),
      y: randomBetween(-60, -10),
      vx: randomBetween(-4, 4),
      vy: randomBetween(3, 9),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: randomBetween(6, 14),
      rotation: randomBetween(0, Math.PI * 2),
      rotationSpeed: randomBetween(-0.12, 0.12),
      opacity: 1,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }))

    let startTime: number | null = null
    const DURATION = 3200

    function draw(ts: number) {
      if (!ctx || !canvas) return
      if (!startTime) startTime = ts
      const elapsed = ts - startTime

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles) {
        p.x += p.vx
        p.vy += 0.18
        p.y += p.vy
        p.rotation += p.rotationSpeed
        p.opacity = Math.max(0, 1 - (p.y / (canvas.height * 1.1)))

        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.fillStyle = p.color

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()
      }

      if (elapsed < DURATION) {
        rafRef.current = requestAnimationFrame(draw)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        onDone?.()
      }
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [onDone])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  )
}
