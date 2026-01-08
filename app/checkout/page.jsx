"use client"

import { useState, useEffect, Suspense } from "react"
import PageHeader from "@/components/page-header"
import MobileNav from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Calendar,
  Users,
  Tag,
  CreditCard,
  Wallet,
  ChevronRight,
  ShoppingBag,
  Loader2,
  AlertCircle,
  TestTube,
  Package
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  slotStorage,
  addressStorage,
  patientStorage,
  bookingStorage,
} from "@/lib/localStorage"
import { addressAPI, razorpayAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/contexts/CartContext"
import { useRazorpay } from "@/lib/useRazorpay"
import { useAuth } from "@/contexts/AuthContext"

function CheckoutContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const razorpayLoaded = useRazorpay()

  const {
    items: cartItems,
    getSubtotal,
    getDiscount,
    getTax,
    clearCart
  } = useCart()

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("razorpay")
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState("")
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)

  const validCoupons = {
    HEALTH20: { discount: 20, type: "percentage" },
    SAVE100: { discount: 100, type: "fixed" },
    FIRST50: { discount: 50, type: "fixed" },
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add items first.",
        variant: "destructive",
      })
      router.push("/cart")
      return
    }

    loadCheckoutData()
  }, [])

  const loadCheckoutData = async () => {
    try {
      setLoading(true)

      // Slot
      const slot = slotStorage.getSelectedSlot()
      if (!slot || !slot.date || !slot.time) {
        toast({
          title: "Time Slot Required",
          description: "Please select a time slot before proceeding to checkout.",
          variant: "destructive",
        })
        router.push("/time-slot")
        return
      }
      setSelectedSlot(slot)

      // Address
      const addressId = addressStorage.getSelectedAddressId()
      const bookingData = bookingStorage.getBookingData()

      let addressFound = false
      if (bookingData?.addressDetails) {
        setSelectedAddress(bookingData.addressDetails)
        addressFound = true
      } else if (addressId) {
        try {
          const response = await addressAPI.getAddresses()
          if (response.success && response.addresses) {
            const address = response.addresses.find(a => a.id === addressId)
            if (address) {
              setSelectedAddress(address)
              bookingStorage.updateBookingData({ addressDetails: address })
              addressFound = true
            }
          }
        } catch (error) {
          console.error('Error fetching address:', error)
        }
      }

      if (!addressFound) {
        toast({
          title: "Address Required",
          description: "Please select a delivery address before proceeding.",
          variant: "destructive",
        })
        router.push("/delivery-address")
        return
      }

      // Patient (from storage or URL)
      const patientId = patientStorage.getSelectedPatientId()
      const urlParams = new URLSearchParams(window.location.search)
      const patientName = urlParams.get('patientName') || ""
      const age = urlParams.get('age') || ""
      const gender = urlParams.get('gender') || ""
      const relation = urlParams.get('relation') || ""

      let patientFound = false
      if (patientId || patientName) {
        const patient = {
          id: patientId || urlParams.get('patientId'),
          name: patientName,
          age: parseInt(age) || 0,
          gender,
          relation
        }

        if (patient.name && patient.age > 0 && patient.gender) {
          setSelectedPatient(patient)
          patientFound = true
        }
      }

      if (!patientFound) {
        toast({
          title: "Patient Details Required",
          description: "Please provide patient details before proceeding.",
          variant: "destructive",
        })
        router.push("/patient-details")
        return
      }

      // Applied coupon
      if (bookingData?.appliedCoupon) {
        setAppliedCoupon(bookingData.appliedCoupon)
        setCouponCode(bookingData.appliedCoupon.code)
      }
    } catch (error) {
      console.error('Error loading checkout data:', error)
      toast({
        title: "Error",
        description: "Failed to load checkout data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const subtotal = getSubtotal()
  const cartDiscount = getDiscount()
  const tax = getTax()
  const couponDiscount = appliedCoupon
    ? appliedCoupon.type === "percentage"
      ? (subtotal * appliedCoupon.discount) / 100
      : appliedCoupon.discount
    : 0
  const totalDiscount = cartDiscount + couponDiscount
  const total = subtotal - totalDiscount + tax

  const handleApplyCoupon = () => {
    const coupon = validCoupons[couponCode.toUpperCase()]
    if (coupon) {
      setAppliedCoupon({ code: couponCode.toUpperCase(), ...coupon })
      setCouponError("")
      bookingStorage.updateBookingData({
        appliedCoupon: { code: couponCode.toUpperCase(), ...coupon }
      })
      toast({
        title: "Coupon Applied! 🎉",
        description: `You saved ₹${coupon.type === "percentage" ? (subtotal * coupon.discount) / 100 : coupon.discount}`,
      })
    } else {
      setCouponError("Invalid coupon code")
      setAppliedCoupon(null)
      toast({
        title: "Invalid Coupon",
        description: "The coupon code you entered is invalid.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode("")
    setCouponError("")
    bookingStorage.updateBookingData({ appliedCoupon: null })
    toast({
      title: "Coupon Removed",
      description: "The coupon has been removed from your booking.",
    })
  }

  const validateBookingData = () => {
    if (!selectedSlot || !selectedSlot.date || !selectedSlot.time) {
      toast({
        title: "Missing Information",
        description: "Please select a time slot",
        variant: "destructive",
      })
      router.push("/time-slot")
      return false
    }
    if (!selectedAddress || !selectedAddress.address) {
      toast({
        title: "Missing Information",
        description: "Please select a delivery address",
        variant: "destructive",
      })
      router.push("/delivery-address")
      return false
    }
    if (!selectedPatient) {
      toast({
        title: "Missing Information",
        description: "Please select patient details",
        variant: "destructive",
      })
      router.push("/patient-details")
      return false
    }
    if (!selectedPatient.name || !selectedPatient.age || !selectedPatient.gender) {
      toast({
        title: "Invalid Patient Data",
        description: "Patient information is incomplete. Please update patient details.",
        variant: "destructive",
      })
      router.push("/patient-details")
      return false
    }
    return true
  }

  const handlePayment = () => {
    if (!validateBookingData()) return
    if (paymentMethod === "razorpay") {
      initiateRazorpayPayment()
    } else if (paymentMethod === "pay-on-collection") {
      createPayOnCollectionBooking()
    }
  }

   const initiateRazorpayPayment = async () => {
    if (!razorpayLoaded) {
      toast({ title: "Loading Payment Gateway", description: "Please wait while we load the payment gateway..." })
      return
    }
    if (typeof window === 'undefined' || !window.Razorpay) {
      toast({ title: "Error", description: "Razorpay SDK not available. Please refresh and try again.", variant: "destructive" })
      return
    }

    try {
      setProcessing(true)

      // Create Razorpay Order on server (amount in paise)
      const bookingPayload = {
        amount: Math.round(total * 100),
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          patientName: selectedPatient.name,
          patientId: selectedPatient.id || 'N/A',
          testCount: cartItems.length,
        },
        bookingData: {
          patientId: selectedPatient.id || null,
          patientName: selectedPatient.name,
          patientAge: parseInt(selectedPatient.age) || 0,
          patientGender: selectedPatient.gender,
          patient: {
            name: selectedPatient.name,
            age: parseInt(selectedPatient.age) || 0,
            gender: selectedPatient.gender,
            relation: selectedPatient.relation || 'Self'
          },
          addressId: selectedAddress.id,
          deliveryAddress: {
            type: selectedAddress.type,
            label: selectedAddress.label || '',
            address: selectedAddress.address,
            landmark: selectedAddress.landmark || '',
            city: selectedAddress.city,
            state: selectedAddress.state,
            pincode: selectedAddress.pincode
          },
          slotDate: selectedSlot.date,
          slotTime: selectedSlot.time,
          slot: {
            date: selectedSlot.date,
            time: selectedSlot.time
          },
          items: cartItems.map(item => ({
            itemId: item.id,
            type: item.type,
            name: item.name,
            price: item.price,
            category: item.category || '',
            testsIncluded: item.testsIncluded || [],
            totalTests: item.totalTests || 0
          })),
          pricing: { subtotal, cartDiscount, couponDiscount, totalDiscount, tax, total },
          appliedCoupon: appliedCoupon ? { code: appliedCoupon.code, discount: appliedCoupon.discount, type: appliedCoupon.type } : null,
          paymentMethod: 'razorpay'
        }
      }

      const bookingData = await razorpayAPI.createBooking(bookingPayload)
      if (!bookingData.success) throw new Error(bookingData.message || 'Failed to create booking')

      // Must be the exact Razorpay order id (starts with "order_")
      if (!bookingData.bookingId || !String(bookingData.bookingId).startsWith('order_')) {
        throw new Error('Invalid Razorpay order id from server')
      }

      toast({ title: "Booking Created", description: "Opening payment gateway..." })

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: bookingData.amount,      // in paise
        currency: bookingData.currency,  // e.g., 'INR'
        order_id: bookingData.bookingId,   // critical: must be 'order_id'
        name: "HealthLab Diagnostics",
        description: `Blood Test Booking - ${cartItems.length} ${cartItems.length === 1 ? 'Test' : 'Tests'}`,
        image: "/logo.png",
        prefill: {
          name: user?.name || selectedPatient.name,
          email: user?.email || "",
          contact: user?.phone || "",
        },
        notes: {
          bookingNumber: bookingData.bookingNumber,
          dbBookingId: bookingData.dbBookingId,
          address: selectedAddress.address,
          patient: selectedPatient.name,
        },
        theme: { color: "#F37254" },
        handler: async function (response) {
           if (!response.razorpay_order_id || !response.razorpay_signature) {
            console.warn('Razorpay returned only payment_id; check order_id usage')
          }
          await verifyPayment(response, bookingData.dbBookingId, bookingData.bookingNumber)
        },
        modal: {
          ondismiss: function () {
            setProcessing(false)
            toast({ title: "Payment Cancelled", description: "You cancelled the payment. Please try again.", variant: "destructive" })
          },
        },
      }

      console.log('Opening Razorpay with order_id:', options.order_id)
      const rz = new window.Razorpay(options)
      rz.on('payment.failed', function (response) {
        setProcessing(false)
        toast({ title: "Payment Failed", description: response.error?.description || "Payment failed. Please try again.", variant: "destructive" })
      })
      rz.open()
    } catch (error) {
      setProcessing(false)
      toast({ title: "Payment Error", description: error?.message || "Failed to initiate payment. Please try again.", variant: "destructive" })
    }
  }

  const verifyPayment = async (response, dbBookingId, bookingNumber) => {
    try {
      const verifyData = await razorpayAPI.verifyPayment({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      })

      if (verifyData.success) {
        const completeBookingData = {
          paymentId: verifyData.paymentId,
          bookingId: verifyData.bookingId,
          bookingNumber: bookingNumber || verifyData.bookingNumber,
          dbBookingId: dbBookingId || verifyData.dbBookingId,
          paymentStatus: 'success',
          slot: selectedSlot,
          address: selectedAddress,
          patient: selectedPatient,
          items: cartItems,
          pricing: { subtotal, cartDiscount, couponDiscount, totalDiscount, tax, total }
        }
        bookingStorage.updateBookingData(completeBookingData)
        clearCart()
        toast({ title: "Payment Successful! 🎉", description: "Your booking has been confirmed." })
        setTimeout(() => {
          window.location.href = `/booking-confirmation?booking_id=${dbBookingId || verifyData.dbBookingId}&payment_id=${verifyData.paymentId}`
        }, 1000)
      } else {
        throw new Error(verifyData.message || 'Payment verification failed')
      }
    } catch (error) {
      toast({ title: "Verification Failed", description: error?.message || "Payment verification failed. Please contact support.", variant: "destructive" })
    } finally {
      setProcessing(false)
    }
  }

  const createPayOnCollectionBooking = async () => {
    try {
      setProcessing(true)
      const bookingPayload = {
        amount: Math.round(total * 100),
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          patientName: selectedPatient.name,
          patientId: selectedPatient.id || 'N/A',
          testCount: cartItems.length,
          paymentMethod: 'pay-on-collection'
        },
        bookingData: {
          patientId: selectedPatient.id || null,
          patientName: selectedPatient.name,
          patientAge: parseInt(selectedPatient.age) || 0,
          patientGender: selectedPatient.gender,
          patient: {
            name: selectedPatient.name,
            age: parseInt(selectedPatient.age) || 0,
            gender: selectedPatient.gender,
            relation: selectedPatient.relation || 'Self'
          },
          addressId: selectedAddress.id,
          deliveryAddress: {
            type: selectedAddress.type,
            label: selectedAddress.label || '',
            address: selectedAddress.address,
            landmark: selectedAddress.landmark || '',
            city: selectedAddress.city,
            state: selectedAddress.state,
            pincode: selectedAddress.pincode
          },
          slotDate: selectedSlot.date,
          slotTime: selectedSlot.time,
          slot: {
            date: selectedSlot.date,
            time: selectedSlot.time
          },
          items: cartItems.map(item => ({
            itemId: item.id,
            type: item.type,
            name: item.name,
            price: item.price,
            category: item.category || '',
            testsIncluded: item.testsIncluded || [],
            totalTests: item.totalTests || 0
          })),
          pricing: {
            subtotal,
            cartDiscount,
            couponDiscount,
            totalDiscount,
            tax,
            total
          },
          appliedCoupon: appliedCoupon ? {
            code: appliedCoupon.code,
            discount: appliedCoupon.discount,
            type: appliedCoupon.type
          } : null,
          paymentMethod: 'pay-on-collection'
        }
      }

      const bookingData = await razorpayAPI.createBooking(bookingPayload)

      if (bookingData.success) {
        const completeBookingData = {
          bookingNumber: bookingData.bookingNumber,
          dbBookingId: bookingData.dbBookingId,
          paymentStatus: 'pending',
          paymentMethod: 'pay-on-collection',
          slot: selectedSlot,
          address: selectedAddress,
          patient: selectedPatient,
          items: cartItems,
          pricing: {
            subtotal,
            cartDiscount,
            couponDiscount,
            totalDiscount,
            tax,
            total
          }
        }

        bookingStorage.updateBookingData(completeBookingData)
        clearCart()

        toast({
          title: "Booking Confirmed! ✅",
          description: "Your booking has been placed successfully.",
        })

        setTimeout(() => {
          window.location.href = `/booking-confirmation?booking_id=${bookingData.dbBookingId}`
        }, 1000)
      } else {
        throw new Error(bookingData.message || 'Failed to create booking')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading checkout...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <PageHeader title="Checkout" />
      <main className="max-w-md mx-auto">
        {/* Sticky Price Summary at Top */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-90">Total Amount</p>
                <p className="text-2xl font-bold">₹{total.toFixed(2)}</p>
              </div>
            </div>
            {(totalDiscount > 0) && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center justify-between">
                <span className="text-xs font-medium">
                  🎉 Total Savings
                </span>
                <span className="text-xs font-bold">₹{totalDiscount.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Cart Items */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Booking Items</h3>
                <Link href="/cart" className="text-xs text-primary font-medium hover:underline">
                  Edit Cart
                </Link>
              </div>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="flex gap-3 pb-3 last:pb-0 border-b last:border-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.type === "test" ? "bg-blue-100" : "bg-purple-100"}`}>
                      {item.type === "test" ? (
                        <TestTube className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Package className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-1 mb-1">{item.name}</h4>
                      <p className="text-xs text-muted-foreground mb-1">
                        {item.type === "test"
                          ? item.category || "Medical Test"
                          : item.testsIncluded
                            ? `${item.testsIncluded.length} tests`
                            : item.totalTests
                              ? `${item.totalTests} tests`
                              : "Package"
                        }
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-primary">₹{item.price}</span>
                        <Badge variant="secondary" className="text-xs h-5">
                          {item.type === "test" ? "Test" : "Package"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">Delivery Address</h3>
                </div>
                <Link
                  href="/delivery-address"
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Change
                </Link>
              </div>
              {selectedAddress ? (
                <div className="ml-10 space-y-0.5">
                  <p className="text-sm font-medium capitalize">
                    {selectedAddress.type}
                    {selectedAddress.label && ` - ${selectedAddress.label}`}
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedAddress.address}</p>
                  {selectedAddress.landmark && (
                    <p className="text-xs text-muted-foreground">
                      Near {selectedAddress.landmark}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                  </p>
                </div>
              ) : (
                <div className="ml-10 flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <button
                    onClick={() => router.push("/delivery-address")}
                    className="text-primary hover:underline"
                  >
                    Please select an address
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Time Slot */}
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">Time Slot</h3>
                </div>
                <Link
                  href="/time-slot"
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Change
                </Link>
              </div>
              {selectedSlot ? (
                <div className="ml-10 space-y-0.5">
                  <p className="text-sm font-medium">{selectedSlot.date}</p>
                  <p className="text-xs text-muted-foreground">{selectedSlot.time}</p>
                </div>
              ) : (
                <div className="ml-10 flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <button
                    onClick={() => router.push("/time-slot")}
                    className="text-primary hover:underline"
                  >
                    Please select a time slot
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Details */}
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">Patient Details</h3>
                </div>
                <Link
                  href="/patient-details"
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Change
                </Link>
              </div>
              {selectedPatient ? (
                <div className="ml-10 space-y-0.5">
                  <p className="text-sm font-medium">{selectedPatient.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedPatient.gender}, {selectedPatient.age} years • {selectedPatient.relation || 'Self'}
                  </p>
                </div>
              ) : (
                <div className="ml-10 flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <button
                    onClick={() => router.push("/patient-details")}
                    className="text-primary hover:underline"
                  >
                    Please select patient
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Apply Coupon */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Tag className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">Apply Coupon</h3>
              </div>
              {appliedCoupon ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">{appliedCoupon.code} Applied!</p>
                    <p className="text-xs text-green-600">You saved ₹{couponDiscount.toFixed(2)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveCoupon}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase())
                        setCouponError("")
                      }}
                      className="flex-1 uppercase"
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={!couponCode}
                      className="cursor-pointer"
                    >
                      Apply
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {couponError}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(validCoupons).map((code) => (
                      <button
                        key={code}
                        onClick={() => {
                          setCouponCode(code)
                          setCouponError("")
                        }}
                        className="text-xs bg-orange-50 text-primary px-3 py-1.5 rounded-full border border-orange-200 hover:bg-orange-100 transition-colors font-medium cursor-pointer"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Price Summary */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-3">Price Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({cartItems.length} items)</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>

                {cartDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Package Discount</span>
                    <span className="font-medium">-₹{cartDiscount.toFixed(2)}</span>
                  </div>
                )}

                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span className="font-medium">-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (GST 18%)</span>
                  <span className="font-medium">₹{tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Home Collection</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>

                <Separator className="my-3" />

                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-bold text-xl text-primary">₹{total.toFixed(2)}</span>
                </div>

                {totalDiscount > 0 && (
                  <p className="text-xs text-green-600 text-center pt-2">
                    🎉 You're saving ₹{totalDiscount.toFixed(2)} on this booking!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-3">Payment Method</h3>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-2">
                  <div className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${paymentMethod === "razorpay" ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`}>
                    <RadioGroupItem value="razorpay" id="razorpay" />
                    <Label htmlFor="razorpay" className="flex-1 cursor-pointer flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Pay with Razorpay</p>
                        <p className="text-xs text-muted-foreground">Cards, UPI, Wallets & More</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Label>
                  </div>

                  <div className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${paymentMethod === "pay-on-collection" ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`}>
                    <RadioGroupItem value="pay-on-collection" id="pay-on-collection" />
                    <Label htmlFor="pay-on-collection" className="flex-1 cursor-pointer flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <Wallet className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Pay on Blood Collection</p>
                        <p className="text-xs text-muted-foreground">Cash or Card at doorstep</p>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Fixed Bottom Payment Button */}
        <div className="fixed bottom-16 left-0 right-0 bg-background border-t shadow-lg p-4 z-20">
          <div className="max-w-md mx-auto">
            <Button
              className="w-full cursor-pointer text-base font-semibold"
              size="lg"
              onClick={handlePayment}
              disabled={processing || (paymentMethod === "razorpay" && !razorpayLoaded)}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {paymentMethod === "razorpay" ? "Pay Now" : "Confirm Booking"} • ₹{total.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
