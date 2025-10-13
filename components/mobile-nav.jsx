// components/mobile-nav.jsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ShoppingCart, Calendar, MessageCircle, User } from "lucide-react"
import { useCart } from "@/context/CartContext"

export default function MobileNav() {
  const pathname = usePathname()
  const { itemCount } = useCart()

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/cart", icon: ShoppingCart, label: "Cart", badge: itemCount },
    { href: "/home-visit", icon: Calendar, label: "Visit" },
    { href: "/chat", icon: MessageCircle, label: "Chat" },
    { href: "/profile", icon: User, label: "Profile" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const hasBadge = item.badge && item.badge > 0

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-1 flex-1 h-full
                transition-all duration-200 relative
                ${isActive ? "text-orange-600" : "text-gray-500"}
              `}
            >
              <div className="relative">
                {/* Icon */}
                <Icon
                  className="w-6 h-6"
                  strokeWidth={isActive ? 2.5 : 2}
                />

                {/* Badge - Solid Orange */}
                {hasBadge > 0 && (
                  <div className="absolute -top-1.5 -right-2">
                    <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-orange-600 rounded-full border-2 border-white shadow-md">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  </div>
                )}
              </div>

              {/* Label */}
              <span className={`text-[11px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
