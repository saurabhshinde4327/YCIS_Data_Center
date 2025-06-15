import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface PriceCardProps {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  popular?: boolean
  icon: LucideIcon
}

export function PriceCard({ name, price, period, description, features, popular = false, icon: Icon }: PriceCardProps) {
  return (
    <Card className={`flex flex-col ${popular ? "border-primary shadow-lg " : ""}`}>
      {popular && (
        <div className="bg-blue-900 text-primary-foreground text-center py-1 text-sm font-medium ">Most Popular</div>
      )}
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4">
          <span className="text-3xl font-bold">₹{price}</span>
          <span className="text-muted-foreground ml-1">/{period}</span>
        </div>
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
      <CardFooter>
        <Button className="w-full " variant={popular ? "default" : "outline"}>
          Get Started
        </Button>
      </CardFooter>
    </Card>
  )
}
