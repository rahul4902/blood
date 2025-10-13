// components/admin/tests/tabs/BasicDetailTab.jsx
"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useEffect } from "react"

export function BasicDetailTab({ formData, updateFormData, errors, categoriesDropdownList = [], sampleTypesDropdown = [] }) {
  const handleChange = (field, value) => {
    updateFormData({ [field]: value })
  }

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !formData.slug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim()
      updateFormData({ slug })
    }
  }, [formData.name, formData.slug])

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
      {/* Type Selection */}
      <div className="space-y-2">
        <Label htmlFor="type" className="text-gray-700 dark:text-gray-300">
          Type <span className="text-red-500">*</span>
        </Label>
        <Select 
          value={formData.type || "test"} 
          onValueChange={(value) => handleChange("type", value)}
        >
          <SelectTrigger className={`${errors.type ? "border-red-500" : ""} dark:bg-gray-800 dark:border-gray-700`}>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
            <SelectItem value="test">Test</SelectItem>
            <SelectItem value="package">Package</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && <p className="text-sm text-red-500 mt-1">{errors.type}</p>}
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name || ""}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Enter test name"
          className={`${errors.name ? "border-red-500" : ""} dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
        />
        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <Label htmlFor="slug" className="text-gray-700 dark:text-gray-300">
          Slug <span className="text-red-500">*</span>
        </Label>
        <Input
          id="slug"
          value={formData.slug || ""}
          onChange={(e) => handleChange("slug", e.target.value)}
          placeholder="test-slug"
          className={`${errors.slug ? "border-red-500" : ""} dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
        />
        {errors.slug && <p className="text-sm text-red-500 mt-1">{errors.slug}</p>}
      </div>

      {/* Code */}
      <div className="space-y-2">
        <Label htmlFor="code" className="text-gray-700 dark:text-gray-300">
          Code
        </Label>
        <Input
          id="code"
          value={formData.code || ""}
          onChange={(e) => handleChange("code", e.target.value)}
          placeholder="TEST001"
          className={`${errors.code ? "border-red-500" : ""} dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
        />
        {errors.code && <p className="text-sm text-red-500 mt-1">{errors.code}</p>}
      </div>

      {/* Also Known As */}
      <div className="space-y-2">
        <Label htmlFor="also_known_as" className="text-gray-700 dark:text-gray-300">
          Also Known As
        </Label>
        <Input
          id="also_known_as"
          value={formData.also_known_as || ""}
          onChange={(e) => handleChange("also_known_as", e.target.value)}
          placeholder="Alternative names"
          className={`${errors.also_known_as ? "border-red-500" : ""} dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
        />
        {errors.also_known_as && <p className="text-sm text-red-500 mt-1">{errors.also_known_as}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
          Description
        </Label>
        <Textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Enter detailed test description..."
          rows={6}
          className={`${errors.description ? "border-red-500" : ""} dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-y`}
        />
        {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
      </div>

      {/* When To Take Test */}
      <div className="space-y-2">
        <Label htmlFor="whenToTakeTest" className="text-gray-700 dark:text-gray-300">
          When To Take Test
        </Label>
        <Textarea
          id="whenToTakeTest"
          value={formData.whenToTakeTest || ""}
          onChange={(e) => handleChange("whenToTakeTest", e.target.value)}
          placeholder="When should this test be taken?"
          rows={3}
          className={`${errors.whenToTakeTest ? "border-red-500" : ""} dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
        />
        {errors.whenToTakeTest && <p className="text-sm text-red-500 mt-1">{errors.whenToTakeTest}</p>}
      </div>

      {/* Avoid Test If */}
      <div className="space-y-2">
        <Label htmlFor="avoidTestIf" className="text-gray-700 dark:text-gray-300">
          Avoid Test If
        </Label>
        <Textarea
          id="avoidTestIf"
          value={formData.avoidTestIf || ""}
          onChange={(e) => handleChange("avoidTestIf", e.target.value)}
          placeholder="When to avoid this test?"
          rows={3}
          className={`${errors.avoidTestIf ? "border-red-500" : ""} dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
        />
        {errors.avoidTestIf && <p className="text-sm text-red-500 mt-1">{errors.avoidTestIf}</p>}
      </div>

      {/* Categories Selection */}
      <div className="space-y-4">
        <h4 className="text-base font-medium text-gray-900 dark:text-white">Categories</h4>
        
        <div className="space-y-2">
          <Select onValueChange={(value) => handleMultiSelectChange("categories", value)}>
            <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
              <SelectValue placeholder="Choose categories..." />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              {categoriesDropdownList.map((category) => (
                <SelectItem 
                  key={category.value} 
                  value={category.value}
                  disabled={formData.categories?.includes(category.value)}
                >
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categories && <p className="text-sm text-red-500 mt-1">{errors.categories}</p>}
        </div>

        {/* Selected Categories */}
        {formData.categories && formData.categories.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm text-gray-600 dark:text-gray-400">Selected Categories:</Label>
            <div className="flex flex-wrap gap-2">
              {formData.categories.map((categoryId, index) => {
                // Ensure categoryId is a string
                const id = typeof categoryId === 'object' ? (categoryId._id) : categoryId
                const category = categoriesDropdownList.find(cat => cat.value === id)
                return (
                  <Badge key={id || index} variant="secondary" className="flex items-center gap-1">
                    {category?.label}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => removeSelectedItem("categories", id)}
                    />
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sample Types Selection */}
      <div className="space-y-4">
        <h4 className="text-base font-medium text-gray-900 dark:text-white">Sample Types</h4>
        
        <div className="space-y-2">
          <Select onValueChange={(value) => handleMultiSelectChange("sampleTypes", value)}>
            <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
              <SelectValue placeholder="Choose sample types..." />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              {sampleTypesDropdown.map((sampleType) => (
                <SelectItem 
                  key={sampleType.value} 
                  value={sampleType.value}
                  disabled={formData.sampleTypes?.includes(sampleType.value)}
                >
                  {sampleType.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.sampleTypes && <p className="text-sm text-red-500 mt-1">{errors.sampleTypes}</p>}
        </div>

        {/* Selected Sample Types */}
        {formData.sampleTypes && formData.sampleTypes.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm text-gray-600 dark:text-gray-400">Selected Sample Types:</Label>
            <div className="flex flex-wrap gap-2">
              {formData.sampleTypes.map((sampleTypeId, index) => {
                // Ensure sampleTypeId is a string
                console.log('sampleTypeId',sampleTypeId,sampleTypesDropdown)
                const id = typeof sampleTypeId === 'object' ? (sampleTypeId._id) : sampleTypeId
                const sampleType = sampleTypesDropdown.find(st => st.value === id)
                return (
                  <Badge key={id || index} variant="secondary" className="flex items-center gap-1">
                    {sampleType?.label}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => removeSelectedItem("sampleTypes", id)}
                    />
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
