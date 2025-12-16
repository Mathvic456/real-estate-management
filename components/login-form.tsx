"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface LoginFormProps {
  onSignupClick: () => void
}

export default function LoginForm({ onSignupClick }: LoginFormProps) {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simple validation
    if (!email || !password) {
      setError("Please enter both email and password")
      setIsLoading(false)
      return
    }

    const result = await login(email, password)

    if (result.success) {
      router.push("/dashboard")
    } else {
      setError(result.error || "Login failed")
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-border">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
          <Building2 className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold text-foreground">Real Estate Manager</CardTitle>
          <CardDescription className="text-muted-foreground">Sign in to access your property dashboard</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@realestate.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background border-border text-foreground"
            />
          </div>
          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
          <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">Demo: admin@realestate.com / admin123</p>
            <Button variant="link" onClick={onSignupClick} className="text-sm">
              Don't have an account? Sign up
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
