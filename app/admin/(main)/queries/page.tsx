"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Eye,
  Reply,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Archive,
} from "lucide-react"

const mockQueries = [
  {
    id: 1,
    name: "Rajesh Kumar",
    email: "rajesh.kumar@email.com",
    phone: "+91 98765 43210",
    subject: "Query about test results",
    message:
      "I haven't received my CBC test results yet. It's been 3 days since sample collection. Can you please check the status?",
    category: "Test Results",
    priority: "High",
    status: "Open",
    createdDate: "2024-01-20",
    lastUpdated: "2024-01-20",
    assignedTo: null,
    responses: [],
  },
  {
    id: 2,
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    phone: "+91 98765 43211",
    subject: "Booking cancellation request",
    message:
      "I need to cancel my health checkup appointment scheduled for tomorrow due to an emergency. Please help me with the cancellation process.",
    category: "Booking",
    priority: "Medium",
    status: "In Progress",
    createdDate: "2024-01-19",
    lastUpdated: "2024-01-20",
    assignedTo: "Support Agent A",
    responses: [
      {
        from: "Support Agent A",
        message:
          "Hi Priya, I understand your situation. I'll help you cancel the appointment. Can you please provide your booking ID?",
        timestamp: "2024-01-20 10:30 AM",
      },
    ],
  },
  {
    id: 3,
    name: "Anita Patel",
    email: "anita.patel@email.com",
    phone: "+91 98765 43212",
    subject: "Home collection timing",
    message:
      "Can you please reschedule my home collection from morning to evening? I won't be available in the morning slot.",
    category: "Collection",
    priority: "Low",
    status: "Resolved",
    createdDate: "2024-01-18",
    lastUpdated: "2024-01-19",
    assignedTo: "Support Agent B",
    responses: [
      {
        from: "Support Agent B",
        message:
          "Hello Anita, I've rescheduled your collection to the evening slot (4:00 PM - 6:00 PM). You'll receive a confirmation SMS shortly.",
        timestamp: "2024-01-19 2:15 PM",
      },
    ],
  },
]

export default function QueriesManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [isQueryDialogOpen, setIsQueryDialogOpen] = useState(false)
  const [selectedQuery, setSelectedQuery] = useState<any>(null)
  const [replyMessage, setReplyMessage] = useState("")

  const filteredQueries = mockQueries.filter((query) => {
    const matchesSearch =
      query.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      query.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      query.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || query.status === selectedStatus
    const matchesCategory = selectedCategory === "all" || query.category === selectedCategory
    const matchesPriority = selectedPriority === "all" || query.priority === selectedPriority
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority
  })

  const handleViewQuery = (query: any) => {
    setSelectedQuery(query)
    setIsQueryDialogOpen(true)
  }

  const handleSendReply = () => {
    if (replyMessage.trim()) {
      console.log("Sending reply:", replyMessage)
      setReplyMessage("")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-red-500"
      case "In Progress":
        return "bg-yellow-500"
      case "Resolved":
        return "bg-green-500"
      case "Closed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700"
      case "Medium":
        return "bg-yellow-100 text-yellow-700"
      case "Low":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusCount = (status: string) => {
    return mockQueries.filter((query) => query.status === status).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Queries</h1>
          <p className="text-gray-600">Manage customer inquiries and support requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Queries</p>
                <p className="text-2xl font-bold">{mockQueries.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Queries</p>
                <p className="text-2xl font-bold text-red-600">{getStatusCount("Open")}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{getStatusCount("In Progress")}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{getStatusCount("Resolved")}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
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
                  placeholder="Search queries by name, email, or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Test Results">Test Results</SelectItem>
                <SelectItem value="Booking">Booking</SelectItem>
                <SelectItem value="Collection">Collection</SelectItem>
                <SelectItem value="Payment">Payment</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Queries Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Queries ({filteredQueries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQueries.map((query) => (
                  <TableRow key={query.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{query.name}</div>
                        <div className="text-sm text-gray-500">{query.email}</div>
                        <div className="text-sm text-gray-500">{query.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="font-medium truncate">{query.subject}</div>
                        <div className="text-sm text-gray-500 truncate">{query.message}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{query.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPriorityColor(query.priority)}>
                        {query.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(query.status)}>{query.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {query.assignedTo ? (
                          <span className="text-blue-600">{query.assignedTo}</span>
                        ) : (
                          <span className="text-gray-400">Unassigned</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{query.createdDate}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewQuery(query)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Reply className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Archive className="w-4 h-4" />
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

      {/* Query Details Dialog */}
      <Dialog open={isQueryDialogOpen} onOpenChange={setIsQueryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Query Details - #{selectedQuery?.id}</DialogTitle>
          </DialogHeader>
          {selectedQuery && (
            <div className="space-y-6">
              {/* Query Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedQuery.name}</h3>
                      <div className="space-y-1 mt-2">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm">{selectedQuery.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm">{selectedQuery.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm">Created: {selectedQuery.createdDate}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Query Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <Badge variant="outline">{selectedQuery.category}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Priority:</span>
                      <Badge variant="outline" className={getPriorityColor(selectedQuery.priority)}>
                        {selectedQuery.priority}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge className={getStatusColor(selectedQuery.status)}>{selectedQuery.status}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Assigned To:</span>
                      <span className="font-medium">
                        {selectedQuery.assignedTo || <span className="text-gray-400">Unassigned</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span className="text-sm">{selectedQuery.lastUpdated}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Original Message */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Original Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">{selectedQuery.subject}</h4>
                    <p className="text-gray-700">{selectedQuery.message}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Conversation History */}
              {selectedQuery.responses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Conversation History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedQuery.responses.map((response: any, idx: number) => (
                        <div key={idx} className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-blue-700">{response.from}</span>
                            <span className="text-sm text-gray-500">{response.timestamp}</span>
                          </div>
                          <p className="text-gray-700">{response.message}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reply Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Send Reply</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Type your reply here..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={4}
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Select>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Change Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Assign To" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agent1">Support Agent A</SelectItem>
                          <SelectItem value="agent2">Support Agent B</SelectItem>
                          <SelectItem value="agent3">Support Agent C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleSendReply} disabled={!replyMessage.trim()}>
                      <Reply className="w-4 h-4 mr-2" />
                      Send Reply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
