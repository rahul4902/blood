import MobileHeader from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Share2, ChevronLeft, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function ReportDetailsPage({ searchParams }) {
  const reportId = searchParams.id || "1"

  const testResults = [
    { name: "Hemoglobin", value: "14.5", unit: "g/dL", range: "12.0 - 16.0", status: "normal" },
    { name: "WBC Count", value: "8500", unit: "/cumm", range: "4000 - 11000", status: "normal" },
    { name: "RBC Count", value: "5.2", unit: "million/cumm", range: "4.5 - 5.5", status: "normal" },
    { name: "Platelet Count", value: "250000", unit: "/cumm", range: "150000 - 450000", status: "normal" },
    { name: "Blood Sugar (Fasting)", value: "95", unit: "mg/dL", range: "70 - 100", status: "normal" },
  ]

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* <MobileHeader userName="Leslie" /> */}
      

      <main className="max-w-md mx-auto">
        <div className="p-4">
          <Link href="/reports" className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <ChevronLeft className="w-4 h-4" />
            Back to Reports
          </Link>

          <div className="mb-4">
            <h1 className="text-xl font-bold mb-2">Complete Health Checkup</h1>
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">Order #12345 • 15 Jan 2025</p>
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">Normal</span>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <Button className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" className="bg-transparent">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          <Card className="border-none shadow-sm mb-4">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Patient Information</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Name</p>
                  <p className="font-medium">Leslie Johnson</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Age/Gender</p>
                  <p className="font-medium">34 / Female</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Sample Collected</p>
                  <p className="font-medium">14 Jan 2025</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Report Date</p>
                  <p className="font-medium">15 Jan 2025</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm mb-4">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Test Results</h3>
              <div className="space-y-3">
                {testResults.map((test, idx) => (
                  <div key={idx} className="pb-3 border-b border-border last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{test.name}</p>
                        <p className="text-xs text-muted-foreground">Reference: {test.range}</p>
                      </div>
                      {test.status === "normal" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-primary">{test.value}</span>
                      <span className="text-xs text-muted-foreground">{test.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-blue-50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 text-sm">Doctor's Note</h3>
              <p className="text-sm text-muted-foreground">
                All test results are within normal range. Continue maintaining a healthy lifestyle. Consult your
                physician for detailed interpretation.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
