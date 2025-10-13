import PageHeader from "@/components/page-header"
import MobileNav from "@/components/mobile-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, Users, FileText, Settings, HelpCircle, ChevronRight, Edit } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Profile" showBack />

      <main className="max-w-md mx-auto">
        <div className="p-4">
          {/* Profile Header */}
          <Card className="border-none shadow-sm mb-4 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="/placeholder-user.jpg" alt="Leslie Alexander" />
                  <AvatarFallback>LA</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">Leslie Alexander</h2>
                  <p className="text-sm text-muted-foreground">Female, 34 years</p>
                  <p className="text-sm text-muted-foreground">Blood Group: O+</p>
                </div>
                <Link href="/edit-profile">
                  <Button size="icon" variant="ghost" className="rounded-full">
                    <Edit className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-none shadow-sm mb-4">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">leslie.alexander@example.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">+91 98765 43210</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-none shadow-sm mb-4">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/addresses" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Manage Addresses</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
                <Link href="/family" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Family Members</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
                <Link href="/reports" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">My Reports</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Settings & Support */}
          <Card className="border-none shadow-sm mb-4">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Settings & Support</h3>
              <div className="space-y-2">
                <Link href="/settings" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Settings</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
                <Link href="/help" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Help & Support</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
