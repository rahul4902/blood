// app/tests/page.jsx
"use client"

import { useEffect, useState, useRef } from "react"
import PageHeader from "@/components/page-header"
import MobileNav from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { testAPI } from "@/lib/api"
import { Loader2, Filter } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import CommonCard from "@/components/common-card"

export default function TestsPage() {
  const searchParams = useSearchParams()
  const type = searchParams.get("type") || "all"
  const categorySlug = searchParams.get("category") // Get category from URL

  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(false)
  const [categoryName, setCategoryName] = useState("")
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasMore: true
  })

  const observerTarget = useRef(null)

  // Filter tabs
  const filterTabs = [
    { id: "all", label: "All Tests" },
    { id: "popular", label: "Popular" },
    { id: "featured", label: "For You" },
    { id: "special-offers", label: "Special Offers" },
  ]

  // Fetch tests
  const fetchTests = async (pageNum, reset = false) => {
    if (loading) return

    try {
      setLoading(true)

      const params = {
        limit: 10,
        page: pageNum
      }

      // Add category or type to params
      if (categorySlug) {
        params.category = categorySlug
        params.type = "all" // Override type when filtering by category
      } else {
        params.type = type
      }

      const response = await testAPI.getTests(params)

      console.log('API Response:', response) // Debug log

      // Handle response structure
      const testsData = response.data || response.tests || []
      const paginationData = response.pagination || {}

      // Extract category name from first test if available
      if (categorySlug && testsData.length > 0 && reset) {
        setCategoryName(testsData[0].category || "")
      }

      if (reset) {
        setTests(testsData)
      } else {
        setTests(prev => [...prev, ...testsData])
      }

      setPagination({
        total: paginationData.total || 0,
        page: paginationData.page || pageNum,
        limit: paginationData.limit || 10,
        totalPages: paginationData.totalPages || 0,
        hasMore: paginationData.hasMore !== undefined ? paginationData.hasMore : testsData.length === 10
      })
    } catch (error) {
      console.error("Error fetching tests:", error)
      setPagination({
        total: 0,
        page: pageNum,
        limit: 10,
        totalPages: 0,
        hasMore: false
      })
    } finally {
      setLoading(false)
    }
  }

  // Reset and fetch when type or category changes
  useEffect(() => {
    setTests([])
    setCategoryName("")
    setPagination({
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      hasMore: true
    })
    fetchTests(1, true)
  }, [type, categorySlug])

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && pagination?.hasMore && !loading) {
          fetchTests(pagination.page + 1)
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [pagination?.hasMore, pagination?.page, loading])

  const getPageTitle = () => {
    if (categorySlug) {
      return categoryName || "Category Tests"
    }

    switch (type) {
      case "special-offers":
        return "Special Offers"
      case "featured":
        return "For You"
      case "popular":
        return "Popular Tests"
      default:
        return "All Tests"
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title={getPageTitle()} showBack />

      <main className="max-w-md mx-auto">
        {/* Filter Tabs - Only show when NOT filtering by category */}
        {!categorySlug && (
          <div className="sticky top-0 bg-background z-10 border-b border-border">
            <div className="px-4 py-3 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2">
                {filterTabs.map((tab) => (
                  <Link key={tab.id} href={`/tests?type=${tab.id}`}>
                    <Button
                      variant={type === tab.id ? "default" : "outline"}
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      {tab.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Category Info Banner - Show when filtering by category */}
        {/* {categorySlug && categoryName && (
          <div className="px-4 py-3 bg-primary/5 border-b">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Filtering by category</p>
                <p className="text-sm font-semibold text-foreground">{categoryName}</p>
              </div>
              <Link href="/tests?type=all">
                <Button variant="outline" size="sm">
                  Clear Filter
                </Button>
              </Link>
            </div>
          </div>
        )} */}

        {/* Results Count */}
        {pagination.total > 0 && (
          <div className="px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing {tests.length} of {pagination.total} tests
            </p>
          </div>
        )}

        {/* Tests List */}
        <div className="px-4 space-y-2 pb-4">
          {tests?.map((test) => (
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

        {/* Loading Indicator */}
        {loading && tests.length > 0 && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Initial Loading */}
        {loading && tests.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading tests...</p>
            </div>
          </div>
        )}

        {/* Intersection Observer Target */}
        {pagination?.hasMore && !loading && tests.length > 0 && (
          <div ref={observerTarget} className="h-20 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Scroll for more...</p>
          </div>
        )}

        {/* No More Results */}
        {!pagination?.hasMore && tests.length > 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              You've reached the end • {tests.length} tests loaded
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && tests.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Filter className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No tests found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {categorySlug
                ? "No tests available in this category"
                : "Try changing the filter or check back later"
              }
            </p>
            {categorySlug && (
              <Link href="/tests?type=all">
                <Button>View All Tests</Button>
              </Link>
            )}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  )
}
