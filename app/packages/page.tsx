import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Server, Mail, Globe } from "lucide-react"

export default function PackagesPage() {
  const packageCategories = [
    {
      title: "Web Hosting",
      description: "Reliable and fast web hosting solutions for your websites",
      icon: Globe,
      href: "/packages/web-hosting",
      color: "bg-blue-500",
    },
    {
      title: "VPS Hosting",
      description: "Virtual Private Server solutions with dedicated resources",
      icon: Server,
      href: "/packages/vps",
      color: "bg-green-500",
    },
    {
      title: "Domain Email",
      description: "Professional email solutions for your business domain",
      icon: Mail,
      href: "/packages/domain-email",
      color: "bg-purple-500",
    },
    {
      title: "Database Hosting",
      description: "Secure and scalable database hosting solutions",
      icon: Database,
      href: "/packages/database-hosting",
      color: "bg-orange-500",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen ">
      <Navbar />
      <PageHeader title="Our Packages" description="Choose the perfect hosting solution for your needs" />
      <main className="flex-1">
        <section className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packageCategories.map((category, index) => (
              <Card key={index} className="flex flex-col h-full">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${category.color} mb-4`}>
                    <category.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Click below to explore our {category.title.toLowerCase()} packages and find the perfect solution for
                    your needs.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href={category.href} className="w-full">
                    <Button className="w-full">View Packages</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
