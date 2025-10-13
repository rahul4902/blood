"use client"

import MobileHeader from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Bell, Package, FileText } from "lucide-react"
import Link from "next/link"

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: "order",
      title: "Order Confirmed",
      message: "Your order #12345 has been confirmed and will be processed soon.",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      type: "report",
      title: "Test Report Ready",
      message: "Your Diabetes Panel test report is now available to download.",
      time: "1 day ago",
      read: false,
    },
    {
      id: 3,
      type: "offer",
      title: "Special Offer",
      message: "Get 20% off on all health packages this weekend!",
      time: "2 days ago",
      read: true,
    },
  ]

  const getIcon = (type) => {
    switch (type) {
      case "order":
        return <Package className="w-6 h-6 text-blue-600" />
      case "report":
        return <FileText className="w-6 h-6 text-green-600" />
      case "offer":
        return <Bell className="w-6 h-6 text-orange-600" />
      default:
        return <Bell className="w-6 h-6 text-primary" />
    }
  }

  const getIconBg = (type) => {
    switch (type) {
      case "order":
        return "bg-gradient-to-br from-blue-100 to-blue-200"
      case "report":
        return "bg-gradient-to-br from-green-100 to-green-200"
      case "offer":
        return "bg-gradient-to-br from-orange-100 to-orange-200"
      default:
        return "bg-gradient-to-br from-primary/20 to-secondary/20"
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader userName="Leslie" />

      <main className="max-w-md mx-auto">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h2 className="text-xl font-bold">Notifications</h2>
          </div>

          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border-none shadow-md card-elevated ${notification.read ? "opacity-60" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${getIconBg(notification.type)}`}
                    >
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-bold text-sm">{notification.title}</h4>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Bell className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-sm text-muted-foreground text-center">
                You're all caught up! Check back later for updates.
              </p>
            </div>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
