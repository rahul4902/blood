"use client"

import { Search, X } from "lucide-react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { debounce } from "lodash"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
})

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState({ tests: [], packages: [] })
  const [mostSearched, setMostSearched] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()
  const searchRef = useRef(null)
  const inputRef = useRef(null)

  // Fetch most searched terms
  useEffect(() => {
    async function fetchMostSearched() {
      try {
        const response = await apiClient.get("search/most-searched")
        setMostSearched(response.data)
      } catch (err) {
        console.error("Failed to fetch most searched:", err)
        setMostSearched([])
      }
    }
    fetchMostSearched()
  }, [])

  // Debounce search
  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setSuggestions({ tests: [], packages: [] })
        setShowSuggestions(false)
        setError(null)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await apiClient.get("/search", {
          params: { q: searchQuery, limitTests: 3, limitPackages: 2 },
        })
        setSuggestions(response.data)
        setShowSuggestions(true)
      } catch (err) {
        setError("Failed to fetch suggestions. Please try again.")
        setSuggestions({ tests: [], packages: [] })
        setShowSuggestions(false)
      } finally {
        setIsLoading(false)
      }
    }, 300),
    []
  )

  // Trigger search on query change
  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

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

  const handleSuggestionClick = async (type, slug) => {
    try {
      await apiClient.post(`/search/increment-search/${slug}`)
    } catch (err) {
      console.error("Failed to increment search count:", err)
    }
    setShowSuggestions(false)
    setQuery("")
    router.push(`/${type}?slug=${slug}`)
  }

  const handleMostSearchedClick = (term) => {
    setQuery(term)
    setShowSuggestions(false)
    router.push(`/search?q=${encodeURIComponent(term)}`)
  }

  // Check if there are any results
  const hasResults = suggestions.tests.length > 0 || suggestions.packages.length > 0
  const shouldShowNoResults = !isLoading && !error && query.trim() && !hasResults

  return (
    <div ref={searchRef} className="relative w-full max-w-md mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for tests, packages..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim()) {
              setShowSuggestions(true)
            }
          }}
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={isLoading}
          aria-label="Search tests and packages"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("")
              setShowSuggestions(false)
              setSuggestions({ tests: [], packages: [] })
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 z-10 hover:text-gray-700"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {isLoading && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto p-4"
          aria-live="polite"
        >
          <SkeletonLoader />
        </div>
      )}

      {error && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4"
          role="alert"
        >
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {shouldShowNoResults && showSuggestions && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4"
          role="status"
        >
          <div className="text-center py-6">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600 mb-1">No results found</p>
            <p className="text-xs text-gray-500">Try searching with different keywords</p>
          </div>

          {mostSearched.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 mb-2">Try searching for:</p>
              <div className="flex flex-wrap gap-2">
                {mostSearched.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleMostSearchedClick(item.name || item)}
                    className="px-3 py-1 bg-gray-100 rounded-full text-xs hover:bg-blue-500 hover:text-white transition-colors"
                  >
                    {item.name || item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showSuggestions && !isLoading && !error && hasResults && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          role="listbox"
        >
          {suggestions.tests.length > 0 && (
            <div className="p-2">
              <p className="text-xs font-semibold text-gray-500 px-2 py-1">Tests</p>
              {suggestions.tests.map((test) => (
                <button
                  key={test.id}
                  onClick={() => handleSuggestionClick("test", test.slug)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                  role="option"
                  aria-selected="false"
                >
                  <p
                    className={`text-sm font-medium ${test.matchScore >= 100 ? "font-bold" : ""}`}
                    dangerouslySetInnerHTML={{ __html: test.highlightedName }}
                  />
                  <p className="text-xs text-gray-500">
                    {test.parameters || 1} parameters • ₹{test.offer_price}
                    {test.highestMatchingParameter && (
                      <span className="ml-2 text-blue-600">
                        • Match: {test.highestMatchingParameter}
                      </span>
                    )}
                  </p>
                </button>
              ))}
            </div>
          )}

          {suggestions.packages.length > 0 && (
            <div className="p-2 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 px-2 py-1">Packages</p>
              {suggestions.packages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => handleSuggestionClick("package", pkg.slug)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                  role="option"
                  aria-selected="false"
                >
                  <p
                    className={`text-sm font-medium ${pkg.matchScore >= 100 ? "font-bold" : ""}`}
                    dangerouslySetInnerHTML={{ __html: pkg.highlightedName }}
                  />
                  <p className="text-xs text-gray-500">
                    {pkg.testsCount || 0} tests • ₹{pkg.offer_price}
                    {pkg.highestMatchingTest && (
                      <span className="ml-2 text-blue-600">• Match: {pkg.highestMatchingTest}</span>
                    )}
                  </p>
                </button>
              ))}
            </div>
          )}

          {mostSearched.length > 0 && (
            <div className="p-2 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 px-2 py-1 mb-2">Most Searched</p>
              <div className="flex flex-wrap gap-2 px-2">
                {mostSearched.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleMostSearchedClick(item.name || item)}
                    className="px-3 py-1 bg-gray-100 rounded-full text-xs hover:bg-blue-500 hover:text-white transition-colors"
                  >
                    {item.name || item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SkeletonLoader() {
  return (
    <div className="space-y-4">
      <div className="p-2">
        <p className="text-xs font-semibold text-gray-500 px-2 py-1">Tests</p>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="px-3 py-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>
        ))}
      </div>
      <div className="p-2 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-500 px-2 py-1">Packages</p>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="px-3 py-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
