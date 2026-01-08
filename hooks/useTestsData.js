// hooks/useTestsData.js
import { useState, useEffect } from "react"
import { categoryAPI, sampleTypeAPI } from "@/lib/api"

export function useTestsData() {
  const [categoriesDropdownList, setCategoriesDropdownList] = useState([])
  const [sampleTypesDropdown, setSampleTypesDropdown] = useState([])
  const [categoryLoading, setCategoryLoading] = useState(false)
  const [sampleTypeLoading, setSampleTypeLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchSampleTypes()
  }, [])

  const fetchCategories = async () => {
    setCategoryLoading(true)
    try {
      console.log('📦 Fetching categories...')
      
      const response = await categoryAPI.getAll({ all: 1 })
      
      const data = response.data?.categories || response.categories || []
      console.log('✅ Categories loaded:', data.length)
      
      const formatted = (Array.isArray(data) ? data : []).map(cat => ({
        value: cat._id,
        label: cat.name
      }))
      
      setCategoriesDropdownList(formatted)
    } catch (error) {
      console.error('❌ Failed to fetch categories:', error)
      setCategoriesDropdownList([])
    } finally {
      setCategoryLoading(false)
    }
  }

  const fetchSampleTypes = async () => {
    setSampleTypeLoading(true)
    try {
      console.log('🧪 Fetching sample types...')
      
      const response = await sampleTypeAPI.getAll({ all: 1 })
      
      const data = response.data?.data || response.data || []
      console.log('✅ Sample types loaded:', data.length)
      
      const formatted = (Array.isArray(data) ? data : []).map(type => ({
        value: type._id,
        label: type.name
      }))
      
      setSampleTypesDropdown(formatted)
    } catch (error) {
      console.error('❌ Failed to fetch sample types:', error)
      setSampleTypesDropdown([])
    } finally {
      setSampleTypeLoading(false)
    }
  }

  return {
    categoriesDropdownList,
    sampleTypesDropdown,
    categoryLoading,
    sampleTypeLoading,
    refetchCategories: fetchCategories,
    refetchSampleTypes: fetchSampleTypes
  }
}
