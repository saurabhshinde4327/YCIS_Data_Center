"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DataCenterLayout } from "@/components/datacenter-layout"
import { Plus, Edit, Trash2, Image as ImageIcon, Upload, X, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

interface SliderImage {
  id: string
  imageUrl: string
  description: string
  displayOrder: number
  isActive: boolean
}

export default function SliderManagementPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<SliderImage[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<SliderImage | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>("")
  const [formData, setFormData] = useState({
    imageUrl: "",
    description: "",
    displayOrder: 0
  })

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/slider')
      if (!response.ok) throw new Error('Failed to fetch images')
      const data = await response.json()
      setImages(data || [])
    } catch (error) {
      console.error('Error fetching images:', error)
      toast.error('Failed to load slider images')
    } finally {
      setLoading(false)
    }
  }

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
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleOpenDialog = (image?: SliderImage) => {
    if (image) {
      setEditingImage(image)
      setFormData({
        imageUrl: image.imageUrl,
        description: image.description,
        displayOrder: image.displayOrder
      })
      setPreview(image.imageUrl)
      setFile(null)
    } else {
      setEditingImage(null)
      setFormData({
        imageUrl: "",
        description: "",
        displayOrder: images.length
      })
      setPreview("")
      setFile(null)
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingImage(null)
    setFile(null)
    setPreview("")
    setFormData({
      imageUrl: "",
      description: "",
      displayOrder: 0
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsUploading(true)
      let imageUrl = formData.imageUrl

      // If editing and no new file, use existing imageUrl
      if (editingImage && !file) {
        imageUrl = editingImage.imageUrl
      } else if (file) {
        // Upload new file
        setUploadProgress('Uploading image...')
        const uploadFormData = new FormData()
        uploadFormData.append('file', file)
        
        const uploadRes = await fetch('/api/upload', { 
          method: 'POST', 
          body: uploadFormData 
        })
        
        const uploadData = await uploadRes.json()
        
        if (!uploadRes.ok || !uploadData?.url) {
          throw new Error(uploadData?.error || 'Failed to upload image')
        }
        
        imageUrl = uploadData.url
        setUploadProgress('Saving...')
      } else if (!editingImage && !file && !imageUrl) {
        toast.error('Please select an image file')
        setIsUploading(false)
        return
      }

      if (editingImage) {
        const response = await fetch(`/api/slider/${editingImage.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            imageUrl
          })
        })
        if (!response.ok) throw new Error('Failed to update')
        toast.success('Slider image updated successfully')
      } else {
        const response = await fetch('/api/slider', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            imageUrl
          })
        })
        if (!response.ok) throw new Error('Failed to create')
        toast.success('Slider image added successfully')
      }
      
      handleCloseDialog()
      fetchImages()
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save slider image')
    } finally {
      setIsUploading(false)
      setUploadProgress("")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return
    try {
      const response = await fetch(`/api/slider/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success('Image deleted')
      fetchImages()
    } catch (error) {
      toast.error('Failed to delete image')
    }
  }

  const toggleActive = async (image: SliderImage) => {
    try {
      await fetch(`/api/slider/${image.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !image.isActive })
      })
      toast.success('Status updated')
      fetchImages()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <DataCenterLayout 
          variant="header"
          title="Image Slider Management"
          subtitle="Manage slider images and descriptions"
        />

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Slider Images</h2>
            <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-600">No slider images yet</p>
              <p className="text-sm text-gray-500 mt-2">Add your first image to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <Card key={image.id} className={!image.isActive ? "opacity-50" : ""}>
                  <CardHeader>
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                      <img 
                        src={image.imageUrl} 
                        alt={image.description || "Slider image"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardTitle className="text-sm">Order: {image.displayOrder}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {image.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDialog(image)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleActive(image)}
                      >
                        {image.isActive ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingImage ? 'Edit Slider Image' : 'Add Slider Image'}
              </DialogTitle>
              <DialogDescription>
                Upload an image and add a description for the slider
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label>Upload Image *</Label>
                  {!preview && !editingImage ? (
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer"
                      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' }}
                      onDrop={handleDrop}
                      onClick={onBrowseClick}
                    >
                      <div className="text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Drag & drop your image here
                        </p>
                        <p className="text-xs text-gray-500 mb-4">or click to browse</p>
                        <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </div>
                        <p className="text-xs text-gray-400 mt-4">
                          Supports: JPG, PNG, WebP, SVG (Max 5MB)
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        hidden
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                        onChange={(e) => onFileSelected(e.target.files?.[0] || null)}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative border rounded-lg overflow-hidden">
                        <img 
                          src={preview} 
                          alt="Preview"
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg'
                          }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            clearSelection()
                            if (editingImage) {
                              setPreview(editingImage.imageUrl)
                            }
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onBrowseClick}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Change Image
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        hidden
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                        onChange={(e) => onFileSelected(e.target.files?.[0] || null)}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter description for this image"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lower numbers appear first
                  </p>
                </div>
              </div>
              {uploadProgress && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700 font-medium text-center">{uploadProgress}</p>
                </div>
              )}
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isUploading}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      {uploadProgress || 'Saving...'}
                    </>
                  ) : (
                    <>
                      {editingImage ? 'Update' : 'Add'} Image
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

