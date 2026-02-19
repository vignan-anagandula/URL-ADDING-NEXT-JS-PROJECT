'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabaseBrowser'

export default function LoginPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const supabase = createClient()

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = canvas.width = window.innerWidth
    let height = canvas.height = window.innerHeight

    // Create a larger starfield to fill full screen
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.2,
      speed: Math.random() * 0.5 + 0.05,
      alpha: Math.random() * 0.6 + 0.4 // lighter, more visible
    }))

    const animate = () => {
      // Dark background
      ctx.fillStyle = '#0a0f1a'
      ctx.fillRect(0, 0, width, height)

      for (let star of stars) {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${star.alpha})`
        ctx.fill()

        star.y += star.speed
        if (star.y > height) star.y = 0
      }

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="relative w-full min-h-screen overflow-hidden font-inter">
      {/* Starfield canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Dark overlay with partial opacity */}
      <div className="absolute inset-0 bg-[#0a0f1a]/50 backdrop-blur-[15px]" />

      {/* Centered login card */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div
          className="flex flex-col items-center gap-8 rounded-2xl p-12 sm:p-16 w-full max-w-md"
          style={{
            background: 'rgba(50,60,85,0.85)', // lighter than background
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
          }}
        >
          <h1 className="text-2xl font-bold text-white/90 tracking-wide text-center">
            Abstrabit Project
          </h1>

          <div className="w-full h-[1px] bg-white/20" />

          <button
            className="flex w-full items-center justify-center gap-3 rounded-lg px-6 py-3 text-white font-medium transition-all duration-200 hover:bg-white/10"
            onClick={login}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M43.611 20.083H42V20H24v8h11.303C33.9 32.657 29.332 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
              <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
              <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.311 0-9.863-3.323-11.285-7.934l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
              <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-white/60">
            Sign in or create an account
          </p>
        </div>
      </div>
    </div>
  )
}
