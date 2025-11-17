"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ClientLogoSliderProps {
  className?: string
}

export function ClientLogoSlider({ className }: ClientLogoSliderProps) {
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Logos (excluded MAP as requested)
  const clients = [
    { name: "Rayat CIII", logo: "/CIII.png" },
    { name: "Agroson", logo: "/Agroson.webp" },
    { name: "Karmaveer Bhaurao Patil", logo: "/KBP.jpg" },
    { name: "YCIS", logo: "/images.png" }
  ]

  const renderRow = (reverse = false, speedSeconds = 30) => {
    const items = [...clients, ...clients]
    return (
      <div
        className={cn(
          "flex items-center gap-8 animate-scroll",
          isHovered && "animation-paused"
        )}
        style={{
          animationDuration: `${speedSeconds}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          // Reverse direction for the second row
          animationDirection: reverse ? ("reverse" as any) : ("normal" as any)
        }}
      >
        {items.map((client, index) => (
          <div
            key={`${client.name}-${index}-${reverse ? "r" : "f"}`}
            className="flex-shrink-0 px-6 py-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 flex items-center justify-center min-w-[220px] h-28 transition-transform duration-300 hover:scale-[1.03]"
            title={client.name}
            aria-label={client.name}
          >
            <Image
              src={client.logo || "/placeholder.svg"}
              alt={client.name}
              width={180}
              height={90}
              className="max-h-16 w-auto object-contain opacity-90 hover:opacity-100 transition duration-300"
              priority={index < 4}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("w-full py-12 overflow-hidden bg-background", className)}>
      <div className="container mb-6 text-center">
        <h2 className="text-2xl font-bold md:text-3xl">Trusted by Organizations</h2>
        <p className="mt-2 text-muted-foreground">
          Join the growing list of organizations that trust YCIS Data Center for their hosting needs
        </p>
      </div>

      <div
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        ref={containerRef}
        aria-label="Client logos carousel"
      >
        {/* Gradient edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />

        {/* Row 1 */}
        {renderRow(false, 28)}

        {/* Spacer */}
        <div className="h-6" />

        {/* Row 2 (reverse, slightly different speed) */}
        {renderRow(true, 34)}
      </div>
    </div>
  )
}