"use client"

import { Button } from "@/components/ui/button"
import { Phone, MessageCircle } from "lucide-react"

export function ContactWidget() {
  const handleWhatsAppClick = () => {
    window.open("https://wa.me/919876543210?text=Hello! I need help with medical tests.", "_blank")
  }

  const handleCallClick = () => {
    window.location.href = "tel:+919876543210"
  }

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 z-50 flex flex-col space-y-3">
      <Button
        onClick={handleWhatsAppClick}
        className="w-12 h-12 bg-green-600 hover:bg-green-700 rounded-full shadow-lg"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 text-white" />
      </Button>
      <Button
        onClick={handleCallClick}
        className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg"
        title="Call Now"
      >
        <Phone className="w-5 h-5 text-white" />
      </Button>
    </div>
  )
}
