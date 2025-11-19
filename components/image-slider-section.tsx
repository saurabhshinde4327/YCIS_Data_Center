"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Shield, Zap, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface SliderImage {
  id: string
  imageUrl: string
  description: string
}

interface DataCenterDescription {
  id: string
  title: string
  description: string
}

export function ImageSliderSection() {
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([])
  const [dataCenterDesc, setDataCenterDesc] = useState<DataCenterDescription | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (sliderImages.length > 0 && !isHovered) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % sliderImages.length)
      }, 5000) // Auto-slide every 5 seconds
      return () => clearInterval(interval)
    }
  }, [sliderImages.length, isHovered])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [sliderRes, descRes] = await Promise.all([
        fetch('/api/slider'),
        fetch('/api/datacenter-description')
      ])
      
      if (sliderRes.ok) {
        const sliderData = await sliderRes.json()
        setSliderImages(sliderData || [])
      }
      
      if (descRes.ok) {
        const descData = await descRes.json()
        setDataCenterDesc(descData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + sliderImages.length) % sliderImages.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sliderImages.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-blue-300 opacity-20"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (sliderImages.length === 0 && !dataCenterDesc) {
    return null
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Data Center Description */}
          <div className="flex flex-col justify-center space-y-6 animate-slide-in-left">
            {dataCenterDesc ? (
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent leading-tight">
                  {dataCenterDesc.title}
                </h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                    {dataCenterDesc.description}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent leading-tight">
                  About Our Data Center
                </h2>
                <p className="text-gray-700 leading-relaxed text-lg">
                  Our state-of-the-art data center provides reliable, secure, and high-performance hosting solutions. 
                  With cutting-edge infrastructure and 24/7 monitoring, we ensure maximum uptime and optimal performance 
                  for all your hosting needs.
                </p>
              </div>
            )}

            {/* Feature Icons */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                <Shield className="h-6 w-6 text-blue-600 mb-2" />
                <span className="text-xs font-semibold text-gray-700 text-center">Secure</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                <Zap className="h-6 w-6 text-blue-600 mb-2" />
                <span className="text-xs font-semibold text-gray-700 text-center">Fast</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                <TrendingUp className="h-6 w-6 text-blue-600 mb-2" />
                <span className="text-xs font-semibold text-gray-700 text-center">Reliable</span>
              </div>
            </div>
          </div>

          {/* Right Side - Image Slider */}
          {sliderImages.length > 0 && (
            <div 
              className="relative animate-slide-in-right"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Frame Container */}
              <div className="relative p-4 bg-gradient-to-br from-blue-100/50 via-white to-purple-100/50 rounded-2xl shadow-2xl border-4 border-blue-200/60">
                {/* Inner Frame Shadow */}
                <div className="absolute inset-0 rounded-xl border-2 border-white/50 shadow-inner pointer-events-none"></div>
                
                {/* Corner Decorations */}
                <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                
                <Card className="overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm relative z-10">
                <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 group">
                  {sliderImages.map((image, index) => (
                    <div
                      key={image.id}
                      className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                        index === currentIndex 
                          ? 'opacity-100 scale-100 z-10' 
                          : 'opacity-0 scale-105 z-0'
                      }`}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={image.imageUrl}
                          alt={image.description || `Slide ${index + 1}`}
                          fill
                          className="object-cover"
                          priority={index === currentIndex}
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg'
                          }}
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Navigation Buttons */}
                  {sliderImages.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md hover:bg-white border-0 shadow-lg hover:scale-110 transition-all duration-300 z-20 opacity-0 group-hover:opacity-100"
                        onClick={goToPrevious}
                        aria-label="Previous slide"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-800" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md hover:bg-white border-0 shadow-lg hover:scale-110 transition-all duration-300 z-20 opacity-0 group-hover:opacity-100"
                        onClick={goToNext}
                        aria-label="Next slide"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-800" />
                      </Button>
                    </>
                  )}

                  {/* Enhanced Dots Indicator */}
                  {sliderImages.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                      {sliderImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToSlide(index)}
                          className={`relative transition-all duration-300 rounded-full ${
                            index === currentIndex
                              ? 'w-10 h-2 bg-white shadow-lg'
                              : 'w-2 h-2 bg-white/60 hover:bg-white/80 hover:scale-125'
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        >
                          {index === currentIndex && (
                            <span className="absolute inset-0 rounded-full bg-white animate-pulse"></span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Slide Counter */}
                  {sliderImages.length > 1 && (
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full z-20">
                      {currentIndex + 1} / {sliderImages.length}
                    </div>
                  )}
                </div>
                
                {/* Enhanced Description Below Image */}
                {sliderImages[currentIndex]?.description && (
                  <CardContent className="p-6 bg-gradient-to-r from-white to-gray-50 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                      <p className="text-sm md:text-base text-gray-700 font-medium text-center w-full">
                        {sliderImages[currentIndex].description}
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
              
              {/* Frame Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/10 via-transparent to-purple-400/10 pointer-events-none -z-0"></div>
              </div>

              {/* Decorative Corner Accents */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl -z-10"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-2xl -z-10"></div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

