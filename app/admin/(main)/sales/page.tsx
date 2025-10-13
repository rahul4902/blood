"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Percent,
  Gift,
  IndianRupee,
  TrendingUp,
  Copy,
  Download,
  Users,
  Target,
  BarChart3,
  Zap,
} from "lucide-react"

const mockOffers = [
  {
    id: 1,
    title: "Flash Sale - Complete Health Checkup",
    type: "Flash Sale",
    discountType: "percentage",
    discountValue: 38,
    mrp: 1299,
    salePrice: 799,
    startDate: "2024-01-20T00:00",
    endDate: "2024-01-22T23:59",
    status: "Active",
    usageCount: 156,
    usageLimit: 200,
    applicableTests: ["Complete Health Checkup", "CBC", "Thyroid"],
    applicablePackages: ["Health Package Basic"],
    minOrderValue: 0,
    maxDiscount: 500,
    code: "FLASH38",
    description: "Limited time flash sale on complete health checkup with 38% discount",
    createdDate: "2024-01-19",
    revenue: 124644,
    conversionRate: 12.5,
  },
  {
    id: 2,
    title: "New Year Health Resolution",
    type: "Seasonal",
    discountType: "percentage",
    discountValue: 40,
    mrp: 0,
    salePrice: 0,
    startDate: "2024-01-01T00:00",
    endDate: "2024-01-31T23:59",
    status: "Active",
    usageCount: 89,
    usageLimit: 500,
    applicableTests: [],
    applicablePackages: ["All Packages"],
    minOrderValue: 1000,
    maxDiscount: 800,
    code: "NEWYEAR40",
    description: "New Year special offer on all health packages with up to 40% discount",
    createdDate: "2023-12-28",
    revenue: 89000,
    conversionRate: 8.9,
  },
  {
    id: 3,
    title: "Family Health Package",
    type: "Bundle",
    discountType: "buy_x_get_y",
    discountValue: 1,
    mrp: 0,
    salePrice: 0,
    startDate: "2024-01-15T00:00",
    endDate: "2024-02-15T23:59",
    status: "Active",
    usageCount: 34,
    usageLimit: 100,
    applicableTests: [],
    applicablePackages: ["Family Packages"],
    minOrderValue: 1500,
    maxDiscount: 0,
    code: "FAMILY3",
    description: "Buy 2 Get 1 Free on family health packages for 3 or more family members",
    createdDate: "2024-01-14",
    revenue: 51000,
    conversionRate: 15.2,
  },
]

const mockCoupons = [
  {
    id: 1,
    code: "WELCOME20",
    title: "Welcome Offer",
    discountType: "percentage",
    discountValue: 20,
    minOrderValue: 500,
    maxDiscount: 200,
    usageCount: 245,
    usageLimit: 1000,
    status: "Active",
    validFrom: "2024-01-01",
    validTill: "2024-12-31",
    applicableFor: "New Customers",
    revenue: 49000,
    description: "Welcome discount for new customers on their first order",
  },
  {
    id: 2,
    code: "SAVE100",
    title: "Flat ₹100 Off",
    discountType: "fixed",
    discountValue: 100,
    minOrderValue: 800,
    maxDiscount: 100,
    usageCount: 156,
    usageLimit: 500,
    status: "Active",
    validFrom: "2024-01-15",
    validTill: "2024-02-15",
    applicableFor: "All Customers",
    revenue: 15600,
    description: "Flat ₹100 discount on orders above ₹800",
  },
  {
    id: 3,
    code: "STUDENT15",
    title: "Student Discount",
    discountType: "percentage",
    discountValue: 15,
    minOrderValue: 300,
    maxDiscount: 150,
    usageCount: 78,
    usageLimit: 200,
    status: "Active",
    validFrom: "2024-01-01",
    validTill: "2024-06-30",
    applicableFor: "Students",
    revenue: 11700,
    description: "Special discount for students with valid ID",
  },
]

const availableTests = [
  { id: 1, name: "Complete Blood Count (CBC)", price: 299 },
  { id: 2, name: "Thyroid Function Test", price: 549 },
  { id: 3, name: "Lipid Profile", price: 399 },
  { id: 4, name: "Liver Function Test", price: 449 },
  { id: 5, name: "Kidney Function Test", price: 399 },
  { id: 6, name: "Diabetes Panel", price: 399 },
]

