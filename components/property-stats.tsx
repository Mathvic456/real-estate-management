import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, Banknote, Calendar, AlertTriangle, CheckCircle } from "lucide-react"
import type { Property } from "@/types/property"
import { formatCurrency, getDaysUntilExpiry } from "@/lib/utils"

interface PropertyStatsProps {
  properties: Property[]
}

export default function PropertyStats({ properties }: PropertyStatsProps) {
  const totalProperties = properties.length
  const occupiedProperties = properties.filter((p) => p.occupant).length
  const totalRent = properties.reduce((sum, p) => sum + p.rent, 0)
  const vacantProperties = totalProperties - occupiedProperties
  const overduePayments = properties.filter((p) => p.paymentStatus === "overdue").length
  const expiringSoon = properties.filter((p) => {
    const days = getDaysUntilExpiry(p.leaseEndDate)
    return days !== null && days > 0 && days <= 30
  }).length

  const stats = [
    {
      title: "Total Properties",
      value: totalProperties,
      icon: Building2,
      color: "text-primary",
    },
    {
      title: "Occupied",
      value: occupiedProperties,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Total Rent",
      value: formatCurrency(totalRent),
      icon: Banknote,
      color: "text-primary",
    },
    {
      title: "Vacant",
      value: vacantProperties,
      icon: Calendar,
      color: "text-muted-foreground",
    },
    {
      title: "Overdue Payments",
      value: overduePayments,
      icon: AlertTriangle,
      color: overduePayments > 0 ? "text-destructive" : "text-muted-foreground",
    },
    {
      title: "Expiring Soon",
      value: expiringSoon,
      icon: CheckCircle,
      color: expiringSoon > 0 ? "text-yellow-500" : "text-muted-foreground",
    },
  ]

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-border bg-card hover:border-primary/50 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
