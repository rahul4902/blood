// components/admin/tests/tabs/AvailabilityTab.jsx
"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function AvailabilityTab({ formData, updateFormData, errors }) {
  const handleChange = (field, value) => {
    updateFormData({ [field]: value })
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          State-wise pricing will use the basic pricing by default. You can customize city-specific pricing through API.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TAT Time */}
        <div className="space-y-2">
          <Label htmlFor="tat_time" className="text-gray-700 dark:text-gray-300">
            TAT Time (Turnaround Time)
          </Label>
          <Input
            id="tat_time"
            value={formData.tat_time || ""}
            onChange={(e) => handleChange("tat_time", e.target.value)}
            placeholder="e.g., 24 hours"
            className={`${errors.tat_time ? "border-red-500" : ""} dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
          />
          {errors.tat_time && <p className="text-sm text-red-500 mt-1">{errors.tat_time}</p>}
        </div>

        {/* Report Time */}
        <div className="space-y-2">
          <Label htmlFor="report_time" className="text-gray-700 dark:text-gray-300">
            Report Time
          </Label>
          <Input
            id="report_time"
            value={formData.report_time || ""}
            onChange={(e) => handleChange("report_time", e.target.value)}
            placeholder="e.g., Same day"
            className={`${errors.report_time ? "border-red-500" : ""} dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
          />
          {errors.report_time && <p className="text-sm text-red-500 mt-1">{errors.report_time}</p>}
        </div>

        {/* Fasting Time */}
        <div className="space-y-2">
          <Label htmlFor="fasting_time" className="text-gray-700 dark:text-gray-300">
            Fasting Time
          </Label>
          <Input
            id="fasting_time"
            value={formData.fasting_time || ""}
            onChange={(e) => handleChange("fasting_time", e.target.value)}
            placeholder="e.g., 8-12 hours"
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
      </div>

      {errors.package_city_prices && (
        <p className="text-sm text-red-500 mt-2">{errors.package_city_prices}</p>
      )}
    </div>
  )
}
