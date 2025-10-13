"use client"

import { useEffect, useState } from "react"
import MobileHeader from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import SearchBar from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { banners, testimonials } from "@/lib/data"
import { testAPI } from "@/lib/api"
import { ChevronRight, Star, Loader2, Layers, Clock, FileText } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import CommonCard from "@/components/common-card"

export default function HomePage() {
  const [popularTests, setPopularTests] = useState([])
  const [popularPackages, setPopularPackages] = useState([])
  const [specialOffers, setSpecialOffers] = useState([])
  const [featuredTests, setFeaturedTests] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const quickActions = [
    { id: 1, title: "Upload Prescription", icon: "📄", color: "bg-blue-100", href: "/upload-prescription" },
    { id: 2, title: "Book Home Visit", icon: "🏠", color: "bg-green-100", href: "/home-visit" },
    { id: 3, title: "View Reports", icon: "📊", color: "bg-purple-100", href: "/reports" },
    { id: 4, title: "Track Order", icon: "📦", color: "bg-orange-100", href: "/orders" },
  ]

  // Fetch all data on component mount
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all data in parallel
        const [testsRes, packagesRes, offersRes, featuredRes, categoriesRes] = await Promise.all([
          testAPI.getPopularTests(3).catch(err => {
            console.error("Error fetching popular tests:", err)
            return { success: false, data: [] }
          }),
          testAPI.getPopularPackages(2).catch(err => {
            console.error("Error fetching popular packages:", err)
            return { data: [] }
          }),
          testAPI.getSpecialOffers(3).catch(err => {
            console.error("Error fetching special offers:", err)
            return { success: false, data: [] }
          }),
          testAPI.getFeaturedTests(4).catch(err => {
            console.error("Error fetching featured tests:", err)
            return { success: false, data: [] }
          }),
          testAPI.getFeaturedCategories(8).catch(err => {
            console.error("Error fetching categories:", err)
            return { success: false, data: [] }
          })
        ])

        // Extract data with proper fallbacks
        setPopularTests(testsRes?.data || [])
        setPopularPackages(packagesRes?.data || packagesRes || [])
        setSpecialOffers(offersRes?.data || [])
        setFeaturedTests(featuredRes?.data || [])
        setCategories(categoriesRes?.data || [])

        console.log('Home data loaded:', {
          tests: testsRes?.data?.length || 0,
          packages: packagesRes?.data?.length || 0,
          offers: offersRes?.data?.length || 0,
          featured: featuredRes?.data?.length || 0,
          categories: categoriesRes?.data?.length || 0
        })
      } catch (error) {
        console.error("Error fetching home data:", error)
        setError("Failed to load data. Please refresh the page.")
      } finally {
        setLoading(false)
      }
    }

    fetchHomeData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-red-500 font-semibold mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader userName="Shubham Naik" showGreeting={true} />

      <main className="max-w-md mx-auto">
        {/* Search Bar */}
        <div className="p-4">
          <SearchBar />
        </div>

        {/* Banner Carousel */}
        <div className="px-4 mb-6">
          <div className={`${banners[0].bgColor} rounded-2xl p-6 text-white relative overflow-hidden`}>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">{banners[0].title}</h2>
              <p className="text-sm mb-4 opacity-90">{banners[0].subtitle}</p>
              <Link href="/delivery-address">
                <Button className="bg-white text-primary hover:bg-white/90">{banners[0].buttonText}</Button>
              </Link>
            </div>
            <div className="absolute right-0 bottom-0 w-32 h-32 opacity-20">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Wo3DEPekIHWfXOEyxsAXnkY0rGkdNK.png"
                alt="Medical"
                width={128}
                height={128}
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link key={action.id} href={action.href}>
                <div className="text-center">
                  <div
                    className={`${action.color} w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2 text-2xl hover:scale-105 transition-transform`}
                  >
                    {action.icon}
                  </div>
                  <p className="text-xs font-medium text-foreground leading-tight">{action.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {categories && categories.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3 px-4">
              <h3 className="text-lg font-semibold">Categories</h3>
              <Link href="/categories" className="text-sm text-primary flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 px-4 pb-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex-shrink-0 w-[150px]">
                    <Link href={`/tests?category=${category.slug}`}>
                      <Card className="border-none shadow-sm hover:shadow-md transition-shadow h-full">
                        <CardContent className="px-4 text-center">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 overflow-hidden relative">
                            {category.icon && (category.icon.startsWith('http') || category.icon.startsWith('/')) ? (
                              <Image
                                src={category.icon}
                                alt={category.name}
                                width={48}
                                height={48}
                                className="object-cover rounded-full"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  const fallback = e.currentTarget.nextElementSibling
                                  if (fallback) fallback.style.display = 'flex'
                                }}
                                loading="lazy"
                                quality={75}
                                unoptimized={category.icon.includes('blob') || category.icon.includes('vercel')}
                              />
                            ) : null}
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{ display: category.icon && (category.icon.startsWith('http') || category.icon.startsWith('/')) ? 'none' : 'flex' }}
                            >
                              {category.icon && !category.icon.startsWith('http') && !category.icon.startsWith('/') ? (
                                <span className="text-2xl">{category.icon}</span>
                              ) : (
                                <Layers className="w-6 h-6 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                          <p className="text-xs font-medium text-foreground leading-tight line-clamp-2 mb-1 min-h-[32px]">
                            {category.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {category.testCount > 0 ? `${category.testCount} tests` : '0 tests'}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}




        {/* Special Offers */}
        {specialOffers && specialOffers.length > 0 && (
          <div className="px-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Special Offers</h3>
              <Link href="/tests?type=special-offers" className="text-sm text-primary flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {specialOffers.map((offer) => (
                <Link key={offer.id} href={`/test?slug=${offer.slug}`}>
                  <Card className="border border-border/50 shadow-none hover:shadow-sm hover:border-primary/30 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h4 className="font-semibold text-sm leading-tight flex-1">
                              {offer.name}
                            </h4>
                            {offer.discount > 0 && (
                              <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded shrink-0">
                                {offer.discount}% OFF
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <span>{offer.category || "General"}</span>
                            {offer.parameters > 0 && (
                              <>
                                <span>•</span>
                                <span>{offer.parameters} parameters</span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-bold text-primary">₹{offer.price}</span>
                              {offer.mrp && offer.mrp > offer.price && (
                                <span className="text-xs text-muted-foreground line-through">
                                  ₹{offer.mrp}
                                </span>
                              )}
                            </div>

                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={(e) => {
                                e.preventDefault()
                                // Add to cart logic
                              }}
                            >
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* For You (Featured Tests) */}
        {featuredTests && featuredTests.length > 0 && (
          <div className="px-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">For You</h3>
              <Link href="/tests?type=featured" className="text-sm text-primary flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {featuredTests.map((test) => (
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
          </div>
        )}

        {/* Popular Tests */}
        {popularTests && popularTests.length > 0 && (
          <div className="px-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Popular Tests</h3>
              <Link href="/tests?type=popular" className="text-sm text-primary flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {popularTests.map((test) => (
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
          </div>
        )}

        {/* Health Packages */}
        {popularPackages && popularPackages.length > 0 && (
          <div className="px-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Health Packages</h3>
              <Link href="/packages" className="text-sm text-primary flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {popularPackages.map((pkg) => (
                <Link
                  key={pkg._id}
                  href={`/package?slug=${pkg.slug}`}
                  className="block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
                >
                  <Link
                    key={pkg._id}
                    href={`/package?slug=${pkg.slug}`}
                    className="block focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-xl"
                  >
                    <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 h-full group bg-white rounded-xl overflow-hidden">
                      <CardContent className="p-0">
                        {/* Badges Section */}
                        <div className="flex flex-wrap gap-2 px-4 pb-3">
                          {/* {pkg.isPopular && (
                            <span className="text-[10px] font-bold px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md uppercase tracking-wide">
                              Popular
                            </span>
                          )}
                          {pkg.isFeatured && (
                            <span className="text-[10px] font-bold px-3 py-1.5 bg-purple-50 text-purple-600 rounded-md uppercase tracking-wide">
                              Featured
                            </span>
                          )} */}
                          {pkg.discount > 0 && (
                            <span className="text-[10px] font-bold px-3 py-1.5 bg-green-50 text-green-600 rounded-md uppercase tracking-wide">
                              {pkg.discount}% OFF
                            </span>
                          )}
                        </div>

                        {/* Package Name */}
                        <div className="px-4 pb-3">
                          <h4 className="font-bold text-[15px] leading-snug text-orange-600 line-clamp-2 min-h-[2.5rem] group-hover:text-orange-700 transition-colors">
                            {pkg.name}
                          </h4>
                        </div>

                        {/* Package Info */}
                        <div className="flex items-center gap-4 px-4 pb-3">
                          {pkg.tat_time && (
                            <span className="flex items-center gap-1.5 text-xs text-gray-600">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{pkg.tat_time}</span>
                            </span>
                          )}
                          {pkg.tests?.length > 0 && (
                            <span className="flex items-center gap-1.5 text-xs text-gray-600">
                              <FileText className="w-3.5 h-3.5" />
                              <span>{pkg.tests.length} Tests</span>
                            </span>
                          )}
                        </div>

                        {/* Additional Info Chips */}
                        {(pkg.fasting_time || pkg.home_collection) && (
                          <div className="flex flex-wrap gap-2 px-4 pb-3">
                            {pkg.fasting_time && (
                              <span className="text-[10px] font-medium px-2.5 py-1 bg-gray-50 text-gray-700 rounded border border-gray-200">
                                {pkg.fasting_time}
                              </span>
                            )}
                            {pkg.home_collection && (
                              <span className="text-[10px] font-medium px-2.5 py-1 bg-gray-50 text-gray-700 rounded border border-gray-200">
                                Home Collection
                              </span>
                            )}
                          </div>
                        )}

                        {/* Pricing */}
                        <div className="flex items-baseline gap-2 px-4 pb-4">
                          <span className="text-2xl font-bold text-orange-600">
                            ₹{pkg.package_price?.toLocaleString('en-IN') || pkg.mrp?.toLocaleString('en-IN')}
                          </span>
                          {pkg.mrp && pkg.package_price < pkg.mrp && (
                            <span className="text-sm text-gray-400 line-through font-medium">
                              ₹{pkg.mrp.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        {/* CTA Button */}
                        <div className="px-4 pb-4">
                          <Button
                            size="sm"
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                            aria-label={`Book ${pkg.name} package`}
                          >
                            Book Now
                          </Button>
                        </div>

                        {/* Report Time */}
                        {pkg.report_time && (
                          <div className="px-4 pb-4">
                            <p className="text-xs text-gray-500 text-center font-medium">
                              Report: {pkg.report_time}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>

                </Link>

              ))}
            </div>
          </div>
        )}

        {/* Testimonials */}
        <div className="px-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">What Our Customers Say</h3>
          <div className="space-y-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">{testimonial.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{testimonial.name}</h4>
                      <div className="flex items-center gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{testimonial.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{testimonial.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
