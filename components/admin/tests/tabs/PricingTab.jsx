"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function PricingTab({ formData, updateFormData, errors }) {
  const toNumberOrUndef = (value) => {
    if (value === "" || value === null || value === undefined) return undefined
    const n = Number(value)
    return Number.isFinite(n) ? n : undefined
  }

  const handleChange = (field, raw) => {
    const numericFields = new Set([
      "mrp",
      "package_price",
      "discount",
      "addon_price",
      "offer_price",
      "phlebo_cost",
      "min_booking_amount_for_phlebo",
    ])
    const value = numericFields.has(field) ? toNumberOrUndef(raw) : raw
    updateFormData({ [field]: value })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MRP */}
        <div className="space-y-2">
          <Label htmlFor="mrp" className="text-gray-700 dark:text-gray-300">
            MRP <span className="text-red-500">*</span>
          </Label>
          <Input
            id="mrp"
            type="number"
            value={formData.mrp ?? ""}
            onChange={(e) => handleChange("mrp", e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className={`${errors.mrp ? "border-red-500" : ""} dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
          />
          {errors.mrp && <p className="text-sm text-red-500 mt-1">{errors.mrp}</p>}
        </div>

        {/* Package Price */}
        <div className="space-y-2">
          <Label htmlFor="package_price" className="text-gray-700 dark:text-gray-300">
            Package Price <span className="text-red-500">*</span>
          </Label>
          <Input
            id="package_price"
            type="number"
            value={formData.package_price ?? ""}
            onChange={(e) => handleChange("package_price", e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className={`${errors.package_price ? "border-red-500" : ""} dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
          />
          {errors.package_price && <p className="text-sm text-red-500 mt-1">{errors.package_price}</p>}
        </div>

        {/* Discount */}
        <div className="space-y-2">
          <Label htmlFor="discount" className="text-gray-700 dark:text-gray-300">
            Discount (%)
          </Label>
          <Input
            id="discount"
            type="number"
            value={formData.discount ?? ""}
            onChange={(e) => handleChange("discount", e.target.value)}
            placeholder="0"
            min="0"
            max="100"
            className={`${errors.discount ? "border-red-500" : ""} dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
          />
          {errors.discount && <p className="text-sm text-red-500 mt-1">{errors.discount}</p>}
        </div>

        {/* Addon Price */}
        <div className="space-y-2">
          <Label htmlFor="addon_price" className="text-gray-700 dark:text-gray-300">
            Addon Price
          </Label>
          <Input
            id="addon_price"
            type="number"
            value={formData.addon_price ?? ""}
            onChange={(e) => handleChange("addon_price", e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className={`${errors.addon_price ? "border-red-500" : ""} dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
          />
          {errors.addon_price && <p className="text-sm text-red-500 mt-1">{errors.addon_price}</p>}
        </div>

        {/* Offer Price */}
        <div className="space-y-2">
          <Label htmlFor="offer_price" className="text-gray-700 dark:text-gray-300">
            Offer Price
          </Label>
          <Input
            id="offer_price"
            type="number"
            value={formData.offer_price ?? ""}
            onChange={(e) => handleChange("offer_price", e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className={`${errors.offer_price ? "border-red-500" : ""} dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
          />
          {errors.offer_price && <p className="text-sm text-red-500 mt-1">{errors.offer_price}</p>}
        </div>

        {/* Offer Valid Till */}
        <div className="space-y-2">
          <Label htmlFor="offerValidTill" className="text-gray-700 dark:text-gray-300">
            Offer Valid Till
          </Label>
          <Input
            id="offerValidTill"
            type="date"
            value={formData.offerValidTill ? new Date(formData.offerValidTill).toISOString().split("T")[0] : ""}
            onChange={(e) => handleChange("offerValidTill", e.target.value)}
            className={`${errors.offerValidTill ? "border-red-500" : ""} dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
          />
          {errors.offerValidTill && <p className="text-sm text-red-500 mt-1">{errors.offerValidTill}</p>}
        </div>

        {/* Phlebo Cost */}
        <div className="space-y-2">
          <Label htmlFor="phlebo_cost" className="text-gray-700 dark:text-gray-300">
            Phlebotomist Cost
          </Label>
          <Input
            id="phlebo_cost"
            type="number"
            value={formData.phlebo_cost ?? ""}
            onChange={(e) => handleChange("phlebo_cost", e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className={`${errors.phlebo_cost ? "border-red-500" : ""} dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
          />
          {errors.phlebo_cost && <p className="text-sm text-red-500 mt-1">{errors.phlebo_cost}</p>}
        </div>

        {/* Min Booking Amount for Phlebo */}
        <div className="space-y-2">
          <Label htmlFor="min_booking_amount_for_phlebo" className="text-gray-700 dark:text-gray-300">
            Min Booking Amount for Phlebotomist
          </Label>
          <Input
            id="min_booking_amount_for_phlebo"
            type="number"
            value={formData.min_booking_amount_for_phlebo ?? ""}
            onChange={(e) => handleChange("min_booking_amount_for_phlebo", e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className={`${errors.min_booking_amount_for_phlebo ? "border-red-500" : ""} dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
          />
          {errors.min_booking_amount_for_phlebo && <p className="text-sm text-red-500 mt-1">{errors.min_booking_amount_for_phlebo}</p>}
        </div>
      </div>
    </div>
  )
}