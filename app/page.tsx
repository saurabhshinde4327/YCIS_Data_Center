"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { HeroSection } from "@/components/hero-section"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { ClientLogoSlider } from "@/components/client-logo-slider"
import { AboutInstitute } from "@/components/about-institute"
import { ShowcaseProjects } from "@/components/showcase-projects"
import { ImageSliderSection } from "@/components/image-slider-section"
import SplashIntro from "@/components/SplashIntro"
import { Check, ArrowRight } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

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
    }, 3000)
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
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 4000) // Hide splash after 4 seconds
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      {showSplash && <SplashIntro />}
      {!showSplash && (
        <div className="animate-fadeIn">
          <Navbar />
        </div>
      )}
      {!showSplash && (
        <main className="flex-1 animate-fadeIn">
          <HeroSection
          title="Built for Performance. Powered by Innovation."
          subtitle="Our Data Center delivers reliable and high-performance solutions for all your hosting needs.
From VPS and web hosting to professional email and domain services — everything is under one roof.
We offer secure, scalable infrastructure built for speed and uptime.
Easily manage your websites, databases, and emails with powerful tools and expert support.
Whether you're a startup or enterprise, we make hosting simple, seamless, and secure."
          description="Providing reliable hosting solutions for your digital needs"
        />

        {/* Popular Packages Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-white to-blue-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Most Popular Packages
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose from our most popular hosting solutions designed to meet your business needs
              </p>
            </div>

            {/* Mobile Horizontal Slider */}
            <div className="block md:hidden mb-8">
              <Carousel 
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {/* Web Hosting - Premium Plan */}
                  <CarouselItem>
                    <div className="p-1">
                      <Card className="flex flex-col hover:shadow-xl transition-shadow border-2 border-gray-200">
                        <CardHeader>
                          <CardTitle>Premium Web Hosting</CardTitle>
                          <CardDescription>Perfect for growing businesses</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                          <ul className="space-y-2">
                            {["50 GB Storage", "Unlimited Bandwidth", "Free SSL Certificate", "24/7 Support", "Weekly Backups"].map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm">
                                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Link href="/packages/web-hosting" className="w-full">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                              View Details <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    </div>
                  </CarouselItem>

                  {/* VPS - KVM 3 */}
                  <CarouselItem>
                    <div className="p-1">
                      <Card className="flex flex-col hover:shadow-xl transition-shadow border-2 border-gray-200">
                        <CardHeader>
                          <CardTitle>KVM 3 VPS</CardTitle>
                          <CardDescription>High-performance VPS solution</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                          <ul className="space-y-2">
                            {["16 GB RAM", "6 vCPU Processor", "1 TB SSD Storage", "Unlimited Bandwidth", "24/7 Support"].map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm">
                                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Link href="/packages/vps" className="w-full">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                              View Details <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    </div>
                  </CarouselItem>

                  {/* Domain Email */}
                  <CarouselItem>
                    <div className="p-1">
                      <Card className="flex flex-col hover:shadow-xl transition-shadow border-2 border-gray-200">
                        <CardHeader>
                          <CardTitle>Domain Email</CardTitle>
                          <CardDescription>Professional email solutions</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                          <ul className="space-y-2">
                            {["Custom Domain Email", "Multiple Mailboxes", "Email Forwarding", "Spam Protection", "Webmail Access"].map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm">
                                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Link href="/packages/domain-email" className="w-full">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                              View Details <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    </div>
                  </CarouselItem>

                  {/* Database Hosting */}
                  <CarouselItem>
                    <div className="p-1">
                      <Card className="flex flex-col hover:shadow-xl transition-shadow border-2 border-gray-200">
                        <CardHeader>
                          <CardTitle>Database Hosting</CardTitle>
                          <CardDescription>Secure database solutions</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                          <ul className="space-y-2">
                            {["MySQL/MariaDB", "PostgreSQL Support", "Automated Backups", "High Availability", "Performance Monitoring"].map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm">
                                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Link href="/packages/database-hosting" className="w-full">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                              View Details <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    </div>
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </div>

            {/* Desktop Grid View */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Web Hosting - Premium Plan */}
              <Card className="flex flex-col hover:shadow-xl transition-shadow border-2 border-gray-200">
                <CardHeader>
                  <CardTitle>Premium Web Hosting</CardTitle>
                  <CardDescription>Perfect for growing businesses</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2">
                    {["50 GB Storage", "Unlimited Bandwidth", "Free SSL Certificate", "24/7 Support", "Weekly Backups"].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/packages/web-hosting" className="w-full">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      View Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* VPS - KVM 3 */}
              <Card className="flex flex-col hover:shadow-xl transition-shadow border-2 border-gray-200">
                <CardHeader>
                  <CardTitle>KVM 3 VPS</CardTitle>
                  <CardDescription>High-performance VPS solution</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2">
                    {["16 GB RAM", "6 vCPU Processor", "1 TB SSD Storage", "Unlimited Bandwidth", "24/7 Support"].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/packages/vps" className="w-full">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      View Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Domain Email */}
              <Card className="flex flex-col hover:shadow-xl transition-shadow border-2 border-gray-200">
                <CardHeader>
                  <CardTitle>Domain Email</CardTitle>
                  <CardDescription>Professional email solutions</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2">
                    {["Custom Domain Email", "Multiple Mailboxes", "Email Forwarding", "Spam Protection", "Webmail Access"].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/packages/domain-email" className="w-full">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      View Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Database Hosting */}
              <Card className="flex flex-col hover:shadow-xl transition-shadow border-2 border-gray-200">
                <CardHeader>
                  <CardTitle>Database Hosting</CardTitle>
                  <CardDescription>Secure database solutions</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2">
                    {["MySQL/MariaDB", "PostgreSQL Support", "Automated Backups", "High Availability", "Performance Monitoring"].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/packages/database-hosting" className="w-full">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      View Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Link href="/contact">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                  Contact Us for Custom Solutions
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Image Slider and Data Center Description Section */}
        <ImageSliderSection />

        <ShowcaseProjects />

        <ClientLogoSlider />

        <section className="bg-muted py-12 md:py-24 lg:py-32">
          <div className="container mx-auto">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="font-heading text-3xl md:text-5xl">Why Choose Us?</h2>
              <p className="max-w-[85%] text-muted-foreground sm:text-lg">
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
            <h2 className="font-heading text-3xl md:text-5xl text-white">Ready to Get Started?</h2>
            <p className="max-w-[85%] text-white sm:text-lg">
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
      )}
      {!showSplash && <Footer />}
    </div>
  )
}
