export interface Property {
  id: string
  userId?: string // User who owns this property
  name: string
  rent: number
  occupant?: string
  occupantEmail?: string
  occupantPhone?: string
  stayPeriod?: string
  leaseStartDate?: string
  leaseEndDate?: string
  status: "vacant" | "occupied" | "maintenance"
  propertyType?: "apartment" | "house" | "commercial" | "land"
  address?: string
  bedrooms?: number
  bathrooms?: number
  squareFeet?: number
  createdAt: string
  lastPaymentDate?: string
  nextPaymentDue?: string
  paymentStatus: "paid" | "pending" | "overdue"
}

export interface Notification {
  id: string
  userId?: string // User who sent this notification
  propertyId: string
  propertyName: string
  occupantName: string
  occupantEmail?: string
  subject: string
  message: string
  type: "reminder" | "notice" | "maintenance" | "general" | "payment" | "announcement"
  sentAt: string
}

export interface NotificationTemplate {
  type: "reminder" | "notice" | "maintenance" | "general"
  label: string
  defaultSubject: string
  defaultMessage: string
}

export interface Payment {
  id: string
  userId?: string // User who recorded this payment
  propertyId: string
  propertyName: string
  occupantName: string
  amount: number
  paymentDate: string
  paymentMethod: "cash" | "bank_transfer" | "card" | "check"
  status: "completed" | "pending" | "failed"
  receiptNumber?: string
  notes?: string
  createdAt: string
}
