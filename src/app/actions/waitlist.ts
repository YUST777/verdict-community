'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type WaitlistResult = {
  success: boolean
  message: string
  referralCode?: string
  position?: number
}

export async function joinWaitlist(formData: FormData): Promise<WaitlistResult> {
  const email = formData.get('email')?.toString().trim().toLowerCase()

  if (!email || !email.includes('@')) {
    return { success: false, message: 'Please enter a valid email address.' }
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { success: false, message: 'Please enter a valid email address.' }
  }

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || null
  const userAgent = headersList.get('user-agent') || null

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('waitlist')
    .insert({
      email,
      ip_address: ip,
      user_agent: userAgent,
    })
    .select('referral_code, position')
    .single()

  if (error) {
    // Unique constraint on normalized_email — duplicate signup
    if (error.code === '23505') {
      return {
        success: false,
        message: "You're already on the waitlist! We'll be in touch soon.",
      }
    }

    console.error('Waitlist insert error:', error)
    return {
      success: false,
      message: 'Something went wrong. Please try again.',
    }
  }

  revalidatePath('/waitlist')

  return {
    success: true,
    message: "You're on the list! We'll notify you when we launch.",
    referralCode: data.referral_code,
    position: data.position,
  }
}
