"use client"

import { Bell, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export default function MobileHeader({ showGreeting = false }) {
  const { user, logout, loading, isAuthenticated } = useAuth()
  const [notificationCount, setNotificationCount] = useState(3)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const isHomePage = pathname === "/" || pathname === "/home"
  const shouldShowGreeting = showGreeting && isHomePage

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "G"
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
    }
    if (user.fullName) {
      const names = user.fullName.split(" ")
      return names.length > 1 
        ? `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`
        : user.fullName.charAt(0)
    }
    return user.email?.charAt(0).toUpperCase() || "U"
  }

  // Get display name
  const getDisplayName = () => {
    if (!user) return "Guest"
    return user.fullName || user.firstName || user.email?.split("@")[0] || "User"
  }

  // Handle logout with confirmation
  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      setSidebarOpen(false)
      await logout()
    }
  }

  // Show loading state
  if (loading) {
    return (
      <header className="sticky top-0 z-40 bg-gradient-to-r from-orange-100 via-orange-50 to-blue-50 dark:from-orange-900/50 dark:via-blue-900/50 dark:to-blue-900/50 border-b border-border shadow-sm">
        <div className="flex items-center justify-center p-4 max-w-md mx-auto">
          <div className="animate-pulse flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted"></div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-3 w-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  if (shouldShowGreeting) {
    return (
      <header className="sticky top-0 z-40 bg-gradient-to-r from-orange-50 via-orange-50 to-orange-50 dark:from-orange-900/50 dark:via-blue-900/50 dark:to-orange-900/50 border-b border-border/50 rounded-b-lg">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-md">
                {getUserInitials()}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{getGreeting()}</p>
                <h1 className="text-base font-semibold text-foreground">
                  {getDisplayName()}
                </h1>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-white/80 dark:hover:bg-white/10"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          {/* Uncomment if you want to show booking prompt */}
          {/* <div className="mt-4 flex items-center justify-between bg-white dark:bg-card rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" })}
                </p>
                <p className="text-xs text-muted-foreground">Available Sessions</p>
              </div>
            </div>
            <Link href="/time-slot">
              <Button size="sm" className="rounded-full px-4">
                Book Session
              </Button>
            </Link>
          </div> */}
        </div>

        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-[280px] p-0">
            <SidebarContent 
              user={user}
              isAuthenticated={isAuthenticated}
              getUserInitials={getUserInitials}
              getDisplayName={getDisplayName}
              handleLogout={handleLogout}
              setSidebarOpen={setSidebarOpen}
            />
          </SheetContent>
        </Sheet>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-orange-100 via-orange-50 to-blue-50 dark:from-orange-900/50 dark:via-blue-900/50 dark:to-blue-900/50 border-b border-border shadow-sm">
      <div className="flex items-center justify-between p-4 max-w-md mx-auto">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <SidebarContent 
              user={user}
              isAuthenticated={isAuthenticated}
              getUserInitials={getUserInitials}
              getDisplayName={getDisplayName}
              handleLogout={handleLogout}
              setSidebarOpen={setSidebarOpen}
            />
          </SheetContent>
        </Sheet>

        <div className="flex-1 ml-3">
          <h1 className="text-lg font-semibold text-foreground">HealthLab</h1>
        </div>

        {isAuthenticated && (
          <Link href="/notifications">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 relative"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                  {notificationCount}
                </Badge>
              )}
            </Button>
          </Link>
        )}
      </div>
    </header>
  )
}

// Extracted sidebar content component to avoid duplication
function SidebarContent({ 
  user, 
  isAuthenticated, 
  getUserInitials, 
  getDisplayName, 
  handleLogout, 
  setSidebarOpen 
}) {
  return (
    <div className="flex flex-col h-full">
      {/* User Profile Header */}
      <div className="bg-gradient-to-br from-primary to-secondary p-6 text-white">
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 border-2 border-white/30">
          <span className="text-2xl font-bold">{getUserInitials()}</span>
        </div>
        <h3 className="font-semibold text-lg">{getDisplayName()}</h3>
        <p className="text-sm text-white/80">
          {user?.email || "guest@healthlab.com"}
        </p>
        {user?.phoneNumber && (
          <p className="text-sm text-white/80 mt-1">
            +91 {user.phoneNumber}
          </p>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-1 p-4">
        {isAuthenticated ? (
          <>
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="font-medium">My Profile</span>
            </Link>
            <Link
              href="/family"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="font-medium">Family Members</span>
            </Link>
            <Link
              href="/addresses"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <span className="font-medium">My Addresses</span>
            </Link>
            <Link
              href="/orders"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span className="font-medium">My Orders</span>
            </Link>
            <Link
              href="/reports"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <span className="font-medium">Test Reports</span>
            </Link>
            <Link
              href="/payment-info"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <span className="font-medium">Payment Methods</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="font-medium">Settings</span>
            </Link>
          </>
        ) : (
          <div className="px-4 py-6 text-center">
            <p className="text-muted-foreground mb-4">Please login to access all features</p>
            <Link href="/login">
              <Button className="w-full" onClick={() => setSidebarOpen(false)}>
                Sign In
              </Button>
            </Link>
          </div>
        )}

        <Link
          href="/help"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium">Help & Support</span>
        </Link>
        <Link
          href="/faq"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <span className="font-medium">FAQ</span>
        </Link>
      </nav>

      {/* Logout Button - Only show if authenticated */}
      {isAuthenticated && (
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors w-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      )}
    </div>
  )
}
