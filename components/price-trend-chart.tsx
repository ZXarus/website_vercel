"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts"

interface PriceTrendChartProps {
  propertyId: string
  currentPrice: number
  predictedPrice: number
  priceChangePercent: number
  className?: string
}

export default function PriceTrendChart({
  propertyId,
  currentPrice,
  predictedPrice,
  priceChangePercent,
  className,
}: PriceTrendChartProps) {
  const [historicalData, setHistoricalData] = useState([])
  const [futureData, setFutureData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Generate historical data (past 5 years)
    const generateHistoricalData = () => {
      const data = []
      const currentYear = new Date().getFullYear()
      const startPrice = currentPrice * (1 - (Math.random() * 0.2 + 0.1)) // 10-30% lower than current price

      // Generate quarterly data for the past 5 years
      for (let year = currentYear - 5; year <= currentYear; year++) {
        for (let quarter = 1; quarter <= 4; quarter++) {
          // Skip future quarters in current year
          if (year === currentYear && quarter > Math.ceil((new Date().getMonth() + 1) / 3)) {
            continue
          }

          const timeProgress = ((year - (currentYear - 5)) * 4 + quarter) / (5 * 4)
          const randomFactor = 1 + (Math.random() * 0.06 - 0.03) // Random fluctuation ±3%
          const price = startPrice + (currentPrice - startPrice) * timeProgress * randomFactor

          data.push({
            date: `Q${quarter} ${year}`,
            price: Math.round(price),
            formattedPrice: `$${Math.round(price).toLocaleString()}`,
          })
        }
      }

      return data
    }

    // Generate future data (next 3 years)
    const generateFutureData = () => {
      const data = []
      const currentYear = new Date().getFullYear()
      const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3)

      // Add current price as starting point
      data.push({
        date: `Q${currentQuarter} ${currentYear}`,
        price: currentPrice,
        formattedPrice: `$${currentPrice.toLocaleString()}`,
      })

      // Generate quarterly data for the next 3 years
      for (let year = currentYear; year <= currentYear + 3; year++) {
        for (let quarter = 1; quarter <= 4; quarter++) {
          // Skip past quarters in current year
          if (year === currentYear && quarter <= currentQuarter) {
            continue
          }

          const timeProgress = ((year - currentYear) * 4 + quarter - currentQuarter) / (3 * 4)
          const randomFactor = 1 + (Math.random() * 0.04 - 0.02) // Random fluctuation ±2%
          const price = currentPrice + (predictedPrice - currentPrice) * timeProgress * randomFactor

          data.push({
            date: `Q${quarter} ${year}`,
            price: Math.round(price),
            formattedPrice: `$${Math.round(price).toLocaleString()}`,
          })
        }
      }

      return data
    }

    setHistoricalData(generateHistoricalData())
    setFutureData(generateFutureData())
    setLoading(false)
  }, [propertyId, currentPrice, predictedPrice])

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Price Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
        </CardContent>
      </Card>
    )
  }

  // Combine historical and future data for the full view
  const combinedData = [...historicalData, ...futureData.slice(1)]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Price Trend Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="combined">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="combined">Full View</TabsTrigger>
            <TabsTrigger value="historical">Historical</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
          </TabsList>

          <TabsContent value="combined">
            <ChartContainer
              config={{
                historical: {
                  label: "Historical Price",
                  color: "#94a3b8",
                },
                forecast: {
                  label: "Forecasted Price",
                  color: "#f43f5e",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} interval={Math.floor(combinedData.length / 6)} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, "Price"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <ReferenceLine
                    x={historicalData[historicalData.length - 1].date}
                    stroke="#888"
                    strokeDasharray="3 3"
                    label={{ value: "Current", position: "insideTopRight", fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#94a3b8"
                    fillOpacity={1}
                    fill="url(#colorHistorical)"
                    data={historicalData}
                    name="Historical Price"
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#f43f5e"
                    fillOpacity={1}
                    fill="url(#colorForecast)"
                    data={futureData}
                    name="Forecasted Price"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 text-sm text-center text-muted-foreground">
              Projected {priceChangePercent >= 0 ? "increase" : "decrease"} of {Math.abs(priceChangePercent).toFixed(1)}
              % over the forecast period
            </div>
          </TabsContent>

          <TabsContent value="historical">
            <ChartContainer
              config={{
                price: {
                  label: "Property Price",
                  color: "#94a3b8",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, "Price"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="price" stroke="#94a3b8" activeDot={{ r: 8 }} name="Historical Price" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 text-sm text-center text-muted-foreground">
              Historical price data for the past 5 years
            </div>
          </TabsContent>

          <TabsContent value="forecast">
            <ChartContainer
              config={{
                price: {
                  label: "Forecasted Price",
                  color: "#f43f5e",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={futureData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, "Price"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="price" stroke="#f43f5e" activeDot={{ r: 8 }} name="Forecasted Price" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 text-sm text-center text-muted-foreground">
              Price forecast for the next 3 years based on market trends
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
