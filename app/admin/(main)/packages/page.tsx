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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Plus, Search, Edit, Trash2, Eye, Package, IndianRupee, TestTube, X } from "lucide-react"

const mockPackages = [
  {
    id: 1,
    name: "Complete Health Checkup",
    category: "Health Packages",
    mrp: 1299,
    price: 999,
    discount: 23,
    testsCount: 6,
    tests: ["CBC", "Lipid Profile", "Liver Function", "Kidney Function", "Thyroid", "Diabetes Panel"],
    fastingTime: 12,
    tat_time: "24 hours",
    status: "Active",
    popularity: "High",
    description: "Comprehensive health screening package for overall wellness assessment",
    createdDate: "2024-01-15",
  },
  {
    id: 2,
    name: "Diabetes Care Package",
    category: "Diabetes",
    mrp: 599,
    price: 399,
    discount: 33,
    testsCount: 4,
    tests: ["Fasting Glucose", "HbA1c", "Post Meal Glucose", "Insulin"],
    fastingTime: 8,
    tat_time: "6 hours",
    status: "Active",
    popularity: "High",
    description: "Complete diabetes monitoring and management package",
    createdDate: "2024-01-12",
  },
  {
    id: 3,
    name: "Heart Health Package",
    category: "Heart Health",
    mrp: 899,
    price: 699,
    discount: 22,
    testsCount: 5,
    tests: ["Lipid Profile", "ECG", "Troponin", "CRP", "Homocysteine"],
    fastingTime: 12,
    tat_time: "24 hours",
    status: "Active",
    popularity: "Medium",
    description: "Comprehensive cardiac risk assessment package",
    createdDate: "2024-01-10",
  },
]

const availableTests = [
  { id: 1, name: "Complete Blood Count (CBC)", price: 299, category: "Blood Tests" },
  { id: 2, name: "Thyroid Function Test", price: 549, category: "Hormone Tests" },
  { id: 3, name: "Lipid Profile", price: 399, category: "Heart Health" },
  { id: 4, name: "Liver Function Test", price: 449, category: "Liver Health" },
  { id: 5, name: "Kidney Function Test", price: 399, category: "Kidney Health" },
  { id: 6, name: "Diabetes Panel", price: 399, category: "Diabetes" },
  { id: 7, name: "Vitamin D", price: 899, category: "Vitamins" },
  { id: 8, name: "Vitamin B12", price: 699, category: "Vitamins" },
]

const initialFAQs = [
  {
    id: 1,
    question: "How long does it take to get results?",
    answer: "Results are typically available within 6-24 hours depending on the test complexity.",
  },
  {
    id: 2,
    question: "Is fasting required for this package?",
    answer: "Fasting requirements vary by package. Please check the specific package requirements.",
  },
]

