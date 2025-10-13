"use client"

import MobileHeader from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import PageHeader from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function AddAddressPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    type: "home",
    label: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value })
  }

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("[v0] Adding address:", formData)
    router.push("/addresses")
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* <MobileHeader userName="Leslie" /> */}
      <PageHeader title="Add New Address" />

      <main className="max-w-md mx-auto">
        <div className="p-4">
          

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Address Type *</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSelectChange("type", "home")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.type === "home"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      <p className="text-xs font-medium">Home</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectChange("type", "work")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.type === "work"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-xs font-medium">Work</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectChange("type", "other")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.type === "other"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <p className="text-xs font-medium">Other</p>
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="label" className="text-sm font-semibold">
                    Label (Optional)
                  </Label>
                  <Input
                    id="label"
                    name="label"
                    type="text"
                    placeholder="e.g., Home, Office, Parents House"
                    value={formData.label}
                    onChange={handleChange}
                    className="mt-2 h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm font-semibold">
                    Complete Address *
                  </Label>
                  <Textarea
                    id="address"
                    name="address"
                    placeholder="House/Flat No., Building Name, Street"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="landmark" className="text-sm font-semibold">
                    Landmark (Optional)
                  </Label>
                  <Input
                    id="landmark"
                    name="landmark"
                    type="text"
                    placeholder="Nearby landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    className="mt-2 h-12"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-sm font-semibold">
                      City *
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="mt-2 h-12"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pincode" className="text-sm font-semibold">
                      Pincode *
                    </Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      type="text"
                      placeholder="Pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      maxLength={6}
                      className="mt-2 h-12"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="state" className="text-sm font-semibold">
                    State *
                  </Label>
                  <Select value={formData.state} onValueChange={(value) => handleSelectChange("state", value)} required>
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maharashtra">Maharashtra</SelectItem>
                      <SelectItem value="delhi">Delhi</SelectItem>
                      <SelectItem value="karnataka">Karnataka</SelectItem>
                      <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                      <SelectItem value="west-bengal">West Bengal</SelectItem>
                      <SelectItem value="gujarat">Gujarat</SelectItem>
                      <SelectItem value="rajasthan">Rajasthan</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 p-4 rounded-xl bg-muted/50">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <Label htmlFor="isDefault" className="text-sm font-medium cursor-pointer">
                    Set as default address
                  </Label>
                </div>

                <div className="pt-4 space-y-3">
                  <Button type="submit" className="w-full h-12 text-base btn-gradient" size="lg">
                    Save Address
                  </Button>
                  <Link href="/addresses" className="block">
                    <Button type="button" variant="outline" className="w-full h-12 bg-transparent" size="lg">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
