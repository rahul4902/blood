import MobileHeader from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import PageHeader from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Download, Share2, Eye } from "lucide-react"
import Link from "next/link"

export default function ReportsPage() {
  const reports = [
    {
      id: 1,
      bookingId: "12345",
      name: "Complete Health Checkup",
      date: "15 Jan 2025",
      status: "normal",
      testsCount: 65,
    },
    {
      id: 2,
      bookingId: "12343",
      name: "HbA1c Test",
      date: "05 Jan 2025",
      status: "normal",
      testsCount: 1,
    },
    {
      id: 3,
      bookingId: "12340",
      name: "Thyroid Profile",
      date: "28 Dec 2024",
      status: "abnormal",
      testsCount: 3,
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="My Reports" />

      <main className="max-w-md mx-auto">
        <div className="p-4">

          <div className="space-y-3">
            {reports.map((report) => (
              <Card key={report.id} className="border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{report.name}</h4>
                      <p className="text-xs text-muted-foreground mb-1">Booking #{report.orderId}</p>
                      <p className="text-xs text-muted-foreground">{report.date}</p>
                    </div>
                    <div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          report.status === "normal" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {report.status === "normal" ? "Normal" : "Review"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/report-details?id=${report.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="bg-transparent">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" className="bg-transparent">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
