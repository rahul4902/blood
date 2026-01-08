// app/admin/(main)/layout.jsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AdminAuthProvider, useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  TestTube,
  Package,
  FolderTree,
  Users,
  ShoppingCart,
  MessageSquare,
  BarChart3,
  ImageIcon,
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  Gift,
  Settings,
  Sun,
  Moon,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { toggleTheme } from "@/lib/utils";

const sidebarItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Tests", href: "/admin/tests", icon: TestTube },
  { title: "Sample Types", href: "/admin/sample-types", icon: TestTube },
  { title: "Categories", href: "/admin/categories", icon: FolderTree },
  // { title: "Packages", href: "/admin/packages", icon: Package },
  // { title: "Customers", href: "/admin/customers", icon: Users },
  { title: "Bookings", href: "/admin/bookings", icon: ShoppingCart },
  // { title: "Promotions", href: "/admin/promotions", icon: Gift },
  // { title: "Queries", href: "/admin/queries", icon: MessageSquare },
  // { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  // { title: "Banners", href: "/admin/banners", icon: ImageIcon },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

function Sidebar({ collapsed }) {
  const pathname = usePathname();

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-64"
      } flex-shrink-0 bg-white dark:bg-gray-800 border-r dark:border-gray-700 transition-all duration-300 overflow-hidden`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center justify-center">
            {collapsed ? (
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">H</span>
                </div>
                <div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    Health
                  </span>
                  <span className="text-lg font-bold text-orange-500">Hub</span>
                  <div className="text-xs text-gray-500">Admin Panel</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-orange-50 text-orange-700 dark:bg-orange-600 dark:text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                  title={collapsed ? item.title : undefined}
                >
                  <item.icon className="h-5 w-5 min-w-[20px] flex-shrink-0" />
                  <span
                    className={`transition-all duration-300 ${
                      collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                    } whitespace-nowrap overflow-hidden`}
                  >
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

function AdminLayoutContent({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { admin, loading, isAuthenticated, logout, accessToken } = useAdminAuth();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Check authentication and redirect if needed
  useEffect(() => {
    console.log('🔍 Admin layout - Auth status:');
    console.log('   Loading:', loading);
    console.log('   Authenticated:', isAuthenticated);
    console.log('   Admin:', admin?.email);
    console.log('   Current path:', pathname);

    if (!loading && !isAuthenticated) {
      console.warn('⚠️ Not authenticated, redirecting to login');
      router.push('/admin/login');
    }
  }, [loading, isAuthenticated, router, pathname, admin]);

  // Check theme on mount
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    setIsDark(theme === 'dark');
  }, []);

  const toggleSidebarCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  const handleLogout = async () => {
    console.log('👋 Logout button clicked');
    await logout();
  };

  const handleThemeToggle = () => {
    toggleTheme();
    setIsDark((prev) => !prev);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar collapsed={false} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left side */}
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Desktop collapse button */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex"
                onClick={toggleSidebarCollapse}
                title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {collapsed ? (
                  <ChevronsRight className="h-5 w-5" />
                ) : (
                  <ChevronsLeft className="h-5 w-5" />
                )}
              </Button>

              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Admin Dashboard
                </h1>
                {admin?.role?.name && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {admin.role.name}
                  </p>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <Button variant="ghost" size="sm" title="Search">
                <Search className="h-4 w-4" />
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative" title="Notifications">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </Button>

              {/* User info */}
              <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {admin?.firstName?.charAt(0) || admin?.email?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {admin?.firstName && admin?.lastName
                      ? `${admin.firstName} ${admin.lastName}`
                      : admin?.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {admin?.role?.name || 'Admin'}
                  </p>
                </div>
              </div>

              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleThemeToggle}
                title={isDark ? 'Light mode' : 'Dark mode'}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              {/* Logout */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  );
}
