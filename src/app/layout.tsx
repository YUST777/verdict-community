import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SmoothScroll } from "@/components/core/smooth-scroll";
import { Providers } from "@/components/core/providers";
import LocalToCloudSync from "@/components/auth/LocalToCloudSync";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Verdict.run — Get Instant Verdicts on Your Code | Competitive Programming IDE",
  description:
    "Verdict is the modern competitive programming platform. Mirror Codeforces problems, get instant verdicts, and code in a beautiful IDE. Perfect for ICPC training, algorithm practice, and coding contests.",
  keywords: [
    "verdict",
    "verdict.run",
    "competitive programming",
    "codeforces mirror",
    "online judge",
    "instant verdict",
    "code verdict",
    "codeforces practice",
    "competitive programming IDE",
    "algorithm practice",
    "coding contest",
    "ICPC training",
    "problem solving",
    "code editor",
    "competitive coding platform",
    "programming judge",
    "codeforces IDE",
  ],
  authors: [{ name: "Verdict.run", url: "https://verdict.run" }],
  creator: "Verdict.run",
  publisher: "Verdict.run",
  category: "technology",
  alternates: {
    canonical: "https://verdict.run",
  },
  metadataBase: new URL("https://verdict.run"),
  icons: {
    icon: "/icons/logo.svg",
    shortcut: "/icons/logo.svg",
    apple: "/icons/logo.svg",
  },
  openGraph: {
    title: "Verdict.run — Get Instant Verdicts on Your Code",
    description:
      "The modern competitive programming platform. Mirror Codeforces problems, get instant verdicts, and code in a beautiful IDE built for speed.",
    url: "https://verdict.run",
    siteName: "Verdict.run",
    locale: "en_US",
    type: "website",
    images: ["/images/metadata.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verdict.run — Get Instant Verdicts on Your Code",
    description:
      "The modern competitive programming platform. Mirror Codeforces problems, get instant verdicts, and code in a beautiful IDE built for speed.",
    creator: "@verdictrun",
    site: "@verdictrun",
    images: ["/images/metadata.webp"],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Verdict.run",
              "url": "https://verdict.run",
              "logo": "https://verdict.run/icons/logo.svg",
              "description": "The modern competitive programming platform for instant code verdicts",
              "sameAs": [
                "https://github.com/YUST777/verdict-community",
                "https://twitter.com/verdictrun"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "privacy@verdict.run",
                "contactType": "Customer Support"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Verdict.run",
              "url": "https://verdict.run",
              "description": "Get instant verdicts on your competitive programming code",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://verdict.run/workspace?url={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Verdict.run",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Web Browser",
              "description": "Modern competitive programming IDE with instant code verdicts",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "Codeforces problem mirroring",
                "Instant code verdicts",
                "Multi-language support",
                "AI-powered tutoring",
                "Real-time test execution",
                "Integrated whiteboard"
              ]
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <LocalToCloudSync />
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </Providers>
        <Script
          src="/api/script.js"
          data-site-id={process.env.NEXT_PUBLIC_RYBBIT_SITE_ID}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
