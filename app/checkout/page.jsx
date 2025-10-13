"use client"

import { useState } from "react"
import PageHeader from "@/components/page-header"
import MobileNav from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { MapPin, Calendar, Users, Tag, CreditCard, Wallet, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState("razorpay")
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState("")

  const validCoupons = {
    HEALTH20: { discount: 20, type: "percentage" },
    SAVE100: { discount: 100, type: "fixed" },
    FIRST50: { discount: 50, type: "fixed" },
  }

  const cartItems = [
    { name: "Complete Blood Count (CBC)", price: 299 },
    { name: "Lipid Profile", price: 599 },
  ]

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0)
  const discount = appliedCoupon
    ? appliedCoupon.type === "percentage"
      ? (subtotal * appliedCoupon.discount) / 100
      : appliedCoupon.discount
    : 0
  const total = subtotal - discount

  const handleApplyCoupon = () => {
    const coupon = validCoupons[couponCode.toUpperCase()]
    if (coupon) {
      setAppliedCoupon({ code: couponCode.toUpperCase(), ...coupon })
      setCouponError("")
    } else {
      setCouponError("Invalid coupon code")
      setAppliedCoupon(null)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode("")
    setCouponError("")
  }

  const handlePayment = () => {
    if (paymentMethod === "razorpay") {
      router.push("/order-confirmation")
    } else if (paymentMethod === "pay-on-collection") {
      router.push("/order-confirmation")
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Checkout" />

      <main className="max-w-md mx-auto">
        <div className="p-4">
          {/* Address Section */}
          <Card className="border-none shadow-sm mb-4">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Delivery Address
                </h3>
                <Link href="/delivery-address" className="text-sm text-primary font-medium">
                  Change
                </Link>
              </div>
              <div className="ml-7">
                <p className="text-sm font-medium">Home</p>
                <p className="text-sm text-muted-foreground">123 Main Street, Apartment 4B</p>
                <p className="text-sm text-muted-foreground">New York, NY 10001</p>
              </div>
            </CardContent>
          </Card>

          {/* Time Slot Section */}
          <Card className="border-none shadow-sm mb-4">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Time Slot
                </h3>
                <Link href="/time-slot" className="text-sm text-primary font-medium">
                  Change
                </Link>
              </div>
              <div className="ml-7">
                <p className="text-sm font-medium">Friday, 18 April 2025</p>
                <p className="text-sm text-muted-foreground">7:00 AM - 8:00 AM</p>
              </div>
            </CardContent>
          </Card>

          {/* Patient Section */}
          <Card className="border-none shadow-sm mb-4">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Patient Details
                </h3>
                <Link href="/patient-details" className="text-sm text-primary font-medium">
                  Change
                </Link>
              </div>
              <div className="ml-7">
                <p className="text-sm font-medium">Leslie Alexander</p>
                <p className="text-sm text-muted-foreground">Female, 34 years</p>
              </div>
            </CardContent>
          </Card>

          {/* Coupon Section */}
          <Card className="border-none shadow-sm mb-4">
            <CardContent className="p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Tag className="w-5 h-5 text-primary" />
                Apply Coupon
              </h3>
              {appliedCoupon ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">{appliedCoupon.code} Applied!</p>
                    <p className="text-xs text-green-600">You saved ₹{discount.toFixed(0)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveCoupon}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value)
                        setCouponError("")
                      }}
                      className="flex-1"
                    />
                    <Button onClick={handleApplyCoupon} disabled={!couponCode}>
                      Apply
                    </Button>
                  </div>
                  {couponError && <p className="text-xs text-red-600">{couponError}</p>}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.keys(validCoupons).map((code) => (
                      <button
                        key={code}
                        onClick={() => {
                          setCouponCode(code)
                          setCouponError("")
                        }}
                        className="text-xs bg-orange-50 text-primary px-3 py-1 rounded-full border border-orange-200 hover:bg-orange-100"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="border-none shadow-sm mb-4">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium">₹{item.price}</span>
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{discount.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Home Collection</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg text-primary">₹{total}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="border-none shadow-sm mb-4">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Payment Method</h3>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted cursor-pointer">
                    <RadioGroupItem value="razorpay" id="razorpay" />
                    <Label htmlFor="razorpay" className="flex-1 cursor-pointer flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Pay with Razorpay</p>
                        <p className="text-xs text-muted-foreground">Cards, UPI, Wallets & More</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted cursor-pointer">
                    <RadioGroupItem value="pay-on-collection" id="pay-on-collection" />
                    <Label htmlFor="pay-on-collection" className="flex-1 cursor-pointer flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
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

          <Button className="w-full" size="lg" onClick={handlePayment}>
            {paymentMethod === "razorpay" ? "Proceed to Payment" : "Confirm Order"}
          </Button>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
