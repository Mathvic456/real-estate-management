"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, AlertCircle, CheckCircle2 } from "lucide-react"
import type { Property } from "@/types/property"
import type { Notification } from "@/types/notification"

interface SendNotificationDialogProps {
  property: Property
  onSend: (notification: Notification) => void
  onClose: () => void
}

export default function SendNotificationDialog({ property, onSend, onClose }: SendNotificationDialogProps) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [type, setType] = useState<Notification["type"]>("general")
  const [recipientEmail, setRecipientEmail] = useState(property.occupantEmail || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sendStatus, setSendStatus] = useState<"idle" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!property.occupant) {
      alert("This property has no occupant to send notification to.")
      return
    }

    if (!subject.trim() || !message.trim()) {
      alert("Please fill in all required fields.")
      return
    }

    setIsSubmitting(true)
    setSendStatus("idle")

    try {
      // If email is provided, attempt to send actual email
      if (recipientEmail && recipientEmail.trim()) {
        await sendEmailNotification({
          to: recipientEmail,
          subject,
          message,
          propertyName: property.name,
          occupantName: property.occupant,
        })
      }

      // Create notification record
      const notification: Notification = {
        id: crypto.randomUUID(),
        propertyId: property.id,
        propertyName: property.name,
        recipientName: property.occupant,
        recipientEmail: recipientEmail || undefined,
        subject,
        message,
        type,
        status: recipientEmail ? "sent" : "sent",
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }

      onSend(notification)
      setSendStatus("success")

      // Close after showing success
      setTimeout(() => {
        setIsSubmitting(false)
        onClose()
      }, 1500)
    } catch (error) {
      console.error("[v0] Email sending failed:", error)
      setSendStatus("error")
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-border sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-foreground">Send Notification</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Send a notification to the resident at {property.name}
          </DialogDescription>
        </DialogHeader>

        {sendStatus === "success" && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <p className="text-sm text-green-500">Notification sent successfully!</p>
          </div>
        )}

        {sendStatus === "error" && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-sm text-destructive">Failed to send email. Notification saved locally.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-foreground">
              Recipient
            </Label>
            <Input
              id="recipient"
              value={property.occupant || "No occupant"}
              disabled
              className="bg-muted/50 border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Recipient Email {recipientEmail && <span className="text-green-500 text-xs">(Email will be sent)</span>}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="resident@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              {recipientEmail ? "Notification will be sent via email" : "Email required for delivery"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-foreground">
              Notification Type
            </Label>
            <Select value={type} onValueChange={(value) => setType(value as Notification["type"])}>
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="text-foreground">
              Subject *
            </Label>
            <Input
              id="subject"
              placeholder="e.g., Monthly Rent Reminder"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-foreground">
              Message *
            </Label>
            <Textarea
              id="message"
              placeholder="Enter your notification message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={6}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-border text-foreground hover:bg-accent bg-transparent"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSubmitting || !property.occupant}
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? "Sending..." : "Send Notification"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

async function sendEmailNotification(data: {
  to: string
  subject: string
  message: string
  propertyName: string
  occupantName: string
}): Promise<void> {
  const response = await fetch("/api/send-notification", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Failed to send email notification")
  }
}
