"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { DataCenterLayout } from "@/components/datacenter-layout"
import { Upload, X, Database, Download, Eye, Trash2, FileText, Info, Users, Calendar } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Dataset {
  id: string
  title: string
  description: string
  fileName: string
  fileSize: number
  fileType: string
  category: string
  tags: string[]
  downloads: number
  views: number
  isPublic: boolean
  uploadedBy?: string
  createdAt: string
}

export default function DatasetsAdminPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [category, setCategory] = useState<string>("General")
  const [tags, setTags] = useState<string>("")
  const [isPublic, setIsPublic] = useState<boolean>(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>("")
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [downloadHistoryOpen, setDownloadHistoryOpen] = useState(false)
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null)
  const [downloadLogs, setDownloadLogs] = useState<Array<{
    id: string
    userName: string
    userEmail: string
    userContact: string
    downloadedAt: string
  }>>([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  const categories = [
    "General",
    "Machine Learning",
    "Data Science",
    "Business",
    "Research",
    "Education",
    "Healthcare",
    "Finance",
    "Technology",
    "Other"
  ]

  const onBrowseClick = () => fileInputRef.current?.click()

  const onFileSelected = (f: File | null) => {
    if (!f) return
    
    // Validate file size (max 50MB for datasets)
    const maxSize = 50 * 1024 * 1024
    if (f.size > maxSize) {
      toast.error('File too large. Maximum size is 50MB.')
      return
    }
    
    setFile(f)
    if (!title.trim()) {
      setTitle(f.name.replace(/\.[^/.]+$/, "")) // Remove extension for title
    }
  }

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const f = e.dataTransfer.files?.[0]
    if (f) onFileSelected(f)
  }

  const clearSelection = () => {
    setFile(null)
    setTitle("")
    setDescription("")
    setCategory("General")
    setTags("")
    setIsPublic(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }
    
    if (!title.trim()) {
      toast.error('Please enter a title for the dataset')
      return
    }

    if (!description.trim()) {
      toast.error('Please enter a description for the dataset')
      return
    }
    
    try {
      setIsUploading(true)
      setUploadProgress('Preparing file...')
      
      // Convert file to base64
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title.trim())
      formData.append('description', description.trim())
      formData.append('category', category)
      formData.append('tags', JSON.stringify(tags.split(',').map(t => t.trim()).filter(t => t)))
      formData.append('isPublic', String(isPublic))
      formData.append('uploadedBy', 'Admin')
      
      setUploadProgress(`Uploading file (${formatFileSize(file.size)})...`)
      const response = await fetch('/api/datasets', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload dataset')
      }
      
      setUploadProgress('Complete!')
      toast.success(`✅ "${title}" dataset uploaded successfully!`)
      
      // Clear form and refresh list
      clearSelection()
      setUploadProgress('')
      await fetchDatasets()
      
    } catch (err) {
      console.error('Upload error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to upload dataset')
      setUploadProgress('')
    } finally {
      setIsUploading(false)
    }
  }

  const fetchDatasets = async () => {
    try {
      setIsLoadingList(true)
      const res = await fetch('/api/datasets')
      if (!res.ok) throw new Error('Failed to load datasets')
      const data = await res.json()
      setDatasets(data || [])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load datasets')
    } finally {
      setIsLoadingList(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this dataset? This action cannot be undone.')) return
    try {
      const res = await fetch(`/api/datasets/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete dataset')
      setDatasets(prev => prev.filter(ds => ds.id !== id))
      toast.success('Dataset deleted')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete dataset')
    }
  }

  const handleViewDownloadHistory = async (dataset: Dataset) => {
    setSelectedDataset(dataset)
    setDownloadHistoryOpen(true)
    setLoadingLogs(true)
    try {
      const res = await fetch(`/api/datasets/${dataset.id}/downloads`)
      if (!res.ok) throw new Error('Failed to load download history')
      const data = await res.json()
      setDownloadLogs(data || [])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load download history')
      setDownloadLogs([])
    } finally {
      setLoadingLogs(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  useEffect(() => {
    fetchDatasets()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <DataCenterLayout 
            variant="header"
            title="Dataset Management"
            subtitle="Upload and manage public datasets"
          />
        </div>

        {/* Info Alert */}
        <Alert className="max-w-2xl mx-auto mb-6 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>Dataset Upload:</strong> Upload datasets in any format (CSV, JSON, Excel, etc.). 
            Files are stored as base64-encoded data URLs. Maximum file size is 50MB. 
            Public datasets will be visible on the public datasets page.
          </AlertDescription>
        </Alert>
        
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Upload className="h-6 w-6 text-blue-600" />
            Upload New Dataset
          </h2>
          
          {!file ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer"
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' }}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onClick={onBrowseClick}
            >
              <div className="text-center">
                <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Drag & drop your dataset file here
                </p>
                <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  Supports: Any file type (Max 50MB)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={(e) => onFileSelected(e.target.files?.[0] || null)}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)} • {file.type || 'Unknown type'}</p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={clearSelection}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  Dataset Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for this dataset"
                  className="text-base"
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this dataset contains, its purpose, and any relevant information..."
                  className="text-base min-h-[100px]"
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-base font-semibold">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory} disabled={isUploading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-base font-semibold">
                  Tags (comma-separated)
                </Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., machine learning, data analysis, python"
                  className="text-base"
                  disabled={isUploading}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={(checked) => setIsPublic(checked === true)}
                  disabled={isUploading}
                />
                <Label htmlFor="isPublic" className="text-base font-semibold cursor-pointer">
                  Make this dataset public
                </Label>
              </div>

              {uploadProgress && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700 font-medium text-center">{uploadProgress}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleUpload}
                  disabled={!file || !title.trim() || !description.trim() || isUploading}
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
                      Upload Dataset
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

        {/* Existing Datasets */}
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-600" />
            Datasets ({datasets.length})
          </h2>
          
          {isLoadingList ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading datasets...</p>
            </div>
          ) : datasets.length === 0 ? (
            <div className="text-center py-16">
              <Database className="h-20 w-20 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-600 font-medium">No datasets uploaded yet</p>
              <p className="text-sm text-gray-400 mt-2">Upload your first dataset to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {datasets.map(dataset => (
                <div key={dataset.id} className="border-2 border-gray-200 rounded-lg p-4 bg-white hover:border-blue-400 transition-all hover:shadow-lg cursor-pointer" onClick={() => handleViewDownloadHistory(dataset)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                        {dataset.title}
                      </h3>
                      <Badge variant={dataset.isPublic ? "default" : "secondary"} className="mb-2">
                        {dataset.isPublic ? "Public" : "Private"}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {dataset.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {dataset.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {dataset.downloads}
                    </div>
                    <span>{formatFileSize(dataset.fileSize)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{dataset.category}</Badge>
                    {dataset.tags.slice(0, 2).map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewDownloadHistory(dataset)
                      }}
                      className="flex-1"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      View Downloads ({dataset.downloads})
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(dataset.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Download History Dialog */}
        <Dialog open={downloadHistoryOpen} onOpenChange={setDownloadHistoryOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download History - {selectedDataset?.title}
              </DialogTitle>
              <DialogDescription>
                View all users who have downloaded this dataset
              </DialogDescription>
            </DialogHeader>
            
            {loadingLogs ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
              </div>
            ) : downloadLogs.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-600 mb-2">No downloads yet</p>
                <p className="text-sm text-gray-500">This dataset hasn't been downloaded by anyone yet.</p>
              </div>
            ) : (
              <div className="mt-4">
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Total Downloads:</strong> {downloadLogs.length} user{downloadLogs.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Downloaded At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {downloadLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.userName}</TableCell>
                          <TableCell>{log.userEmail}</TableCell>
                          <TableCell>{log.userContact}</TableCell>
                          <TableCell className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {formatDate(log.downloadedAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

