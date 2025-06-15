import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { PriceCard } from "@/components/price-card"
import { Check } from "lucide-react"

export default function DatabaseHostingPage() {
  const packages = [
    {
      name: "Enterprise DB",
      price: "2,000",
      period: "yearly",
      description: "For large databases with high performance requirements",
      features: [
        "20 GB SSD Storage",
        "Unlimited Databases",
        "Daily Backups",
        "High Performance",
        "Technical Support",
        "Database Optimization",
        "Monitoring Tools",
      ],
      popular: false,
    },
    {
      name: "Advanced DB",
      price: "1,500",
      period: "yearly",
      description: "For medium-sized databases with good performance",
      features: [
        "15 GB SSD Storage",
        "Unlimited Databases",
        "Daily Backups",
        "Good Performance",
        "Technical Support",
        "Basic Monitoring",
      ],
      popular: true,
    },
    {
      name: "Standard DB",
      price: "1,000",
      period: "yearly",
      description: "For small to medium databases",
      features: ["10 GB SSD Storage", "Unlimited Databases", "Weekly Backups", "Standard Performance", "Email Support"],
      popular: false,
    },
    {
      name: "Basic DB",
      price: "500",
      period: "yearly",
      description: "For small databases with basic needs",
      features: ["5 GB SSD Storage", "Up to 5 Databases", "Weekly Backups", "Standard Performance", "Email Support"],
      popular: false,
    },
    {
      name: "Micro DB",
      price: "110",
      period: "yearly",
      description: "For minimal database needs",
      features: ["1 GB SSD Storage", "1 Database", "Weekly Backups", "Basic Performance", "Email Support"],
      popular: false,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <PageHeader title="Database Hosting Packages" description="Secure and scalable database hosting solutions" />
      <main className="flex-1">
        <section className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg, index) => (
              <PriceCard
                key={index}
                name={pkg.name}
                price={pkg.price}
                period={pkg.period}
                description={pkg.description}
                features={pkg.features}
                popular={pkg.popular}
                icon={Check}
              />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
