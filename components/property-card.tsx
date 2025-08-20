"use client"

import Link from "next/link"
import { useState } from "react"
import {
  Bed,
  Bath,
  SquareIcon as SquareFoot,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Scale,
  ChevronLeft,
  ChevronRight,
  Heart,
  ImageIcon,
} from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import ImageGallery from "@/components/image-gallery"

interface PropertyFeatures {
  hasParking?: boolean
  hasGarden?: boolean
  hasPool?: boolean
  hasBalcony?: boolean
  hasElevator?: boolean
  hasGym?: boolean
  hasDoorman?: boolean
  isRenovated?: boolean
  hasWaterView?: boolean
  hasCentralAir?: boolean
}

interface Property {
  id: string
  title: string
  address: string
  currentPrice: number
  predictedPrice: number
  priceChange: number
  priceChangePercent: number
  bedrooms: number
  bathrooms: number
  sqft: number
  type: string
  yearBuilt: number
  roi: number
  latitude: number
  longitude: number
  images?: string[]
  allImages?: {
    exterior?: string[]
    interior?: string[]
    bedroom?: string[]
    bathroom?: string[]
  }
  features?: PropertyFeatures
}

interface PropertyCardProps {
  property: Property
  onClick?: () => void
  isSelected?: boolean
  onCompareToggle?: (property: Property) => void
  isInComparisonList?: boolean
  onFavoriteToggle?: () => void
  isFavorite?: boolean
}

