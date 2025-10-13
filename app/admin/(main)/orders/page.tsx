"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"

const mockOrders = [
  {
    id: "HLP001",
    customer: {
      name: "Rajesh Kumar",
      phone: "+91 98765 43210",
      email: "rajesh.kumar@email.com",
    },
    tests: ["Complete Blood Count (CBC)", "Thyroid Function Test"],
    packages: [],
    totalAmount: 848,
    status: "Sample Collected",
    collectionDate: "2024-01-20",
    collectionTime: "10:00 AM - 12:00 PM",
    address: "123 MG Road, Bangalore, Karnataka - 560001",
    assignedTo: "Phlebotomist A",
    createdDate: "2024-01-19",
    patients: ["Rajesh Kumar", "Priya Sharma"],
  },
  {
    id: "HLP002",
    customer: {
      name: "Anita Patel",
      phone: "+91 98765 43211",
      email: "anita.patel@email.com",
    },
    tests: [],
    packages: ["Complete Health Checkup"],
    totalAmount: 999,
    status: "Pending Collection",
    collectionDate: "2024-01-21",
    collectionTime: "8:00 AM - 10:00 AM",
    address: "456 Brigade Road, Bangalore, Karnataka - 560025",
    assignedTo: null,
    createdDate: "2024-01-20",
    patients: ["Anita Patel"],
  },
  {
    id: "HLP003",
    customer: {
      name: "Suresh Gupta",
      phone: "+91 98765 43212",
      email: "suresh.gupta@email.com",
    },
    tests: ["Diabetes Panel"],
    packages: [],
    totalAmount: 399,
    status: "Report Ready",
    collectionDate: "2024-01-18",
    collectionTime: "2:00 PM - 4:00 PM",
    address: "789 Koramangala, Bangalore, Karnataka - 560034",
    assignedTo: "Phlebotomist B",
    createdDate: "2024-01-17",
    patients: ["Suresh Gupta"],
  },
]

const phlebotomists = [
  { id: 1, name: "Phlebotomist A", phone: "+91 99999 11111", area: "Central Bangalore" },
  { id: 2, name: "Phlebotomist B", phone: "+91 99999 22222", area: "South Bangalore" },
  { id: 3, name: "Phlebotomist C", phone: "+91 99999 33333", area: "North Bangalore" },
]

export default function OrdersManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedDate, setSelectedDate] = useState("all")
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.phone.includes(searchQuery)
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus
    const matchesDate = selectedDate === "all" || order.collectionDate === selectedDate
    return matchesSearch && matchesStatus && matchesDate
  })

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order)
    setIsOrderDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending Collection":
        return "bg-yellow-500"
      case "Sample Collected":
        return "bg-blue-500"
      case "Processing":
        return "bg-purple-500"
      case "Report Ready":
        return "bg-green-500"
      case "Completed":
        return "bg-gray-500"
      case "Cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusCount = (status: string) => {
    return mockOrders.filter((order) => order.status === status).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders & Collections</h1>
          <p className="text-gray-600">Manage sample collections and track order status</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{mockOrders.length}</p>
              </div>
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Collection</p>
                <p className="text-2xl font-bold text-yellow-600">{getStatusCount("Pending Collection")}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sample Collected</p>
                <p className="text-2xl font-bold text-blue-600">{getStatusCount("Sample Collected")}</p>
              </div>
              <TestTube className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Report Ready</p>
                <p className="text-2xl font-bold text-green-600">{getStatusCount("Report Ready")}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-orange-600">₹12,450</p>
              </div>
              <IndianRupee className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by order ID, customer name, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending Collection">Pending Collection</SelectItem>
                <SelectItem value="Sample Collected">Sample Collected</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Report Ready">Report Ready</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All Dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="2024-01-21">Today</SelectItem>
                <SelectItem value="2024-01-20">Yesterday</SelectItem>
                <SelectItem value="2024-01-19">2 days ago</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Details</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Tests/Packages</TableHead>
                  <TableHead>Collection</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.id}</div>
                        <div className="text-sm text-gray-500">
                          {order.patients.length} patient(s) • {order.createdDate}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customer.name}</div>
                        <div className="text-sm text-gray-500">{order.customer.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {order.tests.map((test, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs mr-1">
                            {test}
                          </Badge>
                        ))}
                        {order.packages.map((pkg, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs mr-1 bg-green-50 text-green-700">
                            {pkg}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium">{order.collectionDate}</div>
                        <div className="text-xs text-gray-500">{order.collectionTime}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">₹{order.totalAmount}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.assignedTo ? (
                          <span className="text-blue-600">{order.assignedTo}</span>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Order Details</TabsTrigger>
                <TabsTrigger value="collection">Collection Info</TabsTrigger>
                <TabsTrigger value="patients">Patients</TabsTrigger>
                <TabsTrigger value="tracking">Tracking</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {selectedOrder.customer.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{selectedOrder.customer.name}</h3>
                          <p className="text-sm text-gray-600">{selectedOrder.customer.email}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm">{selectedOrder.customer.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm">Ordered: {selectedOrder.createdDate}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Order ID:</span>
                        <span className="font-medium">{selectedOrder.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge className={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span className="font-bold text-green-600">₹{selectedOrder.totalAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Patients:</span>
                        <span className="font-medium">{selectedOrder.patients.length}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tests & Packages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedOrder.tests.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Individual Tests:</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedOrder.tests.map((test: string, idx: number) => (
                              <Badge key={idx} variant="outline">
                                {test}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedOrder.packages.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Packages:</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedOrder.packages.map((pkg: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="bg-green-50 text-green-700">
                                {pkg}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="collection" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Collection Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Collection Date</label>
                        <p className="text-lg font-medium">{selectedOrder.collectionDate}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Time Slot</label>
                        <p className="text-lg font-medium">{selectedOrder.collectionTime}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Collection Address</label>
                      <div className="flex items-start mt-1">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500 mt-1" />
                        <p className="text-sm">{selectedOrder.address}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Assigned Phlebotomist</label>
                      <div className="mt-2">
                        {selectedOrder.assignedTo ? (
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>{selectedOrder.assignedTo[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{selectedOrder.assignedTo}</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-red-600 text-sm">Not assigned yet</p>
                            <Select>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Assign phlebotomist" />
                              </SelectTrigger>
                              <SelectContent>
                                {phlebotomists.map((phlebotomist) => (
                                  <SelectItem key={phlebotomist.id} value={phlebotomist.name}>
                                    {phlebotomist.name} - {phlebotomist.area}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="patients" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Patient Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedOrder.patients.map((patient: string, idx: number) => (
                        <div key={idx} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Avatar>
                            <AvatarFallback>
                              {patient
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{patient}</h4>
                            <p className="text-sm text-gray-600">Patient {idx + 1}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tracking" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Tracking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Order Placed</p>
                          <p className="text-sm text-gray-600">{selectedOrder.createdDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Sample Collection Scheduled</p>
                          <p className="text-sm text-gray-600">{selectedOrder.collectionDate}</p>
                        </div>
                      </div>
                      {selectedOrder.status === "Sample Collected" && (
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Sample Collected</p>
                            <p className="text-sm text-gray-600">Processing in lab</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
