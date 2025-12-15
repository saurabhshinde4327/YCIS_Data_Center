"use client"

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { useEffect, useState } from "react";

export function Footer() {
  const [visitCount, setVisitCount] = useState<number>(0);
  const [todayVisits, setTodayVisits] = useState<number>(0);
  const [uniqueVisitors, setUniqueVisitors] = useState<number>(0);

  useEffect(() => {
    const recordVisit = async () => {
      try {
        // Get or create unique visitor ID
        let visitorId = localStorage.getItem('visitorId');
        if (!visitorId) {
          visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('visitorId', visitorId);
        }

        // Check if already visited today
        const lastVisit = localStorage.getItem('lastVisitTime');
        const now = Date.now();
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

        // Only record if more than 1 hour since last visit (to avoid counting page refreshes)
        if (!lastVisit || (now - parseInt(lastVisit)) > oneHour) {
          // Record visit in backend
          const response = await fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visitorId })
          });

          if (response.ok) {
            const data = await response.json();
            setVisitCount(data.totalVisits);
            setTodayVisits(data.todayVisits);
            localStorage.setItem('lastVisitTime', now.toString());
          }
        }

        // Always fetch current stats
        const statsResponse = await fetch('/api/analytics');
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          setVisitCount(stats.totalVisits);
          setTodayVisits(stats.todayVisits);
          setUniqueVisitors(stats.uniqueVisitors);
        }
      } catch (error) {
        console.error('Error recording visit:', error);
      }
    };

    recordVisit();
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

  return (
    <footer className="bg-muted py-12 mt-auto">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Image
                src="/datacenter.png"
                alt="YCIS Logo"
                width={50}
                height={50}
                className="rounded-md"
                priority
                style={{ filter: 'none' }}
              />
              <h3 className="text-xl font-bold">YCIS Data & Technology Center</h3>
            </div>
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

          {/* Services & Support Section */}
          <div className="grid grid-cols-2 gap-8">
            {/* Services */}
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

            {/* Support */}
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-muted-foreground hover:text-foreground">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="text-muted-foreground hover:text-foreground">
                    Admin Login
                  </Link>
                </li>
                <li>
                  <Link href="/sms-admin" className="text-muted-foreground hover:text-foreground">
                    SMS Admin Login
                  </Link>
                </li>
              </ul>

              {/* Visitor Counter - Odometer Style */}
              <div className="mt-6">
                <div className="bg-black rounded-md p-3 border border-gray-700 shadow-inner">
                  <div className="flex justify-center items-center gap-0.5">
                    {visitCount.toString().padStart(6, '0').split('').map((digit, index) => (
                      <div 
                        key={index} 
                        className="bg-gray-900 text-blue-400 font-mono text-xl font-bold w-7 h-9 flex items-center justify-center border border-gray-800"
                      >
                        {digit}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Map Section */}
          <div className="space-y-6">
            {/* Contact */}
            <div>
              <h3 className="font-bold mb-4">Contact</h3>
              <address className="not-italic text-sm text-muted-foreground space-y-2">
                <p>Yashavantrao Chavan Institute of Science</p>
                <p>Satara, Maharashtra</p>
                <p>Name: Saurabh Dhananjay Shinde</p>
                <p>Email: datacenter@ycis.ac.in</p>
                <p>Phone: +91 8668428513</p>
                <p>
                  <Link
                    href="https://datacenter.ycislocker.space"
                    className="hover:text-foreground"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    datacenter.ycislocker.space
                  </Link>
                </p>
              </address>
            </div>

            {/* Google Map */}
            <div>
              <h3 className="font-bold mb-4">Location</h3>
              <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15211.2!2d74.0183!3d17.6805!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc237f25e0f5555%3A0x0!2sYashavantrao%20Chavan%20Institute%20of%20Science!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%"
                  height="220"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="YCIS Data Center Location"
                ></iframe>
              </div>
              <Link
                href="https://maps.app.goo.gl/n88vZkvHaKTL5ajH6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                View on Google Maps →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="container mt-8 pt-8 border-t">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} YCIS Data & Technology Center
        </p>
      </div>
    </footer>
  );
}
