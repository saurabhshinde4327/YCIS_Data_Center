import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted py-12 mt-auto">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-bold">YCIS Data Center</h3>
          <p className="text-sm text-muted-foreground">
A data center is a facility used to house computer systems and associated components like servers, storage, and networking equipment. It ensures high availability, security, and efficient management of IT infrastructure for businesses and cloud services.

</p>
          <div className="flex space-x-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </Link>
          </div>
        </div>
        <div>
          <h3 className="font-bold mb-4">Services</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/services" className="text-muted-foreground hover:text-foreground">
                All Services
              </Link>
            </li>
            <li>
              <Link href="/packages/web-hosting" className="text-muted-foreground hover:text-foreground">
                Web Hosting
              </Link>
            </li>
            <li>
              <Link href="/packages/vps" className="text-muted-foreground hover:text-foreground">
                VPS Hosting
              </Link>
            </li>
            <li>
              <Link href="/packages/domain-email" className="text-muted-foreground hover:text-foreground">
                Domain Email
              </Link>
            </li>
            <li>
              <Link href="/packages/database-hosting" className="text-muted-foreground hover:text-foreground">
                Database Hosting
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-4">Support</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                FAQ
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-4">Contact</h3>
          <address className="not-italic text-sm text-muted-foreground space-y-2">
            <p>Yashavantrao Chavan Institute of Science</p>
            <p>Satara, Maharashtra</p>
            <p>Email: support@ycislocker.space</p>
            <p>Phone: +91 8668428513</p>
            <p>
              <Link
                href="https://ycis.ac.in"
                className="hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                Website: ycis.ac.in
              </Link>
            </p>
          </address>
        </div>
      </div>
      <div className="container mt-8 pt-8 border-t">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} YCIS Data Center. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
