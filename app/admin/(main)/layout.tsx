"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  { title: "Customer Management", href: "/admin/customers", icon: Users },
  { title: "Orders & Collections", href: "/admin/orders", icon: ShoppingCart },
  { title: "Sales & Promotions", href: "/admin/sales", icon: Gift },
  { title: "Contact Queries", href: "/admin/queries", icon: MessageSquare },
  { title: "Reports & Analytics", href: "/admin/analytics", icon: BarChart3 },
  { title: "Banners & Media", href: "/admin/banners", icon: ImageIcon },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <div
      className={`${collapsed ? "w-20" : "w-64"
        } flex-shrink-0 bg-white dark:bg-gray-800 border-r dark:border-gray-700 transition-all duration-300 overflow-hidden`}
    >
      <div className="p-4">
        <div className="mb-6 flex items-center justify-center">
          {!collapsed && (
            <span className="text-sm font-bold text-orange-500 transition-opacity duration-300">
              HealthHub
            </span>
          )}
        </div>
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-600 dark:text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
              >
                <item.icon className="h-5 w-5 min-w-[20px]" />
                <span
                  className={`transition-opacity duration-300 ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                    } whitespace-nowrap overflow-hidden`}
                >
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // New state for auth check

  const router = useRouter();



  // New: Fetch auth status client-side on mount
  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       const response = await fetch("/api/check-auth");
  //       const data = await response.json();
  //     } catch (error) {
  //       console.error("Auth check failed:", error);
  //     }
  //   };
  //   checkAuth();
  // }, []);

  const toggleSidebarCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "GET" });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      router.push("/");
    }
  };

  return (
    <Suspense fallback={null}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Desktop Sidebar */}
        <Sidebar collapsed={collapsed} />

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar collapsed={false} />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 p-2 mb-2">
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="md:hidden"
                      onClick={() => setSidebarOpen(true)}
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                </Sheet>

                {/* Collapse Button */}
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
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Admin Dashboard
                </h1>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                </Button>
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    toggleTheme();
                    setIsDark((prev) => !prev);
                  }}
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
                {isAuthenticated && (
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </Suspense>
  );
}
