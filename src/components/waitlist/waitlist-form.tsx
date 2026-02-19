'use client'

import React, { useState, useTransition } from 'react'
import { joinWaitlist, type WaitlistResult } from '@/app/actions/waitlist'

export const WaitlistForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<WaitlistResult | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return

    const formData = new FormData()
    formData.append('email', email)

    startTransition(async () => {
      const res = await joinWaitlist(formData)
      setResult(res)

      if (res.success) {
        setEmail('')
      }

      // Clear the message after 5 seconds for errors, keep success visible longer
      if (!res.success) {
        setTimeout(() => setResult(null), 5000)
      }
    })
  }

  if (result?.success) {
    return (
      <div className="space-y-3 animate-fadeIn">
        <div className="bg-green-500/20 border border-green-500/30 text-green-300 rounded-full px-6 sm:px-8 py-3 sm:py-4 text-center text-sm sm:text-base font-space">
          {result.message}
        </div>
        {result.position && (
          <p className="text-center text-gray-400 text-sm font-space">
            You&apos;re #{result.position} on the waitlist
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter Your Email"
          className="flex-1 px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-gray-900/60 border border-gray-700 focus:border-white outline-none text-white text-sm sm:text-base shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-sm transition-all duration-300 font-space"
          required
          disabled={isPending}
        />
        <button
          type="submit"
          disabled={isPending}
          className={`px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 transform hover:scale-105 whitespace-nowrap text-sm sm:text-base font-space ${
            isPending
              ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
              : 'bg-white hover:bg-gray-100 text-black'
          }`}
        >
          {isPending ? (
            <div className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto" />
          ) : (
            'Join The Waitlist'
          )}
        </button>
      </form>

      {result && !result.success && (
        <p className={`text-center text-sm font-space animate-fadeIn px-4 ${
          result.message.includes('already')
            ? 'text-amber-400'
            : 'text-red-400'
        }`}>
          {result.message}
        </p>
      )}
    </div>
  )
}
