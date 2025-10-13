"use client"

import PageHeader from "@/components/page-header"
import MobileNav from "@/components/mobile-nav"
import CartButtons from "@/components/CartButtons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, FileText, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { testAPI } from "@/lib/api"

/**
 * Data transformation adapter to normalize API response
 * Implements the Adapter Pattern to convert API structure to component structure
 */
const transformTestData = (apiData) => {
  if (!apiData) return null

  return {
    ...apiData,

    // Transform price fields - use offer_price as primary display price
    price: apiData.offer_price || apiData.package_price || apiData.mrp,
    mrp: apiData.mrp,
    discount: apiData.discount || 0,

    // Transform also_known_as from comma-separated string to array
    alsoKnownAs: apiData.also_known_as
      ? apiData.also_known_as.split(',').map(name => name.trim()).filter(Boolean)
      : [],

    // Transform text_criteria to testCriteria with proper structure
    testCriteria: apiData.text_criteria?.map(item => ({
      question: item.question,
      answer: Array.isArray(item.answer?.list)
        ? item.answer.list
        : (item.answer?.faq ? [item.answer.faq] : [])
    })) || [],

    // Transform parameters array to detailed parameterDetails structure
    parameterDetails: apiData.parameters?.map(param => ({
      name: param.name,
      description: param.description || '',
      normalRange: param.normalRange || '',
      unit: param.unit || ''
    })) || [],

    // Get total parameter count
    parameters: apiData.parameters?.length || 0,

    // Transform qna to faqs format
    faqs: apiData.qna?.map(item => ({
      question: item.question,
      answer: item.answer
    })) || [],

    // Transform specimen_instructions string to instructions array
    instructions: apiData.specimen_instructions
      ? [apiData.specimen_instructions]
      : [],

    // Extract first sample type from sampleTypes array
    sampleType: apiData.sampleTypes?.[0]?.name || 'Blood',

    // Map fasting_time to fasting
    fasting: apiData.fasting_time || 'Not Required',

    // Map tat_time (turn around time)
    tat_time: apiData.tat_time || '24 hrs',

    // NEW: Map recommended_gender to gender field
    gender: apiData.recommended_gender || apiData.gender || 'Both',

    // NEW: Map recommended_age to ageGroup field
    ageGroup: apiData.recommended_age || apiData.ageGroup || apiData.age_group || 'All Ages',

    // Calculate recent bookings from various booking count fields
    recentBookings: apiData.one_mth_bkg_cnt || apiData.booking_count || 0,

    // Determine if test/package is top selling based on flags
    topSelling: apiData.isPopular || apiData.isFeatured || apiData.top_packages || false,

    // Map testsCount for packages
    testsCount: apiData.tests?.length || 0,

    // Keep included tests array for packages
    includedTests: apiData.tests || []
  }
}

