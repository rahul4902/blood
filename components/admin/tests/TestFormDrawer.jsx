// components/admin/tests/TestFormDrawer.jsx
"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { showSuccessToast, showErrorToast } from "@/lib/toasts"
import axios from "axios"
import { baseURL } from "@/lib/utils"
import { Loader2, AlertCircle } from "lucide-react"
import { useTestsData } from "@/hooks/useTestsData"

// Import tab components
import { BasicDetailTab } from "./tabs/BasicDetailTab"
import { PricingTab } from "./tabs/PricingTab"
import { TestParameterTab } from "./tabs/TestParameterTab"
import { AvailabilityTab } from "./tabs/AvailabilityTab"
import { FaqTab } from "./tabs/FaqTab"
import { QnaTab } from "./tabs/QnaTab"
import { TextCriteriaTab } from "./tabs/TextCriteriaTab"
import { SeoTab } from "./tabs/SeoTab"
import { OtherTab } from "./tabs/OtherTab"

const TABS = [
    { value: "basic", label: "Basic Detail", component: BasicDetailTab },
    { value: "pricing", label: "Pricing", component: PricingTab },
    { value: "parameters", label: "Parameters/Tests", component: TestParameterTab },
    { value: "availability", label: "Availability", component: AvailabilityTab },
    { value: "faq", label: "FAQ", component: FaqTab },
    { value: "qna", label: "QnA", component: QnaTab },
    { value: "text_criteria", label: "Text Criteria", component: TextCriteriaTab },
    { value: "seo", label: "SEO", component: SeoTab },
    { value: "other", label: "Other", component: OtherTab },
]

