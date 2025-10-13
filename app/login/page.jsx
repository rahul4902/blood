"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, sendOTP, user, loading: authLoading } = useAuth()

  // Login method states
  const [loginMethod, setLoginMethod] = useState("email") // "email" or "phone"
  const [authType, setAuthType] = useState("password") // "password" or "otp"

  // Form field states
  const [identifier, setIdentifier] = useState("") // email or phone
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])

  // UI states
  const [step, setStep] = useState("credentials") // "credentials" or "otp"
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Get and decode redirect URL
  const getRedirectUrl = () => {
    const redirectParam = searchParams.get("redirect")
    if (redirectParam) {
      // Decode the URL if it's encoded (e.g., %2Fdelivery-address -> /delivery-address)
      try {
        const decoded = decodeURIComponent(redirectParam)
        console.log("Redirect URL:", decoded)
        return decoded
      } catch (error) {
        console.error("Error decoding redirect URL:", error)
        return redirectParam
      }
    }
    return "/"
  }

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      const redirectUrl = getRedirectUrl()
      console.log("User already logged in, redirecting to:", redirectUrl)
      router.push(redirectUrl)
    }
  }, [user, authLoading])

  // Handle sending OTP
  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await sendOTP(
      identifier,
      loginMethod // "email" or "phoneNumber"
    )

    setLoading(false)

    if (result.success) {
      setStep("otp")
    } else {
      setError(result.error)
    }
  }

  // Handle password login
  const handlePasswordLogin = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const credentials = {
      [loginMethod]: identifier, // email or phoneNumber
      password,
    }

    const result = await login(credentials, "password")
    setLoading(false)
    
    if (result.success) {
      const redirectUrl = getRedirectUrl()
      console.log("Login successful, redirecting to---:", redirectUrl)
      router.push(redirectUrl) 
      // Small delay to ensure state is updated
      setTimeout(() => {
        router.push(redirectUrl)
      }, 100)
    } else {
      setError(result.error)
    }
  }

  // Handle OTP verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const otpValue = otp.join("")
    if (otpValue.length !== 6) {
      setError("Please enter complete OTP")
      setLoading(false)
      return
    }

    const credentials = {
      [loginMethod]: identifier,
      otp: otpValue,
    }

    const result = await login(credentials, "otp")
    setLoading(false)

    if (result.success) {
      const redirectUrl = getRedirectUrl()
      console.log("OTP verification successful, redirecting to:", redirectUrl)
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        router.push(redirectUrl)
      }, 100)
    } else {
      setError(result.error)
    }
  }

  // Handle OTP input change
  const handleOTPChange = (index, value) => {
    if (!/^\d*$/.test(value)) return // Only allow numbers

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Take only last character
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  // Handle OTP backspace
  const handleOTPKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  // Reset to initial state
  const handleBackToCredentials = () => {
    setStep("credentials")
    setOtp(["", "", "", "", "", ""])
    setError("")
  }

  // Toggle between email and phone
  const toggleLoginMethod = () => {
    setLoginMethod((prev) => (prev === "email" ? "phone" : "email"))
    setIdentifier("")
    setError("")
  }

  // Toggle between password and OTP
  const toggleAuthType = () => {
    setAuthType((prev) => (prev === "password" ? "otp" : "password"))
    setPassword("")
    setOtp(["", "", "", "", "", ""])
    setStep("credentials")
    setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            {step === "credentials"
              ? `Enter your ${loginMethod} to continue`
              : "Enter the OTP sent to your " + loginMethod}
          </p>
        </div>

        <Card className="border-none shadow-2xl">
          <CardContent className="p-6">
            {/* Toggle Login Method */}
            {/* <div className="flex gap-2 mb-4">
              <Button
                type="button"
                variant={loginMethod === "email" ? "default" : "outline"}
                onClick={() => loginMethod !== "email" && toggleLoginMethod()}
                className="flex-1"
              >
                Email
              </Button>
              <Button
                type="button"
                variant={loginMethod === "phone" ? "default" : "outline"}
                onClick={() => loginMethod !== "phone" && toggleLoginMethod()}
                className="flex-1"
              >
                Phone
              </Button>
            </div> */}

            {/* Toggle Auth Type */}
            {/* <div className="flex gap-2 mb-6">
              <Button
                type="button"
                variant={authType === "password" ? "default" : "outline"}
                onClick={() => authType !== "password" && toggleAuthType()}
                className="flex-1"
                size="sm"
              >
                Password
              </Button>
              <Button
                type="button"
                variant={authType === "otp" ? "default" : "outline"}
                onClick={() => authType !== "otp" && toggleAuthType()}
                className="flex-1"
                size="sm"
              >
                OTP
              </Button>
            </div> */}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Credentials Form */}
            {step === "credentials" && (
              <form
                onSubmit={authType === "otp" ? handleSendOTP : handlePasswordLogin}
                className="space-y-5"
              >
                <div>
                  <Label htmlFor="identifier" className="text-sm font-semibold">
                    {loginMethod === "email" ? "Email Address" : "Phone Number"}
                  </Label>
                  <div className="flex gap-2 mt-2">
                    {loginMethod === "phone" && (
                      <div className="w-16 h-12 rounded-xl bg-muted flex items-center justify-center font-semibold">
                        +91
                      </div>
                    )}
                    <Input
                      id="identifier"
                      type={loginMethod === "email" ? "email" : "tel"}
                      placeholder={
                        loginMethod === "email"
                          ? "you@example.com"
                          : "98765 43210"
                      }
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      maxLength={loginMethod === "phone" ? 10 : undefined}
                      className="h-12 text-lg"
                    />
                  </div>
                </div>

                {/* Password Field */}
                {authType === "password" && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="password" className="text-sm font-semibold">
                        Password
                      </Label>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 text-lg pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base btn-gradient"
                  size="lg"
                  disabled={loading}
                >
                  {loading
                    ? "Please wait..."
                    : authType === "otp"
                      ? "Send OTP"
                      : "Sign In"}
                </Button>

                {/* <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" type="button" className="h-12 bg-transparent">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" type="button" className="h-12 bg-transparent">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </Button>
                </div> */}
              </form>
            )}

            {/* OTP Verification Form */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <Label className="text-sm font-semibold">Enter OTP</Label>
                  <div className="flex gap-2 mt-3 justify-center">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOTPChange(index, e.target.value)}
                        onKeyDown={(e) => handleOTPKeyDown(index, e)}
                        className="w-12 h-14 text-center text-xl font-bold"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground text-center mt-3">
                    Sent to {loginMethod === "email" ? identifier : `+91 ${identifier}`}
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base btn-gradient"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleBackToCredentials}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Change {loginMethod}
                  </button>
                  <span className="mx-2 text-muted-foreground">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setOtp(["", "", "", "", "", ""])
                      handleSendOTP({ preventDefault: () => { } })
                    }}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            )}

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
