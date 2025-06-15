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

  // Sample client logos - replace with actual client logos
  const clients = [
    { name: "Rayat CIII", logo: "/CIII.png"},
    { name: "Agroson", logo: "/Agroson.webp" },
    { name: "Karmaveer Bhaurao Patil", logo: "/KBP.jpg" },
    { name: "YCIS", logo: "/images.png" },
  ]

  // Duplicate the clients array to create a seamless loop
  const allClients = [...clients, ...clients]

  return (
    <div className={cn("w-full py-10 overflow-hidden bg-background", className)}>
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
      >
        <div
          className={cn("flex items-center gap-8 animate-scroll", isHovered && "animation-paused")}
          style={{
            animationDuration: "30s",
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
          }}
        >
          {allClients.map((client, index) => (
            <div
              key={`${client.name}-${index}`}
              className="flex-shrink-0 px-6 py-4 bg-white rounded-lg shadow-sm flex items-center justify-center min-w-[220px] h-28"
            >
              <Image
                src={client.logo || "/placeholder.svg"}
                alt={client.name}
                width={150}
                height={75}
                className="max-h-16 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}