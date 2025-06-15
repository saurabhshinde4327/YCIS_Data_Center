"use client"
// Remove unused import since Analytics is not used in the code
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroSection } from "@/components/hero-section"
import { ServiceCard } from "@/components/service-card"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Database, Server, Mail, Globe } from "lucide-react"
import { ClientLogoSlider } from "@/components/client-logo-slider"
import { AboutInstitute } from "@/components/about-institute"
import { useState, useEffect } from "react"
import { Analytics } from "@vercel/analytics/next"

const technologies = [
  { name: "Linux", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Tux.svg/1200px-Tux.svg.png" },
  { name: "Apache", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Apache_Feather_Logo.svg/1200px-Apache_Feather_Logo.svg.png" },
  { name: "MySQL", logo: "https://www.mysql.com/common/logos/logo-mysql-170x115.png" },
  { name: "PHP", logo: "https://www.php.net/images/logos/php-logo.svg" },
  { name: "NGINX", logo: "https://nginx.org/nginx.png" },
  { name: "Docker", logo: "https://www.docker.com/wp-content/uploads/2022/03/vertical-logo-monochromatic.png" },
  { name: "Kubernetes", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Kubernetes_logo_without_workmark.svg/1200px-Kubernetes_logo_without_workmark.svg.png" },
  { name: "Postfix", logo: "Mail.svg" },
  { name: "Grafana", logo: "Grafana.svg" },
]

function TechnologySlider() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % technologies.length)
    }, 3000) // Change slide every 3 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full max-w-3xl mx-auto overflow-hidden py-4">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {technologies.map((tech, index) => (
          <div key={index} className="flex-shrink-0 w-full flex flex-col items-center justify-center">
            <img src={tech.logo} alt={`${tech.name} logo`} className="h-16 w-auto" />
            <p className="mt-2 text-base font-semibold text-center">{tech.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <HeroSection
          title="Built for Performance. Powered by Innovation."
          subtitle="Our Data Center delivers reliable and high-performance solutions for all your hosting needs.
From VPS and web hosting to professional email and domain services — everything is under one roof.
We offer secure, scalable infrastructure built for speed and uptime.
Easily manage your websites, databases, and emails with powerful tools and expert support.
Whether you're a startup or enterprise, we make hosting simple, seamless, and secure."
          description="Providing reliable hosting solutions for your digital needs"
        />

        <section className="container py-8">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-2 text-center">
            <h2 className="font-heading text-2xl leading-[1.1] sm:text-2xl md:text-4xl">Technologies Used</h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-base sm:leading-6">
              We leverage industry-leading technologies to ensure top performance and reliability
            </p>
          </div>
          <TechnologySlider />
        </section>

        <section className="container py-12 md:py-24 lg:py-32">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Our Services</h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Explore our range of hosting solutions designed to meet your specific requirements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <ServiceCard
              title="Web Hosting"
              description="Reliable and fast web hosting solutions for your websites"
              icon={Globe}
              href="/packages/web-hosting"
            />
            <ServiceCard
              title="VPS Hosting"
              description="Virtual Private Server solutions with dedicated resources"
              icon={Server}
              href="/packages/vps"
            />
            <ServiceCard
              title="Domain Email"
              description="Professional email solutions for your business domain"
              icon={Mail}
              href="/packages/domain-email"
            />
            <ServiceCard
              title="Database Hosting"
              description="Secure and scalable database hosting solutions"
              icon={Database}
              href="/packages/database-hosting"
            />
          </div>
        </section>

        <ClientLogoSlider />

        <section className="bg-muted py-12 md:py-24 lg:py-32">
          <div className="container mx-auto">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Why Choose Us?</h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                YCIS Data Center provides top-notch hosting services with excellent support
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="bg-blue-900 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-2 text-white">Reliable Infrastructure</h3>
                <p className="text-white">
                  Our state-of-the-art data center ensures maximum uptime and performance.
                </p>
              </div>
              <div className="bg-blue-900 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-2 text-white">Technical Support</h3>
                <p className="text-white">
                  Dedicated support team available to assist you with any technical issues.
                </p>
              </div>
              <div className="bg-blue-900 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-2 text-white">Flexible Solutions</h3>
                <p className="text-white">
                  Customizable packages to meet your specific requirements and budget.
                </p>
              </div>
            </div>
          </div>
        </section>

        <AboutInstitute />

        <section className="container py-12 md:py-24 lg:py-32 bg-blue-900">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl text-white">
              Ready to Get Started?
            </h2>
            <p className="max-w-[85%] leading-normal text-white sm:text-lg sm:leading-7">
              Explore our packages and find the perfect solution for your needs
            </p>
            <Link href="/packages">
              <Button size="lg" className="mt-4 text-blue-900 bg-white hover:bg-gray-200">
                View All Packages
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}