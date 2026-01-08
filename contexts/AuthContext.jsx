"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { initializeApiClient } from "@/lib/api";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [accessToken, setAccessTokenState] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const isInitialized = useRef(false);
  const isRefreshing = useRef(false);

  // ✅ Check if current route is admin
  const isAdminRoute = pathname?.startsWith("/admin");

  // ============================================
  // STEP 1: Initialize API client immediately
  // ============================================
  useEffect(() => {
    if (isAdminRoute) return;

    
    initializeApiClient({
      getAccessToken: () => accessToken,
      setAccessToken: (token) => setAccessTokenState(token),
      getCsrfToken: () => csrfToken,
      refreshAccessToken: refreshAccessToken,
    });
  }, []);

  // ============================================
  // STEP 2: Re-initialize when tokens change
  // ============================================
  useEffect(() => {
    if (isAdminRoute) return;

    
    initializeApiClient({
      getAccessToken: () => accessToken,
      setAccessToken: (token) => setAccessTokenState(token),
      getCsrfToken: () => csrfToken,
      refreshAccessToken: refreshAccessToken,
    });
  }, [accessToken, csrfToken]);

  // ============================================
  // STEP 3: Try to restore session on mount
  // ============================================
  useEffect(() => {
    if (isAdminRoute) {
      // console.log("⏭️ Skipping customer auth (on admin route)");
      setLoading(false);
      return;
    }

    if (isInitialized.current) {
      // console.log("⏭️ Skipping duplicate customer auth init");
      return;
    }

    isInitialized.current = true;

    const initAuth = async () => {
      try {
        console.log("🔐 Restoring customer session...");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {
            method: "POST",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();

          if (data.success) {
            console.log(
              "✅ Customer session restored:",
              data.user?.email
            );
            setAccessTokenState(data.accessToken);
            setCsrfToken(data.csrfToken);
            setUser(data.user);
          } else {
            console.log("ℹ️ No customer session");
          }
        } else {
          console.log(
            "ℹ️ No customer session (status:",
            response.status,
            ")"
          );
        }
      } catch (error) {
        console.error("❌ Customer auth error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [isAdminRoute]);

  // ============================================
  // STEP 4: Auto-refresh token before expiry
  // ============================================
  useEffect(() => {
    if (!accessToken || isAdminRoute) return;

    const checkAndRefreshToken = async () => {
      try {
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        const expiresAt = payload.exp * 1000;
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;

        if (timeUntilExpiry < 2 * 60 * 1000 && timeUntilExpiry > 0) {
          console.log("⏰ Customer token expiring, refreshing...");
          await refreshAccessToken();
        }
      } catch (error) {
        console.error("Token check error:", error);
      }
    };

    const interval = setInterval(checkAndRefreshToken, 2 * 60 * 1000);
    checkAndRefreshToken();

    return () => clearInterval(interval);
  }, [accessToken, isAdminRoute]);

  // ============================================
  // STEP 5: Refresh Token Function
  // ============================================
  const refreshAccessToken = async () => {
    if (isAdminRoute) return false;

    if (isRefreshing.current) {
      console.log("⏳ Customer refresh in progress");
      return false;
    }

    isRefreshing.current = true;

    try {
      console.log("🔄 Refreshing customer token...");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Refresh failed");
      }

      const data = await response.json();

      if (data.success) {
        console.log("✅ Customer token refreshed");
        setAccessTokenState(data.accessToken);
        setCsrfToken(data.csrfToken);
        if (data.user) setUser(data.user);
        return true;
      }

      throw new Error("Refresh failed");
    } catch (error) {
      console.error("❌ Customer refresh error:", error);
      setAccessTokenState(null);
      setCsrfToken(null);
      setUser(null);
      if (!isAdminRoute) {
        router.push("/login");
      }
      return false;
    } finally {
      isRefreshing.current = false;
    }
  };

  // ============================================
  // STEP 6: Login Function
  // ============================================
  const login = async (credentials) => {
    try {
      console.log("🔐 Customer logging in...");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(credentials),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();

      console.log("✅ Customer login successful:", data.user?.email);
      setAccessTokenState(data.accessToken);
      setCsrfToken(data.csrfToken);
      setUser(data.user);

      return { success: true, data };
    } catch (error) {
      console.error("❌ Customer login error:", error);
      return { success: false, error: error.message };
    }
  };

  // ============================================
  // STEP 7: Register Function
  // ============================================
  const register = async (userData) => {
    try {
      console.log("📝 Customer registering...");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      const data = await response.json();

      console.log("✅ Customer registration successful");
      setAccessTokenState(data.accessToken);
      setCsrfToken(data.csrfToken);
      setUser(data.user);

      return { success: true, data };
    } catch (error) {
      console.error("❌ Customer registration error:", error);
      return { success: false, error: error.message };
    }
  };

  // ============================================
  // STEP 8: Logout Function
  // ============================================
  const logout = async () => {
    try {
      console.log("👋 Customer logging out...");

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      console.log("✅ Customer logout successful");
    } catch (error) {
      console.error("❌ Logout error:", error);
    } finally {
      setAccessTokenState(null);
      setCsrfToken(null);
      setUser(null);
      router.push("/login");
    }
  };

  // ============================================
  // STEP 9: Set Token Manually
  // ============================================
  const setAccessToken = (token) => {
    setAccessTokenState(token);
  };

  // ============================================
  // Context Value
  // ============================================
  const value = {
    user,
    accessToken,
    csrfToken,
    loading,
    login,
    register,
    logout,
    refreshAccessToken,
    setAccessToken,
    isAuthenticated: !!user && !!accessToken,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

// ============================================
// Use Auth Hook
// ============================================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
