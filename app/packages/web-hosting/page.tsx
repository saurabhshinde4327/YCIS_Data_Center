import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { PriceCard } from "@/components/price-card"
import { Check } from "lucide-react"

export default function WebHostingPage() {
  const packages = [
    {
      name: "Enterprise Plan",
      description: "For large businesses with high resource needs",
      features: [
        "100 GB Storage",
        "Unlimited Bandwidth",
        "Free SSL Certificate",
        "24/7 Technical Support",
        "Daily Backups",
        "Advanced Security Features",
      ],
      popular: false,
    },
    {
      name: "Premium Plan",
      description: "For growing businesses with moderate resource needs",
      features: [
        "50 GB Storage",
        "Unlimited Bandwidth",
        "Free SSL Certificate",
        "24/7 Technical Support",
        "Weekly Backups",
        "Standard Security Features",
      ],
      popular: true,
    },
    {
      name: "Pro Plan",
      description: "For small businesses with standard resource needs",
      features: [
        "40 GB Storage",
        "Unlimited Bandwidth",
        "Free SSL Certificate",
        "Email Support",
        "Weekly Backups",
        "Basic Security Features",
      ],
      popular: false,
    },
    {
      name: "Basic Plan",
      description: "For small websites with minimal resource needs",
      features: [
        "20 GB Storage",
        "Unlimited Bandwidth",
        "Free SSL Certificate",
        "Email Support",
        "Weekly Backups",
        "Basic Security Features",
      ],
      popular: false,
    },
    {
      name: "Starter Plan",
      description: "For personal websites and blogs",
      features: ["10 GB Storage", "Unlimited Bandwidth", "Free SSL Certificate", "Email Support", "Weekly Backups"],
      popular: false,
    },
    {
      name: "Lite Plan",
      description: "For simple personal websites",
      features: ["5 GB Storage", "Unlimited Bandwidth", "Free SSL Certificate", "Email Support"],
      popular: false,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <PageHeader
        title="Web Hosting Packages"
        description="Reliable and fast web hosting solutions for your websites"
      />
      <main className="flex-1">
        <section className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg, index) => (
              <PriceCard
                key={index}
                name={pkg.name}
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
