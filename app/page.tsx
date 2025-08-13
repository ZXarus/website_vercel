"use client"

import { useState, useEffect, useCallback } from "react"
import { Filter, Search, Calculator, Menu, ArrowUpDown, BarChart2, Scale } from "lucide-react"
import Link from "next/link"
import PropertyMap from "@/components/property-map"
import PropertyCard from "@/components/property-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { fetchNYCProperties } from "@/data/nyc-properties"
import { useRouter } from "next/navigation"
import GovernmentDashboard from "@/components/government-dashboard"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// This component preloads bathroom images for better performance
function ImagePreloader() {
  useEffect(() => {
    const preloadImage = (src: string) => {
      const img = new Image()
      img.src = src
    }

    // Preload all bathroom images
    for (let i = 1; i <= 10; i++) {
      preloadImage(`/images/bathroom-${i}.jpeg`)
    }
  }, [])

  return null
}

export default function HomePage() {
  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [priceFilter, setPriceFilter] = useState("any")
  const [changeFilter, setChangeFilter] = useState("any")
  const [sortBy, setSortBy] = useState("priceChangeDesc")
  const [comparisonList, setComparisonList] = useState([])
  const router = useRouter()
  const [favorites, setFavorites] = useState([])
  const [currentMode, setCurrentMode] = useState<"investor" | "government">("investor")

  // Load properties on component mount
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

  // Load comparison list from localStorage on initial render
  useEffect(() => {
    try {
      const storedList = localStorage.getItem("comparisonList")
      if (storedList) {
        const parsedList = JSON.parse(storedList)
        if (Array.isArray(parsedList)) {
          setComparisonList(parsedList)
        }
      }
    } catch (e) {
      console.error("Failed to load comparison list from localStorage", e)
    }
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

  const handleModeChange = (mode: "investor" | "government") => {
    setCurrentMode(mode)
  }

  // Toggle favorite status for a property
  const toggleFavorite = useCallback((propertyId: string) => {
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
    (propertyId: string) => {
      return favorites.includes(propertyId)
    },
    [favorites],
  )

  // Filter properties based on search and filter criteria
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
      } else {
        const [min, max] = changeFilter.split("-").map(Number)
        result = result.filter((property) => property.priceChangePercent >= min && property.priceChangePercent <= max)
      }
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
    }

    setFilteredProperties(result)
  }, [properties, searchQuery, priceFilter, changeFilter, sortBy])

  const handlePropertySelect = (property: any) => {
    setSelectedProperty(property)

    // Scroll to the property in the list if on mobile
    if (property && window.innerWidth < 768) {
      const element = document.getElementById(`property-${property.id}`)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }

  // Toggle property in comparison list
  const togglePropertyComparison = useCallback((property: any) => {
    setComparisonList((current) => {
      // If property is already in the list, remove it
      if (current.some((p) => p.id === property.id)) {
        const newList = current.filter((p) => p.id !== property.id)

        // Update localStorage
        try {
          localStorage.setItem("comparisonList", JSON.stringify(newList))
        } catch (e) {
          console.error("Failed to update localStorage", e)
        }

        return newList
      }

      // Otherwise add it (up to 4 properties)
      let newList
      if (current.length < 4) {
        newList = [...current, property]
      } else {
        // If already at 4 properties, replace the oldest one
        newList = [...current.slice(1), property]
      }

      // Update localStorage
      try {
        localStorage.setItem("comparisonList", JSON.stringify(newList))
      } catch (e) {
        console.error("Failed to update localStorage", e)
      }

      return newList
    })
  }, [])

  const isInComparisonList = useCallback(
    (propertyId: string) => {
      return comparisonList.some((p) => p.id === propertyId)
    },
    [comparisonList],
  )

  const handleCompareClick = () => {
    if (comparisonList.length > 1) {
      const ids = comparisonList.map((p) => p.id).join(",")
      router.push(`/compare?ids=${ids}`)
    }
  }

  const clearComparisonList = () => {
    setComparisonList([])
    try {
      localStorage.removeItem("comparisonList")
    } catch (e) {
      console.error("Failed to clear localStorage", e)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <ImagePreloader />

      {/* Header Section */}
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="PropGrowthX Logo" className="h-16 w-auto" />
            <span className="text-3xl font-bold">PropGrowthX</span>
          </Link>

          {/* Mode Toggle */}
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <button
              onClick={() => handleModeChange("investor")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentMode === "investor"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Investor
            </button>
            <button
              onClick={() => handleModeChange("government")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentMode === "government"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Government
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/" className="font-medium transition-colors hover:text-foreground/80">
                Home
              </Link>
              <Link href="/map" className="font-medium transition-colors hover:text-foreground/80 text-rose-500">
                Interactive Map
              </Link>
              <Link href="/properties" className="font-medium transition-colors hover:text-foreground/80">
                Properties
              </Link>
              <Link href="/calculator" className="font-medium transition-colors hover:text-foreground/80">
                ROI Calculator
              </Link>
            </nav>

            {comparisonList.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1 bg-transparent"
                onClick={handleCompareClick}
                disabled={comparisonList.length < 2}
              >
                <Scale className="w-4 h-4" />
                Compare ({comparisonList.length})
              </Button>
            )}

            <Button variant="outline" size="sm" className="gap-1 bg-transparent">
              <Calculator className="w-4 h-4" />
              Calculate ROI
            </Button>

            <Link href="/signin.html" passHref>
              <Button size="sm" className="gap-1">
              Sign In
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden bg-transparent">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex items-center gap-2 mt-4 mb-6">
                <img src="/logo.png" alt="PropGrowthX Logo" className="h-16 w-auto" />
                <span className="text-3xl font-bold">PropGrowthX</span>
              </div>
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="text-lg font-medium">
                  Home
                </Link>
                <Link href="/map" className="text-lg font-medium text-rose-500">
                  Interactive Map
                </Link>
                <Link href="/properties" className="text-lg font-medium">
                  Properties
                </Link>
                <Link href="/calculator" className="text-lg font-medium">
                  ROI Calculator
                </Link>
                {comparisonList.length > 0 && (
                  <Button
                    variant="outline"
                    className="gap-1 mt-2 bg-transparent"
                    onClick={handleCompareClick}
                    disabled={comparisonList.length < 2}
                  >
                    <Scale className="w-4 h-4" />
                    Compare ({comparisonList.length})
                  </Button>
                )}
                <Button className="mt-4">Sign In</Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      {currentMode === "government" ? (
        <GovernmentDashboard />
      ) : (
        <main className="flex-1">
          {/* Hero Section */}
          <section className="container px-4 py-6 md:px-6 md:py-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Investment Properties</h1>
                <p className="text-muted-foreground">
                  {loading
                    ? "Loading properties..."
                    : `${filteredProperties.length} properties with predicted value changes out of ${properties.length} total`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search locations..."
                    className="w-full pl-8 bg-background"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </div>
            </div>
          </section>

          {/* Filters Section */}
          <section className="container px-4 md:px-6 mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
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
                </SelectContent>
              </Select>

              <Badge variant="outline" className="flex items-center gap-1 py-2 px-3">
                <ArrowUpDown className="w-3.5 h-3.5" />
                {filteredProperties.length} properties
              </Badge>
            </div>

            {/* Comparison List */}
            {comparisonList.length > 0 && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    Comparison List ({comparisonList.length}/4)
                  </h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={clearComparisonList}>
                      Clear All
                    </Button>
                    <Button size="sm" onClick={handleCompareClick} disabled={comparisonList.length < 2}>
                      Compare Now
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {comparisonList.map((property) => (
                    <div key={property.id} className="flex-shrink-0 w-48 relative">
                      <div className="rounded-md overflow-hidden border">
                        <img
                          src={property.images?.[0] || "/placeholder.svg?height=60&width=120"}
                          alt={property.title}
                          className="w-full h-16 object-cover"
                        />
                        <div className="p-2">
                          <div className="text-sm font-medium truncate">{property.title}</div>
                          <div className="text-xs text-muted-foreground">${property.currentPrice.toLocaleString()}</div>
                        </div>
                      </div>
                      <button
                        className="absolute top-1 right-1 bg-background rounded-full w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground"
                        onClick={() => togglePropertyComparison(property)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map and List Tabs */}
            <Tabs defaultValue="map" className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-6">
                <TabsTrigger value="map">Map View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>

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
                            onCompareToggle={togglePropertyComparison}
                            isInComparisonList={isInComparisonList(selectedProperty.id)}
                            onFavoriteToggle={() => toggleFavorite(selectedProperty.id)}
                            isFavorite={isFavorite(selectedProperty.id)}
                          />
                        </div>
                      ) : (
                        properties.slice(0, 3).map((property) => (
                          <div key={property.id} id={`property-${property.id}`}>
                            <PropertyCard
                              property={property}
                              onClick={() => handlePropertySelect(property)}
                              onCompareToggle={togglePropertyComparison}
                              isInComparisonList={isInComparisonList(property.id)}
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
                    ) : (
                      <Button asChild className="mt-2">
                        <Link href="/properties">View All Properties</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="list" className="mt-0">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {loading
                    ? Array(20)
                        .fill(0)
                        .map((_, i) => (
                          <div key={i} className="h-[300px] rounded-lg border bg-muted animate-pulse"></div>
                        ))
                    : properties.slice(0, 20).map((property) => (
                        <div key={property.id} id={`property-${property.id}`}>
                          <PropertyCard
                            property={property}
                            onClick={() => handlePropertySelect(property)}
                            isSelected={selectedProperty?.id === property.id}
                            onCompareToggle={togglePropertyComparison}
                            isInComparisonList={isInComparisonList(property.id)}
                            onFavoriteToggle={() => toggleFavorite(property.id)}
                            isFavorite={isFavorite(property.id)}
                          />
                        </div>
                      ))}
                </div>
                <div className="flex justify-center mt-8">
                  <Button variant="outline" className="gap-1 bg-transparent">
                    Load More Properties
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </section>

          {/* Features Section */}
          <section className="container px-4 py-12 md:px-6 md:py-16">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center gap-2 p-6 text-center rounded-lg border bg-background">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                  <Calculator className="h-6 w-6 text-rose-500" />
                </div>
                <h3 className="text-xl font-semibold">ROI Calculator</h3>
                <p className="text-sm text-muted-foreground">
                  Calculate potential returns on your investment properties with our advanced ROI calculator.
                </p>
                <Button asChild variant="outline" className="mt-4 bg-transparent">
                  <Link href="/calculator">Calculate Now</Link>
                </Button>
              </div>
              <div className="flex flex-col items-center gap-2 p-6 text-center rounded-lg border bg-background">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                  <BarChart2 className="h-6 w-6 text-rose-500" />
                </div>
                <h3 className="text-xl font-semibold">Price Trend Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Explore historical and predicted price trends to make informed investment decisions.
                </p>
                <Button asChild variant="outline" className="mt-4 bg-transparent">
                  <Link href="/trends">View Trends</Link>
                </Button>
              </div>
              <div className="flex flex-col items-center gap-2 p-6 text-center rounded-lg border bg-background md:col-span-2 lg:col-span-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                  <Scale className="h-6 w-6 text-rose-500" />
                </div>
                <h3 className="text-xl font-semibold">Property Comparison</h3>
                <p className="text-sm text-muted-foreground">
                  Compare multiple properties side by side to find the best investment opportunity.
                </p>
                <Button asChild variant="outline" className="mt-4 bg-transparent">
                  <Link href="/compare">Compare Properties</Link>
                </Button>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container flex flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-6 md:py-8">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="PropGrowthX Logo" className="h-12 w-auto" />
            <span className="text-2xl font-bold">PropGrowthX</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 PropGrowthX. All rights reserved.</p>
          <nav className="flex gap-4 text-sm">
            <Link href="#" className="text-muted-foreground hover:underline">
              Terms
            </Link>
            <Link href="#" className="text-muted-foreground hover:underline">
              Privacy
            </Link>
            <Link href="#" className="text-muted-foreground hover:underline">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
