import MobileHeader from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, Wallet, Plus } from "lucide-react"

export default function PaymentInfoPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader userName="Leslie" />

      <main className="max-w-md mx-auto">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Payment Information</h2>

          <Card className="border-none shadow-sm mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Wallet Balance</p>
                  <p className="text-2xl font-bold text-primary">₹500</p>
                </div>
                <Button size="sm">Add Money</Button>
              </div>
              <p className="text-xs text-muted-foreground">Use wallet balance for faster checkout</p>
            </CardContent>
          </Card>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Saved Cards</h3>
              <Button size="sm" variant="ghost">
                <Plus className="w-4 h-4 mr-1" />
                Add Card
              </Button>
            </div>

            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">•••• •••• •••• 4242</p>
                    <p className="text-xs text-muted-foreground">Expires 12/25</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm bg-blue-50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 text-sm">Payment Methods</h3>
              <p className="text-sm text-muted-foreground mb-2">We accept:</p>
              <div className="flex flex-wrap gap-2">
                {["UPI", "Credit Card", "Debit Card", "Net Banking", "Wallet"].map((method) => (
                  <span key={method} className="text-xs bg-white px-3 py-1 rounded-full">
                    {method}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
