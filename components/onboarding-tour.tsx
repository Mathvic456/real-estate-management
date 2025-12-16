"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react"

interface OnboardingStep {
  id: string
  title: string
  description: string
  targetId?: string
  position?: "top" | "bottom" | "left" | "right"
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to Real Estate Manager!",
    description: "Let's take a quick tour to help you get started with managing your properties effectively.",
  },
  {
    id: "add-property",
    title: "Add Your First Property",
    description:
      "Click the 'Add Property' button to create your first property listing. You can add details like name, rent, occupant information, and lease dates.",
    targetId: "add-property-btn",
  },
  {
    id: "property-stats",
    title: "Monitor Your Dashboard",
    description:
      "These cards show key metrics: total properties, occupied units, total rent, vacancies, overdue payments, and expiring leases.",
    targetId: "property-stats",
  },
  {
    id: "tabs",
    title: "Navigate Between Sections",
    description:
      "Use these tabs to switch between Properties, Payment History, and Notification History. Keep track of all your activities in one place.",
    targetId: "dashboard-tabs",
  },
  {
    id: "theme",
    title: "Switch Themes",
    description:
      "Toggle between light and dark mode using the theme switcher in the header for your preferred viewing experience.",
    targetId: "theme-toggle",
  },
  {
    id: "complete",
    title: "You're All Set!",
    description: "You're ready to start managing your properties. Add your first property to get started!",
  },
]

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("realestate_onboarding_complete")
    if (!hasSeenTour) {
      // Show onboarding after a brief delay for DOM to be ready
      setTimeout(() => setIsOpen(true), 1000)
    }
  }, [])

  useEffect(() => {
    if (isOpen && onboardingSteps[currentStep].targetId) {
      const element = document.getElementById(onboardingSteps[currentStep].targetId!)
      if (element) {
        setHighlightedElement(element)
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        element.classList.add("onboarding-highlight")
      }
    } else if (highlightedElement) {
      highlightedElement.classList.remove("onboarding-highlight")
      setHighlightedElement(null)
    }

    return () => {
      if (highlightedElement) {
        highlightedElement.classList.remove("onboarding-highlight")
      }
    }
  }, [currentStep, isOpen])

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem("realestate_onboarding_complete", "true")
    setIsOpen(false)
    if (highlightedElement) {
      highlightedElement.classList.remove("onboarding-highlight")
    }
  }

  const handleSkip = () => {
    localStorage.setItem("realestate_onboarding_complete", "true")
    setIsOpen(false)
    if (highlightedElement) {
      highlightedElement.classList.remove("onboarding-highlight")
    }
  }

  if (!isOpen) return null

  const step = onboardingSteps[currentStep]
  const isLastStep = currentStep === onboardingSteps.length - 1

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 animate-in fade-in" />

      {/* Onboarding Card */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4 animate-in zoom-in slide-in-from-bottom-4">
        <Card className="border-2 border-primary shadow-2xl">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  {isLastStep && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {step.title}
                </CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSkip} className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress indicator */}
            <div className="flex gap-1">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    index <= currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {onboardingSteps.length}
              </div>
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button variant="outline" size="sm" onClick={handlePrevious} className="gap-1 bg-transparent">
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </Button>
                )}
                {!isLastStep ? (
                  <Button size="sm" onClick={handleNext} className="gap-1">
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleComplete} className="gap-1">
                    Get Started
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
