"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Phone, MessageCircle } from "lucide-react"
import { useAppDispatch } from "@/lib/hooks"
import { setSearchModalOpen } from "@/lib/features/ui/uiSlice"

export function HeroBanner() {
  const dispatch = useAppDispatch()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearchClick = () => {
    dispatch(setSearchModalOpen(true))
  }

  const handleWhatsAppClick = () => {
    window.open("https://wa.me/919876543210", "_blank")
  }

  const handleCallClick = () => {
    window.location.href = "tel:+919876543210"
  }

  return (
    <section className="relative min-h-[60vh] md:min-h-[70vh] bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center">
          {/* Main Title */}
          <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 text-gray-900 leading-tight">
            Your Health, Our Priority
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl mb-6 text-gray-600 max-w-3xl mx-auto">
            Book medical tests online with ease. Fast, accurate, and convenient healthcare at your doorstep.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Input
                placeholder="Search for tests, packages, or health conditions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={handleSearchClick}
                className="h-12 md:h-14 text-base md:text-lg bg-white text-gray-900 border border-gray-200 focus:border-blue-300 rounded-lg px-4 pr-14 cursor-pointer shadow-sm"
                readOnly
              />
              <Button
                onClick={handleSearchClick}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 md:h-10 px-4 bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                <Search className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </div>
          </div>

          {/* Contact Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
            <Button
              onClick={handleCallClick}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2"
            >
              <Phone className="w-4 h-4 mr-2" />
              +91 98765 43210
            </Button>
            <Button onClick={handleWhatsAppClick} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2">
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp Chat
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">50,000+</div>
              <div className="text-sm md:text-base text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">98%</div>
              <div className="text-sm md:text-base text-gray-600">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-sm md:text-base text-gray-600">Support Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">100+</div>
              <div className="text-sm md:text-base text-gray-600">Test Types</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
