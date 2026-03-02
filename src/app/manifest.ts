import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Verdict.run — Solve Problems Without Limits',
    short_name: 'Verdict.run',
    description:
      'Mirror Codeforces problems instantly. Code, test, and submit — all in one beautiful interface.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/icons/logo.svg',
        sizes: 'any',
        type: 'image/webp',
      },
    ],
  }
}