export default function PackagesManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("basic")

  const [newPackage, setNewPackage] = useState({
    name: "",
    category: "",
    mrp: "",
    price: "",
    fastingTime: "",
    tat_time: "",
    description: "",
    selectedTests: [] as number[],
    testPreparation: "",
    whenToTakePackage: "",
    avoidPackageIf: "",
    faqs: [] as any[],
  })

  const [newFAQ, setNewFAQ] = useState({
    question: "",
    answer: "",
  })

  const filteredPackages = mockPackages.filter((pkg) => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || pkg.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || pkg.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleTestSelection = (testId: number) => {
    setNewPackage((prev) => ({
      ...prev,
      selectedTests: prev.selectedTests.includes(testId)
        ? prev.selectedTests.filter((id) => id !== testId)
        : [...prev.selectedTests, testId],
    }))
  }

  const calculateTotalPrice = () => {
    return newPackage.selectedTests.reduce((total, testId) => {
      const test = availableTests.find((t) => t.id === testId)
      return total + (test?.price || 0)
    }, 0)
  }

  const handleAddFAQ = () => {
    if (newFAQ.question && newFAQ.answer) {
      const faq = {
        id: Date.now(),
        ...newFAQ,
      }
      setNewPackage((prev) => ({
        ...prev,
        faqs: [...prev.faqs, faq],
      }))
      setNewFAQ({ question: "", answer: "" })
    }
  }

  const handleRemoveFAQ = (id: number) => {
    setNewPackage((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((f) => f.id !== id),
    }))
  }

  const handleAddPackage = () => {
    console.log("Adding package:", newPackage)
    setIsAddDialogOpen(false)
    setNewPackage({
      name: "",
      category: "",
      mrp: "",
      price: "",
      fastingTime: "",
      tat_time: "",
      description: "",
      selectedTests: [],
      testPreparation: "",
      whenToTakePackage: "",
      avoidPackageIf: "",
      faqs: [],
    })
    setActiveTab("basic")
  }

  const handleEditPackage = (pkg: any) => {
    setSelectedPackage(pkg)
    setIsEditDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500"
      case "Inactive":
        return "bg-red-500"
      case "Draft":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPopularityColor = (popularity: string) => {
    switch (popularity) {
      case "High":
        return "bg-green-100 text-green-700"
      case "Medium":
        return "bg-yellow-100 text-yellow-700"
      case "Low":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Packages Management</h1>
          <p className="text-gray-600">Create and manage test packages with bundled pricing</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create New Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Package</DialogTitle>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="tests">Tests Selection</TabsTrigger>
                <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="packageName">Package Name *</Label>
                      <Input
                        id="packageName"
                        value={newPackage.name}
                        onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                        placeholder="Enter package name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={newPackage.category}
                        onValueChange={(value) => setNewPackage({ ...newPackage, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Health Packages">Health Packages</SelectItem>
                          <SelectItem value="Heart Health">Heart Health</SelectItem>
                          <SelectItem value="Diabetes">Diabetes</SelectItem>
                          <SelectItem value="Women's Health">Women's Health</SelectItem>
                          <SelectItem value="Senior Citizen">Senior Citizen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="fastingTime">Fasting Time (hours)</Label>
                      <Input
                        id="fastingTime"
                        type="number"
                        value={newPackage.fastingTime}
                        onChange={(e) => setNewPackage({ ...newPackage, fastingTime: e.target.value })}
                        placeholder="Enter fasting time"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tat_time">Report Time</Label>
                      <Input
                        id="tat_time"
                        value={newPackage.tat_time}
                        onChange={(e) => setNewPackage({ ...newPackage, tat_time: e.target.value })}
                        placeholder="e.g., 24 hours"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newPackage.description}
                      onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                      placeholder="Enter package description"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Pricing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="mrp">Original Price (₹) *</Label>
                      <Input
                        id="mrp"
                        type="number"
                        value={newPackage.mrp}
                        onChange={(e) => setNewPackage({ ...newPackage, mrp: e.target.value })}
                        placeholder={`Suggested: ₹${calculateTotalPrice()}`}
                      />
                    </div>
                    <div>
                      <Label htmlFor="packagePrice">Package Price (₹) *</Label>
                      <Input
                        id="packagePrice"
                        type="number"
                        value={newPackage.price}
                        onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
                        placeholder="Enter package price"
                      />
                    </div>
                  </div>
                  {newPackage.mrp && newPackage.price && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Package Discount:</span>
                        <span className="text-green-600 font-bold">
                          {Math.round(
                            ((Number(newPackage.mrp) - Number(newPackage.price)) /
                              Number(newPackage.mrp)) *
                              100,
                          )}
                          % OFF
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-600">Customer Saves:</span>
                        <span className="text-green-600 font-medium">
                          ₹{Number(newPackage.mrp) - Number(newPackage.price)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="tests" className="space-y-6">
                {/* Test Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Select Tests</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto border rounded-lg p-4">
                    {availableTests.map((test) => (
                      <div key={test.id} className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50">
                        <Checkbox
                          checked={newPackage.selectedTests.includes(test.id)}
                          onCheckedChange={() => handleTestSelection(test.id)}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{test.name}</div>
                          <div className="text-xs text-gray-500">{test.category}</div>
                        </div>
                        <div className="text-sm font-medium text-green-600">₹{test.price}</div>
                      </div>
                    ))}
                  </div>
                  {newPackage.selectedTests.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Selected Tests: {newPackage.selectedTests.length}</p>
                          <p className="text-sm text-gray-600">Total Individual Price: ₹{calculateTotalPrice()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="guidelines" className="space-y-4">
                <div>
                  <Label htmlFor="testPreparation">Package Preparation</Label>
                  <Textarea
                    id="testPreparation"
                    value={newPackage.testPreparation}
                    onChange={(e) => setNewPackage({ ...newPackage, testPreparation: e.target.value })}
                    placeholder="Enter detailed preparation instructions for this package..."
                    rows={4}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Include fasting requirements, medication restrictions, timing, etc.
                  </p>
                </div>

                <div>
                  <Label htmlFor="whenToTakePackage">When to Take This Package</Label>
                  <Textarea
                    id="whenToTakePackage"
                    value={newPackage.whenToTakePackage}
                    onChange={(e) => setNewPackage({ ...newPackage, whenToTakePackage: e.target.value })}
                    placeholder="Enter conditions or scenarios when this package should be taken..."
                    rows={4}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Include health conditions, age groups, preventive care scenarios, etc.
                  </p>
                </div>

                <div>
                  <Label htmlFor="avoidPackageIf">Avoid This Package If</Label>
                  <Textarea
                    id="avoidPackageIf"
                    value={newPackage.avoidPackageIf}
                    onChange={(e) => setNewPackage({ ...newPackage, avoidPackageIf: e.target.value })}
                    placeholder="Enter contraindications and conditions when package should be avoided..."
                    rows={4}
                  />
                  <p className="text-sm text-gray-500 mt-1">Include medical conditions, medications, pregnancy, etc.</p>
                </div>
              </TabsContent>

              <TabsContent value="faq" className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-4">Add FAQ</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="faqQuestion">Question *</Label>
                      <Input
                        id="faqQuestion"
                        value={newFAQ.question}
                        onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                        placeholder="Enter frequently asked question"
                      />
                    </div>
                    <div>
                      <Label htmlFor="faqAnswer">Answer *</Label>
                      <Textarea
                        id="faqAnswer"
                        value={newFAQ.answer}
                        onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                        placeholder="Enter detailed answer"
                        rows={3}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddFAQ} className="mt-4" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add FAQ
                  </Button>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Package Information FAQ ({newPackage.faqs.length})</h3>
                  <div className="space-y-2">
                    {newPackage.faqs.map((faq) => (
                      <Card key={faq.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{faq.question}</h4>
                              <p className="text-sm text-gray-600 mt-2">{faq.answer}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFAQ(faq.id)}
                              className="text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {newPackage.faqs.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No FAQs added yet</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between pt-4 border-t">
              <div className="flex gap-2">
                {activeTab !== "basic" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const tabs = ["basic", "tests", "guidelines", "faq"]
                      const currentIndex = tabs.indexOf(activeTab)
                      if (currentIndex > 0) {
                        setActiveTab(tabs[currentIndex - 1])
                      }
                    }}
                  >
                    Previous
                  </Button>
                )}
                {activeTab !== "faq" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const tabs = ["basic", "tests", "guidelines", "faq"]
                      const currentIndex = tabs.indexOf(activeTab)
                      if (currentIndex < tabs.length - 1) {
                        setActiveTab(tabs[currentIndex + 1])
                      }
                    }}
                  >
                    Next
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPackage} disabled={newPackage.selectedTests.length === 0}>
                  Create Package
                </Button>
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
                <p className="text-sm text-gray-600">Total Packages</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Packages</p>
                <p className="text-2xl font-bold text-green-600">21</p>
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
                <p className="text-sm text-gray-600">Avg. Tests per Package</p>
                <p className="text-2xl font-bold">5.2</p>
              </div>
              <TestTube className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Discount</p>
                <p className="text-2xl font-bold text-orange-600">28%</p>
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
                  placeholder="Search packages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Health Packages">Health Packages</SelectItem>
                <SelectItem value="Heart Health">Heart Health</SelectItem>
                <SelectItem value="Diabetes">Diabetes</SelectItem>
                <SelectItem value="Women's Health">Women's Health</SelectItem>
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
                <SelectItem value="Draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Packages Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Packages ({filteredPackages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Tests</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Popularity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPackages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pkg.name}</div>
                        <div className="text-sm text-gray-500">
                          {pkg.fastingTime > 0 ? `${pkg.fastingTime}h fasting` : "No fasting"} • {pkg.tat_time}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{pkg.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-green-600">₹{pkg.price}</div>
                        <div className="text-sm text-gray-500 line-through">₹{pkg.mrp}</div>
                        <Badge className="bg-red-500 text-white text-xs">{pkg.discount}% OFF</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {pkg.tests.slice(0, 2).map((test, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {test}
                          </Badge>
                        ))}
                        {pkg.tests.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{pkg.tests.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(pkg.status)}>{pkg.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPopularityColor(pkg.popularity)}>
                        {pkg.popularity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditPackage(pkg)}>
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

      {/* Package Details Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Package Details - {selectedPackage?.name}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="tests" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tests">Tests</TabsTrigger>
              <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
              <TabsTrigger value="info">Information</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            <TabsContent value="tests" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Included Tests ({selectedPackage?.testsCount || 0})</h3>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Test
                </Button>
              </div>
              <div className="space-y-4">
                {selectedPackage?.tests?.map((test, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{test}</h4>
                          <p className="text-sm text-gray-600 mt-1">Individual test from the package</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="guidelines" className="space-y-4">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Package Preparation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      This package requires {selectedPackage?.fastingTime || 0} hours of fasting. Please avoid eating or
                      drinking anything except water for the specified time period. Continue taking your regular
                      medications unless advised otherwise by your doctor.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">When to Take This Package</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      <li>As part of annual health checkup</li>
                      <li>When experiencing multiple health concerns</li>
                      <li>For comprehensive health monitoring</li>
                      <li>Before starting a new health regimen</li>
                      <li>On doctor's recommendation</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Avoid This Package If</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      <li>You have taken similar tests recently</li>
                      <li>You are currently on specific medications that may interfere</li>
                      <li>You have active infections or illness</li>
                      <li>During pregnancy (unless specifically recommended)</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Package Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Category</p>
                      <p className="text-gray-600">{selectedPackage?.category}</p>
                    </div>
                    <div>
                      <p className="font-medium">Report Time</p>
                      <p className="text-gray-600">{selectedPackage?.tat_time}</p>
                    </div>
                    <div>
                      <p className="font-medium">Fasting Required</p>
                      <p className="text-gray-600">
                        {selectedPackage?.fastingTime > 0 ? `${selectedPackage.fastingTime} hours` : "No"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Total Tests</p>
                      <p className="text-gray-600">{selectedPackage?.testsCount}</p>
                    </div>
                    <div>
                      <p className="font-medium">Package Price</p>
                      <p className="text-gray-600">₹{selectedPackage?.price}</p>
                    </div>
                    <div>
                      <p className="font-medium">Discount</p>
                      <p className="text-gray-600">{selectedPackage?.discount}% OFF</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{selectedPackage?.description}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faq" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add FAQ
                </Button>
              </div>

              <Accordion type="single" collapsible className="w-full">
                {initialFAQs.map((faq) => (
                  <AccordionItem key={faq.id} value={`item-${faq.id}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-600">{faq.answer}</p>
                      <div className="flex gap-2 mt-4">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
