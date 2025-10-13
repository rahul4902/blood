// app/cart/page.js
"use client"

import MobileHeader from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import PageHeader from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/context/CartContext"
import { Trash2, ShoppingBag, Tag, Loader2, Percent, Gift } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function CartPage() {
  const router = useRouter()
  const {
    items,
    removeFromCart,
    getSubtotal,
    getDiscount,
    getTax,
    getTotal
  } = useCart()

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [items])

  const handleRemoveItem = (id, type) => {
    removeFromCart(id, type)
  }


  const handleProceedToCheckout = () => {
    router.push('/delivery-address')
  }

  const subtotal = getSubtotal()
  const discount = getDiscount()
  const tax = getTax()
  const total = getTotal()

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <PageHeader title="My Cart" />
        <main className="max-w-md mx-auto">
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading cart...</p>
          </div>
        </main>
        <MobileNav />
      </div>
    )
  }

  // Empty Cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <PageHeader title="My Cart" />
        <main className="max-w-md mx-auto">
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Add tests or packages to get started
            </p>
            <Link href="/">
              <Button>Browse Tests</Button>
            </Link>
          </div>
        </main>
        <MobileNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-40">
      <PageHeader title="My Cart" />

      <main className="max-w-md mx-auto">
        <div className="p-4">
          {/* Cart Items Count */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? 'item' : 'items'} in cart
            </p>
          </div>

          {/* Cart Items */}
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <Card key={`${item.type}-${item.id}`} className="border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-sm line-clamp-2 flex-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => handleRemoveItem(item.id, item.type)}
                          className="text-destructive flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {item.type === "test"
                          ? item.category || "Medical Test"
                          : item.testsIncluded
                            ? `${item.testsIncluded.length} tests included`
                            : item.totalTests
                              ? `${item.totalTests} tests included`
                              : "Health Package"
                        }
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-primary text-lg">₹{item.price}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${item.type === "test"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                          }`}>
                          {item.type === "test" ? "Test" : "Package"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>



          {/* Price Details */}
          <Card className="border-none shadow-sm mb-4">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Price Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Discount
                    </span>
                    <span className="font-medium text-green-600">
                      -₹0
                    </span>
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

                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Amount</span>
                    <span className="font-bold text-primary text-lg">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Savings Banner */}
          {discount > 0 && (
            <Card className="border-none shadow-sm bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl">🎉</span>
                  </div>
                  <div>
                    <p className="text-sm text-green-900 font-bold">
                      You are saving ₹{discount.toFixed(2)}
                    </p>
                    <p className="text-xs text-green-700">
                      on this order!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Bottom Checkout Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-border p-4 z-40 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p className="text-xl font-bold text-primary">₹{total.toFixed(2)}</p>
          </div>
          <Button
            className="flex-1"
            size="lg"
            onClick={handleProceedToCheckout}
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>

      <MobileNav />
    </div>
  )
}
