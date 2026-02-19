import React from 'react'
import { Instagram, Linkedin, Facebook } from 'lucide-react'

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const TikTokIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.16a8.18 8.18 0 004.77 1.52V7.23a4.85 4.85 0 01-1-.54z" />
  </svg>
)

const SOCIAL_LINKS = [
  { icon: TikTokIcon, href: 'https://www.tiktok.com/@sast_tech', label: 'TikTok' },
  { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61588200480116', label: 'Facebook' },
  { icon: XIcon, href: 'https://x.com/sast_tech', label: 'X' },
  { icon: Instagram, href: 'https://www.instagram.com/sast.tech/', label: 'Instagram' },
  { icon: Linkedin, href: 'https://www.linkedin.com/company/sast-tech', label: 'LinkedIn' },
]

export const SocialLinks: React.FC = () => {
  return (
    <div className="flex justify-center space-x-6">
      {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="text-gray-500 hover:text-gray-300 transition-colors duration-300"
        >
          <Icon className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
        </a>
      ))}
    </div>
  )
}
