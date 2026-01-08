"use client";

import { useState, useEffect, useRef } from "react";
import PageHeader from "@/components/page-header";
import MobileNav from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { timeSlotsAPI, settingsAPI } from "@/lib/api";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { slotStorage, bookingStorage } from "@/lib/localStorage";

export default function TimeSlotBookingPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ============================================
  // Settings
  // ============================================
  const [settings, setSettings] = useState({
    advance_booking_days: 30,
    min_booking_notice_hours: 24,
    allow_same_day_booking: false,
    working_days: [1, 2, 3, 4, 5], // Mon-Fri
  });

  // ============================================
  // State Variables
  // ============================================
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [slotsByDate, setSlotsByDate] = useState({}); // ✅ Only slots that exist
  const [loadedMonths, setLoadedMonths] = useState(new Set());

  const [allDates, setAllDates] = useState([]); // ✅ ALL dates (working + disabled)
  const [selectedDate, setSelectedDate] = useState("");
  const [startDateIndex, setStartDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [selectedStartDateTime, setSelectedStartDateTime] = useState("");
  const [selectedEndDateTime, setSelectedEndDateTime] = useState("");

  const dateScrollRef = useRef(null);
  const isInitialLoad = useRef(true);
  const hasAutoSelectedSlot = useRef(false);

  // ============================================
  // Helper: Format Local Date String (YYYY-MM-DD)
  // ============================================
  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // ============================================
  // Helper: Parse Date String to Local Date
  // ============================================
  const parseLocalDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  // ============================================
  // Helper: Format Time from ISO DateTime String
  // ============================================
  const formatTimeFromISO = (isoString) => {
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // ============================================
  // Helper: Extract Date from ISO DateTime String
  // ============================================
  const extractDateFromISO = (isoString) => {
    const date = new Date(isoString);
    return formatLocalDate(date);
  };

  // ============================================
  // Helper: Check if slot datetime is valid (not in past)
  // ============================================
  const isSlotTimeValid = (slotStartDateTime) => {
    const slotTime = new Date(slotStartDateTime);
    const now = new Date();

    // Compare if slot start time is in the future
    return slotTime >= now;
  };

  // ============================================
  // Helper: Extract Setting Value
  // ============================================
  const extractSettingValue = (value) => {
    if (value && typeof value === "object" && "value" in value) {
      return value.value;
    }
    return value;
  };

  // ============================================
  // EFFECT 1: Check Auth, Fetch Settings
  // ============================================
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchSettings = async () => {
      try {
        const response = await settingsAPI.getAll();

        if (response.success && response.data) {
          let extractedSettings = {};

          if (Array.isArray(response.data)) {
            response.data.forEach((item) => {
              extractedSettings[item.key] = extractSettingValue(item.value);
            });
          } else if (typeof response.data === "object") {
            Object.keys(response.data).forEach((key) => {
              extractedSettings[key] = extractSettingValue(response.data[key]);
            });
          }

          let workingDays = extractedSettings.working_days;
          if (Array.isArray(workingDays)) {
            workingDays = workingDays.map((day) => parseInt(day));
          }

          setSettings({
            advance_booking_days:
              parseInt(extractedSettings.advance_booking_days) || 30,
            min_booking_notice_hours:
              parseInt(extractedSettings.min_booking_notice_hours) || 24,
            allow_same_day_booking:
              extractedSettings.allow_same_day_booking === true ||
              extractedSettings.allow_same_day_booking === "true" ||
              false,
            working_days: workingDays,
          });
        }
      } catch (error) {
        console.error("❌ Error fetching settings:", error);
        showErrorToast("Failed to load booking settings");
      }
    };

    fetchSettings();
  }, [authLoading, isAuthenticated, router]);

  // ============================================
  // EFFECT 2: Generate ALL Dates (including non-working days)
  // ============================================
  useEffect(() => {
    const dates = generateAllDates();
    setAllDates(dates);

    if (dates.length > 0) {
      setCurrentMonth(dates[0].month);
      setCurrentYear(dates[0].year);
      setStartDateIndex(0);
    }
  }, [
    settings.advance_booking_days,
    settings.allow_same_day_booking,
    JSON.stringify(settings.working_days),
  ]);

  // ============================================
  // EFFECT 3: Fetch Slots When Month Changes
  // ============================================
  useEffect(() => {
    if (allDates.length > 0 && currentMonth && currentYear) {
      const monthKey = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;

      if (!loadedMonths.has(monthKey)) {
        fetchMonthSlots();
      }
    }
  }, [currentMonth, currentYear, allDates.length, loadedMonths]);

  // ============================================
  // EFFECT 4: Auto-Select Valid Previous Slot
  // ============================================
  useEffect(() => {
    if (
      isInitialLoad.current &&
      !hasAutoSelectedSlot.current &&
      allDates.length > 0 &&
      Object.keys(slotsByDate).length > 0
    ) {
      const savedSlot = slotStorage.getSelectedSlot();

      // ✅ Check if saved slot exists and is valid
      if (
        savedSlot &&
        savedSlot.start_datetime &&
        savedSlot.slotId &&
        isSlotTimeValid(savedSlot.start_datetime)
      ) {
        // ✅ Auto-select the previous slot
        setSelectedDate(savedSlot.date);
        setSelectedTime(savedSlot.time);
        setSelectedSlotId(savedSlot.slotId);
        setSelectedStartDateTime(savedSlot.start_datetime);
        setSelectedEndDateTime(savedSlot.end_datetime);
        hasAutoSelectedSlot.current = true;
        showSuccessToast("Previous slot automatically selected");
        return; // ✅ Exit early - don't auto-select first available
      }

      // ✅ If no valid previous slot, select first available date
      const firstAvailable = allDates.find(
        (d) =>
          isWorkingDayHelper(d.dayOfWeek, settings.working_days) &&
          hasAvailableSlots(d.date)
      );

      if (firstAvailable && !selectedDate) {
        setSelectedDate(firstAvailable.date);
        isInitialLoad.current = false;
      }
    }
  }, [allDates, slotsByDate, selectedDate, settings.working_days]);

  // ============================================
  // Helper: Check if day is working day
  // ============================================
  const isWorkingDayHelper = (dayOfWeek, workingDaysArray) => {
    return workingDaysArray.includes(dayOfWeek);
  };

  // ============================================
  // Helper: Generate ALL Dates (calendar view)
  // ============================================
  const generateAllDates = () => {
    const dates = [];
    const startDate = new Date(today);

    if (!settings.allow_same_day_booking) {
      startDate.setDate(startDate.getDate() + 1);
    }

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + settings.advance_booking_days);

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const dateObj = new Date(currentDate);

      // ✅ Use local date formatting to avoid timezone issues
      const dateStr = formatLocalDate(dateObj);
      const numericMonth = dateObj.getMonth() + 1;
      const isThisDayWorking = settings.working_days.includes(dayOfWeek);

      dates.push({
        date: dateStr,
        day: days[dayOfWeek],
        dayNum: dateObj.getDate().toString(),
        month: numericMonth,
        monthName: new Intl.DateTimeFormat("en-US", {
          month: "short",
        }).format(dateObj),
        year: dateObj.getFullYear(),
        fullDate: new Date(dateObj),
        dayOfWeek: dayOfWeek,
        isWorkingDay: isThisDayWorking,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  // ============================================
  // Helper: Fetch Month Slots
  // ============================================
  const fetchMonthSlots = async () => {
    try {
      setLoading(true);

      const response = await timeSlotsAPI.getByMonth(currentMonth, currentYear);

      if (response.success) {
        let slotsArray = [];

        // ✅ Handle various API response formats
        if (Array.isArray(response.data)) {
          slotsArray = response.data;
        } else if (response.data && Array.isArray(response.data.slots)) {
          slotsArray = response.data.slots;
        } else if (response.data && typeof response.data === "object") {
          if (response.data.slotsByDate) {
            Object.values(response.data.slotsByDate).forEach((dateSlots) => {
              if (Array.isArray(dateSlots)) {
                slotsArray = slotsArray.concat(dateSlots);
              }
            });
          } else {
            Object.keys(response.data).forEach((key) => {
              if (Array.isArray(response.data[key])) {
                slotsArray = slotsArray.concat(response.data[key]);
              }
            });
          }
        }

        const monthKey = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
        setLoadedMonths((prev) => new Set([...prev, monthKey]));

        // ✅ Group slots by date - extract from start_datetime
        const grouped = {};
        slotsArray.forEach((slot) => {
          // ✅ Extract date from ISO datetime string
          const dateKey = extractDateFromISO(slot.start_datetime);

          if (!dateKey) {
            console.warn("⚠️ Slot missing required fields:", slot);
            return;
          }

          if (!grouped[dateKey]) {
            grouped[dateKey] = [];
          }

          // ✅ Format slot with extracted time strings
          grouped[dateKey].push({
            ...slot,
            date: dateKey,
            start_time: formatTimeFromISO(slot.start_datetime),
            end_time: formatTimeFromISO(slot.end_datetime),
          });
        });

        // Sort slots within each date by time
        Object.keys(grouped).forEach((date) => {
          grouped[date].sort(
            (a, b) =>
              parseInt(a.start_time.replace(":", "")) -
              parseInt(b.start_time.replace(":", ""))
          );
        });

        setSlotsByDate((prev) => {
          const updated = { ...prev };

          // Remove old slots for this month
          Object.keys(updated).forEach((dateKey) => {
            if (dateKey.startsWith(monthKey)) {
              delete updated[dateKey];
            }
          });

          return { ...updated, ...grouped };
        });
      } else {
        console.error("❌ API returned success: false");
        showErrorToast(response.message || "Failed to load slots");
      }
    } catch (error) {
      console.error("❌ Error fetching slots:", error);
      showErrorToast("Failed to load available time slots");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Helper: Get Time Slots Grouped by Period
  // ============================================
  const getTimeSlotsForDate = (dateString) => {
    const slots = slotsByDate[dateString] || [];

    const grouped = {
      Morning: [],
      Afternoon: [],
      Evening: [],
      Night: [],
    };

    slots.forEach((slot) => {
      const bookedCount = slot.booked_count || slot.bookedCount || 0;
      const capacity = slot.capacity || 1;
      const availableCount = capacity - bookedCount;

      // ✅ Only include if is_available is true AND has capacity
      if (!slot.is_available || availableCount <= 0) {
        return;
      }

      const [hour] = slot.start_time.split(":").map(Number);

      if (hour >= 6 && hour < 12) {
        grouped.Morning.push(slot);
      } else if (hour >= 12 && hour < 16) {
        grouped.Afternoon.push(slot);
      } else if (hour >= 16 && hour < 20) {
        grouped.Evening.push(slot);
      } else {
        grouped.Night.push(slot);
      }
    });

    Object.keys(grouped).forEach((key) => {
      if (grouped[key].length === 0) {
        delete grouped[key];
      }
    });

    return grouped;
  };

  // ============================================
  // Helper: Check if Date Has Available Slots
  // ============================================
  const hasAvailableSlots = (dateString) => {
    const slots = slotsByDate[dateString] || [];

    return slots.some((slot) => {
      const bookedCount = slot.booked_count || slot.bookedCount || 0;
      const capacity = slot.capacity || 1;
      const availableCount = capacity - bookedCount;

      return slot.is_available && availableCount > 0;
    });
  };

  // ============================================
  // Helper: Format Selected Date
  // ============================================
  const formatSelectedDate = () => {
    if (!selectedDate) return "";

    const date = parseLocalDate(selectedDate);
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
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
    ];

    return `${days[date.getDay()]}, ${date.getDate()} ${
      months[date.getMonth()]
    } ${date.getFullYear()}`;
  };

  // ============================================
  // Handler: Navigate to Previous Dates
  // ============================================
  const handlePrevDates = () => {
    if (startDateIndex > 0) {
      const newIndex = Math.max(0, startDateIndex - 1);
      setStartDateIndex(newIndex);

      const firstVisibleDate = allDates[newIndex];
      if (firstVisibleDate) {
        const dateMonth = firstVisibleDate.month;
        const dateYear = firstVisibleDate.year;
        const monthKey = `${dateYear}-${String(dateMonth).padStart(2, "0")}`;

        if (!loadedMonths.has(monthKey)) {
          setCurrentMonth(dateMonth);
          setCurrentYear(dateYear);
        }
      }
    }
  };

  // ============================================
  // Handler: Navigate to Next Dates
  // ============================================
  const handleNextDates = () => {
    if (startDateIndex + 5 < allDates.length) {
      const newIndex = startDateIndex + 1;
      setStartDateIndex(newIndex);

      const lastVisibleDate = allDates[newIndex + 4];
      if (lastVisibleDate) {
        const dateMonth = lastVisibleDate.month;
        const dateYear = lastVisibleDate.year;
        const monthKey = `${dateYear}-${String(dateMonth).padStart(2, "0")}`;

        if (!loadedMonths.has(monthKey)) {
          setCurrentMonth(dateMonth);
          setCurrentYear(dateYear);
        }
      }
    }
  };

  // ============================================
  // Handler: Select Date
  // ============================================
  const handleDateSelect = (date) => {
    if (!hasAvailableSlots(date)) {
      return;
    }
    setSelectedDate(date);
    setSelectedTime("");
    setSelectedSlotId("");
    setSelectedStartDateTime("");
    setSelectedEndDateTime("");
  };

  // ============================================
  // Handler: Select Time Slot
  // ============================================
  const handleTimeSelect = (slot) => {
    setSelectedTime(`${slot.start_time} - ${slot.end_time}`);
    setSelectedSlotId(slot._id);
    setSelectedStartDateTime(slot.start_datetime); // ✅ Store full datetime
    setSelectedEndDateTime(slot.end_datetime); // ✅ Store full datetime
  };

  // ============================================
  // Handler: Confirm Booking
  // ============================================
  const handleContinue = () => {
    if (
      selectedTime &&
      selectedSlotId &&
      selectedDate &&
      selectedStartDateTime &&
      selectedEndDateTime
    ) {
      const bookingData = {
        date: selectedDate,
        time: selectedTime,
        slotId: selectedSlotId,
        start_datetime: selectedStartDateTime, // ✅ Full datetime
        end_datetime: selectedEndDateTime, // ✅ Full datetime
        bookedAt: new Date().toISOString(),
      };

      slotStorage.setSelectedSlot(bookingData);
      bookingStorage.updateBookingData({ selectedSlot: bookingData });

      showSuccessToast("Slot selected successfully");
      router.push("/patient-details");
    }
  };

  // ============================================
  // Computed Values
  // ============================================
  const visibleDates = allDates.slice(startDateIndex, startDateIndex + 5);
  const timeSlots = getTimeSlotsForDate(selectedDate);

  const getDisplayMonth = () => {
    if (visibleDates.length === 0) return "";
    const firstDate = visibleDates[0];
    const lastDate = visibleDates[visibleDates.length - 1];

    if (
      firstDate.month === lastDate.month &&
      firstDate.year === lastDate.year
    ) {
      return `${firstDate.monthName} ${firstDate.year}`;
    }
    return `${firstDate.monthName} - ${lastDate.monthName} ${lastDate.year}`;
  };

  const workingDayCount = allDates.filter((d) => d.isWorkingDay).length;

  // ============================================
  // Render: Loading State
  // ============================================
  if (authLoading || (loading && Object.keys(slotsByDate).length === 0)) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Select Session Time" />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading available slots...</p>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  // ============================================
  // Render: No Dates Available
  // ============================================
  if (allDates.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <PageHeader title="Select Session Time" />
        <main className="max-w-md mx-auto p-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="text-muted-foreground">
                No available dates for booking in the next{" "}
                {settings.advance_booking_days} days.
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                <strong>Booking Window:</strong> {settings.advance_booking_days}{" "}
                days
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                <strong>Working Days:</strong>{" "}
                {settings.working_days
                  .map((d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d])
                  .join(", ")}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Please check back later or contact support.
              </p>
            </CardContent>
          </Card>
        </main>
        <MobileNav />
      </div>
    );
  }

  // ============================================
  // Render: Main Page
  // ============================================
  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Select Session Time" />

      <main className="max-w-md mx-auto p-4">
        {/* Info Alert */}
        {settings.allow_same_day_booking === false && (
          <Alert className="mb-4 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Bookings must be made at least{" "}
              <strong>{settings.min_booking_notice_hours}</strong> hours in
              advance
            </AlertDescription>
          </Alert>
        )}

        {/* Month Display */}
        <div className="flex items-center justify-center mb-4">
          <div className="text-center">
            <h2 className="font-semibold text-lg text-primary">
              {getDisplayMonth()}
            </h2>
            <p className="text-xs text-muted-foreground">
              {workingDayCount} working days •{" "}
              {settings.working_days
                .map((d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d])
                .join(", ")}
            </p>
          </div>
        </div>

        {/* Date Selection */}
        <Card className="border-none shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-primary">
                {selectedDate ? formatSelectedDate() : "Select a date"}
              </h3>
              <Calendar className="w-5 h-5 text-primary" />
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full flex-shrink-0 h-9 w-9"
                onClick={handlePrevDates}
                disabled={startDateIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex-1 flex gap-1 overflow-hidden">
                {visibleDates.map((date) => {
                  const isThisDayWorking = date.isWorkingDay;
                  const hasSlots = hasAvailableSlots(date.date);
                  const disabled = !isThisDayWorking || !hasSlots;
                  const isToday = date.date === formatLocalDate(today);

                  return (
                    <button
                      key={date.date}
                      onClick={() => {
                        if (isThisDayWorking && hasSlots) {
                          handleDateSelect(date.date);
                        }
                      }}
                      disabled={disabled}
                      title={`${date.day}, ${date.monthName} ${date.dayNum}${
                        !isThisDayWorking
                          ? " (Off)"
                          : !hasSlots
                          ? " (No available slots)"
                          : ""
                      }`}
                      className={`flex-1 flex flex-col items-center justify-center h-20 rounded-lg border-2 transition-all relative text-center ${
                        !isThisDayWorking
                          ? "border-border bg-gray-100 opacity-50 cursor-not-allowed"
                          : !hasSlots
                          ? "border-border bg-muted/30 opacity-60 cursor-not-allowed"
                          : selectedDate === date.date
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {isToday && isThisDayWorking && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full whitespace-nowrap">
                          Today
                        </span>
                      )}
                      <span className="text-[9px] text-muted-foreground leading-tight font-semibold">
                        {date.monthName}
                      </span>
                      <span className="text-[9px] text-muted-foreground leading-tight">
                        {date.day}
                      </span>
                      <span className="text-sm font-bold leading-tight">
                        {date.dayNum}
                      </span>
                      {!isThisDayWorking && (
                        <span className="text-[8px] text-red-500 leading-tight font-semibold">
                          Off
                        </span>
                      )}
                      {isThisDayWorking && !hasSlots && (
                        <span className="text-[8px] text-yellow-600 leading-tight font-semibold">
                          Full
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full flex-shrink-0 h-9 w-9"
                onClick={handleNextDates}
                disabled={startDateIndex + 5 >= allDates.length}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Navigation Info */}
            <div className="flex items-center justify-between mt-3 px-2">
              <span className="text-xs text-muted-foreground">
                {startDateIndex + 1}-
                {Math.min(startDateIndex + 5, allDates.length)} of{" "}
                {allDates.length}
              </span>
              <div className="flex justify-center gap-1">
                {Array.from({
                  length: Math.ceil(allDates.length / 5),
                }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 w-4 rounded-full transition-all ${
                      i === Math.floor(startDateIndex / 5)
                        ? "bg-primary"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Slots */}
        {!selectedDate ? (
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Please select a date to view available time slots
              </p>
            </CardContent>
          </Card>
        ) : !hasAvailableSlots(selectedDate) ? (
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                No time slots available for this date.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Please select another date.
              </p>
            </CardContent>
          </Card>
        ) : Object.keys(timeSlots).length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 text-center">
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading time slots...</p>
                </>
              ) : (
                <>
                  <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    No time slots available for this date.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div
            className="space-y-4 overflow-y-auto scroll-smooth pr-2 mb-15"
            style={{ maxHeight: "calc(100vh - 0px)" }}
          >
            {Object.entries(timeSlots).map(([period, slots]) => (
              <div key={period}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-foreground">
                    {period}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {slots.length} slot{slots.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot) => {
                    const bookedCount = slot.booked_count || slot.bookedCount || 0;
                    const capacity = slot.capacity || 1;
                    const availableCount = capacity - bookedCount;

                    return (
                      <button
                        key={slot._id}
                        onClick={() => handleTimeSelect(slot)}
                        className={`py-3 px-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          selectedSlotId === slot._id
                            ? "border-primary bg-primary text-white"
                            : "border-border text-foreground hover:border-primary/50"
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-xs sm:text-sm">
                            {slot.start_time}
                          </span>
                          {capacity > 1 && availableCount < capacity && (
                            <span className="text-[10px] opacity-70 mt-1">
                              {availableCount} left
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="fixed bottom-15 left-0 right-0 bg-white dark:bg-gray-900 border-t border-border p-4 z-40">
          <div className="max-w-md mx-auto flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleContinue}
              disabled={!selectedTime || !selectedSlotId}
            >
              Confirm Slot
            </Button>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
