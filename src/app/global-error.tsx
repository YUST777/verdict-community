'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center px-6">
          <h2 className="text-2xl font-semibold">Something went wrong</h2>
          <p className="mt-2 text-sm text-zinc-400">
            A critical error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            className="mt-6 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
