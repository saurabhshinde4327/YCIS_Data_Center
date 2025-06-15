import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { Database, Server, Mail, Globe, Shield, Headphones, Gauge, Clock } from "lucide-react"

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <PageHeader title="Our Services" description="Comprehensive hosting solutions for all your digital needs" />
      <main className="flex-1">
        <section className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="inline-block p-3 bg-primary/10 rounded-lg">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Web Hosting</h2>
              <p className="text-muted-foreground">
                Our web hosting services provide reliable, high-performance hosting for websites of all sizes. With
                multiple packages available, you can choose the perfect solution for your needs, from small personal
                sites to large enterprise applications.
              </p>
              <ul className="space-y-2 mt-4">
                <li className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-primary" />
                  <span>High-speed SSD storage</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Enhanced security features</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>99.9% uptime guarantee</span>
                </li>
                <li className="flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-primary" />
                  <span>24/7 technical support</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="inline-block p-3 bg-primary/10 rounded-lg">
                <Server className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">VPS Hosting</h2>
              <p className="text-muted-foreground">
                Our Virtual Private Server (VPS) hosting provides dedicated resources and greater control over your
                hosting environment. Ideal for businesses and applications that require more power and customization
                than shared hosting can offer.
              </p>
              <ul className="space-y-2 mt-4">
                <li className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-primary" />
                  <span>Dedicated CPU and RAM resources</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Enhanced security and monitoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Full root access and control</span>
                </li>
                <li className="flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-primary" />
                  <span>Technical support and management</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="inline-block p-3 bg-primary/10 rounded-lg">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Domain Email</h2>
              <p className="text-muted-foreground">
                Professional email solutions for your business domain. Create a professional impression with custom
                email addresses that match your domain name. Our email hosting includes spam protection, large storage
                quotas, and reliable delivery.
              </p>
              <ul className="space-y-2 mt-4">
                <li className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-primary" />
                  <span>Custom email addresses (@yourdomain.com)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Advanced spam and virus protection</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Webmail access from anywhere</span>
                </li>
                <li className="flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-primary" />
                  <span>Email forwarding and autoresponders</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="inline-block p-3 bg-primary/10 rounded-lg">
                <Database className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Database Hosting</h2>
              <p className="text-muted-foreground">
                Secure and reliable database hosting solutions for your applications. Our database hosting services
                provide optimized environments for MySQL, PostgreSQL, and other popular database systems, with regular
                backups and monitoring.
              </p>
              <ul className="space-y-2 mt-4">
                <li className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-primary" />
                  <span>High-performance SSD storage</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Automated backups and recovery</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Database optimization and tuning</span>
                </li>
                <li className="flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-primary" />
                  <span>Secure remote access</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
