// components/admin/tests/tabs/QnaTab.jsx
"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

export function QnaTab({ formData, updateFormData, errors }) {
    const qnas = formData.qna || []

    const addQna = () => {
        updateFormData({
            qna: [...qnas, { question: "", answer: "" }]
        })
    }

    const removeQna = (index) => {
        const updated = qnas.filter((_, i) => i !== index)
        updateFormData({ qna: updated })
    }

    const updateQna = (index, field, value) => {
        const updated = [...qnas]
        updated[index] = { ...updated[index], [field]: value }
        updateFormData({ qna: updated })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Questions & Answers</h3>
                <Button
                    type="button"
                    onClick={addQna}
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Q&A
                </Button>
            </div>

            {errors.qna && <p className="text-sm text-red-500">{errors.qna}</p>}

            <div className="space-y-4">
                {qnas.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">No Q&As added yet</p>
                        <Button
                            type="button"
                            onClick={addQna}
                            variant="outline"
                            size="sm"
                            className="mt-4"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add First Q&A
                        </Button>
                    </div>
                ) : (
                    qnas.map((qna, index) => (
                        <div
                            key={index}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 space-y-4"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Q&A {index + 1}
                                </span>
                                <Button
                                    type="button"
                                    onClick={() => removeQna(index)}
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
                                        value={qna.question || ""}
                                        onChange={(e) => updateQna(index, "question", e.target.value)}
                                        placeholder="Enter question"
                                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-700 dark:text-gray-300">Answer</Label>
                                    <Textarea
                                        value={qna.answer || ""}
                                        onChange={(e) => updateQna(index, "answer", e.target.value)}
                                        placeholder="Enter answer"
                                        rows={3}
                                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
