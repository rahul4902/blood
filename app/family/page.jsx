"use client"

import MobileHeader from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

export default function FamilyPage() {
  const familyMembers = [
    { id: 1, name: "John Johnson", relation: "Spouse", age: 35, gender: "Male" },
    { id: 2, name: "Emma Johnson", relation: "Daughter", age: 8, gender: "Female" },
    { id: 3, name: "Michael Johnson", relation: "Son", age: 5, gender: "Male" },
  ]

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader userName="Leslie" />

      <main className="max-w-md mx-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Family Members</h2>
            <Link href="/family/add">
              <Button size="sm" className="btn-gradient">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {familyMembers.map((member) => (
              <Card key={member.id} className="border-none shadow-md card-elevated">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-base mb-1">{member.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                          {member.relation}
                        </span>
                        <span>•</span>
                        <span>{member.age} years</span>
                        <span>•</span>
                        <span>{member.gender}</span>
                      </div>
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

          <Card className="border-none shadow-md mt-4 bg-gradient-to-br from-blue-50 to-orange-50">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-blue-900 flex-1">
                  Add family members to book tests for them quickly. You can manage their health records separately.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
