// lib/validators/testFormValidator.ts
export const validateFormData = (formData) => {
  const errors = {}
  if (!formData.name || formData.name.trim() === "") errors.name = "Name is required"
  if (!Array.isArray(formData.sampleTypes) || formData.sampleTypes.length === 0) errors.sampleTypes = "At least one sample type is required"
  if (!Array.isArray(formData.categories) || formData.categories.length === 0) errors.categories = "At least one category is required"
  if (formData.price === "" || formData.price === null || isNaN(Number(formData.price)) || Number(formData.price) <= 0) errors.price = "Valid price is required"

  if (formData.type === 'package' && (!Array.isArray(formData.tests) || formData.tests.length === 0)) {
    errors.tests = "At least one test must be selected for package"
  }

  return errors
}

export const validateTab = (tab, formData) => {
  const errors = {}

  switch (tab) {
    case "basic":
      if (!formData.name || formData.name.trim() === "") errors.name = "Name is required"
      if (!Array.isArray(formData.categories) || formData.categories.length === 0) errors.categories = "At least one category is required"
      break
    case "pricing":
      if (formData.price === "" || formData.price === null || isNaN(Number(formData.price)) || Number(formData.price) <= 0) errors.price = "Valid price is required"
      break
    case "parameters": {
      const names = (formData.parameters || []).map((p) => String(p?.name || "").trim().toLowerCase()).filter(Boolean)
      const uniq = new Set(names)
      if (names.length !== uniq.size) {
        errors.parameters = "Duplicate parameter names are not allowed"
      }
      break
    }
  }

  return errors
}
