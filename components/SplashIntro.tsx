'use client'

import { useState, useEffect } from 'react'

export default function SplashIntro() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
    }, 4000) // Show splash for 4 seconds
    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white animate-fadeIn p-4">
      <img
        src="/datacenter.png"
        alt="YCIS Data Center"
        className="w-32 h-32 sm:w-40 sm:h-40 mb-4 animate-bounce-slow"
      />
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900 text-center animate-fadeInSlow">
        YCIS Data & Technology Center
      </h1>

      {/* Optional loading spinner for effect */}
      <div className="mt-4 border-4 border-blue-300 border-t-blue-800 rounded-full w-8 h-8 animate-spin sm:w-10 sm:h-10" />
    </div>
  )
}
