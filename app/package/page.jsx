"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import axios from "axios"
import PageHeader from "@/components/page-header"
import MobileNav from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  PackageX,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
})

export default function PackageDetailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const slug = searchParams.get("slug")

  const [pkg, setPkg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // State for collapsible sections
  const [showAllTests, setShowAllTests] = useState(false)
  const [showTestCriteria, setShowTestCriteria] = useState(false)
  const [showImportantInfo, setShowImportantInfo] = useState(false)
  const [showQNA, setShowQNA] = useState(false)
  const [showFAQ, setShowFAQ] = useState(false)

  // State for nested accordions
  const [expandedCriteria, setExpandedCriteria] = useState({})
  const [expandedQNA, setExpandedQNA] = useState({})
  const [expandedFAQ, setExpandedFAQ] = useState({})
  
  // NEW: State for expanded tests (to show parameters)
  const [expandedTests, setExpandedTests] = useState({})

  useEffect(() => {
    if (!slug) {
      setError("No package slug provided")
      setLoading(false)
      return
    }

    async function fetchPackageDetail() {
      try {
        setLoading(true)
        setError(null)

        const response = await apiClient.get(`/tests/slug/${slug}`)

        console.log("API Response:", response.data)

        // Handle nested response structure
        const packageData = response.data.success ? response.data.data : response.data

        // Transform the data to match component expectations
        const transformedData = {
          ...packageData,
          testsCount: packageData.tests?.length || 0,
          sample_type: packageData.sampleTypes?.map((st) => st.name).join(", ") || "Blood",
        }

        setPkg(transformedData)
      } catch (err) {
        console.error("Error fetching package:", err)

        if (err.response?.status === 404) {
          setError("Package not found")
        } else {
          setError(err.message || "Failed to load package details")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPackageDetail()
  }, [slug])

  const toggleCriteriaExpansion = (index) => {
    setExpandedCriteria((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const toggleQNAExpansion = (index) => {
    setExpandedQNA((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const toggleFAQExpansion = (index) => {
    setExpandedFAQ((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  // NEW: Toggle test expansion to show parameters
  const toggleTestExpansion = (index) => {
    setExpandedTests((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading package details...</p>
        </div>
      </div>
    )
  }

  // Error State
  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              {error === "Package not found" ? (
                <PackageX className="w-8 h-8 text-red-600" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
            <h2 className="text-xl font-bold mb-2">
              {error === "Package not found" ? "Package Not Found" : "Error Loading Package"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {error || "An error occurred while loading the package details."}
            </p>
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()} className="w-full">
                Try Again
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/packages")}
              >
                Browse All Packages
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate savings
  const savings = pkg.mrp - pkg.offer_price

  // Determine how many tests to show
  const testsToShow = showAllTests ? pkg.tests : pkg.tests?.slice(0, 5)
  const hasMoreTests = pkg.testsCount > 5

  // Success State - Render Package Details
  return (
    <div className="min-h-screen bg-background pb-32">
      <PageHeader title="Package Details" showBack backHref="/packages" />

      <main className="max-w-md mx-auto">
        <div className="p-4 space-y-4">
          {/* Header Section */}
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📦</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">{pkg.name}</h1>
            {pkg.description && (
              <p className="text-muted-foreground text-sm">{pkg.description}</p>
            )}
          </div>

          {/* Price Card */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Package Price</p>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-primary">₹{pkg.offer_price}</span>
                    {pkg.mrp > pkg.offer_price && (
                      <span className="text-lg text-muted-foreground line-through">₹{pkg.mrp}</span>
                    )}
                  </div>
                  {savings > 0 && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      You save ₹{savings} ({pkg.discount}% OFF)
                    </p>
                  )}
                </div>
                {pkg.discount > 0 && (
                  <div className="bg-green-100 text-green-700 text-sm font-bold px-3 py-2 rounded-lg">
                    {pkg.discount}% OFF
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Package Info Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-none shadow-sm bg-blue-50">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Includes</p>
                <p className="text-sm font-bold text-blue-700">{pkg.testsCount} Tests</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-green-50">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Reports</p>
                <p className="text-sm font-bold text-green-700">
                  {pkg.tat_time || pkg.report_time || "24-48 hours"}
                </p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-purple-50">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Gender</p>
                <p className="text-sm font-bold text-purple-700">
                  {pkg.recommended_gender || "Both"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Promotional Banner */}
          {pkg.discount > 0 && (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white">
              <p className="text-sm font-semibold">Unlock special offers and discounts!</p>
              <p className="text-xs opacity-90 mt-1">
                Get up to {pkg.discount}% off on health packages
              </p>
            </div>
          )}

          {/* Tests Included - UPDATED WITH EXPANDABLE PARAMETERS */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">Package Includes</h3>
                <span className="text-sm text-primary font-semibold">
                  {pkg.testsCount} test{pkg.testsCount !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-2">
                {testsToShow && testsToShow.length > 0 ? (
                  <>
                    {testsToShow.map((test, idx) => {
                      // Determine parameters to show
                      const hasParameters = test.parameters && test.parameters.length > 0
                      const parametersToShow = hasParameters 
                        ? test.parameters 
                        : [{ name: test.name }] // Show test name as parameter if none exist

                      return (
                        <div key={test._id || idx} className="border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleTestExpansion(idx)}
                            className="w-full flex items-center gap-2 p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm font-semibold flex-1 text-left">
                              {test.name}
                            </span>
                            <span className="text-xs text-muted-foreground mr-2">
                              {parametersToShow.length} parameter{parametersToShow.length !== 1 ? 's' : ''}
                            </span>
                            {expandedTests[idx] ? (
                              <ChevronUp className="w-4 h-4 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 flex-shrink-0" />
                            )}
                          </button>

                          {expandedTests[idx] && (
                            <div className="p-3 bg-white border-t border-gray-200">
                              <p className="text-xs font-semibold text-primary uppercase mb-2">
                                {parametersToShow.length} PARAMETER{parametersToShow.length !== 1 ? 'S' : ''} INCLUDED
                              </p>
                              <div className="space-y-1">
                                {parametersToShow.map((param, paramIdx) => (
                                  <div
                                    key={paramIdx}
                                    className="flex items-start gap-2 text-sm text-muted-foreground py-1"
                                  >
                                    <span className="text-primary mt-1 flex-shrink-0">•</span>
                                    <span>{param.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {hasMoreTests && (
                      <button
                        onClick={() => setShowAllTests(!showAllTests)}
                        className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary/80 py-2 transition-colors"
                      >
                        {showAllTests ? (
                          <>
                            Show Less <ChevronUp className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            Show {pkg.testsCount - 5} More Tests <ChevronDown className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{pkg.testsCount} tests included</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Package Details */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <h3 className="font-bold text-lg mb-3">Package Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Report Time</p>
                    <p className="text-xs text-muted-foreground">
                      {pkg.tat_time || pkg.report_time || "24-48 hours"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Sample Type</p>
                    <p className="text-xs text-muted-foreground">{pkg.sample_type}</p>
                  </div>
                </div>

                {pkg.fasting_time && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Fasting Required</p>
                      <p className="text-xs text-muted-foreground">{pkg.fasting_time}</p>
                    </div>
                  </div>
                )}

                {pkg.home_collection && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Home Collection</p>
                      <p className="text-xs text-muted-foreground">
                        Free home sample collection
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test Criteria */}
          {pkg.text_criteria && Array.isArray(pkg.text_criteria) && pkg.text_criteria.length > 0 && (
            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <button
                  onClick={() => setShowTestCriteria(!showTestCriteria)}
                  className="w-full flex items-center justify-between"
                >
                  <h3 className="font-bold text-lg">Test Instructions</h3>
                  {showTestCriteria ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>

                {showTestCriteria && (
                  <div className="mt-4 space-y-3">
                    {pkg.text_criteria.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleCriteriaExpansion(index)}
                          className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <p className="font-semibold text-sm text-left flex-1">
                            {item.question}
                          </p>
                          {expandedCriteria[index] ? (
                            <ChevronUp className="w-4 h-4 flex-shrink-0 ml-2" />
                          ) : (
                            <ChevronDown className="w-4 h-4 flex-shrink-0 ml-2" />
                          )}
                        </button>

                        {expandedCriteria[index] && (
                          <div className="p-3 bg-white">
                            {item.answer?.faq && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {item.answer.faq}
                              </p>
                            )}
                            {item.answer?.list && Array.isArray(item.answer.list) && (
                              <ul className="space-y-2">
                                {item.answer.list.map((ans, ansIndex) => (
                                  <li
                                    key={ansIndex}
                                    className="flex items-start gap-2 text-sm text-muted-foreground"
                                  >
                                    <span className="text-primary mt-1 flex-shrink-0">•</span>
                                    <span>{ans}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Important Information */}
          {(pkg.whenToTakeTest || pkg.avoidTestIf) && (
            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <button
                  onClick={() => setShowImportantInfo(!showImportantInfo)}
                  className="w-full flex items-center justify-between"
                >
                  <h3 className="font-bold text-lg">Important Information</h3>
                  {showImportantInfo ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>

                {showImportantInfo && (
                  <div className="mt-3 space-y-3">
                    {pkg.whenToTakeTest && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-semibold text-sm mb-1">When to Take This Test?</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {pkg.whenToTakeTest}
                        </p>
                      </div>
                    )}
                    {pkg.avoidTestIf && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-semibold text-sm mb-1">Avoid Test If</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {pkg.avoidTestIf}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* QNA Section */}
          {pkg.qna && pkg.qna.length > 0 && (
            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <button
                  onClick={() => setShowQNA(!showQNA)}
                  className="w-full flex items-center justify-between"
                >
                  <h3 className="font-bold text-lg">Questions & Answers</h3>
                  {showQNA ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {showQNA && (
                  <div className="mt-4 space-y-3">
                    {pkg.qna.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleQNAExpansion(index)}
                          className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <p className="font-semibold text-sm text-left flex-1">{item.question}</p>
                          {expandedQNA[index] ? (
                            <ChevronUp className="w-4 h-4 flex-shrink-0 ml-2" />
                          ) : (
                            <ChevronDown className="w-4 h-4 flex-shrink-0 ml-2" />
                          )}
                        </button>

                        {expandedQNA[index] && (
                          <div className="p-3 bg-white">
                            <p className="text-sm text-muted-foreground">{item.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* FAQ Section */}
          {pkg.faq && pkg.faq.length > 0 && (
            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <button
                  onClick={() => setShowFAQ(!showFAQ)}
                  className="w-full flex items-center justify-between"
                >
                  <h3 className="font-bold text-lg">Frequently Asked Questions</h3>
                  {showFAQ ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {showFAQ && (
                  <div className="mt-4 space-y-3">
                    {pkg.faq.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleFAQExpansion(index)}
                          className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <p className="font-semibold text-sm text-left flex-1">{item.question}</p>
                          {expandedFAQ[index] ? (
                            <ChevronUp className="w-4 h-4 flex-shrink-0 ml-2" />
                          ) : (
                            <ChevronDown className="w-4 h-4 flex-shrink-0 ml-2" />
                          )}
                        </button>

                        {expandedFAQ[index] && (
                          <div className="p-3 bg-white">
                            <p className="text-sm text-muted-foreground">{item.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Why Choose This Package */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <h3 className="font-bold text-lg mb-3">Why choose this package?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Comprehensive health screening at discounted price</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>NABL certified labs with accurate results</span>
                </li>
                {pkg.home_collection && (
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Free home sample collection available</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Digital reports accessible anytime</span>
                </li>
                {pkg.smart_report_available && (
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Smart report with detailed insights</span>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-border p-4 z-40 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Package Price</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-primary">₹{pkg.offer_price}</p>
              {pkg.mrp && pkg.mrp > pkg.offer_price && (
                <>
                  <span className="text-sm text-muted-foreground line-through">₹{pkg.mrp}</span>
                  {pkg.discount > 0 && (
                    <span className="text-xs font-semibold text-green-600">
                      {pkg.discount}% OFF
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          <Button className="flex-1 max-w-[150px]">Add to Cart</Button>
        </div>
      </div>

      <MobileNav />
    </div>
  )
}
