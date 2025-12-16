"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Clock, CheckCircle2, XCircle, Mail } from "lucide-react"
import type { Notification } from "@/types/notification"

interface NotificationHistoryProps {
  notifications: Notification[]
}

export default function NotificationHistory({ notifications }: NotificationHistoryProps) {
  const getStatusIcon = (status: Notification["status"]) => {
    switch (status) {
      case "sent":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "general":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "reminder":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "maintenance":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case "payment":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "announcement":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (notifications.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Bell className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Notifications Sent</h3>
          <p className="text-muted-foreground text-center">
            Notification history will appear here once you start sending notifications to residents
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card key={notification.id} className="border-border bg-card hover:border-primary/30 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-base text-foreground truncate">{notification.subject}</CardTitle>
                  {getStatusIcon(notification.status)}
                </div>
                <CardDescription className="text-sm text-muted-foreground">
                  To: {notification.recipientName} • {notification.propertyName}
                </CardDescription>
              </div>
              <Badge variant="outline" className={`capitalize shrink-0 ${getTypeColor(notification.type)}`}>
                {notification.type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-foreground/80 leading-relaxed">{notification.message}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDate(notification.sentAt)}</span>
              </div>
              {notification.recipientEmail && (
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  <span>{notification.recipientEmail}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
