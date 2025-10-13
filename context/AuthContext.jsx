"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

const AuthContext = createContext(undefined)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedToken = localStorage.getItem('accessToken')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      try {
        setAccessToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing user data:", error)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        localStorage.removeItem('tokenExpiry')
      }
    }
    setLoading(false)
  }, [])

  // Store auth data in localStorage
  const storeAuthData = (data) => {
    if (typeof window === 'undefined') return

    // Store access token and expiry
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('tokenExpiry', data.expiryDate)
    localStorage.setItem('user', JSON.stringify(data.user))

    setAccessToken(data.accessToken)
    setUser(data.user)
  }

  // Login function
  const login = async (credentials) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important: sends and receives httpOnly cookies
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Login failed")
      }

      const data = await response.json()

      // Store auth data (access token in localStorage, refresh token in httpOnly cookie)
      storeAuthData(data)

      return { success: true, data }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: error.message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important for httpOnly cookies
        body: JSON.stringify(userData),
      })
  
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Registration failed")
      }
  
      const data = await response.json()
  
      // Store auth data
      storeAuthData(data)
  
      return { success: true, data }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: error.message }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include", // Important: clears httpOnly cookie
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear localStorage and state
      localStorage.removeItem('accessToken')
      localStorage.removeItem('tokenExpiry')
      localStorage.removeItem('user')
      
      setAccessToken(null)
      setUser(null)
      router.push("/login")
    }
  }

  // Fetch user profile
  const fetchUserProfile = async () => {
    if (!accessToken) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      })

      if (!response.ok) {
        // If unauthorized, logout
        if (response.status === 401 || response.status === 403) {
          logout()
        }
        throw new Error("Failed to fetch profile")
      }

      const data = await response.json()
      setUser(data.user)
      
      // Update user in localStorage
      localStorage.setItem('user', JSON.stringify(data.user))
      
      return { success: true, data: data.user }
    } catch (error) {
      console.error("Fetch profile error:", error)
      return { success: false, error: error.message }
    }
  }

  // Check if token is expired
  const isTokenExpired = () => {
    if (typeof window === 'undefined') return true

    const expiry = localStorage.getItem('tokenExpiry')
    if (!expiry) return true
    return new Date(expiry) <= new Date()
  }

  // Refresh token function
  const refreshAccessToken = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include", // Critical: sends httpOnly refresh token cookie
      })

      if (!response.ok) throw new Error("Token refresh failed")

      const data = await response.json()
      
      // Store new access token
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('tokenExpiry', data.expiryDate)
        setAccessToken(data.accessToken)
      }

      return true
    } catch (error) {
      console.error("Token refresh error:", error)
      logout()
      return false
    }
  }

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!accessToken || !user || typeof window === 'undefined') return

    const checkTokenExpiry = () => {
      const expiry = localStorage.getItem('tokenExpiry')
      if (!expiry) return

      const expiryDate = new Date(expiry)
      const now = new Date()
      const timeUntilExpiry = expiryDate.getTime() - now.getTime()
      
      // Refresh token 2 minutes before expiry
      if (timeUntilExpiry > 0 && timeUntilExpiry < 2 * 60 * 1000) {
        console.log("Token expiring soon, refreshing...")
        refreshAccessToken()
      }
    }

    // Check every minute
    const interval = setInterval(checkTokenExpiry, 60 * 1000)

    return () => clearInterval(interval)
  }, [accessToken, user])

  const value = {
    user,
    accessToken,
    loading,
    login,
    register,
    logout,
    fetchUserProfile,
    isTokenExpired,
    refreshAccessToken,
    isAuthenticated: !!user && !!accessToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
