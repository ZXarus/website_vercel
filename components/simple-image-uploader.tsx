"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, X, ImageIcon, AlertCircle, CheckCircle } from "lucide-react"
import { uploadMultipleImages } from "@/lib/image-upload"
import { addPropertyImage } from "@/lib/property-images-service"

interface SimpleImageUploaderProps {
  propertyId: string
  onImagesUpdated?: () => void
}

interface UploadingFile {
  file: File
  progress: number
  status: "uploading" | "success" | "error"
  error?: string
  url?: string
}

export default function SimpleImageUploader({ propertyId, onImagesUpdated }: SimpleImageUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return

      const fileArray = Array.from(files).filter(
        (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024, // 5MB limit
      )

      if (fileArray.length === 0) return

      // Initialize uploading files
      const newUploadingFiles: UploadingFile[] = fileArray.map((file) => ({
        file,
        progress: 0,
        status: "uploading",
      }))

      setUploadingFiles((prev) => [...prev, ...newUploadingFiles])

      // Upload files
      uploadFiles(fileArray, newUploadingFiles)
    },
    [propertyId],
  )

  const uploadFiles = async (files: File[], uploadingFiles: UploadingFile[]) => {
    try {
      const results = await uploadMultipleImages(files, propertyId, "general", {}, (progress) => {
        // Update progress for all files
        setUploadingFiles((prev) => prev.map((uf) => (uploadingFiles.includes(uf) ? { ...uf, progress } : uf)))
      })

      // Process results
      for (let i = 0; i < results.length; i++) {
        const result = results[i]
        const uploadingFile = uploadingFiles[i]

        if (result.success && result.url && result.path) {
          // Save to database
          await addPropertyImage({
            property_id: propertyId,
            image_url: result.url,
            storage_path: result.path,
            category: "general",
          })

          // Update status
          setUploadingFiles((prev) =>
            prev.map((uf) =>
              uf === uploadingFile ? { ...uf, status: "success", url: result.url, progress: 100 } : uf,
            ),
          )
        } else {
          // Update error status
          setUploadingFiles((prev) =>
            prev.map((uf) =>
              uf === uploadingFile ? { ...uf, status: "error", error: result.error, progress: 0 } : uf,
            ),
          )
        }
      }

      // Call callback to refresh images
      if (onImagesUpdated) {
        onImagesUpdated()
      }

      // Clear successful uploads after a delay
      setTimeout(() => {
        setUploadingFiles((prev) => prev.filter((uf) => uf.status !== "success"))
      }, 3000)
    } catch (error) {
      console.error("Upload error:", error)

      // Mark all as error
      setUploadingFiles((prev) =>
        prev.map((uf) =>
          uploadingFiles.includes(uf) ? { ...uf, status: "error", error: "Upload failed", progress: 0 } : uf,
        ),
      )
    }
  }

  const removeUploadingFile = (fileToRemove: UploadingFile) => {
    setUploadingFiles((prev) => prev.filter((uf) => uf !== fileToRemove))
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Property Images
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? "border-rose-500 bg-rose-50" : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">Drop images here or click to upload</p>
          <p className="text-sm text-gray-500 mb-4">Support: JPG, PNG, WebP • Max size: 5MB each • Max: 20 images</p>
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
          >
            <Upload className="w-4 h-4 mr-2" />
            Select Images
          </Button>
        </div>

        {/* Uploading Files */}
        {uploadingFiles.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Uploading Images</h4>
            {uploadingFiles.map((uploadingFile, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  {uploadingFile.status === "uploading" && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Upload className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  {uploadingFile.status === "success" && (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                  {uploadingFile.status === "error" && (
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uploadingFile.file.name}</p>
                  <p className="text-xs text-gray-500">{(uploadingFile.file.size / 1024 / 1024).toFixed(2)} MB</p>

                  {uploadingFile.status === "uploading" && <Progress value={uploadingFile.progress} className="mt-2" />}

                  {uploadingFile.status === "error" && uploadingFile.error && (
                    <p className="text-xs text-red-600 mt-1">{uploadingFile.error}</p>
                  )}

                  {uploadingFile.status === "success" && (
                    <p className="text-xs text-green-600 mt-1">Upload successful!</p>
                  )}
                </div>

                <Button variant="ghost" size="sm" onClick={() => removeUploadingFile(uploadingFile)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>• Images will be automatically compressed for optimal performance</p>
          <p>• Supported formats: JPEG, PNG, WebP</p>
          <p>• Maximum file size: 5MB per image</p>
        </div>
      </CardContent>
    </Card>
  )
}
