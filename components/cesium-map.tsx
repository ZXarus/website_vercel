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
        // Set the Cesium Ion Access Token
        window.Cesium.Ion.defaultAccessToken =
          process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN ||
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyNDA5OGFmMy02MGI1LTQwN2UtYjI4Ny05MzczZmVkNmVkYTEiLCJpZCI6MzIyOTM1LCJpYXQiOjE3NTI5MDcwODF9.7QikdcokptmOFrMTFryHFMaX-FmzCQfipcbDl1JJGGE"

        const viewer = new window.Cesium.Viewer(mapContainerRef.current!, {
          terrain: window.Cesium.Terrain.fromWorldTerrain(),
          infoBox: true,
          selectionIndicator: true,
          shouldAnimate: true,
          homeButton: true,
          sceneModePicker: true,
          baseLayerPicker: true,
          navigationHelpButton: true,
          animation: false,
          timeline: false,
          fullscreenButton: true,
          vrButton: false,
          // Enable high-resolution globe
          requestRenderMode: false,
          maximumRenderTimeChange: Number.POSITIVE_INFINITY,
        })

        // Add high-resolution 3D buildings for detailed zooming
        viewer.scene.primitives.add(window.Cesium.createOsmBuildings())

        // Configure camera for detailed zooming capabilities
        viewer.scene.screenSpaceCameraController.minimumZoomDistance = 1.0
        viewer.scene.screenSpaceCameraController.maximumZoomDistance = 50000000.0

        // Enable high-quality rendering for detailed views
        viewer.scene.globe.enableLighting = true
        viewer.scene.globe.dynamicAtmosphereLighting = true
        viewer.scene.globe.dynamicAtmosphereLightingFromSun = true

        // Set initial camera position to show NYC area with good detail level
        viewer.camera.setView({
          destination: window.Cesium.Cartesian3.fromDegrees(-74.006, 40.7128, 50000), // NYC coordinates with altitude
          orientation: {
            heading: window.Cesium.Math.toRadians(0.0),
            pitch: window.Cesium.Math.toRadians(-45.0),
            roll: 0.0,
          },
        })

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
          pixelSize: 15,
          color: getMarkerColor(priceChangePercent),
          outlineColor: window.Cesium.Color.WHITE,
          outlineWidth: 3,
          heightReference: window.Cesium.HeightReference.CLAMP_TO_GROUND,
          // Enhanced scaling for detailed zoom levels
          scaleByDistance: new window.Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5),
          translucencyByDistance: new window.Cesium.NearFarScalar(1.5e2, 1.0, 1.5e7, 0.3),
        },
        label: {
          text: `$${Math.round(predictedPrice / 1000)}K`,
          font: "14pt sans-serif",
          fillColor: window.Cesium.Color.WHITE,
          outlineColor: window.Cesium.Color.BLACK,
          outlineWidth: 2,
          style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new window.Cesium.Cartesian2(0, -40),
          // Enhanced label scaling for detailed views
          scaleByDistance: new window.Cesium.NearFarScalar(1.5e2, 1.5, 1.5e7, 0.3),
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