const availablePackages = [
  { id: 1, name: "Complete Health Checkup", price: 1299 },
  { id: 2, name: "Diabetes Care Package", price: 599 },
  { id: 3, name: "Heart Health Package", price: 899 },
  { id: 4, name: "Women's Health Package", price: 1199 },
]

export default function SalesManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false)
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false)
  const [isEditOfferDialogOpen, setIsEditOfferDialogOpen] = useState(false)
  const [isEditCouponDialogOpen, setIsEditCouponDialogOpen] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<any>(null)
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null)

  const [newOffer, setNewOffer] = useState({
    title: "",
    type: "",
    discountType: "",
    discountValue: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    minOrderValue: "",
    maxDiscount: "",
    code: "",
    description: "",
    applicableTests: [] as string[],
    applicablePackages: [] as string[],
  })

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    title: "",
    discountType: "",
    discountValue: "",
    minOrderValue: "",
    maxDiscount: "",
    usageLimit: "",
    validFrom: "",
    validTill: "",
    applicableFor: "",
    description: "",
  })

  const filteredOffers = mockOffers.filter((offer) => {
    const matchesSearch =
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === "all" || offer.type === selectedType
    const matchesStatus = selectedStatus === "all" || offer.status === selectedStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const filteredCoupons = mockCoupons.filter((coupon) => {
    const matchesSearch =
      coupon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || coupon.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const handleAddOffer = () => {
    console.log("Adding offer:", newOffer)
    setIsOfferDialogOpen(false)
    setNewOffer({
      title: "",
      type: "",
      discountType: "",
      discountValue: "",
      startDate: "",
      endDate: "",
      usageLimit: "",
      minOrderValue: "",
      maxDiscount: "",
      code: "",
      description: "",
      applicableTests: [],
      applicablePackages: [],
    })
  }

  const handleAddCoupon = () => {
    console.log("Adding coupon:", newCoupon)
    setIsCouponDialogOpen(false)
    setNewCoupon({
      code: "",
      title: "",
      discountType: "",
      discountValue: "",
      minOrderValue: "",
      maxDiscount: "",
      usageLimit: "",
      validFrom: "",
      validTill: "",
      applicableFor: "",
      description: "",
    })
  }

  const handleEditOffer = (offer: any) => {
    setSelectedOffer(offer)
    setIsEditOfferDialogOpen(true)
  }

  const handleEditCoupon = (coupon: any) => {
    setSelectedCoupon(coupon)
    setIsEditCouponDialogOpen(true)
  }

  const handleUpdateOffer = () => {
    console.log("Updating offer:", selectedOffer)
    setIsEditOfferDialogOpen(false)
    setSelectedOffer(null)
  }

  const handleUpdateCoupon = () => {
    console.log("Updating coupon:", selectedCoupon)
    setIsEditCouponDialogOpen(false)
    setSelectedCoupon(null)
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Flash Sale":
        return "bg-red-100 text-red-700"
      case "Seasonal":
        return "bg-purple-100 text-purple-700"
      case "Bundle":
        return "bg-green-100 text-green-700"
      case "Coupon":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const generateCouponCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setNewCoupon({ ...newCoupon, code })
  }

  const handleTestSelection = (testName: string) => {
    setNewOffer((prev) => ({
      ...prev,
      applicableTests: prev.applicableTests.includes(testName)
        ? prev.applicableTests.filter((t) => t !== testName)
        : [...prev.applicableTests, testName],
    }))
  }

  const handlePackageSelection = (packageName: string) => {
    setNewOffer((prev) => ({
      ...prev,
      applicablePackages: prev.applicablePackages.includes(packageName)
        ? prev.applicablePackages.filter((p) => p !== packageName)
        : [...prev.applicablePackages, packageName],
    }))
  }

  const totalRevenue =
    mockOffers.reduce((sum, offer) => sum + offer.revenue, 0) +
    mockCoupons.reduce((sum, coupon) => sum + coupon.revenue, 0)
  const totalUsage =
    mockOffers.reduce((sum, offer) => sum + offer.usageCount, 0) +
    mockCoupons.reduce((sum, coupon) => sum + coupon.usageCount, 0)
  const avgConversionRate = mockOffers.reduce((sum, offer) => sum + offer.conversionRate, 0) / mockOffers.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales & Promotions</h1>
          <p className="text-gray-600">Manage offers, discounts, and promotional campaigns</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Offers</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockOffers.filter((o) => o.status === "Active").length}
                </p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +2 this week
                </div>
              </div>
              <Gift className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-600">₹{(totalRevenue / 1000).toFixed(0)}K</p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +18.5%
                </div>
              </div>
              <IndianRupee className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold text-purple-600">{totalUsage}</p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <Users className="w-3 h-3 mr-1" />
                  +12.3%
                </div>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-orange-600">{avgConversionRate.toFixed(1)}%</p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +2.1%
                </div>
              </div>
              <Percent className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="offers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="offers">Offers & Sales</TabsTrigger>
          <TabsTrigger value="coupons">Coupon Codes</TabsTrigger>
        </TabsList>

        <TabsContent value="offers" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search offers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Flash Sale">Flash Sale</SelectItem>
                    <SelectItem value="Seasonal">Seasonal</SelectItem>
                    <SelectItem value="Bundle">Bundle</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                  </SelectContent>
                </Select>
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
                <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Offer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Offer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="offerTitle">Offer Title *</Label>
                            <Input
                              id="offerTitle"
                              value={newOffer.title}
                              onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                              placeholder="Enter offer title"
                            />
                          </div>
                          <div>
                            <Label htmlFor="offerType">Offer Type *</Label>
                            <Select
                              value={newOffer.type}
                              onValueChange={(value) => setNewOffer({ ...newOffer, type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Flash Sale">Flash Sale</SelectItem>
                                <SelectItem value="Seasonal">Seasonal</SelectItem>
                                <SelectItem value="Bundle">Bundle</SelectItem>
                                <SelectItem value="Regular">Regular</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="offerCode">Offer Code</Label>
                            <Input
                              id="offerCode"
                              value={newOffer.code}
                              onChange={(e) => setNewOffer({ ...newOffer, code: e.target.value.toUpperCase() })}
                              placeholder="Enter offer code"
                            />
                          </div>
                          <div>
                            <Label htmlFor="usageLimit">Usage Limit</Label>
                            <Input
                              id="usageLimit"
                              type="number"
                              value={newOffer.usageLimit}
                              onChange={(e) => setNewOffer({ ...newOffer, usageLimit: e.target.value })}
                              placeholder="Enter usage limit"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="offerDescription">Description</Label>
                          <Textarea
                            id="offerDescription"
                            value={newOffer.description}
                            onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                            placeholder="Enter offer description"
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* Discount Configuration */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Discount Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="discountType">Discount Type *</Label>
                            <Select
                              value={newOffer.discountType}
                              onValueChange={(value) => setNewOffer({ ...newOffer, discountType: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select discount type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">Percentage</SelectItem>
                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                                <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="discountValue">Discount Value *</Label>
                            <Input
                              id="discountValue"
                              type="number"
                              value={newOffer.discountValue}
                              onChange={(e) => setNewOffer({ ...newOffer, discountValue: e.target.value })}
                              placeholder="Enter discount value"
                            />
                          </div>
                          <div>
                            <Label htmlFor="maxDiscount">Max Discount (₹)</Label>
                            <Input
                              id="maxDiscount"
                              type="number"
                              value={newOffer.maxDiscount}
                              onChange={(e) => setNewOffer({ ...newOffer, maxDiscount: e.target.value })}
                              placeholder="Enter maximum discount"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="minOrderValue">Minimum Order Value (₹)</Label>
                          <Input
                            id="minOrderValue"
                            type="number"
                            value={newOffer.minOrderValue}
                            onChange={(e) => setNewOffer({ ...newOffer, minOrderValue: e.target.value })}
                            placeholder="Enter minimum order value"
                          />
                        </div>
                      </div>

                      {/* Validity Period */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Validity Period</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="startDate">Start Date & Time *</Label>
                            <Input
                              id="startDate"
                              type="datetime-local"
                              value={newOffer.startDate}
                              onChange={(e) => setNewOffer({ ...newOffer, startDate: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="endDate">End Date & Time *</Label>
                            <Input
                              id="endDate"
                              type="datetime-local"
                              value={newOffer.endDate}
                              onChange={(e) => setNewOffer({ ...newOffer, endDate: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Applicable Items */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Applicable Items</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label>Applicable Tests</Label>
                            <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg p-3 space-y-2">
                              {availableTests.map((test) => (
                                <div key={test.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={newOffer.applicableTests.includes(test.name)}
                                    onCheckedChange={() => handleTestSelection(test.name)}
                                  />
                                  <span className="text-sm">{test.name}</span>
                                  <span className="text-xs text-gray-500">₹{test.price}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label>Applicable Packages</Label>
                            <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg p-3 space-y-2">
                              {availablePackages.map((pkg) => (
                                <div key={pkg.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={newOffer.applicablePackages.includes(pkg.name)}
                                    onCheckedChange={() => handlePackageSelection(pkg.name)}
                                  />
                                  <span className="text-sm">{pkg.name}</span>
                                  <span className="text-xs text-gray-500">₹{pkg.price}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsOfferDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddOffer}>Create Offer</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Offers Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Offers ({filteredOffers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Offer Details</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Validity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOffers.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{offer.title}</div>
                            <div className="text-sm text-gray-500">Code: {offer.code}</div>
                            <div className="text-xs text-gray-400 max-w-xs truncate">{offer.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getTypeColor(offer.type)}>
                            {offer.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            {offer.discountType === "percentage" && (
                              <span className="font-medium text-green-600">{offer.discountValue}% OFF</span>
                            )}
                            {offer.discountType === "fixed" && (
                              <span className="font-medium text-green-600">₹{offer.discountValue} OFF</span>
                            )}
                            {offer.discountType === "buy_x_get_y" && (
                              <span className="font-medium text-green-600">Buy 2 Get {offer.discountValue}</span>
                            )}
                            {offer.maxDiscount > 0 && (
                              <div className="text-xs text-gray-500">Max: ₹{offer.maxDiscount}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {offer.usageCount}/{offer.usageLimit}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                              <div
                                className="bg-blue-500 h-1 rounded-full"
                                style={{ width: `${(offer.usageCount / offer.usageLimit) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium text-green-600">₹{(offer.revenue / 1000).toFixed(0)}K</div>
                            <div className="text-gray-500">{offer.conversionRate}% CVR</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{new Date(offer.startDate).toLocaleDateString()}</div>
                            <div className="text-gray-500">to {new Date(offer.endDate).toLocaleDateString()}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(offer.status)}>{offer.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditOffer(offer)}>
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
        </TabsContent>

        <TabsContent value="coupons" className="space-y-6">
          {/* Coupon Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search coupons..."
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
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Coupon
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Coupon</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="couponCode">Coupon Code *</Label>
                          <div className="flex gap-2">
                            <Input
                              id="couponCode"
                              value={newCoupon.code}
                              onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                              placeholder="Enter coupon code"
                            />
                            <Button variant="outline" onClick={generateCouponCode} type="button">
                              <Zap className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="couponTitle">Coupon Title *</Label>
                          <Input
                            id="couponTitle"
                            value={newCoupon.title}
                            onChange={(e) => setNewCoupon({ ...newCoupon, title: e.target.value })}
                            placeholder="Enter coupon title"
                          />
                        </div>
                        <div>
                          <Label htmlFor="couponDiscountType">Discount Type *</Label>
                          <Select
                            value={newCoupon.discountType}
                            onValueChange={(value) => setNewCoupon({ ...newCoupon, discountType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select discount type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Percentage</SelectItem>
                              <SelectItem value="fixed">Fixed Amount</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="couponDiscountValue">Discount Value *</Label>
                          <Input
                            id="couponDiscountValue"
                            type="number"
                            value={newCoupon.discountValue}
                            onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                            placeholder="Enter discount value"
                          />
                        </div>
                        <div>
                          <Label htmlFor="couponMinOrder">Min Order Value (₹)</Label>
                          <Input
                            id="couponMinOrder"
                            type="number"
                            value={newCoupon.minOrderValue}
                            onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: e.target.value })}
                            placeholder="Enter minimum order value"
                          />
                        </div>
                        <div>
                          <Label htmlFor="couponMaxDiscount">Max Discount (₹)</Label>
                          <Input
                            id="couponMaxDiscount"
                            type="number"
                            value={newCoupon.maxDiscount}
                            onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: e.target.value })}
                            placeholder="Enter maximum discount"
                          />
                        </div>
                        <div>
                          <Label htmlFor="couponUsageLimit">Usage Limit</Label>
                          <Input
                            id="couponUsageLimit"
                            type="number"
                            value={newCoupon.usageLimit}
                            onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })}
                            placeholder="Enter usage limit"
                          />
                        </div>
                        <div>
                          <Label htmlFor="couponApplicableFor">Applicable For</Label>
                          <Select
                            value={newCoupon.applicableFor}
                            onValueChange={(value) => setNewCoupon({ ...newCoupon, applicableFor: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select applicable for" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All Customers">All Customers</SelectItem>
                              <SelectItem value="New Customers">New Customers</SelectItem>
                              <SelectItem value="Existing Customers">Existing Customers</SelectItem>
                              <SelectItem value="Students">Students</SelectItem>
                              <SelectItem value="Senior Citizens">Senior Citizens</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="couponValidFrom">Valid From *</Label>
                          <Input
                            id="couponValidFrom"
                            type="date"
                            value={newCoupon.validFrom}
                            onChange={(e) => setNewCoupon({ ...newCoupon, validFrom: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="couponValidTill">Valid Till *</Label>
                          <Input
                            id="couponValidTill"
                            type="date"
                            value={newCoupon.validTill}
                            onChange={(e) => setNewCoupon({ ...newCoupon, validTill: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="couponDescription">Description</Label>
                        <Textarea
                          id="couponDescription"
                          value={newCoupon.description}
                          onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                          placeholder="Enter coupon description"
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsCouponDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddCoupon}>Create Coupon</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Coupons Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Coupons ({filteredCoupons.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Coupon Details</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Validity</TableHead>
                      <TableHead>Applicable For</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCoupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{coupon.title}</div>
                            <div className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                              {coupon.code}
                            </div>
                            <div className="text-xs text-gray-400 max-w-xs truncate mt-1">{coupon.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            {coupon.discountType === "percentage" && (
                              <span className="font-medium text-green-600">{coupon.discountValue}% OFF</span>
                            )}
                            {coupon.discountType === "fixed" && (
                              <span className="font-medium text-green-600">₹{coupon.discountValue} OFF</span>
                            )}
                            <div className="text-xs text-gray-500">
                              Min: ₹{coupon.minOrderValue} | Max: ₹{coupon.maxDiscount}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {coupon.usageCount}/{coupon.usageLimit}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                              <div
                                className="bg-blue-500 h-1 rounded-full"
                                style={{ width: `${(coupon.usageCount / coupon.usageLimit) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium text-green-600">₹{(coupon.revenue / 1000).toFixed(0)}K</div>
                            <div className="text-gray-500">{coupon.usageCount} uses</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{coupon.validFrom}</div>
                            <div className="text-gray-500">to {coupon.validTill}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{coupon.applicableFor}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(coupon.status)}>{coupon.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditCoupon(coupon)}>
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
        </TabsContent>
      </Tabs>

      {/* Edit Offer Dialog */}
      <Dialog open={isEditOfferDialogOpen} onOpenChange={setIsEditOfferDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Offer - {selectedOffer?.title}</DialogTitle>
          </DialogHeader>
          {selectedOffer && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editOfferTitle">Offer Title *</Label>
                    <Input id="editOfferTitle" defaultValue={selectedOffer.title} placeholder="Enter offer title" />
                  </div>
                  <div>
                    <Label htmlFor="editOfferType">Offer Type *</Label>
                    <Select defaultValue={selectedOffer.type}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Flash Sale">Flash Sale</SelectItem>
                        <SelectItem value="Seasonal">Seasonal</SelectItem>
                        <SelectItem value="Bundle">Bundle</SelectItem>
                        <SelectItem value="Regular">Regular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editOfferCode">Offer Code</Label>
                    <Input id="editOfferCode" defaultValue={selectedOffer.code} placeholder="Enter offer code" />
                  </div>
                  <div>
                    <Label htmlFor="editUsageLimit">Usage Limit</Label>
                    <Input
                      id="editUsageLimit"
                      type="number"
                      defaultValue={selectedOffer.usageLimit}
                      placeholder="Enter usage limit"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="editOfferDescription">Description</Label>
                  <Textarea
                    id="editOfferDescription"
                    defaultValue={selectedOffer.description}
                    placeholder="Enter offer description"
                    rows={3}
                  />
                </div>
              </div>

              {/* Discount Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Discount Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="editDiscountType">Discount Type *</Label>
                    <Select defaultValue={selectedOffer.discountType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                        <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editDiscountValue">Discount Value *</Label>
                    <Input
                      id="editDiscountValue"
                      type="number"
                      defaultValue={selectedOffer.discountValue}
                      placeholder="Enter discount value"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editMaxDiscount">Max Discount (₹)</Label>
                    <Input
                      id="editMaxDiscount"
                      type="number"
                      defaultValue={selectedOffer.maxDiscount}
                      placeholder="Enter maximum discount"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="editMinOrderValue">Minimum Order Value (₹)</Label>
                  <Input
                    id="editMinOrderValue"
                    type="number"
                    defaultValue={selectedOffer.minOrderValue}
                    placeholder="Enter minimum order value"
                  />
                </div>
              </div>

              {/* Validity Period */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Validity Period</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editStartDate">Start Date & Time *</Label>
                    <Input id="editStartDate" type="datetime-local" defaultValue={selectedOffer.startDate} />
                  </div>
                  <div>
                    <Label htmlFor="editEndDate">End Date & Time *</Label>
                    <Input id="editEndDate" type="datetime-local" defaultValue={selectedOffer.endDate} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditOfferDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateOffer}>Update Offer</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Coupon Dialog */}
      <Dialog open={isEditCouponDialogOpen} onOpenChange={setIsEditCouponDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Coupon - {selectedCoupon?.title}</DialogTitle>
          </DialogHeader>
          {selectedCoupon && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editCouponCode">Coupon Code *</Label>
                  <Input id="editCouponCode" defaultValue={selectedCoupon.code} placeholder="Enter coupon code" />
                </div>
                <div>
                  <Label htmlFor="editCouponTitle">Coupon Title *</Label>
                  <Input id="editCouponTitle" defaultValue={selectedCoupon.title} placeholder="Enter coupon title" />
                </div>
                <div>
                  <Label htmlFor="editCouponDiscountType">Discount Type *</Label>
                  <Select defaultValue={selectedCoupon.discountType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editCouponDiscountValue">Discount Value *</Label>
                  <Input
                    id="editCouponDiscountValue"
                    type="number"
                    defaultValue={selectedCoupon.discountValue}
                    placeholder="Enter discount value"
                  />
                </div>
                <div>
                  <Label htmlFor="editCouponMinOrder">Min Order Value (₹)</Label>
                  <Input
                    id="editCouponMinOrder"
                    type="number"
                    defaultValue={selectedCoupon.minOrderValue}
                    placeholder="Enter minimum order value"
                  />
                </div>
                <div>
                  <Label htmlFor="editCouponMaxDiscount">Max Discount (₹)</Label>
                  <Input
                    id="editCouponMaxDiscount"
                    type="number"
                    defaultValue={selectedCoupon.maxDiscount}
                    placeholder="Enter maximum discount"
                  />
                </div>
                <div>
                  <Label htmlFor="editCouponUsageLimit">Usage Limit</Label>
                  <Input
                    id="editCouponUsageLimit"
                    type="number"
                    defaultValue={selectedCoupon.usageLimit}
                    placeholder="Enter usage limit"
                  />
                </div>
                <div>
                  <Label htmlFor="editCouponApplicableFor">Applicable For</Label>
                  <Select defaultValue={selectedCoupon.applicableFor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Customers">All Customers</SelectItem>
                      <SelectItem value="New Customers">New Customers</SelectItem>
                      <SelectItem value="Existing Customers">Existing Customers</SelectItem>
                      <SelectItem value="Students">Students</SelectItem>
                      <SelectItem value="Senior Citizens">Senior Citizens</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editCouponValidFrom">Valid From *</Label>
                  <Input id="editCouponValidFrom" type="date" defaultValue={selectedCoupon.validFrom} />
                </div>
                <div>
                  <Label htmlFor="editCouponValidTill">Valid Till *</Label>
                  <Input id="editCouponValidTill" type="date" defaultValue={selectedCoupon.validTill} />
                </div>
              </div>
              <div>
                <Label htmlFor="editCouponDescription">Description</Label>
                <Textarea
                  id="editCouponDescription"
                  defaultValue={selectedCoupon.description}
                  placeholder="Enter coupon description"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditCouponDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateCoupon}>Update Coupon</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
