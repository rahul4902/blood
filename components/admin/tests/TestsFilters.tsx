// components/tests/TestsFilters.tsx
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader } from "lucide-react"

interface TestsFiltersProps {
  filters: {
    category: string
    sampleType: string
    status: string
    typeFilter: string
    isFeatured: string
    isPopular: string
  }
  onFilterChange: (key: string, value: string) => void
  categoriesDropdownList: any[]
  sampleTypesDropdown: any[]
  categoryLoading: boolean
  sampleTypeLoading: boolean
}

export function TestsFilters({
  filters,
  onFilterChange,
  categoriesDropdownList,
  sampleTypesDropdown,
  categoryLoading,
  sampleTypeLoading,
}: TestsFiltersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <div>
        <Label className="text-gray-900 dark:text-white">Type</Label>
        <Select value={filters.typeFilter} onValueChange={(v) => onFilterChange("typeFilter", v)}>
          <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
            <SelectItem value="__all__">All</SelectItem>
            <SelectItem value="test">Test</SelectItem>
            <SelectItem value="package">Package</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-gray-900 dark:text-white">Category</Label>
        <Select value={filters.category} onValueChange={(v) => onFilterChange("category", v)}>
          <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
            <SelectValue placeholder={categoryLoading ? "Loading..." : "All"} />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 max-h-72">
            <SelectItem value="__all__">All</SelectItem>
            {categoriesDropdownList.map((c) => (
              <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-gray-900 dark:text-white">Sample Type</Label>
        <Select value={filters.sampleType} onValueChange={(v) => onFilterChange("sampleType", v)}>
          <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
            <SelectValue placeholder={sampleTypeLoading ? "Loading..." : "All"} />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 max-h-72">
            <SelectItem value="__all__">All</SelectItem>
            {sampleTypesDropdown.map((s) => (
              <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-gray-900 dark:text-white">Status</Label>
        <Select value={filters.status} onValueChange={(v) => onFilterChange("status", v)}>
          <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
            <SelectItem value="__all__">All</SelectItem>
            <SelectItem value="1">Active</SelectItem>
            <SelectItem value="0">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-gray-900 dark:text-white">Featured</Label>
        <Select value={filters.isFeatured} onValueChange={(v) => onFilterChange("isFeatured", v)}>
          <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
            <SelectItem value="__all__">All</SelectItem>
            <SelectItem value="1">Yes</SelectItem>
            <SelectItem value="0">No</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-gray-900 dark:text-white">Popular</Label>
        <Select value={filters.isPopular} onValueChange={(v) => onFilterChange("isPopular", v)}>
          <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
            <SelectItem value="__all__">All</SelectItem>
            <SelectItem value="1">Yes</SelectItem>
            <SelectItem value="0">No</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
