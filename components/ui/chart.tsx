import { cn } from "@/lib/utils"
import * as React from "react"

const Chart = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  return <div className={cn("relative", className)} ref={ref} {...props} />
})
Chart.displayName = "Chart"

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config?: Record<string, { label: string; color: string }>
  }
>(({ className, config, ...props }, ref) => {
  return <div className={cn("relative", className)} ref={ref} {...props} />
})
ChartContainer.displayName = "ChartContainer"

const ChartLegend = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div className={cn("flex items-center justify-center space-x-2", className)} ref={ref} {...props} />
  },
)
ChartLegend.displayName = "ChartLegend"

interface ChartLegendItemProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  color: string
  value: string
}

const ChartLegendItem = React.forwardRef<HTMLDivElement, ChartLegendItemProps>(
  ({ className, name, color, value, ...props }, ref) => {
    return (
      <div className={cn("flex items-center space-x-2 text-sm", className)} ref={ref} {...props}>
        <span className="block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <span>{name}:</span>
        <span className="font-medium">{value}</span>
      </div>
    )
  },
)
ChartLegendItem.displayName = "ChartLegendItem"

export { Chart, ChartContainer, ChartLegend, ChartLegendItem }
