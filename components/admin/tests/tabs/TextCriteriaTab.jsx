// components/admin/tests/tabs/TextCriteriaTab.jsx
"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

export function TextCriteriaTab({ formData, updateFormData, errors }) {
    const textCriteria = formData.text_criteria || []

    const addTextCriteria = () => {
        updateFormData({
            text_criteria: [...textCriteria, { 
                question: "", 
                answer: { 
                    faq: "", 
                    list: [""] 
                } 
            }]
        })
    }

    const removeTextCriteria = (index) => {
        const updated = textCriteria.filter((_, i) => i !== index)
        updateFormData({ text_criteria: updated })
    }

    const updateTextCriteria = (index, field, value) => {
        const updated = [...textCriteria]
        if (field === 'question') {
            updated[index] = { ...updated[index], [field]: value }
        } else if (field === 'answer_faq') {
            updated[index] = { 
                ...updated[index], 
                answer: { 
                    ...updated[index].answer, 
                    faq: value 
                } 
            }
        } else if (field.startsWith('list_')) {
            const listIndex = parseInt(field.split('_')[1])
            const newList = [...(updated[index].answer?.list || [])]
            newList[listIndex] = value
            updated[index] = { 
                ...updated[index], 
                answer: { 
                    ...updated[index].answer, 
                    list: newList 
                } 
            }
        }
        updateFormData({ text_criteria: updated })
    }

    const addListItem = (criteriaIndex) => {
        const updated = [...textCriteria]
        const currentList = updated[criteriaIndex].answer?.list || []
        updated[criteriaIndex] = {
            ...updated[criteriaIndex],
            answer: {
                ...updated[criteriaIndex].answer,
                list: [...currentList, ""]
            }
        }
        updateFormData({ text_criteria: updated })
    }

    const removeListItem = (criteriaIndex, listIndex) => {
        const updated = [...textCriteria]
        const currentList = updated[criteriaIndex].answer?.list || []
        const newList = currentList.filter((_, i) => i !== listIndex)
        updated[criteriaIndex] = {
            ...updated[criteriaIndex],
            answer: {
                ...updated[criteriaIndex].answer,
                list: newList
            }
        }
        updateFormData({ text_criteria: updated })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Text Criteria</h3>
                <Button
                    type="button"
                    onClick={addTextCriteria}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Text Criteria
                </Button>
            </div>

            {errors.text_criteria && <p className="text-sm text-red-500">{errors.text_criteria}</p>}

            <div className="space-y-4">
                {textCriteria.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">No text criteria added yet</p>
                        <Button
                            type="button"
                            onClick={addTextCriteria}
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Text Criteria
                        </Button>
                    </div>
                ) : (
                    textCriteria.map((criteria, index) => (
                        <div
                            key={index}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 space-y-4"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Text Criteria {index + 1}
                                </span>
                                <Button
                                    type="button"
                                    onClick={() => removeTextCriteria(index)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-700 dark:text-gray-300">Question</Label>
                                    <Input
                                        value={criteria.question || ""}
                                        onChange={(e) => updateTextCriteria(index, "question", e.target.value)}
                                        placeholder="Enter question"
                                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-700 dark:text-gray-300">FAQ Answer</Label>
                                    <Textarea
                                        value={criteria.answer?.faq || ""}
                                        onChange={(e) => updateTextCriteria(index, "answer_faq", e.target.value)}
                                        placeholder="Enter FAQ answer"
                                        rows={3}
                                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-gray-700 dark:text-gray-300">List Items</Label>
                                        <Button
                                            type="button"
                                            onClick={() => addListItem(index)}
                                            size="sm"
                                            variant="outline"
                                            className="text-blue-600 hover:text-blue-700"
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Item
                                        </Button>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {(criteria.answer?.list || []).map((item, itemIndex) => (
                                            <div key={itemIndex} className="flex items-center gap-2">
                                                <Textarea
                                                    value={item || ""}
                                                    onChange={(e) => updateTextCriteria(index, `list_${itemIndex}`, e.target.value)}
                                                    placeholder={`List item ${itemIndex + 1}`}
                                                    rows={2}
                                                    className="flex-1 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={() => removeListItem(index, itemIndex)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        
                                        {(!criteria.answer?.list || criteria.answer.list.length === 0) && (
                                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                                No list items added yet
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
