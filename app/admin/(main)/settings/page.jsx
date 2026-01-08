"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Save,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Settings,
  Globe,
  Bell,
  CreditCard,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/lib/toasts";
import { settingsAPI, timeSlotsAPI } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("general");
  const [activeSubSection, setActiveSubSection] = useState("site-info");

  // ============================================
  // Helper: Format Local Date String (YYYY-MM-DD)
  // ============================================
  const formatLocalDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // ============================================
  // Settings State
  // ============================================
  const [timeslotSettings, setTimeslotSettings] = useState({
    slot_duration: 20,
    working_start_time: "09:00",
    working_end_time: "18:00",
    working_days: [1, 2, 3, 4, 5],
    slot_capacity: 1,
    advance_booking_days: 30,
    min_booking_notice_hours: 24,
    allow_same_day_booking: true,
    buffer_time_between_slots: 0,
    max_bookings_per_user: 5,
  });

  const [generalSettings, setGeneralSettings] = useState({
    site_name: "",
    site_email: "",
    site_phone: "",
    site_address: "",
    site_description: "",
    maintenance_mode: false,
    timezone: "Asia/Kolkata",
  });

  const [bookingSettings, setBookingSettings] = useState({
    allow_cancellation: true,
    cancellation_hours: 12,
    require_payment: false,
    auto_confirm_bookings: true,
    send_confirmation_email: true,
    allow_reschedule: true,
    reschedule_hours: 24,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    reminder_hours_before: 24,
    send_booking_confirmation: true,
    send_cancellation_notification: true,
    send_reschedule_notification: true,
    admin_notification_email: "",
  });

  const [paymentSettings, setPaymentSettings] = useState({
    currency: "INR",
    payment_gateway: "razorpay",
    razorpay_key: "",
    stripe_key: "",
    paypal_client_id: "",
    payment_required: false,
    partial_payment_allowed: false,
    partial_payment_percentage: 20,
  });

  // ============================================
  // Time Slots & Disabled Dates State
  // ============================================
  const [generateLoading, setGenerateLoading] = useState(false);
  const [selectedMonthYear, setSelectedMonthYear] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const [generatedSlots, setGeneratedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [disabledDates, setDisabledDates] = useState([]);
  const [newDisabledDate, setNewDisabledDate] = useState({
    date: "",
    reason: "",
  });
  const [disablingDate, setDisablingDate] = useState(false);
  const [loadingDisabledDates, setLoadingDisabledDates] = useState(false);

  // ============================================
  // Constants
  // ============================================
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 1; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  };

  const years = generateYears();

  const weekDays = [
    { value: 0, label: "Sun" },
    { value: 1, label: "Mon" },
    { value: 2, label: "Tue" },
    { value: 3, label: "Wed" },
    { value: 4, label: "Thu" },
    { value: 5, label: "Fri" },
    { value: 6, label: "Sat" },
  ];

  const slotDurations = [5, 10, 15, 20, 30, 45, 60];
  const bufferTimes = [0, 5, 10, 15];

  // ============================================
  // Navigation Structure
  // ============================================
  const navigationSections = [
    {
      id: "general",
      label: "General",
      icon: Settings,
      subsections: [
        { id: "site-info", label: "Site Information" },
        { id: "localization", label: "Localization" },
        { id: "system", label: "System" },
      ],
    },
    {
      id: "finance",
      label: "Finance",
      icon: CreditCard,
      subsections: [
        { id: "payment-gateways", label: "Payment Gateways" },
        { id: "invoices", label: "Invoices" },
        { id: "subscriptions", label: "Subscriptions" },
      ],
    },
    {
      id: "timeslots",
      label: "Time Slots",
      icon: Clock,
      subsections: [
        { id: "slot-config", label: "Configuration" },
        { id: "generate-slots", label: "Generate & View Slots" },
        { id: "disabled-dates", label: "Disabled Dates" },
      ],
    },
    {
      id: "booking",
      label: "Booking",
      icon: Calendar,
      subsections: [
        { id: "booking-rules", label: "Booking Rules" },
        { id: "cancellation", label: "Cancellation Policy" },
      ],
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      subsections: [
        { id: "email", label: "Email Settings" },
        { id: "sms", label: "SMS Settings" },
      ],
    },
  ];

  // ============================================
  // Effects
  // ============================================
  useEffect(() => {
    fetchAllSettings();
  }, []);

  // ============================================
  // API Calls
  // ============================================
  const fetchAllSettings = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchSettings(), fetchDisabledDates()]);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.getAll();

      if (response.success) {
        const data = response.data;

        Object.keys(data).forEach((key) => {
          const setting = data[key];

          switch (setting.category) {
            case "timeslots":
              setTimeslotSettings((prev) => ({
                ...prev,
                [key]: setting.value,
              }));
              break;
            case "general":
              setGeneralSettings((prev) => ({
                ...prev,
                [key]: setting.value,
              }));
              break;
            case "booking":
              setBookingSettings((prev) => ({
                ...prev,
                [key]: setting.value,
              }));
              break;
            case "notifications":
              setNotificationSettings((prev) => ({
                ...prev,
                [key]: setting.value,
              }));
              break;
            case "payment":
              setPaymentSettings((prev) => ({
                ...prev,
                [key]: setting.value,
              }));
              break;
          }
        });
      }
    } catch (error) {
      showErrorToast("Failed to load settings");
      console.error(error);
    }
  };

  const fetchDisabledDates = async () => {
    try {
      setLoadingDisabledDates(true);
      const response = await timeSlotsAPI.getDisabledDates();

      if (response.success && Array.isArray(response.data)) {
        setDisabledDates(response.data);
      } else {
        setDisabledDates([]);
      }
    } catch (error) {
      console.error("Error fetching disabled dates:", error);
      setDisabledDates([]);
    } finally {
      setLoadingDisabledDates(false);
    }
  };

  const fetchGeneratedSlots = async (month, year) => {
    try {
      setLoadingSlots(true);
      const response = await timeSlotsAPI.getByMonth(month, year);

      if (response.success && Array.isArray(response.data)) {
        setGeneratedSlots(response.data);
      } else if (response.success && response.data && response.data.slotsByDate) {
        // Convert slotsByDate object to array
        const slotsArray = [];
        Object.values(response.data.slotsByDate).forEach((dateSlots) => {
          if (Array.isArray(dateSlots)) {
            slotsArray.push(...dateSlots);
          }
        });
        setGeneratedSlots(slotsArray);
      } else {
        setGeneratedSlots([]);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      showErrorToast("Failed to load generated slots");
      setGeneratedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // ============================================
  // Handlers
  // ============================================
  const handleSaveSettings = async (category, categorySettings) => {
    try {
      setSaving(true);

      const settingsArray = Object.keys(categorySettings).map((key) => ({
        key,
        value: categorySettings[key],
        type: getSettingType(categorySettings[key]),
        category,
        isPublic: isPublicSetting(category, key),
      }));

      const response = await settingsAPI.bulkUpdate(settingsArray);

      if (response.success) {
        showSuccessToast("Settings saved successfully");
      }
    } catch (error) {
      showErrorToast(
        error.response?.data?.message || "Failed to save settings"
      );
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const getSettingType = (value) => {
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "number") return "number";
    if (Array.isArray(value)) return "array";
    if (value instanceof Date) return "date";
    return "text";
  };

  const isPublicSetting = (category, key) => {
    const publicSettings = [
      "slot_duration",
      "working_start_time",
      "working_end_time",
      "working_days",
      "advance_booking_days",
      "min_booking_notice_hours",
      "site_name",
      "site_email",
      "site_phone",
      "currency",
      "allow_cancellation",
      "cancellation_hours",
    ];
    return publicSettings.includes(key);
  };

  const handleGenerateSlots = async () => {
    if (!selectedMonthYear.month || !selectedMonthYear.year) {
      showErrorToast("Please select month and year");
      return;
    }

    try {
      setGenerateLoading(true);

      // Check if there are existing bookings
      const checkResponse = await timeSlotsAPI.checkMonthBookings(
        selectedMonthYear.month,
        selectedMonthYear.year
      );

      if (checkResponse.success && checkResponse.hasBookings) {
        showErrorToast(
          `Cannot regenerate slots. Found ${checkResponse.totalBookings} booking(s) in this month.`
        );
        setGenerateLoading(false);
        return;
      }

      // Calculate start and end dates for the month
      const startDate = `${selectedMonthYear.year}-${String(selectedMonthYear.month).padStart(2, "0")}-01`;
      const daysInMonth = new Date(selectedMonthYear.year, selectedMonthYear.month, 0).getDate();
      const endDate = `${selectedMonthYear.year}-${String(selectedMonthYear.month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

      const response = await timeSlotsAPI.generateTimeSlots(startDate, endDate);

      if (response.success) {
        showSuccessToast(
          response.message || "Slots generated successfully"
        );
        // Auto-fetch the generated slots
        fetchGeneratedSlots(
          selectedMonthYear.month,
          selectedMonthYear.year
        );
      }
    } catch (error) {
      showErrorToast(
        error.response?.data?.message || "Failed to generate slots"
      );
      console.error(error);
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleDeleteSlotsForMonth = async () => {
    if (!selectedMonthYear.month || !selectedMonthYear.year) {
      showErrorToast("Please select month and year");
      return;
    }

    if (!Array.isArray(generatedSlots) || generatedSlots.length === 0) {
      showErrorToast("No slots to delete for this month");
      return;
    }

    // Check for bookings
    const checkResponse = await timeSlotsAPI.checkMonthBookings(
      selectedMonthYear.month,
      selectedMonthYear.year
    );

    if (checkResponse.success && checkResponse.hasBookings) {
      showErrorToast(
        `Cannot delete slots. Found ${checkResponse.totalBookings} booking(s) in this month.`
      );
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete all slots for ${
        months.find((m) => m.value === selectedMonthYear.month)?.label
      } ${selectedMonthYear.year}?`
    );

    if (!confirmDelete) return;

    try {
      setGenerateLoading(true);

      const startDate = `${selectedMonthYear.year}-${String(
        selectedMonthYear.month
      ).padStart(2, "0")}-01`;
      
      const daysInMonth = new Date(
        selectedMonthYear.year,
        selectedMonthYear.month,
        0
      ).getDate();
      
      const endDate = `${selectedMonthYear.year}-${String(
        selectedMonthYear.month
      ).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

      const response = await timeSlotsAPI.deleteSlots(startDate, endDate);

      if (response.success) {
        showSuccessToast("Slots deleted successfully");
        setGeneratedSlots([]);
      }
    } catch (error) {
      showErrorToast(
        error.response?.data?.message || "Failed to delete slots"
      );
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleDisableDate = async () => {
    if (!newDisabledDate.date) {
      showErrorToast("Please select a date");
      return;
    }

    try {
      setDisablingDate(true);

      // Check if date has any bookings
      const checkResponse = await timeSlotsAPI.checkDateBookings(
        newDisabledDate.date
      );

      if (checkResponse.success && checkResponse.hasBookings) {
        showErrorToast(
          `Cannot disable date. Found ${checkResponse.totalBookings} booking(s) on this date.`
        );
        setDisablingDate(false);
        return;
      }

      // Call toggleDate API
      const response = await timeSlotsAPI.toggleDate(
        newDisabledDate.date,
        newDisabledDate.reason
      );

      if (response.success && response.data) {
        showSuccessToast(response.message || "Date disabled successfully");
        setNewDisabledDate({ date: "", reason: "" });

        // Update frontend immediately with returned data
        if (response.data.is_disabled) {
          setDisabledDates((prev) => [
            ...prev,
            {
              _id: response.data._id,
              date: response.data.date,
              reason: response.data.reason,
              is_disabled: response.data.is_disabled,
              created_at: response.data.created_at,
              updated_at: response.data.updated_at,
            },
          ]);
        }

        // Also update generated slots view if it's the current month
        const disabledDateObj = new Date(newDisabledDate.date);
        if (
          disabledDateObj.getMonth() + 1 === selectedMonthYear.month &&
          disabledDateObj.getFullYear() === selectedMonthYear.year
        ) {
          fetchGeneratedSlots(
            selectedMonthYear.month,
            selectedMonthYear.year
          );
        }
      } else {
        showErrorToast("Failed to disable date");
      }
    } catch (error) {
      console.error("Error disabling date:", error);
      showErrorToast(
        error.response?.data?.message || "Failed to disable date"
      );
    } finally {
      setDisablingDate(false);
    }
  };

  const handleEnableDate = async (dateId, date) => {
    if (!date) {
      showErrorToast("Please select a date");
      return;
    }
    
    try {
      const response = await timeSlotsAPI.toggleDate(date, "");

      if (response.success && response.data) {
        showSuccessToast(
          response.message || "Date enabled successfully"
        );

        // Update frontend immediately
        if (response.data.is_disabled === false) {
          // Date was enabled, remove from list
          setDisabledDates((prev) =>
            prev.filter((d) => d._id !== dateId)
          );
        }

        // Refresh slots view if it's the current month
        const enabledDateObj = new Date(date);
        if (
          enabledDateObj.getMonth() + 1 === selectedMonthYear.month &&
          enabledDateObj.getFullYear() === selectedMonthYear.year
        ) {
          fetchGeneratedSlots(
            selectedMonthYear.month,
            selectedMonthYear.year
          );
        }
      }
    } catch (error) {
      console.error("Error enabling date:", error);
      showErrorToast(
        error.response?.data?.message || "Failed to enable date"
      );
    }
  };

  const toggleWorkingDay = (day) => {
    setTimeslotSettings((prev) => {
      const days = [...prev.working_days];
      const index = days.indexOf(day);

      if (index > -1) {
        days.splice(index, 1);
      } else {
        days.push(day);
        days.sort((a, b) => a - b);
      }

      return { ...prev, working_days: days };
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const groupSlotsByDate = (slots) => {
    const grouped = {};

    if (Array.isArray(slots)) {
      slots.forEach((slot) => {
        // Use the date field from the API response
        const dateKey = slot.date;
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(slot);
      });
    }

    return grouped;
  };

  // ============================================
  // Render Content
  // ============================================
  const renderContent = () => {
    switch (activeSubSection) {
      // ==================== GENERATE & VIEW SLOTS ====================
      case "generate-slots":
        return (
          <div className="space-y-6">
            {/* ============== GENERATE SLOTS FORM ============== */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Generate Time Slots
                </CardTitle>
                <CardDescription>
                  Generate time slots for a specific month based on your
                  configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This will create new slots for the entire selected month
                    based on your working days and time settings.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Month</Label>
                    <Select
                      value={String(selectedMonthYear.month)}
                      onValueChange={(value) =>
                        setSelectedMonthYear({
                          ...selectedMonthYear,
                          month: Number(value),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem
                            key={month.value}
                            value={String(month.value)}
                          >
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Select
                      value={String(selectedMonthYear.year)}
                      onValueChange={(value) =>
                        setSelectedMonthYear({
                          ...selectedMonthYear,
                          year: Number(value),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={String(year)}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    Selected:{" "}
                    {
                      months.find((m) => m.value === selectedMonthYear.month)
                        ?.label
                    }{" "}
                    {selectedMonthYear.year}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerateSlots}
                    disabled={generateLoading}
                    className="flex-1"
                  >
                    {generateLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Slots...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Generate Slots
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleDeleteSlotsForMonth}
                    disabled={
                      generateLoading || generatedSlots.length === 0
                    }
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Slots
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ============== GENERATED SLOTS VIEW ============== */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Generated Slots for{" "}
                  {
                    months.find(
                      (m) => m.value === selectedMonthYear.month
                    )?.label
                  }{" "}
                  {selectedMonthYear.year}
                </CardTitle>
                <CardDescription>
                  View all generated time slots below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() =>
                    fetchGeneratedSlots(
                      selectedMonthYear.month,
                      selectedMonthYear.year
                    )
                  }
                  disabled={loadingSlots}
                  className="w-full"
                  variant="outline"
                >
                  {loadingSlots ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading Slots...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Slots View
                    </>
                  )}
                </Button>

                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : generatedSlots.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No slots generated for this month yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[800px] overflow-y-auto">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg sticky top-0 z-10">
                      <div>
                        <p className="text-sm font-medium">
                          {
                            months.find(
                              (m) => m.value === selectedMonthYear.month
                            )?.label
                          }{" "}
                          {selectedMonthYear.year}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total: {generatedSlots.length} slots
                        </p>
                      </div>
                      <Badge variant="outline">
                        {
                          Object.keys(groupSlotsByDate(generatedSlots))
                            .length
                        }{" "}
                        days
                      </Badge>
                    </div>

                    {Object.entries(groupSlotsByDate(generatedSlots))
                      .sort(([dateA], [dateB]) =>
                        dateA.localeCompare(dateB)
                      )
                      .map(([date, slots]) => (
                        <div
                          key={date}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">
                              {formatDate(date)}
                            </h4>
                            <div className="flex gap-2">
                              <Badge variant="secondary">
                                {slots.length} slots
                              </Badge>
                              <Badge
                                variant={
                                  slots.some((s) => s.booked_count > 0)
                                    ? "destructive"
                                    : "default"
                                }
                              >
                                {slots.some((s) => s.booked_count > 0)
                                  ? `${slots.reduce(
                                    (sum, s) =>
                                      sum + s.booked_count,
                                    0
                                  )} booked`
                                  : "No bookings"}
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {slots.map((slot) => {
                              const hasBookings = slot.booked_count > 0;
                              return (
                                <div
                                  key={slot._id}
                                  className={cn(
                                    "p-2 rounded border text-center text-sm transition-colors",
                                    hasBookings
                                      ? "bg-red-50 border-red-200"
                                      : slot.is_available
                                        ? "bg-green-50 border-green-200"
                                        : "bg-gray-50 border-gray-200"
                                  )}
                                >
                                  <p className="font-medium text-sm">
                                    {slot.start_time} -{" "}
                                    {slot.end_time}
                                  </p>
                                  <div className="flex items-center justify-center gap-1 mt-1 flex-wrap">
                                    <Badge
                                      variant={
                                        hasBookings
                                          ? "destructive"
                                          : slot.is_available
                                            ? "default"
                                            : "secondary"
                                      }
                                      className="text-xs"
                                    >
                                      {hasBookings
                                        ? "Booked"
                                        : slot.is_available
                                          ? "Available"
                                          : "Unavailable"}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {slot.booked_count}/
                                      {slot.capacity}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      // ==================== SLOT CONFIG ====================
      case "slot-config":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Time Slot Configuration
              </CardTitle>
              <CardDescription>
                Configure working hours, slot duration, and availability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Slot Duration (minutes)</Label>
                <Select
                  value={String(timeslotSettings.slot_duration)}
                  onValueChange={(value) =>
                    setTimeslotSettings({
                      ...timeslotSettings,
                      slot_duration: Number(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {slotDurations.map((duration) => (
                      <SelectItem key={duration} value={String(duration)}>
                        {duration} minutes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Buffer Time Between Slots (minutes)</Label>
                <Select
                  value={String(
                    timeslotSettings.buffer_time_between_slots
                  )}
                  onValueChange={(value) =>
                    setTimeslotSettings({
                      ...timeslotSettings,
                      buffer_time_between_slots: Number(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bufferTimes.map((time) => (
                      <SelectItem key={time} value={String(time)}>
                        {time} minutes {time === 0 && "(No buffer)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Working Start Time</Label>
                  <Input
                    type="time"
                    value={timeslotSettings.working_start_time}
                    onChange={(e) =>
                      setTimeslotSettings({
                        ...timeslotSettings,
                        working_start_time: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Working End Time</Label>
                  <Input
                    type="time"
                    value={timeslotSettings.working_end_time}
                    onChange={(e) =>
                      setTimeslotSettings({
                        ...timeslotSettings,
                        working_end_time: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Working Days</Label>
                <div className="flex gap-2 flex-wrap">
                  {weekDays.map((day) => (
                    <Button
                      key={day.value}
                      variant={
                        timeslotSettings.working_days.includes(day.value)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => toggleWorkingDay(day.value)}
                      className="min-w-[60px]"
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Slot Capacity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={timeslotSettings.slot_capacity}
                    onChange={(e) =>
                      setTimeslotSettings({
                        ...timeslotSettings,
                        slot_capacity: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Advance Booking (days)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={timeslotSettings.advance_booking_days}
                    onChange={(e) =>
                      setTimeslotSettings({
                        ...timeslotSettings,
                        advance_booking_days: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Min Notice (hours)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="168"
                    value={timeslotSettings.min_booking_notice_hours}
                    onChange={(e) =>
                      setTimeslotSettings({
                        ...timeslotSettings,
                        min_booking_notice_hours: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Same Day Booking</Label>
                    <p className="text-sm text-muted-foreground">
                      Let users book appointments for today
                    </p>
                  </div>
                  <Switch
                    checked={timeslotSettings.allow_same_day_booking}
                    onCheckedChange={(checked) =>
                      setTimeslotSettings({
                        ...timeslotSettings,
                        allow_same_day_booking: checked,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Bookings Per User</Label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={timeslotSettings.max_bookings_per_user}
                    onChange={(e) =>
                      setTimeslotSettings({
                        ...timeslotSettings,
                        max_bookings_per_user: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <Button
                onClick={() =>
                  handleSaveSettings("timeslots", timeslotSettings)
                }
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Time Slot Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );

      // ==================== DISABLED DATES ====================
      case "disabled-dates":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Disabled Dates (Holidays)
              </CardTitle>
              <CardDescription>
                Manage dates when booking is not available
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Disabled dates will prevent slot generation and booking on
                  those dates.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select Date</Label>
                    <Input
                      type="date"
                      value={newDisabledDate.date}
                      onChange={(e) =>
                        setNewDisabledDate({
                          ...newDisabledDate,
                          date: e.target.value,
                        })
                      }
                      min={
                        new Date().toISOString().split("T")[0]
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reason (Optional)</Label>
                    <Input
                      placeholder="e.g., Public Holiday"
                      value={newDisabledDate.reason}
                      onChange={(e) =>
                        setNewDisabledDate({
                          ...newDisabledDate,
                          reason: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={handleDisableDate}
                  disabled={disablingDate}
                  variant="destructive"
                  className="w-full"
                >
                  {disablingDate ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Disabling...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Disable Date
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Currently Disabled Dates</Label>
                {loadingDisabledDates ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : disabledDates.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No disabled dates
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {disabledDates.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <p className="font-medium">
                            {formatDate(item.date)}
                          </p>
                          {item.reason && (
                            <p className="text-sm text-muted-foreground">
                              {item.reason}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleEnableDate(item._id, item.date)
                          }
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Enable
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      // ==================== SITE INFO ====================
      case "site-info":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
              <CardDescription>
                Basic application settings and information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Site Name</Label>
                <Input
                  placeholder="Blood Test Booking"
                  value={generalSettings.site_name}
                  onChange={(e) =>
                    setGeneralSettings({
                      ...generalSettings,
                      site_name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Site Description</Label>
                <Textarea
                  placeholder="Brief description of your service"
                  value={generalSettings.site_description}
                  onChange={(e) =>
                    setGeneralSettings({
                      ...generalSettings,
                      site_description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    placeholder="info@example.com"
                    value={generalSettings.site_email}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        site_email: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input
                    type="tel"
                    placeholder="+91 1234567890"
                    value={generalSettings.site_phone}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        site_phone: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea
                  placeholder="Full business address"
                  value={generalSettings.site_address}
                  onChange={(e) =>
                    setGeneralSettings({
                      ...generalSettings,
                      site_address: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>

              <Button
                onClick={() =>
                  handleSaveSettings("general", generalSettings)
                }
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );

      // ==================== DEFAULT ====================
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Select a setting</CardTitle>
              <CardDescription>
                Choose a setting from the sidebar to configure
              </CardDescription>
            </CardHeader>
          </Card>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Settings</h2>
          <p className="text-sm text-muted-foreground">
            Manage your application
          </p>
        </div>

        <nav className="p-2">
          {navigationSections.map((section) => {
            const Icon = section.icon;
            const isActiveSection = activeSection === section.id;

            return (
              <div key={section.id} className="mb-2">
                <button
                  onClick={() => {
                    setActiveSection(section.id);
                    setActiveSubSection(section.subsections[0].id);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActiveSection
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {section.label}
                </button>

                {isActiveSection && (
                  <div className="ml-6 mt-1 space-y-1 border-l pl-2">
                    {section.subsections.map((subsection) => (
                      <button
                        key={subsection.id}
                        onClick={() =>
                          setActiveSubSection(subsection.id)
                        }
                        className={cn(
                          "w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors",
                          activeSubSection === subsection.id
                            ? "bg-gray-100 text-gray-900 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        {subsection.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-6 px-8 max-w-4xl">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
