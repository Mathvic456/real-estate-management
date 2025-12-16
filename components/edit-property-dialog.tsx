"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Property } from "@/types/property"

interface EditPropertyDialogProps {
  property: Property
  onEdit: (property: Property) => void
  onClose: () => void
}

export default function EditPropertyDialog({ property, onEdit, onClose }: EditPropertyDialogProps) {
  const [formData, setFormData] = useState({
    name: property.name,
    rent: property.rent.toString(),
    occupant: property.occupant || "",
    occupantEmail: property.occupantEmail || "",
    occupantPhone: property.occupantPhone || "",
    stayPeriod: property.stayPeriod || "",
    leaseStartDate: property.leaseStartDate || "",
    leaseEndDate: property.leaseEndDate || "",
    status: property.status,
    propertyType: property.propertyType || ("" as "" | "apartment" | "house" | "commercial" | "land"),
    address: property.address || "",
    bedrooms: property.bedrooms?.toString() || "",
    bathrooms: property.bathrooms?.toString() || "",
    squareFeet: property.squareFeet?.toString() || "",
    paymentStatus: property.paymentStatus,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.rent) {
      alert("Property name and rent are required")
      return
    }

    const updatedProperty: Property = {
      ...property,
      name: formData.name,
      rent: Number.parseFloat(formData.rent),
      occupant: formData.occupant || undefined,
      occupantEmail: formData.occupantEmail || undefined,
      occupantPhone: formData.occupantPhone || undefined,
      stayPeriod: formData.stayPeriod || undefined,
      leaseStartDate: formData.leaseStartDate || undefined,
      leaseEndDate: formData.leaseEndDate || undefined,
      status: formData.status,
      propertyType: formData.propertyType || undefined,
      address: formData.address || undefined,
      bedrooms: formData.bedrooms ? Number.parseInt(formData.bedrooms) : undefined,
      bathrooms: formData.bathrooms ? Number.parseFloat(formData.bathrooms) : undefined,
      squareFeet: formData.squareFeet ? Number.parseInt(formData.squareFeet) : undefined,
      paymentStatus: formData.paymentStatus,
    }

    onEdit(updatedProperty)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Property</DialogTitle>
          <DialogDescription className="text-muted-foreground">Update the property details below</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-name" className="text-foreground">
                Property Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                placeholder="e.g., Sunset Apartments Unit 101"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-background border-border text-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-rent" className="text-foreground">
                Monthly Rent (₦) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-rent"
                type="number"
                placeholder="e.g., 150000"
                value={formData.rent}
                onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                className="bg-background border-border text-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-propertyType" className="text-foreground">
                Property Type
              </Label>
              <Select
                value={formData.propertyType}
                onValueChange={(value: "apartment" | "house" | "commercial" | "land") =>
                  setFormData({ ...formData, propertyType: value })
                }
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-address" className="text-foreground">
                Address
              </Label>
              <Input
                id="edit-address"
                placeholder="e.g., 123 Main Street, Lagos"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-bedrooms" className="text-foreground">
                Bedrooms
              </Label>
              <Input
                id="edit-bedrooms"
                type="number"
                placeholder="e.g., 3"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-bathrooms" className="text-foreground">
                Bathrooms
              </Label>
              <Input
                id="edit-bathrooms"
                type="number"
                step="0.5"
                placeholder="e.g., 2"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-squareFeet" className="text-foreground">
                Square Feet
              </Label>
              <Input
                id="edit-squareFeet"
                type="number"
                placeholder="e.g., 1200"
                value={formData.squareFeet}
                onChange={(e) => setFormData({ ...formData, squareFeet: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status" className="text-foreground">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: "vacant" | "occupied" | "maintenance") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacant">Vacant</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-occupant" className="text-foreground">
                Occupant Name
              </Label>
              <Input
                id="edit-occupant"
                placeholder="e.g., John Doe (optional)"
                value={formData.occupant}
                onChange={(e) => setFormData({ ...formData, occupant: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-occupantEmail" className="text-foreground">
                Occupant Email
              </Label>
              <Input
                id="edit-occupantEmail"
                type="email"
                placeholder="e.g., john@example.com"
                value={formData.occupantEmail}
                onChange={(e) => setFormData({ ...formData, occupantEmail: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-occupantPhone" className="text-foreground">
                Occupant Phone
              </Label>
              <Input
                id="edit-occupantPhone"
                type="tel"
                placeholder="e.g., +234 800 000 0000"
                value={formData.occupantPhone}
                onChange={(e) => setFormData({ ...formData, occupantPhone: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-leaseStartDate" className="text-foreground">
                Lease Start Date
              </Label>
              <Input
                id="edit-leaseStartDate"
                type="date"
                value={formData.leaseStartDate}
                onChange={(e) => setFormData({ ...formData, leaseStartDate: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-leaseEndDate" className="text-foreground">
                Lease End Date
              </Label>
              <Input
                id="edit-leaseEndDate"
                type="date"
                value={formData.leaseEndDate}
                onChange={(e) => setFormData({ ...formData, leaseEndDate: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-stayPeriod" className="text-foreground">
                Stay Period Description
              </Label>
              <Input
                id="edit-stayPeriod"
                placeholder="e.g., Jan 2025 - Dec 2025"
                value={formData.stayPeriod}
                onChange={(e) => setFormData({ ...formData, stayPeriod: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-paymentStatus" className="text-foreground">
                Payment Status
              </Label>
              <Select
                value={formData.paymentStatus}
                onValueChange={(value: "paid" | "pending" | "overdue") =>
                  setFormData({ ...formData, paymentStatus: value })
                }
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <Button type="submit" className="flex-1 bg-primary text-primary-foreground">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
