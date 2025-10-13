// components/admin/tests/tabs/OtherTab.jsx
"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

export function OtherTab({ formData, updateFormData, errors, categoriesDropdownList = [], sampleTypesDropdown = [] }) {
  const handleChange = (field, value) => {
    updateFormData({ [field]: value })
  }

  const handleCheckboxChange = (field, checked) => {
    updateFormData({ [field]: checked })
  }

  const handleMultiSelectChange = (field, value) => {
    const currentValues = formData[field] || []
    if (currentValues.includes(value)) {
      // Remove if already selected
      updateFormData({ [field]: currentValues.filter(item => item !== value) })
    } else {
      // Add if not selected
      updateFormData({ [field]: [...currentValues, value] })
    }
  }

  const removeSelectedItem = (field, value) => {
    const currentValues = formData[field] || []
    updateFormData({ [field]: currentValues.filter(item => item !== value) })
  }

  return (
    <div className="space-y-6">
      {/* Visibility Settings */}
      <div className="space-y-4">
        <h4 className="text-base font-medium text-gray-900 dark:text-white">Visibility Settings</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="status"
              checked={formData.status ?? true}
              onCheckedChange={(checked) => handleCheckboxChange("status", checked)}
              className="dark:border-gray-600"
            />
            <Label htmlFor="status" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              Active Status
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="website_display"
              checked={formData.website_display ?? true}
              onCheckedChange={(checked) => handleCheckboxChange("website_display", checked)}
              className="dark:border-gray-600"
            />
            <Label htmlFor="website_display" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              Website Display
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPopular"
              checked={formData.isPopular ?? false}
              onCheckedChange={(checked) => handleCheckboxChange("isPopular", checked)}
              className="dark:border-gray-600"
            />
            <Label htmlFor="isPopular" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              Popular Test
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isFeatured"
              checked={formData.isFeatured ?? false}
              onCheckedChange={(checked) => handleCheckboxChange("isFeatured", checked)}
              className="dark:border-gray-600"
            />
            <Label htmlFor="isFeatured" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              Featured Test
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="top_packages"
              checked={formData.top_packages ?? false}
              onCheckedChange={(checked) => handleCheckboxChange("top_packages", checked)}
              className="dark:border-gray-600"
            />
            <Label htmlFor="top_packages" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              Top Package
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="best_package_app"
              checked={formData.best_package_app ?? false}
              onCheckedChange={(checked) => handleCheckboxChange("best_package_app", checked)}
              className="dark:border-gray-600"
            />
            <Label htmlFor="best_package_app" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              Best Package (App)
            </Label>
          </div>
        </div>
      </div>

      {/* Sample Collection */}
      <div className="space-y-4">
        <h4 className="text-base font-medium text-gray-900 dark:text-white">Sample Collection</h4>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="home_collection"
            checked={formData.home_collection ?? true}
            onCheckedChange={(checked) => handleCheckboxChange("home_collection", checked)}
            className="dark:border-gray-600"
          />
          <Label htmlFor="home_collection" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            Home Collection Available
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="specimen_instructions" className="text-gray-700 dark:text-gray-300">
            Specimen Instructions
          </Label>
          <Textarea
            id="specimen_instructions"
            value={formData.specimen_instructions || ""}
            onChange={(e) => handleChange("specimen_instructions", e.target.value)}
            placeholder="Enter specimen collection instructions"
            rows={3}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sample_1h_interval_3times"
              checked={formData.sample_1h_interval_3times ?? false}
              onCheckedChange={(checked) => handleCheckboxChange("sample_1h_interval_3times", checked)}
              className="dark:border-gray-600"
            />
            <Label htmlFor="sample_1h_interval_3times" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              1h Interval (3 times)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="sample_1h_interval_2times"
              checked={formData.sample_1h_interval_2times ?? false}
              onCheckedChange={(checked) => handleCheckboxChange("sample_1h_interval_2times", checked)}
              className="dark:border-gray-600"
            />
            <Label htmlFor="sample_1h_interval_2times" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              1h Interval (2 times)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="sample_2h_interval_1time"
              checked={formData.sample_2h_interval_1time ?? false}
              onCheckedChange={(checked) => handleCheckboxChange("sample_2h_interval_1time", checked)}
              className="dark:border-gray-600"
            />
            <Label htmlFor="sample_2h_interval_1time" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              2h Interval (1 time)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="sample_20m_interval_3times"
              checked={formData.sample_20m_interval_3times ?? false}
              onCheckedChange={(checked) => handleCheckboxChange("sample_20m_interval_3times", checked)}
              className="dark:border-gray-600"
            />
            <Label htmlFor="sample_20m_interval_3times" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              20m Interval (3 times)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_pp_fasting"
              checked={formData.is_pp_fasting ?? false}
              onCheckedChange={(checked) => handleCheckboxChange("is_pp_fasting", checked)}
              className="dark:border-gray-600"
            />
            <Label htmlFor="is_pp_fasting" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              PP Fasting Required
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="urine_container_delivery_within_24h"
              checked={formData.urine_container_delivery_within_24h ?? false}
              onCheckedChange={(checked) => handleCheckboxChange("urine_container_delivery_within_24h", checked)}
              className="dark:border-gray-600"
            />
            <Label htmlFor="urine_container_delivery_within_24h" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              Urine Container (24h)
            </Label>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <h4 className="text-base font-medium text-gray-900 dark:text-white">Recommendations</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="recommended_gender" className="text-gray-700 dark:text-gray-300">
              Recommended Gender
            </Label>
            <Input
              id="recommended_gender"
              value={formData.recommended_gender || ""}
              onChange={(e) => handleChange("recommended_gender", e.target.value)}
              placeholder="e.g., Male, Female, Both"
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommended_age" className="text-gray-700 dark:text-gray-300">
              Recommended Age
            </Label>
            <Input
              id="recommended_age"
              value={formData.recommended_age || ""}
              onChange={(e) => handleChange("recommended_age", e.target.value)}
              placeholder="e.g., 18-65 years"
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Special Features */}
      <div className="space-y-4">
        <h4 className="text-base font-medium text-gray-900 dark:text-white">Special Features</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_premium"
              checked={formData.is_premium ?? false}
              onCheckedChange={(checked) => handleCheckboxChange("is_premium", checked)}
              className="dark:border-gray-600"
            />
            <Label htmlFor="is_premium" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              Premium Test
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="smart_report_available"
              checked={formData.smart_report_available ?? false}
              onCheckedChange={(checked) => handleCheckboxChange("smart_report_available", checked)}
              className="dark:border-gray-600"
            />
            <Label htmlFor="smart_report_available" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              Smart Report Available
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_document_required"
              checked={formData.is_document_required ?? false}
              onCheckedChange={(checked) => handleCheckboxChange("is_document_required", checked)}
              className="dark:border-gray-600"
            />
            <Label htmlFor="is_document_required" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              Document Required
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_genomics_package"
              checked={formData.is_genomics_package ?? false}
              onCheckedChange={(checked) => handleCheckboxChange("is_genomics_package", checked)}
              className="dark:border-gray-600"
            />
            <Label htmlFor="is_genomics_package" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              Genomics Package
            </Label>
          </div>
        </div>
      </div>
    </div>
  )
}
