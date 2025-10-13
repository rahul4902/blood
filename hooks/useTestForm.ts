// hooks/useTestForm.js
import { useState, useCallback } from "react"
import axios from "axios"
import { baseURL } from "@/lib/utils"
import { showSuccessToast, showErrorToast } from "@/lib/toasts"
import { validateFormData } from "@/lib/validators/testFormValidator"

const initialFormData = {
  type: "test",
  name: "",
  code: "",
  slug: "", // Add slug field
  categories: [],
  sampleTypes: [],
  price: "",
  mrp: "",
  packagePrice: "", // Add package price field
  discount: "",
  discountPrice: "",
  offerValidTill: "",
  duration: "",
  preparation: "",
  reportAvailability: "",
  tat_time: "",
  methodology: "",
  description: "",
  clinicalSignificance: "",
  testPreparation: "",
  whenToTakeTest: "",
  avoidTestIf: "",
  isFeatured: "0",
  isPopular: "0",
  status: "1",
  availability: [],
  parameters: [],
  faqs: [],
  images: [],
  seoMeta: { title: "", keywords: "", description: "" },
  tests: [],
}

// Helper function to generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '')   // Remove leading/trailing hyphens
}

export function useTestForm(selectedRow, dialogType, onSaveComplete) {
  const [formData, setFormData] = useState(initialFormData)
  const [formErrors, setFormErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [tabErrors, setTabErrors] = useState({})

  const resetForm = useCallback(() => {
    setFormData(initialFormData)
    setFormErrors({})
    setTabErrors({})
    setActiveTab("basic")
  }, [])

  const handleSave = useCallback(async () => {
    const validationErrors = validateFormData(formData)
    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors)
      showErrorToast("Please fix all validation errors before saving")
      return
    }

    setFormErrors({})
    try {
      setIsSaving(true)

      const cleanAvailability = formData.availability
        .filter((item) => item.city || item.pincode)
        .map((item) => ({
          city: item.city || "",
          pincode: item.pincode || "",
          isAvailable: Boolean(item.isAvailable)
        }))

      const cleanParameters = formData.parameters
        .filter((item) => item.name)
        .map((item) => ({
          name: item.name || "",
          unit: item.unit || "",
          normalRange: item.normalRange || "",
          description: item.description || ""
        }))

      const cleanFaqs = formData.faqs
        .filter((item) => item.question && item.answer)
        .map((item) => ({
          question: item.question || "",
          answer: item.answer || ""
        }))

      // Generate slug from name if not provided or in edit mode
      const slug = formData.slug?.trim() || generateSlug(formData.name)

      const payload = {
        type: formData.type,
        name: formData.name.trim(),
        slug: slug, // Include slug
        code: formData.code?.trim() || undefined,
        sampleTypes: Array.isArray(formData.sampleTypes) ? formData.sampleTypes : [],
        sampleType: Array.isArray(formData.sampleTypes) && formData.sampleTypes.length > 0 ? formData.sampleTypes[0] : undefined,
        categories: Array.isArray(formData.categories) ? formData.categories : [],
        category: Array.isArray(formData.categories) && formData.categories.length > 0 ? formData.categories[0] : undefined,
        price: Number(formData.price),
        mrp: formData.mrp ? Number(formData.mrp) : undefined,
        
        // Add package_price for packages
        package_price: formData.type === 'package' 
          ? (formData.packagePrice ? Number(formData.packagePrice) : Number(formData.price))
          : undefined,
        
        discount: formData.discount !== "" ? Number(formData.discount) : undefined,
        discountPrice: formData.discountPrice !== "" ? Number(formData.discountPrice) : undefined,
        offerValidTill: formData.offerValidTill || undefined,
        duration: formData.duration?.trim() || undefined,
        preparation: formData.preparation?.trim() || undefined,
        reportAvailability: formData.reportAvailability?.trim() || undefined,
        tat_time: formData.tat_time?.trim() || undefined,
        methodology: formData.methodology?.trim() || undefined,
        description: formData.description?.trim() || undefined,
        clinicalSignificance: formData.clinicalSignificance?.trim() || undefined,
        testPreparation: formData.testPreparation?.trim() || undefined,
        whenToTakeTest: formData.whenToTakeTest?.trim() || undefined,
        avoidTestIf: formData.avoidTestIf?.trim() || undefined,
        isFeatured: formData.isFeatured === "1",
        isPopular: formData.isPopular === "1",
        status: formData.status === "1",
        availability: cleanAvailability,
        parameters: formData.type === 'test' ? cleanParameters : undefined,
        tests: formData.type === 'package' ? (formData.tests || []) : undefined,
        faqs: cleanFaqs,
        images: formData.images || [],
        seoMeta: formData.seoMeta?.title || formData.seoMeta?.description || formData.seoMeta?.keywords
          ? {
            title: formData.seoMeta.title?.trim() || undefined,
            description: formData.seoMeta.description?.trim() || undefined,
            keywords: (typeof formData.seoMeta.keywords === 'string' ? formData.seoMeta.keywords : "").split(",").map((k) => k.trim()).filter(Boolean),
          }
          : undefined,
      }

      const url = dialogType === "edit" && selectedRow?._id ? `${baseURL}tests/${selectedRow._id}` : `${baseURL}tests`
      const method = dialogType === "edit" ? axios.put : axios.post
      const response = await method(url, payload)

      if (response?.data?.status === "success" || response?.status < 300) {
        showSuccessToast(response?.data?.message || (dialogType === "edit" ? "Test updated successfully" : "Test created successfully"))
        resetForm()
        onSaveComplete()
      }
    } catch (error) {
      console.error("Save error:", error)
      const serverErrors = error?.response?.data?.error?.details?.errors || {}
      setFormErrors((prev) => ({ ...prev, ...serverErrors }))
      showErrorToast(error?.response?.data?.message || "Operation failed. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }, [dialogType, formData, selectedRow, onSaveComplete, resetForm])

  return {
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    isSaving,
    activeTab,
    setActiveTab,
    tabErrors,
    setTabErrors,
    handleSave,
    resetForm,
  }
}
