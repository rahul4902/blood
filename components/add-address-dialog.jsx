// components/add-address-dialog.jsx
"use client"

import { useState, useEffect } from "react"
import { Home, Briefcase, MapPin } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { addressAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function AddAddressDialog({
  open,
  onOpenChange,
  onAddressAdded,
  onAddressUpdated,
  editingAddress
}) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: "home",
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false
  })
  const [errors, setErrors] = useState({})

  // Address type options with icons
  const addressTypes = [
    { value: "home", label: "Home", icon: Home },
    { value: "work", label: "Work", icon: Briefcase },
    { value: "other", label: "Other", icon: MapPin }
  ]

  // Load editing address data
  useEffect(() => {
    if (editingAddress) {
      setFormData({
        type: editingAddress.type || "home",
        address: editingAddress.address || "",
        landmark: editingAddress.landmark || "",
        city: editingAddress.city || "",
        state: editingAddress.state || "",
        pincode: editingAddress.pincode || "",
        isDefault: editingAddress.isDefault || false
      })
    } else {
      // Reset form when adding new
      setFormData({
        type: "home",
        address: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
        isDefault: false
      })
    }
    setErrors({})
  }, [editingAddress, open])

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.type) {
      newErrors.type = "Address type is required"
    }

    if (!formData.address || formData.address.trim().length < 10) {
      newErrors.address = "Address must be at least 10 characters"
    }

    if (!formData.city || formData.city.trim().length === 0) {
      newErrors.city = "City is required"
    }

    if (!formData.state || formData.state.trim().length === 0) {
      newErrors.state = "State is required"
    }

    if (!formData.pincode || !/^[0-9]{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pincode must be exactly 6 digits"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      let data

      if (editingAddress) {
        // Update existing address
        data = await addressAPI.updateAddress(editingAddress.id, formData)

        if (data.success) {
          toast({
            title: "Success",
            description: "Address updated successfully"
          })
          onAddressUpdated(data.address)
          onOpenChange(false)
        }
      } else {
        // Add new address
        data = await addressAPI.addAddress(formData)

        if (data.success) {
          toast({
            title: "Success",
            description: "Address added successfully"
          })
          onAddressAdded(data.address)
          onOpenChange(false)
        }
      }
    } catch (error) {
      console.error("Form submission error:", error)

      // Handle validation errors from backend
      if (error.message === 'Validation failed' && error.errors) {
        const backendErrors = {}
        error.errors.forEach(err => {
          backendErrors[err.field] = err.message
        })
        setErrors(backendErrors)

        toast({
          title: "Validation Error",
          description: "Please check the form for errors",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to save address",
          variant: "destructive"
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingAddress ? "Edit Address" : "Add New Address"}
          </DialogTitle>
          <DialogDescription>
            {editingAddress
              ? "Update your delivery address details"
              : "Add a new address for blood sample collection"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Address Type - Modern Card Selector */}
            <div className="grid gap-3">
              <Label>Address Type *</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) => handleChange('type', value)}
                className="grid grid-cols-3 gap-3"
              >
                {addressTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <Label
                      key={type.value}
                      htmlFor={type.value}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-all",
                        formData.type === type.value && "border-primary bg-primary/5"
                      )}
                    >
                      <RadioGroupItem
                        value={type.value}
                        id={type.value}
                        className="sr-only"
                      />
                      <Icon
                        className={cn(
                          "mb-2 h-6 w-6",
                          formData.type === type.value
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      />
                      <span className="text-sm font-medium">{type.label}</span>
                    </Label>
                  )
                })}
              </RadioGroup>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type}</p>
              )}
            </div>

            {/* Full Address */}
            <div className="grid gap-2">
              <Label htmlFor="address">Full Address *</Label>
              <Input
                id="address"
                placeholder="House no., Street, Area"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                maxLength={200}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address}</p>
              )}
            </div>

            {/* Landmark */}
            <div className="grid gap-2">
              <Label htmlFor="landmark">Landmark (Optional)</Label>
              <Input
                id="landmark"
                placeholder="Nearby landmark"
                value={formData.landmark}
                onChange={(e) => handleChange('landmark', e.target.value)}
                maxLength={100}
              />
              {errors.landmark && (
                <p className="text-sm text-destructive">{errors.landmark}</p>
              )}
            </div>

            {/* City & State */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  maxLength={50}
                />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  maxLength={50}
                />
                {errors.state && (
                  <p className="text-sm text-destructive">{errors.state}</p>
                )}
              </div>
            </div>

            {/* Pincode */}
            <div className="grid gap-2">
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                placeholder="6-digit pincode"
                value={formData.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
                maxLength={6}
                pattern="[0-9]{6}"
              />
              {errors.pincode && (
                <p className="text-sm text-destructive">{errors.pincode}</p>
              )}
            </div>

            {/* Set as Default */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) =>
                  handleChange('isDefault', checked)
                }
              />
              <Label
                htmlFor="isDefault"
                className="text-sm font-normal cursor-pointer"
              >
                Set as default address
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingAddress ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
