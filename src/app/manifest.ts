import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Verdict.run — Get Instant Verdicts on Your Code',
    short_name: 'Verdict',
    description:
      'The modern competitive programming platform. Get instant verdicts, mirror Codeforces problems, and code in a beautiful IDE.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#10b981',
    icons: [
      {
        src: '/icons/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
