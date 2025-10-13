import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye } from "lucide-react"

interface ReportsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const mockReports = [
  {
    id: 1,
    name: "Complete Blood Count (CBC)",
    date: "2024-01-15",
    type: "PDF",
    status: "Ready",
  },
  {
    id: 2,
    name: "Thyroid Function Test",
    date: "2024-01-10",
    type: "PDF",
    status: "Ready",
  },
  {
    id: 3,
    name: "Lipid Profile",
    date: "2024-01-05",
    type: "Image",
    status: "Ready",
  },
  {
    id: 4,
    name: "Diabetes Panel",
    date: "2023-12-28",
    type: "PDF",
    status: "Ready",
  },
]

export function ReportsModal({ open, onOpenChange }: ReportsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Reports & Results</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {mockReports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{report.name}</h3>
                  <p className="text-sm text-gray-500">
                    {report.date} • {report.type} • {report.status}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
