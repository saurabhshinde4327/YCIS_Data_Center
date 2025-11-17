import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from "@vercel/analytics/next"
import Script from 'next/script'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Data Center Satara | YCIS Data & Technology Center | Web Hosting, VPS & Domain Services',
  description: 'Leading Data Center in Satara, Maharashtra. YCIS Data & Technology Center provides reliable web hosting, VPS hosting, domain email, and database hosting solutions. Professional hosting services with 24/7 support in Satara.',
  keywords: [
    'data center satara',
    'satara data center',
    'YCIS data center',
    'web hosting satara',
    'vps hosting satara',
    'domain registration satara',
    'email hosting satara',
    'database hosting satara',
    'server hosting satara',
    'cloud hosting satara',
    'YCIS satara',
    'hosting services satara',
    'data center maharashtra',
    'satara hosting provider',
    'website hosting satara'
  ],
  authors: [{ name: 'YCIS Data & Technology Center' }],
  creator: 'YCIS Data & Technology Center',
  publisher: 'YCIS Data & Technology Center',
  metadataBase: new URL('https://datacenter.ycislocker.space'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Data Center Satara | YCIS Data & Technology Center',
    description: 'Leading Data Center in Satara, Maharashtra. Professional web hosting, VPS, domain, and database hosting services.',
    url: 'https://datacenter.ycislocker.space',
    siteName: 'YCIS Data & Technology Center Satara',
    images: [
      {
        url: '/datacenter.png',
        width: 1200,
        height: 630,
        alt: 'YCIS Data Center Satara Logo',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Data Center Satara | YCIS Data & Technology Center',
    description: 'Leading Data Center in Satara, Maharashtra. Professional hosting services with 24/7 support.',
    images: ['/datacenter.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/datacenter.png', type: 'image/png', sizes: '32x32' },
      { url: '/datacenter.png', type: 'image/png', sizes: '16x16' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '192x192',
        url: '/android-chrome-192x192.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '512x512',
        url: '/android-chrome-512x512.png',
      },
    ],
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification code
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Structured Data (JSON-LD) for Local Business
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://datacenter.ycislocker.space',
    name: 'YCIS Data & Technology Center',
    alternateName: 'Data Center Satara',
    description: 'Leading Data Center in Satara providing web hosting, VPS hosting, domain email, and database hosting solutions.',
    url: 'https://datacenter.ycislocker.space',
    logo: 'https://datacenter.ycislocker.space/datacenter.png',
    image: 'https://datacenter.ycislocker.space/datacenter.png',
    telephone: '+91 8668428513',
    email: 'datacenter@ycis.ac.in',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Your Street Address',
      addressLocality: 'Satara',
      addressRegion: 'Maharashtra',
      postalCode: '415001', // Update with your postal code
      addressCountry: 'IN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '17.6805', // Update with your actual coordinates
      longitude: '74.0183'
    },
    areaServed: {
      '@type': 'City',
      name: 'Satara'
    },
    priceRange: '₹₹',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday'
        ],
        opens: '00:00',
        closes: '23:59'
      }
    ],
    sameAs: [
      'https://maps.app.goo.gl/n88vZkvHaKTL5ajH6',
      // Add your social media profiles
      // 'https://www.facebook.com/yourpage',
      // 'https://twitter.com/yourprofile',
      // 'https://www.linkedin.com/company/yourcompany',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Hosting Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Web Hosting',
            description: 'Reliable and fast web hosting solutions'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'VPS Hosting',
            description: 'Virtual Private Server solutions'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Domain Email',
            description: 'Professional email solutions'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Database Hosting',
            description: 'Secure and scalable database hosting'
          }
        }
      ]
    }
  }

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        {/* Structured Data */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        
        {/* Additional Meta Tags for SEO */}
        <meta name="geo.region" content="IN-MH" />
        <meta name="geo.placename" content="Satara" />
        <meta name="geo.position" content="17.6805;74.0183" />
        <meta name="ICBM" content="17.6805, 74.0183" />
        <meta name="rating" content="General" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="language" content="English, Hindi, Marathi" />
        <meta name="coverage" content="Worldwide" />
        <meta name="target" content="all" />
        <meta name="HandheldFriendly" content="True" />
        <meta name="MobileOptimized" content="320" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#1e3a8a" />
        <meta name="msapplication-TileColor" content="#1e3a8a" />
        <meta name="msapplication-TileImage" content="/datacenter.png" />
      </head>
      <body suppressHydrationWarning={true}>
        {children}
        <Toaster position="top-right" richColors closeButton />
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Remove browser extension attributes that cause hydration issues
              if (typeof window !== 'undefined') {
                document.body.removeAttribute('cz-shortcut-listen');
                document.body.removeAttribute('data-new-gr-c-s-check-loaded');
                document.body.removeAttribute('data-gr-ext-installed');
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
