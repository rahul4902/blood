// hooks/useTestsFilters.ts
import { useState, useEffect } from "react"

export function useTestsFilters() {
    const [filters, setFilters] = useState({
        category: "__all__",
        sampleType: "__all__",
        status: "__all__",
        typeFilter: "__all__",
        isFeatured: "__all__",
        isPopular: "__all__",
    })

    const updateFilter = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    return { filters, updateFilter }
}
