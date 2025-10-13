// components/admin/tests/tabs/TestParameterTab.jsx
"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, X } from "lucide-react"

export function TestParameterTab({ formData, updateFormData, errors, availableTests = [] }) {
    const parameters = formData.parameters || []
    const tests = formData.tests || []
    const isPackage = formData.type === "package"

    const addParameter = () => {
        updateFormData({
            parameters: [...parameters, { name: "" }]
        })
    }

    const removeParameter = (index) => {
        const updated = parameters.filter((_, i) => i !== index)
        updateFormData({ parameters: updated })
    }

    const updateParameter = (index, field, value) => {
        const updated = [...parameters]
        updated[index] = { ...updated[index], [field]: value }
        updateFormData({ parameters: updated })
    }

    const handleTestSelect = (value) => {
        const currentTests = tests || []
        if (currentTests.includes(value)) {
            // Remove if already selected
            updateFormData({ tests: currentTests.filter(item => item !== value) })
        } else {
            // Add if not selected
            updateFormData({ tests: [...currentTests, value] })
        }
    }

    const removeTest = (testId) => {
        const currentTests = tests || []
        updateFormData({ tests: currentTests.filter(item => item !== testId) })
    }

    return (
        <div className="space-y-6">
            {/* Package Tests Section - Only show for package type */}
            {isPackage && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Package Tests</h3>
                    </div>
                    
                    <div className="space-y-2">
                        <Label className="text-gray-700 dark:text-gray-300">
                            Select Tests for Package
                        </Label>
                        <Select onValueChange={handleTestSelect}>
                            <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
                                <SelectValue placeholder="Choose tests to include..." />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                                {availableTests.map((test) => (
                                    <SelectItem 
                                        key={test.value} 
                                        value={test.value}
                                        disabled={tests?.includes(test.value)}
                                    >
                                        {test.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.tests && <p className="text-sm text-red-500 mt-1">{errors.tests}</p>}
                    </div>

                    {/* Selected Tests */}
                    {tests && tests.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-sm text-gray-600 dark:text-gray-400">Selected Tests:</Label>
                            <div className="flex flex-wrap gap-2">
                                {tests.map((testId, index) => {
                                    // Ensure testId is a string
                                    const id = typeof testId === 'object' ? (testId._id || testId.id || testId) : testId
                                    const test = availableTests.find(t => t.value === id)
                                    return (
                                        <Badge key={id || index} variant="secondary" className="flex items-center gap-1">
                                            {test?.label || id || 'Unknown'}
                                            <X 
                                                className="h-3 w-3 cursor-pointer hover:text-red-500" 
                                                onClick={() => removeTest(id)}
                                            />
                                        </Badge>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Test Parameters Section - Only show for test type */}
            {!isPackage && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Test Parameters</h3>
                        <Button
                            type="button"
                            onClick={addParameter}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Parameter
                        </Button>
                    </div>

                    {errors.parameters && <p className="text-sm text-red-500">{errors.parameters}</p>}

                    <div className="space-y-4">
                        {parameters.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                                <p className="text-gray-500 dark:text-gray-400">No parameters added yet</p>
                                <Button
                                    type="button"
                                    onClick={addParameter}
                                    size="sm"
                                    className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white"
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Parameter
                                </Button>
                            </div>
                        ) : (
                            parameters.map((param, index) => (
                                <div
                                    key={index}
                                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 space-y-4"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Parameter {index + 1}
                                        </span>
                                        <Button
                                            type="button"
                                            onClick={() => removeParameter(index)}
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-gray-700 dark:text-gray-300">Parameter Name</Label>
                                        <Input
                                            value={param.name || ""}
                                            onChange={(e) => updateParameter(index, "name", e.target.value)}
                                            placeholder="e.g., Hemoglobin"
                                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
