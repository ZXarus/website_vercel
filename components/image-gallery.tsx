"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCw, Maximize, Grid3X3, Grid2X2 } from "lucide-react"

// Add a helper function to determine image type from URL
const getImageType = (url: string): string => {
  if (!url) return "Unknown"

  if (url.includes("bathroom") || url.includes("bath_")) {
    return "Bathroom"
  } else if (url.includes("bedroom") || url.includes("bed_")) {
    return "Bedroom"
  } else if (url.includes("interior") || url.includes("living")) {
    return "Interior"
  } else if (url.includes("exterior")) {
    return "Exterior"
  }

  return "Property"
}

interface ImageGalleryProps {
  images: string[]
  initialIndex?: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ImageGallery({ images, initialIndex = 0, open, onOpenChange }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 })
  const [viewMode, setViewMode] = useState<"single" | "grid">("single")
  const imageRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef({ x: 0, y: 0 })

  // Reset zoom and rotation when image changes
  useEffect(() => {
    setZoomLevel(1)
    setRotation(0)
    setDragPosition({ x: 0, y: 0 })
  }, [currentIndex])

  // Reset current index when gallery opens
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex)
    }
  }, [open, initialIndex])

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3))
  }

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))
  }

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true)
      dragStartRef.current = { x: e.clientX, y: e.clientY }
      setStartDragPosition({ ...dragPosition })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      const dx = e.clientX - dragStartRef.current.x
      const dy = e.clientY - dragStartRef.current.y

      setDragPosition({
        x: startDragPosition.x + dx,
        y: startDragPosition.y + dy,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "single" ? "grid" : "single"))
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case "ArrowRight":
          nextImage()
          break
        case "ArrowLeft":
          prevImage()
          break
        case "Escape":
          onOpenChange(false)
          break
        case "+":
          zoomIn()
          break
        case "-":
          zoomOut()
          break
        case "r":
          rotate()
          break
        case "g":
          toggleViewMode()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  if (!images || images.length === 0) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen-lg w-[95vw] h-[90vh] p-0 bg-black/95 border-none">
        <div className="relative flex flex-col h-full">
          {/* Top controls */}
          <div className="flex justify-between items-center p-4 text-white">
            <div className="text-sm">
              {currentIndex + 1} / {images.length}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={toggleViewMode}
                title={viewMode === "single" ? "Grid view" : "Single view"}
              >
                {viewMode === "single" ? <Grid3X3 className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={zoomIn}
                title="Zoom in"
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={zoomOut}
                title="Zoom out"
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={rotate}
                title="Rotate"
              >
                <RotateCw className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => onOpenChange(false)}
                title="Close"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Image container */}
          {viewMode === "single" ? (
            <div
              className="flex-1 flex items-center justify-center overflow-hidden"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div
                ref={imageRef}
                className={`transition-all duration-200 ease-in-out ${isDragging ? "cursor-grabbing" : zoomLevel > 1 ? "cursor-grab" : "cursor-default"}`}
                style={{
                  transform: `translate(${dragPosition.x}px, ${dragPosition.y}px) scale(${zoomLevel}) rotate(${rotation}deg)`,
                }}
              >
                <img
                  src={images[currentIndex] || "/placeholder.svg"}
                  alt={`Gallery image ${currentIndex + 1}`}
                  className="max-h-[calc(90vh-120px)] object-contain"
                />
                <div className="text-white/70 text-xs text-center mt-2">{getImageType(images[currentIndex])}</div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={`aspect-square overflow-hidden rounded-md cursor-pointer border-2 ${
                      index === currentIndex ? "border-rose-500" : "border-transparent hover:border-white/50"
                    }`}
                    onClick={() => {
                      setCurrentIndex(index)
                      setViewMode("single")
                    }}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Gallery thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation buttons - only in single view */}
          {viewMode === "single" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                onClick={prevImage}
                title="Previous image"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                onClick={nextImage}
                title="Next image"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Thumbnails */}
          {viewMode === "single" && (
            <div className="p-4 flex justify-center gap-2 bg-black/50">
              {images
                .slice(Math.max(0, currentIndex - 4), Math.min(images.length, currentIndex + 5))
                .map((image, idx) => {
                  const actualIndex = Math.max(0, currentIndex - 4) + idx
                  return (
                    <button
                      key={actualIndex}
                      className={`w-16 h-16 overflow-hidden rounded border-2 transition-all ${
                        actualIndex === currentIndex
                          ? "border-rose-500 opacity-100"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                      onClick={() => setCurrentIndex(actualIndex)}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Thumbnail ${actualIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  )
                })}
              {images.length > 9 && (
                <button
                  className="w-16 h-16 overflow-hidden rounded border-2 border-transparent bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid2X2 className="w-6 h-6" />
                  <span className="sr-only">View all</span>
                </button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
