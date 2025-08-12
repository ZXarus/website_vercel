"use client"

import { useEffect, useRef } from "react"

// Define the structure of a property for type safety
interface Property {
  id: string
  latitude: number
  longitude: number
  address: string
  title: string
  predictedPrice: number
  priceChangePercent: number
  currentPrice?: number
}

interface CesiumMapProps {
  properties: Property[]
}

export default function CesiumMap({ properties }: CesiumMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null) // To hold the Cesium Viewer instance

  // Effect to load CesiumJS scripts and initialize the map
  useEffect(() => {
    // Ensure this runs only once
    if (viewerRef.current || !mapContainerRef.current) {
      return
    }

    const loadCesium = async () => {
      // Dynamically load CesiumJS library and styles
      const cesiumScript = document.createElement("script")
      cesiumScript.src = "https://cesium.com/downloads/cesiumjs/releases/1.119/Build/Cesium/Cesium.js"
      document.head.appendChild(cesiumScript)

      const cesiumStyles = document.createElement("link")
      cesiumStyles.rel = "stylesheet"
      cesiumStyles.href = "https://cesium.com/downloads/cesiumjs/releases/1.119/Build/Cesium/Widgets/widgets.css"
      document.head.appendChild(cesiumStyles)

      cesiumScript.onload = () => {
        // IMPORTANT: Add your Cesium Ion Access Token as an environment variable
        // Create a .env.local file and add: NEXT_PUBLIC_CESIUM_ION_TOKEN=your_token_here
        window.Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || ""

        const viewer = new window.Cesium.Viewer(mapContainerRef.current!, {
          terrain: window.Cesium.Terrain.fromWorldTerrain(),
          infoBox: true,
          selectionIndicator: true,
          shouldAnimate: true,
        })

        // Add 3D buildings
        viewer.scene.primitives.add(window.Cesium.createOsmBuildings())

        // Store the viewer instance
        viewerRef.current = viewer
      }
    }

    loadCesium()

    // Cleanup function to destroy the viewer on component unmount
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy()
        viewerRef.current = null
      }
    }
  }, [])

  // Effect to update markers when properties data changes
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !window.Cesium) return

    // Clear existing markers
    viewer.entities.removeAll()

    if (properties.length === 0) return

    // Function to determine marker color
    const getMarkerColor = (percentageChange: number) => {
      if (percentageChange > 5) return window.Cesium.Color.LIMEGREEN
      if (percentageChange > 0) return window.Cesium.Color.YELLOWGREEN
      if (percentageChange === 0) return window.Cesium.Color.YELLOW
      if (percentageChange < -5) return window.Cesium.Color.RED
      return window.Cesium.Color.ORANGE
    }

    // Add a new marker for each property
    properties.forEach((property) => {
      const { latitude, longitude, title, predictedPrice, priceChangePercent, currentPrice } = property

      const description = `
        <div style="font-family: sans-serif; color: #fff; background-color: rgba(42, 42, 42, 0.95); padding: 15px; border-radius: 8px;">
          <h3 style="margin-top: 0; font-size: 1.2em; color: #f43f5e;">${title}</h3>
          <p style="margin: 5px 0; font-weight: bold; font-size: 1.1em;">Predicted Price: $${predictedPrice.toLocaleString()}</p>
          ${currentPrice ? `<p style="margin: 5px 0;">Current Price: $${currentPrice.toLocaleString()}</p>` : ""}
          <p style="margin: 5px 0; font-weight: bold; color: ${priceChangePercent >= 0 ? "#10b981" : "#ef4444"};">
            Change: ${priceChangePercent.toFixed(2)}%
          </p>
        </div>
      `

      viewer.entities.add({
        name: title,
        position: window.Cesium.Cartesian3.fromDegrees(longitude, latitude),
        point: {
          pixelSize: 12,
          color: getMarkerColor(priceChangePercent),
          outlineColor: window.Cesium.Color.WHITE,
          outlineWidth: 2,
          translucencyByDistance: new window.Cesium.NearFarScalar(1.5e2, 1.0, 1.5e7, 0.2),
        },
        description: description,
      })
    })

    // Fly camera to view all properties
    viewer.flyTo(viewer.entities, {
      duration: 3.0,
    })
  }, [properties])

  return <div ref={mapContainerRef} className="w-full h-full" />
}
