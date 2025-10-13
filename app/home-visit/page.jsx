"use client"

import MobileHeader from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, MapPin, User, Phone, ChevronRight, Home, CheckCircle2, Search } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { tests } from "@/lib/data"

export default function HomeVisitPage() {
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedTests, setSelectedTests] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [patientName, setPatientName] = useState("")
  const [patientPhone, setPatientPhone] = useState("")
  const [specialInstructions, setSpecialInstructions] = useState("")

  const timeSlots = [
    "06:00 AM - 08:00 AM",
    "08:00 AM - 10:00 AM",
    "10:00 AM - 12:00 PM",
    "12:00 PM - 02:00 PM",
    "02:00 PM - 04:00 PM",
    "04:00 PM - 06:00 PM",
  ]

  const filteredTests = tests.filter(
    (test) =>
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const toggleTest = (testId) => {
    setSelectedTests((prev) => (prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]))
  }

  const getTotalPrice = () => {
    return tests.filter((test) => selectedTests.includes(test.id)).reduce((sum, test) => sum + test.price, 0)
  }

  const handleBooking = () => {
    if (!selectedDate || !selectedTime || selectedTests.length === 0 || !patientName || !patientPhone) {
      alert("Please fill in all required fields")
      return
    }

    const bookingData = {
      tests: selectedTests,
      date: selectedDate,
      time: selectedTime,
      patientName,
      patientPhone,
      specialInstructions,
      totalPrice: getTotalPrice(),
    }

    console.log("[v0] Booking data:", bookingData)
    alert("Home visit scheduled successfully! You will receive a confirmation shortly.")
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader userName="Shubham Naik" />

      <main className="max-w-md mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary to-secondary text-white p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Home Visit</h1>
              <p className="text-sm text-white/80">Sample collection at your doorstep</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">100%</p>
              <p className="text-xs text-white/80">Safe</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">Free</p>
              <p className="text-xs text-white/80">Collection</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">24hrs</p>
              <p className="text-xs text-white/80">Reports</p>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Select Tests ({selectedTests.length} selected)</h2>
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredTests.map((test) => (
                <Card
                  key={test.id}
                  className={`cursor-pointer transition-all ${
                    selectedTests.includes(test.id) ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => toggleTest(test.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            selectedTests.includes(test.id) ? "border-primary bg-primary" : "border-muted-foreground"
                          }`}
                        >
                          {selectedTests.includes(test.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{test.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{test.category}</p>
                          <p className="text-xs text-muted-foreground mt-1">{test.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-muted-foreground">
                              {test.fasting === "Required" ? "Fasting required" : "No fasting"}
                            </span>
                            <span className="text-xs text-muted-foreground">• {test.tat_time} report</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-primary">₹{test.price}</p>
                        {test.discount > 0 && (
                          <p className="text-xs text-muted-foreground line-through">₹{test.mrp}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Address Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Collection Address</Label>
            <Link href="/addresses">
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-dashed">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Home</p>
                      <p className="text-xs text-muted-foreground">123 Main Street, Apartment 4B, New York, NY 10001</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Date Selection */}
          <div>
            <Label htmlFor="date" className="text-base font-semibold mb-3 block">
              Select Date *
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="pl-10"
              />
            </div>
          </div>

          {/* Time Slot Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Select Time Slot *</Label>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((slot) => (
                <Button
                  key={slot}
                  variant={selectedTime === slot ? "default" : "outline"}
                  className="justify-start text-xs"
                  onClick={() => setSelectedTime(slot)}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {slot}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold mb-3 block">Patient Details</Label>
            <div className="space-y-3">
              <div>
                <Label htmlFor="name" className="text-sm">
                  Full Name *
                </Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Enter patient name"
                    className="pl-10"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm">
                  Phone Number *
                </Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    className="pl-10"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes" className="text-sm">
                  Special Instructions (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any special instructions for the phlebotomist..."
                  className="mt-1 resize-none"
                  rows={3}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                />
              </div>
            </div>
          </div>

          {selectedTests.length > 0 && (
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-none">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Selected Tests</span>
                  <span className="font-semibold">{selectedTests.length}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Home Collection</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-xl font-bold text-primary">₹{getTotalPrice()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            className="w-full h-12 text-base"
            size="lg"
            disabled={!selectedDate || !selectedTime || selectedTests.length === 0 || !patientName || !patientPhone}
            onClick={handleBooking}
          >
            Schedule Home Visit
          </Button>

          <div className="pb-6" />
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
