"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  Search,
  Eye,
  Edit,
  Truck,
  Calendar,
  IndianRupee,
  Clock,
  MapPin,
  Phone,
  TestTube,
  Download,
  RefreshCw,
  UserCheck,
  Send,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  FilePlus,
  X,
  AlertCircle,
  Trash2,
} from "lucide-react"
import apiClient from "@/lib/api"

export default function BookingsManagement() {
  const { toast } = useToast()
  const [bookings, setBookings] = useState([])
  const [stats, setStats] = useState(null)
  const [phlebotomists, setPhlebotomists] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)

  const [isBookingSheetOpen, setIsBookingSheetOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isReportSheetOpen, setIsReportSheetOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isSampleDialogOpen, setIsSampleDialogOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedDate, setSelectedDate] = useState("all")
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [selectedPhlebotomist, setSelectedPhlebotomist] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [statusNote, setStatusNote] = useState("")
  const [sampleData, setSampleData] = useState({
    barcodeNumber: "",
    sampleType: "",
    notes: "",
  })
  const [reportFile, setReportFile] = useState(null)
  const [whatsappLoading, setWhatsappLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const params = {
        page: page.toString(),
        limit: "20",
      }

      if (selectedStatus !== "all") params.status = selectedStatus
      if (selectedPaymentStatus !== "all") params.paymentStatus = selectedPaymentStatus
      if (selectedDate !== "all") {
        params.dateFrom = selectedDate
        params.dateTo = selectedDate
      }
      if (searchQuery) params.search = searchQuery

      const response = await apiClient.get("/admin/bookings", { params })

      setBookings(response.data.data.bookings)
      setTotalPages(response.data.data.pagination.totalPages)
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch bookings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await apiClient.get("/admin/bookings/stats")
      setStats(response.data.data)
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const fetchPhlebotomists = async () => {
    try {
      const response = await apiClient.get("/admin/phlebotomists", {
        params: { isActive: true }
      })
      setPhlebotomists(response.data.data)
    } catch (error) {
      console.error("Failed to fetch phlebotomists:", error)
    }
  }

  useEffect(() => {
    fetchBookings()
    fetchStats()
    fetchPhlebotomists()
  }, [page, selectedStatus, selectedPaymentStatus, selectedDate])

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (page === 1) {
        fetchBookings()
      } else {
        setPage(1)
      }
    }, 500)

    return () => clearTimeout(delaySearch)
  }, [searchQuery])

  const handleViewBooking = async (bookingId) => {
    try {
      const response = await apiClient.get(`/admin/bookings/${bookingId}`)
      setSelectedBooking(response.data.data.booking)
      setIsBookingSheetOpen(true)
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch booking details",
        variant: "destructive",
      })
    }
  }

  const handleAssignPhlebotomist = async () => {
    if (!selectedPhlebotomist || !selectedBooking) {
      toast({
        title: "Error",
        description: "Please select a phlebotomist",
        variant: "destructive",
      })
      return
    }

    try {
      await apiClient.post(
        `/admin/bookings/${selectedBooking._id}/assign`,
        { phlebotomistId: selectedPhlebotomist }
      )

      toast({
        title: "Success",
        description: "Phlebotomist assigned successfully",
      })

      setIsAssignDialogOpen(false)
      setSelectedPhlebotomist("")
      fetchBookings()
      if (selectedBooking) handleViewBooking(selectedBooking._id)
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to assign phlebotomist",
        variant: "destructive",
      })
    }
  }

  const handleUnassignPhlebotomist = async () => {
    if (!selectedBooking) {
      toast({
        title: "Error",
        description: "No booking selected",
        variant: "destructive",
      })
      return
    }

    try {
      await apiClient.delete(`/admin/bookings/${selectedBooking._id}/assign`)

      toast({
        title: "Success",
        description: "Phlebotomist unassigned successfully",
      })

      fetchBookings()
      if (selectedBooking) handleViewBooking(selectedBooking._id)
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to unassign phlebotomist",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast({
        title: "Error",
        description: "Please select a status",
        variant: "destructive",
      })
      return
    }

    if (!selectedBooking) {
      toast({
        title: "Error",
        description: "No booking selected",
        variant: "destructive",
      })
      return
    }

    try {
      await apiClient.patch(
        `/admin/bookings/${selectedBooking._id}/status`,
        { status: newStatus, note: statusNote }
      )

      toast({
        title: "Success",
        description: "Booking status updated successfully",
      })

      setIsStatusDialogOpen(false)
      setNewStatus("")
      setStatusNote("")
      fetchBookings()
      fetchStats()
      if (selectedBooking) handleViewBooking(selectedBooking._id)
    } catch (error) {
      console.error("Status update error:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update status",
        variant: "destructive",
      })
    }
  }

  const handleMarkSampleCollected = async () => {
    if (!sampleData.barcodeNumber) {
      toast({
        title: "Error",
        description: "Barcode number is required",
        variant: "destructive",
      })
      return
    }

    if (!selectedBooking) {
      toast({
        title: "Error",
        description: "No booking selected",
        variant: "destructive",
      })
      return
    }

    try {
      await apiClient.patch(
        `/admin/bookings/${selectedBooking._id}/sample-collected`,
        sampleData
      )

      toast({
        title: "Success",
        description: "Sample collection marked successfully",
      })

      setIsSampleDialogOpen(false)
      setSampleData({ barcodeNumber: "", sampleType: "", notes: "" })
      fetchBookings()
      fetchStats()
      if (selectedBooking) handleViewBooking(selectedBooking._id)
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to mark sample collected",
        variant: "destructive",
      })
    }
  }

  const handleUploadReport = async () => {
    if (!reportFile) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
      })
      return
    }

    if (!selectedBooking) {
      toast({
        title: "Error",
        description: "No booking selected",
        variant: "destructive",
      })
      return
    }

    const formData = new FormData()
    formData.append("report", reportFile, reportFile.name)

    try {
      const response = await apiClient.post(
        `/admin/bookings/${selectedBooking._id}/report/upload`,
        formData,
        {
          headers: {},
          timeout: 60000,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            console.log('Upload Progress:', percentCompleted + '%')
          }
        }
      )

      toast({
        title: "Success",
        description: "Report uploaded successfully",
      })

      setIsUploadDialogOpen(false)
      setReportFile(null)

      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ''

      fetchBookings()
      fetchStats()
      if (selectedBooking) handleViewBooking(selectedBooking._id)
    } catch (error) {
      console.error('Upload error:', error)

      toast({
        title: "Upload Failed",
        description: error.response?.data?.message || error.message || "Failed to upload report",
        variant: "destructive",
      })
    }
  }

  const handleDeleteReport = async () => {
    if (!selectedBooking || !selectedBooking.report) {
      toast({
        title: "Error",
        description: "No report to delete",
        variant: "destructive",
      })
      return
    }

    if (!confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      return
    }

    setDeleteLoading(true)
    try {
      await apiClient.delete(`/admin/bookings/${selectedBooking._id}/report`)

      toast({
        title: "Success",
        description: "Report deleted successfully",
      })

      fetchBookings()
      fetchStats()
      if (selectedBooking) handleViewBooking(selectedBooking._id)
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete report",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleShareWhatsApp = async () => {
    if (!selectedBooking || !selectedBooking.report) {
      toast({
        title: "Error",
        description: "No report available",
        variant: "destructive",
      })
      return
    }

    setWhatsappLoading(true)
    try {
      await apiClient.post(
        `/admin/bookings/${selectedBooking._id}/report/share-whatsapp`,
        {
          phoneNumber: selectedBooking.patientPhone,
        }
      )

      toast({
        title: "Success",
        description: "Report shared via WhatsApp successfully",
      })

      if (selectedBooking) handleViewBooking(selectedBooking._id)
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to share report",
        variant: "destructive",
      })
    } finally {
      setWhatsappLoading(false)
    }
  }

  const handleDownloadReport = async () => {
    if (!selectedBooking || !selectedBooking.report) {
      toast({
        title: "Error",
        description: "No report available to download",
        variant: "destructive",
      })
      return
    }

    setDownloadLoading(true)
    try {
      const response = await apiClient.get(
        `/admin/bookings/${selectedBooking._id}/report/download`,
        {
          responseType: "blob",
        }
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `report_${selectedBooking.bookingNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Report downloaded successfully",
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Download Failed",
        description: error.response?.data?.message || "Could not download report. Please check if the report file exists.",
        variant: "destructive",
      })
    } finally {
      setDownloadLoading(false)
    }
  }

  const handleCreateNewReport = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Report generation feature will be available soon",
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-500",
      confirmed: "bg-blue-500",
      assigned: "bg-purple-500",
      "sample-collected": "bg-indigo-500",
      processing: "bg-orange-500",
      "report-ready": "bg-green-500",
      completed: "bg-gray-500",
      cancelled: "bg-red-500",
    }
    return colors[status] || "bg-gray-500"
  }

  return (
    <div className="space-y-3 p-3">
      {/* Header - Ultra Compact */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Bookings & Collections</h1>
          <p className="text-xs text-gray-600">Manage sample collections and track booking status</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchBookings} className="h-7 text-xs">
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats - Ultra Compact */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <Card>
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Total</p>
                  <p className="text-base font-bold">{stats.totalBookings}</p>
                </div>
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Pending</p>
                  <p className="text-base font-bold text-yellow-600">
                    {stats.statusBreakdown["pending"] || 0}
                  </p>
                </div>
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Collected</p>
                  <p className="text-base font-bold text-blue-600">
                    {stats.statusBreakdown["sample-collected"] || 0}
                  </p>
                </div>
                <TestTube className="w-5 h-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Ready</p>
                  <p className="text-base font-bold text-green-600">
                    {stats.statusBreakdown["report-ready"] || 0}
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Revenue</p>
                  <p className="text-base font-bold text-orange-600">₹{stats.todayRevenue.toLocaleString()}</p>
                </div>
                <IndianRupee className="w-5 h-5 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters - Ultra Compact */}
      <Card>
        <CardContent className="p-2">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                <Input
                  placeholder="Search by booking ID, name, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 h-8 text-xs"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-32 h-8 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="sample-collected">Sample Collected</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="report-ready">Report Ready</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
              <SelectTrigger className="w-full md:w-28 h-8 text-xs">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full md:w-32 h-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table - Ultra Compact */}
      <Card>
        <CardHeader className="p-2">
          <CardTitle className="text-sm">All Bookings ({bookings.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs py-1 px-2">Booking</TableHead>
                    <TableHead className="text-xs py-1 px-2">Customer</TableHead>
                    <TableHead className="text-xs py-1 px-2">Tests</TableHead>
                    <TableHead className="text-xs py-1 px-2">Collection</TableHead>
                    <TableHead className="text-xs py-1 px-2">Amount</TableHead>
                    <TableHead className="text-xs py-1 px-2">Status</TableHead>
                    <TableHead className="text-xs py-1 px-2">Assigned</TableHead>
                    <TableHead className="text-xs py-1 px-2">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell className="py-1 px-2">
                        <div>
                          <div className="font-medium text-xs">{booking.bookingNumber}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <div>
                          <div className="font-medium text-xs">{booking.patientName}</div>
                          <div className="text-xs text-gray-500">{booking.patientPhone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <div className="flex flex-wrap gap-0.5">
                          {booking.items.slice(0, 1).map((item, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs py-0 px-1">
                              {item.name}
                            </Badge>
                          ))}
                          {booking.items.length > 1 && (
                            <Badge variant="outline" className="text-xs py-0 px-1">
                              +{booking.items.length - 1}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <div>
                          <div className="text-xs font-medium">{booking.slotDate}</div>
                          <div className="text-xs text-gray-500">{booking.slotTime}</div>
                        </div>
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <div className="font-medium text-xs text-green-600">
                          ₹{booking.pricing.total.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <Badge className={`${getStatusColor(booking.bookingStatus)} text-xs py-0 px-1`}>
                          {booking.bookingStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <div className="text-xs">
                          {booking.assignedTo?.phlebotomistName ? (
                            <span className="text-blue-600">{booking.assignedTo.phlebotomistName}</span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleViewBooking(booking._id)}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-7 text-xs"
              >
                Previous
              </Button>
              <span className="text-xs text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-7 text-xs"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Booking Details Offcanvas - Ultra Compact */}
      <Sheet open={isBookingSheetOpen} onOpenChange={setIsBookingSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0">
          <div className="sticky top-0 bg-white z-10 border-b px-3 py-2">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-sm font-bold">
                  #{selectedBooking?.bookingNumber}
                </SheetTitle>
                <p className="text-xs text-gray-600">
                  {selectedBooking && new Date(selectedBooking.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsBookingSheetOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {selectedBooking && (
            <div className="px-3 py-2">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-3 h-7">
                  <TabsTrigger value="details" className="text-xs py-0">Details</TabsTrigger>
                  <TabsTrigger value="collection" className="text-xs py-0">Collection</TabsTrigger>
                  <TabsTrigger value="report" className="text-xs py-0">Report</TabsTrigger>
                  <TabsTrigger value="timeline" className="text-xs py-0">Timeline</TabsTrigger>
                  <TabsTrigger value="actions" className="text-xs py-0">Actions</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-2">
                  {/* Status Banner - Ultra Compact */}
                  <div className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded border-l-2 border-blue-500">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div>
                        <p className="text-xs text-gray-600">Status</p>
                        <Badge className={`${getStatusColor(selectedBooking.bookingStatus)} text-xs py-0 mt-0.5`}>
                          {selectedBooking.bookingStatus}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Payment</p>
                        <Badge
                          className={`text-xs py-0 mt-0.5 ${selectedBooking.paymentStatus === "success"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                            }`}
                        >
                          {selectedBooking.paymentStatus}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Amount</p>
                        <p className="text-sm font-bold text-green-600">
                          ₹{selectedBooking.pricing.total.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Customer - Ultra Compact */}
                  <Card>
                    <CardHeader className="pb-1 px-2 pt-2">
                      <CardTitle className="text-xs flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        Customer
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-2 pb-2">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                            {selectedBooking.patientName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-xs font-semibold">{selectedBooking.patientName}</h3>
                          <p className="text-xs text-gray-600">{selectedBooking.patientEmail}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs">
                              <Phone className="w-2.5 h-2.5 inline mr-0.5" />
                              {selectedBooking.patientPhone}
                            </span>
                            <span className="text-xs text-gray-500">
                              {selectedBooking.patientAge}Y | {selectedBooking.patientGender}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tests - Ultra Compact */}
                  <Card>
                    <CardHeader className="pb-1 px-2 pt-2">
                      <CardTitle className="text-xs flex items-center">
                        <TestTube className="w-3 h-3 mr-1" />
                        Tests ({selectedBooking.items.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-2 pb-2">
                      <div className="space-y-1">
                        {selectedBooking.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center p-1.5 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium text-xs">{item.name}</p>
                              <Badge variant="outline" className="text-xs py-0 px-1 mt-0.5">
                                {item.type}
                              </Badge>
                            </div>
                            <span className="text-xs font-semibold">
                              ₹{item.price.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-2 pt-2 border-t space-y-0.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span>₹{selectedBooking.pricing.subtotal.toLocaleString()}</span>
                        </div>
                        {selectedBooking.pricing.discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span>-₹{selectedBooking.pricing.discount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-sm pt-1 border-t">
                          <span>Total</span>
                          <span className="text-green-600">₹{selectedBooking.pricing.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Address - Ultra Compact */}
                  <Card>
                    <CardHeader className="pb-1 px-2 pt-2">
                      <CardTitle className="text-xs flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-2 pb-2">
                      <div className="p-1.5 bg-gray-50 rounded text-xs">
                        <p className="font-medium">{selectedBooking.deliveryAddress.address}</p>
                        {selectedBooking.deliveryAddress.landmark && (
                          <p className="text-gray-600 mt-0.5">
                            {selectedBooking.deliveryAddress.landmark}
                          </p>
                        )}
                        <p className="text-gray-600 mt-0.5">
                          {selectedBooking.deliveryAddress.city}, {selectedBooking.deliveryAddress.state} - {selectedBooking.deliveryAddress.pincode}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="collection" className="space-y-2">
                  {/* Schedule - Ultra Compact */}
                  <Card>
                    <CardHeader className="pb-1 px-2 pt-2">
                      <CardTitle className="text-xs flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Schedule
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-2 pb-2">
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="p-1.5 bg-blue-50 rounded">
                          <p className="text-xs text-gray-600">Date</p>
                          <p className="text-sm font-bold text-blue-700">{selectedBooking.slotDate}</p>
                        </div>
                        <div className="p-1.5 bg-purple-50 rounded">
                          <p className="text-xs text-gray-600">Time</p>
                          <p className="text-sm font-bold text-purple-700">{selectedBooking.slotTime}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Phlebotomist - Ultra Compact */}
                  <Card>
                    <CardHeader className="pb-1 px-2 pt-2">
                      <CardTitle className="text-xs flex items-center">
                        <UserCheck className="w-3 h-3 mr-1" />
                        Phlebotomist
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-2 pb-2">
                      {selectedBooking.assignedTo?.phlebotomistName ? (
                        <div className="flex items-center justify-between p-1.5 border border-green-200 bg-green-50 rounded">
                          <div className="flex items-center space-x-1.5">
                            <Avatar className="w-7 h-7 border border-green-500">
                              <AvatarFallback className="bg-green-600 text-white text-xs">
                                {selectedBooking.assignedTo.phlebotomistName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-xs">
                                {selectedBooking.assignedTo.phlebotomistName}
                              </p>
                              <p className="text-xs text-gray-600">
                                {new Date(selectedBooking.assignedTo.assignedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUnassignPhlebotomist}
                            className="border-red-200 text-red-600 hover:bg-red-50 h-6 text-xs px-2"
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1.5">
                            <UserCheck className="w-4 h-4 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-600 mb-2">Not assigned</p>
                          <Button
                            onClick={() => setIsAssignDialogOpen(true)}
                            size="sm"
                            className="w-full h-7 text-xs"
                          >
                            <UserCheck className="w-3 h-3 mr-1" />
                            Assign
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Sample - Ultra Compact */}
                  <Card>
                    <CardHeader className="pb-1 px-2 pt-2">
                      <CardTitle className="text-xs flex items-center">
                        <TestTube className="w-3 h-3 mr-1" />
                        Sample
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-2 pb-2">
                      {selectedBooking.sampleCollection ? (
                        <div className="p-1.5 bg-indigo-50 border border-indigo-200 rounded">
                          <div className="flex items-center mb-1">
                            <CheckCircle className="w-4 h-4 text-indigo-600 mr-1" />
                            <span className="font-semibold text-xs">Collected</span>
                          </div>
                          <div className="space-y-0.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Barcode:</span>
                              <span className="font-mono">{selectedBooking.sampleCollection.barcodeNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Type:</span>
                              <span>{selectedBooking.sampleCollection.sampleType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Time:</span>
                              <span>
                                {new Date(selectedBooking.sampleCollection.collectedAt).toLocaleString()}
                              </span>
                            </div>
                            {selectedBooking.sampleCollection.notes && (
                              <div className="mt-1 pt-1 border-t">
                                <p className="text-gray-600">Notes:</p>
                                <p>{selectedBooking.sampleCollection.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : selectedBooking.assignedTo ? (
                        <div className="text-center py-4">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-1.5">
                            <TestTube className="w-4 h-4 text-yellow-600" />
                          </div>
                          <p className="text-xs text-gray-600 mb-2">Not collected</p>
                          <Button onClick={() => setIsSampleDialogOpen(true)} size="sm" className="w-full h-7 text-xs">
                            <TestTube className="w-3 h-3 mr-1" />
                            Mark Collected
                          </Button>
                        </div>
                      ) : (
                        <p className="text-center text-gray-500 text-xs py-4">Assign phlebotomist first</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="report" className="space-y-2">
                  <Card>
                    <CardHeader className="pb-1 px-2 pt-2">
                      <CardTitle className="text-xs flex items-center">
                        <FileText className="w-3 h-3 mr-1" />
                        Report
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-2 pb-2">
                      {selectedBooking.report && selectedBooking.report.reportId ? (
                        // REPORT EXISTS WITH VALID REPORT ID
                        <div className="space-y-2">
                          <div className="p-2 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-300 rounded">
                            <div className="flex items-start justify-between mb-1.5">
                              <div className="flex items-center">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-1.5">
                                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-xs font-bold text-green-900">Report Available</h3>
                                  <p className="text-xs text-green-700">Ready to share</p>
                                </div>
                              </div>
                              <Badge className="bg-green-600 text-xs py-0 px-1">Active</Badge>
                            </div>

                            <div className="space-y-0.5 bg-white p-1.5 rounded text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Report ID:</span>
                                <span className="font-mono font-semibold">{selectedBooking.report.reportId}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Generated:</span>
                                <span>
                                  {new Date(selectedBooking.report.generatedAt).toLocaleDateString()}
                                </span>
                              </div>
                              {selectedBooking.report.sharedViaWhatsApp && (
                                <div className="flex items-center justify-between pt-0.5 border-t">
                                  <span className="text-gray-600">Status:</span>
                                  <span className="text-green-600 font-semibold flex items-center">
                                    <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                                    Shared
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Button
                              onClick={handleDownloadReport}
                              variant="outline"
                              className="w-full h-7 text-xs"
                              disabled={downloadLoading}
                            >
                              {downloadLoading ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <Download className="w-3 h-3 mr-1" />
                              )}
                              Download
                            </Button>

                            <Button
                              onClick={handleShareWhatsApp}
                              disabled={whatsappLoading}
                              className="w-full h-7 text-xs bg-green-600 hover:bg-green-700"
                            >
                              {whatsappLoading ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <Send className="w-3 h-3 mr-1" />
                              )}
                              Share WhatsApp
                            </Button>

                            <div className="border-t pt-1.5 mt-1.5">
                              <p className="text-xs text-gray-600 mb-1">Manage report:</p>
                              <div className="grid grid-cols-2 gap-1.5">
                                <Button
                                  onClick={() => setIsUploadDialogOpen(true)}
                                  variant="outline"
                                  className="h-6 text-xs"
                                >
                                  <Upload className="w-3 h-3 mr-0.5" />
                                  Replace
                                </Button>
                                <Button
                                  onClick={handleDeleteReport}
                                  disabled={deleteLoading}
                                  variant="outline"
                                  className="h-6 text-xs border-red-200 text-red-600 hover:bg-red-50"
                                >
                                  {deleteLoading ? (
                                    <Loader2 className="w-3 h-3 mr-0.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3 h-3 mr-0.5" />
                                  )}
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // NO REPORT OR NO REPORT ID
                        <div className="space-y-2">
                          <div className="p-3 bg-red-50 border border-red-200 rounded text-center">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-1.5">
                              <XCircle className="w-5 h-5 text-red-500" />
                            </div>
                            <h3 className="font-bold text-xs mb-0.5 text-red-900">Report Not Found</h3>
                            <p className="text-xs text-red-700">
                              No report available for this booking
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <Button
                              onClick={handleCreateNewReport}
                              className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Generate Report
                            </Button>

                            <div className="relative">
                              <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                              </div>
                              <div className="relative flex justify-center text-xs">
                                <span className="bg-white px-2 text-gray-500">or</span>
                              </div>
                            </div>

                            <Button
                              onClick={() => setIsUploadDialogOpen(true)}
                              variant="outline"
                              className="w-full h-8 text-xs"
                            >
                              <Upload className="w-3 h-3 mr-1" />
                              Upload PDF
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5">
                            <div className="p-1.5 bg-blue-50 rounded border border-blue-200">
                              <FilePlus className="w-4 h-4 text-blue-600 mb-0.5" />
                              <p className="text-xs font-semibold text-blue-900">Generate</p>
                              <p className="text-xs text-blue-700">From results</p>
                            </div>
                            <div className="p-1.5 bg-purple-50 rounded border border-purple-200">
                              <Upload className="w-4 h-4 text-purple-600 mb-0.5" />
                              <p className="text-xs font-semibold text-purple-900">Upload</p>
                              <p className="text-xs text-purple-700">Existing file</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-1.5">
                  <Card>
                    <CardHeader className="pb-1 px-2 pt-2">
                      <CardTitle className="text-xs flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-2 pb-2">
                      <div className="space-y-2">
                        {selectedBooking.timeline?.map((entry, idx) => (
                          <div key={idx} className="flex items-start space-x-1.5 relative">
                            {idx !== selectedBooking.timeline.length - 1 && (
                              <div className="absolute left-1 top-4 bottom-0 w-0.5 bg-gray-200"></div>
                            )}
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 z-10 mt-0.5"></div>
                            <div className="flex-1 pb-2">
                              <p className="font-semibold text-xs">{entry.status}</p>
                              <p className="text-xs text-gray-600">{entry.note}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {new Date(entry.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="actions" className="space-y-1.5">
                  <Card>
                    <CardHeader className="pb-1 px-2 pt-2">
                      <CardTitle className="text-xs">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1.5 px-2 pb-2">
                      <Button
                        onClick={() => setIsStatusDialogOpen(true)}
                        variant="outline"
                        className="w-full h-7 justify-start text-xs"
                      >
                        <Edit className="w-3 h-3 mr-1.5" />
                        Update Status
                      </Button>
                      {!selectedBooking.assignedTo && (
                        <Button
                          onClick={() => setIsAssignDialogOpen(true)}
                          variant="outline"
                          className="w-full h-7 justify-start text-xs"
                        >
                          <UserCheck className="w-3 h-3 mr-1.5" />
                          Assign Phlebotomist
                        </Button>
                      )}
                      {selectedBooking.assignedTo && !selectedBooking.sampleCollection && (
                        <Button
                          onClick={() => setIsSampleDialogOpen(true)}
                          variant="outline"
                          className="w-full h-7 justify-start text-xs"
                        >
                          <TestTube className="w-3 h-3 mr-1.5" />
                          Mark Sample Collected
                        </Button>
                      )}
                      {(!selectedBooking.report || !selectedBooking.report.reportId) && (
                        <Button
                          onClick={() => setIsUploadDialogOpen(true)}
                          variant="outline"
                          className="w-full h-7 justify-start text-xs"
                        >
                          <Upload className="w-3 h-3 mr-1.5" />
                          Upload Report
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialogs - Ultra Compact */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Assign Phlebotomist</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Select Phlebotomist</Label>
              <Select value={selectedPhlebotomist} onValueChange={setSelectedPhlebotomist}>
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue placeholder="Choose" />
                </SelectTrigger>
                <SelectContent>
                  {phlebotomists.map((phlebotomist) => (
                    <SelectItem key={phlebotomist._id} value={phlebotomist._id} className="text-xs">
                      {phlebotomist.name} - {phlebotomist.employeeId}
                      {!phlebotomist.isAvailable && " (Unavailable)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)} size="sm" className="text-xs h-7">
              Cancel
            </Button>
            <Button onClick={handleAssignPhlebotomist} disabled={!selectedPhlebotomist} size="sm" className="text-xs h-7">
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Update Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div>
              <Label className="text-xs">New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                  <SelectItem value="confirmed" className="text-xs">Confirmed</SelectItem>
                  <SelectItem value="assigned" className="text-xs">Assigned</SelectItem>
                  <SelectItem value="sample-collected" className="text-xs">Sample Collected</SelectItem>
                  <SelectItem value="processing" className="text-xs">Processing</SelectItem>
                  <SelectItem value="report-ready" className="text-xs">Report Ready</SelectItem>
                  <SelectItem value="completed" className="text-xs">Completed</SelectItem>
                  <SelectItem value="cancelled" className="text-xs">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Note (Optional)</Label>
              <Textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Add note..."
                className="min-h-[50px] text-xs mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)} size="sm" className="text-xs h-7">
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={!newStatus} size="sm" className="text-xs h-7">
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSampleDialogOpen} onOpenChange={setIsSampleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Mark Sample Collected</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Barcode Number</Label>
              <Input
                value={sampleData.barcodeNumber}
                onChange={(e) =>
                  setSampleData({ ...sampleData, barcodeNumber: e.target.value })
                }
                placeholder="Enter barcode"
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Sample Type</Label>
              <Input
                value={sampleData.sampleType}
                onChange={(e) => setSampleData({ ...sampleData, sampleType: e.target.value })}
                placeholder="e.g., Blood"
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea
                value={sampleData.notes}
                onChange={(e) => setSampleData({ ...sampleData, notes: e.target.value })}
                placeholder="Add notes..."
                className="min-h-[50px] text-xs mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSampleDialogOpen(false)} size="sm" className="text-xs h-7">
              Cancel
            </Button>
            <Button onClick={handleMarkSampleCollected} disabled={!sampleData.barcodeNumber} size="sm" className="text-xs h-7">
              Mark Collected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Upload Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div>
              <Label className="text-xs">PDF File (Max 10MB)</Label>
              <Input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  if (file) {
                    if (file.type !== 'application/pdf') {
                      toast({
                        title: "Invalid File",
                        description: "Please select a PDF file",
                        variant: "destructive",
                      })
                      e.target.value = ''
                      return
                    }
                    if (file.size > 10 * 1024 * 1024) {
                      toast({
                        title: "File Too Large",
                        description: "File must be less than 10MB",
                        variant: "destructive",
                      })
                      e.target.value = ''
                      return
                    }
                    setReportFile(file)
                  }
                }}
                className="cursor-pointer h-8 text-xs mt-1"
              />
              {reportFile && (
                <div className="mt-1.5 p-1.5 bg-blue-50 rounded border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-blue-900">
                        {reportFile.name}
                      </p>
                      <p className="text-xs text-blue-600">
                        {(reportFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={() => {
                        setReportFile(null)
                        const fileInput = document.querySelector('input[type="file"]')
                        if (fileInput) fileInput.value = ''
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="p-1.5 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs text-yellow-800">
                Only PDF files up to 10MB allowed
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsUploadDialogOpen(false)
                setReportFile(null)
              }}
              size="sm"
              className="text-xs h-7"
            >
              Cancel
            </Button>
            <Button onClick={handleUploadReport} disabled={!reportFile} size="sm" className="text-xs h-7">
              <Upload className="w-3 h-3 mr-1" />
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
