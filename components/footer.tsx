"use client"

import Link from "next/link"
import { Phone, Mail, MapPin, Calendar, FileText, Search, Home, User } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { setSearchModalOpen } from "@/lib/features/ui/uiSlice"
import { SearchModal } from "@/components/search-modal"

export function Footer() {
  const dispatch = useAppDispatch()
  const { searchModalOpen } = useAppSelector((state) => state.ui)

  const handleSearchClick = () => {
    dispatch(setSearchModalOpen(true))
  }

  return (
    <>
      {/* Mobile Footer - Only visible on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-5 gap-1 p-2">
          <Link href="/" className="flex flex-col items-center py-2 px-1">
            <Home className="w-5 h-5 text-gray-600 mb-1" />
            <span className="text-xs text-gray-600">Home</span>
          </Link>
          <button onClick={handleSearchClick} className="flex flex-col items-center py-2 px-1">
            <Search className="w-5 h-5 text-gray-600 mb-1" />
            <span className="text-xs text-gray-600">Search</span>
          </button>
          <Link href="/bookings" className="flex flex-col items-center py-2 px-1">
            <Calendar className="w-5 h-5 text-gray-600 mb-1" />
            <span className="text-xs text-gray-600">Bookings</span>
          </Link>
          <Link href="/reports" className="flex flex-col items-center py-2 px-1">
            <FileText className="w-5 h-5 text-gray-600 mb-1" />
            <span className="text-xs text-gray-600">Reports</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center py-2 px-1">
            <User className="w-5 h-5 text-gray-600 mb-1" />
            <span className="text-xs text-gray-600">Profile</span>
          </Link>
        </div>
      </div>

      {/* Desktop Footer */}
      <footer className="bg-gray-900 text-white pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">HL</span>
                </div>
                <span className="text-xl font-bold">HealthLab Pro</span>
              </div>
              <p className="text-gray-400 mb-4 text-sm md:text-base">
                Professional medical testing services with convenient booking and comprehensive reports across India.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-gray-400 text-sm">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>info@healthlabpro.com</span>
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>123 Health Street, Medical City, India</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/search" className="hover:text-white transition-colors">
                    Search Tests
                  </Link>
                </li>
                <li>
                  <Link href="/bookings" className="hover:text-white transition-colors">
                    My Bookings
                  </Link>
                </li>
                <li>
                  <Link href="/reports" className="hover:text-white transition-colors">
                    Reports & Results
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Home Sample Collection</li>
                <li>Health Packages</li>
                <li>Individual Tests</li>
                <li>Corporate Health</li>
                <li>Preventive Care</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-6 md:pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 HealthLab Pro. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>

      <SearchModal open={searchModalOpen} onOpenChange={(open) => dispatch(setSearchModalOpen(open))} />
    </>
  )
}
