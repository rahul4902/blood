// app/categories/page.jsx
"use client"

import { useEffect, useState, useRef } from "react"
import PageHeader from "@/components/page-header"
import MobileNav from "@/components/mobile-nav"
import { Card, CardContent } from "@/components/ui/card"
import { testAPI } from "@/lib/api"
import { Loader2, Layers } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [imageErrors, setImageErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasMore: true
  })

  const observerTarget = useRef(null)

  const handleImageError = (categoryId) => {
    setImageErrors(prev => ({ ...prev, [categoryId]: true }))
  }

  // Fetch categories
  const fetchCategories = async (pageNum, reset = false) => {
    if (loading) return

    try {
      setLoading(true)

      const response = await testAPI.getCategories({
        limit: 20,
        page: pageNum
      })

      if (reset) {
        setCategories(response.data || [])
      } else {
        setCategories(prev => [...prev, ...(response.data || [])])
      }

      setPagination(response.pagination || {
        total: 0,
        page: pageNum,
        limit: 20,
        totalPages: 0,
        hasMore: false
      })
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchCategories(1, true)
  }, [])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && pagination?.hasMore && !loading) {
          fetchCategories(pagination.page + 1)
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

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="All Categories" showBack />

      <main className="max-w-md mx-auto">
        {/* Results Count */}
        {pagination.total > 0 && (
          <div className="px-4 pt-4 pb-2">
            <p className="text-sm text-muted-foreground">
              Showing {categories.length} of {pagination.total} categories
            </p>
          </div>
        )}

        {/* Categories Grid */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {categories.map((category) => {
              const isImageUrl = category.icon && (category.icon.startsWith('http') || category.icon.startsWith('/'))
              const hasError = imageErrors[category.id]

              return (
                <Link key={category.id} href={`/tests?category=${category.slug}`}>
                  <Card className="border-none shadow-sm hover:shadow-md transition-shadow h-full">
                    <CardContent className="px-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 overflow-hidden relative">
                        {isImageUrl && !hasError ? (
                          <Image
                            src={category.icon}
                            alt={category.name}
                            width={64}
                            height={64}
                            className="object-cover rounded-full"
                            onError={() => handleImageError(category.id)}
                            loading="lazy"
                            quality={75}
                            unoptimized={category.icon.includes('blob')}
                          />
                        ) : (
                          category.icon && !isImageUrl ? (
                            <span className="text-3xl">{category.icon}</span>
                          ) : (
                            <Layers className="w-8 h-8 text-muted-foreground" />
                          )
                        )}
                      </div>
                      <p className="text-sm font-semibold text-foreground mb-1 line-clamp-2 min-h-[40px]">
                        {category.name}
                      </p>
                      {category.testCount > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {category.testCount} tests
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && categories.length > 0 && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Initial Loading */}
        {loading && categories.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading categories...</p>
            </div>
          </div>
        )}

        {/* Intersection Observer Target */}
        {pagination?.hasMore && !loading && categories.length > 0 && (
          <div ref={observerTarget} className="h-20 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading more...</p>
          </div>
        )}

        {/* No More Results */}
        {!pagination?.hasMore && categories.length > 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              All categories loaded • {categories.length} total
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && categories.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Layers className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No categories found</h3>
            <p className="text-sm text-muted-foreground">
              Check back later for categories
            </p>
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  )
}
