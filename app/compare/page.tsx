"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Bed, Bath, SquareIcon as SquareFoot, Calendar, MapPin, Scale, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchNYCProperties } from "@/data/nyc-properties"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"

export default function ComparePropertiesPage() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [comparisonIds, setComparisonIds] = useState([])

  // Replace the two separate useEffect hooks with a single combined one that handles both ID extraction and property loading

  // And replace them with this single useEffect:
  useEffect(() => {
    const loadPropertiesForComparison = async () => {
      setLoading(true)

      // Extract IDs from URL or localStorage
      let propertyIds = []

      if (searchParams.get("ids")) {
        propertyIds = searchParams.get("ids").split(",")
      } else {
        // Try to get from localStorage
        try {
          const storedList = localStorage.getItem("comparisonList")
          if (storedList) {
            const list = JSON.parse(storedList)
            if (Array.isArray(list) && list.length > 0) {
              propertyIds = list.map((p) => p.id)
            }
          }
        } catch (e) {
          console.error("Failed to parse comparison list from localStorage", e)
        }
      }

      // Set comparison IDs without triggering another effect
      setComparisonIds(propertyIds)

      if (propertyIds.length === 0) {
        setProperties([])
        setLoading(false)
        return
      }

      try {
        // Fetch all properties
        const allProperties = await fetchNYCProperties()

        // Filter to only the ones we want to compare
        const selectedProperties = allProperties.filter((p) => propertyIds.includes(p.id))

        setProperties(selectedProperties)
      } catch (error) {
        console.error("Failed to load properties for comparison:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPropertiesForComparison()
    // Only depend on searchParams to prevent infinite loops
  }, [searchParams])

  // Also update the removeProperty function to avoid triggering multiple state updates
  const removeProperty = (propertyId) => {
    // Update the UI and comparisonIds in a single operation
    setProperties((current) => {
      const updatedProperties = current.filter((p) => p.id !== propertyId)

      // Update localStorage with the new list
      try {
        const updatedIds = updatedProperties.map((p) => p.id)
        setComparisonIds(updatedIds)

        const storedList = localStorage.getItem("comparisonList")
        if (storedList) {
          const list = JSON.parse(storedList)
          const updatedList = list.filter((p) => p.id !== propertyId)
          localStorage.setItem("comparisonList", JSON.stringify(updatedList))
        }
      } catch (e) {
        console.error("Failed to update localStorage", e)
      }

      return updatedProperties
    })
  }

  // Prepare chart data
  const priceChartData = properties.map((property) => ({
    name: property.title.split(" in ")[1] || property.title,
    currentPrice: property.currentPrice,
    predictedPrice: property.predictedPrice,
    id: property.id,
  }))

  const roiChartData = properties.map((property) => ({
    name: property.title.split(" in ")[1] || property.title,
    roi: property.roi,
    id: property.id,
  }))

  const priceChangeChartData = properties.map((property) => ({
    name: property.title.split(" in ")[1] || property.title,
    priceChange: property.priceChangePercent,
    id: property.id,
  }))

  const cashFlowChartData = properties.map((property) => {
    const monthlyRent = Math.round(property.currentPrice * 0.004)
    const monthlyMortgage = Math.round(property.currentPrice * 0.8 * 0.005)
    const monthlyExpenses = Math.round(property.currentPrice * 0.001)
    const cashFlow = monthlyRent - monthlyMortgage - monthlyExpenses

    return {
      name: property.title.split(" in ")[1] || property.title,
      cashFlow: cashFlow,
      id: property.id,
    }
  })

  if (loading) {
    return (
      <div className="container px-4 py-8 mx-auto md:px-6 md:py-12">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back to Properties
            </Link>
          </Button>
        </div>
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-2"></div>
            <p>Loading property comparison...</p>
          </div>
        </div>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="container px-4 py-8 mx-auto md:px-6 md:py-12">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back to Properties
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <Scale className="w-16 h-16 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Properties to Compare</h2>
          <p className="text-muted-foreground mb-6">
            You haven't selected any properties to compare yet. Browse properties and add them to your comparison list.
          </p>
          <Button asChild>
            <Link href="/properties">Browse Properties</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 mx-auto md:px-6 md:py-12">
      <div className="flex items-center justify-between gap-2 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" className="gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back to Properties
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="PropGrowthX Logo" className="h-14 w-auto" />
          <span className="text-3xl font-bold">PropGrowthX</span>
        </div>
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-8">Property Comparison</h1>

      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="w-full grid grid-cols-4 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 bg-muted">Property</th>
                  {properties.map((property) => (
                    <th key={property.id} className="p-3 min-w-[250px]">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-left">{property.title}</div>
                          <div className="text-xs text-muted-foreground text-left">{property.address}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 -mt-1 -mr-1"
                          onClick={() => removeProperty(property.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">Image</td>
                  {properties.map((property) => {
                    const image =
                      property.images?.[0] ||
                      `/placeholder.svg?height=150&width=250&text=${encodeURIComponent(`${property.title} - Exterior`)}`

                    return (
                      <td key={property.id} className="p-3">
                        <Link href={`/properties/${property.id}`}>
                          <div className="rounded-md overflow-hidden">
                            <img
                              src={image || "/placeholder.svg"}
                              alt={property.title}
                              className="w-full h-32 object-cover"
                            />
                          </div>
                        </Link>
                      </td>
                    )
                  })}
                </tr>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">Current Price</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3 font-bold">
                      ${property.currentPrice.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">Predicted Price</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3">
                      ${property.predictedPrice.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">Price Change</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3">
                      <span className={property.priceChangePercent >= 0 ? "text-green-600" : "text-red-600"}>
                        {property.priceChangePercent >= 0 ? "+" : ""}
                        {property.priceChangePercent.toFixed(1)}%
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">Property Type</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3">
                      {property.type}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">Bedrooms</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3">
                      {property.bedrooms}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">Bathrooms</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3">
                      {property.bathrooms}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">Square Footage</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3">
                      {property.sqft.toLocaleString()} sqft
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">Year Built</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3">
                      {property.yearBuilt}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">Actions</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3">
                      <Button asChild size="sm">
                        <Link href={`/properties/${property.id}`}>View Details</Link>
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="financial">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 bg-muted">Financial Metrics</th>
                  {properties.map((property) => (
                    <th key={property.id} className="p-3 min-w-[250px]">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-left">{property.title}</div>
                          <div className="text-xs text-muted-foreground text-left">
                            ${property.currentPrice.toLocaleString()}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 -mt-1 -mr-1"
                          onClick={() => removeProperty(property.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">Projected ROI</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3 font-bold text-rose-500">
                      {property.roi}%
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">Price Change</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3">
                      <span className={property.priceChangePercent >= 0 ? "text-green-600" : "text-red-600"}>
                        {property.priceChangePercent >= 0 ? "+" : ""}
                        {property.priceChangePercent.toFixed(1)}%
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">Absolute Price Change</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3">
                      <span className={property.priceChange >= 0 ? "text-green-600" : "text-red-600"}>
                        {property.priceChange >= 0 ? "+" : ""}$
                        {Math.abs(property.priceChange).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">Monthly Rent (Est.)</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3">
                      ${Math.round(property.currentPrice * 0.004).toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">Monthly Mortgage (20% down)</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3">
                      ${Math.round(property.currentPrice * 0.8 * 0.005).toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">Monthly Expenses (Est.)</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3">
                      ${Math.round(property.currentPrice * 0.001).toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">Monthly Cash Flow</td>
                  {properties.map((property) => {
                    const monthlyRent = Math.round(property.currentPrice * 0.004)
                    const monthlyMortgage = Math.round(property.currentPrice * 0.8 * 0.005)
                    const monthlyExpenses = Math.round(property.currentPrice * 0.001)
                    const cashFlow = monthlyRent - monthlyMortgage - monthlyExpenses

                    return (
                      <td key={property.id} className="p-3 font-bold text-green-600">
                        ${cashFlow.toLocaleString()}
                      </td>
                    )
                  })}
                </tr>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">Annual Cash Flow</td>
                  {properties.map((property) => {
                    const monthlyRent = Math.round(property.currentPrice * 0.004)
                    const monthlyMortgage = Math.round(property.currentPrice * 0.8 * 0.005)
                    const monthlyExpenses = Math.round(property.currentPrice * 0.001)
                    const annualCashFlow = (monthlyRent - monthlyMortgage - monthlyExpenses) * 12

                    return (
                      <td key={property.id} className="p-3">
                        ${annualCashFlow.toLocaleString()}
                      </td>
                    )
                  })}
                </tr>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">Cap Rate</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3">
                      {(property.roi * 0.8).toFixed(1)}%
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">5-Year Appreciation (Est.)</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3">
                      ${Math.round(property.currentPrice * 0.18).toLocaleString()}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="features">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 bg-muted">Features</th>
                  {properties.map((property) => (
                    <th key={property.id} className="p-3 min-w-[250px]">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-left">{property.title}</div>
                          <div className="text-xs text-muted-foreground text-left">{property.type}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 -mt-1 -mr-1"
                          onClick={() => removeProperty(property.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">Property Type</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3">
                      {property.type}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">Bedrooms</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3">
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4 text-muted-foreground" />
                        <span>{property.bedrooms}</span>
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">Bathrooms</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3">
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4 text-muted-foreground" />
                        <span>{property.bathrooms}</span>
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">Square Footage</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3">
                      <div className="flex items-center gap-1">
                        <SquareFoot className="w-4 h-4 text-muted-foreground" />
                        <span>{property.sqft.toLocaleString()} sqft</span>
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">Year Built</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{property.yearBuilt}</span>
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">Price per Sqft</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3">
                      ${Math.round(property.currentPrice / property.sqft).toLocaleString()}/sqft
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 bg-muted font-medium">Location</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{property.address.split(",")[1]?.trim() || property.address}</span>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="charts">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Price Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priceChartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={70} />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Price"]} />
                      <Legend />
                      <Bar name="Current Price" dataKey="currentPrice" fill="#94a3b8" />
                      <Bar name="Predicted Price" dataKey="predictedPrice" fill="#f43f5e" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ROI Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roiChartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={70} />
                      <YAxis tickFormatter={(value) => `${value}%`} />
                      <Tooltip formatter={(value) => [`${value}%`, "ROI"]} />
                      <Legend />
                      <Bar name="Projected ROI" dataKey="roi" fill="#f43f5e" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Price Change Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priceChangeChartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={70} />
                      <YAxis tickFormatter={(value) => `${value}%`} />
                      <Tooltip formatter={(value) => [`${value}%`, "Price Change"]} />
                      <Legend />
                      <Bar name="Price Change %" dataKey="priceChange" fill="#10b981">
                        {priceChangeChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.priceChange >= 0 ? "#10b981" : "#ef4444"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Cash Flow Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cashFlowChartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={70} />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip formatter={(value) => [`$${value}`, "Monthly Cash Flow"]} />
                      <Legend />
                      <Bar name="Monthly Cash Flow" dataKey="cashFlow" fill="#10b981">
                        {cashFlowChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.cashFlow >= 0 ? "#10b981" : "#ef4444"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center mt-8">
        <Button asChild>
          <Link href="/properties">Browse More Properties</Link>
        </Button>
      </div>
    </div>
  )
}
