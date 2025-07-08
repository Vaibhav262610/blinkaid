"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Ambulance, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          userType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Store token and user data in localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('userType', data.userType)

      // Redirect based on user type
      switch (userType) {
        case "user":
          router.push("/dashboard/user")
          break
        case "driver":
          // Check if driver is approved
          if (data.user.isApproved) {
            router.push("/dashboard/driver")
          } else {
            alert('Your account is pending approval. Please contact the administrator.')
            return
          }
          break
        case "admin":
          router.push("/dashboard/admin")
          break
        default:
          router.push("/dashboard/user")
      }
    } catch (error: any) {
      alert(error.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-red-600 p-2 rounded-lg">
              <Ambulance className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">RapidResponse</span>
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to access your emergency response dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userType">Account Type</Label>
              <Select value={userType} onValueChange={setUserType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Patient/User</SelectItem>
                  <SelectItem value="driver">Ambulance Driver</SelectItem>
                  <SelectItem value="admin">System Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/forgot-password" className="text-sm text-red-600 hover:underline">
              Forgot your password?
            </Link>
          </div>

          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">Don't have an account? </span>
            <Link href="/signup" className="text-sm text-red-600 hover:underline font-medium">
              Sign up
            </Link>
          </div>

          <Alert className="mt-4 border-red-200 bg-red-50">
            <AlertDescription className="text-sm text-red-800">
              <strong>Emergency?</strong> Call 911 immediately or use our{" "}
              <Link href="/emergency" className="underline font-medium">
                Emergency Request
              </Link>{" "}
              feature.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
