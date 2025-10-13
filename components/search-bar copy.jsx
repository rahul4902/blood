"use client"

import { Search, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { tests, packages } from "@/lib/data"

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState({ tests: [], packages: [] })
  const router = useRouter()
  const searchRef = useRef(null)

  useEffect(() => {
    if (query.trim()) {
      const lowerQuery = query.toLowerCase()

      const filteredTests = tests
        .filter(
          (test) => test.name.toLowerCase().includes(lowerQuery) || test.category.toLowerCase().includes(lowerQuery),
        )
        .slice(0, 3)

      const filteredPackages = packages
        .filter(
          (pkg) => pkg.name.toLowerCase().includes(lowerQuery) || pkg.description.toLowerCase().includes(lowerQuery),
        )
        .slice(0, 2)

      setSuggestions({ tests: filteredTests, packages: filteredPackages })
      setShowSuggestions(true)
    } else {
      setSuggestions({ tests: [], packages: [] })
      setShowSuggestions(false)
    }
  }, [query])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (type, id) => {
    setShowSuggestions(false)
    setQuery("")
    router.push(`/${type}?id=${id}`)
  }

  const mostSearched = ["Kidney Function Test", "Thyroid Profile", "Diabetes Panel", "Liver Function", "Vitamin D"]

  return (
    <div ref={searchRef} className="relative">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <input
          type="text"
          placeholder="Search for tests, packages..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setShowSuggestions(true)}
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("")
              setShowSuggestions(false)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {showSuggestions && (suggestions.tests.length > 0 || suggestions.packages.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {suggestions.tests.length > 0 && (
            <div className="p-2">
              <p className="text-xs font-semibold text-muted-foreground px-2 py-1">Tests</p>
              {suggestions.tests.map((test) => (
                <button
                  key={test.id}
                  onClick={() => handleSuggestionClick("test", test.id)}
                  className="w-full text-left px-3 py-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <p className="text-sm font-medium">{test.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {test.category} • ₹{test.price}
                  </p>
                </button>
              ))}
            </div>
          )}

          {suggestions.packages.length > 0 && (
            <div className="p-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground px-2 py-1">Packages</p>
              {suggestions.packages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => handleSuggestionClick("package", pkg.id)}
                  className="w-full text-left px-3 py-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <p className="text-sm font-medium">{pkg.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {pkg.testsCount} tests • ₹{pkg.price}
                  </p>
                </button>
              ))}
            </div>
          )}

          <div className="p-2 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-2">Most Searched</p>
            <div className="flex flex-wrap gap-2 px-2">
              {mostSearched.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setQuery(term)
                    setShowSuggestions(false)
                    router.push(`/search?q=${encodeURIComponent(term)}`)
                  }}
                  className="px-3 py-1 bg-muted rounded-full text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
