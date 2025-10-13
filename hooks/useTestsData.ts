// hooks/useTestsData.ts
import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { baseURL } from "@/lib/utils"
import { showErrorToast } from "@/lib/toasts"

interface DropdownItem {
    value: string
    label: string
}

export function useTestsData() {
    const [categoriesDropdownList, setCategoriesDropdownList] = useState<DropdownItem[]>([])
    const [sampleTypesDropdown, setSampleTypesDropdown] = useState<DropdownItem[]>([])
    const [categoryLoading, setCategoryLoading] = useState(false)
    const [sampleTypeLoading, setSampleTypeLoading] = useState(false)

    useEffect(() => {
        fetchCategories()
        fetchSampleTypes()
    }, [])

    const fetchCategories = async () => {
        setCategoryLoading(true)
        try {
            const response = await axios.get(`${baseURL}categories?all=1`)
            const data = response.data.data?.categories;
            const formatted = (Array.isArray(data) ? data : []).map(cat => ({
                value: cat._id,
                label: cat.name
            }))
            setCategoriesDropdownList(formatted)
        } catch (error) {
            console.error('Failed to fetch categories:', error)
            setCategoriesDropdownList([])
        } finally {
            setCategoryLoading(false)
        }
    }

    const fetchSampleTypes = async () => {
        setSampleTypeLoading(true)
        try {
            const response = await axios.get(`${baseURL}sample-types?all=1`)
            const data = response.data.data.data || response.data
            console.log('Raw sample types data:', data)
            // Format the data correctly
            const formatted = (Array.isArray(data) ? data : []).map(type => ({
                value: type._id,
                label: type.name
            }))
            setSampleTypesDropdown(formatted)
        } catch (error) {
            console.error('Failed to fetch sample types:', error)
            setSampleTypesDropdown([])
        } finally {
            setSampleTypeLoading(false)
        }
    }

    return {
        categoriesDropdownList,
        sampleTypesDropdown,
        categoryLoading,
        sampleTypeLoading
    }
}

