// components/common-card.jsx
"use client"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, FileText } from "lucide-react"

export default function CommonCard({
    item,
    alsoKnownAs = false,
    showAddToCart = true,
    className = ""
}) {
    const [adding, setAdding] = useState(false)

    const handleAddToCart = async (e) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const name = item.highlightedName || item.name
    const discount = item.discount || 0
    const price = item.offer_price
    const mrp = item.mrp
    const parameters = item.parameters ?? item.testsCount ?? 0
    const tat_time = item.tat_time
    const altName = item.altName || item.alias || item.alsoKnownAs
    const matchParam = item.highestMatchingParameter

    return (
        <Card className={`border-none shadow-sm hover:shadow-md transition-shadow mb-3 overflow-hidden ${className}`}>
            <CardContent className="px-4">
                <div className="flex items-start gap-3 min-w-0">
                    <div className="flex-1 min-w-0">
                        <h4
                            className="font-semibold text-sm mb-1 break-words"
                            dangerouslySetInnerHTML={{ __html: name }}
                        />
                        {alsoKnownAs && !!altName && (
                            <p className="text-xs text-muted-foreground mb-1 break-words">
                                Also known as: <span className="font-medium">{altName}</span>
                            </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            {tat_time && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-border bg-muted/50 text-xs font-medium whitespace-nowrap">
                                    <Clock className="w-3 h-3 flex-shrink-0" />
                                    {tat_time}
                                </span>
                            )}
                            {parameters > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-border bg-muted/50 text-xs font-medium whitespace-nowrap">
                                    <FileText className="w-3 h-3 flex-shrink-0" />
                                    {parameters} {item.type === "package" ? "Tests" : "Parameters"}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-lg font-bold text-primary whitespace-nowrap">₹{price}</span>
                            {mrp && (
                                <>
                                    <span className="text-xs text-muted-foreground line-through whitespace-nowrap">
                                        ₹{mrp}
                                    </span>
                                    {discount > 0 && (
                                        <span className="text-xs font-semibold text-green-600 whitespace-nowrap">
                                            {discount}% OFF
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    {showAddToCart && (
                        <Button
                            size="sm"
                            className="self-center flex-shrink-0"
                            onClick={handleAddToCart}
                            disabled={adding}
                        >
                            {adding ? "Adding..." : "Add"}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
