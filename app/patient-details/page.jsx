"use client"

import { useState } from "react"
import PageHeader from "@/components/page-header"
import MobileNav from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PatientDetailsPage() {
  const router = useRouter()
  const [selectedPatient, setSelectedPatient] = useState("1")
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [familyMembers, setFamilyMembers] = useState([
    {
      id: "1",
      name: "Leslie Alexander",
      relation: "Self",
      age: 34,
      gender: "Female",
    },
    {
      id: "2",
      name: "John Alexander",
      relation: "Spouse",
      age: 36,
      gender: "Male",
    },
    {
      id: "3",
      name: "Emma Alexander",
      relation: "Daughter",
      age: 8,
      gender: "Female",
    },
  ])

  const [newMember, setNewMember] = useState({
    name: "",
    relation: "",
    age: "",
    gender: "",
  })

  const handleAddMember = () => {
    if (newMember.name && newMember.relation && newMember.age && newMember.gender) {
      const member = {
        id: String(familyMembers.length + 1),
        name: newMember.name,
        relation: newMember.relation,
        age: Number.parseInt(newMember.age),
        gender: newMember.gender,
      }
      setFamilyMembers([...familyMembers, member])
      setNewMember({ name: "", relation: "", age: "", gender: "" })
      setIsAddingMember(false)
    }
  }

  const handleContinue = () => {
    router.push("/checkout")
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Patient Details" />

      <main className="max-w-md mx-auto p-4">
        <p className="text-sm text-muted-foreground mb-4">Select who will take the test</p>

        <RadioGroup value={selectedPatient} onValueChange={setSelectedPatient} className="space-y-3">
          {familyMembers.map((member) => (
            <Card key={member.id} className="border-2 border-border hover:border-primary transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <RadioGroupItem value={member.id} id={member.id} className="mt-1" />
                  <Label htmlFor={member.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{member.name}</span>
                      {member.relation === "Self" && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">You</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {member.relation} • {member.gender}, {member.age} years
                    </p>
                  </Label>
                </div>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>

        <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full mt-4 mb-6 bg-transparent" size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Family Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[90%] rounded-lg">
            <DialogHeader>
              <DialogTitle>Add Family Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="relation" className="text-sm font-medium mb-2 block">
                  Relation
                </Label>
                <Select
                  value={newMember.relation}
                  onValueChange={(value) => setNewMember({ ...newMember, relation: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relation" />
                  </SelectTrigger>
                  <SelectContent>
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
              </div>

              <div>
                <Label htmlFor="age" className="text-sm font-medium mb-2 block">
                  Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter age"
                  value={newMember.age}
                  onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="gender" className="text-sm font-medium mb-2 block">
                  Gender
                </Label>
                <Select
                  value={newMember.gender}
                  onValueChange={(value) => setNewMember({ ...newMember, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsAddingMember(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleAddMember}>
                  Add Member
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button className="w-full" size="lg" onClick={handleContinue}>
          Continue to Checkout
        </Button>
      </main>

      <MobileNav />
    </div>
  )
}
