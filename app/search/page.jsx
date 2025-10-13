"use client"

import PageHeader from "@/components/page-header"
import MobileNav from "@/components/mobile-nav"
import CommonCard from "@/components/common-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { categories } from "@/lib/data"
import { testAPI } from "@/lib/api"
import { Search, X, Clock, FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [query, setQuery] = useState(initialQuery)
  const [searchResults, setSearchResults] = useState({ tests: [], packages: [] })
  const [pagination, setPagination] = useState({
    tests: { total: 0, page: 1, hasMore: false },
    packages: { total: 0, page: 1, hasMore: false }
  })
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState({ tests: false, packages: false })
  const [mostSearched, setMostSearched] = useState([])

  // Fetch most searched on mount
  useEffect(() => {
    const fetchMostSearched = async () => {
      try {
        const data = await testAPI.getMostSearched()
        setMostSearched(data || [])
      } catch (error) {
        console.error("Error fetching most searched:", error)
        // Fallback data
        setMostSearched(["Kidney Function Test", "Thyroid Profile", "Diabetes Panel", "Liver Function", "Vitamin D"])
      }
    }
    fetchMostSearched()
  }, [])

  // Search when query changes
  useEffect(() => {
    if (query.trim()) {
      performSearch(query, 1, 1, true)
    } else {
      setSearchResults({ tests: [], packages: [] })
      setPagination({
        tests: { total: 0, page: 1, hasMore: false },
        packages: { total: 0, page: 1, hasMore: false }
      })
    }
  }, [query])

  const performSearch = async (searchQuery, testsPage = 1, packagesPage = 1, reset = false) => {
    if (reset) {
      setLoading(true)
    }

    try {
      const data = await testAPI.search(searchQuery, testsPage, packagesPage, 4, 6)

      if (reset) {
        setSearchResults({
          tests: data.tests || [],
          packages: data.packages || []
        })
      } else {
        setSearchResults(prev => ({
          tests: testsPage > 1 ? [...prev.tests, ...(data.tests || [])] : data.tests || [],
          packages: packagesPage > 1 ? [...prev.packages, ...(data.packages || [])] : data.packages || []
        }))
      }

      setPagination(data.pagination || {
        tests: { total: 0, page: 1, hasMore: false },
        packages: { total: 0, page: 1, hasMore: false }
      })
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
      setLoadingMore({ tests: false, packages: false })
    }
  }

  const loadMoreTests = async () => {
    setLoadingMore({ ...loadingMore, tests: true })
    const nextPage = pagination.tests.page + 1
    await performSearch(query, nextPage, pagination.packages.page, false)
  }

  const loadMorePackages = async () => {
    setLoadingMore({ ...loadingMore, packages: true })
    const nextPage = pagination.packages.page + 1
    await performSearch(query, pagination.tests.page, nextPage, false)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  const totalResults = searchResults.tests.length + searchResults.packages.length



  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Search" showBack />

      <main className="max-w-md mx-auto">
        <div className="p-4">
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tests, packages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Empty State - No Query */}
          {!query && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Most Searched</h3>
                <div className="flex flex-wrap gap-2">
                  {mostSearched.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(typeof term === 'string' ? term : term.name)}
                      className="px-3 py-1.5 bg-muted rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {typeof term === 'string' ? term : term.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Browse Categories</h3>
                <div className="grid grid-cols-3 gap-3">
                  {categories.slice(0, 6).map((category) => (
                    <Link key={category.id} href={`/category?id=${category.id}`}>
                      <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-3 text-center">
                          <div
                            className={`${category.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl`}
                          >
                            {category.icon}
                          </div>
                          <p className="text-xs font-medium text-foreground leading-tight">{category.name}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Search Results */}
          {query && !loading && (
            <div className="space-y-4">
              {/* Tests Section */}
              {searchResults.tests.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">
                    Tests ({pagination.tests.total})
                  </h4>
                  <div className="space-y-3">
                    {searchResults.tests.map((test) => (
                      <Link key={test.id} href={`/test?slug=${test.slug}`}>
                        <CommonCard
                          item={test}
                          alsoKnownAs={true}
                          showAddToCart={true}
                          onAddToCart={async (item) => {
                            // Your add to cart logic here (e.g., API call or local state update)
                            console.log("Adding to cart:", item)
                            await new Promise(res => setTimeout(res, 1000)) // simulate delay
                          }}
                        />
                      </Link>
                    ))}
                  </div>

                  {/* Load More Tests Button */}
                  {pagination.tests.hasMore && (
                    <Button
                      variant="outline"
                      className="w-full mt-3"
                      onClick={loadMoreTests}
                      disabled={loadingMore.tests}
                    >
                      {loadingMore.tests ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Loading...
                        </>
                      ) : (
                        `Load More Tests`
                      )}
                    </Button>
                  )}
                </div>
              )}

              {/* Packages Section */}
              {searchResults.packages.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">
                    Packages ({pagination.packages.total})
                  </h4>
                  <div className="space-y-3">
                    {searchResults.packages.map((pkg) => (
                      <Link key={pkg.id} href={`/package?slug=${pkg.slug}`}>
                        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">📦</span>
                              </div>
                              <div className="flex-1">
                                <h4
                                  className="font-semibold text-sm mb-1"
                                  dangerouslySetInnerHTML={{ __html: pkg.highlightedName || pkg.name }}
                                />
                                {pkg.highestMatchingTest && (
                                  <p className="text-xs text-blue-600 mb-1">
                                    Match: {pkg.highestMatchingTest}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {pkg.tat_time}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {pkg.testsCount} Tests
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-primary">₹{pkg.mrp}</span>
                                  {pkg.offer_price && (
                                    <>
                                      <span className="text-xs text-muted-foreground line-through">
                                        ₹{pkg.offer_price}
                                      </span>
                                      {pkg.discount > 0 && (
                                        <span className="text-xs font-semibold text-green-600">
                                          {pkg.discount}% OFF
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                              <Button size="sm" className="self-center">
                                Add
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>

                  {/* Load More Packages Button */}
                  {pagination.packages.hasMore && (
                    <Button
                      variant="outline"
                      className="w-full mt-3"
                      onClick={loadMorePackages}
                      disabled={loadingMore.packages}
                    >
                      {loadingMore.packages ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Loading...
                        </>
                      ) : (
                        `Load More Packages`
                      )}
                    </Button>
                  )}
                </div>
              )}

              {/* No Results */}
              {totalResults === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No results found</h3>
                  <p className="text-sm text-muted-foreground">Try searching with different keywords</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
