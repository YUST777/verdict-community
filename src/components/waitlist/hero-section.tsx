import React from 'react'
import { Navbar } from './navbar'
import { GradientBars } from './gradient-bars'
import { TrustElements } from './trust-elements'
import { WaitlistForm } from './waitlist-form'
import { SocialLinks } from './social-links'
import { createClient } from '@/lib/supabase/server'

async function getWaitlistCount(): Promise<number> {
  try {
    const supabase = await createClient()
    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'waiting')
    if (error) throw error
    return count ?? 0
  } catch {
    return 0
  }
}

export const WaitlistHero: React.FC = async () => {
  const count = await getWaitlistCount()

  return (
    <section className="relative min-h-screen flex flex-col items-center px-6 sm:px-8 md:px-12 overflow-hidden">
      <div className="absolute inset-0 bg-gray-950" />
      <GradientBars />
      <Navbar />

      <div className="relative z-10 text-center w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-screen py-8 sm:py-16">
        {/* Trust badge */}
        <div className="mb-6 sm:mb-8">
          <TrustElements count={count} />
        </div>

        {/* Headline */}
        <h1 className="w-full text-white leading-tight tracking-tight mb-6 sm:mb-8 animate-fadeIn px-4">
          <span className="block font-inter font-medium text-[clamp(1.5rem,6vw,3.75rem)] whitespace-nowrap">
            Your code ships fast
          </span>
          <span className="block font-instrument italic text-[clamp(1.5rem,6vw,3.75rem)] whitespace-nowrap">
            We make sure it ships safe
          </span>
        </h1>

        {/* Subtext */}
        <div className="mb-6 sm:mb-10 px-4">
          <p className="text-[clamp(1rem,3vw,1.5rem)] text-gray-400 leading-relaxed animate-fadeIn animation-delay-200 font-space">
            An autonomous AI agent that scans, detects, and fixes
          </p>
          <p className="text-[clamp(1rem,3vw,1.5rem)] text-gray-400 leading-relaxed animate-fadeIn animation-delay-300 font-space">
            security vulnerabilities in your codebase — continuously.
          </p>
        </div>

        {/* Email form */}
        <div className="w-full max-w-2xl mb-6 sm:mb-8 px-4">
          <WaitlistForm />
        </div>

        {/* Social links */}
        <SocialLinks />
      </div>
    </section>
  )
}
