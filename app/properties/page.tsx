"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, ArrowUpDown, MapPin, List, Heart } from "lucide-react"
import PropertyCard from "@/components/property-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { fetchNYCProperties } from "@/data/nyc-properties"
import PropertyMap from "@/components/property-map"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ImageFilter from "@/components/image-filter"

export default function PropertiesPage() {
  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [priceFilter, setPriceFilter] = useState("any")
  const [changeFilter, setChangeFilter] = useState("any")
  const [sortBy, setSortBy] = useState("priceChangeDesc")
  const [page, setPage] = useState(1)
  const propertiesPerPage = 12
  const [viewMode, setViewMode] = useState("list")
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [imageFilters, setImageFilters] = useState([])
  const [featureFilters, setFeatureFilters] = useState([])

  useEffect(() => {
    const loadProperties = async () => {
      setLoading(true)
      try {
        const data = await fetchNYCProperties()
        setProperties(data)
        setFilteredProperties(data)
      } catch (error) {
        console.error("Failed to load properties:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [])

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
  const toggleFavorite = useCallback((propertyId) => {
    setFavorites((current) => {
      let newFavorites
      if (current.includes(propertyId)) {
        newFavorites = current.filter((id) => id !== propertyId)
      } else {
        newFavorites = [...current, propertyId]
      }

      // Save to localStorage
      try {
        localStorage.setItem("propertyFavorites", JSON.stringify(newFavorites))
      } catch (e) {
        console.error("Failed to save favorites to localStorage", e)
      }

      return newFavorites
    })
  }, [])

  // Check if a property is favorited
  const isFavorite = useCallback(
    (propertyId) => {
      return favorites.includes(propertyId)
    },
    [favorites],
  )

  // Handle property selection on map
  const handlePropertySelect = (property) => {
    setSelectedProperty(property)
  }

  // Helper function to check if a property matches image filters
  const matchesImageFilters = (property) => {
    if (imageFilters.length === 0) return true

    // Check if property has images
    if (!property.images || property.images.length === 0) return false

    // Simple keyword matching for demonstration
    // In a real app, you might use image recognition or metadata
    const imageUrls = property.images.join(" ").toLowerCase()

    return imageFilters.some((filter) => {
      switch (filter) {
        case "exterior":
          return (
            (property.images[0] && property.images[0].includes("exterior")) ||
            property.type === "Single Family" ||
            property.type === "Townhouse" ||
            property.type === "Multi-Family" ||
            property.type === "Condo" ||
            property.type === "Co-op"
          )
        case "interior":
          return property.images.some((img) => img.includes("living") || img.includes("interior"))
        case "bedroom":
          return property.images.some((img) => img.includes("bedroom"))
        case "modern":
          return imageUrls.includes("modern") || imageUrls.includes("contemporary") || property.yearBuilt > 2000
        case "traditional":
          return imageUrls.includes("traditional") || imageUrls.includes("classic") || property.yearBuilt < 1980
        case "luxury":
          return imageUrls.includes("luxury") || property.currentPrice > 1500000
        case "garden":
          return imageUrls.includes("garden") || property.features?.hasGarden
        case "waterView":
          return imageUrls.includes("water") || property.features?.hasWaterView
        case "cityView":
          return imageUrls.includes("city") || (property.type === "Condo" && property.yearBuilt > 2000)
        case "renovated":
          return imageUrls.includes("renovated") || property.features?.isRenovated
        default:
          return false
      }
    })
  }

  // Helper function to check if a property matches feature filters
  const matchesFeatureFilters = (property) => {
    if (featureFilters.length === 0) return true
    if (!property.features) return false

    return featureFilters.every((filter) => {
      switch (filter) {
        case "hasParking":
          return property.features.hasParking
        case "hasGarden":
          return property.features.hasGarden
        case "hasPool":
          return property.features.hasPool
        case "hasBalcony":
          return property.features.hasBalcony
        case "hasElevator":
          return property.features.hasElevator
        case "hasGym":
          return property.features.hasGym
        case "hasDoorman":
          return property.features.hasDoorman
        case "isRenovated":
          return property.features.isRenovated
        case "hasWaterView":
          return property.features.hasWaterView
        case "hasCentralAir":
          return property.features.hasCentralAir
        default:
          return true
      }
    })
  }

  useEffect(() => {
    let result = [...properties]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (property) => property.title.toLowerCase().includes(query) || property.address.toLowerCase().includes(query),
      )
    }

    // Apply price filter
    if (priceFilter !== "any") {
      const [min, max] = priceFilter
        .split("-")
        .map((p) => (p === "max" ? Number.POSITIVE_INFINITY : Number.parseInt(p)))
      result = result.filter((property) => property.currentPrice >= min && property.currentPrice <= max)
    }

    // Apply change filter
    if (changeFilter !== "any") {
      if (changeFilter === "increase") {
        result = result.filter((property) => property.priceChangePercent > 0)
      } else if (changeFilter === "decrease") {
        result = result.filter((property) => property.priceChangePercent < 0)
      } else if (changeFilter === "favorites") {
        result = result.filter((property) => favorites.includes(property.id))
      } else {
        const [min, max] = changeFilter.split("-").map(Number)
        result = result.filter((property) => property.priceChangePercent >= min && property.priceChangePercent <= max)
      }
    }

    // Apply image filters
    if (imageFilters.length > 0) {
      result = result.filter(matchesImageFilters)
    }

    // Apply feature filters
    if (featureFilters.length > 0) {
      result = result.filter(matchesFeatureFilters)
    }

    // Apply sorting
    if (sortBy === "priceAsc") {
      result.sort((a, b) => a.currentPrice - b.currentPrice)
    } else if (sortBy === "priceDesc") {
      result.sort((a, b) => b.currentPrice - a.currentPrice)
    } else if (sortBy === "priceChangeAsc") {
      result.sort((a, b) => a.priceChangePercent - b.priceChangePercent)
    } else if (sortBy === "priceChangeDesc") {
      result.sort((a, b) => b.priceChangePercent - a.priceChangePercent)
    } else if (sortBy === "bedroomsDesc") {
      result.sort((a, b) => b.bedrooms - a.bedrooms)
    } else if (sortBy === "bathroomsDesc") {
      result.sort((a, b) => b.bathrooms - a.bathrooms)
    } else if (sortBy === "sqftDesc") {
      result.sort((a, b) => b.sqft - a.sqft)
    } else if (sortBy === "newest") {
      result.sort((a, b) => b.yearBuilt - a.yearBuilt)
    }

    setFilteredProperties(result)
    setPage(1) // Reset to first page when filters change
  }, [properties, searchQuery, priceFilter, changeFilter, sortBy, favorites, imageFilters, featureFilters])

  // Calculate pagination
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage)
  const paginatedProperties = filteredProperties.slice((page - 1) * propertiesPerPage, page * propertiesPerPage)

  return (
    <div className="container px-4 py-8 mx-auto md:px-6 md:py-12">
      <div className="flex items-center gap-2">
        <img src="/logo.png" alt="PropGrowthX Logo" className="h-14 w-auto" />
        <span className="text-3xl font-bold">PropGrowthX</span>
      </div>
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">NYC Investment Properties</h1>
        <p className="text-muted-foreground">
          {loading
            ? "Loading properties..."
            : `Browse our curated list of ${filteredProperties.length} NYC investment opportunities`}
        </p>
      </div>

      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-end">
        <div className="flex-1 space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by location, property type..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Price</SelectItem>
              <SelectItem value="0-500000">Under $500k</SelectItem>
              <SelectItem value="500000-1000000">$500k - $1M</SelectItem>
              <SelectItem value="1000000-2000000">$1M - $2M</SelectItem>
              <SelectItem value="2000000-max">Over $2M</SelectItem>
            </SelectContent>
          </Select>

          <Select value={changeFilter} onValueChange={setChangeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Price Change" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Change</SelectItem>
              <SelectItem value="increase">Price Increase</SelectItem>
              <SelectItem value="decrease">Price Decrease</SelectItem>
              <SelectItem value="15-100">+15% or more</SelectItem>
              <SelectItem value="5-15">+5% to +15%</SelectItem>
              <SelectItem value="-5-5">-5% to +5%</SelectItem>
              <SelectItem value="-15--5">-15% to -5%</SelectItem>
              <SelectItem value="-100--15">-15% or less</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priceChangeDesc">Highest % Change</SelectItem>
              <SelectItem value="priceChangeAsc">Lowest % Change</SelectItem>
              <SelectItem value="priceDesc">Highest Price</SelectItem>
              <SelectItem value="priceAsc">Lowest Price</SelectItem>
              <SelectItem value="bedroomsDesc">Most Bedrooms</SelectItem>
              <SelectItem value="bathroomsDesc">Most Bathrooms</SelectItem>
              <SelectItem value="sqftDesc">Largest Size</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={changeFilter === "favorites" ? "default" : "outline"}
            size="sm"
            className="gap-1"
            onClick={() => setChangeFilter(changeFilter === "favorites" ? "any" : "favorites")}
          >
            <Heart className={`w-4 h-4 ${changeFilter === "favorites" ? "fill-current" : ""}`} />
            Favorites
          </Button>
        </div>
      </div>

      {/* Image filters */}
      <div className="mb-6">
        <ImageFilter onFilterChange={setImageFilters} activeFilters={imageFilters} />
      </div>

      <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <Badge variant="outline" className="flex items-center gap-1 py-2 px-3">
            <ArrowUpDown className="w-3.5 h-3.5" />
            {filteredProperties.length} properties
          </Badge>

          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground mr-4">
              Showing {Math.min(filteredProperties.length, (page - 1) * propertiesPerPage + 1)} -{" "}
              {Math.min(filteredProperties.length, page * propertiesPerPage)} of {filteredProperties.length}
            </div>

            <TabsList className="grid grid-cols-2 w-[160px]">
              <TabsTrigger value="list" className="flex items-center gap-1">
                <List className="w-4 h-4" />
                List
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Map
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="list" className="mt-0">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array(8)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="h-[300px] rounded-lg border bg-muted animate-pulse"></div>
                ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <h2 className="text-xl font-semibold mb-2">No properties found</h2>
              <p className="text-muted-foreground mb-6">Try adjusting your filters to see more results</p>
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setPriceFilter("any")
                  setChangeFilter("any")
                  setImageFilters([])
                  setFeatureFilters([])
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onFavoriteToggle={() => toggleFavorite(property.id)}
                  isFavorite={isFavorite(property.id)}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="map" className="mt-0">
          <div className="grid gap-6 lg:grid-cols-[1fr_350px] lg:gap-8">
            {loading ? (
              <div className="h-[600px] rounded-lg border bg-muted flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-2"></div>
                  <p>Loading property map...</p>
                </div>
              </div>
            ) : (
              <PropertyMap
                properties={filteredProperties}
                className="h-[600px] rounded-lg border bg-muted"
                onPropertySelect={handlePropertySelect}
                selectedProperty={selectedProperty}
              />
            )}
            <div className="grid gap-4 content-start max-h-[600px] overflow-y-auto">
              <h2 className="text-xl font-semibold sticky top-0 bg-background z-10 py-2">
                {selectedProperty ? "Selected Property" : "Featured Properties"}
              </h2>
              <div className="grid gap-4">
                {selectedProperty ? (
                  <div id={`property-${selectedProperty.id}`}>
                    <PropertyCard
                      key={selectedProperty.id}
                      property={selectedProperty}
                      isSelected={true}
                      onFavoriteToggle={() => toggleFavorite(selectedProperty.id)}
                      isFavorite={isFavorite(selectedProperty.id)}
                    />
                  </div>
                ) : (
                  filteredProperties.slice(0, 3).map((property) => (
                    <div key={property.id} id={`property-${property.id}`}>
                      <PropertyCard
                        property={property}
                        onClick={() => handlePropertySelect(property)}
                        onFavoriteToggle={() => toggleFavorite(property.id)}
                        isFavorite={isFavorite(property.id)}
                      />
                    </div>
                  ))
                )}
              </div>
              {selectedProperty ? (
                <Button variant="outline" onClick={() => setSelectedProperty(null)}>
                  Show All Properties
                </Button>
              ) : null}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
