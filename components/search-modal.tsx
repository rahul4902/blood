"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingUp, IndianRupee } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { setQuery, setSuggestions, addRecentSearch } from "@/lib/features/search/searchSlice"

interface SearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const suggestedTests = [
  {
    id: 1,
    name: "Thyroid Function Test",
    price: 549,
    discount: 31,
    type: "test" as const,
    mrp: 799,
    fastingTime: 0,
    category: "Hormone Tests",
    popular: true,
  },
  {
    id: 2,
    name: "Complete Blood Count (CBC)",
    price: 299,
    discount: 25,
    type: "test" as const,
    mrp: 399,
    fastingTime: 0,
    category: "Blood Tests",
    popular: true,
  },
  {
    id: 3,
    name: "Lipid Profile",
    price: 399,
    discount: 20,
    type: "test" as const,
    mrp: 499,
    fastingTime: 12,
    category: "Heart Health",
    popular: false,
  },
  {
    id: 4,
    name: "Liver Function Test",
    price: 449,
    discount: 28,
    type: "test" as const,
    mrp: 623,
    fastingTime: 8,
    category: "Liver Health",
    popular: false,
  },
  {
    id: 5,
    name: "Kidney Function Test",
    price: 399,
    discount: 22,
    type: "test" as const,
    mrp: 511,
    fastingTime: 0,
    category: "Kidney Health",
    popular: false,
  },
  {
    id: 6,
    name: "Diabetes Panel",
    price: 399,
    discount: 33,
    type: "test" as const,
    mrp: 596,
    fastingTime: 8,
    category: "Diabetes",
    popular: false,
  },
]

const popularPackages = [
  {
    id: 1,
    name: "Complete Health Checkup",
    price: 999,
    discount: 23,
    type: "package" as const,
    mrp: 1299,
    fastingTime: 12,
    category: "Health Packages",
    popular: true,
    tests: ["CBC", "Lipid Profile"],
  },
  {
    id: 2,
    name: "Heart Health Package",
    price: 699,
    discount: 22,
    type: "package" as const,
    mrp: 899,
    fastingTime: 12,
    category: "Heart Health",
    popular: false,
    tests: ["Lipid Profile", "ECG"],
  },
]

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { query, suggestions, recentSearches } = useAppSelector((state) => state.search)
  const [localQuery, setLocalQuery] = useState("")

  useEffect(() => {
    if (localQuery.length > 0) {
      const allItems = [...suggestedTests, ...popularPackages]
      const filtered = allItems.filter((item) => item.name.toLowerCase().includes(localQuery.toLowerCase())).slice(0, 5)
      dispatch(setSuggestions(filtered))
    } else {
      dispatch(setSuggestions([]))
    }
  }, [localQuery, dispatch])

  const handleSearch = () => {
    if (localQuery.trim()) {
      dispatch(setQuery(localQuery))
      dispatch(addRecentSearch(localQuery))
      router.push(`/search?q=${encodeURIComponent(localQuery)}`)
      onOpenChange(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    dispatch(addRecentSearch(suggestion))
    router.push(`/search?q=${encodeURIComponent(suggestion)}`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto p-0">
        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-t-lg">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl text-gray-700">Search Tests & Packages</DialogTitle>
          </DialogHeader>

          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search Tests"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="pl-12 h-12 text-base bg-white border-0 rounded-full shadow-sm"
            />
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Live Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-gray-900">Search Results</h3>
              <div className="space-y-2">
                {suggestions.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg cursor-pointer border border-blue-100"
                    onClick={() => handleSuggestionClick(item.name)}
                  >
                    <div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="flex items-center text-sm text-gray-600">
                        <IndianRupee className="w-3 h-3 mr-1" />
                        <span>{item.price}</span>
                        <Badge className="ml-2 bg-red-500 text-white text-xs px-1 py-0">{item.discount}% OFF</Badge>
                      </div>
                    </div>
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {localQuery.length === 0 && recentSearches.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-gray-900">Recent Searches</h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => handleSuggestionClick(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Popular Tests */}
          {localQuery.length === 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center text-gray-900">
                <TrendingUp className="w-4 h-4 mr-2" />
                Popular Tests
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {suggestedTests.slice(0, 4).map((test) => (
                  <div
                    key={test.name}
                    className="flex items-center justify-between p-3 border border-blue-100 rounded-lg hover:bg-blue-50 cursor-pointer"
                    onClick={() => handleSuggestionClick(test.name)}
                  >
                    <div>
                      <div className="font-medium text-sm text-gray-900">{test.name}</div>
                      <div className="flex items-center text-xs text-gray-600 mt-1">
                        <IndianRupee className="w-3 h-3 mr-1" />
                        <span>{test.price}</span>
                      </div>
                    </div>
                    <Badge className="bg-red-500 text-white text-xs px-1 py-0">{test.discount}% OFF</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Packages */}
          {localQuery.length === 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-gray-900">Popular Packages</h3>
              <div className="grid grid-cols-1 gap-2">
                {popularPackages.map((pkg) => (
                  <div
                    key={pkg.name}
                    className="flex items-center justify-between p-3 border border-green-100 rounded-lg hover:bg-green-50 cursor-pointer"
                    onClick={() => handleSuggestionClick(pkg.name)}
                  >
                    <div>
                      <div className="font-medium text-gray-900">{pkg.name}</div>
                      <div className="flex items-center text-sm text-gray-600">
                        <IndianRupee className="w-3 h-3 mr-1" />
                        <span>{pkg.price}</span>
                      </div>
                    </div>
                    <Badge className="bg-red-500 text-white text-xs px-1 py-0">{pkg.discount}% OFF</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
