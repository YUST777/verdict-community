import { WaitlistHero } from '@/components/waitlist'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Join the Waitlist',
  description:
    'Sign up for early access to sast — the autonomous AI cybersecurity agent. Be first in line for AI-powered pentesting, vulnerability scanning, and automated security fixes.',
  openGraph: {
    title: 'Join the sast Waitlist — Early Access to AI Pentesting',
    description:
      'Sign up for early access to autonomous AI-powered pentesting and vulnerability scanning. Zero false positives, CI/CD integration.',
    url: 'https://sast.tech/waitlist',
  },
  alternates: {
    canonical: 'https://sast.tech/waitlist',
  },
}

export default async function WaitlistPage() {
  return <WaitlistHero />
}
