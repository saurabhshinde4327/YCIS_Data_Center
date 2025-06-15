import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from "@vercel/analytics/next"
export const metadata: Metadata = {
  title: 'YCIS Data Center',
  description: 'YCIS Data Center is a data center that is located in YCIS. It is used to store data and is managed by YCIS.',
  generator: 'Saurabh',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
