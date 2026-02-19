import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SmoothScroll } from "@/components/smooth-scroll";
import { Providers } from "@/components/providers";
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
  title: "Verdict.run — Solve Problems Without Limits",
  description:
    "Mirror Codeforces problems instantly. Code, test, and submit — all in one beautiful interface that works everywhere. The modern standard for competitive programming.",
  keywords: [
    "competitive programming",
    "codeforces",
    "online judge",
    "problem solving",
    "coding contest",
    "ICPC",
    "algorithm",
    "data structures",
    "verdict.run",
    "code editor",
    "competitive coding",
  ],
  authors: [{ name: "Verdict.run", url: "https://verdict.run" }],
  creator: "Verdict.run",
  publisher: "Verdict.run",
  category: "technology",
  openGraph: {
    title: "Verdict.run — Solve Problems Without Limits",
    description:
      "Mirror Codeforces problems instantly. Code, test, and submit — all in one beautiful interface.",
    url: "https://verdict.run",
    siteName: "Verdict.run",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Verdict.run — Solve Problems Without Limits",
    description:
      "Mirror Codeforces problems instantly. Code, test, and submit — all in one beautiful interface.",
    creator: "@verdictrun",
    site: "@verdictrun",
  },
  alternates: {
    canonical: "https://verdict.run",
  },
  metadataBase: new URL("https://verdict.run"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </Providers>
      </body>
    </html>
  );
}
