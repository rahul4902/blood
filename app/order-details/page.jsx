import MobileHeader from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, MapPin, Calendar, Clock, User, CreditCard } from "lucide-react"
import Link from "next/link"

export default function OrderDetailsPage({ searchParams }) {
  const orderId = searchParams.id || "12345"

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader userName="Leslie" />

      <main className="max-w-md mx-auto">
        <div className="p-4">
          <Link href="/orders" className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <ChevronLeft className="w-4 h-4" />
            Back to Orders
          </Link>

          <div className="mb-4">
            <h1 className="text-xl font-bold mb-1">Order Details</h1>
            <p className="text-sm text-muted-foreground">Order #{orderId}</p>
          </div>

          <Card className="border-none shadow-sm mb-4">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Order Items</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Complete Health Checkup</p>
                    <p className="text-xs text-muted-foreground">65 tests included</p>
                  </div>
                  <p className="font-bold text-primary">₹1799</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm mb-4">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Collection Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Patient</p>
                    <p className="text-sm font-medium">Leslie Johnson</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Collection Date</p>
                    <p className="text-sm font-medium">15 Jan 2025</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Time Slot</p>
                    <p className="text-sm font-medium">08:00 AM - 10:00 AM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="text-sm font-medium">123 Main Street, Apartment 4B, Mumbai, 400001</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm mb-4">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Payment Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹1999</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-green-600">-₹200</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Home Collection</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Paid</span>
                    <span className="font-bold text-primary">₹1799</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Paid via UPI</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button className="w-full">Download Invoice</Button>
            <Button variant="outline" className="w-full bg-transparent">
              Need Help?
            </Button>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
