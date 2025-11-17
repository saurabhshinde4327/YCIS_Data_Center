"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { DataCenterLayout } from "@/components/datacenter-layout"
import { Upload, X, Image as ImageIcon, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function GalleryAdminPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>("")
  const [images, setImages] = useState<Array<{ id: string; imageUrl: string; title: string }>>([])
  const [isLoadingList, setIsLoadingList] = useState(false)

  const onBrowseClick = () => fileInputRef.current?.click()

  const onFileSelected = (f: File | null) => {
    if (!f) return
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!validTypes.includes(f.type)) {
      toast.error('Invalid file type. Please upload JPG, PNG, WebP, or SVG images.')
      return
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (f.size > maxSize) {
      toast.error('File too large. Maximum size is 5MB.')
      return
    }
    
    setFile(f)
    setTitle(f.name.replace(/\.[^/.]+$/, "")) // Remove extension for title
    const objectUrl = URL.createObjectURL(f)
    setPreview(objectUrl)
  }

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const f = e.dataTransfer.files?.[0]
    if (f) onFileSelected(f)
  }

  const clearSelection = () => {
    setFile(null)
    setPreview("")
    setTitle("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDirectUpload = async () => {
    if (!file) {
      toast.error('Please select an image first')
      return
    }
    
    if (!title.trim()) {
      toast.error('Please enter a title for the image')
      return
    }
    
    try {
      setIsUploading(true)
      setUploadProgress('Preparing image...')
      
      // Step 1: Upload the file
      const formData = new FormData()
      formData.append('file', file)
      
      setUploadProgress(`Converting image (${(file.size / 1024 / 1024).toFixed(2)} MB)...`)
      const uploadRes = await fetch('/api/upload', { 
        method: 'POST', 
        body: formData 
      })
      
      const uploadData = await uploadRes.json()
      
      if (!uploadRes.ok || !uploadData?.url) {
        throw new Error(uploadData?.error || 'Failed to upload image')
      }
      
      // Step 2: Save to gallery database
      setUploadProgress('Saving to database...')
      const galleryRes = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          imageUrl: uploadData.url,
          category: 'General',
          tags: [],
          isVisible: true,
          uploadedBy: 'Admin'
        })
      })
      
      if (!galleryRes.ok) {
        const errorData = await galleryRes.json()
        throw new Error(errorData.error || 'Failed to save image to gallery')
      }
      
      setUploadProgress('Complete!')
      
      // Show compression info if available
      const compressionInfo = uploadData.compressionRatio 
        ? ` (Compressed by ${uploadData.compressionRatio})` 
        : ''
      toast.success(`✅ "${title}" added to gallery successfully!${compressionInfo}`)
      
      // Clear form and refresh list
      clearSelection()
      setUploadProgress('')
      await fetchImages()
      
    } catch (err) {
      console.error('Upload error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to upload image')
      setUploadProgress('')
    } finally {
      setIsUploading(false)
    }
  }

  const fetchImages = async () => {
    try {
      setIsLoadingList(true)
      const res = await fetch('/api/gallery')
      if (!res.ok) throw new Error('Failed to load images')
      const data = await res.json()
      // Show newest first
      setImages((data || []).reverse())
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load images')
    } finally {
      setIsLoadingList(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image from gallery?')) return
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete image')
      setImages(prev => prev.filter(img => img.id !== id))
      toast.success('Image deleted')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete image')
    }
  }

  useEffect(() => {
    fetchImages()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <DataCenterLayout 
            variant="header"
            title="Gallery Management"
            subtitle="Upload and manage gallery images"
          />
        </div>

        {/* Info Alert */}
        <Alert className="max-w-2xl mx-auto mb-6 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>Optimized Upload:</strong> Images are automatically compressed and converted to WebP format for faster loading. 
            Large images are resized to 1920px max. Base64 encoded for serverless compatibility. Supports JPG, PNG, WebP, and SVG formats.
          </AlertDescription>
        </Alert>
        
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Upload className="h-6 w-6 text-blue-600" />
            Upload New Image
          </h2>
          
          {!preview ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer"
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' }}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onClick={onBrowseClick}
            >
              <div className="text-center">
                <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Drag & drop your image here
                </p>
                <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Image
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  Supports: JPG, JPEG, PNG, WebP, SVG (Max 5MB)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                hidden
                onChange={(e) => onFileSelected(e.target.files?.[0] || null)}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={clearSelection}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="flex justify-center">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="max-h-80 rounded-lg object-contain" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  Image Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for this image"
                  className="text-base"
                  disabled={isUploading}
                />
              </div>

              {uploadProgress && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700 font-medium text-center">{uploadProgress}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleDirectUpload}
                  disabled={!file || !title.trim() || isUploading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      {uploadProgress || 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 mr-2" />
                      Upload to Gallery
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={clearSelection}
                  disabled={isUploading}
                  className="h-12"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

        </div>

        {/* Existing Gallery Images */}
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-blue-600" />
            Gallery Images ({images.length})
          </h2>
          
          {isLoadingList ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading gallery images...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-16">
              <ImageIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-600 font-medium">No images in gallery yet</p>
              <p className="text-sm text-gray-400 mt-2">Upload your first image to get started!</p>
            </div>
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {images.map(img => (
                  <div key={img.id} className="group relative border-2 border-gray-200 rounded-lg overflow-hidden bg-white hover:border-blue-400 transition-all hover:shadow-lg">
                    <div className="relative w-full h-48">
                      <Image 
                        src={img.imageUrl} 
                        alt={img.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized={img.imageUrl.startsWith('data:')}
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-gray-900 truncate mb-2" title={img.title}>
                        {img.title}
                      </p>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDelete(img.id)}
                        className="w-full"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
