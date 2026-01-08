"use client"

import { useState, useEffect, Suspense } from "react"
import PageHeader from "@/components/page-header"
import MobileNav from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  Package,
  TestTube,
  Download,
  Share2,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { razorpayAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { bookingStorage } from "@/lib/localStorage"
import { useAuth } from "@/contexts/AuthContext"

function BookingConfirmationContent({ searchParams }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuth()
  
  const bookingId = searchParams?.booking_id
  const paymentId = searchParams?.payment_id

  const [loading, setLoading] = useState(true)
  const [bookingData, setBookingData] = useState(null)
  const [error, setError] = useState(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!bookingId) {
      toast({
        title: "Invalid Booking",
        description: "No booking ID provided",
        variant: "destructive",
      })
      router.push("/")
      return
    }
    
    // Check authentication
    if (!isAuthenticated) {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login to view booking details",
          variant: "destructive",
        })
        router.push(`/login?redirect=/booking-confirmation?booking_id=${bookingId}${paymentId ? `&payment_id=${paymentId}` : ''}`)
        return
      }
    }
    
    fetchBookingDetails()
  }, [bookingId, isAuthenticated])

  const fetchBookingDetails = async () => {
    try {
      setLoading(true)
      
      // Try to get booking data from localStorage first (for immediate after payment)
      const cachedBookingData = bookingStorage.getBookingData()
      
      if (cachedBookingData && cachedBookingData.dbBookingId === bookingId) {
        // Use cached data temporarily while fetching from server
        setBookingData({
          bookingNumber: cachedBookingData.bookingNumber,
          paymentStatus: cachedBookingData.paymentStatus || 'success',
          bookingStatus: 'confirmed',
          slotDate: cachedBookingData.slot?.date,
          slotTime: cachedBookingData.slot?.time,
          deliveryAddress: cachedBookingData.address || {},
          patientName: cachedBookingData.patient?.name,
          patientAge: cachedBookingData.patient?.age,
          patientGender: cachedBookingData.patient?.gender,
          items: cachedBookingData.items || [],
          pricing: cachedBookingData.pricing || {},
          appliedCoupon: cachedBookingData.appliedCoupon,
          createdAt: new Date().toISOString(),
        })
      }
      
      // Fetch from API
      const response = await razorpayAPI.getBookingDetails(bookingId)
      
      if (response.success) {
        setBookingData(response.booking)
        setError(null)
      } else {
        throw new Error(response.message || 'Failed to fetch booking')
      }
    } catch (err) {
      console.error('Error fetching booking:', err)
      
      // Check if it's an authentication error
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        localStorage.removeItem('accessToken')
        toast({
          title: "Session Expired",
          description: "Please login again to view booking details",
          variant: "destructive",
        })
        router.push(`/login?redirect=/booking-confirmation?booking_id=${bookingId}${paymentId ? `&payment_id=${paymentId}` : ''}`)
        return
      }
      
      // If API fails but we have cached data, don't show error
      if (!bookingData) {
        setError(err.message)
        toast({
          title: "Error",
          description: err.message || "Failed to load booking details",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      })
    } catch {
      return dateString
    }
  }

  const getPaymentStatusBadge = (status) => {
    const badges = {
      success: { 
        label: 'Paid', 
        icon: CheckCircle,
        className: 'bg-green-100 text-green-700 border-green-200' 
      },
      pending: { 
        label: 'Pay on Collection', 
        icon: Clock,
        className: 'bg-yellow-100 text-yellow-700 border-yellow-200' 
      },
      failed: { 
        label: 'Failed', 
        icon: XCircle,
        className: 'bg-red-100 text-red-700 border-red-200' 
      },
    }
    return badges[status] || badges.pending
  }

  const getBookingStatusBadge = (status) => {
    const badges = {
      pending: { label: 'Pending Confirmation', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      confirmed: { label: 'Confirmed', className: 'bg-blue-100 text-blue-700 border-blue-200' },
      'sample-collected': { label: 'Sample Collected', className: 'bg-purple-100 text-purple-700 border-purple-200' },
      processing: { label: 'Processing in Lab', className: 'bg-orange-100 text-orange-700 border-orange-200' },
      completed: { label: 'Completed', className: 'bg-green-100 text-green-700 border-green-200' },
      cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700 border-red-200' },
    }
    return badges[status] || badges.pending
  }

  // Generate PDF receipt and download
  const handleDownload = async () => {
    try {
      setDownloading(true)
      
      // Create a printable HTML version
      const printWindow = window.open('', '_blank')
      const receiptHTML = generateReceiptHTML()
      
      printWindow.document.write(receiptHTML)
      printWindow.document.close()
      
      // Wait for content to load
      printWindow.onload = () => {
        printWindow.print()
        setTimeout(() => {
          printWindow.close()
          toast({
            title: "Receipt Downloaded",
            description: "Your booking receipt has been prepared for download",
          })
        }, 500)
      }
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "Download Failed",
        description: "Unable to download receipt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDownloading(false)
    }
  }

  const generateReceiptHTML = () => {
    if (!bookingData) return ''
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Booking Receipt - ${bookingData.bookingNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #F37254;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #333;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .label {
              font-weight: 600;
              color: #666;
            }
            .value {
              color: #333;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            .items-table th {
              background: #f5f5f5;
              padding: 12px;
              text-align: left;
              font-weight: 600;
            }
            .items-table td {
              padding: 12px;
              border-bottom: 1px solid #eee;
            }
            .total-row {
              font-weight: bold;
              font-size: 18px;
              color: #F37254;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-top: 2px solid #333;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">HealthLab Diagnostics</div>
            <p>Booking Confirmation Receipt</p>
          </div>
          
          <div class="section">
            <div class="section-title">Booking Information</div>
            <div class="info-row">
              <span class="label">Booking Number:</span>
              <span class="value">#${bookingData.bookingNumber}</span>
            </div>
            <div class="info-row">
              <span class="label">Booking Date:</span>
              <span class="value">${formatDate(bookingData.createdAt)}</span>
            </div>
            <div class="info-row">
              <span class="label">Payment Status:</span>
              <span class="value">${getPaymentStatusBadge(bookingData.paymentStatus).label}</span>
            </div>
            <div class="info-row">
              <span class="label">Booking Status:</span>
              <span class="value">${getBookingStatusBadge(bookingData.bookingStatus).label}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Collection Details</div>
            <div class="info-row">
              <span class="label">Date:</span>
              <span class="value">${formatDate(bookingData.slotDate)}</span>
            </div>
            <div class="info-row">
              <span class="label">Time:</span>
              <span class="value">${bookingData.slotTime}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Patient Details</div>
            <div class="info-row">
              <span class="label">Name:</span>
              <span class="value">${bookingData.patientName}</span>
            </div>
            <div class="info-row">
              <span class="label">Age:</span>
              <span class="value">${bookingData.patientAge} years</span>
            </div>
            <div class="info-row">
              <span class="label">Gender:</span>
              <span class="value">${bookingData.patientGender}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Collection Address</div>
            <p>${bookingData.deliveryAddress.address}<br>
            ${bookingData.deliveryAddress.landmark ? `Near ${bookingData.deliveryAddress.landmark}<br>` : ''}
            ${bookingData.deliveryAddress.city}, ${bookingData.deliveryAddress.state} - ${bookingData.deliveryAddress.pincode}</p>
          </div>

          <div class="section">
            <div class="section-title">Booking Items</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Type</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${bookingData.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.type === 'test' ? 'Test' : 'Package'}</td>
                    <td style="text-align: right;">₹${item.price}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Payment Summary</div>
            <div class="info-row">
              <span class="label">Subtotal:</span>
              <span class="value">₹${bookingData.pricing.subtotal?.toFixed(2) || '0.00'}</span>
            </div>
            ${bookingData.pricing.cartDiscount > 0 ? `
              <div class="info-row">
                <span class="label">Package Discount:</span>
                <span class="value" style="color: green;">-₹${bookingData.pricing.cartDiscount.toFixed(2)}</span>
              </div>
            ` : ''}
            ${bookingData.appliedCoupon ? `
              <div class="info-row">
                <span class="label">Coupon (${bookingData.appliedCoupon.code}):</span>
                <span class="value" style="color: green;">-₹${bookingData.pricing.couponDiscount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="info-row">
              <span class="label">Tax (GST 18%):</span>
              <span class="value">₹${bookingData.pricing.tax?.toFixed(2) || '0.00'}</span>
            </div>
            <div class="info-row">
              <span class="label">Home Collection:</span>
              <span class="value" style="color: green;">FREE</span>
            </div>
            <div class="info-row total-row">
              <span class="label">Total Amount:</span>
              <span class="value">₹${bookingData.pricing.total?.toFixed(2) || '0.00'}</span>
            </div>
          </div>

          ${paymentId ? `
            <div class="section">
              <div class="info-row">
                <span class="label">Payment ID:</span>
                <span class="value">${paymentId}</span>
              </div>
            </div>
          ` : ''}

          <div class="footer">
            <p>Thank you for choosing HealthLab Diagnostics!</p>
            <p>For any queries, contact us at support@healthlab.com or call 1800-XXX-XXXX</p>
          </div>
        </body>
      </html>
    `
  }

  const handleShare = async () => {
    const shareData = {
      title: `Booking #${bookingData?.bookingNumber} - HealthLab Diagnostics`,
      text: `I've booked a blood test with HealthLab Diagnostics.\n\nBooking: #${bookingData?.bookingNumber}\nCollection Date: ${formatDate(bookingData?.slotDate)}\nTime: ${bookingData?.slotTime}`,
      url: window.location.href,
    }

    // Check if Web Share API is available
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        toast({
          title: "Shared Successfully",
          description: "Booking details have been shared",
        })
      } catch (err) {
        // User cancelled sharing
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err)
          fallbackShare()
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      fallbackShare()
    }
  }

  const fallbackShare = () => {
    // Copy link to clipboard
    const shareUrl = window.location.href
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          toast({
            title: "Link Copied!",
            description: "Booking link has been copied to clipboard",
          })
        })
        .catch(() => {
          // Fallback for older browsers
          legacyCopyToClipboard(shareUrl)
        })
    } else {
      legacyCopyToClipboard(shareUrl)
    }
  }

  const legacyCopyToClipboard = (text) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.select()
    
    try {
      document.execCommand('copy')
      toast({
        title: "Link Copied!",
        description: "Booking link has been copied to clipboard",
      })
    } catch (err) {
      console.error('Failed to copy:', err)
      toast({
        title: "Copy Failed",
        description: "Please copy the URL manually from the address bar",
        variant: "destructive",
      })
    }
    
    document.body.removeChild(textArea)
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
        <PageHeader title="Booking Confirmation" />
        <main className="max-w-md mx-auto p-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Booking Not Found</h2>
              <p className="text-sm text-muted-foreground mb-6">
                {error || "We couldn't find the booking you're looking for"}
              </p>
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <MobileNav />
      </div>
    )
  }

  const paymentBadge = getPaymentStatusBadge(bookingData.paymentStatus)
  const bookingBadge = getBookingStatusBadge(bookingData.bookingStatus)
  const PaymentIcon = paymentBadge.icon

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Booking Confirmation" />

      <main className="max-w-md mx-auto">
        <div className="p-4 space-y-4">
          {/* Success Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {bookingData.paymentStatus === 'success' ? 'Payment Successful!' : 'Booking Confirmed!'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Your booking has been successfully placed
            </p>
          </div>

          {/* Booking Details Card */}
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-1">Booking Number</p>
                <p className="text-lg font-bold text-primary">#{bookingData.bookingNumber}</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Badge className={`${paymentBadge.className} border flex items-center gap-1`}>
                    <PaymentIcon className="w-3 h-3" />
                    {paymentBadge.label}
                  </Badge>
                  <Badge className={`${bookingBadge.className} border`}>
                    {bookingBadge.label}
                  </Badge>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Collection Details */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Collection Date</p>
                    <p className="text-sm font-medium">{formatDate(bookingData.slotDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Time Slot</p>
                    <p className="text-sm font-medium">{bookingData.slotTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Collection Address</p>
                    <p className="text-sm font-medium">
                      {bookingData.deliveryAddress.address}
                    </p>
                    {bookingData.deliveryAddress.landmark && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Near {bookingData.deliveryAddress.landmark}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {bookingData.deliveryAddress.city}, {bookingData.deliveryAddress.state} - {bookingData.deliveryAddress.pincode}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <User className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Patient Details</p>
                    <p className="text-sm font-medium">{bookingData.patientName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {bookingData.patientGender}, {bookingData.patientAge} years
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test/Package Items */}
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                Booking Items ({bookingData.items.length})
              </h3>
              <div className="space-y-3">
                {bookingData.items.map((item, index) => (
                  <div key={index} className="flex gap-3 pb-3 last:pb-0 border-b last:border-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      item.type === "test" ? "bg-blue-100" : "bg-purple-100"
                    }`}>
                      {item.type === "test" ? (
                        <TestTube className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Package className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.type === "test" ? "Test" : `Package • ${item.totalTests || 0} tests`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Price Summary */}
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 text-sm">Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{bookingData.pricing.subtotal?.toFixed(2) || '0.00'}</span>
                </div>

                {bookingData.pricing.cartDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Package Discount</span>
                    <span className="font-medium">-₹{bookingData.pricing.cartDiscount.toFixed(2)}</span>
                  </div>
                )}

                {bookingData.appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon ({bookingData.appliedCoupon.code})</span>
                    <span className="font-medium">-₹{bookingData.pricing.couponDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (GST 18%)</span>
                  <span className="font-medium">₹{bookingData.pricing.tax?.toFixed(2) || '0.00'}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Home Collection</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>

                <Separator className="my-3" />

                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total {bookingData.paymentStatus === 'success' ? 'Paid' : 'Amount'}</span>
                  <span className="font-bold text-xl text-primary">
                    ₹{bookingData.pricing.total?.toFixed(2) || '0.00'}
                  </span>
                </div>

                {bookingData.pricing.totalDiscount > 0 && (
                  <p className="text-xs text-green-600 text-center pt-2 bg-green-50 rounded-md py-2">
                    🎉 You saved ₹{bookingData.pricing.totalDiscount.toFixed(2)} on this booking!
                  </p>
                )}
              </div>

              {paymentId && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Payment ID</p>
                  <p className="text-xs font-mono text-primary bg-primary/5 px-2 py-1 rounded">{paymentId}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* What's Next */}
          <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-purple-50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                What happens next?
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0">1</span>
                  <span className="text-muted-foreground">Our phlebotomist will arrive at your scheduled time</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0">2</span>
                  <span className="text-muted-foreground">Sample collection will be done safely at your doorstep</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0">3</span>
                  <span className="text-muted-foreground">Reports will be available within 24-48 hours</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0">4</span>
                  <span className="text-muted-foreground">You'll receive a notification when reports are ready</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Receipt
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
            <Link href={`/booking-details?booking_id=${bookingId}`} className="block">
              <Button className="w-full" size="lg">
                View Booking Details
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full bg-transparent" size="lg">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}

export default function BookingConfirmationPage({ searchParams }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    }>
      <BookingConfirmationContent searchParams={searchParams} />
    </Suspense>
  )
}