export function TestFormDrawer({
    isOpen,
    onClose,
    mode = "add",
    initialData = null,
    onSuccess
}) {
    const [activeTab, setActiveTab] = useState("basic")
    const [formData, setFormData] = useState({})
    const [tabErrors, setTabErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    // Fetch dropdown data for categories and sample types
    const { categoriesDropdownList, sampleTypesDropdown } = useTestsData()
    
    // State for available tests (for packages)
    const [availableTests, setAvailableTests] = useState([])

    useEffect(() => {
        const DEFAULTS = {
            type: "test",
            status: true,
            home_collection: true,
            website_display: true,
            isPopular: false,
            isFeatured: false,
            top_packages: false,
            best_package_app: false,
            is_premium: false,
            smart_report_available: false,
            is_document_required: false,
            is_genomics_package: false,

            // primitives
            name: "",
            slug: "",
            code: "",
            description: "",
            also_known_as: "",
            whenToTakeTest: "",
            avoidTestIf: "",
            mrp: undefined,
            package_price: undefined,
            discount: undefined,
            addon_price: undefined,
            offer_price: undefined,
            offerValidTill: undefined,
            phlebo_cost: undefined,
            min_booking_amount_for_phlebo: undefined,
            tat_time: "",
            report_time: "",
            fasting_time: "",

            // nested/arrays
            parameters: [],
            faq: [],
            qna: [],
            text_criteria: [],
            categories: [],
            sampleTypes: [],
            tests: [],
            seoMeta: { title: "", description: "", keywords: [] },
        }

        const normalize = (data) => {
            const d = { ...DEFAULTS, ...(data || {}) }
            // Normalize parameters - ensure they have the correct structure
            d.parameters = Array.isArray(d.parameters) 
                ? d.parameters.map(param => {
                    if (typeof param === 'object' && param !== null) {
                        return {
                            name: param.name || ''
                        }
                    }
                    return { name: param || '' }
                })
                : []
            d.faq = Array.isArray(d.faq) ? d.faq : []
            d.qna = Array.isArray(d.qna) ? d.qna : []
            // Normalize text_criteria - ensure proper structure
            d.text_criteria = Array.isArray(d.text_criteria) 
                ? d.text_criteria.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return {
                            question: item.question || '',
                            answer: {
                                faq: item.answer?.faq || '',
                                list: Array.isArray(item.answer?.list) ? item.answer.list : []
                            }
                        }
                    }
                    return { question: item || '', answer: { faq: '', list: [] } }
                })
                : []
            
            // Normalize categories - extract IDs if they are objects
            d.categories = Array.isArray(d.categories) 
                ? d.categories.map(cat => typeof cat === 'object' ? (cat._id) : cat)
                : []
            
            // Normalize sampleTypes - extract IDs if they are objects
            d.sampleTypes = Array.isArray(d.sampleTypes) 
                ? d.sampleTypes.map(st => typeof st === 'object' ? (st._id) : st)
                : []
            
            // Normalize tests - extract IDs if they are objects
            d.tests = Array.isArray(d.tests) 
                ? d.tests.map(test => typeof test === 'object' ? (test._id || test.id) : test)
                : []
            
            d.seoMeta = d.seoMeta && typeof d.seoMeta === "object" ? { title: "", description: "", keywords: [], ...d.seoMeta } : { title: "", description: "", keywords: [] }
            return d
        }

        if (initialData && isOpen) {
            console.log('Initial data received:', initialData)
            const normalizedData = normalize(initialData)
            console.log('Normalized data:', normalizedData)
            setFormData(normalizedData)
            setActiveTab("basic")
            setTabErrors({})
        } else if (isOpen) {
            setFormData(normalize(null))
            setActiveTab("basic")
            setTabErrors({})
        }
    }, [initialData, isOpen])

    // Fetch available tests for packages
    useEffect(() => {
        const fetchAvailableTests = async () => {
            if (isOpen) {
                try {
                    const response = await axios.get(`${baseURL}tests?type=test&limit=100`)
                    const data = response.data.data?.data || response.data.data || []
                    const formatted = data.map(test => ({
                        value: test._id || test.id,
                        label: test.name || test.title
                    }))
                    setAvailableTests(formatted)
                } catch (error) {
                    console.error('Failed to fetch available tests:', error)
                    setAvailableTests([])
                }
            }
        }
        fetchAvailableTests()
    }, [isOpen])

    const resetForm = () => {
        const DEFAULTS = {
            type: "test",
            status: true,
            home_collection: true,
            website_display: true,
            isPopular: false,
            isFeatured: false,
            top_packages: false,
            best_package_app: false,
            is_premium: false,
            smart_report_available: false,
            is_document_required: false,
            is_genomics_package: false,
            name: "",
            slug: "",
            code: "",
            description: "",
            also_known_as: "",
            whenToTakeTest: "",
            avoidTestIf: "",
            mrp: undefined,
            package_price: undefined,
            discount: undefined,
            addon_price: undefined,
            offer_price: undefined,
            offerValidTill: undefined,
            phlebo_cost: undefined,
            min_booking_amount_for_phlebo: undefined,
            tat_time: "",
            report_time: "",
            fasting_time: "",
            parameters: [],
            faq: [],
            qna: [],
            text_criteria: [],
            categories: [],
            sampleTypes: [],
            tests: [],
            seoMeta: { title: "", description: "", keywords: [] },
        }
        setFormData(DEFAULTS)
        setTabErrors({})
        setActiveTab("basic")
    }

    const updateFormData = (section, data) => {
        setFormData(prev => ({ ...prev, ...data }))
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        setTabErrors({})

        try {
            // Client-side: validate all tabs first
            const allErrs = validateAll()
            if (Object.keys(allErrs).length) {
                setTabErrors(allErrs)
                const firstErrorTab = TABS.find(t => allErrs[t.value])
                if (firstErrorTab) setActiveTab(firstErrorTab.value)
                showErrorToast("Please fix the highlighted errors")
                return
            }

            const url = mode === "edit"
                ? `${baseURL}tests/${initialData._id}`
                : `${baseURL}tests`

            const method = mode === "edit" ? "put" : "post"

            const response = await axios[method](url, formData)

            showSuccessToast(response?.data?.message || `Test ${mode === "edit" ? "updated" : "created"} successfully`)
            onSuccess?.()
            onClose()
            resetForm()
        } catch (error) {
            const backendErrors =
                error?.response?.data?.errors ||
                error?.response?.data?.error?.details?.errors ||
                error?.response?.data?.error?.errors ||
                {}

            const errorsByTab = mapErrorsToTabs(backendErrors)
            setTabErrors(errorsByTab)

            const firstErrorTab = Object.keys(errorsByTab)[0]
            if (firstErrorTab) {
                setActiveTab(firstErrorTab)
            }

            showErrorToast(
                error?.response?.data?.message ||
                error?.response?.data?.error?.message ||
                `Failed to ${mode === "edit" ? "update" : "create"} test`
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    const mapErrorsToTabs = (errors) => {
        const tabErrorMap = {
            basic: ["name", "slug", "code", "type", "description", "also_known_as", "whenToTakeTest", "avoidTestIf"],
            pricing: ["mrp", "package_price", "discount", "addon_price", "offer_price", "offerValidTill", "phlebo_cost", "min_booking_amount_for_phlebo"],
            parameters: ["parameters", "tests"],
            availability: ["package_city_prices", "tat_time", "report_time"],
            faq: ["faq"],
            qna: ["qna"],
            text_criteria: ["text_criteria"],
            seo: ["seoMeta"],
            other: ["recommended_gender", "recommended_age", "age", "illness_or_wellness", "sample_1h_interval_3times", "sample_1h_interval_2times", "sample_2h_interval_1time", "sample_20m_interval_3times", "urine_container_delivery_within_24h", "is_pp_fasting", "fasting_time", "specimen_instructions", "home_collection", "isPopular", "isFeatured", "status", "website_display", "categories", "sampleTypes"],
        }

        const errorsByTab = {}

        Object.keys(errors).forEach(errorKey => {
            for (const [tab, fields] of Object.entries(tabErrorMap)) {
                if (fields.some(field => errorKey.startsWith(field))) {
                    if (!errorsByTab[tab]) {
                        errorsByTab[tab] = {}
                    }
                    errorsByTab[tab][errorKey] = errors[errorKey]
                }
            }
        })

        return errorsByTab
    }

    // Client-side validators
    const validateTab = (tabValue) => {
        const errs = {}
        if (tabValue === "basic") {
            if (!formData.name || String(formData.name).trim() === "") errs.name = "Test name is required"
            if (!formData.slug || String(formData.slug).trim() === "") errs.slug = "Slug is required"
        }
        if (tabValue === "pricing") {
            const hasMrp = formData.mrp !== undefined && formData.mrp !== null && String(formData.mrp) !== ""
            const hasPkg = formData.package_price !== undefined && formData.package_price !== null && String(formData.package_price) !== ""
            if (!hasMrp) errs.mrp = "MRP is required"
            if (!hasPkg) errs.package_price = "Package price is required"
        }
        // You can add more client-side checks for other tabs if needed
        return errs
    }

    const validateAll = () => {
        const aggregate = {}
        for (const t of TABS) {
            const e = validateTab(t.value)
            if (Object.keys(e).length) aggregate[t.value] = e
        }
        return aggregate
    }

    const hasTabError = (tabValue) => {
        return tabErrors[tabValue] && Object.keys(tabErrors[tabValue]).length > 0
    }

    const handleTabChange = (newTab) => {
        const currIndex = TABS.findIndex(t => t.value === activeTab)
        const nextIndex = TABS.findIndex(t => t.value === newTab)
        // Allow going backward freely
        if (nextIndex <= currIndex) {
            setActiveTab(newTab)
            return
        }
        // Validate current tab before moving forward
        const clientErrs = validateTab(activeTab)
        if (Object.keys(clientErrs).length) {
            setTabErrors(prev => ({ ...prev, [activeTab]: clientErrs }))
            return
        }
        // Clear current tab client errors when passing
        setTabErrors(prev => ({ ...prev, [activeTab]: {} }))
        setActiveTab(newTab)
    }



    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl p-0 bg-white dark:bg-gray-900 flex flex-col overflow-hidden"
            >
                {/* Fixed Header */}
                <SheetHeader className="px-6 py-4 border-b dark:border-gray-800 flex-shrink-0">
                    <SheetTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                        {mode === "edit" ? "Edit Test" : "Add New Test"}
                    </SheetTitle>
                </SheetHeader>

                {/* Scrollable Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col h-full">
                        {/* Fixed Tabs Header with Horizontal Scroll */}
                        <div className="flex-shrink-0 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <div className="overflow-x-auto">
                                <TabsList className="inline-flex w-max min-w-full h-12 bg-transparent p-0">
                                    {TABS.map((tab) => (
                                        <TabsTrigger
                                            key={tab.value}
                                            value={tab.value}
                                            className={`
                        relative px-4 py-3 text-sm font-medium whitespace-nowrap
                        data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900
                        data-[state=active]:shadow-sm
                        transition-all duration-200
                        ${hasTabError(tab.value)
                                                    ? "text-red-600 dark:text-red-400 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400"
                                                    : "text-gray-600 dark:text-gray-400 data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400"
                                                }
                      `}
                                        >
                                            {tab.label}
                                            {hasTabError(tab.value) && (
                                                <AlertCircle className="inline-block ml-1 h-4 w-4" />
                                            )}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>
                        </div>

                        {/* Scrollable Tab Content */}
                        <div className="flex-1 overflow-y-auto">
                            {TABS.map((tab) => {
                                const TabComponent = tab.component
                                return (
                                    <TabsContent
                                        key={tab.value}
                                        value={tab.value}
                                        className="mt-0 p-6 focus-visible:outline-none focus-visible:ring-0"
                                    >
                                        <TabComponent
                                            formData={formData}
                                            updateFormData={(data) => updateFormData(tab.value, data)}
                                            errors={tabErrors[tab.value] || {}}
                                            mode={mode}
                                            categoriesDropdownList={categoriesDropdownList}
                                            sampleTypesDropdown={sampleTypesDropdown}
                                            availableTests={availableTests}
                                        />
                                    </TabsContent>
                                )
                            })}
                        </div>
                    </Tabs>
                </div>

                {/* Fixed Footer Actions */}
                <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </Button>

                    <div className="flex gap-3">
                        {activeTab !== TABS[0].value && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    const currentIndex = TABS.findIndex(t => t.value === activeTab)
                                    if (currentIndex > 0) {
                                        setActiveTab(TABS[currentIndex - 1].value)
                                    }
                                }}
                                disabled={isSubmitting}
                                className="border-orange-300 dark:border-orange-600 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                            >
                                Previous
                            </Button>
                        )}

                        {activeTab !== TABS[TABS.length - 1].value ? (
                            <Button
                                type="button"
                                onClick={() => {
                                    const currentIndex = TABS.findIndex(t => t.value === activeTab)
                                    const clientErrs = validateTab(activeTab)
                                    if (Object.keys(clientErrs).length) {
                                        setTabErrors(prev => ({ ...prev, [activeTab]: clientErrs }))
                                        return
                                    }
                                    setTabErrors(prev => ({ ...prev, [activeTab]: {} }))
                                    if (currentIndex < TABS.length - 1) {
                                        setActiveTab(TABS[currentIndex + 1].value)
                                    }
                                }}
                                disabled={isSubmitting}
                                className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white"
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white min-w-[120px]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    mode === "edit" ? "Update Test" : "Create Test"
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
