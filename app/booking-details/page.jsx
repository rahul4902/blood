"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import PageHeader from "@/components/page-header"
import MobileNav from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Package, Calendar, MapPin, User, CreditCard, Loader2, AlertCircle, CheckCircle2, Clock,
  TestTube, Truck, ClipboardCheck, Download, Phone, Home, XCircle, AlertTriangle, RefreshCw
} from "lucide-react"
import Link from "next/link"
import { razorpayAPI, settingsAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

function BookingDetailsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, authLoading } = useAuth()

  const bookingId = searchParams.get("booking_id")

  const [loading, setLoading] = useState(true)
  const [bookingData, setBookingData] = useState(null)
  const [error, setError] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelTimeRemaining, setCancelTimeRemaining] = useState(null)
  const [settings, setSettings] = useState({ cancel_hours: 2 })
  const [retryingPayment, setRetryingPayment] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    const fetchSettings = async () => {
      try {
        const response = await settingsAPI.getAll()
        if (response?.success && response?.data) {
          let extractedSettings = {}
          if (Array.isArray(response.data)) {
            response.data.forEach((item) => {
              extractedSettings[item.key] = extractSettingValue(item.value)
            })
          } else if (typeof response.data === "object") {
            Object.keys(response.data).forEach((key) => {
              extractedSettings[key] = extractSettingValue(response.data[key])
            })
          }
          setSettings({
            cancel_hours: parseInt(extractedSettings.cancel_hours) || 2,
          })
        }
      } catch {
        // keep defaults
      }
    }
    fetchSettings()
  }, [authLoading, isAuthenticated, router])

  const extractSettingValue = (value) => {
    if (typeof value === "string") {
      try { return JSON.parse(value) } catch { return value }
    }
    return value
  }

  useEffect(() => {
    if (!bookingId) {
      toast({ title: "Invalid Request", description: "No booking ID provided", variant: "destructive" })
      router.push("/")
      return
    }
    if (!isAuthenticated) {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        router.push(`/login?redirect=/booking-details?booking_id=${bookingId}`)
        return
      }
    }
    fetchBookingDetails()
  }, [bookingId, isAuthenticated])

  useEffect(() => {
    if (!bookingData?.createdAt || !settings?.cancel_hours) return
    const calculateTimeRemaining = () => {
      const bookingTime = new Date(bookingData.createdAt).getTime()
      const cancelLimit = settings.cancel_hours * 3600_000
      const now = Date.now()
      const remaining = Math.max(0, cancelLimit - (now - bookingTime))
      if (remaining <= 0) { setCancelTimeRemaining(null); return }
      const h = Math.floor(remaining / 3600_000)
      const m = Math.floor((remaining % 3600_000) / 60_000)
      const s = Math.floor((remaining % 60_000) / 1000)
      setCancelTimeRemaining(h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`)
    }
    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)
    return () => clearInterval(interval)
  }, [bookingData, settings])

  const fetchBookingDetails = async () => {
    try {
      setLoading(true)
      const response = await razorpayAPI.getBookingDetails(bookingId)
      if (response?.success) {
        setBookingData(response.booking)
        setError(null)
      } else {
        throw new Error(response?.message || "Failed to fetch booking details")
      }
    } catch (err) {
      if (String(err?.message || "").includes("401")) {
        localStorage.removeItem("accessToken")
        router.push(`/login?redirect=/booking-details?booking_id=${bookingId}`)
        return
      }
      setError(err?.message || "Unable to load booking")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return
    try {
      setCancelling(true)
      const response = await razorpayAPI.cancelBooking(bookingId, { reason: "User requested cancellation" })
      if (response?.success) {
        toast({ title: "Booking Cancelled", description: "Your booking has been cancelled successfully" })
        fetchBookingDetails()
      } else {
        throw new Error(response?.message || "Failed to cancel booking")
      }
    } catch (err) {
      toast({ title: "Cancellation Failed", description: err?.message || "Unable to cancel booking", variant: "destructive" })
    } finally {
      setCancelling(false)
    }
  }

  // Check if payment can be retried
  const canRetryPayment = () => {
      return false;
    if (!bookingData) return false
      
    // Allow retry only if:
    // - Payment method is razorpay
    // - Payment status is "failed" or "pending"
    // - Booking is not cancelled or completed
    // - razorpayBookingId exists for retry
    console.log('bookingData.paymentMethod',bookingData.paymentStatus,["failed", "pending"],bookingData.razorpayBookingId);
    return (
      bookingData.paymentMethod === "razorpay" &&
      ["failed", "pending"].includes(bookingData.paymentStatus) &&
      !["cancelled", "completed"].includes(bookingData.bookingStatus) &&
      bookingData.razorpayBookingId
    )
  }

  // Handle payment retry with same order ID
  const handleRetryPayment = async () => {
    if (!bookingData?.razorpayBookingId) {
      toast({ 
        title: "Error", 
        description: "No payment order found", 
        variant: "destructive" 
      })
      return
    }

    try {
      setRetryingPayment(true)
      
      // Load Razorpay script dynamically
      const loadRazorpayScript = () => {
        return new Promise((resolve) => {
          if (window.Razorpay) {
            resolve(true)
            return
          }
          
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.async = true
          script.onload = () => resolve(true)
          script.onerror = () => resolve(false)
          document.body.appendChild(script)
        })
      }

      const loaded = await loadRazorpayScript()
      
      if (!loaded) {
        throw new Error("Unable to load payment gateway")
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(bookingData.pricing.total * 100), // Amount in paise
        currency: "INR",
        name: "Your Lab Name",
        description: `Booking #${bookingData.bookingNumber}`,
        order_id: bookingData.razorpayBookingId, // Reuse same order ID for retry
        prefill: {
          name: bookingData.patientName,
          email: bookingData.userEmail || "",
          contact: bookingData.userPhone || "",
        },
        handler: async function (response) {
          // Payment successful - verify on backend
          try {
            const verifyResponse = await razorpayAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              booking_id: bookingId,
            })
            
            if (verifyResponse?.success) {
              toast({ 
                title: "Payment Successful", 
                description: "Your booking is now confirmed!",
                duration: 5000
              })
              fetchBookingDetails() // Refresh booking data
            } else {
              throw new Error(verifyResponse?.message || "Payment verification failed")
            }
          } catch (error) {
            toast({ 
              title: "Verification Failed", 
              description: error?.message || "Please contact support", 
              variant: "destructive" 
            })
          }
        },
        modal: {
          ondismiss: function() {
            setRetryingPayment(false)
            toast({
              title: "Payment Cancelled",
              description: "You can retry payment anytime from this page",
              variant: "default"
            })
          }
        },
        theme: {
          color: "#3399cc"
        },
        retry: {
          enabled: true,
          max_count: 4 // Allow 4 retry attempts within the payment modal
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response) {
        toast({
          title: "Payment Failed",
          description: response.error?.description || "Please try again",
          variant: "destructive"
        })
        setRetryingPayment(false)
      })
      
      rzp.open()
      setRetryingPayment(false)
      
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error?.message || "Unable to initiate payment", 
        variant: "destructive" 
      })
      setRetryingPayment(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    } catch { return dateString }
  }

  const getBookingStatusColor = (status) => {
    const colors = {
      pending: "text-yellow-600 bg-yellow-50",
      confirmed: "text-blue-600 bg-blue-50",
      "sample-collected": "text-purple-600 bg-purple-50",
      processing: "text-orange-600 bg-orange-50",
      completed: "text-green-600 bg-green-50",
      cancelled: "text-red-600 bg-red-50",
    }
    return colors[status] || colors.pending
  }

  const getBookingProgress = (status) => {
    const progress = {
      pending: 20, confirmed: 40, "sample-collected": 60, processing: 80, completed: 100, cancelled: 0,
    }
    return progress[status] || 0
  }

  const getTrackingSteps = () => {
    if (!bookingData) return []
    const steps = [
      { label: "Booking Received", icon: ClipboardCheck, status: "pending" },
      { label: "Confirmed", icon: CheckCircle2, status: "confirmed" },
      { label: "Sample Collected", icon: Truck, status: "sample-collected" },
      { label: "Processing", icon: TestTube, status: "processing" },
      { label: "Completed", icon: Package, status: "completed" },
    ]
    if (bookingData.bookingStatus === "cancelled") {
      return [{ label: "Cancelled", icon: XCircle, status: "cancelled", completed: true, active: true }]
    }
    const currentIndex = steps.findIndex((s) => s.status === bookingData.bookingStatus)
    return steps.map((step, index) => ({ ...step, completed: index <= currentIndex, active: index === currentIndex }))
  }

  const canCancelBooking = () => {
    if (!bookingData) return false
    if (["cancelled", "sample-collected", "processing", "completed"].includes(bookingData.bookingStatus)) return false
    return cancelTimeRemaining !== null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading booking details...</p>
      </div>
    )
  }

  if (error || !bookingData) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <PageHeader title="Booking Details" />
        <main className="max-w-md mx-auto p-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Unable to Load Booking</h2>
              <p className="text-sm text-muted-foreground mb-6">{error || "Booking not found"}</p>
              <div className="flex gap-2">
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full">Go Home</Button>
                </Link>
                <Button onClick={fetchBookingDetails} className="flex-1">Retry</Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <MobileNav />
      </div>
    )
  }

  const trackingSteps = getTrackingSteps()
  const progressValue = getBookingProgress(bookingData.bookingStatus)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-24">
      <PageHeader title="Booking Details" />

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* Header Card */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-primary/10 to-background">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Booking Number</p>
                <h2 className="text-xl font-bold text-primary">#{bookingData.bookingNumber}</h2>
              </div>
              <Badge className={`${bookingData.paymentStatus === "success" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"} border`}>
                {bookingData.paymentStatus === "success" ? "Paid" : (bookingData.paymentMethod === "pay-on-collection" ? "Pay on Collection" : "Pending")}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-muted-foreground">Status</span>
              <Badge className={getBookingStatusColor(bookingData.bookingStatus)}>
                {bookingData.bookingStatus.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold text-primary">{progressValue}%</span>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>

            {canCancelBooking() && cancelTimeRemaining && (
              <div className="mt-3 flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700">
                  Cancel within <span className="font-bold">{cancelTimeRemaining}</span>
                </p>
              </div>
            )}

            {canRetryPayment() && (
              <div className="mt-3 flex items-center gap-2 p-2.5 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <p className="text-xs text-red-700 flex-1">
                  Payment {bookingData.paymentStatus === "failed" ? "failed" : "pending"}. Complete payment to confirm your booking.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Tracking */}
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              Booking Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {trackingSteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={index} className="flex items-center gap-3 relative">
                    {index < trackingSteps.length - 1 && (
                      <div className={`absolute left-[15px] top-[35px] w-[2px] h-[calc(100%+16px)] ${step.completed ? "bg-primary" : "bg-muted"}`} />
                    )}
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      step.completed ? "bg-primary text-white"
                        : step.active ? "bg-primary/20 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className={`text-sm font-medium ${step.completed || step.active ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Collection Schedule */}
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Collection Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            <div className="flex items-center gap-3 p-2.5 bg-muted/50 rounded-lg">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-semibold truncate">{formatDate(bookingData.slotDate)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 bg-muted/50 rounded-lg">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="text-sm font-semibold">{bookingData.slotTime}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 bg-muted/50 rounded-lg">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">Address</p>
                <p className="text-sm font-medium leading-relaxed">
                  {bookingData.deliveryAddress.address}
                  {bookingData.deliveryAddress.landmark && `, ${bookingData.deliveryAddress.landmark}`}
                  {`, ${bookingData.deliveryAddress.city}, ${bookingData.deliveryAddress.state} - ${bookingData.deliveryAddress.pincode}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 bg-muted/50 rounded-lg">
              <User className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Patient</p>
                <p className="text-sm font-semibold">{bookingData.patientName}, {bookingData.patientAge}y ({bookingData.patientGender})</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tests & Packages */}
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Tests & Packages</span>
              <Badge variant="secondary">{bookingData.items.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {bookingData.items.map((item, index) => (
              <div key={index} className="flex gap-2.5 p-2.5 bg-muted/30 rounded-lg">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.type === "test" ? "bg-blue-100" : "bg-purple-100"}`}>
                  {item.type === "test" ? <TestTube className="w-5 h-5 text-blue-600" /> : <Package className="w-5 h-5 text-purple-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-muted-foreground">
                      {item.type === "test" ? "Test" : `${item.totalTests || 0} tests`}
                    </p>
                    <p className="font-bold text-primary text-sm">₹{item.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 pt-0">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{bookingData.pricing.subtotal?.toFixed(2)}</span>
            </div>

            {bookingData.pricing.cartDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-₹{bookingData.pricing.cartDiscount.toFixed(2)}</span>
              </div>
            )}

            {bookingData.appliedCoupon && bookingData.pricing.couponDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Coupon ({bookingData.appliedCoupon.code})</span>
                <span>-₹{bookingData.pricing.couponDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>₹{bookingData.pricing.tax?.toFixed(2)}</span>
            </div>

            <Separator className="my-2" />

            <div className="flex justify-between items-center bg-primary/10 p-2.5 rounded-lg">
              <span className="font-bold">Total</span>
              <span className="font-bold text-xl text-primary">
                ₹{bookingData.pricing.total?.toFixed(2)}
              </span>
            </div>

            {bookingData.paymentMethod && (
              <div className="flex justify-between text-xs mt-2 pt-2 border-t">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium capitalize">
                  {bookingData.paymentMethod === "razorpay" ? "Online Payment" : "Pay on Collection"}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {canRetryPayment() && (
            <Button
              className="w-full bg-amber-600 hover:bg-amber-700"
              size="lg"
              onClick={handleRetryPayment}
              disabled={retryingPayment}
            >
              {retryingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading Payment...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Complete Payment
                </>
              )}
            </Button>
          )}

          {bookingData.bookingStatus === "completed" && (
            <Button className="w-full" size="lg">
              <Download className="w-4 h-4 mr-2" />
              Download Reports
            </Button>
          )}

          {canCancelBooking() && (
            <Button
              variant="destructive"
              className="w-full"
              size="lg"
              onClick={handleCancelBooking}
              disabled={cancelling}
            >
              {cancelling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Booking
                </>
              )}
            </Button>
          )}

          <Link href="tel:18001234567">
            <Button variant="outline" className="w-full" size="lg">
              <Phone className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </Link>

          <Link href="/" className="block">
            <Button variant="outline" className="w-full" size="lg">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}

export default function BookingDetailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    }>
      <BookingDetailsContent />
    </Suspense>
  )
}
