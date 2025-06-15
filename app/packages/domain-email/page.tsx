import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { PriceCard } from "@/components/price-card"
import { Check } from "lucide-react"

export default function DomainEmailPage() {
  const packages = [
    {
      name: "Business Email",
      price: "3,000",
      period: "yearly",
      description: "For businesses requiring multiple email accounts",
      features: [
        "15 Email Accounts",
        "5 GB Storage per Account",
        "Webmail Access",
        "POP3/IMAP Support",
        "Spam Protection",
        "Email Forwarding",
        "Technical Support",
      ],
      popular: true,
    },
    {
      name: "Standard Email",
      price: "2,000",
      period: "yearly",
      description: "For small businesses with moderate email needs",
      features: [
        "10 Email Accounts",
        "3 GB Storage per Account",
        "Webmail Access",
        "POP3/IMAP Support",
        "Spam Protection",
        "Email Forwarding",
        "Technical Support",
      ],
      popular: false,
    },
    {
      name: "Basic Email",
      price: "1,000",
      period: "yearly",
      description: "For individuals or small teams",
      features: [
        "5 Email Accounts",
        "2 GB Storage per Account",
        "Webmail Access",
        "POP3/IMAP Support",
        "Spam Protection",
        "Email Forwarding",
      ],
      popular: false,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <PageHeader title="Domain Email Packages" description="Professional email solutions for your business domain" />
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
