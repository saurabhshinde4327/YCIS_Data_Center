"use client"

import React from "react"
import Image from "next/image"

interface DataCenterLayoutProps {
  title?: string
  subtitle?: string
  description?: string
  showLogo?: boolean
  variant?: "header" | "footer" | "sidebar" | "hero"
  className?: string
}

export function DataCenterLayout({
  title = "YCIS DATA CENTER",
  subtitle = "Satara",
  description = "Professional Data Center Services",
  showLogo = true,
  variant = "header",
  className = ""
}: DataCenterLayoutProps) {
  
  const getVariantStyles = () => {
    switch (variant) {
      case "header":
        return {
          container: "flex items-center space-x-3 py-2",
          logo: "h-10 w-10",
          title: "text-xl font-bold text-blue-900",
          subtitle: "text-sm text-gray-600 font-medium",
          description: "text-xs text-gray-500"
        }
      case "footer":
        return {
          container: "flex flex-col items-center space-y-2 py-4",
          logo: "h-16 w-16",
          title: "text-2xl font-bold text-blue-900",
          subtitle: "text-base text-gray-600 font-medium",
          description: "text-sm text-gray-500"
        }
      case "sidebar":
        return {
          container: "flex flex-col items-center space-y-3 py-6",
          logo: "h-12 w-12",
          title: "text-lg font-bold text-blue-900 text-center",
          subtitle: "text-sm text-gray-600 font-medium text-center",
          description: "text-xs text-gray-500 text-center"
        }
      case "hero":
        return {
          container: "flex flex-col items-center space-y-4 py-8",
          logo: "h-20 w-20",
          title: "text-3xl font-bold text-blue-900",
          subtitle: "text-xl text-gray-600 font-medium",
          description: "text-base text-gray-500"
        }
      default:
        return {
          container: "flex items-center space-x-3",
          logo: "h-10 w-10",
          title: "text-xl font-bold text-blue-900",
          subtitle: "text-sm text-gray-600 font-medium",
          description: "text-xs text-gray-500"
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div className={`${styles.container} ${className}`}>
      {showLogo && (
        <div className="relative flex-shrink-0">
          <div className={`${styles.logo} relative overflow-hidden rounded-lg shadow-lg`}>
            <Image
              src="/datacenter.png"
              alt="YCIS Data Center Logo"
              fill
              className="object-contain logo-color"
              priority
            />
          </div>
          {/* Status indicator */}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
        </div>
      )}
      
      <div className="flex flex-col space-y-1">
        <h1 className={styles.title}>
          {title}
        </h1>
        {subtitle && (
          <p className={styles.subtitle}>
            {subtitle}
          </p>
        )}
        {description && (
          <p className={styles.description}>
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

// PDF-style layout component for documents/reports
export function DataCenterPDFLayout({
  title = "YCIS DATA CENTER",
  subtitle = "Satara",
  address = "Satara, Maharashtra, India",
  contact = "Contact: +91-XXX-XXXX-XXX",
  email = "Email: info@ycisdatacenter.com",
  className = ""
}: {
  title?: string
  subtitle?: string
  address?: string
  contact?: string
  email?: string
  className?: string
}) {
  return (
    <div className={`bg-white border-b-2 border-blue-900 pb-4 ${className}`}>
      {/* Header with logo and title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="h-16 w-16 relative overflow-hidden rounded-lg shadow-md">
              <Image
                src="/datacenter.png"
                alt="YCIS Data Center Logo"
                fill
                className="object-contain logo-color"
                priority
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-blue-900 uppercase tracking-wide">
              {title}
            </h1>
            <p className="text-lg text-gray-700 font-semibold">
              {subtitle}
            </p>
          </div>
        </div>
        
        {/* Contact information */}
        <div className="text-right text-sm text-gray-600">
          <p className="font-medium">{address}</p>
          <p>{contact}</p>
          <p>{email}</p>
        </div>
      </div>
      
      {/* Decorative line */}
      <div className="h-1 bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 rounded-full"></div>
    </div>
  )
}

// Compact header for forms and documents
export function DataCenterCompactHeader({
  title = "YCIS DATA CENTER",
  subtitle = "Satara",
  className = ""
}: {
  title?: string
  subtitle?: string
  className?: string
}) {
  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="h-12 w-12 relative overflow-hidden rounded-lg shadow-sm">
            <Image
              src="/datacenter.png"
              alt="YCIS Data Center Logo"
              fill
              className="object-contain logo-color"
              priority
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
        </div>
        
        <div>
          <h2 className="text-lg font-bold text-blue-900">
            {title}
          </h2>
          <p className="text-sm text-gray-600 font-medium">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  )
}

// Watermark style for background
export function DataCenterWatermark({
  opacity = 0.1,
  className = ""
}: {
  opacity?: number
  className?: string
}) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity }}
      >
        <div className="relative">
          <div className="h-32 w-32 relative">
            <Image
              src="/datacenter.png"
              alt="YCIS Data Center Logo"
              fill
              className="object-contain logo-color"
            />
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-2xl font-bold text-blue-900 whitespace-nowrap">
              YCIS DATA CENTER
            </p>
            <p className="text-lg text-gray-600 font-medium">
              Satara
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
