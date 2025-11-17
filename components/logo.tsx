import Image from "next/image"
import { useState } from "react"

interface LogoProps {
  width?: number
  height?: number
  className?: string
  alt?: string
}

export function Logo({ width = 40, height = 40, className = "", alt = "YCIS Data Center Logo" }: LogoProps) {
  const [imgError, setImgError] = useState(false)

  if (imgError) {
    // Fallback: Text-based logo if image fails to load
    return (
      <div 
        className={`bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-lg ${className}`}
        style={{ width, height }}
      >
        YCIS
      </div>
    )
  }

  return (
    <Image
      src="/datacenter.png"
      alt={alt}
      width={width}
      height={height}
      className={`${className} object-contain logo-color`}
      onError={() => setImgError(true)}
      priority
    />
  )
}
