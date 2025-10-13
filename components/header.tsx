"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  User,
  UserPlus,
  LogOut,
  Menu,
  X,
  ShoppingCart,
  MapPin,
  ChevronDown,
  TestTube,
  Package,
  Gift,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { setMobileMenuOpen, setContactModalOpen, setCurrentPage } from "@/lib/features/ui/uiSlice"
import { setCartOpen } from "@/lib/features/cart/cartSlice"
import { CartModal } from "@/components/cart-modal"

export function Header() {
  const dispatch = useAppDispatch()
  const pathname = usePathname()
  const { mobileMenuOpen } = useAppSelector((state) => state.ui)
  const { itemCount } = useAppSelector((state) => state.cart)

  useEffect(() => {
    dispatch(setCurrentPage(pathname))
  }, [pathname, dispatch])

  const handleContactClick = () => {
    dispatch(setContactModalOpen(true))
  }

  const handleCartClick = () => {
    dispatch(setCartOpen(true))
  }

  return (
    <>
      {/* Top Promotional Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center text-center">
            <span className="text-sm md:text-base">
              Book <span className="underline font-semibold">full body checkup</span> with Vit. D & B12 at just{" "}
              <span className="font-bold">₹1499</span>
            </span>
            <Link href="/offers">
              <Button className="ml-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 text-sm rounded-full">
                Order Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex items-center">
                {/* <span className="text-2xl font-bold text-orange-500">Orange</span> */}
                <div className="ml-1">
                  <span className="text-lg font-medium text-gray-700">Health</span>
                  <span className="text-lg font-medium text-orange-500">Hub</span>
                </div>
              </div>
            </Link>

            {/* Location Selector */}
            <div className="hidden md:flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">MY LOCATION</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-1 text-gray-700 hover:bg-gray-50">
                    <span className="font-medium">Bangalore</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <DropdownMenuItem>Mumbai</DropdownMenuItem>
                  <DropdownMenuItem>Delhi</DropdownMenuItem>
                  <DropdownMenuItem>Bangalore</DropdownMenuItem>
                  <DropdownMenuItem>Chennai</DropdownMenuItem>
                  <DropdownMenuItem>Hyderabad</DropdownMenuItem>
                  <DropdownMenuItem>Pune</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right Side Navigation */}
            <div className="flex items-center space-x-6">
              {/* Tests */}
              <Link
                href="/search"
                className="hidden md:flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors"
              >
                <TestTube className="w-5 h-5" />
                <span className="font-medium">Tests</span>
              </Link>

              {/* Checkups */}
              <Link
                href="/search"
                className="hidden md:flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors"
              >
                <Package className="w-5 h-5" />
                <span className="font-medium">Checkups</span>
              </Link>

              {/* Offers */}
              <Link
                href="/offers"
                className="hidden md:flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors"
              >
                <Gift className="w-5 h-5" />
                <span className="font-medium">Offers</span>
              </Link>

              {/* Cart Icon */}
              <Button
                variant="ghost"
                size="sm"
                className="relative hidden md:flex hover:bg-gray-50"
                onClick={handleCartClick}
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden md:flex border-gray-300 hover:bg-gray-50 bg-transparent"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <Link href="/profile">
                    <DropdownMenuItem>
                      <User className="w-4 h-4 mr-2" />
                      Profile Settings
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Family Member
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => dispatch(setMobileMenuOpen(!mobileMenuOpen))}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t">
              <div className="px-4 py-2 space-y-1">
                <Link
                  href="/search"
                  className="flex items-center py-3 text-gray-700 hover:text-orange-500 font-medium transition-colors"
                  onClick={() => dispatch(setMobileMenuOpen(false))}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Tests
                </Link>
                <Link
                  href="/search"
                  className="flex items-center py-3 text-gray-700 hover:text-orange-500 font-medium transition-colors"
                  onClick={() => dispatch(setMobileMenuOpen(false))}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Checkups
                </Link>
                <Link
                  href="/offers"
                  className="flex items-center py-3 text-gray-700 hover:text-orange-500 font-medium transition-colors"
                  onClick={() => dispatch(setMobileMenuOpen(false))}
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Offers
                </Link>
                <Link
                  href="/reports"
                  className="block py-3 text-gray-700 hover:text-orange-500 font-medium transition-colors"
                  onClick={() => dispatch(setMobileMenuOpen(false))}
                >
                  Reports
                </Link>
                <button
                  onClick={handleContactClick}
                  className="block py-3 text-gray-700 hover:text-orange-500 w-full text-left font-medium transition-colors"
                >
                  Contact
                </button>
                <Link
                  href="/about"
                  className="block py-3 text-gray-700 hover:text-orange-500 font-medium transition-colors"
                  onClick={() => dispatch(setMobileMenuOpen(false))}
                >
                  About
                </Link>
                <div className="pt-2 border-t border-gray-200">
                  <button
                    onClick={handleCartClick}
                    className="flex items-center py-3 text-gray-700 hover:text-orange-500 w-full text-left font-medium transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Cart {itemCount > 0 && `(${itemCount})`}
                  </button>
                  <Link
                    href="/profile"
                    className="block py-3 text-gray-700 hover:text-orange-500 w-full text-left font-medium transition-colors"
                    onClick={() => dispatch(setMobileMenuOpen(false))}
                  >
                    Profile Settings
                  </Link>
                  <button className="block py-3 text-red-600 hover:text-red-700 w-full text-left font-medium transition-colors">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
      <CartModal />
    </>
  )
}
