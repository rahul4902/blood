"use client"

import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function PageHeader({ title }) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border shadow-sm">
      <div className="flex items-center gap-3 p-4 max-w-md mx-auto">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-muted">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
    </header>
  )
}
