// app/delivery-address/page.jsx

"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import PageHeader from "@/components/page-header"
import MobileNav from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MapPin, Plus, Trash2, Edit, Home, Briefcase } from "lucide-react"
import { useRouter } from "next/navigation"
import AddAddressDialog from "@/components/add-address-dialog"
import { addressAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { addressStorage, bookingStorage } from "@/lib/localStorage"

export default function DeliveryAddressPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { accessToken, loading: authLoading, isAuthenticated } = useAuth()
  
  const [selectedAddress, setSelectedAddress] = useState("")
  const [addresses, setAddresses] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingAddress, setEditingAddress] = useState(null)

  const hasFetched = useRef(false)

  const getAddressIcon = (type) => {
    switch (type) {
      case "home":
        return Home
      case "work":
        return Briefcase
      default:
        return MapPin
    }
  }

  // ✅ Wait for auth, then fetch addresses
  useEffect(() => {
    if (authLoading) {
      console.log('⏳ Waiting for auth to load...')
      return
    }

    if (!isAuthenticated || !accessToken) {
      router.push('/login')
      return
    }

    if (hasFetched.current) {
      return
    }

    hasFetched.current = true
    console.log('✅ Auth loaded, fetching addresses...')
    fetchAddresses()

    return () => {
      console.log('🧹 Address page cleanup')
    }
  }, [authLoading, isAuthenticated, accessToken, router])

  const fetchAddresses = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('📍 Fetching addresses...')
      console.log('   Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'null')
      
      const data = await addressAPI.getAddresses()
      
      if (data.success) {
        const list = data.addresses || []
        console.log('✅ Addresses loaded:', list.length)
        setAddresses(list)

        // ✅ Use addressStorage instead of direct localStorage
        const savedAddressId = addressStorage.getSelectedAddressId()

        // Try to find the saved address in the list
        const savedAddress = savedAddressId
          ? list.find(a => a.id === savedAddressId)
          : null

        // Priority: savedAddress → default address → first address
        if (savedAddress) {
          setSelectedAddress(savedAddress.id)
          console.log('✅ Selected saved address:', savedAddress.id)
        } else {
          const def = list.find(a => a.isDefault)
          const selected = def ? def.id : list[0]?.id || ""
          setSelectedAddress(selected)
          
          // ✅ Save to localStorage using addressStorage
          if (selected) {
            addressStorage.setSelectedAddressId(selected)
          }
          console.log('✅ Selected default/first address:', selected)
        }
      } else {
        throw new Error(data.message || 'Failed to fetch addresses')
      }
    } catch (err) {
      console.error('❌ Address fetch error:', err)
      setError(err.message)
      toast({ 
        title: "Error", 
        description: err.message || 'Failed to load addresses', 
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddressAdded = (newAddress) => {
    console.log('➕ Address added:', newAddress.id)
    
    setAddresses(prev => {
      const normalized = newAddress.isDefault
        ? prev.map(a => ({ ...a, isDefault: false }))
        : prev
      return [...normalized, newAddress]
    })
    
    setSelectedAddress(newAddress.id)
    
    // ✅ Save to localStorage using addressStorage
    addressStorage.setSelectedAddressId(newAddress.id)
    
    // ✅ Update booking data
    bookingStorage.updateBookingData({ 
      selectedAddressId: newAddress.id,
      addressDetails: newAddress 
    })
    
    toast({ 
      title: "Success", 
      description: "Address added successfully" 
    })
  }

  const handleAddressUpdated = (updated) => {
    console.log('✏️ Address updated:', updated.id)
    
    setAddresses(prev => {
      const cleared = updated.isDefault
        ? prev.map(a => ({ ...a, isDefault: false }))
        : prev
      return cleared.map(a => (a.id === updated.id ? updated : a))
    })
    
    // ✅ Update booking data if this is the selected address
    if (selectedAddress === updated.id) {
      bookingStorage.updateBookingData({ 
        addressDetails: updated 
      })
    }
    
    toast({ 
      title: "Success", 
      description: "Address updated successfully" 
    })
  }

  const handleDeleteAddress = async (addressId) => {
    if (!confirm("Are you sure you want to delete this address?")) return
    
    try {
      console.log('🗑️ Deleting address:', addressId)
      const data = await addressAPI.deleteAddress(addressId)
      
      if (data.success) {
        setAddresses(prev => {
          const next = prev.filter(a => a.id !== addressId)
          
          // If deleted address was selected, select first remaining
          if (selectedAddress === addressId) {
            const newSelected = next[0]?.id || ""
            setSelectedAddress(newSelected)
            
            // ✅ Use addressStorage methods
            if (newSelected) {
              addressStorage.setSelectedAddressId(newSelected)
              const newAddress = next[0]
              bookingStorage.updateBookingData({ 
                selectedAddressId: newSelected,
                addressDetails: newAddress 
              })
            } else {
              addressStorage.clearSelectedAddressId()
              // Remove address from booking data
              const bookingData = bookingStorage.getBookingData()
              if (bookingData) {
                delete bookingData.selectedAddressId
                delete bookingData.addressDetails
                bookingStorage.setBookingData(bookingData)
              }
            }
          }
          
          return next
        })
        
        console.log('✅ Address deleted successfully')
        toast({ 
          title: "Success", 
          description: "Address deleted successfully" 
        })
      } else {
        throw new Error(data.message || 'Failed to delete address')
      }
    } catch (err) {
      console.error('❌ Delete address error:', err)
      toast({ 
        title: "Error", 
        description: err.message || 'Failed to delete address', 
        variant: "destructive" 
      })
    }
  }

  const handleEditAddress = (address) => {
    console.log('✏️ Editing address:', address.id)
    setEditingAddress(address)
    setIsDialogOpen(true)
  }

  const handleContinue = () => {
    if (!selectedAddress) {
      toast({
        title: "Warning",
        description: "Please select a delivery address",
        variant: "destructive",
      })
      return
    }
    
    console.log('➡️ Continuing with address:', selectedAddress)
    
    // ✅ Get the full address details
    const selectedAddressDetails = addresses.find(a => a.id === selectedAddress)
    
    // ✅ Save using addressStorage
    addressStorage.setSelectedAddressId(selectedAddress)
    
    // ✅ Update booking data with full address details
    bookingStorage.updateBookingData({ 
      selectedAddressId: selectedAddress,
      addressDetails: selectedAddressDetails 
    })
    
    router.push("/time-slot")
  }

  // ✅ Handle address selection changes
  const handleAddressSelection = (addressId) => {
    console.log('📍 Address selected:', addressId)
    setSelectedAddress(addressId)
    
    // ✅ Get full address details
    const addressDetails = addresses.find(a => a.id === addressId)
    
    // ✅ Save to localStorage
    addressStorage.setSelectedAddressId(addressId)
    
    // ✅ Update booking data
    bookingStorage.updateBookingData({ 
      selectedAddressId: addressId,
      addressDetails: addressDetails 
    })
  }

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <PageHeader title="Delivery Address" />
        <main className="max-w-md mx-auto p-4">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
            <p className="text-center text-muted-foreground">
              {authLoading ? 'Authenticating...' : 'Loading addresses...'}
            </p>
          </div>
        </main>
        <MobileNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Delivery Address" />

      <main className="max-w-md mx-auto p-4 pb-24">
        <p className="text-sm text-muted-foreground mb-4">
          Select the address where you want the blood sample collection
        </p>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {addresses.length > 0 ? (
          <RadioGroup
            value={selectedAddress}
            onValueChange={handleAddressSelection}
            className="space-y-3 mb-4"
          >
            {addresses.map((address) => {
              const Icon = getAddressIcon(address.type)
              const id = `addr-${address.id}`
              
              return (
                <div key={address.id} className="relative">
                  <RadioGroupItem 
                    id={id} 
                    value={address.id} 
                    className="peer sr-only" 
                  />

                  <Label
                    htmlFor={id}
                    className={cn(
                      "block rounded-2xl border bg-card p-4 pr-20 shadow-sm transition-all cursor-pointer",
                      "hover:border-primary/40 hover:shadow",
                      "peer-data-[state=checked]:border-primary peer-data-[state=checked]:shadow-md peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-primary/15"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 inline-flex h-3.5 w-3.5 shrink-0 rounded-full border border-primary/40 bg-background ring-4 ring-transparent peer-data-[state=checked]:bg-primary peer-data-[state=checked]:ring-primary/20 transition-all" />

                      <div className="flex-1 min-w-0">
                        <div className="mb-2 flex items-center gap-2 flex-wrap">
                          <Icon className="w-4 h-4 text-primary shrink-0" />
                          <span className="font-semibold capitalize text-sm">
                            {address.type}
                          </span>
                          {address.label && (
                            <span className="text-xs text-muted-foreground">
                              {address.label}
                            </span>
                          )}
                          {address.isDefault && (
                            <Badge variant="secondary" className="h-5 px-2 text-xs">
                              Default
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm text-foreground">{address.address}</p>
                          {address.landmark && (
                            <p className="text-sm text-muted-foreground">
                              Near {address.landmark}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Label>

                  <div className="absolute right-3 top-3 flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-accent"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleEditAddress(address)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit address</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDeleteAddress(address.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete address</span>
                    </Button>
                  </div>
                </div>
              )
            })}
          </RadioGroup>
        ) : (
          <Card className="border-2 border-dashed border-border p-8 text-center mb-4">
            <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground font-medium mb-1">No addresses found</p>
            <p className="text-sm text-muted-foreground">
              Add your first delivery address to continue
            </p>
          </Card>
        )}
      </main>

      {/* Fixed bottom action bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-background border-t border-border p-4 z-40 shadow-lg">
        <div className="max-w-md mx-auto flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={() => {
              setEditingAddress(null)
              setIsDialogOpen(true)
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Address
          </Button>
          <Button 
            className="flex-1" 
            onClick={handleContinue} 
            disabled={!selectedAddress}
          >
            Continue
          </Button>
        </div>
      </div>

      <MobileNav />

      <AddAddressDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setEditingAddress(null)
        }}
        onAddressAdded={handleAddressAdded}
        onAddressUpdated={handleAddressUpdated}
        editingAddress={editingAddress}
      />
    </div>
  )
}
