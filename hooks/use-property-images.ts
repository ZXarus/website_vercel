"use client"

import { useState, useEffect, useCallback } from "react"
import { getPropertyImages, getPrimaryImage, type PropertyImage } from "@/lib/property-images-service"

export const usePropertyImages = (propertyId: string) => {
  const [images, setImages] = useState<PropertyImage[]>([])
  const [primaryImage, setPrimaryImageState] = useState<PropertyImage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadImages = useCallback(async () => {
    if (!propertyId) return

    try {
      setLoading(true)
      setError(null)

      const [imagesData, primaryImageData] = await Promise.all([
        getPropertyImages(propertyId),
        getPrimaryImage(propertyId),
      ])

      setImages(imagesData)
      setPrimaryImageState(primaryImageData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load images")
      console.error("Error loading property images:", err)
    } finally {
      setLoading(false)
    }
  }, [propertyId])

  useEffect(() => {
    loadImages()
  }, [loadImages])

  const getImageUrls = useCallback(() => {
    return images.map((img) => img.image_url)
  }, [images])

  const getPrimaryImageUrl = useCallback(() => {
    return primaryImage?.image_url || images[0]?.image_url || null
  }, [primaryImage, images])

  const getImagesByCategory = useCallback(
    (category: string) => {
      return images.filter((img) => img.category === category)
    },
    [images],
  )

  const refreshImages = useCallback(() => {
    loadImages()
  }, [loadImages])

  return {
    images,
    primaryImage,
    loading,
    error,
    getImageUrls,
    getPrimaryImageUrl,
    getImagesByCategory,
    loadImages: refreshImages,
  }
}
