"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import DashboardLayout from "@/components/dashboard-layout"
import PropertyList from "@/components/property-list"
import PropertyStats from "@/components/property-stats"
import AddPropertyDialog from "@/components/add-property-dialog"
import NotificationHistory from "@/components/notification-history"
import PaymentHistory from "@/components/payment-history"
import OnboardingTour from "@/components/onboarding-tour"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Property, Notification, Payment } from "@/types/property"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/")
        return
      }

      if (user?.isNewUser) {
        setShowOnboarding(true)
        const updatedUser = { ...user, isNewUser: false }
        localStorage.setItem("realestate_user", JSON.stringify(updatedUser))
      }

      loadUserData()
    }
  }, [authLoading, isAuthenticated, user, router])

  const loadUserData = () => {
    if (!user) return

    const storageKeyProperties = `realestate_properties_${user.id}`
    const storedProperties = localStorage.getItem(storageKeyProperties)
    if (storedProperties) {
      const parsedProperties = JSON.parse(storedProperties)
      setProperties(parsedProperties)
    }

    const storageKeyNotifications = `realestate_notifications_${user.id}`
    const storedNotifications = localStorage.getItem(storageKeyNotifications)
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications))
    }

    const storageKeyPayments = `realestate_payments_${user.id}`
    const storedPayments = localStorage.getItem(storageKeyPayments)
    if (storedPayments) {
      setPayments(JSON.parse(storedPayments))
    }

    setIsLoading(false)
  }

  const handleAddProperty = (property: Property) => {
    if (!user) return

    const propertyWithUser = { ...property, userId: user.id }
    const newProperties = [...properties, propertyWithUser]
    setProperties(newProperties)
    const storageKeyProperties = `realestate_properties_${user.id}`
    localStorage.setItem(storageKeyProperties, JSON.stringify(newProperties))
  }

  const handleDeleteProperty = (id: string) => {
    if (!user) return

    const newProperties = properties.filter((p) => p.id !== id)
    setProperties(newProperties)
    const storageKeyProperties = `realestate_properties_${user.id}`
    localStorage.setItem(storageKeyProperties, JSON.stringify(newProperties))
  }

  const handleEditProperty = (updatedProperty: Property) => {
    if (!user) return

    const newProperties = properties.map((p) => (p.id === updatedProperty.id ? updatedProperty : p))
    setProperties(newProperties)
    const storageKeyProperties = `realestate_properties_${user.id}`
    localStorage.setItem(storageKeyProperties, JSON.stringify(newProperties))
  }

  const handleSendNotification = (notification: Notification) => {
    if (!user) return

    const notificationWithUser = { ...notification, userId: user.id }
    const newNotifications = [...notifications, notificationWithUser]
    setNotifications(newNotifications)
    const storageKeyNotifications = `realestate_notifications_${user.id}`
    localStorage.setItem(storageKeyNotifications, JSON.stringify(newNotifications))
  }

  const handleRecordPayment = (payment: Payment) => {
    if (!user) return

    const paymentWithUser = { ...payment, userId: user.id }
    const newPayments = [...payments, paymentWithUser]
    setPayments(newPayments)
    const storageKeyPayments = `realestate_payments_${user.id}`
    localStorage.setItem(storageKeyPayments, JSON.stringify(newPayments))

    const updatedProperties = properties.map((p) => {
      if (p.id === payment.propertyId) {
        const nextMonth = new Date()
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        return {
          ...p,
          paymentStatus: "paid" as const,
          lastPaymentDate: payment.paymentDate,
          nextPaymentDue: nextMonth.toISOString().split("T")[0],
        }
      }
      return p
    })
    setProperties(updatedProperties)
    localStorage.setItem(storageKeyPayments, JSON.stringify(updatedProperties))
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      {showOnboarding && <OnboardingTour />}

      <div className="space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Property Management</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Manage and track all your real estate properties
            </p>
          </div>
          <div id="add-property-btn">
            <AddPropertyDialog onAdd={handleAddProperty} />
          </div>
        </div>

        <div id="property-stats">
          <PropertyStats properties={properties} />
        </div>

        <Tabs defaultValue="properties" className="w-full" id="dashboard-tabs">
          <TabsList className="bg-muted border border-border w-full sm:w-auto">
            <TabsTrigger value="properties" className="data-[state=active]:bg-background flex-1 sm:flex-initial">
              Properties
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-background flex-1 sm:flex-initial">
              <span className="hidden sm:inline">Payments</span>
              <span className="sm:hidden">Pay</span> ({payments.length})
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-background flex-1 sm:flex-initial">
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Notif</span> ({notifications.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="properties" className="mt-4 sm:mt-6">
            <PropertyList
              properties={properties}
              onDelete={handleDeleteProperty}
              onEdit={handleEditProperty}
              onSendNotification={handleSendNotification}
              onRecordPayment={handleRecordPayment}
            />
          </TabsContent>
          <TabsContent value="payments" className="mt-4 sm:mt-6">
            <PaymentHistory payments={payments} />
          </TabsContent>
          <TabsContent value="notifications" className="mt-4 sm:mt-6">
            <NotificationHistory notifications={notifications} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
