"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ArrowUp, ArrowDown } from "lucide-react"

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
  image: string
}

interface PropertyMapProps {
  properties: Property[]
  className?: string
  onPropertySelect: (property: Property) => void
  selectedProperty: Property | null
}

export default function PropertyMap({ properties, className, onPropertySelect, selectedProperty }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const clusterGroupRef = useRef<any>(null)

  useEffect(() => {
    // Load Leaflet library
    const loadLeaflet = async () => {
      if (!window.L) {
        // Load Leaflet CSS
        const linkElement = document.createElement("link")
        linkElement.rel = "stylesheet"
        linkElement.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(linkElement)

        // Load MarkerCluster CSS
        const clusterCssElement = document.createElement("link")
        clusterCssElement.rel = "stylesheet"
        clusterCssElement.href = "https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css"
        document.head.appendChild(clusterCssElement)

        const clusterDefaultCssElement = document.createElement("link")
        clusterDefaultCssElement.rel = "stylesheet"
        clusterDefaultCssElement.href = "https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css"
        document.head.appendChild(clusterDefaultCssElement)

        // Load Leaflet JS
        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.async = true

        await new Promise((resolve) => {
          script.onload = resolve
          document.body.appendChild(script)
        })

        // Load MarkerCluster JS
        const clusterScript = document.createElement("script")
        clusterScript.src = "https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js"
        clusterScript.async = true

        await new Promise((resolve) => {
          clusterScript.onload = resolve
          document.body.appendChild(clusterScript)
        })
      }

      initializeMap()
    }

    loadLeaflet()

    // Add resize handler to ensure map renders correctly when window size changes
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize()
      }
    }

    window.addEventListener("resize", handleResize)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  useEffect(() => {
    if (mapInstanceRef.current && properties.length > 0) {
      updateMarkers()
    }
  }, [properties])

  useEffect(() => {
    if (mapInstanceRef.current && selectedProperty) {
      // Find and highlight the selected marker
      markersRef.current.forEach((marker) => {
        const markerProperty = marker.property
        if (markerProperty.id === selectedProperty.id) {
          // Use setZIndexOffset instead of setZIndex
          marker.setZIndexOffset(1000)
          marker.openPopup()

          // Pan to the marker
          mapInstanceRef.current.panTo([markerProperty.latitude, markerProperty.longitude])

          // Zoom in if needed to see the individual marker
          if (mapInstanceRef.current.getZoom() < 16) {
            mapInstanceRef.current.setZoom(16)
          }
        } else {
          // Reset z-index offset for other markers
          marker.setZIndexOffset(0)
          marker.closePopup()
        }
      })
    }
  }, [selectedProperty])

  const initializeMap = () => {
    if (!mapRef.current || !window.L || mapInstanceRef.current) return

    // Add a small delay to ensure the container is fully rendered
    setTimeout(() => {
      // Initialize the map centered on NYC
      const map = window.L.map(mapRef.current).setView([40.7128, -74.006], 12)

      // Add the tile layer (OpenStreetMap)
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      // Add legend
      const legend = window.L.control({ position: "bottomright" })
      legend.onAdd = () => {
        const div = window.L.DomUtil.create("div", "info legend")
        div.style.backgroundColor = "white"
        div.style.padding = "10px"
        div.style.borderRadius = "5px"
        div.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)"

        div.innerHTML = `
        <h4 class="font-semibold mb-2">Price Change</h4>
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <div style="width: 15px; height: 15px; background-color: #1a9641; border-radius: 50%;"></div>
            <span>+15% or more</span>
          </div>
          <div class="flex items-center gap-2">
            <div style="width: 15px; height: 15px; background-color: #a6d96a; border-radius: 50%;"></div>
            <span>+5% to +15%</span>
          </div>
          <div class="flex items-center gap-2">
            <div style="width: 15px; height: 15px; background-color: #ffffbf; border-radius: 50%;"></div>
            <span>-5% to +5%</span>
          </div>
          <div class="flex items-center gap-2">
            <div style="width: 15px; height: 15px; background-color: #fdae61; border-radius: 50%;"></div>
            <span>-15% to -5%</span>
          </div>
          <div class="flex items-center gap-2">
            <div style="width: 15px; height: 15px; background-color: #d7191c; border-radius: 50%;"></div>
            <span>-15% or less</span>
          </div>
        </div>
      `
        return div
      }
      legend.addTo(map)

      // Add custom CSS for clusters
      const style = document.createElement("style")
      style.textContent = `
      .custom-cluster-icon {
        background: none !important;
      }
      .leaflet-marker-icon {
        background: none !important;
      }
    `
      document.head.appendChild(style)

      mapInstanceRef.current = map
      updateMarkers()

      // Force a resize event to ensure the map renders correctly
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize()
        }
      }, 100)
    }, 100)
  }

  const getMarkerColor = (priceChangePercent: number) => {
    if (priceChangePercent >= 15) return "#1a9641"
    if (priceChangePercent >= 5) return "#a6d96a"
    if (priceChangePercent >= -5) return "#ffffbf"
    if (priceChangePercent >= -15) return "#fdae61"
    return "#d7191c"
  }

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !window.L) return

    // Clear existing markers
    if (clusterGroupRef.current) {
      clusterGroupRef.current.clearLayers()
      mapInstanceRef.current.removeLayer(clusterGroupRef.current)
    }
    markersRef.current = []

    // Create a new marker cluster group with custom options
    const clusterOptions = {
      maxClusterRadius: 40,
      disableClusteringAtZoom: 16,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster: any) => {
        const childCount = cluster.getChildCount()

        // Get all markers in this cluster
        const markers = cluster.getAllChildMarkers()

        // Count markers by color category
        const colorCounts = {
          increase15: 0, // #1a9641
          increase5: 0, // #a6d96a
          neutral: 0, // #ffffbf
          decrease5: 0, // #fdae61
          decrease15: 0, // #d7191c
        }

        markers.forEach((marker: any) => {
          const priceChangePercent = marker.property.priceChangePercent
          if (priceChangePercent >= 15) colorCounts.increase15++
          else if (priceChangePercent >= 5) colorCounts.increase5++
          else if (priceChangePercent >= -5) colorCounts.neutral++
          else if (priceChangePercent >= -15) colorCounts.decrease5++
          else colorCounts.decrease15++
        })

        // Determine dominant color
        let dominantColor = "#ffffbf" // Default neutral color
        let maxCount = 0

        if (colorCounts.increase15 > maxCount) {
          maxCount = colorCounts.increase15
          dominantColor = "#1a9641"
        }
        if (colorCounts.increase5 > maxCount) {
          maxCount = colorCounts.increase5
          dominantColor = "#a6d96a"
        }
        if (colorCounts.neutral > maxCount) {
          maxCount = colorCounts.neutral
          dominantColor = "#ffffbf"
        }
        if (colorCounts.decrease5 > maxCount) {
          maxCount = colorCounts.decrease5
          dominantColor = "#fdae61"
        }
        if (colorCounts.decrease15 > maxCount) {
          dominantColor = "#d7191c"
        }

        // Create custom cluster icon
        return window.L.divIcon({
          html: `<div style="background-color: ${dominantColor}; width: 36px; height: 36px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; font-weight: bold; color: ${dominantColor === "#ffffbf" ? "black" : "white"};">${childCount}</div>`,
          className: "custom-cluster-icon",
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        })
      },
    }

    clusterGroupRef.current = window.L.markerClusterGroup(clusterOptions)

    // Add markers for each property
    properties.forEach((property) => {
      const markerColor = getMarkerColor(property.priceChangePercent)

      // Create custom icon
      const icon = window.L.divIcon({
        className: "custom-marker",
        html: `<div style="background-color: ${markerColor}; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
        iconSize: [15, 15],
        iconAnchor: [7.5, 7.5],
      })

      // Create marker with proper options
      const marker = window.L.marker([property.latitude, property.longitude], {
        icon,
        zIndexOffset: 0, // Default z-index offset
      })

      // Add popup
      marker.bindPopup(`
        <div class="text-sm">
          <div class="font-semibold">${property.title}</div>
          <div>${property.address}</div>
          <div class="mt-1">Current: $${property.currentPrice.toLocaleString()}</div>
          <div>Predicted: $${property.predictedPrice.toLocaleString()}</div>
          <div class="font-semibold ${property.priceChangePercent >= 0 ? "text-green-600" : "text-red-600"}">
            ${property.priceChangePercent >= 0 ? "+" : ""}${property.priceChangePercent.toFixed(1)}%
          </div>
        </div>
      `)

      // Add click event
      marker.on("click", () => {
        onPropertySelect(property)
      })

      // Store property reference in marker
      marker.property = property

      // Add to markers array
      markersRef.current.push(marker)

      // Add to cluster group
      clusterGroupRef.current.addLayer(marker)
    })

    // Add the cluster group to the map
    mapInstanceRef.current.addLayer(clusterGroupRef.current)

    // Fit bounds to show all markers
    if (markersRef.current.length > 0) {
      const group = window.L.featureGroup(markersRef.current)
      mapInstanceRef.current.fitBounds(group.getBounds())
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div ref={mapRef} className="w-full h-full relative" />

      {selectedProperty && (
        <Card className="absolute bottom-4 left-4 right-4 max-w-md mx-auto z-10">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                <img
                  src={selectedProperty.image || "/placeholder.svg?height=64&width=64"}
                  alt={selectedProperty.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{selectedProperty.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedProperty.address}</p>
                <div className="flex items-center gap-4 mt-1">
                  <p className="font-medium">${selectedProperty.currentPrice.toLocaleString()}</p>
                  <div className="flex items-center">
                    {selectedProperty.priceChangePercent >= 0 ? (
                      <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
                        <ArrowUp className="w-3 h-3" />
                        {selectedProperty.priceChangePercent.toFixed(1)}%
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500 hover:bg-red-600 flex items-center gap-1">
                        <ArrowDown className="w-3 h-3" />
                        {Math.abs(selectedProperty.priceChangePercent).toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={() => onPropertySelect(null as any)}
              >
                ×
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
