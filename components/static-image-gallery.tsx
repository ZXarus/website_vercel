"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, ImageIcon, AlertCircle } from "lucide-react"

interface StaticImageGalleryProps {
  propertyId: string
  existingImages: string[]
}

export default function StaticImageGallery({ propertyId, existingImages }: StaticImageGalleryProps) {
  const [localImages, setLocalImages] = useState<string[]>(existingImages)
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    setUploading(true)

    // Convert files to base64 URLs for local storage
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setLocalImages((prev) => [...prev, result])

        // Store in localStorage
        const stored = localStorage.getItem(`images_${propertyId}`) || "[]"
        const images = JSON.parse(stored)
        images.push(result)
        localStorage.setItem(`images_${propertyId}`, JSON.stringify(images))
      }
      reader.readAsDataURL(file)
    })

    setUploading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Property Images (Local Storage)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">Add images locally</p>
          <p className="text-sm text-gray-500 mb-4">Images stored in browser only</p>
          <Button
            onClick={() => {
              const input = document.createElement("input")
              input.type = "file"
              input.multiple = true
              input.accept = "image/*"
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement
                handleFileSelect(target.files)
              }
              input.click()
            }}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Processing..." : "Select Images"}
          </Button>
        </div>

        {localImages.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {localImages.map((image, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={image || "/placeholder.svg"}
                  alt={`Property image ${index + 1}`}
                  className="w-full h-full object-cover rounded"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 w-6 h-6"
                  onClick={() => {
                    const newImages = localImages.filter((_, i) => i !== index)
                    setLocalImages(newImages)
                    localStorage.setItem(`images_${propertyId}`, JSON.stringify(newImages))
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded">
          <AlertCircle className="w-4 h-4 inline mr-1" />
          <strong>Note:</strong> Images are stored locally in your browser and will be lost if you clear browser data.
        </div>
      </CardContent>
    </Card>
  )
}
