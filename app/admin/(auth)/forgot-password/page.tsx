"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, ArrowLeft, Send, CheckCircle, Shield } from "lucide-react"

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock password reset logic
      console.log("Admin password reset requested for:", email)
      setIsSuccess(true)
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="w-full shadow-2xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Check Your Email</CardTitle>
          <CardDescription className="text-gray-600">
            We've sent an admin password reset link to your email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              We've sent a secure password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-600">For security reasons, this link will expire in 15 minutes.</p>

            <div className="space-y-2">
              <Button onClick={() => setIsSuccess(false)} variant="outline" className="w-full border-gray-300">
                Try Different Email
              </Button>
              <Link href="/admin/auth/login">
                <Button className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Admin Login
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full shadow-2xl border-0 bg-white/95 backdrop-blur">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">Reset Admin Password</CardTitle>
        <CardDescription className="text-gray-600">
          Enter your admin email to receive a secure password reset link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">
              Admin Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
            disabled={isLoading}
          >
            {isLoading ? (
              "Sending Reset Link..."
            ) : (
              <>
                Send Secure Reset Link
                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-orange-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-orange-800">Security Notice</p>
              <p className="text-orange-700 mt-1">
                Only registered administrators can reset their passwords. The reset link will be sent to your verified
                admin email address.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/admin/auth/login"
            className="inline-flex items-center text-sm text-orange-600 hover:text-orange-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Login
          </Link>
        </div>

        <div className="text-center text-sm text-gray-600">
          <Link href="/" className="text-gray-600 hover:text-gray-500">
            ← Back to Main Site
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
