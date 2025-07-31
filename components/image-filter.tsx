"use client"

import { useState } from "react"
import { Filter, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface ImageFilterProps {
  onFilterChange: (filters: string[]) => void
  activeFilters: string[]
}

export default function ImageFilter({ onFilterChange, activeFilters }: ImageFilterProps) {
  const [open, setOpen] = useState(false)

  const filters = [
    { id: "exterior", label: "Exterior View" },
    { id: "interior", label: "Interior View" },
    { id: "bedroom", label: "Bedroom" },
    { id: "modern", label: "Modern Style" },
    { id: "traditional", label: "Traditional Style" },
    { id: "luxury", label: "Luxury" },
    { id: "garden", label: "Garden/Outdoor Space" },
    { id: "waterView", label: "Water View" },
    { id: "cityView", label: "City View" },
    { id: "renovated", label: "Renovated" },
  ]

  const toggleFilter = (filterId: string) => {
    let newFilters
    if (activeFilters.includes(filterId)) {
      newFilters = activeFilters.filter((id) => id !== filterId)
    } else {
      newFilters = [...activeFilters, filterId]
    }
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    onFilterChange([])
    setOpen(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="w-4 h-4" />
            Image Filters
            {activeFilters.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Filter by Image Features</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {filters.map((filter) => (
              <DropdownMenuItem
                key={filter.id}
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleFilter(filter.id)}
              >
                {filter.label}
                {activeFilters.includes(filter.id) && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-muted-foreground cursor-pointer"
            onClick={clearFilters}
            disabled={activeFilters.length === 0}
          >
            Clear filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {activeFilters.map((filterId) => {
            const filter = filters.find((f) => f.id === filterId)
            return (
              <Badge key={filterId} variant="secondary" className="flex items-center gap-1">
                {filter?.label}
                <button
                  className="ml-1 rounded-full hover:bg-muted w-4 h-4 inline-flex items-center justify-center"
                  onClick={() => toggleFilter(filterId)}
                >
                  ×
                </button>
              </Badge>
            )
          })}
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
