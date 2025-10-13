"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Minus, ShoppingCart, IndianRupee } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { removeFromCart, updateQuantity, setCartOpen } from "@/lib/features/cart/cartSlice"
import { useRouter } from "next/navigation"

export function CartModal() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { items, total, itemCount, isOpen } = useAppSelector((state) => state.cart)

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(id))
    } else {
      dispatch(updateQuantity({ id, quantity: newQuantity }))
    }
  }

  const handleRemoveItem = (id) => {
    dispatch(removeFromCart(id))
  }

  const handleViewCart = () => {
    dispatch(setCartOpen(false))
    router.push("/cart")
  }

  const handleCheckout = () => {
    dispatch(setCartOpen(false))
    if (items.length > 0) {
      const firstItem = items[0]
      const itemType = firstItem.type === "package" ? "package" : "test"
      router.push(`/book?${itemType}=${firstItem.id}`)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => dispatch(setCartOpen(open))}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Cart ({itemCount} items)
          </DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cart Items */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {item.type === "package" ? "Package" : "Test"}
                      </Badge>
                      <div className="flex items-center text-green-600 text-sm">
                        <IndianRupee className="w-3 h-3 mr-1" />
                        <span>{item.price}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-gray-300 rounded">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="h-6 w-6 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="px-2 text-sm">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg mb-4">
                <span>Total</span>
                <div className="flex items-center">
                  <IndianRupee className="w-5 h-5 mr-1" />
                  <span>{total}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleViewCart} className="flex-1 bg-transparent">
                  View Cart
                </Button>
                <Button onClick={handleCheckout} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Checkout
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
