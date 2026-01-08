"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { initializeApiClient } from "@/lib/api";

const AdminAuthContext = createContext(undefined);

export const AdminAuthProvider = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  
  const [admin, setAdmin] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const isInitialized = useRef(false);
  const isRefreshing = useRef(false);

  // ✅ Check if current route is NOT admin
  const isAdminRoute = pathname?.startsWith('/admin');

  // Initialize API client immediately for admin routes
  useEffect(() => {
    if (!isAdminRoute) return; // Skip for customer routes

    
    initializeApiClient({
      getAccessToken: () => accessToken,
      setAccessToken: (token) => setAccessToken(token),
      getCsrfToken: () => csrfToken,
      refreshAccessToken: refreshAccessToken
    });
  }, []);

  // Re-initialize when admin tokens change
  useEffect(() => {
    if (!isAdminRoute) return; // Skip for customer routes

    
    initializeApiClient({
      getAccessToken: () => accessToken,
      setAccessToken: (token) => setAccessToken(token),
      getCsrfToken: () => csrfToken,
      refreshAccessToken: refreshAccessToken
    });
  }, [accessToken, csrfToken, isAdminRoute]);

  // Try to restore admin session
  useEffect(() => {
    // ✅ Skip if NOT on admin route
    if (!isAdminRoute) {
      // console.log('⏭️ Skipping admin auth (not on admin route)');
      setLoading(false);
      return;
    }

    if (isInitialized.current) {
      // console.log('⏭️ Skipping duplicate admin auth init');
      return;
    }
    
    isInitialized.current = true;

    const initAuth = async () => {
      try {
        console.log('🔐 Restoring admin session...');
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.success) {
            console.log('✅ Admin session restored:', data.user?.email);
            console.log('   Role:', data.user?.role?.name);
            setAccessToken(data.accessToken);
            setCsrfToken(data.csrfToken);
            setAdmin(data.user);
          } else {
            console.log('ℹ️ No admin session');
          }
        } else {
          console.log('ℹ️ No admin session (status:', response.status, ')');
        }
      } catch (error) {
        console.error("❌ Admin auth error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [isAdminRoute]);

  // Auto-refresh admin token
  useEffect(() => {
    if (!accessToken || !isAdminRoute) return;

    const checkAndRefreshToken = async () => {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const expiresAt = payload.exp * 1000;
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;

        if (timeUntilExpiry < 2 * 60 * 1000 && timeUntilExpiry > 0) {
          console.log("⏰ Admin token expiring, refreshing...");
          await refreshAccessToken();
        }
      } catch (error) {
        console.error("Admin token check error:", error);
      }
    };

    const interval = setInterval(checkAndRefreshToken, 2 * 60 * 1000);
    checkAndRefreshToken();

    return () => clearInterval(interval);
  }, [accessToken, isAdminRoute]);

  const refreshAccessToken = async () => {
    if (!isAdminRoute) return false;
    
    if (isRefreshing.current) {
      console.log('⏳ Admin refresh in progress');
      return false;
    }

    isRefreshing.current = true;

    try {
      console.log('🔄 Refreshing admin token...');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Refresh failed");
      }

      const data = await response.json();

      if (data.success) {
        console.log('✅ Admin token refreshed');
        setAccessToken(data.accessToken);
        setCsrfToken(data.csrfToken);
        if (data.user) setAdmin(data.user);
        return true;
      }

      throw new Error("Refresh failed");
    } catch (error) {
      console.error("❌ Admin refresh error:", error);
      setAccessToken(null);
      setCsrfToken(null);
      setAdmin(null);
      if (isAdminRoute) router.push("/admin/login");
      return false;
    } finally {
      isRefreshing.current = false;
    }
  };

  const login = async (credentials) => {
    try {
      console.log('🔐 Admin logging in...');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();

      console.log('✅ Admin login successful:', data.user?.email);
      console.log('   Role:', data.user?.role?.name);
      setAccessToken(data.accessToken);
      setCsrfToken(data.csrfToken);
      setAdmin(data.user);

      return { success: true, data };
    } catch (error) {
      console.error("❌ Admin login error:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      console.log('👋 Admin logging out...');
      
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      console.log("✅ Admin logout successful");
    } catch (error) {
      console.error("❌ Admin logout error:", error);
    } finally {
      setAccessToken(null);
      setCsrfToken(null);
      setAdmin(null);
      router.push("/admin/login");
    }
  };

  const hasPermission = (permission) => {
    if (!admin || !admin.role) return false;
    return admin.role.permissions?.includes(permission) || false;
  };

  const value = {
    admin,
    accessToken,
    csrfToken,
    loading,
    login,
    logout,
    refreshAccessToken,
    hasPermission,
    isAuthenticated: !!admin && !!accessToken,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
