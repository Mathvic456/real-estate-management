"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import type { Property } from "@/types/property"

interface AddPropertyDialogProps {
  onAdd: (property: Property) => void
}

export default function AddPropertyDialog({ onAdd }: AddPropertyDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    rent: "",
    occupant: "",
    occupantEmail: "",
    occupantPhone: "",
    stayPeriod: "",
    leaseStartDate: "",
    leaseEndDate: "",
    status: "vacant" as "vacant" | "occupied" | "maintenance",
    propertyType: "" as "" | "apartment" | "house" | "commercial" | "land",
    address: "",
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
  })

  useEffect(() => {
    if (formData.propertyType === "land") {
      setFormData((prev) => ({
        ...prev,
        bedrooms: "",
        bathrooms: "",
      }))
    }
  }, [formData.propertyType])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.rent) {
      alert("Property name and rent are required")
      return
    }

    if (!formData.propertyType) {
      alert("Please select a property type")
      return
    }

    const today = new Date()
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)

    const newProperty: Property = {
      id: crypto.randomUUID(),
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
      createdAt: new Date().toISOString(),
      paymentStatus: formData.occupant ? "pending" : "paid",
      nextPaymentDue: formData.occupant ? nextMonth.toISOString().split("T")[0] : undefined,
    }

    onAdd(newProperty)
    setFormData({
      name: "",
      rent: "",
      occupant: "",
      occupantEmail: "",
      occupantPhone: "",
      stayPeriod: "",
      leaseStartDate: "",
      leaseEndDate: "",
      status: "vacant",
      propertyType: "",
      address: "",
      bedrooms: "",
      bathrooms: "",
      squareFeet: "",
    })
    setOpen(false)
  }

  const shouldShowField = (field: string): boolean => {
    if (!formData.propertyType) return true // Show all fields if no type selected yet

    switch (formData.propertyType) {
      case "land":
        // Land doesn't need bedrooms/bathrooms
        return !["bedrooms", "bathrooms"].includes(field)
      case "commercial":
        // Commercial properties may not track bedrooms/bathrooms
        return !["bedrooms", "bathrooms"].includes(field)
      case "apartment":
      case "house":
        // Residential properties show all fields
        return true
      default:
        return true
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary text-primary-foreground">
          <Plus className="w-4 h-4" />
          Add Property
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Property</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill in the details to add a new property to your portfolio
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name" className="text-foreground">
                Property Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Sunset Apartments Unit 101"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-background border-border text-foreground"
                required
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="propertyType" className="text-foreground">
                Property Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.propertyType}
                onValueChange={(value: "apartment" | "house" | "commercial" | "land") =>
                  setFormData({ ...formData, propertyType: value })
                }
                required
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.propertyType === "land" && "Land parcels don't require bedroom/bathroom details"}
                {formData.propertyType === "commercial" && "Commercial properties focus on size and location"}
                {formData.propertyType === "apartment" && "Residential unit in a multi-unit building"}
                {formData.propertyType === "house" && "Single-family residential property"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rent" className="text-foreground">
                Monthly Rent (₦) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="rent"
                type="number"
                placeholder="e.g., 150000"
                value={formData.rent}
                onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                className="bg-background border-border text-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-foreground">
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
              <Label htmlFor="address" className="text-foreground">
                Address
              </Label>
              <Input
                id="address"
                placeholder="e.g., 123 Main Street, Lagos"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>

            {shouldShowField("bedrooms") && (
              <div className="space-y-2">
                <Label htmlFor="bedrooms" className="text-foreground">
                  Bedrooms
                </Label>
                <Input
                  id="bedrooms"
                  type="number"
                  placeholder="e.g., 3"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>
            )}

            {shouldShowField("bathrooms") && (
              <div className="space-y-2">
                <Label htmlFor="bathrooms" className="text-foreground">
                  Bathrooms
                </Label>
                <Input
                  id="bathrooms"
                  type="number"
                  step="0.5"
                  placeholder="e.g., 2"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>
            )}

            <div className={`space-y-2 ${!shouldShowField("bedrooms") ? "col-span-2" : ""}`}>
              <Label htmlFor="squareFeet" className="text-foreground">
                Square Feet {formData.propertyType === "land" && "(Plot Size)"}
              </Label>
              <Input
                id="squareFeet"
                type="number"
                placeholder={formData.propertyType === "land" ? "e.g., 5000" : "e.g., 1200"}
                value={formData.squareFeet}
                onChange={(e) => setFormData({ ...formData, squareFeet: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>

            {formData.status === "occupied" && (
              <>
                <div className="space-y-2 col-span-2 pt-2 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground">Occupant Information</h3>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="occupant" className="text-foreground">
                    Occupant Name
                  </Label>
                  <Input
                    id="occupant"
                    placeholder="e.g., John Doe"
                    value={formData.occupant}
                    onChange={(e) => setFormData({ ...formData, occupant: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupantEmail" className="text-foreground">
                    Occupant Email
                  </Label>
                  <Input
                    id="occupantEmail"
                    type="email"
                    placeholder="e.g., john@example.com"
                    value={formData.occupantEmail}
                    onChange={(e) => setFormData({ ...formData, occupantEmail: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupantPhone" className="text-foreground">
                    Occupant Phone
                  </Label>
                  <Input
                    id="occupantPhone"
                    type="tel"
                    placeholder="e.g., +234 800 000 0000"
                    value={formData.occupantPhone}
                    onChange={(e) => setFormData({ ...formData, occupantPhone: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leaseStartDate" className="text-foreground">
                    Lease Start Date
                  </Label>
                  <Input
                    id="leaseStartDate"
                    type="date"
                    value={formData.leaseStartDate}
                    onChange={(e) => setFormData({ ...formData, leaseStartDate: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leaseEndDate" className="text-foreground">
                    Lease End Date
                  </Label>
                  <Input
                    id="leaseEndDate"
                    type="date"
                    value={formData.leaseEndDate}
                    onChange={(e) => setFormData({ ...formData, leaseEndDate: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="stayPeriod" className="text-foreground">
                    Stay Period Description
                  </Label>
                  <Input
                    id="stayPeriod"
                    placeholder="e.g., Jan 2025 - Dec 2025"
                    value={formData.stayPeriod}
                    onChange={(e) => setFormData({ ...formData, stayPeriod: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border text-foreground hover:bg-accent bg-transparent"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-primary text-primary-foreground">
              Add Property
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
