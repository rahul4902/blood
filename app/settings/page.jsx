"use client"

import PageHeader from "@/components/page-header"
import MobileNav from "@/components/mobile-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, Lock, Globe, HelpCircle, LogOut, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useTheme } from "@/components/theme-provider"

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Settings" showBack />
      
      <main className="max-w-md mx-auto">
        <div className="p-4">
          <Card className="border-none shadow-sm mb-4">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notifications
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="push" className="flex-1 cursor-pointer">
                    Push Notifications
                  </Label>
                  <Switch id="push" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email" className="flex-1 cursor-pointer">
                    Email Notifications
                  </Label>
                  <Switch id="email" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms" className="flex-1 cursor-pointer">
                    SMS Notifications
                  </Label>
                  <Switch id="sms" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm mb-4">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Privacy & Security
              </h3>
              <div className="space-y-2">
                <Link
                  href="/change-password"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
                >
                  <span className="text-sm">Change Password</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
                <Link href="/privacy" className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                  <span className="text-sm">Privacy Policy</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
                <Link href="/terms" className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                  <span className="text-sm">Terms of Service</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm mb-4">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Preferences
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2">
                  <span className="text-sm">Language</span>
                  <span className="text-sm text-muted-foreground">English</span>
                </div>
                <div className="flex items-center justify-between p-2">
                  <Label htmlFor="dark-mode" className="flex-1 cursor-pointer text-sm">
                    Dark Mode
                  </Label>
                  <Switch id="dark-mode" checked={theme === "dark"} onCheckedChange={toggleTheme} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm mb-4">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Support
              </h3>
              <div className="space-y-2">
                <Link href="/help" className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                  <span className="text-sm">Help Center</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
                <Link href="/contact" className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                  <span className="text-sm">Contact Us</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
                <Link href="/faq" className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                  <span className="text-sm">FAQ</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm mb-4">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2">
                  <span className="text-sm text-muted-foreground">App Version</span>
                  <span className="text-sm text-muted-foreground">1.0.0</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Link href="/login">
            <Card className="border-none shadow-sm bg-red-50 hover:bg-red-100 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 text-destructive">
                  <LogOut className="w-5 h-5" />
                  <span className="font-semibold">Logout</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
