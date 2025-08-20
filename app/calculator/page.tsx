"use client"

import { useState } from "react"
import { Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChartContainer, ChartLegend, ChartLegendItem } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"

export default function ROICalculatorPage() {
  const [purchasePrice, setPurchasePrice] = useState(300000)
  const [downPayment, setDownPayment] = useState(20)
  const [interestRate, setInterestRate] = useState(4.5)
  const [rentalIncome, setRentalIncome] = useState(2500)
  const [propertyTax, setPropertyTax] = useState(3000)
  const [insurance, setInsurance] = useState(1200)
  const [maintenance, setMaintenance] = useState(1800)
  const [vacancy, setVacancy] = useState(5)
  const [propertyManagement, setPropertyManagement] = useState(10)
  const [appreciationRate, setAppreciationRate] = useState(3)
  const [holdingPeriod, setHoldingPeriod] = useState(5)

  // Calculate mortgage payment
  const loanAmount = purchasePrice * (1 - downPayment / 100)
  const monthlyInterestRate = interestRate / 100 / 12
  const numberOfPayments = 30 * 12
  const monthlyMortgagePayment =
    (loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments))) /
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)

  // Calculate expenses
  const monthlyPropertyTax = propertyTax / 12
  const monthlyInsurance = insurance / 12
  const monthlyMaintenance = maintenance / 12
  const monthlyVacancy = rentalIncome * (vacancy / 100)
  const monthlyPropertyManagement = rentalIncome * (propertyManagement / 100)

  const totalMonthlyExpenses =
    monthlyMortgagePayment +
    monthlyPropertyTax +
    monthlyInsurance +
    monthlyMaintenance +
    monthlyVacancy +
    monthlyPropertyManagement

  // Calculate cash flow
  const monthlyCashFlow = rentalIncome - totalMonthlyExpenses
  const annualCashFlow = monthlyCashFlow * 12

  // Calculate ROI
  const initialInvestment = purchasePrice * (downPayment / 100) + 5000 // Closing costs estimated at $5000
  const cashOnCashROI = (annualCashFlow / initialInvestment) * 100

  // Calculate future value
  const futurePropertyValue = purchasePrice * Math.pow(1 + appreciationRate / 100, holdingPeriod)
  const equity = futurePropertyValue - loanAmount + monthlyMortgagePayment * 12 * holdingPeriod * 0.3 // Rough estimate that 30% of mortgage payment goes to principal
  const totalProfit = equity - initialInvestment + annualCashFlow * holdingPeriod
  const annualizedROI = (Math.pow(1 + totalProfit / initialInvestment, 1 / holdingPeriod) - 1) * 100

  // Chart data
  const expensesData = [
    { name: "Mortgage", value: monthlyMortgagePayment * 12 },
    { name: "Property Tax", value: propertyTax },
    { name: "Insurance", value: insurance },
    { name: "Maintenance", value: maintenance },
    { name: "Vacancy", value: monthlyVacancy * 12 },
    { name: "Property Management", value: monthlyPropertyManagement * 12 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  return (
    <div className="container px-4 py-8 mx-auto md:px-6 md:py-12">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Investment Property ROI Calculator</h1>
        <p className="text-muted-foreground">
          Calculate the potential return on investment for your real estate properties
        </p>
      </div>

      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="results">Results & Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
                <CardDescription>Enter the details of the property you're considering</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="purchase-price">Purchase Price</Label>
                    <span className="text-sm font-medium">${purchasePrice.toLocaleString()}</span>
                  </div>
                  <Input
                    id="purchase-price"
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="down-payment">Down Payment (%)</Label>
                    <span className="text-sm font-medium">{downPayment}%</span>
                  </div>
                  <Slider
                    id="down-payment"
                    min={0}
                    max={100}
                    step={1}
                    value={[downPayment]}
                    onValueChange={(value) => setDownPayment(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                    <span className="text-sm font-medium">{interestRate}%</span>
                  </div>
                  <Slider
                    id="interest-rate"
                    min={1}
                    max={10}
                    step={0.1}
                    value={[interestRate]}
                    onValueChange={(value) => setInterestRate(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rental-income">Monthly Rental Income</Label>
                    <span className="text-sm font-medium">${rentalIncome}</span>
                  </div>
                  <Input
                    id="rental-income"
                    type="number"
                    value={rentalIncome}
                    onChange={(e) => setRentalIncome(Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expenses & Projections</CardTitle>
                <CardDescription>Estimate your ongoing expenses and future growth</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="property-tax">Annual Property Tax</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3.5 h-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Property tax varies by location. Check local rates or estimate 1-2% of property value
                              annually.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="text-sm font-medium">${propertyTax}</span>
                  </div>
                  <Input
                    id="property-tax"
                    type="number"
                    value={propertyTax}
                    onChange={(e) => setPropertyTax(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="insurance">Annual Insurance</Label>
                    <span className="text-sm font-medium">${insurance}</span>
                  </div>
                  <Input
                    id="insurance"
                    type="number"
                    value={insurance}
                    onChange={(e) => setInsurance(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maintenance">Annual Maintenance</Label>
                    <span className="text-sm font-medium">${maintenance}</span>
                  </div>
                  <Input
                    id="maintenance"
                    type="number"
                    value={maintenance}
                    onChange={(e) => setMaintenance(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="vacancy">Vacancy Rate (%)</Label>
                    <span className="text-sm font-medium">{vacancy}%</span>
                  </div>
                  <Slider
                    id="vacancy"
                    min={0}
                    max={20}
                    step={1}
                    value={[vacancy]}
                    onValueChange={(value) => setVacancy(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="property-management">Property Management (%)</Label>
                    <span className="text-sm font-medium">{propertyManagement}%</span>
                  </div>
                  <Slider
                    id="property-management"
                    min={0}
                    max={20}
                    step={1}
                    value={[propertyManagement]}
                    onValueChange={(value) => setPropertyManagement(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="appreciation">Annual Appreciation (%)</Label>
                    <span className="text-sm font-medium">{appreciationRate}%</span>
                  </div>
                  <Slider
                    id="appreciation"
                    min={0}
                    max={10}
                    step={0.1}
                    value={[appreciationRate]}
                    onValueChange={(value) => setAppreciationRate(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="holding-period">Holding Period (years)</Label>
                    <span className="text-sm font-medium">{holdingPeriod} years</span>
                  </div>
                  <Slider
                    id="holding-period"
                    min={1}
                    max={30}
                    step={1}
                    value={[holdingPeriod]}
                    onValueChange={(value) => setHoldingPeriod(value[0])}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>ROI Analysis</CardTitle>
                <CardDescription>Summary of your investment returns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center p-6 text-center border rounded-lg bg-background">
                  <div className="text-4xl font-bold text-rose-500">{cashOnCashROI.toFixed(2)}%</div>
                  <p className="text-sm text-muted-foreground">Cash-on-Cash ROI</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 text-center border rounded-lg">
                    <div className="text-2xl font-bold">${annualCashFlow.toFixed(0)}</div>
                    <p className="text-sm text-muted-foreground">Annual Cash Flow</p>
                  </div>
                  <div className="p-4 text-center border rounded-lg">
                    <div className="text-2xl font-bold">${initialInvestment.toFixed(0)}</div>
                    <p className="text-sm text-muted-foreground">Initial Investment</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monthly Mortgage Payment</span>
                    <span className="font-medium">${monthlyMortgagePayment.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monthly Expenses</span>
                    <span className="font-medium">${totalMonthlyExpenses.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monthly Cash Flow</span>
                    <span className={`font-medium ${monthlyCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ${monthlyCashFlow.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t">
                  <h4 className="mb-4 font-semibold">Long-term Projection ({holdingPeriod} years)</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Future Property Value</span>
                      <span className="font-medium">${futurePropertyValue.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Equity</span>
                      <span className="font-medium">${equity.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Profit</span>
                      <span className="font-medium">${totalProfit.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Annualized ROI</span>
                      <span className="font-medium text-rose-500">{annualizedROI.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Annual expenses visualization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ChartContainer
                    config={{
                      mortgage: {
                        label: "Mortgage",
                        color: "#0088FE",
                      },
                      propertyTax: {
                        label: "Property Tax",
                        color: "#00C49F",
                      },
                      insurance: {
                        label: "Insurance",
                        color: "#FFBB28",
                      },
                      maintenance: {
                        label: "Maintenance",
                        color: "#FF8042",
                      },
                      vacancy: {
                        label: "Vacancy",
                        color: "#8884d8",
                      },
                      propertyManagement: {
                        label: "Property Management",
                        color: "#82ca9d",
                      },
                    }}
                    className="w-full h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expensesData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {expensesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value) => [`$${Number(value).toLocaleString()}`, "Amount"]}
                          contentStyle={{
                            background: "rgba(255, 255, 255, 0.9)",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <ChartLegend className="mt-4 justify-center flex-wrap">
                  {expensesData.map((item, index) => (
                    <ChartLegendItem
                      key={item.name}
                      name={item.name}
                      color={COLORS[index % COLORS.length]}
                      value={`$${item.value.toFixed(0)}`}
                    />
                  ))}
                </ChartLegend>

                <div className="p-4 mt-6 border rounded-lg">
                  <h4 className="mb-2 font-semibold">Investment Recommendation</h4>
                  <p className="text-sm text-muted-foreground">
                    {cashOnCashROI >= 8
                      ? "This property shows strong potential returns. The cash-on-cash ROI exceeds 8%, which is considered excellent in most markets."
                      : cashOnCashROI >= 5
                        ? "This property shows moderate potential. The cash-on-cash ROI is acceptable, but you might want to negotiate a better purchase price."
                        : "This property's returns are below average. Consider negotiating the purchase price or finding properties with better cash flow potential."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
