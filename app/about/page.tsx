import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Server, Shield, Users, Award, Clock, Cpu } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <PageHeader
        title="About Our Data Center"
        description="Learn about our mission, infrastructure, and the team behind YCIS Data Center"
      />

      <main className="flex-1">
        {/* Introduction Section */}
        <section className="container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Empowering Digital Innovation</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  The YCIS Data Center was established in 2022 as part of Yashavantrao Chavan Institute of Science's
                  commitment to technological advancement and digital transformation. Our state-of-the-art facility
                  serves as the technological backbone of the institute, supporting research, education, and
                  administrative functions.
                </p>
                <p>
                  Located within the YCIS campus in Satara, our data center combines cutting-edge technology with
                  sustainable practices to provide reliable, secure, and scalable digital infrastructure services to our
                  academic community and external clients.
                </p>
              </div>
            </div>
            <div className="relative h-[300px] lg:h-[400px] rounded-lg overflow-hidden">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/data%20center.jpg-AAexZBMk9RVWFvIvbpm4TT81MdF9o0.jpeg"
                alt="YCIS Data Center"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Mission and Vision */}
        <section className="bg-muted py-12">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Mission & Vision</h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                We are committed to providing cutting-edge digital infrastructure that empowers research, education, and
                innovation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-2xl font-bold mb-4">Mission</h3>
                  <p className="text-muted-foreground mb-4">
                    To provide secure, reliable, and scalable digital infrastructure services that support the academic
                    and research goals of YCIS and its community, while offering professional hosting solutions to
                    external organizations.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Deliver high-performance computing resources for research and education</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Ensure data security and privacy through robust protocols</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Provide professional hosting services to the wider community</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-2xl font-bold mb-4">Vision</h3>
                  <p className="text-muted-foreground mb-4">
                    To be recognized as a leading academic data center that bridges educational excellence with
                    technological innovation, serving as a model for other educational institutions in the region.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Become a center of excellence for digital infrastructure in education</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Foster innovation through advanced computing resources</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Support sustainable and environmentally responsible operations</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Infrastructure */}
        <section className="container py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Infrastructure</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              YCIS Data Center is equipped with state-of-the-art technology to ensure high performance, reliability, and
              security.
            </p>
          </div>

          <Tabs defaultValue="hardware" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="hardware">Hardware</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            <TabsContent value="hardware" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Server className="h-6 w-6 text-primary" />
                      <h3 className="text-xl font-bold">Server Infrastructure</h3>
                    </div>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>Enterprise-grade rack servers</li>
                      <li>High-performance computing clusters</li>
                      <li>Redundant storage systems</li>
                      <li>Virtualization platforms</li>
                      <li>Dedicated backup servers</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Cpu className="h-6 w-6 text-primary" />
                      <h3 className="text-xl font-bold">Processing Power</h3>
                    </div>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>Multi-core Intel Xeon processors</li>
                      <li>High-performance GPUs for specialized workloads</li>
                      <li>Scalable computing resources</li>
                      <li>Load-balanced processing</li>
                      <li>Resource optimization systems</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Clock className="h-6 w-6 text-primary" />
                      <h3 className="text-xl font-bold">Reliability</h3>
                    </div>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>Redundant power supplies</li>
                      <li>Uninterruptible power systems (UPS)</li>
                      <li>Backup generators</li>
                      <li>Advanced cooling systems</li>
                      <li>24/7 monitoring and maintenance</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="network" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Server className="h-6 w-6 text-primary" />
                      <h3 className="text-xl font-bold">Connectivity</h3>
                    </div>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>High-speed fiber optic connections</li>
                      <li>Redundant network paths</li>
                      <li>Multiple ISP connections</li>
                      <li>Low-latency internal network</li>
                      <li>Advanced routing and switching infrastructure</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="h-6 w-6 text-primary" />
                      <h3 className="text-xl font-bold">Network Security</h3>
                    </div>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>Next-generation firewalls</li>
                      <li>Intrusion detection and prevention systems</li>
                      <li>DDoS protection</li>
                      <li>Network segmentation</li>
                      <li>Traffic monitoring and analysis</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="security" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="h-6 w-6 text-primary" />
                      <h3 className="text-xl font-bold">Physical Security</h3>
                    </div>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>Biometric access controls</li>
                      <li>24/7 CCTV surveillance</li>
                      <li>Security personnel</li>
                      <li>Environmental monitoring</li>
                      <li>Fire suppression systems</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="h-6 w-6 text-primary" />
                      <h3 className="text-xl font-bold">Data Security</h3>
                    </div>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>End-to-end encryption</li>
                      <li>Regular security audits</li>
                      <li>Vulnerability assessments</li>
                      <li>Data backup and recovery</li>
                      <li>Compliance with data protection regulations</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Award className="h-6 w-6 text-primary" />
                      <h3 className="text-xl font-bold">Certifications</h3>
                    </div>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>ISO 27001 compliance</li>
                      <li>Regular security assessments</li>
                      <li>Industry best practices</li>
                      <li>Staff security training</li>
                      <li>Incident response protocols</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Team */}
        <section className="bg-muted py-12">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Team</h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                Our data center is managed by a team of experienced professionals dedicated to providing exceptional
                service.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
                    <Users className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Technical Operations</h3>
                  <p className="text-muted-foreground mt-2">
                    Our technical team ensures the smooth operation of all hardware and software systems.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
                    <Shield className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Security Team</h3>
                  <p className="text-muted-foreground mt-2">
                    Dedicated professionals who maintain and monitor our comprehensive security systems.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
                    <Server className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Infrastructure Management</h3>
                  <p className="text-muted-foreground mt-2">
                    Specialists who maintain and upgrade our physical and virtual infrastructure.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
                    <Users className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Client Support</h3>
                  <p className="text-muted-foreground mt-2">
                    Responsive support staff available to assist with any inquiries or technical issues.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="container py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              The core principles that guide our operations and service delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Security & Privacy</h3>
              <p className="text-muted-foreground">
                We prioritize the security and privacy of all data entrusted to our care, implementing robust measures
                to protect against threats.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Reliability</h3>
              <p className="text-muted-foreground">
                We are committed to maintaining high availability and performance, ensuring our services are accessible
                when needed.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Excellence</h3>
              <p className="text-muted-foreground">
                We strive for excellence in all aspects of our operations, continuously improving our services and
                infrastructure.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
