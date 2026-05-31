import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://rybbit.yust.dev https://*.supabase.co wss://*.supabase.co https://codeforces.com https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com https://api.groq.com https://openrouter.ai https://api.together.xyz https://api.fireworks.ai https://api.mistral.ai https://api.deepseek.com https://api.cohere.ai https://texttospeech.googleapis.com",
      "frame-src https://www.google.com",
      "frame-ancestors 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["duck-duck-scrape", "cheerio", "yt-search"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tailark.com",
      },
      {
        protocol: "https",
        hostname: "html.tailus.io",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    const rybbitHost = process.env.NEXT_PUBLIC_RYBBIT_HOST || "https://rybbit.yust.dev";
    return [
      {
        source: "/api/script.js",
        destination: `${rybbitHost}/api/script.js`,
      },
      {
        source: "/api/track",
        destination: `${rybbitHost}/api/track`,
      },
      {
        source: "/api/site/tracking-config/:path*",
        destination: `${rybbitHost}/api/site/tracking-config/:path*`,
      },
      {
        source: "/api/identify",
        destination: `${rybbitHost}/api/identify`,
      },
    ];
  },
};

export default nextConfig;
