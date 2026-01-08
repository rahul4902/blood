// app/admin/(auth)/login/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Shield,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await login(formData);

      if (result.success) {
        console.log('✅ Redirecting to admin dashboard...');
        router.push("/admin");
      } else {
        throw new Error(result.error || "Login failed");
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-2xl border-0 bg-white/95 backdrop-blur">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Admin Access
        </CardTitle>
        <CardDescription className="text-gray-600">
          Sign in to access the administrative dashboard
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
              Admin Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={handleChange}
                className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 pr-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                disabled={isLoading}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                id="remember"
                type="checkbox"
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                disabled={isLoading}
              />
              <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                Keep me signed in
              </Label>
            </div>
            <Link
              href="/admin/auth/forgot-password"
              className="text-sm text-orange-600 hover:text-orange-500"
              tabIndex={isLoading ? -1 : 0}
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Signing in...
              </>
            ) : (
              <>
                Access Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="text-center text-sm">
          <Link 
            href="/" 
            className="text-gray-600 hover:text-gray-500"
            tabIndex={isLoading ? -1 : 0}
          >
            ← Back to Main Site
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
