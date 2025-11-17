import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface PriceCardProps {
  name: string
  description: string
  features: string[]
  popular?: boolean
  icon: LucideIcon
}

export function PriceCard({ name, description, features, popular = false, icon: Icon }: PriceCardProps) {
  return (
    <Card className={`flex flex-col ${popular ? "border-primary shadow-lg " : ""}`}>
      {popular && (
        <div className="bg-blue-900 text-primary-foreground text-center py-1 text-sm font-medium ">Most Popular</div>
      )}
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
