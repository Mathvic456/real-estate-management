import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Banknote, Calendar, CreditCard, FileText } from "lucide-react"
import type { Payment } from "@/types/property"
import { formatCurrency } from "@/lib/utils"

interface PaymentHistoryProps {
  payments: Payment[]
}

export default function PaymentHistory({ payments }: PaymentHistoryProps) {
  if (payments.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Banknote className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Payment Records</h3>
          <p className="text-muted-foreground text-center">
            Payment records will appear here once you start recording payments
          </p>
        </CardContent>
      </Card>
    )
  }

  const sortedPayments = [...payments].sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
  )

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <div className="space-y-4">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Payment Summary</CardTitle>
          <CardDescription className="text-muted-foreground">
            Total Collected: {formatCurrency(totalAmount)}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {sortedPayments.map((payment) => (
          <Card key={payment.id} className="border-border bg-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base text-foreground">{payment.propertyName}</CardTitle>
                  <CardDescription className="text-muted-foreground mt-1">{payment.occupantName}</CardDescription>
                </div>
                <Badge variant={payment.status === "completed" ? "default" : "secondary"}>{payment.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Amount:</span>
                </div>
                <span className="font-semibold text-foreground text-lg">{formatCurrency(payment.amount)}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Payment Date:</span>
                </div>
                <span className="text-foreground">{new Date(payment.paymentDate).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Method:</span>
                </div>
                <span className="text-foreground capitalize">{payment.paymentMethod.replace("_", " ")}</span>
              </div>

              {payment.receiptNumber && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Receipt:</span>
                  </div>
                  <span className="text-foreground font-mono text-xs">{payment.receiptNumber}</span>
                </div>
              )}

              {payment.notes && (
                <div className="mt-2 p-2 bg-muted rounded text-sm text-muted-foreground">{payment.notes}</div>
              )}

              <div className="text-xs text-muted-foreground pt-2">
                Recorded: {new Date(payment.createdAt).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
