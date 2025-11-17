import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"

interface ServiceCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
}

export function ServiceCard({ title, description, icon: Icon, href }: ServiceCardProps) {
  return (
    <Card className="flex flex-col h-full bg-blue-900">
      <CardHeader>
        <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-white">{title}</CardTitle>
        <CardDescription className="text-white">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-white">
          Explore our {title.toLowerCase()} options and find the perfect solution for your needs.
        </p>
      </CardContent>
      <CardFooter>
        <Link href={href} className="w-full">
          <Button variant="outline" className="w-full text-black border-white hover:bg-white/20">
            Learn More
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}