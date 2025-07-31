"use client"

import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { fetchNYCProperties } from "@/data/nyc-properties"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function MapPage() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  // Dynamically import the CesiumMap component to prevent SSR issues
  const CesiumMap = useMemo(
    () =>
      dynamic(() => import("@/components/cesium-map"), {
        ssr: false,
        loading: () => (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
              <p className="text-lg font-medium">Loading Interactive Map...</p>
            </div>
          </div>
        ),
      }),
    [],
  )

  useEffect(() => {
    const loadProperties = async () => {
      setLoading(true)
      try {
        const data = await fetchNYCProperties()
        setProperties(data)
      } catch (error) {
        console.error("Failed to load properties for map:", error)
      } finally {
        setLoading(false)
      }
    }
    loadProperties()
  }, [])

  return (
    <div className="w-screen h-screen relative">
      <div className="absolute top-4 left-4 z-10">
        <Button asChild variant="secondary">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      <CesiumMap properties={properties} />
    </div>
  )
}
