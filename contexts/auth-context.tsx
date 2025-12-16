"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  isNewUser?: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem("realestate_user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error("[v0] Failed to parse stored user:", error)
        localStorage.removeItem("realestate_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get all registered users
      const usersData = localStorage.getItem("realestate_users")
      const users = usersData ? JSON.parse(usersData) : []

      // Check if user exists
      const foundUser = users.find((u: any) => u.email === email && u.password === password)

      if (foundUser) {
        const userToStore = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          createdAt: foundUser.createdAt,
          isNewUser: false,
        }
        setUser(userToStore)
        localStorage.setItem("realestate_user", JSON.stringify(userToStore))
        return { success: true }
      }

      // Check demo credentials
      if (email === "admin@realestate.com" && password === "admin123") {
        const demoUser = {
          id: "demo-admin",
          email,
          name: "Admin",
          createdAt: new Date().toISOString(),
          isNewUser: false,
        }
        setUser(demoUser)
        localStorage.setItem("realestate_user", JSON.stringify(demoUser))
        return { success: true }
      }

      return { success: false, error: "Invalid email or password" }
    } catch (error) {
      console.error("[v0] Login error:", error)
      return { success: false, error: "An error occurred during login" }
    }
  }

  const signup = async (
    email: string,
    password: string,
    name: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get all registered users
      const usersData = localStorage.getItem("realestate_users")
      const users = usersData ? JSON.parse(usersData) : []

      // Check if email already exists
      const existingUser = users.find((u: any) => u.email === email)
      if (existingUser) {
        return { success: false, error: "Email already registered" }
      }

      // Create new user
      const newUser = {
        id: `user_${Date.now()}`,
        email,
        password,
        name,
        createdAt: new Date().toISOString(),
      }

      // Save to users array
      users.push(newUser)
      localStorage.setItem("realestate_users", JSON.stringify(users))

      // Set as current user with isNewUser flag
      const userToStore = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        createdAt: newUser.createdAt,
        isNewUser: true,
      }
      setUser(userToStore)
      localStorage.setItem("realestate_user", JSON.stringify(userToStore))

      return { success: true }
    } catch (error) {
      console.error("[v0] Signup error:", error)
      return { success: false, error: "An error occurred during signup" }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("realestate_user")
    router.push("/")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isLoading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
