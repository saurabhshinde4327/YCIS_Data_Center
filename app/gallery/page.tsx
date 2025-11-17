"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Grid, List, Eye, X, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface GalleryImage {
  id: string
  title: string
  description?: string
  imageUrl: string
  category: string
  tags: string[]
  isVisible: boolean
  createdAt: string
  updatedAt: string
  uploadedBy: string
  views: number
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    fetchImages()
  }, [])

  useEffect(() => {
    filterImages()
  }, [images, searchTerm, selectedCategory])

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/gallery')
      if (response.ok) {
        const data = await response.json()
        const visibleImages = data.filter((img: GalleryImage) => img.isVisible)
        setImages(visibleImages)
        
        // Extract unique categories
        const uniqueCategories = [...new Set(visibleImages.map((img: GalleryImage) => img.category))]
        setCategories(uniqueCategories)
      }
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterImages = () => {
    let filtered = images

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(img => 
        img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(img => img.category === selectedCategory)
    }

    setFilteredImages(filtered)
  }

  const incrementViews = async (imageId: string) => {
    try {
      await fetch(`/api/gallery/${imageId}/view`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Error incrementing views:', error)
    }
  }

  const handleImageClick = (image: GalleryImage, index: number) => {
    setSelectedImage(image)
    setCurrentImageIndex(index)
    incrementViews(image.id)
  }

  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : filteredImages.length - 1
      setCurrentImageIndex(newIndex)
      setSelectedImage(filteredImages[newIndex])
    } else {
      const newIndex = currentImageIndex < filteredImages.length - 1 ? currentImageIndex + 1 : 0
      setCurrentImageIndex(newIndex)
      setSelectedImage(filteredImages[newIndex])
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Back Button */}
      <div className="bg-blue-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/">
            <Button variant="ghost" className="text-blue-700 hover:text-blue-900 hover:bg-blue-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Simple Title Only */}
      <div className="bg-blue-50">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-blue-900 text-center">Gallery</h1>
        </div>
      </div>

      {/* Clean Image Grid */}
      <div className="container mx-auto px-6 pb-12">
        {filteredImages.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Image
                src="/placeholder.svg"
                alt="No images found"
                width={100}
                height={100}
                className="mx-auto mb-4 opacity-50"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No images found</h3>
            <p className="text-gray-500">
              No images have been added to the gallery yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredImages.map((image, index) => (
              <div
                key={image.id}
                className="group cursor-pointer relative overflow-hidden rounded-lg shadow-lg"
                onClick={() => handleImageClick(image, index)}
              >
                <Image
                  src={image.imageUrl}
                  alt={image.title}
                  width={400}
                  height={300}
                  className="w-full h-auto object-cover group-hover:opacity-90 transition-opacity duration-300"
                  unoptimized={image.imageUrl.startsWith('data:')}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clean Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0 bg-white">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 z-10 text-gray-900 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
          
          {selectedImage && (
            <div className="relative bg-white">
              <Image
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                width={800}
                height={600}
                className="w-full h-auto max-h-[80vh] object-contain"
                unoptimized={selectedImage.imageUrl.startsWith('data:')}
              />
              
              {/* Navigation Arrows */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateImage('prev')}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-900 hover:bg-gray-100"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateImage('next')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-900 hover:bg-gray-100"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
              
              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/80 text-gray-900 px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} of {filteredImages.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
