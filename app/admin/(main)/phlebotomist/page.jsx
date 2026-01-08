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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  Search,
  Eye,
  Edit,
  UserPlus,
  Users,
  UserCheck,
  UserX,
  Clock,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  RefreshCw,
  Download,
  X,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"
import apiClient from "@/lib/api"

export default function PhlebotomistManagement() {
  const { toast } = useToast()
  const [phlebotomists, setPhlebotomists] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedPhlebotomist, setSelectedPhlebotomist] = useState(null)
  
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [filterActive, setFilterActive] = useState("all")
  const [filterAvailable, setFilterAvailable] = useState("all")
  const [filterArea, setFilterArea] = useState("")
  
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    phone: "",
    email: "",
    serviceAreas: []
  })
  
  const [serviceArea, setServiceArea] = useState({
    area: "",
    pincodes: ""
  })

  const fetchPhlebotomists = async () => {
    setLoading(true)
    try {
      const params = {}

      if (filterActive !== "all") params.isActive = filterActive
      if (filterAvailable !== "all") params.isAvailable = filterAvailable
      if (filterArea) params.area = filterArea
      if (searchQuery) params.search = searchQuery

      const response = await apiClient.get("/admin/phlebotomists", { params })

      setPhlebotomists(response.data.data)
      calculateStats(response.data.data)
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch phlebotomists",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data) => {
    const total = data.length
    const active = data.filter(p => p.isActive).length
    const available = data.filter(p => p.isAvailable).length
    const onDuty = data.filter(p => p.currentBookings && p.currentBookings.length > 0).length

    setStats({ total, active, available, onDuty })
  }

  useEffect(() => {
    fetchPhlebotomists()
  }, [filterActive, filterAvailable, filterArea])

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchPhlebotomists()
    }, 500)

    return () => clearTimeout(delaySearch)
  }, [searchQuery])

  const handleViewDetails = (phlebotomist) => {
    setSelectedPhlebotomist(phlebotomist)
    setIsDetailsSheetOpen(true)
  }

  const handleCreatePhlebotomist = async () => {
    if (!formData.name || !formData.employeeId || !formData.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      await apiClient.post("/admin/phlebotomists", formData)

      toast({
        title: "Success",
        description: "Phlebotomist created successfully",
      })

      setIsCreateDialogOpen(false)
      resetForm()
      fetchPhlebotomists()
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create phlebotomist",
        variant: "destructive",
      })
    }
  }

  const handleUpdatePhlebotomist = async () => {
    if (!formData.name || !formData.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      await apiClient.put(`/admin/phlebotomists/${selectedPhlebotomist._id}`, formData)

      toast({
        title: "Success",
        description: "Phlebotomist updated successfully",
      })

      setIsEditDialogOpen(false)
      resetForm()
      fetchPhlebotomists()
      if (selectedPhlebotomist) handleViewDetails({ ...selectedPhlebotomist, ...formData })
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update phlebotomist",
        variant: "destructive",
      })
    }
  }

  const handleDeletePhlebotomist = async () => {
    try {
      await apiClient.delete(`/admin/phlebotomists/${selectedPhlebotomist._id}`)

      toast({
        title: "Success",
        description: "Phlebotomist deleted successfully",
      })

      setIsDeleteDialogOpen(false)
      setIsDetailsSheetOpen(false)
      setSelectedPhlebotomist(null)
      fetchPhlebotomists()
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete phlebotomist",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (phlebotomist) => {
    try {
      await apiClient.put(`/admin/phlebotomists/${phlebotomist._id}`, {
        isActive: !phlebotomist.isActive
      })

      toast({
        title: "Success",
        description: `Phlebotomist ${!phlebotomist.isActive ? 'activated' : 'deactivated'} successfully`,
      })

      fetchPhlebotomists()
      if (selectedPhlebotomist?._id === phlebotomist._id) {
        setSelectedPhlebotomist({ ...phlebotomist, isActive: !phlebotomist.isActive })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update status",
        variant: "destructive",
      })
    }
  }

  const handleToggleAvailable = async (phlebotomist) => {
    try {
      await apiClient.put(`/admin/phlebotomists/${phlebotomist._id}`, {
        isAvailable: !phlebotomist.isAvailable
      })

      toast({
        title: "Success",
        description: `Phlebotomist marked as ${!phlebotomist.isAvailable ? 'available' : 'unavailable'}`,
      })

      fetchPhlebotomists()
      if (selectedPhlebotomist?._id === phlebotomist._id) {
        setSelectedPhlebotomist({ ...phlebotomist, isAvailable: !phlebotomist.isAvailable })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update availability",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (phlebotomist) => {
    setSelectedPhlebotomist(phlebotomist)
    setFormData({
      name: phlebotomist.name,
      employeeId: phlebotomist.employeeId,
      phone: phlebotomist.phone,
      email: phlebotomist.email || "",
      serviceAreas: phlebotomist.serviceAreas || []
    })
    setIsEditDialogOpen(true)
  }

  const addServiceArea = () => {
    if (!serviceArea.area || !serviceArea.pincodes) {
      toast({
        title: "Error",
        description: "Please fill in area and pincodes",
        variant: "destructive",
      })
      return
    }

    const pincodesArray = serviceArea.pincodes.split(",").map(p => p.trim()).filter(p => p)

    setFormData({
      ...formData,
      serviceAreas: [
        ...formData.serviceAreas,
        {
          area: serviceArea.area,
          pincodes: pincodesArray
        }
      ]
    })

    setServiceArea({ area: "", pincodes: "" })
  }

  const removeServiceArea = (index) => {
    setFormData({
      ...formData,
      serviceAreas: formData.serviceAreas.filter((_, i) => i !== index)
    })
  }

  const resetForm = () => {
    setFormData({
      name: "",
      employeeId: "",
      phone: "",
      email: "",
      serviceAreas: []
    })
    setServiceArea({ area: "", pincodes: "" })
  }

  const getStatusColor = (isActive) => {
    return isActive ? "bg-green-500" : "bg-red-500"
  }

  const getAvailabilityColor = (isAvailable) => {
    return isAvailable ? "bg-blue-500" : "bg-gray-500"
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Phlebotomist Management</h1>
          <p className="text-gray-600">Manage phlebotomists and their assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPhlebotomists}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Phlebotomist
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Phlebotomists</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.available}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">On Duty</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.onDuty}</p>
                </div>
                <Briefcase className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, employee ID, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterActive} onValueChange={setFilterActive}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAvailable} onValueChange={setFilterAvailable}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Available</SelectItem>
                <SelectItem value="false">Unavailable</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Filter by area..."
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="w-full md:w-48"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Phlebotomists ({phlebotomists.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phlebotomist</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Service Areas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Current Bookings</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {phlebotomists.map((phlebotomist) => (
                    <TableRow key={phlebotomist._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {phlebotomist.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{phlebotomist.name}</div>
                            <div className="text-sm text-gray-500">{phlebotomist.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{phlebotomist.employeeId}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {phlebotomist.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {phlebotomist.serviceAreas?.slice(0, 2).map((area, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs mr-1">
                              {area.area}
                            </Badge>
                          ))}
                          {phlebotomist.serviceAreas?.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{phlebotomist.serviceAreas.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(phlebotomist.isActive)}>
                          {phlebotomist.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getAvailabilityColor(phlebotomist.isAvailable)}>
                          {phlebotomist.isAvailable ? "Available" : "Unavailable"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {phlebotomist.currentBookings?.length || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(phlebotomist)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(phlebotomist)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Sheet */}
      <Sheet open={isDetailsSheetOpen} onOpenChange={setIsDetailsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
          <div className="sticky top-0 bg-white z-10 border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-xl font-bold">
                  {selectedPhlebotomist?.name}
                </SheetTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Employee ID: {selectedPhlebotomist?.employeeId}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDetailsSheetOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {selectedPhlebotomist && (
            <div className="px-6 py-4 space-y-6">
              {/* Status Banner */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <Badge className={`${getStatusColor(selectedPhlebotomist.isActive)} mt-1`}>
                      {selectedPhlebotomist.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Availability</p>
                    <Badge className={`${getAvailabilityColor(selectedPhlebotomist.isAvailable)} mt-1`}>
                      {selectedPhlebotomist.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600">Current Bookings</p>
                    <p className="text-2xl font-bold text-orange-600 mt-1">
                      {selectedPhlebotomist.currentBookings?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{selectedPhlebotomist.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{selectedPhlebotomist.email || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Employee ID:</span>
                    <Badge variant="outline">{selectedPhlebotomist.employeeId}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Service Areas */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Service Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPhlebotomist.serviceAreas && selectedPhlebotomist.serviceAreas.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPhlebotomist.serviceAreas.map((area, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium text-gray-900">{area.area}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {area.pincodes?.map((pincode, pIdx) => (
                              <Badge key={pIdx} variant="outline" className="text-xs">
                                {pincode}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No service areas assigned</p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => handleToggleActive(selectedPhlebotomist)}
                    variant="outline"
                    className="w-full h-12 justify-start"
                  >
                    {selectedPhlebotomist.isActive ? (
                      <>
                        <UserX className="w-5 h-5 mr-3" />
                        Deactivate Phlebotomist
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-5 h-5 mr-3" />
                        Activate Phlebotomist
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleToggleAvailable(selectedPhlebotomist)}
                    variant="outline"
                    className="w-full h-12 justify-start"
                  >
                    {selectedPhlebotomist.isAvailable ? (
                      <>
                        <XCircle className="w-5 h-5 mr-3" />
                        Mark as Unavailable
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-3" />
                        Mark as Available
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => openEditDialog(selectedPhlebotomist)}
                    variant="outline"
                    className="w-full h-12 justify-start"
                  >
                    <Edit className="w-5 h-5 mr-3" />
                    Edit Details
                  </Button>
                  <Button
                    onClick={() => {
                      setIsDetailsSheetOpen(false)
                      setIsDeleteDialogOpen(true)
                    }}
                    variant="outline"
                    className="w-full h-12 justify-start border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-5 h-5 mr-3" />
                    Delete Phlebotomist
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Phlebotomist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label>Employee ID *</Label>
                <Input
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  placeholder="e.g., EMP001"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <Label className="text-base font-semibold">Service Areas</Label>
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={serviceArea.area}
                    onChange={(e) => setServiceArea({ ...serviceArea, area: e.target.value })}
                    placeholder="Area name"
                  />
                  <Input
                    value={serviceArea.pincodes}
                    onChange={(e) => setServiceArea({ ...serviceArea, pincodes: e.target.value })}
                    placeholder="Pincodes (comma separated)"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addServiceArea}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service Area
                </Button>

                {formData.serviceAreas.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {formData.serviceAreas.map((area, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{area.area}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {area.pincodes.map((pincode, pIdx) => (
                              <Badge key={pIdx} variant="outline" className="text-xs">
                                {pincode}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeServiceArea(idx)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false)
              resetForm()
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreatePhlebotomist}>
              <UserPlus className="w-4 h-4 mr-2" />
              Create Phlebotomist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog - Same structure as Create */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Phlebotomist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label>Employee ID</Label>
                <Input
                  value={formData.employeeId}
                  disabled
                  placeholder="Employee ID (cannot be changed)"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <Label className="text-base font-semibold">Service Areas</Label>
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={serviceArea.area}
                    onChange={(e) => setServiceArea({ ...serviceArea, area: e.target.value })}
                    placeholder="Area name"
                  />
                  <Input
                    value={serviceArea.pincodes}
                    onChange={(e) => setServiceArea({ ...serviceArea, pincodes: e.target.value })}
                    placeholder="Pincodes (comma separated)"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addServiceArea}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service Area
                </Button>

                {formData.serviceAreas.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {formData.serviceAreas.map((area, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{area.area}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {area.pincodes.map((pincode, pIdx) => (
                              <Badge key={pIdx} variant="outline" className="text-xs">
                                {pincode}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeServiceArea(idx)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false)
              resetForm()
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePhlebotomist}>
              <Edit className="w-4 h-4 mr-2" />
              Update Phlebotomist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Phlebotomist</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong>{selectedPhlebotomist?.name}</strong>? 
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeletePhlebotomist}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
