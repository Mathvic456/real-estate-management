"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Building2, LogOut, Sun, Moon } from "lucide-react"
import { useTheme } from "./theme-provider"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  const handleLogout = () => {
    localStorage.removeItem("realestate_user")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-30 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary flex items-center justify-center">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-base sm:text-lg text-foreground">Real Estate Manager</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                  Property Management System
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                id="theme-toggle"
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="gap-2 border-border text-foreground hover:bg-accent bg-transparent"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2 border-border text-foreground hover:bg-accent bg-transparent"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-4 sm:py-8">{children}</main>
    </div>
  )
}