export default function TestDetailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = searchParams.get("slug")

  const [test, setTest] = useState(null)
  const [testCartItem, setTestCartItem] = useState(null)
  const [relatedPackages, setRelatedPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showAllParameters, setShowAllParameters] = useState(false)
  const [showTestCriteria, setShowTestCriteria] = useState(false)
  const [showAlsoKnownAs, setShowAlsoKnownAs] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)

  // State for nested test criteria questions
  const [expandedCriteria, setExpandedCriteria] = useState({})

  const scrollContainerRef = useRef(null)

  // Fetch test data on component mount or slug change
  useEffect(() => {
    if (!slug) {
      setError("Test slug is required")
      setLoading(false)
      return
    }

    const fetchTestData = async () => {
      try {
        setLoading(true)
        const response = await testAPI.getTestBySlug(slug)

        // Transform the API response using adapter pattern
        const transformedData = transformTestData(response.data || response)
        setTest(transformedData);
        setTestCartItem({
          id: transformedData._id,
          type: 'test',
          name: transformedData.name,
          price: transformedData.offer_price,
          description: transformedData.description,
          category: transformedData.category,
          turnaroundTime: transformedData.turnaround_time,
          sampleType: transformedData.sample_type
        })

        // Fetch related packages if it's a test (not a package)
        if (transformedData.type === "test") {
          try {
            const packagesResponse = await testAPI.getRelatedPackages(slug, 3)

            // Transform related packages data
            const transformedPackages = Array.isArray(packagesResponse)
              ? packagesResponse.map(pkg => transformTestData(pkg))
              : (packagesResponse.data || []).map(pkg => transformTestData(pkg))

            console.log('Transformed relatedPackages:', transformedPackages)
            setRelatedPackages(transformedPackages)
          } catch (pkgError) {
            console.error("Error fetching related packages:", pkgError)
            // Don't fail the entire page if related packages fail
            setRelatedPackages([])
          }
        }
      } catch (err) {
        setTest(null)
        console.error("Error fetching test:", err)
        setError(err.response?.data?.error || "Failed to load test details")
      } finally {
        setLoading(false)
      }
    }

    fetchTestData()
  }, [slug])

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" })
    }
  }



  const toggleCriteriaExpansion = (index) => {
    setExpandedCriteria(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }




  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading test details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !test) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-red-500 font-semibold mb-4">{error || "Test not found"}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <PageHeader title={test.name} />

      <main className="max-w-md mx-auto">
        <div className="p-4 space-y-4 pb-5">
          {/* Top Selling Badge */}
          {test.topSelling && test.recentBookings > 0 && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                Top Selling
              </span>
              <span className="text-xs text-muted-foreground">
                {test.recentBookings} people booked this recently
              </span>
            </div>
          )}

          {/* Test Name and Description */}
          <div>
            <h1 className="text-2xl font-bold mb-2">{test.name}</h1>
            {test.description && (
              <div className="text-sm text-muted-foreground leading-relaxed">
                {showFullDescription ? (
                  <>
                    <p>{test.description}</p>
                    {test.description.length > 150 && (
                      <button
                        onClick={() => setShowFullDescription(false)}
                        className="text-primary ml-1 font-medium hover:underline"
                      >
                        Show less
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <p>
                      {test.description.length > 150
                        ? `${test.description.substring(0, 150)}...`
                        : test.description}
                    </p>
                    {test.description.length > 150 && (
                      <button
                        onClick={() => setShowFullDescription(true)}
                        className="text-primary ml-1 font-medium hover:underline"
                      >
                        Read more
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Test Info Cards - Row 1 */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-none shadow-sm bg-blue-50">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  {test.type === "package" ? "Includes" : "Parameters"}
                </p>
                <p className="text-sm font-bold text-blue-700">
                  {test.type === "package"
                    ? `${test.testsCount} Tests`
                    : `${test.parameters} Parameters`}
                </p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-green-50">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Reports</p>
                <p className="text-sm font-bold text-green-700">{test.tat_time}</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-purple-50">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Recommended</p>
                <p className="text-sm font-bold text-purple-700">{test.gender}</p>
              </CardContent>
            </Card>
          </div>

          {/* Test Info Cards - Row 2 */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-none shadow-sm bg-orange-50">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Sample Type</p>
                <p className="text-sm font-bold text-orange-700">{test.sampleType}</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-pink-50">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Fasting</p>
                <p className="text-sm font-bold text-pink-700">{test.fasting}</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-orange-50">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Age</p>
                <p className="text-sm font-bold text-orange-700">{test.ageGroup}</p>
              </CardContent>
            </Card>
          </div>

          {/* Promotional Banner */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white">
            <p className="text-sm font-semibold">Unlock special offers and discounts!</p>
            <p className="text-xs opacity-90 mt-1">
              Get up to {test.discount > 0 ? test.discount : 40}% off on health packages
            </p>
          </div>

          {/* Parameters Section (for tests) */}
          {test.type === "test" && test.parameterDetails && test.parameterDetails.length > 0 && (
            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">Includes</h3>
                  <span className="text-sm text-primary font-semibold">
                    {test.parameters} Test Parameters
                  </span>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setShowAllParameters(!showAllParameters)}
                    className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="text-left flex-1">
                      <p className="font-semibold text-sm">{test.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        View all {test.parameters} parameters
                      </p>
                    </div>
                    {showAllParameters ? (
                      <ChevronUp className="w-5 h-5 ml-2 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 ml-2 flex-shrink-0" />
                    )}
                  </button>

                  {showAllParameters && (
                    <div className="pl-4 space-y-2 border-l-2 border-primary/20">
                      <p className="text-xs font-semibold text-primary uppercase">
                        {test.parameters} PARAMETERS INCLUDED
                      </p>
                      {test.parameterDetails.map((param, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg">
                          <p className="font-semibold text-sm mb-1">{param.name}</p>
                          {param.description && (
                            <p className="text-xs text-muted-foreground mb-2">{param.description}</p>
                          )}
                          {param.normalRange && (
                            <p className="text-xs">
                              <span className="font-medium">Normal Range:</span> {param.normalRange}
                            </p>
                          )}
                          {param.unit && (
                            <p className="text-xs text-muted-foreground">Unit: {param.unit}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Included Tests Section (for packages) */}
          {test.type === "package" && test.includedTests && test.includedTests.length > 0 && (
            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">Included Tests</h3>
                  <span className="text-sm text-primary font-semibold">{test.testsCount} Tests</span>
                </div>

                <div className="space-y-2">
                  {test.includedTests.map((includedTest, index) => (
                    <Link
                      key={includedTest._id || index}
                      href={`/test?slug=${includedTest.slug || includedTest._id}`}
                    >
                      <div className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <p className="font-semibold text-sm">{includedTest.name}</p>
                        {includedTest.price && (
                          <p className="text-xs text-muted-foreground mt-1">₹{includedTest.price}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Packages */}
          {relatedPackages && relatedPackages.length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-3">Packages including {test.name}</h3>
              <div className="relative">
                <button
                  onClick={scrollLeft}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={scrollRight}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div
                  ref={scrollContainerRef}
                  className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-1"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {relatedPackages.map((pkg, index) => (
                    <Link key={pkg._id || pkg.id || index} href={`/test?slug=${pkg.slug || pkg._id || pkg.id}`}>
                      <Card className="border-none shadow-md hover:shadow-lg transition-shadow min-w-[280px]">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-sm mb-2 line-clamp-2">{pkg.name}</h4>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {pkg.tat_time}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {pkg.testsCount} Tests
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg font-bold text-primary">₹{pkg.price}</span>
                            {pkg.mrp && pkg.mrp > pkg.price && (
                              <>
                                <span className="text-xs text-muted-foreground line-through">
                                  ₹{pkg.mrp}
                                </span>
                                {pkg.discount > 0 && (
                                  <span className="text-xs font-semibold text-green-600">
                                    {pkg.discount}% OFF
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                          <Button size="sm" className="w-full">
                            Book Now
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Test Criteria - Parent Accordion with Nested Content */}
          {test.testCriteria && Array.isArray(test.testCriteria) && test.testCriteria.length > 0 && (
            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <button
                  onClick={() => setShowTestCriteria(!showTestCriteria)}
                  className="w-full flex items-center justify-between"
                >
                  <h3 className="font-bold text-lg">Test Criteria</h3>
                  {showTestCriteria ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {showTestCriteria && (
                  <div className="mt-4 space-y-3">
                    {test.testCriteria.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleCriteriaExpansion(index)}
                          className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <p className="font-semibold text-sm text-left flex-1">{item.question}</p>
                          {expandedCriteria[index] ? (
                            <ChevronUp className="w-4 h-4 flex-shrink-0 ml-2" />
                          ) : (
                            <ChevronDown className="w-4 h-4 flex-shrink-0 ml-2" />
                          )}
                        </button>

                        {expandedCriteria[index] && (
                          <div className="p-3 bg-white">
                            <ul className="space-y-2">
                              {item.answer && Array.isArray(item.answer) && item.answer.map((ans, ansIndex) => (
                                <li key={ansIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <span className="text-primary mt-1 flex-shrink-0">•</span>
                                  <span>{ans}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Also Known As */}
          {test.alsoKnownAs && test.alsoKnownAs.length > 0 && (
            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <button
                  onClick={() => setShowAlsoKnownAs(!showAlsoKnownAs)}
                  className="w-full flex items-center justify-between"
                >
                  <h3 className="font-bold text-lg">Also Known As</h3>
                  {showAlsoKnownAs ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {showAlsoKnownAs && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {test.alsoKnownAs.map((name, index) => (
                      <span key={index} className="px-3 py-1 bg-muted rounded-full text-sm">
                        {name}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Test Instructions - Render HTML content */}
          {test.instructions && test.instructions.length > 0 && (
            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <button
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="w-full flex items-center justify-between"
                >
                  <h3 className="font-bold text-lg">Test Instructions</h3>
                  {showInstructions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {showInstructions && (
                  <div className="mt-3 space-y-3">
                    {test.instructions.map((instruction, index) => {
                      // Check if instruction contains HTML tags
                      const hasHtml = /<[^>]+>/.test(instruction)

                      if (hasHtml) {
                        return (
                          <div
                            key={index}
                            className="text-sm text-muted-foreground prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: instruction }}
                          />
                        )
                      } else {
                        // Regular text without HTML
                        return (
                          <div
                            key={index}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="text-primary mt-1 flex-shrink-0">•</span>
                            <span>{instruction}</span>
                          </div>
                        )
                      }
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* FAQs */}
          {test.faqs && test.faqs.length > 0 && (
            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-3">Frequently Asked Questions</h3>
                <div className="space-y-3">
                  {test.faqs.map((faq, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                      <p className="font-semibold text-sm mb-1">{faq.question}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-border p-4 z-40 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">
              {test.type === "package" ? "Package" : "Test"} Price
            </p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-primary">₹{test.price}</p>
              {test.mrp && test.mrp > test.price && (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{test.mrp}
                  </span>
                  {test.discount > 0 && (
                    <span className="text-xs font-semibold text-green-600">
                      {test.discount}% OFF
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          {/* <Button className="flex-1 max-w-[150px]" onClick={handleAddToCart}>
            Add to Cart
          </Button> */}
          <CartButtons item={testCartItem} size="sm" text="Add To Cart" />

        </div>
      </div>

      <MobileNav />
    </div>
  )
}
