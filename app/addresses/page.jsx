"use client"

import MobileHeader from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Trash2, Home, Briefcase } from "lucide-react"
import Link from "next/link"

export default function AddressesPage() {
  const addresses = [
    {
      id: 1,
      type: "home",
      label: "Home",
      address: "123 Main Street, Apartment 4B",
      city: "Mumbai",
      pincode: "400001",
      isDefault: true,
    },
    {
      id: 2,
      type: "work",
      label: "Work",
      address: "456 Business Park, Floor 3",
      city: "Mumbai",
      pincode: "400002",
      isDefault: false,
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader userName="Leslie" />

      <main className="max-w-md mx-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Saved Addresses</h2>
            <Link href="/addresses/add">
              <Button size="sm" className="btn-gradient">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {addresses.map((addr) => (
              <Card key={addr.id} className="border-none shadow-md card-elevated">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        addr.type === "home"
                          ? "bg-gradient-to-br from-orange-100 to-orange-200"
                          : "bg-gradient-to-br from-blue-100 to-blue-200"
                      }`}
                    >
                      {addr.type === "home" ? (
                        <Home className="w-7 h-7 text-orange-600" />
                      ) : (
                        <Briefcase className="w-7 h-7 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-base">{addr.label}</h4>
                        {addr.isDefault && (
                          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{addr.address}</p>
                      <p className="text-sm font-medium text-foreground">
                        {addr.city} - {addr.pincode}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-primary/10">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
