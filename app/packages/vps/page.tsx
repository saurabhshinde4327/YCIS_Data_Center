import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { PriceCard } from "@/components/price-card"
import { Check } from "lucide-react"

export default function VpsPage() {
  const packages = [
    {
      name: "KVM 3",
      price: "31,188",
      period: "yearly",
      description: "High-performance VPS for resource-intensive applications",
      features: [
        "16 GB RAM",
        "6 vCPU Processor",
        "1 TB SSD Storage",
        "Unlimited Bandwidth",
        "Technical Support",
        "Security and Server Monitoring",
        "SSL Certificate",
      ],
      popular: true,
    },
    {
      name: "KVM 2",
      price: "24,000",
      period: "yearly",
      description: "Balanced VPS for growing applications",
      features: [
        "8 GB RAM",
        "4 vCPU Processor",
        "100 GB SSD Storage",
        "200 Mbps Bandwidth",
        "Technical Support",
        "Security Monitoring",
        "SSL Certificate",
      ],
      popular: false,
    },
    {
      name: "KVM 1",
      price: "14,400",
      period: "yearly",
      description: "Entry-level VPS for small applications",
      features: [
        "4 GB RAM",
        "2 vCPU Processor",
        "50 GB SSD Storage",
        "200 Mbps Bandwidth",
        "Technical Support",
        "Basic Monitoring",
        "SSL Certificate",
      ],
      popular: false,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <PageHeader
        title="VPS Hosting Packages"
        description="Virtual Private Server solutions with dedicated resources"
      />
      <main className="flex-1">
        <section className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
