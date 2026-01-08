"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import PageHeader from "@/components/page-header"
import MobileNav from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogDescription 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, 
  Plus, 
  Loader2, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  Check,
  LogIn,
  UserPlus,
  Star,
  Edit
} from "lucide-react"
import { familyMemberAPI } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { patientStorage } from "@/lib/localStorage"

export default function PatientDetailsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const { user, logout, loading: authLoading, isAuthenticated } = useAuth()
  
  const [selectedPatient, setSelectedPatient] = useState("")
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [isEditingMember, setIsEditingMember] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState(null)
  const [familyMembers, setFamilyMembers] = useState([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [settingDefaultId, setSettingDefaultId] = useState(null)

  const [newMember, setNewMember] = useState({
    name: "",
    relation: "",
    age: "",
    gender: "",
  })

  const [validationErrors, setValidationErrors] = useState({
    name: "",
    relation: "",
    age: "",
    gender: "",
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (user && isAuthenticated) {
      fetchFamilyMembers()
    }
  }, [user, isAuthenticated])

  useEffect(() => {
    if (familyMembers.length > 0) {
      const preSelectedId = searchParams.get('memberId')
      if (preSelectedId) {
        const member = familyMembers.find(m => m._id === preSelectedId)
        if (member) {
          setSelectedPatient(preSelectedId)
          patientStorage.setSelectedPatientId(preSelectedId)
          return
        }
      }

      const storedPatientId = patientStorage.getSelectedPatientId()
      if (storedPatientId) {
        const member = familyMembers.find(m => m._id === storedPatientId)
        if (member) {
          setSelectedPatient(storedPatientId)
          return
        }
      }

      // Priority: Select default member first
      const defaultMember = familyMembers.find(m => m.isDefault)
      if (defaultMember) {
        setSelectedPatient(defaultMember._id)
        patientStorage.setSelectedPatientId(defaultMember._id)
        return
      }

      // Otherwise select first member
      if (familyMembers[0]) {
        setSelectedPatient(familyMembers[0]._id)
        patientStorage.setSelectedPatientId(familyMembers[0]._id)
      }
    }
  }, [familyMembers, searchParams])

  useEffect(() => {
    if (selectedPatient) {
      patientStorage.setSelectedPatientId(selectedPatient)
    }
  }, [selectedPatient])

  const fetchFamilyMembers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await familyMemberAPI.getAll({
        page: 1,
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
      
      if (response.success) {
        // Sort: Default first, then by creation date
        const sortedMembers = response.data.sort((a, b) => {
          if (a.isDefault && !b.isDefault) return -1
          if (!a.isDefault && b.isDefault) return 1
          return 0
        })
        
        setFamilyMembers(sortedMembers)
        setPagination({
          total: response.total || response.data.length,
          page: response.page || 1,
          totalPages: response.totalPages || 1
        })
      } else {
        setError('Failed to load family members')
      }
    } catch (error) {
      console.error('Error fetching family members:', error)
      
      if (error.response?.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please log in again to continue",
          variant: "destructive",
        })
        logout()
        return
      }
      
      const errorMessage = error.response?.data?.message || 'Failed to load family members. Please try again.'
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors = {
      name: "",
      relation: "",
      age: "",
      gender: "",
    }

    let isValid = true

    if (!newMember.name.trim()) {
      errors.name = "Name is required"
      isValid = false
    } else if (newMember.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters"
      isValid = false
    } else if (newMember.name.trim().length > 100) {
      errors.name = "Name must not exceed 100 characters"
      isValid = false
    }

    if (!newMember.relation) {
      errors.relation = "Please select a relation"
      isValid = false
    }

    if (newMember.relation === 'Self') {
      const existingSelf = familyMembers.find(m => m.relation === 'Self' && m._id !== editingMemberId)
      if (existingSelf) {
        errors.relation = "Self member already exists"
        isValid = false
      }
    }

    if (!newMember.age) {
      errors.age = "Age is required"
      isValid = false
    } else {
      const age = parseInt(newMember.age)
      if (isNaN(age) || age < 0) {
        errors.age = "Age must be a positive number"
        isValid = false
      } else if (age > 150) {
        errors.age = "Age must not exceed 150"
        isValid = false
      }
    }

    if (!newMember.gender) {
      errors.gender = "Please select a gender"
      isValid = false
    }

    setValidationErrors(errors)
    return isValid
  }

  const handleAddMember = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      
      const memberData = {
        name: newMember.name.trim(),
        relation: newMember.relation,
        age: parseInt(newMember.age, 10),
        gender: newMember.gender,
      }
      
      const response = await familyMemberAPI.create(memberData)

      if (response.success) {
        const updatedMembers = [...familyMembers, response.data].sort((a, b) => {
          if (a.isDefault && !b.isDefault) return -1
          if (!a.isDefault && b.isDefault) return 1
          return 0
        })
        
        setFamilyMembers(updatedMembers)
        setSelectedPatient(response.data._id)
        patientStorage.setSelectedPatientId(response.data._id)
        setPagination(prev => ({ ...prev, total: prev.total + 1 }))
        
        setNewMember({ name: "", relation: "", age: "", gender: "" })
        setValidationErrors({ name: "", relation: "", age: "", gender: "" })
        setIsAddingMember(false)

        toast({
          title: "Success",
          description: response.message || "Family member added successfully",
        })
      }
    } catch (error) {
      console.error('Error adding family member:', error)
      
      if (error.response?.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please log in again to continue",
          variant: "destructive",
        })
        logout()
        return
      }
      
      if (error.response?.status === 422) {
        const errorData = error.response.data
        
        if (errorData.errors && typeof errorData.errors === 'object') {
          setValidationErrors(prev => ({ ...prev, ...errorData.errors }))
          toast({
            title: "Validation Error",
            description: errorData.message || "Please check the form for errors",
            variant: "destructive",
          })
          return
        }
      }
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const backendErrors = {}
        error.response.data.errors.forEach(err => {
          if (err.field) {
            backendErrors[err.field] = err.message
          }
        })
        setValidationErrors(prev => ({ ...prev, ...backendErrors }))
        
        toast({
          title: "Validation Error",
          description: "Please check the form for errors",
          variant: "destructive",
        })
        return
      }
      
      const errorMessage = error.response?.data?.message || "Failed to add family member"
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditMember = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      
      const memberData = {
        name: newMember.name.trim(),
        relation: newMember.relation,
        age: parseInt(newMember.age, 10),
        gender: newMember.gender,
      }
      
      const response = await familyMemberAPI.update(editingMemberId, memberData)

      if (response.success) {
        const updatedMembers = familyMembers.map(m => 
          m._id === editingMemberId ? response.data : m
        ).sort((a, b) => {
          if (a.isDefault && !b.isDefault) return -1
          if (!a.isDefault && b.isDefault) return 1
          return 0
        })
        
        setFamilyMembers(updatedMembers)
        
        setNewMember({ name: "", relation: "", age: "", gender: "" })
        setValidationErrors({ name: "", relation: "", age: "", gender: "" })
        setIsEditingMember(false)
        setEditingMemberId(null)

        toast({
          title: "Success",
          description: response.message || "Family member updated successfully",
        })
      }
    } catch (error) {
      console.error('Error updating family member:', error)
      
      if (error.response?.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please log in again to continue",
          variant: "destructive",
        })
        logout()
        return
      }
      
      const errorMessage = error.response?.data?.message || "Failed to update family member"
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteMember = async (id, relation, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!confirm('Are you sure you want to delete this family member?')) {
      return
    }

    try {
      setDeletingId(id)
      
      const response = await familyMemberAPI.delete(id)
      
      if (response.success) {
        setFamilyMembers(familyMembers.filter(m => m._id !== id))
        
        setPagination(prev => ({
          ...prev,
          total: prev.total - 1
        }))
        
        if (selectedPatient === id) {
          const defaultMember = familyMembers.find(m => m.isDefault && m._id !== id)
          const firstMember = familyMembers.find(m => m._id !== id)
          const newSelection = defaultMember?._id || firstMember?._id || ""
          setSelectedPatient(newSelection)
          if (newSelection) {
            patientStorage.setSelectedPatientId(newSelection)
          } else {
            patientStorage.clearSelectedPatientId()
          }
        }

        toast({
          title: "Success",
          description: response.message || "Family member deleted successfully",
        })
      }
    } catch (error) {
      console.error('Error deleting family member:', error)
      
      if (error.response?.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please log in again to continue",
          variant: "destructive",
        })
        logout()
        return
      }
      
      const errorMessage = error.response?.data?.message || "Failed to delete family member"
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleSetDefault = async (id, currentName, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    try {
      setSettingDefaultId(id)
      
      const response = await familyMemberAPI.setDefault(id)
      
      if (response.success) {
        const updatedMembers = familyMembers.map(m => ({
          ...m,
          isDefault: m._id === id
        })).sort((a, b) => {
          if (a.isDefault && !b.isDefault) return -1
          if (!a.isDefault && b.isDefault) return 1
          return 0
        })
        
        setFamilyMembers(updatedMembers)

        toast({
          title: "Success",
          description: `${currentName} set as default family member`,
        })
      }
    } catch (error) {
      console.error('Error setting default:', error)
      
      if (error.response?.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please log in again to continue",
          variant: "destructive",
        })
        logout()
        return
      }
      
      const errorMessage = error.response?.data?.message || "Failed to set as default"
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSettingDefaultId(null)
    }
  }

  const openEditDialog = (member, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    setEditingMemberId(member._id)
    setNewMember({
      name: member.name,
      relation: member.relation,
      age: member.age.toString(),
      gender: member.gender,
    })
    setValidationErrors({ name: "", relation: "", age: "", gender: "" })
    setIsEditingMember(true)
  }

  const handleContinue = () => {
    if (!selectedPatient) {
      toast({
        title: "Selection Required",
        description: "Please select a patient to continue",
        variant: "destructive",
      })
      return
    }

    const selectedMember = familyMembers.find(m => m._id === selectedPatient)
    
    if (selectedMember) {
      const params = new URLSearchParams({
        patientId: selectedPatient,
        patientName: selectedMember.name,
        age: selectedMember.age.toString(),
        gender: selectedMember.gender,
        relation: selectedMember.relation
      })
      
      if (selectedMember.bloodGroup) {
        params.append('bloodGroup', selectedMember.bloodGroup)
      }
      if (selectedMember.email) {
        params.append('email', selectedMember.email)
      }
      
      router.push(`/checkout?${params.toString()}`)
    }
  }

  const handleRetry = () => {
    fetchFamilyMembers()
  }

  const clearForm = () => {
    setNewMember({ name: "", relation: "", age: "", gender: "" })
    setValidationErrors({ name: "", relation: "", age: "", gender: "" })
    setEditingMemberId(null)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Verifying authentication...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <LogIn className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">
              Please log in to manage family members and book tests
            </p>
            <Button 
              onClick={() => {
                const currentPath = window.location.pathname + window.location.search
                router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
              }} 
              className="w-full cursor-pointer"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading family members...</p>
      </div>
    )
  }

  if (error && familyMembers.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <PageHeader title="Patient Details" />
        <main className="max-w-md mx-auto p-4">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={handleRetry} variant="outline" className="w-full cursor-pointer">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </main>
        <MobileNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Patient Details" />

      <main className="max-w-md mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Select Patient
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose who will take the test
            </p>
            {pagination.total > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {pagination.total} member{pagination.total !== 1 ? 's' : ''} available
              </p>
            )}
          </div>
          {familyMembers.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchFamilyMembers}
              disabled={loading}
              className="cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>

        {familyMembers.length === 0 ? (
          <Card className="border-2 border-dashed border-muted-foreground/30">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-base mb-2">No Family Members</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add family members to book tests for them
              </p>
              <Button 
                onClick={() => setIsAddingMember(true)}
                className="cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Member
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <RadioGroup 
              value={selectedPatient} 
              onValueChange={setSelectedPatient}
            >
              {familyMembers.map((member) => (
                <Card 
                  key={member._id} 
                  className={`border-2 transition-all ${
                    selectedPatient === member._id 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-border hover:border-primary/40 hover:shadow-sm'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem 
                        value={member._id} 
                        id={member._id} 
                        className="cursor-pointer shrink-0"
                      />
                      <Label
                        htmlFor={member._id}
                        className="flex-1 min-w-0 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <span className="font-semibold text-base truncate">
                                {member.name}
                              </span>
                              {member.isDefault && (
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" title="Default Member" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {member.relation} • {member.gender}, {member.age} yrs
                            </p>
                            {member.bloodGroup && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Blood: {member.bloodGroup}
                              </p>
                            )}
                          </div>
                        </div>
                      </Label>
                      
                      {/* Action Icons for ALL members */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Set as Default Icon */}
                        {!member.isDefault && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 cursor-pointer hover:bg-amber-50 hover:text-amber-600"
                            disabled={settingDefaultId === member._id}
                            onClick={(e) => handleSetDefault(member._id, member.name, e)}
                            title="Set as Default"
                          >
                            {settingDefaultId === member._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Star className="w-4 h-4" />
                            )}
                          </Button>
                        )}

                        {/* Edit Icon */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                          onClick={(e) => openEditDialog(member, e)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        {/* Delete Icon */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                          disabled={deletingId === member._id}
                          onClick={(e) => handleDeleteMember(member._id, member.relation, e)}
                          title="Delete"
                        >
                          {deletingId === member._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </RadioGroup>

            {selectedPatient && (
              <Alert className="bg-primary/5 border-primary/30">
                <Check className="h-4 w-4 text-primary" />
                <AlertDescription className="text-sm">
                  <span className="font-medium">Selected:</span>{' '}
                  {familyMembers.find(m => m._id === selectedPatient)?.name}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <Dialog 
          open={isAddingMember || isEditingMember}
          onOpenChange={(open) => {
            if (!open) {
              setIsAddingMember(false)
              setIsEditingMember(false)
              clearForm()
            }
          }}
        >
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full cursor-pointer hover:bg-primary/5 hover:border-primary" 
              size="lg"
              onClick={() => setIsAddingMember(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Family Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95%] sm:max-w-[425px] rounded-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditingMember ? 'Edit Family Member' : 'Add Family Member'}
              </DialogTitle>
              <DialogDescription>
                {isEditingMember 
                  ? 'Update the details of this family member'
                  : 'Fill in the details to add a new family member'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={newMember.name}
                  onChange={(e) => {
                    setNewMember({ ...newMember, name: e.target.value })
                    if (validationErrors.name) {
                      setValidationErrors({ ...validationErrors, name: "" })
                    }
                  }}
                  disabled={submitting}
                  className={`w-full ${validationErrors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {validationErrors.name && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="relation" className="text-sm font-medium">
                    Relation <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={newMember.relation}
                    onValueChange={(value) => {
                      setNewMember({ ...newMember, relation: value })
                      if (validationErrors.relation) {
                        setValidationErrors({ ...validationErrors, relation: "" })
                      }
                    }}
                    disabled={submitting}
                  >
                    <SelectTrigger className={validationErrors.relation ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Self">Self</SelectItem>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Son">Son</SelectItem>
                      <SelectItem value="Daughter">Daughter</SelectItem>
                      <SelectItem value="Father">Father</SelectItem>
                      <SelectItem value="Mother">Mother</SelectItem>
                      <SelectItem value="Brother">Brother</SelectItem>
                      <SelectItem value="Sister">Sister</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.relation && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.relation}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium">
                    Gender <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={newMember.gender}
                    onValueChange={(value) => {
                      setNewMember({ ...newMember, gender: value })
                      if (validationErrors.gender) {
                        setValidationErrors({ ...validationErrors, gender: "" })
                      }
                    }}
                    disabled={submitting}
                  >
                    <SelectTrigger className={validationErrors.gender ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.gender && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.gender}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-medium">
                  Age <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter age"
                  min="0"
                  max="150"
                  value={newMember.age}
                  onChange={(e) => {
                    setNewMember({ ...newMember, age: e.target.value })
                    if (validationErrors.age) {
                      setValidationErrors({ ...validationErrors, age: "" })
                    }
                  }}
                  disabled={submitting}
                  className={`w-full ${validationErrors.age ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {validationErrors.age && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.age}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1 cursor-pointer" 
                  onClick={() => {
                    setIsAddingMember(false)
                    setIsEditingMember(false)
                    clearForm()
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 cursor-pointer" 
                  onClick={isEditingMember ? handleEditMember : handleAddMember}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isEditingMember ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      {isEditingMember ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Update
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Member
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button 
          className="w-full cursor-pointer" 
          size="lg" 
          onClick={handleContinue}
          disabled={!selectedPatient || familyMembers.length === 0}
        >
          Continue to Checkout
        </Button>
      </main>

      <MobileNav />
    </div>
  )
}
