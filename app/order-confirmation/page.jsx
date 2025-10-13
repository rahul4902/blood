import MobileHeader from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Calendar, MapPin, Clock } from "lucide-react"
import Link from "next/link"

export default function OrderConfirmationPage({ searchParams }) {
  const orderId = searchParams.id || "12345"

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader userName="Leslie" />

      <main className="max-w-md mx-auto">
        <div className="p-4">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-sm text-muted-foreground">Your booking has been successfully placed</p>
          </div>

          <Card className="border-none shadow-sm mb-4">
            <CardContent className="p-4">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                <p className="text-lg font-bold text-primary">#{orderId}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Collection Date</p>
                    <p className="text-sm font-medium">Tomorrow, 15 Jan 2025</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Time Slot</p>
                    <p className="text-sm font-medium">08:00 AM - 10:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Collection Address</p>
                    <p className="text-sm font-medium">123 Main Street, Apartment 4B</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm mb-4 bg-blue-50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 text-sm">What happens next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">1.</span>
                  <span>Our phlebotomist will arrive at your scheduled time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">2.</span>
                  <span>Sample collection will be done at your doorstep</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">3.</span>
                  <span>Reports will be available within 24-48 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">4.</span>
                  <span>You will receive a notification when reports are ready</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Link href={`/orders?id=${orderId}`}>
              <Button className="w-full" size="lg">
                View Order Details
              </Button>
            </Link>
            <Link href="/">
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
