"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Property, Payment } from "@/types/property"
import { formatCurrency } from "@/lib/utils"

interface RecordPaymentDialogProps {
  property: Property
  onRecord: (payment: Payment) => void
  onClose: () => void
}

export default function RecordPaymentDialog({ property, onRecord, onClose }: RecordPaymentDialogProps) {
  const [formData, setFormData] = useState({
    amount: property.rent.toString(),
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "bank_transfer" as "cash" | "bank_transfer" | "card" | "check",
    receiptNumber: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.amount || !formData.paymentDate) {
      alert("Amount and payment date are required")
      return
    }

    const payment: Payment = {
      id: crypto.randomUUID(),
      propertyId: property.id,
      propertyName: property.name,
      occupantName: property.occupant || "Unknown",
      amount: Number.parseFloat(formData.amount),
      paymentDate: formData.paymentDate,
      paymentMethod: formData.paymentMethod,
      status: "completed",
      receiptNumber: formData.receiptNumber || undefined,
      notes: formData.notes || undefined,
      createdAt: new Date().toISOString(),
    }

    onRecord(payment)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Record Payment</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Record rent payment for {property.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="text-foreground">Occupant</Label>
            <Input value={property.occupant || "Unknown"} disabled className="bg-muted border-border text-foreground" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-foreground">
              Amount (₦) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="bg-background border-border text-foreground"
              required
            />
            <p className="text-xs text-muted-foreground">Expected: {formatCurrency(property.rent)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentDate" className="text-foreground">
              Payment Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="paymentDate"
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              className="bg-background border-border text-foreground"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod" className="text-foreground">
              Payment Method <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value: "cash" | "bank_transfer" | "card" | "check") =>
                setFormData({ ...formData, paymentMethod: value })
              }
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="check">Check</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiptNumber" className="text-foreground">
              Receipt Number
            </Label>
            <Input
              id="receiptNumber"
              placeholder="e.g., REC-2025-001"
              value={formData.receiptNumber}
              onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this payment..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-background border-border text-foreground min-h-[80px]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border text-foreground hover:bg-accent bg-transparent"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-green-600 text-white hover:bg-green-700">
              Record Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
