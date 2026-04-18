'use client'

import { useEffect, useRef } from 'react'

const CELL = 44       // grid spacing in px
const INFLUENCE = 120 // mouse influence radius
const STRENGTH = 30   // max displacement
const WAVE_AMP = 2    // subtle idle wave amplitude

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf: number
    let W = 0
    let H = 0
    let t = 0

    const resize = () => {
      const parent = canvas.parentElement
      W = canvas.width = parent ? parent.offsetWidth : window.innerWidth
      H = canvas.height = parent ? parent.offsetHeight : 440
    }
    resize()

    // Track mouse on window so it works even when cursor is over form elements
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 } }

    window.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)
    window.addEventListener('resize', resize)

    // Pre-compute grid dimensions
    const getGrid = () => ({
      cols: Math.ceil(W / CELL) + 2,
      rows: Math.ceil(H / CELL) + 2,
    })

    // Get displaced (x, y) for a grid intersection
    const getPoint = (col: number, row: number): [number, number] => {
      const bx = (col - 1) * CELL
      const by = (row - 1) * CELL

      // Idle wave — every point has a subtle float
      const wave =
        Math.sin(col * 0.6 + t) * WAVE_AMP +
        Math.cos(row * 0.5 + t * 0.7) * WAVE_AMP

      const dx = bx - mouseRef.current.x
      const dy = by - mouseRef.current.y
      const d = Math.hypot(dx, dy)

      let ox = wave
      let oy = wave

      if (d < INFLUENCE && d > 0) {
        // Smooth falloff: stronger near cursor, fades at INFLUENCE radius
        const factor = Math.pow((INFLUENCE - d) / INFLUENCE, 2) * STRENGTH
        ox += (dx / d) * factor
        oy += (dy / d) * factor
      }

      return [bx + ox, by + oy]
    }

    const frame = () => {
      t += 0.012
      ctx.clearRect(0, 0, W, H)

      const { cols, rows } = getGrid()

      ctx.strokeStyle = 'rgba(255,255,255,0.13)'
      ctx.lineWidth = 0.8

      // Horizontal lines
      for (let row = 0; row < rows; row++) {
        ctx.beginPath()
        for (let col = 0; col < cols; col++) {
          const [x, y] = getPoint(col, row)
          col === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      // Vertical lines
      for (let col = 0; col < cols; col++) {
        ctx.beginPath()
        for (let row = 0; row < rows; row++) {
          const [x, y] = getPoint(col, row)
          row === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      raf = requestAnimationFrame(frame)
    }

    frame()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  )
}
