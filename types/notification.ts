export interface Notification {
  id: string
  propertyId: string
  propertyName: string
  recipientName: string
  recipientEmail?: string
  subject: string
  message: string
  type: "general" | "reminder" | "maintenance" | "payment" | "announcement"
  status: "sent" | "pending" | "failed"
  sentAt: string
  createdAt: string
}
