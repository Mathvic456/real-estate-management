"use client"

import { useState } from "react"
import LoginForm from "@/components/login-form"
import SignupForm from "@/components/signup-form"

export default function HomePage() {
  const [showSignup, setShowSignup] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {showSignup ? (
        <SignupForm onBackToLogin={() => setShowSignup(false)} />
      ) : (
        <LoginForm onSignupClick={() => setShowSignup(true)} />
      )}
    </div>
  )
}
