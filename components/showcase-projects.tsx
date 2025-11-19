"use client"

import { useState, useEffect } from "react"
import { Rocket, ExternalLink } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Image from "next/image"

interface ShowcaseProject {
  id: string
  name: string
  description: string
  logo: string
  projectImage?: string
  url?: string
  category: string
  isActive: boolean
}

export function ShowcaseProjects() {
  const [projects, setProjects] = useState<ShowcaseProject[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/showcase-projects?active=true')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Error fetching showcase projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || projects.length === 0) {
    return null
  }

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/abstract_black_background.jpg"
          alt="Data Center Background"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-blue-900/60 to-indigo-900/70"></div>
        {/* Additional subtle overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Our Data Center Projects
          </h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto drop-shadow-md">
            Explore the innovative applications and systems hosted in our state-of-the-art data center
          </p>
        </div>

        {/* Mobile Slider View */}
        <div className="block md:hidden">
          <Carousel 
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {projects.map((project) => (
                <CarouselItem key={project.id}>
                  <div className="p-1">
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-white/20">
                      {/* Project Image/Screenshot */}
                      {project.projectImage ? (
                        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                          <img
                            src={project.projectImage}
                            alt={project.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        /* Fallback to Logo Only or Default */
                        <div className="flex justify-center items-center h-48 bg-gradient-to-br from-blue-50 to-indigo-50">
                          {project.logo ? (
                            <img
                              src={project.logo}
                              alt={project.name}
                              className="h-24 w-auto object-contain"
                            />
                          ) : (
                            <div className="text-center">
                              <div className="text-4xl font-bold text-gray-400 mb-2">
                                {project.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="text-sm text-gray-500">No Image</div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="p-6">
                        {/* Category Badge */}
                        <div className="mb-3">
                          <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                            {project.category}
                          </span>
                        </div>

                        {/* Project Name */}
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                          {project.name}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3 min-h-[60px]">
                          {project.description}
                        </p>

                        {/* Visit Project Button */}
                        <div className="mt-4">
                          {project.url ? (
                            <a
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Visit Project
                            </a>
                          ) : (
                            <button
                              disabled
                              className="inline-flex items-center justify-center w-full px-4 py-2 bg-gray-300 text-gray-500 font-medium text-sm rounded-lg cursor-not-allowed"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              No Link Available
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Bottom Accent */}
                      <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>

        {/* Desktop Grid View */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-white/20"
            >
              {/* Project Image/Screenshot */}
              {project.projectImage ? (
                <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                  <img
                    src={project.projectImage}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                /* Fallback to Logo Only or Default */
                <div className="flex justify-center items-center h-48 bg-gradient-to-br from-blue-50 to-indigo-50">
                  {project.logo ? (
                    <img
                      src={project.logo}
                      alt={project.name}
                      className="h-24 w-auto object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-400 mb-2">
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-500">No Image</div>
                    </div>
                  )}
                </div>
              )}

              <div className="p-6">
                {/* Category Badge */}
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                    {project.category}
                  </span>
                </div>

                {/* Project Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                  {project.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-3 min-h-[60px]">
                  {project.description}
                </p>

                {/* Visit Project Button */}
                <div className="mt-4">
                  {project.url ? (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Project
                    </a>
                  ) : (
                    <button
                      disabled
                      className="inline-flex items-center justify-center w-full px-4 py-2 bg-gray-300 text-gray-500 font-medium text-sm rounded-lg cursor-not-allowed"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      No Link Available
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom Accent */}
              <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

