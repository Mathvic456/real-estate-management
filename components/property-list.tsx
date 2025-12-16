"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Edit,
  Trash2,
  Building,
  User,
  Banknote,
  Calendar,
  Bell,
  Phone,
  Mail,
  AlertTriangle,
  MapPin,
  Home,
} from "lucide-react"
import type { Property } from "@/types/property"
import EditPropertyDialog from "./edit-property-dialog"
import SendNotificationDialog from "./send-notification-dialog"
import RecordPaymentDialog from "./record-payment-dialog"
import type { Notification, Payment } from "@/types/property"
import { formatCurrency, getDaysUntilExpiry, isLeaseExpiringSoon } from "@/lib/utils"

interface PropertyListProps {
  properties: Property[]
  onDelete: (id: string) => void
  onEdit: (property: Property) => void
  onSendNotification: (notification: Notification) => void
  onRecordPayment: (payment: Payment) => void
}

export default function PropertyList({
  properties,
  onDelete,
  onEdit,
  onSendNotification,
  onRecordPayment,
}: PropertyListProps) {
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [notifyingProperty, setNotifyingProperty] = useState<Property | null>(null)
  const [paymentProperty, setPaymentProperty] = useState<Property | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.occupant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || property.status === statusFilter
    const matchesPayment = paymentFilter === "all" || property.paymentStatus === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
  })

  if (properties.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
          <Building className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">No Properties Yet</h3>
          <p className="text-sm sm:text-base text-muted-foreground text-center mb-4 px-4">
            Get started by adding your first property to the system
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by property name, occupant, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-background border-border text-foreground"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1 sm:w-[150px] bg-background border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="vacant">Vacant</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="flex-1 sm:w-[150px] bg-background border-border">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground">
          Showing {filteredProperties.length} of {properties.length} properties
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredProperties.map((property) => {
          const daysUntilExpiry = getDaysUntilExpiry(property.leaseEndDate)
          const isExpiring = isLeaseExpiringSoon(property.leaseEndDate)

          return (
            <Card
              key={property.id}
              className="border-border bg-card hover:border-primary/50 transition-all duration-200 hover:shadow-lg"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base sm:text-lg text-foreground">{property.name}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
                      ID: {property.id.slice(0, 8)}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2 ml-2">
                    <Badge
                      variant={
                        property.status === "occupied"
                          ? "default"
                          : property.status === "maintenance"
                            ? "destructive"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {property.status}
                    </Badge>
                    <Badge
                      variant={
                        property.paymentStatus === "paid"
                          ? "default"
                          : property.paymentStatus === "overdue"
                            ? "destructive"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {property.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Banknote className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Rent:</span>
                    <span className="font-semibold text-foreground">{formatCurrency(property.rent)}/mo</span>
                  </div>

                  {property.propertyType && (
                    <div className="flex items-center gap-2 text-sm">
                      <Home className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium text-foreground capitalize">{property.propertyType}</span>
                    </div>
                  )}

                  {property.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Address:</span>
                      <span className="font-medium text-foreground text-xs">{property.address}</span>
                    </div>
                  )}

                  {property.occupant && (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">Occupant:</span>
                        <span className="font-medium text-foreground">{property.occupant}</span>
                      </div>

                      {property.occupantEmail && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-3 h-3 text-primary" />
                          <span className="font-medium text-foreground text-xs">{property.occupantEmail}</span>
                        </div>
                      )}

                      {property.occupantPhone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3 text-primary" />
                          <span className="font-medium text-foreground text-xs">{property.occupantPhone}</span>
                        </div>
                      )}

                      {property.leaseEndDate && (
                        <div className={`flex items-center gap-2 text-sm ${isExpiring ? "text-yellow-500" : ""}`}>
                          <Calendar className="w-4 h-4" />
                          <span className="text-muted-foreground">Lease Ends:</span>
                          <span className="font-medium">{new Date(property.leaseEndDate).toLocaleDateString()}</span>
                          {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                            <span className="text-xs">({daysUntilExpiry}d)</span>
                          )}
                        </div>
                      )}

                      {isExpiring && (
                        <div className="flex items-center gap-2 text-xs text-yellow-500 bg-yellow-500/10 p-2 rounded">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Lease expiring soon!</span>
                        </div>
                      )}

                      {property.nextPaymentDue && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground">Next Due:</span>
                          <span className="font-medium text-foreground">
                            {new Date(property.nextPaymentDue).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2 border-border text-foreground hover:bg-accent bg-transparent"
                      onClick={() => setEditingProperty(property)}
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this property?")) {
                          onDelete(property.id)
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                  {property.occupant && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                        onClick={() => setNotifyingProperty(property)}
                      >
                        <Bell className="w-4 h-4" />
                        Send Notification
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 border-green-500/50 text-green-500 hover:bg-green-500 hover:text-white bg-transparent"
                        onClick={() => setPaymentProperty(property)}
                      >
                        <Banknote className="w-4 h-4" />
                        Record Payment
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {editingProperty && (
        <EditPropertyDialog property={editingProperty} onEdit={onEdit} onClose={() => setEditingProperty(null)} />
      )}

      {notifyingProperty && (
        <SendNotificationDialog
          property={notifyingProperty}
          onSend={onSendNotification}
          onClose={() => setNotifyingProperty(null)}
        />
      )}

      {paymentProperty && (
        <RecordPaymentDialog
          property={paymentProperty}
          onRecord={onRecordPayment}
          onClose={() => setPaymentProperty(null)}
        />
      )}
    </>
  )
}
