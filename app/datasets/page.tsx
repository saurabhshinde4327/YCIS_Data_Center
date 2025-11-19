"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Eye, Database, FileText, ArrowLeft, Filter } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

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

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [filteredDatasets, setFilteredDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetchDatasets()
  }, [])

  useEffect(() => {
    filterDatasets()
  }, [datasets, searchTerm, selectedCategory])

  const fetchDatasets = async () => {
    try {
      const response = await fetch('/api/datasets?public=true')
      if (response.ok) {
        const data = await response.json()
        setDatasets(data || [])
        
        // Extract unique categories
        const uniqueCategories = [...new Set((data || []).map((ds: Dataset) => ds.category))]
        setCategories(uniqueCategories.sort())
      }
    } catch (error) {
      console.error('Error fetching datasets:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshDataset = async (datasetId: string) => {
    try {
      const response = await fetch(`/api/datasets/${datasetId}`)
      if (response.ok) {
        const updatedDataset = await response.json()
        setDatasets(prev => prev.map(ds => 
          ds.id === datasetId ? updatedDataset : ds
        ))
      }
    } catch (error) {
      console.error('Error refreshing dataset:', error)
    }
  }

  const filterDatasets = () => {
    let filtered = datasets

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(ds => 
        ds.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ds.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ds.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(ds => ds.category === selectedCategory)
    }

    setFilteredDatasets(filtered)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleDownload = async (dataset: Dataset) => {
    try {
      setDownloadingId(dataset.id)
      
      // Get download URL (this will increment downloads on the server)
      const response = await fetch(`/api/datasets/${dataset.id}/download`)
      if (!response.ok) throw new Error('Failed to get download URL')
      
      const data = await response.json()
      
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Create download link
      const link = document.createElement('a')
      link.href = data.fileUrl
      link.download = data.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Refresh dataset to get updated counts from server
      await refreshDataset(dataset.id)
    } catch (error) {
      console.error('Error downloading dataset:', error)
      alert('Failed to download dataset. Please try again.')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleView = async (datasetId: string) => {
    try {
      // Fetch dataset to increment views on server
      const response = await fetch(`/api/datasets/${datasetId}`)
      if (response.ok) {
        // Refresh the dataset to get updated view count
        await refreshDataset(datasetId)
      }
    } catch (error) {
      console.error('Error incrementing views:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar />
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="container mx-auto px-6">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/20 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <Database className="h-12 w-12" />
            <div>
              <h1 className="text-4xl font-bold">Public Datasets</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search datasets by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px] h-12">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Datasets Grid */}
      <div className="container mx-auto px-6 py-8">
        {filteredDatasets.length === 0 ? (
          <div className="text-center py-16">
            <Database className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No datasets found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory !== "all" 
                ? "Try adjusting your search or filters."
                : "No datasets have been published yet."}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredDatasets.length} of {datasets.length} datasets
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDatasets.map((dataset) => (
                <div
                  key={dataset.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-200 overflow-hidden"
                  onMouseEnter={() => {
                    // Only increment view once per session per dataset
                    const viewedKey = `dataset_viewed_${dataset.id}`
                    if (!sessionStorage.getItem(viewedKey)) {
                      sessionStorage.setItem(viewedKey, 'true')
                      handleView(dataset.id)
                    }
                  }}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                          {dataset.title}
                        </h3>
                        <Badge variant="outline" className="mb-2">
                          {dataset.category}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3 min-h-[4rem]">
                      {dataset.description}
                    </p>
                    
                    {/* Tags */}
                    {dataset.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {dataset.tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {dataset.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{dataset.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {dataset.views} views
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        {dataset.downloads} downloads
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {formatFileSize(dataset.fileSize)}
                      </div>
                    </div>
                    
                    {/* Download Button */}
                    <Button
                      onClick={() => handleDownload(dataset)}
                      disabled={downloadingId === dataset.id}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                    >
                      {downloadingId === dataset.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download Dataset
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />

      {/* Full Screen Loading Overlay */}
      {downloadingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md mx-4 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Downloading Dataset</h3>
            <p className="text-gray-600">
              {datasets.find(ds => ds.id === downloadingId)?.title || 'Preparing download...'}
            </p>
            <p className="text-sm text-gray-500 mt-2">Please wait...</p>
          </div>
        </div>
      )}
    </div>
  )
}