export default function PropertyCard({
  property,
  onClick,
  isSelected,
  onCompareToggle,
  isInComparisonList,
  onFavoriteToggle,
  isFavorite = false,
}: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [galleryOpen, setGalleryOpen] = useState(false)

  // Get primary image - first try to use the first image from the images array
  const primaryImage =
    property.images && property.images.length > 0
      ? property.images[0]
      : property.allImages?.exterior?.[0] ||
        property.allImages?.interior?.[0] ||
        property.allImages?.bedroom?.[0] ||
        property.allImages?.bathroom?.[0]

  // Collect all available images
  const allImages = []

  // Add images from the main images array
  if (property.images && property.images.length > 0) {
    allImages.push(...property.images)
  }

  // Add images from specific categories if they exist
  if (property.allImages) {
    if (property.allImages.exterior) allImages.push(...property.allImages.exterior)
    if (property.allImages.interior) allImages.push(...property.allImages.interior)
    if (property.allImages.bedroom) allImages.push(...property.allImages.bedroom)
    if (property.allImages.bathroom) allImages.push(...property.allImages.bathroom)
  }

  // Remove duplicates
  const uniqueImages = [...new Set(allImages)]

  // If no images are available, use placeholders
  const images =
    uniqueImages.length > 0
      ? uniqueImages
      : [
          `/placeholder.svg?height=200&width=400&text=${encodeURIComponent(`${property.title} - Exterior`)}`,
          `/placeholder.svg?height=200&width=400&text=${encodeURIComponent(`${property.title} - Living Room`)}`,
          `/placeholder.svg?height=200&width=400&text=${encodeURIComponent(`${property.title} - ${property.bedrooms} Bedroom${property.bedrooms > 1 ? "s" : ""}`)}`,
        ]

  const nextImage = (e) => {
    e.stopPropagation()
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const prevImage = (e) => {
    e.stopPropagation()
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }

  const openGallery = (e) => {
    e.stopPropagation()
    setGalleryOpen(true)
  }

  const handleCompareClick = (e) => {
    e.stopPropagation()
    if (onCompareToggle) {
      onCompareToggle(property)
    }
  }

  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    if (onFavoriteToggle) {
      onFavoriteToggle()
    }
  }

  return (
    <>
      <Card
        className={`overflow-hidden transition-all ${isSelected ? "ring-2 ring-rose-500" : ""} ${onClick ? "cursor-pointer hover:shadow-md" : ""}`}
        onClick={
          onClick
            ? (e) => {
                // Only trigger onClick if not clicking on a button or link
                if (e.target.closest("button") || e.target.closest("a")) return
                onClick()
              }
            : undefined
        }
      >
        <div className="relative aspect-video">
          <img
            src={images[currentImageIndex] || "/placeholder.svg"}
            alt={property.title}
            className="object-cover w-full h-full"
          />

          {/* Image navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Gallery button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute bottom-2 right-2 w-7 h-7 bg-background/80 hover:bg-background"
                  onClick={openGallery}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View all images</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Price change badge */}
          {property.priceChangePercent >= 0 ? (
            <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 flex items-center gap-1">
              <ArrowUp className="w-3 h-3" />
              {property.priceChangePercent.toFixed(1)}%
            </Badge>
          ) : (
            <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 flex items-center gap-1">
              <ArrowDown className="w-3 h-3" />
              {Math.abs(property.priceChangePercent).toFixed(1)}%
            </Badge>
          )}

          {/* Compare button */}
          {onCompareToggle && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isInComparisonList ? "default" : "outline"}
                    size="icon"
                    className="absolute top-2 left-2 w-7 h-7 bg-background/80 hover:bg-background"
                    onClick={handleCompareClick}
                  >
                    <Scale className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isInComparisonList ? "Remove from comparison" : "Add to comparison"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Favorite button */}
          {onFavoriteToggle && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`absolute top-2 ${onCompareToggle ? "left-10" : "left-2"} w-7 h-7 bg-background/80 hover:bg-background ${
                      isFavorite ? "text-rose-500" : ""
                    }`}
                    onClick={handleFavoriteClick}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-rose-500" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isFavorite ? "Remove from favorites" : "Add to favorites"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="space-y-1">
              <Link href={`/properties/${property.id}`} className="hover:underline">
                <h3 className="font-semibold">{property.title}</h3>
              </Link>
              <p className="text-sm text-muted-foreground">{property.address}</p>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-lg font-bold">${property.currentPrice.toLocaleString()}</div>
              <div className="text-sm font-medium text-muted-foreground">
                Predicted: ${property.predictedPrice.toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4 text-muted-foreground" />
                <span>{property.bedrooms}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4 text-muted-foreground" />
                <span>{property.bathrooms}</span>
              </div>
              <div className="flex items-center gap-1">
                <SquareFoot className="w-4 h-4 text-muted-foreground" />
                <span>{property.sqft.toLocaleString()} sqft</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-green-600 font-medium">Projected ROI: {property.roi}%</span>
            </div>

            {/* Property features */}
            {property.features && (
              <div className="flex flex-wrap gap-1 mt-2">
                {property.features.hasParking && (
                  <Badge variant="outline" className="text-xs">
                    Parking
                  </Badge>
                )}
                {property.features.hasGarden && (
                  <Badge variant="outline" className="text-xs">
                    Garden
                  </Badge>
                )}
                {property.features.hasPool && (
                  <Badge variant="outline" className="text-xs">
                    Pool
                  </Badge>
                )}
                {property.features.hasBalcony && (
                  <Badge variant="outline" className="text-xs">
                    Balcony
                  </Badge>
                )}
                {property.features.hasElevator && (
                  <Badge variant="outline" className="text-xs">
                    Elevator
                  </Badge>
                )}
                {property.features.hasGym && (
                  <Badge variant="outline" className="text-xs">
                    Gym
                  </Badge>
                )}
                {property.features.hasDoorman && (
                  <Badge variant="outline" className="text-xs">
                    Doorman
                  </Badge>
                )}
                {property.features.isRenovated && (
                  <Badge variant="outline" className="text-xs">
                    Renovated
                  </Badge>
                )}
                {property.features.hasWaterView && (
                  <Badge variant="outline" className="text-xs">
                    Water View
                  </Badge>
                )}
                {property.features.hasCentralAir && (
                  <Badge variant="outline" className="text-xs">
                    Central Air
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Link href={`/properties/${property.id}`} className="text-sm font-medium text-rose-500 hover:underline">
            View Details
          </Link>
        </CardFooter>
      </Card>

      <ImageGallery images={images} initialIndex={currentImageIndex} open={galleryOpen} onOpenChange={setGalleryOpen} />
    </>
  )
}
