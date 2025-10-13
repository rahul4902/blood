"use client"

import { useState } from "react"
import PageHeader from "@/components/page-header"
import MobileNav from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X, FileText } from "lucide-react"
import { useRouter } from "next/navigation"

export default function UploadPrescriptionPage() {
  const router = useRouter()
  const [files, setFiles] = useState([])
  const [notes, setNotes] = useState("")

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFiles((prev) => [...prev, ...selectedFiles])
  }

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle prescription upload logic here
    console.log("Uploading prescription:", { files, notes })
    router.push("/delivery-address")
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Upload Prescription" />

      <main className="max-w-md mx-auto p-4">
        <Card className="border-none shadow-sm mb-4">
          <CardContent className="p-4">
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Upload your prescription</p>
                <p className="text-xs">
                  Upload a clear photo or PDF of your prescription. Our team will review it and suggest the required
                  tests.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="prescription" className="text-base font-semibold mb-3 block">
              Prescription Files
            </Label>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <input
                type="file"
                id="prescription"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="prescription" className="cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <p className="font-medium text-foreground mb-1">Click to upload prescription</p>
                <p className="text-sm text-muted-foreground">Supports: JPG, PNG, PDF (Max 5MB each)</p>
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm flex-1 truncate">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="notes" className="text-base font-semibold mb-3 block">
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any specific instructions or notes about your prescription..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-3">
            <Button type="submit" className="w-full" size="lg" disabled={files.length === 0}>
              Continue
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              size="lg"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>

      <MobileNav />
    </div>
  )
}
