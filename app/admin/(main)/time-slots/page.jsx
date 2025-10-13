"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Clock,
  Calendar as CalendarIcon,
  Settings,
  Plus,
  Trash2,
  Edit,
  X,
  Save,
  RefreshCw,
} from "lucide-react";

// Constants
const DAYS_OF_WEEK = [
  { id: 0, name: "Sunday", short: "Sun" },
  { id: 1, name: "Monday", short: "Mon" },
  { id: 2, name: "Tuesday", short: "Tue" },
  { id: 3, name: "Wednesday", short: "Wed" },
  { id: 4, name: "Thursday", short: "Thu" },
  { id: 5, name: "Friday", short: "Fri" },
  { id: 6, name: "Saturday", short: "Sat" },
];

const TIME_PERIODS = ["Morning", "Afternoon", "Evening", "Night"];

const SLOT_DURATIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];

export default function TimeSlots() {
  // Global Settings State
  const [globalSettings, setGlobalSettings] = useState({
    defaultSlotDuration: 30,
    maxOrdersPerSlot: 5,
    advanceBookingDays: 30,
    bufferBetweenSlots: 0,
  });

  // Weekly Schedule State
  const [weeklySchedule, setWeeklySchedule] = useState(
    DAYS_OF_WEEK.map((day) => ({
      dayId: day.id,
      dayName: day.name,
      isActive: day.id !== 0, // Sunday off by default
      timeRanges: [
        {
          id: Date.now() + day.id,
          startTime: "09:00",
          endTime: "17:00",
          slotDuration: 30,
          maxOrdersPerSlot: 5,
        },
      ],
    }))
  );

  // Custom Days Off State
  const [customDaysOff, setCustomDaysOff] = useState([]);
  const [selectedDatesForOff, setSelectedDatesForOff] = useState([]);
  const [reasonForOff, setReasonForOff] = useState("");

  // Disabled Time Slots State
  const [disabledSlots, setDisabledSlots] = useState([]);
  const [selectedDateForSlot, setSelectedDateForSlot] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [disableReason, setDisableReason] = useState("");

  // Dialog States
  const [isAddDayOffOpen, setIsAddDayOffOpen] = useState(false);
  const [isDisableSlotOpen, setIsDisableSlotOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    type: null,
    id: null,
  });

  // Loading State
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Fetch existing settings from API
   */
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/time-slots/settings');
      // const data = await response.json();
      
      // Simulated data fetch
      console.log("Fetching settings...");
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    }
  };

  /**
   * Generate time slots for a specific date based on weekly schedule
   */
  const generateTimeSlotsForDate = (date) => {
    const dayOfWeek = new Date(date).getDay();
    const daySchedule = weeklySchedule.find((d) => d.dayId === dayOfWeek);

    if (!daySchedule || !daySchedule.isActive) {
      return [];
    }

    const slots = [];
    daySchedule.timeRanges.forEach((range) => {
      const [startHour, startMin] = range.startTime.split(":").map(Number);
      const [endHour, endMin] = range.endTime.split(":").map(Number);

      let currentTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;
      const duration = range.slotDuration;

      while (currentTime + duration <= endTime) {
        const hours = Math.floor(currentTime / 60);
        const minutes = currentTime % 60;
        const ampm = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        const timeString = `${displayHours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")} ${ampm}`;

        slots.push({
          time: timeString,
          maxOrders: range.maxOrdersPerSlot,
          duration: duration,
        });

        currentTime += duration + globalSettings.bufferBetweenSlots;
      }
    });

    return slots;
  };

  /**
   * Handle Global Settings Update
   */
  const handleGlobalSettingsUpdate = async () => {
    setIsSaving(true);
    try {
      // TODO: API call to save global settings
      // await fetch('/api/admin/time-slots/global-settings', {
      //   method: 'PUT',
      //   body: JSON.stringify(globalSettings)
      // });

      toast.success("Global settings updated successfully");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle Weekly Schedule Update
   */
  const handleWeeklyScheduleUpdate = async () => {
    setIsSaving(true);
    try {
      // TODO: API call to save weekly schedule
      // await fetch('/api/admin/time-slots/weekly-schedule', {
      //   method: 'PUT',
      //   body: JSON.stringify(weeklySchedule)
      // });

      toast.success("Weekly schedule updated successfully");
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast.error("Failed to update schedule");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Toggle Day Active/Inactive
   */
  const toggleDayActive = (dayId) => {
    setWeeklySchedule((prev) =>
      prev.map((day) =>
        day.dayId === dayId ? { ...day, isActive: !day.isActive } : day
      )
    );
  };

  /**
   * Add Time Range to a Day
   */
  const addTimeRange = (dayId) => {
    setWeeklySchedule((prev) =>
      prev.map((day) => {
        if (day.dayId === dayId) {
          return {
            ...day,
            timeRanges: [
              ...day.timeRanges,
              {
                id: Date.now(),
                startTime: "09:00",
                endTime: "17:00",
                slotDuration: globalSettings.defaultSlotDuration,
                maxOrdersPerSlot: globalSettings.maxOrdersPerSlot,
              },
            ],
          };
        }
        return day;
      })
    );
  };

  /**
   * Remove Time Range from a Day
   */
  const removeTimeRange = (dayId, rangeId) => {
    setWeeklySchedule((prev) =>
      prev.map((day) => {
        if (day.dayId === dayId) {
          return {
            ...day,
            timeRanges: day.timeRanges.filter((range) => range.id !== rangeId),
          };
        }
        return day;
      })
    );
  };

  /**
   * Update Time Range
   */
  const updateTimeRange = (dayId, rangeId, field, value) => {
    setWeeklySchedule((prev) =>
      prev.map((day) => {
        if (day.dayId === dayId) {
          return {
            ...day,
            timeRanges: day.timeRanges.map((range) =>
              range.id === rangeId ? { ...range, [field]: value } : range
            ),
          };
        }
        return day;
      })
    );
  };

  /**
   * Add Custom Days Off
   */
  const handleAddDaysOff = async () => {
    if (selectedDatesForOff.length === 0) {
      toast.error("Please select at least one date");
      return;
    }

    setIsSaving(true);
    try {
      const newDaysOff = selectedDatesForOff.map((date) => ({
        id: Date.now() + Math.random(),
        date: date.toISOString().split("T")[0],
        reason: reasonForOff || "Day off",
        createdAt: new Date().toISOString(),
      }));

      // TODO: API call to save days off
      // await fetch('/api/admin/time-slots/days-off', {
      //   method: 'POST',
      //   body: JSON.stringify(newDaysOff)
      // });

      setCustomDaysOff((prev) => [...prev, ...newDaysOff]);
      setSelectedDatesForOff([]);
      setReasonForOff("");
      setIsAddDayOffOpen(false);
      toast.success(`${newDaysOff.length} day(s) off added successfully`);
    } catch (error) {
      console.error("Error adding days off:", error);
      toast.error("Failed to add days off");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Save Days Off
   */
  const handleSaveDaysOff = async () => {
    setIsSaving(true);
    try {
      // TODO: API call to save all days off
      // await fetch('/api/admin/time-slots/days-off/bulk', {
      //   method: 'PUT',
      //   body: JSON.stringify(customDaysOff)
      // });

      toast.success("Days off saved successfully");
    } catch (error) {
      console.error("Error saving days off:", error);
      toast.error("Failed to save days off");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Remove Day Off
   */
  const handleRemoveDayOff = async (id) => {
    setIsSaving(true);
    try {
      // TODO: API call to delete day off
      // await fetch(`/api/admin/time-slots/days-off/${id}`, {
      //   method: 'DELETE'
      // });

      setCustomDaysOff((prev) => prev.filter((day) => day.id !== id));
      toast.success("Day off removed successfully");
    } catch (error) {
      console.error("Error removing day off:", error);
      toast.error("Failed to remove day off");
    } finally {
      setIsSaving(false);
      setDeleteConfirmation({ open: false, type: null, id: null });
    }
  };

  /**
   * Disable Specific Time Slot
   */
  const handleDisableTimeSlot = async () => {
    if (!selectedDateForSlot || !selectedTimeSlot) {
      toast.error("Please select date and time slot");
      return;
    }

    setIsSaving(true);
    try {
      const newDisabledSlot = {
        id: Date.now(),
        date: selectedDateForSlot.toISOString().split("T")[0],
        timeSlot: selectedTimeSlot,
        reason: disableReason || "Unavailable",
        isPermanent: false,
        createdAt: new Date().toISOString(),
      };

      // TODO: API call to disable slot
      // await fetch('/api/admin/time-slots/disabled-slots', {
      //   method: 'POST',
      //   body: JSON.stringify(newDisabledSlot)
      // });

      setDisabledSlots((prev) => [...prev, newDisabledSlot]);
      setSelectedDateForSlot(null);
      setSelectedTimeSlot("");
      setDisableReason("");
      setIsDisableSlotOpen(false);
      toast.success("Time slot disabled successfully");
    } catch (error) {
      console.error("Error disabling slot:", error);
      toast.error("Failed to disable time slot");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Save Disabled Slots
   */
  const handleSaveDisabledSlots = async () => {
    setIsSaving(true);
    try {
      // TODO: API call to save all disabled slots
      // await fetch('/api/admin/time-slots/disabled-slots/bulk', {
      //   method: 'PUT',
      //   body: JSON.stringify(disabledSlots)
      // });

      toast.success("Disabled slots saved successfully");
    } catch (error) {
      console.error("Error saving disabled slots:", error);
      toast.error("Failed to save disabled slots");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Enable Disabled Time Slot
   */
  const handleEnableTimeSlot = async (id) => {
    setIsSaving(true);
    try {
      // TODO: API call to enable slot
      // await fetch(`/api/admin/time-slots/disabled-slots/${id}`, {
      //   method: 'DELETE'
      // });

      setDisabledSlots((prev) => prev.filter((slot) => slot.id !== id));
      toast.success("Time slot enabled successfully");
    } catch (error) {
      console.error("Error enabling slot:", error);
      toast.error("Failed to enable time slot");
    } finally {
      setIsSaving(false);
      setDeleteConfirmation({ open: false, type: null, id: null });
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 p-4 md:p-6 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Time Slots Management</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Configure availability, schedules, and booking settings
          </p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="md:size-default">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="global" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
          <TabsTrigger value="global" className="flex items-center justify-center gap-2 py-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Global Settings</span>
            <span className="sm:hidden">Global</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center justify-center gap-2 py-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Weekly Schedule</span>
            <span className="sm:hidden">Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="daysoff" className="flex items-center justify-center gap-2 py-2">
            <CalendarIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Days Off</span>
            <span className="sm:hidden">Days Off</span>
          </TabsTrigger>
          <TabsTrigger value="disabled" className="flex items-center justify-center gap-2 py-2">
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Disabled Slots</span>
            <span className="sm:hidden">Disabled</span>
          </TabsTrigger>
        </TabsList>

        {/* Global Settings Tab */}
        <TabsContent value="global" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="defaultSlotDuration">Default Slot Duration (minutes)</Label>
                  <Input
                    id="defaultSlotDuration"
                    type="number"
                    min="5"
                    max="480"
                    step="5"
                    value={globalSettings.defaultSlotDuration}
                    onChange={(e) =>
                      setGlobalSettings((prev) => ({
                        ...prev,
                        defaultSlotDuration: parseInt(e.target.value) || 30,
                      }))
                    }
                    placeholder="Enter duration in minutes"
                  />
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Default duration for time slots (5-480 minutes)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxOrdersPerSlot">Max Orders Per Slot</Label>
                  <Input
                    id="maxOrdersPerSlot"
                    type="number"
                    min="1"
                    max="100"
                    value={globalSettings.maxOrdersPerSlot}
                    onChange={(e) =>
                      setGlobalSettings((prev) => ({
                        ...prev,
                        maxOrdersPerSlot: parseInt(e.target.value) || 1,
                      }))
                    }
                  />
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Maximum bookings allowed per time slot
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="advanceBookingDays">Advance Booking Days</Label>
                  <Input
                    id="advanceBookingDays"
                    type="number"
                    min="1"
                    max="365"
                    value={globalSettings.advanceBookingDays}
                    onChange={(e) =>
                      setGlobalSettings((prev) => ({
                        ...prev,
                        advanceBookingDays: parseInt(e.target.value) || 30,
                      }))
                    }
                  />
                  <p className="text-xs md:text-sm text-muted-foreground">
                    How many days in advance customers can book
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bufferBetweenSlots">Buffer Between Slots (minutes)</Label>
                  <Input
                    id="bufferBetweenSlots"
                    type="number"
                    min="0"
                    max="60"
                    value={globalSettings.bufferBetweenSlots}
                    onChange={(e) =>
                      setGlobalSettings((prev) => ({
                        ...prev,
                        bufferBetweenSlots: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Break time between consecutive slots
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleGlobalSettingsUpdate} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Global Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          {weeklySchedule.map((day) => (
            <Card key={day.dayId}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base md:text-lg font-semibold">{day.dayName}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`active-${day.dayId}`} className="text-xs md:text-sm">
                    {day.isActive ? "Active" : "Day Off"}
                  </Label>
                  <Switch
                    id={`active-${day.dayId}`}
                    checked={day.isActive}
                    onCheckedChange={() => toggleDayActive(day.dayId)}
                  />
                </div>
              </CardHeader>

              {day.isActive && (
                <CardContent className="space-y-4">
                  {day.timeRanges.map((range, index) => (
                    <div
                      key={range.id}
                      className="grid gap-4 p-3 md:p-4 border rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">Time Range {index + 1}</Badge>
                        {day.timeRanges.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTimeRange(day.dayId, range.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4">
                        <div className="space-y-2">
                          <Label className="text-xs md:text-sm">Start Time</Label>
                          <Input
                            type="time"
                            value={range.startTime}
                            onChange={(e) =>
                              updateTimeRange(
                                day.dayId,
                                range.id,
                                "startTime",
                                e.target.value
                              )
                            }
                            className="text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs md:text-sm">End Time</Label>
                          <Input
                            type="time"
                            value={range.endTime}
                            onChange={(e) =>
                              updateTimeRange(day.dayId, range.id, "endTime", e.target.value)
                            }
                            className="text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs md:text-sm">Duration (min)</Label>
                          <Input
                            type="number"
                            min="5"
                            max="480"
                            step="5"
                            value={range.slotDuration}
                            onChange={(e) =>
                              updateTimeRange(
                                day.dayId,
                                range.id,
                                "slotDuration",
                                parseInt(e.target.value) || 30
                              )
                            }
                            className="text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs md:text-sm">Max Orders</Label>
                          <Input
                            type="number"
                            min="1"
                            value={range.maxOrdersPerSlot}
                            onChange={(e) =>
                              updateTimeRange(
                                day.dayId,
                                range.id,
                                "maxOrdersPerSlot",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addTimeRange(day.dayId)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Time Range
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}

          <div className="flex justify-end">
            <Button onClick={handleWeeklyScheduleUpdate} disabled={isSaving}>
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Weekly Schedule
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Days Off Tab */}
        <TabsContent value="daysoff" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle className="text-base md:text-lg">Custom Days Off</CardTitle>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Block specific dates from booking
                </p>
              </div>
              <Dialog open={isAddDayOffOpen} onOpenChange={setIsAddDayOffOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Days Off
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Days Off</DialogTitle>
                    <DialogDescription>
                      Select dates to mark as unavailable for booking
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="flex justify-center w-full overflow-x-auto">
                      <div className="inline-block">
                        <Calendar
                          mode="multiple"
                          selected={selectedDatesForOff}
                          onSelect={setSelectedDatesForOff}
                          className="rounded-md border"
                          disabled={(date) => date < new Date()}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason (Optional)</Label>
                      <Input
                        id="reason"
                        placeholder="e.g., Holiday, Maintenance, etc."
                        value={reasonForOff}
                        onChange={(e) => setReasonForOff(e.target.value)}
                      />
                    </div>

                    {selectedDatesForOff.length > 0 && (
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium mb-2">
                          Selected Dates ({selectedDatesForOff.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedDatesForOff.map((date, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {formatDate(date.toISOString())}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDayOffOpen(false)}
                      disabled={isSaving}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddDaysOff} disabled={isSaving} className="w-full sm:w-auto">
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Days Off"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent>
              {customDaysOff.length === 0 ? (
                <div className="text-center py-8 md:py-12 text-muted-foreground">
                  <CalendarIcon className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm md:text-base">No custom days off configured</p>
                  <p className="text-xs md:text-sm">Click "Add Days Off" to block specific dates</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs md:text-sm">Date</TableHead>
                          <TableHead className="text-xs md:text-sm">Reason</TableHead>
                          <TableHead className="hidden md:table-cell text-xs md:text-sm">Created</TableHead>
                          <TableHead className="text-right text-xs md:text-sm">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customDaysOff
                          .sort((a, b) => new Date(a.date) - new Date(b.date))
                          .map((dayOff) => (
                            <TableRow key={dayOff.id}>
                              <TableCell className="font-medium text-xs md:text-sm">
                                {formatDate(dayOff.date)}
                              </TableCell>
                              <TableCell className="text-xs md:text-sm">{dayOff.reason}</TableCell>
                              <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                                {new Date(dayOff.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setDeleteConfirmation({
                                      open: true,
                                      type: "dayoff",
                                      id: dayOff.id,
                                    })
                                  }
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSaveDaysOff} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save All Days Off
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Disabled Slots Tab */}
        <TabsContent value="disabled" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle className="text-base md:text-lg">Disabled Time Slots</CardTitle>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Block specific time slots on specific dates
                </p>
              </div>
              <Dialog open={isDisableSlotOpen} onOpenChange={setIsDisableSlotOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Disable Slot
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Disable Time Slot</DialogTitle>
                    <DialogDescription>
                      Select a date and time slot to disable
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Select Date</Label>
                      <div className="flex justify-center w-full overflow-x-auto">
                        <div className="inline-block">
                          <Calendar
                            mode="single"
                            selected={selectedDateForSlot}
                            onSelect={setSelectedDateForSlot}
                            className="rounded-md border"
                            disabled={(date) => date < new Date()}
                          />
                        </div>
                      </div>
                    </div>

                    {selectedDateForSlot && (
                      <>
                        <div className="space-y-2">
                          <Label>Available Time Slots</Label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                            {generateTimeSlotsForDate(selectedDateForSlot).length === 0 ? (
                              <div className="col-span-2 sm:col-span-3 text-center py-4 text-sm text-muted-foreground">
                                No slots available for this date
                              </div>
                            ) : (
                              generateTimeSlotsForDate(selectedDateForSlot).map((slot) => (
                                <button
                                  key={slot.time}
                                  onClick={() => setSelectedTimeSlot(slot.time)}
                                  className={`py-2 px-2 md:px-3 rounded-md border-2 text-xs md:text-sm font-medium transition-all ${
                                    selectedTimeSlot === slot.time
                                      ? "border-primary bg-primary text-white"
                                      : "border-border hover:border-primary/50"
                                  }`}
                                >
                                  {slot.time}
                                </button>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="disableReason">Reason (Optional)</Label>
                          <Input
                            id="disableReason"
                            placeholder="e.g., Maintenance, Meeting, etc."
                            value={disableReason}
                            onChange={(e) => setDisableReason(e.target.value)}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDisableSlotOpen(false);
                        setSelectedDateForSlot(null);
                        setSelectedTimeSlot("");
                        setDisableReason("");
                      }}
                      disabled={isSaving}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleDisableTimeSlot} disabled={isSaving} className="w-full sm:w-auto">
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Disabling...
                        </>
                      ) : (
                        "Disable Slot"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent>
              {disabledSlots.length === 0 ? (
                <div className="text-center py-8 md:py-12 text-muted-foreground">
                  <Clock className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm md:text-base">No disabled time slots</p>
                  <p className="text-xs md:text-sm">
                    Click "Disable Slot" to block specific times
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs md:text-sm">Date</TableHead>
                          <TableHead className="text-xs md:text-sm">Time Slot</TableHead>
                          <TableHead className="hidden md:table-cell text-xs md:text-sm">Reason</TableHead>
                          <TableHead className="hidden sm:table-cell text-xs md:text-sm">Status</TableHead>
                          <TableHead className="text-right text-xs md:text-sm">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {disabledSlots
                          .sort((a, b) => new Date(a.date) - new Date(b.date))
                          .map((slot) => (
                            <TableRow key={slot.id}>
                              <TableCell className="font-medium text-xs md:text-sm">
                                {formatDate(slot.date)}
                              </TableCell>
                              <TableCell className="text-xs md:text-sm">{slot.timeSlot}</TableCell>
                              <TableCell className="hidden md:table-cell text-xs md:text-sm">{slot.reason}</TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <Badge variant={slot.isPermanent ? "destructive" : "secondary"} className="text-xs">
                                  {slot.isPermanent ? "Permanent" : "Temporary"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setDeleteConfirmation({
                                      open: true,
                                      type: "slot",
                                      id: slot.id,
                                    })
                                  }
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>

                  <Separator className="my-4" />
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSaveDisabledSlots} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save All Disabled Slots
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirmation.open}
        onOpenChange={(open) =>
          !open && setDeleteConfirmation({ open: false, type: null, id: null })
        }
      >
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {deleteConfirmation.type === "dayoff"
                ? "This will remove the day off and allow bookings for this date."
                : "This will enable the time slot and allow bookings for this time."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={isSaving} className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirmation.type === "dayoff") {
                  handleRemoveDayOff(deleteConfirmation.id);
                } else {
                  handleEnableTimeSlot(deleteConfirmation.id);
                }
              }}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              {isSaving ? "Processing..." : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
