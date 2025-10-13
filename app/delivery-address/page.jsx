// app/delivery-address/page.jsx
"use client"

import { useState, useEffect } from "react"
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

export default function DeliveryAddressPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedAddress, setSelectedAddress] = useState("")
  const [addresses, setAddresses] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingAddress, setEditingAddress] = useState(null)

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

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await addressAPI.getAddresses()
      if (data.success) {
        const list = data.addresses || []
        setAddresses(list)

        // Check localStorage first
        const savedAddressId = localStorage.getItem("selectedAddressId")

        // Try to find the saved address in the list
        const savedAddress = savedAddressId
          ? list.find(a => a.id === savedAddressId)
          : null

        // Priority: savedAddress → default address → first address
        if (savedAddress) {
          setSelectedAddress(savedAddress.id)
        } else {
          const def = list.find(a => a.isDefault)
          setSelectedAddress(def ? def.id : list[0]?.id || "")
        }
      }
    } catch (err) {
      setError(err.message)
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }
  const handleAddressAdded = (newAddress) => {
    setAddresses(prev => {
      const normalized = newAddress.isDefault
        ? prev.map(a => ({ ...a, isDefault: false }))
        : prev
      return [...normalized, newAddress]
    })
    setSelectedAddress(newAddress.id)
    toast({ title: "Success", description: "Address added successfully" })
  }

  const handleAddressUpdated = (updated) => {
    setAddresses(prev => {
      const cleared = updated.isDefault
        ? prev.map(a => ({ ...a, isDefault: false }))
        : prev
      return cleared.map(a => (a.id === updated.id ? updated : a))
    })
    toast({ title: "Success", description: "Address updated successfully" })
  }

  const handleDeleteAddress = async (addressId) => {
    if (!confirm("Are you sure you want to delete this address?")) return
    try {
      const data = await addressAPI.deleteAddress(addressId)
      if (data.success) {
        setAddresses(prev => {
          const next = prev.filter(a => a.id !== addressId)
          if (selectedAddress === addressId) {
            setSelectedAddress(next[0]?.id || "")
          }
          return next
        })
        toast({ title: "Success", description: "Address deleted successfully" })
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  const handleEditAddress = (address) => {
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
    localStorage.setItem("selectedAddressId", selectedAddress)
    router.push("/time-slot")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <PageHeader title="Delivery Address" />
        <main className="max-w-md mx-auto p-4">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
            <p className="text-center text-muted-foreground">Loading addresses...</p>
          </div>
        </main>
        <MobileNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Delivery Address" />

      <main className="max-w-md mx-auto p-4">
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
            onValueChange={setSelectedAddress}
            className="space-y-3 mb-4"
          >
            {addresses.map((address) => {
              const Icon = getAddressIcon(address.type)
              const id = `addr-${address.id}`
              return (
                <div key={address.id} className="relative">
                  {/* Hidden but accessible radio */}
                  <RadioGroupItem id={id} value={address.id} className="peer sr-only" />

                  {/* Entire card is clickable via label */}
                  <Label
                    htmlFor={id}
                    className={cn(
                      "block rounded-2xl border bg-card p-4 pr-20 shadow-sm transition-all",
                      "hover:border-primary/40 hover:shadow",
                      "peer-data-[state=checked]:border-primary peer-data-[state=checked]:shadow-md peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-primary/15"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Custom radio dot */}
                      <span className="mt-1.5 inline-flex h-3.5 w-3.5 rounded-full border border-primary/40 bg-background ring-4 ring-transparent peer-data-[state=checked]:bg-primary peer-data-[state=checked]:ring-primary/20" />

                      <div className="flex-1 min-w-0">
                        {/* Header row */}
                        <div className="mb-2 flex items-center gap-2 flex-wrap">
                          <Icon className="w-4 h-4 text-primary" />
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

                        {/* Address text */}
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

                  {/* Action buttons (not part of label to avoid toggling) */}
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
            <p className="text-sm text-muted-foreground">Add your first delivery address to continue</p>
          </Card>
        )}

        {/* <Button
          variant="outline"
          className="w-full mb-6"
          size="lg"
          onClick={() => {
            setEditingAddress(null)
            setIsDialogOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Address
        </Button>

        <Button className="w-full" size="lg" onClick={handleContinue} disabled={!selectedAddress}>
          Continue
        </Button> */}

        <div className="fixed bottom-15 left-0 right-0 bg-white border-t border-border p-4 z-40">
          <div className="max-w-md mx-auto flex gap-3">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => {
              setEditingAddress(null)
              setIsDialogOpen(true)
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Address
            </Button>
            <Button className="flex-1" onClick={handleContinue} disabled={!selectedAddress}>
              Continue
            </Button>
          </div>
        </div>
      </main>

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
