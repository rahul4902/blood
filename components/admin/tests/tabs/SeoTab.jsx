// components/admin/tests/tabs/SeoTab.jsx
"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"

export function SeoTab({ formData, updateFormData, errors }) {
  const seoMeta = formData.seoMeta || { title: "", keywords: [], description: "" }

  const handleChange = (field, value) => {
    updateFormData({
      seoMeta: { ...seoMeta, [field]: value }
    })
  }

  const addKeyword = () => {
    const keywords = [...(seoMeta.keywords || []), ""]
    handleChange("keywords", keywords)
  }

  const updateKeyword = (index, value) => {
    const keywords = [...(seoMeta.keywords || [])]
    keywords[index] = value
    handleChange("keywords", keywords)
  }

  const removeKeyword = (index) => {
    const keywords = seoMeta.keywords.filter((_, i) => i !== index)
    handleChange("keywords", keywords)
  }

  return (
    <div className="space-y-6">
      {/* SEO Title */}
      <div className="space-y-2">
        <Label htmlFor="seo_title" className="text-gray-700 dark:text-gray-300">
          SEO Title
        </Label>
        <Input
          id="seo_title"
          value={seoMeta.title || ""}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Enter SEO title"
          className={`${errors["seoMeta.title"] ? "border-red-500" : ""} dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
        />
        {errors["seoMeta.title"] && <p className="text-sm text-red-500 mt-1">{errors["seoMeta.title"]}</p>}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Recommended length: 50-60 characters
        </p>
      </div>

      {/* SEO Keywords */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-gray-700 dark:text-gray-300">SEO Keywords</Label>
          <Button
            type="button"
            onClick={addKeyword}
            size="sm"
            variant="outline"
            className="h-8"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Keyword
          </Button>
        </div>
        
        <div className="space-y-2">
          {(seoMeta.keywords || []).map((keyword, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={keyword}
                onChange={(e) => updateKeyword(index, e.target.value)}
                placeholder="Enter keyword"
                className="flex-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
              <Button
                type="button"
                onClick={() => removeKeyword(index)}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        {errors["seoMeta.keywords"] && <p className="text-sm text-red-500 mt-1">{errors["seoMeta.keywords"]}</p>}
      </div>

      {/* SEO Description */}
      <div className="space-y-2">
        <Label htmlFor="seo_description" className="text-gray-700 dark:text-gray-300">
          SEO Meta Description
        </Label>
        <Textarea
          id="seo_description"
          value={seoMeta.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Enter meta description"
          rows={4}
          className={`${errors["seoMeta.description"] ? "border-red-500" : ""} dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
        />
        {errors["seoMeta.description"] && <p className="text-sm text-red-500 mt-1">{errors["seoMeta.description"]}</p>}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Recommended length: 150-160 characters
        </p>
      </div>
    </div>
  )
}
