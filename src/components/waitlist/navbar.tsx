import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent py-6 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/1.png"
              alt="sast logo"
              width={40}
              height={40}
              quality={100}
              priority
              className="rounded"
            />
            <span className="text-white font-bold text-2xl tracking-tighter font-space">
              sast
            </span>
          </Link>

          <Link
            href="/waitlist"
            className="bg-white hover:bg-gray-100 text-black px-5 py-2 rounded-full transition-all duration-300 transform hover:scale-105 font-space text-sm"
          >
            Join The Waitlist
          </Link>
        </div>
      </div>
    </nav>
  )
}
