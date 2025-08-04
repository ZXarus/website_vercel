"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Satellite, TreePine, Car, Users, Zap, BarChart3, Globe, Layers } from "lucide-react"

declare global {
  interface Window {
    google: any
  }
}

export default function GovernmentDashboard() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [selectedOverlay, setSelectedOverlay] = useState<string>("population")

  // Urban analytics data
  const urbanMetrics = [
    { label: "Population Density", value: "27,000/km²", change: "+2.3%", icon: Users },
    { label: "Green Space Coverage", value: "23.4%", change: "+1.2%", icon: TreePine },
    { label: "Traffic Flow Index", value: "78/100", change: "-5.1%", icon: Car },
    { label: "Energy Efficiency", value: "82/100", change: "+3.7%", icon: Zap },
  ]

  const overlayOptions = [
    { id: "population", label: "Population Density", color: "#FF6B6B" },
    { id: "traffic", label: "Traffic Flow", color: "#4ECDC4" },
    { id: "green", label: "Green Spaces", color: "#45B7D1" },
    { id: "development", label: "Development Zones", color: "#96CEB4" },
    { id: "infrastructure", label: "Infrastructure", color: "#FFEAA7" },
  ]

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.google) return

      const mapOptions = {
        center: { lat: 40.7128, lng: -74.006 }, // NYC coordinates
        zoom: 16,
        mapId: "DEMO_MAP_ID", // For 3D photorealistic tiles
        tilt: 45,
        heading: 0,
        mapTypeId: "satellite",
        styles: [
          {
            featureType: "all",
            elementType: "labels",
            stylers: [{ visibility: "on" }],
          },
        ],
      }

      const newMap = new window.google.maps.Map(mapRef.current, mapOptions)
      setMap(newMap)

      // Add holographic overlay effects
      addHolographicOverlays(newMap)
    }

    // Load Google Maps API
    if (!window.google) {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCQmSqYCz39FSfmL4xk0rdOZf3qU8ORo5k&libraries=geometry,places&v=3.55`
      script.async = true
      script.defer = true
      script.onload = initMap
      document.head.appendChild(script)
    } else {
      initMap()
    }
  }, [])

  const addHolographicOverlays = (map: any) => {
    // Create holographic-style overlays for urban data
    const overlayData = [
      { lat: 40.7589, lng: -73.9851, intensity: 0.8, type: "high-density" },
      { lat: 40.7505, lng: -73.9934, intensity: 0.6, type: "medium-density" },
      { lat: 40.7614, lng: -73.9776, intensity: 0.9, type: "high-density" },
      { lat: 40.7282, lng: -73.9942, intensity: 0.4, type: "low-density" },
    ]

    overlayData.forEach((point, index) => {
      // Create holographic markers
      const marker = new window.google.maps.Marker({
        position: { lat: point.lat, lng: point.lng },
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 20 + point.intensity * 30,
          fillColor: getOverlayColor(selectedOverlay),
          fillOpacity: 0.3,
          strokeColor: getOverlayColor(selectedOverlay),
          strokeWeight: 2,
          strokeOpacity: 0.8,
        },
        animation: window.google.maps.Animation.BOUNCE,
      })

      // Add pulsing effect
      setTimeout(
        () => {
          marker.setAnimation(null)
        },
        2000 + index * 500,
      )

      // Create info windows with urban data
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-3 bg-gradient-to-r from-blue-900/90 to-purple-900/90 text-white rounded-lg backdrop-blur-sm">
            <h3 class="font-bold text-sm mb-2">Urban Analytics Zone ${index + 1}</h3>
            <div class="space-y-1 text-xs">
              <div>Population: ${Math.round(point.intensity * 15000).toLocaleString()}</div>
              <div>Density: ${point.type}</div>
              <div>AI Score: ${Math.round(point.intensity * 100)}/100</div>
            </div>
          </div>
        `,
      })

      marker.addListener("click", () => {
        infoWindow.open(map, marker)
      })
    })

    // Add 3D building highlighting
    map.addListener("click", (event: any) => {
      const clickedLocation = event.latLng
      highlightBuilding(map, clickedLocation)
    })
  }

  const getOverlayColor = (overlay: string) => {
    const colors: { [key: string]: string } = {
      population: "#FF6B6B",
      traffic: "#4ECDC4",
      green: "#45B7D1",
      development: "#96CEB4",
      infrastructure: "#FFEAA7",
    }
    return colors[overlay] || "#FF6B6B"
  }

  const highlightBuilding = (map: any, location: any) => {
    // Create a highlighted circle around clicked building
    const circle = new window.google.maps.Circle({
      strokeColor: "#00FFFF",
      strokeOpacity: 0.8,
      strokeWeight: 3,
      fillColor: "#00FFFF",
      fillOpacity: 0.2,
      map: map,
      center: location,
      radius: 50,
    })

    // Remove highlight after 3 seconds
    setTimeout(() => {
      circle.setMap(null)
    }, 3000)
  }

  const switchOverlay = (overlayType: string) => {
    setSelectedOverlay(overlayType)
    if (map) {
      // Re-initialize overlays with new type
      addHolographicOverlays(map)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900/95 to-blue-900/95 backdrop-blur-sm border-b border-white/10">
        <div className="absolute inset-0 bg-[url('/images/satellite-earth-background.png')] bg-cover bg-center opacity-40 blur-sm"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-blue-900/50 to-slate-900/60"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 sm:px-8 lg:px-12 leading-6 bg-transparent opacity-90">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
              AI-Powered Urban Intelligence for Smarter Cities
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-4xl mx-auto leading-relaxed font-light">
              Empowering governments with predictive analytics, 3D mapping, and satellite data for sustainable urban
              planning.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                <Satellite className="w-5 h-5 mr-2" />
                Explore Satellite Data
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
                <Globe className="w-5 h-5 mr-2" />
                3D City View
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Urban Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {urbanMetrics.map((metric, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-100">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className={`text-sm ${metric.change.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
                      {metric.change} from last month
                    </p>
                  </div>
                  <metric.icon className="w-8 h-8 text-blue-300" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 3D Map */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  3D Photorealistic City View
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Interactive 3D map with holographic urban data overlays
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Overlay Controls */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {overlayOptions.map((overlay) => (
                    <Button
                      key={overlay.id}
                      size="sm"
                      variant={selectedOverlay === overlay.id ? "default" : "outline"}
                      onClick={() => switchOverlay(overlay.id)}
                      className={`transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg ${
                        selectedOverlay === overlay.id
                          ? "bg-white text-blue-900 shadow-md"
                          : "border-white/30 text-white bg-transparent hover:bg-white/20 hover:border-white/60"
                      }`}
                    >
                      <Layers className="w-4 h-4 mr-1" />
                      {overlay.label}
                    </Button>
                  ))}
                </div>
                {/* Mobile Gyroscope Control */}
                {typeof window !== "undefined" &&
                  /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (
                    <div className="flex justify-center mb-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (typeof DeviceOrientationEvent.requestPermission === "function") {
                            DeviceOrientationEvent.requestPermission().then((response) => {
                              if (response === "granted") {
                                // Gyroscope enabled
                              }
                            })
                          }
                        }}
                        className="border-white/30 text-white bg-transparent hover:bg-white/20 hover:border-white/60"
                      >
                        {"\uD83D\uDCDD"} Enable Gyroscope Control
                      </Button>
                    </div>
                  )}
                {/* Map Container */}
                <div
                  ref={mapRef}
                  className="w-full h-96 rounded-lg border border-white/20 bg-slate-800"
                  style={{ minHeight: "400px" }}
                />
                <div className="mt-4 text-xs text-blue-200">
                  Click on buildings for detailed analytics • Holographic overlays show real-time urban data
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Insights */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  AI Urban Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-500/30">
                  <div className="flex items-center mb-2">
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Opportunity</Badge>
                  </div>
                  <p className="text-sm text-white">
                    Midtown East shows 23% potential for mixed-use development based on satellite analysis.
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
                  <div className="flex items-center mb-2">
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Alert</Badge>
                  </div>
                  <p className="text-sm text-white">
                    Traffic congestion increased 12% in Financial District. Consider infrastructure upgrades.
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
                  <div className="flex items-center mb-2">
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Insight</Badge>
                  </div>
                  <p className="text-sm text-white">
                    Green space coverage optimal in Central Park vicinity. Model for other districts.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Satellite Data */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Satellite className="w-5 h-5 mr-2" />
                  Satellite Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="recent" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/10">
                    <TabsTrigger
                      value="recent"
                      className="text-white data-[state=active]:bg-white data-[state=active]:text-blue-900"
                    >
                      Recent
                    </TabsTrigger>
                    <TabsTrigger
                      value="historical"
                      className="text-white data-[state=active]:bg-white data-[state=active]:text-blue-900"
                    >
                      Historical
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="recent" className="space-y-3 mt-4">
                    <div className="text-sm text-blue-100">
                      <div className="flex justify-between mb-1">
                        <span>Land Use Change</span>
                        <span className="text-green-400">+2.3%</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Urban Expansion</span>
                        <span className="text-yellow-400">+1.8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Green Coverage</span>
                        <span className="text-green-400">+0.9%</span>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="historical" className="space-y-3 mt-4">
                    <div className="text-sm text-blue-100">
                      <div className="flex justify-between mb-1">
                        <span>5-Year Growth</span>
                        <span className="text-green-400">+15.2%</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Infrastructure Dev</span>
                        <span className="text-blue-400">+8.7%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Population Density</span>
                        <span className="text-yellow-400">+12.1%</span>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
