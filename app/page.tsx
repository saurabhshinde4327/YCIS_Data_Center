"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
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
import { Check, ArrowRight, Server, Cloud, Database, Mail, Sparkles } from "lucide-react"
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

  // Scroll animation effect
  useEffect(() => {
    if (showSplash) return

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in-view')
          observer.unobserve(entry.target)
        }
      })
    }, observerOptions)

    // Observe all sections with scroll animation
    const sections = document.querySelectorAll('[data-scroll-animate]')
    sections.forEach((section) => observer.observe(section))

    return () => {
      sections.forEach((section) => observer.unobserve(section))
    }
  }, [showSplash])

  return (
    <div className="flex flex-col min-h-screen">
      {showSplash && <SplashIntro />}
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
        <section 
          data-scroll-animate 
          className="relative py-16 md:py-24 bg-gradient-to-b from-white via-blue-50/50 to-blue-50 overflow-hidden scroll-animate-fade-up"
        >
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              {/* Icon Badge */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-600 rounded-lg blur-lg opacity-50 animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-lg shadow-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                </div>
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Popular Packages</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent mb-4">
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
                      <Card className="flex flex-col hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-300 hover:-translate-y-2 relative overflow-hidden group">
                        {/* Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        {/* Popular Badge */}
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                          Popular
                        </div>
                        <CardHeader className="relative z-10">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                              <Cloud className="h-5 w-5 text-white" />
                            </div>
                            <CardTitle className="text-xl">Premium Web Hosting</CardTitle>
                          </div>
                          <CardDescription className="text-base">Perfect for growing businesses</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 relative z-10">
                          <ul className="space-y-3">
                            {["50 GB Storage", "Unlimited Bandwidth", "Free SSL Certificate", "24/7 Support", "Weekly Backups"].map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-3 text-sm group/item">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center group-hover/item:bg-green-200 transition-colors">
                                  <Check className="h-3 w-3 text-green-600" />
                                </div>
                                <span className="text-gray-700 group-hover/item:text-gray-900 transition-colors">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                        <CardFooter className="relative z-10">
                          <Link href="/packages/web-hosting" className="w-full">
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
                              View Details <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    </div>
                  </CarouselItem>

                  {/* VPS - KVM 3 */}
                  <CarouselItem>
                    <div className="p-1">
                      <Card className="flex flex-col hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-purple-300 hover:-translate-y-2 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                          Best Value
                        </div>
                        <CardHeader className="relative z-10">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md">
                              <Server className="h-5 w-5 text-white" />
                            </div>
                            <CardTitle className="text-xl">KVM 3 VPS</CardTitle>
                          </div>
                          <CardDescription className="text-base">High-performance VPS solution</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 relative z-10">
                          <ul className="space-y-3">
                            {["16 GB RAM", "6 vCPU Processor", "1 TB SSD Storage", "Unlimited Bandwidth", "24/7 Support"].map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-3 text-sm group/item">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center group-hover/item:bg-green-200 transition-colors">
                                  <Check className="h-3 w-3 text-green-600" />
                                </div>
                                <span className="text-gray-700 group-hover/item:text-gray-900 transition-colors">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                        <CardFooter className="relative z-10">
                          <Link href="/packages/vps" className="w-full">
                            <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
                              View Details <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    </div>
                  </CarouselItem>

                  {/* Domain Email */}
                  <CarouselItem>
                    <div className="p-1">
                      <Card className="flex flex-col hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-orange-300 hover:-translate-y-2 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-white to-yellow-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <CardHeader className="relative z-10">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md">
                              <Mail className="h-5 w-5 text-white" />
                            </div>
                            <CardTitle className="text-xl">Domain Email</CardTitle>
                          </div>
                          <CardDescription className="text-base">Professional email solutions</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 relative z-10">
                          <ul className="space-y-3">
                            {["Custom Domain Email", "Multiple Mailboxes", "Email Forwarding", "Spam Protection", "Webmail Access"].map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-3 text-sm group/item">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center group-hover/item:bg-green-200 transition-colors">
                                  <Check className="h-3 w-3 text-green-600" />
                                </div>
                                <span className="text-gray-700 group-hover/item:text-gray-900 transition-colors">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                        <CardFooter className="relative z-10">
                          <Link href="/packages/domain-email" className="w-full">
                            <Button className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
                              View Details <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    </div>
                  </CarouselItem>

                  {/* Database Hosting */}
                  <CarouselItem>
                    <div className="p-1">
                      <Card className="flex flex-col hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-green-300 hover:-translate-y-2 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-white to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <CardHeader className="relative z-10">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md">
                              <Database className="h-5 w-5 text-white" />
                            </div>
                            <CardTitle className="text-xl">Database Hosting</CardTitle>
                          </div>
                          <CardDescription className="text-base">Secure database solutions</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 relative z-10">
                          <ul className="space-y-3">
                            {["MySQL/MariaDB", "PostgreSQL Support", "Automated Backups", "High Availability", "Performance Monitoring"].map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-3 text-sm group/item">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center group-hover/item:bg-green-200 transition-colors">
                                  <Check className="h-3 w-3 text-green-600" />
                                </div>
                                <span className="text-gray-700 group-hover/item:text-gray-900 transition-colors">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                        <CardFooter className="relative z-10">
                          <Link href="/packages/database-hosting" className="w-full">
                            <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
                              View Details <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
              <Card 
                data-scroll-animate 
                className="flex flex-col hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-300 hover:-translate-y-2 relative overflow-hidden group scroll-animate-fade-up"
                style={{ transitionDelay: '0.1s' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                  Popular
                </div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                      <Cloud className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl">Premium Web Hosting</CardTitle>
                  </div>
                  <CardDescription className="text-base">Perfect for growing businesses</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 relative z-10">
                  <ul className="space-y-3">
                    {["50 GB Storage", "Unlimited Bandwidth", "Free SSL Certificate", "24/7 Support", "Weekly Backups"].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm group/item">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center group-hover/item:bg-green-200 transition-colors">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-gray-700 group-hover/item:text-gray-900 transition-colors">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="relative z-10">
                  <Link href="/packages/web-hosting" className="w-full">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
                      View Details <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* VPS - KVM 3 */}
              <Card 
                data-scroll-animate 
                className="flex flex-col hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-purple-300 hover:-translate-y-2 relative overflow-hidden group scroll-animate-fade-up"
                style={{ transitionDelay: '0.2s' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                  Best Value
                </div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md">
                      <Server className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl">KVM 3 VPS</CardTitle>
                  </div>
                  <CardDescription className="text-base">High-performance VPS solution</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 relative z-10">
                  <ul className="space-y-3">
                    {["16 GB RAM", "6 vCPU Processor", "1 TB SSD Storage", "Unlimited Bandwidth", "24/7 Support"].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm group/item">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center group-hover/item:bg-green-200 transition-colors">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-gray-700 group-hover/item:text-gray-900 transition-colors">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="relative z-10">
                  <Link href="/packages/vps" className="w-full">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
                      View Details <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Domain Email */}
              <Card 
                data-scroll-animate 
                className="flex flex-col hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-orange-300 hover:-translate-y-2 relative overflow-hidden group scroll-animate-fade-up"
                style={{ transitionDelay: '0.3s' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-white to-yellow-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl">Domain Email</CardTitle>
                  </div>
                  <CardDescription className="text-base">Professional email solutions</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 relative z-10">
                  <ul className="space-y-3">
                    {["Custom Domain Email", "Multiple Mailboxes", "Email Forwarding", "Spam Protection", "Webmail Access"].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm group/item">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center group-hover/item:bg-green-200 transition-colors">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-gray-700 group-hover/item:text-gray-900 transition-colors">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="relative z-10">
                  <Link href="/packages/domain-email" className="w-full">
                    <Button className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
                      View Details <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Database Hosting */}
              <Card 
                data-scroll-animate 
                className="flex flex-col hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-green-300 hover:-translate-y-2 relative overflow-hidden group scroll-animate-fade-up"
                style={{ transitionDelay: '0.4s' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-white to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md">
                      <Database className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl">Database Hosting</CardTitle>
                  </div>
                  <CardDescription className="text-base">Secure database solutions</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 relative z-10">
                  <ul className="space-y-3">
                    {["MySQL/MariaDB", "PostgreSQL Support", "Automated Backups", "High Availability", "Performance Monitoring"].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm group/item">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center group-hover/item:bg-green-200 transition-colors">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-gray-700 group-hover/item:text-gray-900 transition-colors">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="relative z-10">
                  <Link href="/packages/database-hosting" className="w-full">
                    <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
                      View Details <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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

        {/* Technology Line Design */}
        <div className="relative py-12 md:py-16 bg-gradient-to-b from-blue-50 via-white to-transparent overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="relative flex items-center justify-center">
              {/* Decorative Line with Gradient */}
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent animate-pulse"></div>
              </div>
              
              {/* Technology Icons Container */}
              <div className="relative flex items-center gap-6 bg-gradient-to-b from-white via-blue-50/80 to-transparent px-10 py-4 rounded-full shadow-lg backdrop-blur-sm">
                {/* Left Technology Icons */}
                <div className="flex items-center gap-3">
                  {/* Cloud Icon */}
                  <div className="w-10 h-10 rounded-lg bg-blue-600/10 p-2 flex items-center justify-center hover:bg-blue-600/20 transition-colors">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                  </div>
                  {/* Database Icon */}
                  <div className="w-10 h-10 rounded-lg bg-blue-600/10 p-2 flex items-center justify-center hover:bg-blue-600/20 transition-colors">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                  </div>
                </div>
                
                {/* Gradient Lines */}
                <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 via-blue-400 to-transparent rounded-full"></div>
                
                {/* Center Server Icon */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-16 h-16 rounded-full border-2 border-blue-300/30 animate-pulse"></div>
                  <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center shadow-xl ring-4 ring-blue-100/50">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                    <div className="absolute inset-0 w-14 h-14 rounded-full bg-blue-600 animate-ping opacity-20"></div>
                  </div>
                  {/* Decorative dots around center */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-indigo-400 rounded-full animate-pulse delay-500"></div>
                </div>
                
                {/* Gradient Lines */}
                <div className="w-12 h-0.5 bg-gradient-to-l from-blue-500 via-blue-400 to-transparent rounded-full"></div>
                
                {/* Right Technology Icons */}
                <div className="flex items-center gap-3">
                  {/* Network Icon */}
                  <div className="w-10 h-10 rounded-lg bg-blue-600/10 p-2 flex items-center justify-center hover:bg-blue-600/20 transition-colors">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                  </div>
                  {/* Shield Icon */}
                  <div className="w-10 h-10 rounded-lg bg-blue-600/10 p-2 flex items-center justify-center hover:bg-blue-600/20 transition-colors">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Connecting Lines with Technology Nodes */}
              <div className="absolute left-[15%] top-1/2 -translate-y-1/2 w-[30%] h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent">
                <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              </div>
              <div className="absolute right-[15%] top-1/2 -translate-y-1/2 w-[30%] h-px bg-gradient-to-l from-transparent via-blue-400/40 to-transparent">
                <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Slider and Data Center Description Section */}
        <div data-scroll-animate className="scroll-animate-fade-up">
          <ImageSliderSection />
        </div>

        <div data-scroll-animate className="scroll-animate-fade-up">
          <ShowcaseProjects />
        </div>

        <div data-scroll-animate className="scroll-animate-fade-up">
          <ClientLogoSlider />
        </div>

        <section 
          data-scroll-animate 
          className="relative py-12 md:py-24 lg:py-32 overflow-hidden scroll-animate-fade-up"
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/abstract_black_background.jpg"
              alt="Why Choose Us Background"
              fill
              className="object-cover"
              priority
              quality={90}
            />
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-blue-900/60 to-indigo-900/70"></div>
            {/* Additional subtle overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
          </div>

          <div className="container mx-auto relative z-10">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="font-heading text-3xl md:text-5xl text-white drop-shadow-lg">Why Choose Us?</h2>
              <p className="max-w-[85%] text-blue-100 sm:text-lg drop-shadow-md">
                YCIS Data Center provides top-notch hosting services with excellent support
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div 
                data-scroll-animate 
                className="bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 scroll-animate-fade-up"
                style={{ transitionDelay: '0.1s' }}
              >
                <h3 className="text-xl font-bold mb-2 text-gray-900">Reliable Infrastructure</h3>
                <p className="text-gray-700">
                  Our state-of-the-art data center ensures maximum uptime and performance.
                </p>
              </div>
              <div 
                data-scroll-animate 
                className="bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 scroll-animate-fade-up"
                style={{ transitionDelay: '0.2s' }}
              >
                <h3 className="text-xl font-bold mb-2 text-gray-900">Technical Support</h3>
                <p className="text-gray-700">
                  Dedicated support team available to assist you with any technical issues.
                </p>
              </div>
              <div 
                data-scroll-animate 
                className="bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 scroll-animate-fade-up"
                style={{ transitionDelay: '0.3s' }}
              >
                <h3 className="text-xl font-bold mb-2 text-gray-900">Flexible Solutions</h3>
                <p className="text-gray-700">
                  Customizable packages to meet your specific requirements and budget.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div data-scroll-animate className="scroll-animate-fade-up">
          <AboutInstitute />
        </div>

        <section 
          data-scroll-animate 
          className="relative w-full py-12 md:py-24 lg:py-32 overflow-hidden scroll-animate-fade-up"
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/abstract_black_background.jpg"
              alt="Ready to Get Started Background"
              fill
              className="object-cover"
              priority
              quality={90}
            />
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-blue-900/60 to-indigo-900/70"></div>
            {/* Additional subtle overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="font-heading text-3xl md:text-5xl text-white drop-shadow-lg">Ready to Get Started?</h2>
              <p className="max-w-[85%] text-blue-100 sm:text-lg drop-shadow-md">
                Explore our packages and find the perfect solution for your needs
              </p>
              <Link href="/packages">
                <Button size="lg" className="mt-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-8 py-6 text-lg border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  View All Packages
                </Button>
              </Link>
            </div>
          </div>
        </section>
        </main>
      )}
      {!showSplash && <Footer />}
    </div>
  )
}
