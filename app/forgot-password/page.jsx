"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, Loader2, Mail, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Email validation
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Client-side validation
    if (!email) {
      setError("Please enter your email address")
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitted(true)
        
        // Start cooldown timer (60 seconds)
        setCooldown(60)
        const timer = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(data.message || "Failed to send reset email. Please try again.")
      }
    } catch (err) {
      console.error("Forgot password error:", err)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle resend
  const handleResend = () => {
    setSubmitted(false)
    setError("")
    setCooldown(0)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
       

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            {submitted ? (
              <CheckCircle2 className="w-10 h-10 text-white" />
            ) : (
              <Mail className="w-10 h-10 text-white" />
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            {submitted ? "Check Your Email" : "Forgot Password?"}
          </h1>
          <p className="text-gray-600 px-4">
            {submitted
              ? "We've sent password reset instructions to your email"
              : "Enter your email address and we'll send you instructions to reset your password"}
          </p>
        </div>

        {/* Main Card */}
        <Card className="border-none shadow-xl">
          <CardContent className="p-6">
            {!submitted ? (
              // Form View
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive" className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="h-11 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    autoFocus
                  />
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium shadow-md transition-all hover:shadow-lg" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Reset Link...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Reset Link
                    </>
                  )}
                </Button>
              </form>
            ) : (
              // Success View
              <div className="text-center space-y-5">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-gray-900">Email Sent Successfully!</h3>
                  <p className="text-sm text-gray-600">
                    We've sent password reset instructions to{" "}
                    <span className="font-medium text-gray-900 break-all">{email}</span>
                  </p>
                </div>

                {/* Help Info */}
                <Alert className="bg-blue-50 border-blue-200 text-left">
                  <AlertDescription className="text-sm text-gray-700">
                    <strong className="block mb-2">📧 Didn't receive the email?</strong>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Check your spam or junk folder</li>
                      <li>Verify the email address is correct</li>
                      <li>Wait a few minutes for delivery</li>
                      <li>Check if you have internet connection</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {/* Resend Button */}
                <Button 
                  onClick={handleResend} 
                  variant="outline" 
                  className="w-full h-11 border-orange-300 hover:bg-orange-50 hover:border-orange-400 transition-colors"
                  disabled={cooldown > 0}
                >
                  {cooldown > 0 ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resend available in {cooldown}s
                    </>
                  ) : (
                    "Try Another Email"
                  )}
                </Button>
              </div>
            )}

            {/* Divider */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Remember your password?{" "}
                <Link 
                  href="/login" 
                  className="text-orange-600 font-medium hover:text-orange-700 hover:underline transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <p className="text-center text-xs text-gray-500 mt-6">
          🔒 This link will expire in 1 hour for security reasons
        </p>
      </div>
    </div>
  )
}
