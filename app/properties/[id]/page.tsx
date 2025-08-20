"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Bed,
  Bath,
  SquareIcon as SquareFoot,
  Calendar,
  TrendingUp,
  MapPin,
  Calculator,
  ArrowUp,
  ArrowDown,
  Scale,
  ChevronLeft,
  ChevronRight,
  Home,
  Heart,
  ImageIcon,
  Grid2X2,
  Grid3X3,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { fetchNYCProperties } from "@/data/nyc-properties"
import PriceTrendChart from "@/components/price-trend-chart"
import { useRouter } from "next/navigation"
import ImageGallery from "@/components/image-gallery"
import SimpleImageUploader from "@/components/simple-image-uploader"
import { usePropertyImages } from "@/hooks/use-property-images"

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [comparisonList, setComparisonList] = useState([])
  const router = useRouter()
  const [favorites, setFavorites] = useState([])
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [activeImageCategory, setActiveImageCategory] = useState("all")
  const [displayImages, setDisplayImages] = useState([])
  const [allImages, setAllImages] = useState([])
  const [showImageUploader, setShowImageUploader] = useState(false)

  // Use Supabase images hook
  const {
    images: supabaseImages,
    getImageUrls,
    getPrimaryImageUrl,
    loading: imagesLoading,
    loadImages,
  } = usePropertyImages(params.id)

  // Load property and comparison list
  useEffect(() => {
    const loadProperty = async () => {
      setLoading(true)
      try {
        const properties = await fetchNYCProperties()
        const foundProperty = properties.find((p) => p.id === params.id)

        if (foundProperty) {
          setProperty(foundProperty)

          // Combine all images into a single array for the gallery
          const staticImages = [
            ...(foundProperty.images || []),
            ...(foundProperty.allImages?.exterior?.slice(1) || []),
            ...(foundProperty.allImages?.interior || []),
            ...(foundProperty.allImages?.bedroom || []),
            ...(foundProperty.allImages?.bathroom || []),
          ].filter(Boolean)

          setAllImages(staticImages)
          setDisplayImages(staticImages)
        }

        // Check if there's a comparison list in localStorage
        try {
          const storedList = localStorage.getItem("comparisonList")
          if (storedList) {
            const parsedList = JSON.parse(storedList)
            if (Array.isArray(parsedList)) {
              setComparisonList(parsedList)
            }
          }
        } catch (e) {
          console.error("Failed to parse comparison list from localStorage", e)
        }
      } catch (error) {
        console.error("Failed to load property:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProperty()
  }, [params.id])

  // Update display images when Supabase images are loaded
  useEffect(() => {
    if (!property) return

    // Use Supabase images if available, otherwise fall back to static images
    const supabaseImageUrls = getImageUrls()
    const imagesToUse = supabaseImageUrls.length > 0 ? supabaseImageUrls : allImages

    if (activeImageCategory === "all") {
      setDisplayImages(imagesToUse)
    } else if (activeImageCategory === "exterior") {
      setDisplayImages(property.allImages?.exterior || [])
    } else if (activeImageCategory === "interior") {
      setDisplayImages(property.allImages?.interior || [])
    } else if (activeImageCategory === "bedroom") {
      setDisplayImages(property.allImages?.bedroom || [])
    } else if (activeImageCategory === "bathroom") {
      setDisplayImages(property.allImages?.bathroom || [])
    }

    // Reset current image index when changing categories
    setCurrentImageIndex(0)
  }, [activeImageCategory, property, allImages, supabaseImages, getImageUrls])

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem("propertyFavorites")
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites))
      }
    } catch (e) {
      console.error("Failed to load favorites from localStorage", e)
    }
  }, [])

  // Toggle favorite status for a property
  const toggleFavorite = useCallback(() => {
    if (!property) return

    setFavorites((current) => {
      let newFavorites
      if (current.includes(property.id)) {
        newFavorites = current.filter((id) => id !== property.id)
      } else {
        newFavorites = [...current, property.id]
      }

      // Save to localStorage
      try {
        localStorage.setItem("propertyFavorites", JSON.stringify(newFavorites))
      } catch (e) {
        console.error("Failed to save favorites to localStorage", e)
      }

      return newFavorites
    })
  }, [property])

  const isFavorite = property && favorites.includes(property.id)

  // Memoize the toggle function to avoid recreating it on every render
  const togglePropertyComparison = useCallback(() => {
    if (!property) return

    setComparisonList((current) => {
      let newList

      // If property is already in the list, remove it
      if (current.some((p) => p.id === property.id)) {
        newList = current.filter((p) => p.id !== property.id)
      } else {
        // Otherwise add it (up to 4 properties)
        if (current.length < 4) {
          newList = [...current, property]
        } else {
          // If already at 4 properties, replace the oldest one
          newList = [...current.slice(1), property]
        }
      }

      // Save to localStorage
      try {
        localStorage.setItem("comparisonList", JSON.stringify(newList))
      } catch (e) {
        console.error("Failed to update localStorage", e)
      }

      return newList
    })
  }, [property])

  const isInComparisonList = property && comparisonList.some((p) => p.id === property.id)

  const handleCompareClick = () => {
    if (comparisonList.length > 1) {
      const ids = comparisonList.map((p) => p.id).join(",")
      router.push(`/compare?ids=${ids}`)
    }
  }

  const nextImage = () => {
    if (!displayImages || displayImages.length === 0) return
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % displayImages.length)
  }

  const prevImage = () => {
    if (!displayImages || displayImages.length === 0) return
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + displayImages.length) % displayImages.length)
  }

  const openGallery = () => {
    setGalleryOpen(true)
  }

  if (loading || imagesLoading) {
    return (
      <div className="container px-4 py-8 mx-auto md:px-6 md:py-12">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/properties" className="gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back to Properties
            </Link>
          </Button>
        </div>
        <div className="h-[600px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-2"></div>
            <p>Loading property details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="container px-4 py-8 mx-auto md:px-6 md:py-12">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/properties" className="gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back to Properties
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/properties">Browse All Properties</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 mx-auto md:px-6 md:py-12">
      <div className="flex items-center justify-between gap-2 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/properties" className="gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back to Properties
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="PropGrowthX Logo" className="h-14 w-auto" />
          <span className="text-3xl font-bold">PropGrowthX</span>

          <Button
            variant="outline"
            size="sm"
            className="gap-1 bg-transparent"
            onClick={() => setShowImageUploader(!showImageUploader)}
          >
            <Upload className="w-4 h-4" />
            Manage Images
          </Button>

          <Button
            variant={isInComparisonList ? "default" : "outline"}
            size="sm"
            className="gap-1"
            onClick={togglePropertyComparison}
          >
            <Scale className="w-4 h-4" />
            {isInComparisonList ? "Remove from Comparison" : "Add to Comparison"}
          </Button>

          <Button variant={isFavorite ? "default" : "outline"} size="sm" className="gap-1" onClick={toggleFavorite}>
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
            {isFavorite ? "Favorited" : "Add to Favorites"}
          </Button>

          {comparisonList.length > 1 && (
            <Button size="sm" className="gap-1" onClick={handleCompareClick}>
              <Scale className="w-4 h-4" />
              Compare ({comparisonList.length})
            </Button>
          )}
        </div>
      </div>

      {/* Image Upload Section */}
      {showImageUploader && (
        <div className="mb-8">
          <SimpleImageUploader propertyId={params.id} onImagesUpdated={loadImages} />
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="relative mb-6 overflow-hidden rounded-lg" style={{ maxHeight: "60vh" }}>
            {displayImages.length > 0 && (
              <img
                src={displayImages[currentImageIndex] || "/placeholder.svg"}
                alt={property.title}
                className="object-cover w-full h-full"
                style={{ maxHeight: "60vh" }}
              />
            )}

            {/* Image navigation */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {displayImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2.5 h-2.5 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Gallery button */}
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-4 right-4 bg-background/80 hover:bg-background"
              onClick={openGallery}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              View Gallery
            </Button>

            {property.priceChangePercent >= 0 ? (
              <Badge className="absolute top-4 right-4 bg-green-500 hover:bg-green-600 flex items-center gap-1">
                <ArrowUp className="w-3 h-3" />
                {property.priceChangePercent.toFixed(1)}%
              </Badge>
            ) : (
              <Badge className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 flex items-center gap-1">
                <ArrowDown className="w-3 h-3" />
                {Math.abs(property.priceChangePercent).toFixed(1)}%
              </Badge>
            )}

            {/* Show Supabase images count if available */}
            {supabaseImages.length > 0 && (
              <Badge className="absolute top-4 left-4 bg-blue-500 hover:bg-blue-600">
                {supabaseImages.length} uploaded images
              </Badge>
            )}
          </div>

          {/* Image category filters */}
          <div className="mb-4">
            <Tabs value={activeImageCategory} onValueChange={setActiveImageCategory}>
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex items-center gap-1">
                  <Grid3X3 className="w-4 h-4" />
                  All Images ({supabaseImages.length > 0 ? supabaseImages.length : allImages.length})
                </TabsTrigger>
                <TabsTrigger value="exterior" className="flex items-center gap-1">
                  <Home className="w-4 h-4" />
                  Exterior ({property.allImages?.exterior?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="interior" className="flex items-center gap-1">
                  <Grid2X2 className="w-4 h-4" />
                  Interior ({property.allImages?.interior?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="bedroom" className="flex items-center gap-1">
                  <Bed className="w-4 h-4" />
                  Bedrooms ({property.allImages?.bedroom?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="bathroom" className="flex items-center gap-1">
                  <Bath className="w-4 h-4" />
                  Bathrooms ({property.allImages?.bathroom?.length || 0})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2" style={{ maxHeight: "80px" }}>
            {displayImages.map((image, index) => (
              <button
                key={index}
                className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                  index === currentImageIndex ? "border-rose-500" : "border-transparent hover:border-gray-300"
                }`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`Property image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold tracking-tight">{property.title}</h1>
            <div className="flex items-center gap-2 mb-4 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{property.address}</span>
            </div>
            <div className="flex flex-wrap gap-6 mb-6">
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{property.bedrooms} Bedrooms</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{property.bathrooms} Bathrooms</span>
              </div>
              <div className="flex items-center gap-2">
                <SquareFoot className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{property.sqft.toLocaleString()} sqft</span>
              </div>
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{property.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Built in {property.yearBuilt}</span>
              </div>
            </div>

            {/* Property features */}
            {property.features && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Property Features</h3>
                <div className="flex flex-wrap gap-2">
                  {property.features.hasParking && <Badge variant="outline">Parking</Badge>}
                  {property.features.hasGarden && <Badge variant="outline">Garden</Badge>}
                  {property.features.hasPool && <Badge variant="outline">Pool</Badge>}
                  {property.features.hasBalcony && <Badge variant="outline">Balcony</Badge>}
                  {property.features.hasElevator && <Badge variant="outline">Elevator</Badge>}
                  {property.features.hasGym && <Badge variant="outline">Gym</Badge>}
                  {property.features.hasDoorman && <Badge variant="outline">Doorman</Badge>}
                  {property.features.isRenovated && <Badge variant="outline">Renovated</Badge>}
                  {property.features.hasWaterView && <Badge variant="outline">Water View</Badge>}
                  {property.features.hasCentralAir && <Badge variant="outline">Central Air</Badge>}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div
                className={`flex items-center gap-2 p-3 rounded-md ${
                  property.priceChangePercent >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                }`}
              >
                {property.priceChangePercent >= 0 ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                <span className="font-medium">
                  Price change: {property.priceChangePercent >= 0 ? "+" : ""}
                  {property.priceChangePercent.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-md">
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Projected ROI: {property.roi}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-sm text-muted-foreground">Current Price</div>
                <div className="text-2xl font-bold">${property.currentPrice.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Predicted Price</div>
                <div className="text-2xl font-bold">${property.predictedPrice.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Price Trend Chart */}
          <PriceTrendChart
            propertyId={property.id}
            currentPrice={property.currentPrice}
            predictedPrice={property.predictedPrice}
            priceChangePercent={property.priceChangePercent}
            className="mb-8"
          />

          <Tabs defaultValue="description">
            <TabsList className="w-full">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="investment">Investment Analysis</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="p-4 mt-4 border rounded-lg">
              <p className="mb-4">
                This exceptional investment property offers a rare combination of prime location, strong rental demand,
                and excellent appreciation potential. Located in a rapidly growing neighborhood with easy access to
                major employment centers, shopping, and entertainment.
              </p>
              <p className="mb-4">
                The property has been well-maintained and features modern finishes throughout. The open floor plan,
                spacious bedrooms, and updated kitchen make it highly attractive to potential tenants, ensuring
                consistent rental income.
              </p>
              <p>
                Based on current market trends and comparable properties in the area, this property is projected to
                deliver an impressive {property.roi}% annual return on investment, making it an excellent addition to
                any investment portfolio.
              </p>
            </TabsContent>
            <TabsContent value="features" className="p-4 mt-4 border rounded-lg">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Interior Features</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>Modern kitchen with stainless steel appliances</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>Hardwood floors throughout main living areas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>Updated bathrooms with modern fixtures</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>Central heating and air conditioning</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>Ample storage space</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Exterior Features</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>Low-maintenance landscaping</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>Attached two-car garage</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>Private backyard with patio</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>New roof (installed 2021)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>Energy-efficient windows</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="investment" className="p-4 mt-4 border rounded-lg">
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Market Analysis</h3>
                  <p>
                    This property is located in a high-growth area with strong rental demand. The neighborhood has seen
                    a {property.priceChangePercent >= 0 ? "positive" : "negative"} price trend of{" "}
                    {property.priceChangePercent.toFixed(1)}% recently.{" "}
                    {property.priceChangePercent >= 0
                      ? "This indicates a strong market with good appreciation potential."
                      : "This could represent a buying opportunity if you believe in the long-term potential of the area."}
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Financial Projection</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-3 border rounded-md">
                      <div className="text-sm text-muted-foreground">Estimated Monthly Rent</div>
                      <div className="text-xl font-bold">${Math.round(property.currentPrice * 0.004)}</div>
                    </div>
                    <div className="p-3 border rounded-md">
                      <div className="text-sm text-muted-foreground">Annual Cash Flow</div>
                      <div className="text-xl font-bold">${Math.round(property.currentPrice * 0.004 * 12 * 0.6)}</div>
                    </div>
                    <div className="p-3 border rounded-md">
                      <div className="text-sm text-muted-foreground">Cap Rate</div>
                      <div className="text-xl font-bold">{(property.roi * 0.8).toFixed(1)}%</div>
                    </div>
                    <div className="p-3 border rounded-md">
                      <div className="text-sm text-muted-foreground">Cash-on-Cash Return</div>
                      <div className="text-xl font-bold">{property.roi}%</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Price Prediction Analysis</h3>
                  <p className="mb-2">
                    Based on our predictive models, this property's value is expected to
                    {property.priceChangePercent >= 0 ? " increase " : " decrease "}
                    by {Math.abs(property.priceChangePercent).toFixed(1)}% in the near future.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 mt-4">
                    <div className="p-3 border rounded-md">
                      <div className="text-sm text-muted-foreground">Current Market Value</div>
                      <div className="text-xl font-bold">${property.currentPrice.toLocaleString()}</div>
                    </div>
                    <div className="p-3 border rounded-md">
                      <div className="text-sm text-muted-foreground">Predicted Future Value</div>
                      <div className="text-xl font-bold">${property.predictedPrice.toLocaleString()}</div>
                    </div>
                    <div className="p-3 border rounded-md">
                      <div className="text-sm text-muted-foreground">Absolute Change</div>
                      <div
                        className={`text-xl font-bold ${property.priceChange >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {property.priceChange >= 0 ? "+" : ""}$
                        {property.priceChange.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                    <div className="p-3 border rounded-md">
                      <div className="text-sm text-muted-foreground">Percent Change</div>
                      <div
                        className={`text-xl font-bold ${property.priceChangePercent >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {property.priceChangePercent >= 0 ? "+" : ""}
                        {property.priceChangePercent.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Investment Recommendation</h3>
                  <p>
                    {property.priceChangePercent >= 5
                      ? "This property shows strong appreciation potential and represents an excellent investment opportunity. The positive price trend indicates a growing market with good future prospects."
                      : property.priceChangePercent >= -5
                        ? "This property shows stable value with moderate growth potential. It could be a solid addition to a balanced investment portfolio."
                        : "This property is currently showing a negative price trend, which could represent a buying opportunity if you believe in the long-term potential of the area. Consider negotiating the purchase price."}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card className="sticky top-20" style={{ maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
            <CardHeader>
              <CardTitle>Investment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="p-4 text-center border rounded-lg">
                  <div
                    className={`text-3xl font-bold ${property.priceChangePercent >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {property.priceChangePercent >= 0 ? "+" : ""}
                    {property.priceChangePercent.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Predicted Price Change</p>
                </div>
                <div className="p-4 text-center border rounded-lg">
                  <div className="text-3xl font-bold text-rose-500">{property.roi}%</div>
                  <p className="text-sm text-muted-foreground">Projected Annual ROI</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Current Price</span>
                  <span className="font-medium">${property.currentPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Predicted Price</span>
                  <span className="font-medium">${property.predictedPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Absolute Change</span>
                  <span className={`font-medium ${property.priceChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {property.priceChange >= 0 ? "+" : ""}$
                    {property.priceChange.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Estimated Monthly Rent</span>
                  <span className="font-medium">${Math.round(property.currentPrice * 0.004)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Monthly Mortgage (20% down)</span>
                  <span className="font-medium">${Math.round(property.currentPrice * 0.8 * 0.005)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Estimated Monthly Expenses</span>
                  <span className="font-medium">${Math.round(property.currentPrice * 0.002)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-medium">Monthly Cash Flow</span>
                  <span className="font-bold text-green-600">
                    $
                    {Math.round(
                      property.currentPrice * 0.004 -
                        property.currentPrice * 0.8 * 0.005 -
                        property.currentPrice * 0.002,
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Button className="w-full" asChild>
                  <Link href={`/calculator?propertyId=${property.id}`}>
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate Mortgage
                  </Link>
                </Button>
                <Button variant="outline" className="w-full bg-transparent" onClick={togglePropertyComparison}>
                  <Scale className="w-4 h-4 mr-2" />
                  {isInComparisonList ? "Remove from Comparison" : "Add to Comparison"}
                </Button>
                <Button variant="outline" className="w-full bg-transparent" onClick={toggleFavorite}>
                  <Heart className={`w-4 h-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                  {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                </Button>
              </div>

              {comparisonList.length > 1 && (
                <Button className="w-full" onClick={handleCompareClick}>
                  <Scale className="w-4 h-4 mr-2" />
                  Compare Properties ({comparisonList.length})
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {galleryOpen && (
        <ImageGallery
          images={displayImages}
          initialIndex={currentImageIndex}
          onClose={() => setGalleryOpen(false)}
          title={property.title}
        />
      )}
    </div>
  )
}
