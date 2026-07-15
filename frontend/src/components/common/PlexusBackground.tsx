/**
 * PlexusBackground — Interactive canvas node-and-edge animation.
 * Extracted from LoginPage/RegisterPage to eliminate 120-line duplication.
 */
import { useEffect, useRef } from 'react'

export function PlexusBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Node configuration
    const numNodes = Math.min(100, Math.floor((width * height) / 15000))
    const nodes: Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
    }> = []

    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 1,
      })
    }

    // Mouse tracking
    const mouse = { x: -1000, y: -1000 }
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    const handleMouseLeave = () => {
      mouse.x = -1000
      mouse.y = -1000
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.lineWidth = 0.5

      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i]

        // Connect to other nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j]
          const dx = n1.x - n2.x
          const dy = n1.y - n2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.15
            ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`
            ctx.beginPath()
            ctx.moveTo(n1.x, n1.y)
            ctx.lineTo(n2.x, n2.y)
            ctx.stroke()
          }
        }

        // Connect to mouse
        const mdx = n1.x - mouse.x
        const mdy = n1.y - mouse.y
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy)
        if (mdist < 150) {
          const malpha = (1 - mdist / 150) * 0.25
          ctx.strokeStyle = `rgba(124, 58, 237, ${malpha})`
          ctx.beginPath()
          ctx.moveTo(n1.x, n1.y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.stroke()
        }

        // Move node
        n1.x += n1.vx
        n1.y += n1.vy

        // Boundary bounce
        if (n1.x < 0 || n1.x > width) n1.vx *= -1
        if (n1.y < 0 || n1.y > height) n1.vy *= -1

        // Draw node
        ctx.fillStyle = n1.vx > 0 ? 'rgba(0, 229, 255, 0.4)' : 'rgba(124, 58, 237, 0.4)'
        ctx.beginPath()
        ctx.arc(n1.x, n1.y, n1.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none block z-0"
    />
  )
}
