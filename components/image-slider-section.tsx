"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

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

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (sliderImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % sliderImages.length)
      }, 5000) // Auto-slide every 5 seconds
      return () => clearInterval(interval)
    }
  }, [sliderImages.length])

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
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        </div>
      </section>
    )
  }

  if (sliderImages.length === 0 && !dataCenterDesc) {
    return null
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Data Center Description */}
          <div className="flex flex-col justify-center">
            {dataCenterDesc ? (
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {dataCenterDesc.title}
                </h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {dataCenterDesc.description}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  About Our Data Center
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Our state-of-the-art data center provides reliable, secure, and high-performance hosting solutions. 
                  With cutting-edge infrastructure and 24/7 monitoring, we ensure maximum uptime and optimal performance 
                  for all your hosting needs.
                </p>
              </div>
            )}
          </div>

          {/* Right Side - Image Slider */}
          {sliderImages.length > 0 && (
            <div className="relative">
              <Card className="overflow-hidden">
                <div className="relative aspect-video bg-gray-100">
                  {sliderImages.map((image, index) => (
                    <div
                      key={image.id}
                      className={`absolute inset-0 transition-opacity duration-500 ${
                        index === currentIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <img
                        src={image.imageUrl}
                        alt={image.description || `Slide ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg'
                        }}
                      />
                    </div>
                  ))}
                  
                  {/* Navigation Buttons */}
                  {sliderImages.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={goToPrevious}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={goToNext}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </>
                  )}

                  {/* Dots Indicator */}
                  {sliderImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {sliderImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToSlide(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentIndex
                              ? 'bg-white w-8'
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Description Below Image */}
                {sliderImages[currentIndex]?.description && (
                  <CardContent className="p-4 bg-white">
                    <p className="text-sm md:text-base text-gray-700 text-center">
                      {sliderImages[currentIndex].description}
                    </p>
                  </CardContent>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

