"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Upload,
  ImageIcon,
  Monitor,
  Smartphone,
  Tablet,
  ArrowUp,
  ArrowDown,
} from "lucide-react"

const mockBanners = [
  {
    id: 1,
    title: "Full Body Checkup Offer",
    description: "Get complete health checkup with Vitamin D & B12 at just ₹1499",
    imageUrl: "/placeholder.svg?height=200&width=800",
    linkUrl: "/search?category=health-packages",
    position: "Hero",
    status: "Active",
    displayOrder: 1,
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    clickCount: 1250,
    impressions: 15600,
    deviceType: "All",
    createdDate: "2024-01-15",
  },
  {
    id: 2,
    title: "Diabetes Care Package",
    description: "Comprehensive diabetes monitoring package - 33% OFF",
    imageUrl: "/placeholder.svg?height=200&width=800",
    linkUrl: "/package/diabetes-care",
    position: "Secondary",
    status: "Active",
    displayOrder: 2,
    startDate: "2024-01-10",
    endDate: "2024-01-31",
    clickCount: 890,
    impressions: 12400,
    deviceType: "Desktop",
    createdDate: "2024-01-10",
  },
  {
    id: 3,
    title: "Women's Health Screening",
    description: "Special health package designed for women of all ages",
    imageUrl: "/placeholder.svg?height=200&width=800",
    linkUrl: "/search?category=womens-health",
    position: "Sidebar",
    status: "Inactive",
    displayOrder: 3,
    startDate: "2024-01-05",
    endDate: "2024-01-25",
    clickCount: 456,
    impressions: 8900,
    deviceType: "Mobile",
    createdDate: "2024-01-05",
  },
]

export default function BannersManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPosition, setSelectedPosition] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState<any>(null)

  const [newBanner, setNewBanner] = useState({
    title: "",
    description: "",
    imageUrl: "",
    linkUrl: "",
    position: "",
    status: "Active",
    startDate: "",
    endDate: "",
    deviceType: "All",
  })

  const filteredBanners = mockBanners.filter((banner) => {
    const matchesSearch = banner.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || banner.status === selectedStatus
    const matchesPosition = selectedPosition === "all" || banner.position === selectedPosition
    return matchesSearch && matchesStatus && matchesPosition
  })

  const handleAddBanner = () => {
    console.log("Adding banner:", newBanner)
    setIsAddDialogOpen(false)
    setNewBanner({
      title: "",
      description: "",
      imageUrl: "",
      linkUrl: "",
      position: "",
      status: "Active",
      startDate: "",
      endDate: "",
      deviceType: "All",
    })
  }

  const handleEditBanner = (banner: any) => {
    setSelectedBanner(banner)
    setIsEditDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500"
      case "Inactive":
        return "bg-red-500"
      case "Scheduled":
        return "bg-blue-500"
      case "Expired":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPositionColor = (position: string) => {
    switch (position) {
      case "Hero":
        return "bg-purple-100 text-purple-700"
      case "Secondary":
        return "bg-blue-100 text-blue-700"
      case "Sidebar":
        return "bg-green-100 text-green-700"
      case "Footer":
        return "bg-orange-100 text-orange-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "Desktop":
        return <Monitor className="w-4 h-4" />
      case "Mobile":
        return <Smartphone className="w-4 h-4" />
      case "Tablet":
        return <Tablet className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners & Media</h1>
          <p className="text-gray-600">Manage website banners, promotional content, and media assets</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Banner</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bannerTitle">Banner Title *</Label>
                  <Input
                    id="bannerTitle"
                    value={newBanner.title}
                    onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                    placeholder="Enter banner title"
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position *</Label>
                  <Select
                    value={newBanner.position}
                    onValueChange={(value) => setNewBanner({ ...newBanner, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hero">Hero Section</SelectItem>
                      <SelectItem value="Secondary">Secondary Banner</SelectItem>
                      <SelectItem value="Sidebar">Sidebar</SelectItem>
                      <SelectItem value="Footer">Footer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newBanner.startDate}
                    onChange={(e) => setNewBanner({ ...newBanner, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newBanner.endDate}
                    onChange={(e) => setNewBanner({ ...newBanner, endDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="deviceType">Device Type</Label>
                  <Select
                    value={newBanner.deviceType}
                    onValueChange={(value) => setNewBanner({ ...newBanner, deviceType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Devices</SelectItem>
                      <SelectItem value="Desktop">Desktop Only</SelectItem>
                      <SelectItem value="Mobile">Mobile Only</SelectItem>
                      <SelectItem value="Tablet">Tablet Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newBanner.status}
                    onValueChange={(value) => setNewBanner({ ...newBanner, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newBanner.description}
                  onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })}
                  placeholder="Enter banner description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="linkUrl">Link URL</Label>
                <Input
                  id="linkUrl"
                  value={newBanner.linkUrl}
                  onChange={(e) => setNewBanner({ ...newBanner, linkUrl: e.target.value })}
                  placeholder="Enter destination URL"
                />
              </div>
              <div>
                <Label htmlFor="imageUpload">Banner Image</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  <Input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        // Handle file upload
                        console.log("File selected:", file)
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    className="mt-2 bg-transparent"
                    onClick={() => document.getElementById("imageUpload")?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBanner}>Add Banner</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Banners</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <ImageIcon className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Banners</p>
                <p className="text-2xl font-bold text-green-600">8</p>
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
                <p className="text-sm text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-purple-600">2,596</p>
              </div>
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg CTR</p>
                <p className="text-2xl font-bold text-orange-600">7.2%</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              </div>
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
                  placeholder="Search banners..."
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
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All Positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="Hero">Hero Section</SelectItem>
                <SelectItem value="Secondary">Secondary</SelectItem>
                <SelectItem value="Sidebar">Sidebar</SelectItem>
                <SelectItem value="Footer">Footer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Banners Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Banners ({filteredBanners.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banner</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBanners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img
                          src={banner.imageUrl || "/placeholder.svg"}
                          alt={banner.title}
                          className="w-16 h-10 object-cover rounded border"
                        />
                        <div>
                          <div className="font-medium">{banner.title}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">{banner.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPositionColor(banner.position)}>
                        {banner.position}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getDeviceIcon(banner.deviceType)}
                        <span className="text-sm">{banner.deviceType}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(banner.status)}>{banner.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{banner.clickCount} clicks</div>
                        <div className="text-gray-500">{banner.impressions} views</div>
                        <div className="text-green-600">
                          {((banner.clickCount / banner.impressions) * 100).toFixed(1)}% CTR
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Start: {banner.startDate}</div>
                        {banner.endDate && <div>End: {banner.endDate}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <span className="text-sm">{banner.displayOrder}</span>
                        <Button variant="ghost" size="sm">
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditBanner(banner)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
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
    </div>
  )
}
