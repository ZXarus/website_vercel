import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PropGrowthX - NYC Investment Properties",
  description:
    "Discover high-growth investment opportunities in NYC real estate with AI-powered market predictions and comprehensive property analysis.",
    generator: 'v0.dev'
}

// This IS your HTML structure - it replaces traditional <html>, <head>, <body>
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>{/* Next.js automatically injects meta tags, title, etc. here */}</head>
      <body className={inter.className}>
        <div id="__next">
          {/* All your page content gets inserted here */}
          {children}
        </div>
      </body>
    </html>
  )
}
