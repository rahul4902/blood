"use client"

import { useState, useRef } from "react"
import PageHeader from "@/components/page-header"
import MobileNav from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

const MOCK_AVAILABILITY = {
  // Completely disabled dates (no slots available)
  disabledDates: [
    // Format: "YYYY-MM-DD"
  ],
  // Partially disabled slots by date
  disabledSlots: {
    // Format: "YYYY-MM-DD": ["time1", "time2"]
  },
}

// Function to generate disabled dates dynamically (e.g., every 5th day, Sundays, etc.)
const generateDisabledDates = (startDate, count) => {
  const disabled = []
  const current = new Date(startDate)

  for (let i = 0; i < count; i++) {
    const date = new Date(current)
    date.setDate(current.getDate() + i)
    const dateString = date.toISOString().split("T")[0]

    // Disable every 5th day
    if ((i + 1) % 5 === 0) {
      disabled.push(dateString)
    }

    // Disable some random Sundays
    if (date.getDay() === 0 && Math.random() > 0.5) {
      disabled.push(dateString)
    }
  }

  return disabled
}

// Function to generate disabled slots for specific dates
const generateDisabledSlots = (startDate, count) => {
  const disabledSlots = {}
  const current = new Date(startDate)

  for (let i = 0; i < count; i++) {
    const date = new Date(current)
    date.setDate(current.getDate() + i)
    const dateString = date.toISOString().split("T")[0]

    // Skip if date is completely disabled
    if (MOCK_AVAILABILITY.disabledDates.includes(dateString)) {
      continue
    }

    // Randomly disable some slots for certain dates
    if (i % 3 === 0) {
      // Every 3rd day has some disabled slots
      disabledSlots[dateString] = ["06:00 AM", "09:00 AM", "02:00 PM", "08:00 PM"]
    } else if (i % 7 === 0) {
      // Every 7th day has different disabled slots
      disabledSlots[dateString] = ["11:00 AM", "01:00 PM", "05:00 PM"]
    }
  }

  return disabledSlots
}

const generateDates = (startDate, count) => {
  const dates = []
  const current = new Date(startDate)

  for (let i = 0; i < count; i++) {
    const date = new Date(current)
    date.setDate(current.getDate() + i)

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    dates.push({
      date: date.toISOString().split("T")[0],
      day: days[date.getDay()],
      dayNum: date.getDate().toString(),
      fullDate: date,
    })
  }

  return dates
}

const getTimeSlotsForDate = (dateString) => {
  const date = new Date(dateString)
  const dayOfWeek = date.getDay()

  // Weekend has fewer slots
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      Morning: ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM"],
      Afternoon: ["12:00 PM", "01:00 PM", "02:00 PM"],
      Evening: ["04:00 PM", "05:00 PM", "06:00 PM"],
    }
  }

  // Weekdays have full slots
  return {
    Morning: ["06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM"],
    Afternoon: ["12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM"],
    Evening: ["04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"],
    Night: ["08:00 PM", "09:00 PM", "10:00 PM"],
  }
}

const isDateDisabled = (dateString) => {
  return MOCK_AVAILABILITY.disabledDates.includes(dateString)
}

const isSlotDisabled = (dateString, timeSlot) => {
  const disabledSlots = MOCK_AVAILABILITY.disabledSlots[dateString]
  return disabledSlots ? disabledSlots.includes(timeSlot) : false
}

const hasAvailableSlots = (dateString) => {
  if (isDateDisabled(dateString)) {
    return false
  }

  const allSlots = getTimeSlotsForDate(dateString)
  const disabledSlots = MOCK_AVAILABILITY.disabledSlots[dateString] || []

  // Count total slots
  const totalSlots = Object.values(allSlots).flat().length

  // If all slots are disabled, date has no available slots
  return disabledSlots.length < totalSlots
}

export default function TimeSlotPage() {
  const router = useRouter()
  const today = new Date()

  const [allDates] = useState(() => {
    const dates = generateDates(today, 30)
    // Generate disabled dates and slots
    MOCK_AVAILABILITY.disabledDates = generateDisabledDates(today, 30)
    MOCK_AVAILABILITY.disabledSlots = generateDisabledSlots(today, 30)
    return dates
  })

  const [selectedDate, setSelectedDate] = useState(() => {
    const firstAvailable = allDates.find((d) => hasAvailableSlots(d.date))
    return firstAvailable ? firstAvailable.date : allDates[0].date
  })

  const [startDateIndex, setStartDateIndex] = useState(0)
  const [selectedTime, setSelectedTime] = useState("")
  const dateScrollRef = useRef(null)

  const timeSlots = getTimeSlotsForDate(selectedDate)

  const visibleDates = allDates.slice(startDateIndex, startDateIndex + 5)

  const formatSelectedDate = () => {
    const date = new Date(selectedDate)
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const handlePrevDates = () => {
    if (startDateIndex > 0) {
      setStartDateIndex((prev) => Math.max(0, prev - 1))
    }
  }

  const handleNextDates = () => {
    if (startDateIndex + 5 < allDates.length) {
      setStartDateIndex((prev) => Math.min(allDates.length - 5, prev + 1))
    }
  }

  const handleDateSelect = (date) => {
    if (!hasAvailableSlots(date)) {
      return // Don't allow selection of dates with no available slots
    }
    setSelectedDate(date)
    setSelectedTime("") // Reset selected time when date changes
  }

  const handleContinue = () => {
    if (selectedTime) {
      router.push("/patient-details")
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Select Session Time" />

      <main className="max-w-md mx-auto p-4">
        {/* Date Selection */}
        <Card className="border-none shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-primary">{formatSelectedDate()}</h3>
              <Calendar className="w-5 h-5 text-primary" />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full flex-shrink-0"
                onClick={handlePrevDates}
                disabled={startDateIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div
                ref={dateScrollRef}
                className="flex-1 flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {visibleDates.map((date) => {
                  const disabled = !hasAvailableSlots(date.date)
                  return (
                    <button
                      key={date.date}
                      onClick={() => handleDateSelect(date.date)}
                      disabled={disabled}
                      className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-lg border-2 transition-all snap-center ${
                        disabled
                          ? "border-border bg-muted/30 opacity-40 cursor-not-allowed"
                          : selectedDate === date.date
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-xs text-muted-foreground mb-1">{date.day}</span>
                      <span className="text-lg font-bold">{date.dayNum}</span>
                    </button>
                  )
                })}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full flex-shrink-0"
                onClick={handleNextDates}
                disabled={startDateIndex + 5 >= allDates.length}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {!hasAvailableSlots(selectedDate) ? (
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                No time slots available for this date. Please select another date.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 overflow-y-auto scroll-smooth" style={{ maxHeight: "calc(100vh - 320px)" }}>
            {Object.entries(timeSlots).map(([period, slots]) => (
              <div key={period}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">{period}</h3>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {slots.map((time) => {
                    const slotDisabled = isSlotDisabled(selectedDate, time)
                    return (
                      <button
                        key={time}
                        onClick={() => !slotDisabled && setSelectedTime(time)}
                        disabled={slotDisabled}
                        className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                          slotDisabled
                            ? "border-border bg-muted/30 text-muted-foreground opacity-40 cursor-not-allowed line-through"
                            : selectedTime === time
                              ? "border-primary bg-primary text-white"
                              : "border-border text-foreground hover:border-primary/50"
                        }`}
                      >
                        {time}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-border p-4 z-40">
          <div className="max-w-md mx-auto flex gap-3">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleContinue} disabled={!selectedTime}>
              Confirm
            </Button>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
