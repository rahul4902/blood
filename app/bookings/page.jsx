"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { razorpayAPI } from "@/lib/api"
import MobileNav from "@/components/mobile-nav"
import PageHeader from "@/components/page-header"




export default function BookingsPage() {
  const router = useRouter()
  const { accessToken, loading: authLoading, isAuthenticated } = useAuth()
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("all")
  const hasFetched = useRef(false)

  useEffect(() => {
    if (authLoading || hasFetched.current) return
    if (!isAuthenticated || !accessToken) {
      router.push('/login?redirect=/bookings')
      return
    }
    hasFetched.current = true
    fetchBookings()
  }, [authLoading, isAuthenticated, accessToken, router])

  const fetchBookings = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await razorpayAPI.getUserBookings({
        page: 1,
        limit: 50,
        sortBy: "createdAt",
        sortOrder: "desc",
      })
      if (response.success) setBookings(response.bookings || [])
      else throw new Error(response.message || "Failed to fetch bookings")
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired.")
        setTimeout(() => router.push("/login?redirect=/bookings"), 2000)
      } else {
        setError(err.response?.data?.message || err.message || "Something went wrong.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const pendingStatuses = ["pending", "confirmed", "sample-collected", "processing"]
  const completedBookings = bookings.filter(b => b.bookingStatus === "completed")
  const pendingBookings = bookings.filter(b => pendingStatuses.includes(b.bookingStatus))
  const displayedBookings = bookings.filter(b => b.bookingStatus !== "cancelled")

  const getStatusIcon = status => {
    if (status === "completed") return <CheckCircle2 className="w-5 h-5 text-green-600" />
    if (["confirmed", "pending"].includes(status)) return <Clock className="w-5 h-5 text-blue-600" />
    if (["processing", "sample-collected"].includes(status)) return <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
    return null
  }

  const getStatusText = status => {
    switch (status) {
      case "completed": return "Completed"
      case "confirmed": return "Pending"
      case "pending": return "Pending"
      case "sample-collected": return "Pending"
      case "processing": return "Pending"
      default: return "Pending"
    }
  }

  const formatDate = dateStr =>
    new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })

  const formatAmount = amount =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount)

  const renderBookingCard = booking => (
    <Card key={booking._id} className="rounded-xl bg-white shadow-md p-0">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div>
            <p className="font-medium text-sm text-primary mb-1">
              #{booking.bookingNumber || booking._id.slice(-6).toUpperCase()}
            </p>
            <p className="text-xs text-gray-400">{formatDate(booking.createdAt)}</p>
            {booking.slotDate && booking.slotTime && (
              <p className="text-xs text-gray-500 mt-1">
                📅 {formatDate(booking.slotDate)} • {booking.slotTime}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end">
            {getStatusIcon(booking.bookingStatus)}
            <span className="text-xs font-semibold">{getStatusText(booking.bookingStatus)}</span>
          </div>
        </div>
        <div className="mb-2">
          {booking.items?.map((item, idx) => (
            <div key={item._id || idx} className="text-sm font-medium text-gray-900">
              • {item.name}
              {item.type === "package" && item.totalTests > 0 && (
                <span className="text-xs text-gray-400 ml-1">({item.totalTests} tests)</span>
              )}
            </div>
          ))}
          {booking.patientName && (
            <div className="text-xs text-gray-400 mt-2">
              {booking.patientName}
              {booking.patientAge && `, ${booking.patientAge} yrs`}
              {booking.patientGender && `, ${booking.patientGender}`}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 pt-2">
          <div>
            <span className="font-bold text-base text-gray-900">{formatAmount(booking.pricing?.total || 0)}</span>
            {booking.paymentStatus && (
              <div className="text-xs text-gray-400 capitalize">Payment: {booking.paymentStatus}</div>
            )}
          </div>
          <div className="flex gap-1">
            <Link href={`/booking-details?booking_id=${booking._id}`}>
              <Button variant="outline" size="sm">Details</Button>
            </Link>
            {booking.bookingStatus === "completed" && booking.reportUrl && (
              <Link href={`/reports?booking_id=${booking._id}`}>
                <Button size="sm" className="bg-blue-500 text-white">Report</Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderEmptyState = message => (
    <div className="text-center py-20 text-gray-400">{message}</div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 flex flex-col">
      <PageHeader title="My Bookings" />
      <main className="flex-1 w-full max-w-md mx-auto font-sans pb-20">
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4 bg-white rounded-xl shadow overflow-hidden border">
              <TabsTrigger value="all">All ({displayedBookings.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-3">
              {displayedBookings.length > 0
                ? displayedBookings.map(renderBookingCard)
                : renderEmptyState("No bookings found")}
            </TabsContent>
            <TabsContent value="pending" className="space-y-3">
              {pendingBookings.length > 0
                ? pendingBookings.map(renderBookingCard)
                : renderEmptyState("No pending bookings")}
            </TabsContent>
            <TabsContent value="completed" className="space-y-3">
              {completedBookings.length > 0
                ? completedBookings.map(renderBookingCard)
                : renderEmptyState("No completed bookings")}
            </TabsContent>
          </Tabs>
          {isLoading && (
            <div className="fixed inset-0 flex items-center justify-center bg-white/90 z-50">
              <Loader2 className="animate-spin w-8 h-8 text-blue-500 mr-2" />
              <span className="text-blue-500 text-lg font-medium">Loading...</span>
            </div>
          )}
          {error && (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/90 z-50 p-8">
              <div className="mb-4 text-red-500 font-bold">{error}</div>
              <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
            </div>
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
