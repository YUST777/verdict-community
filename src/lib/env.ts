/**
 * Environment variable helpers.
 *
 * `env` is a lazy proxy — values are read from `process.env` on first access
 * rather than at import time, so the build won't crash if vars are missing
 * during static page generation.
 */

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Check your .env.local file or deployment configuration.`
    )
  }
  return value
}

type EnvKeys =
  | 'NEXT_PUBLIC_SUPABASE_URL'
  | 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
  | 'SUPABASE_SERVICE_ROLE_KEY'
  | 'JWT_SECRET'
  | 'DATABASE_URL'
  | 'DB_ENCRYPTION_KEY'
  | 'BLIND_INDEX_SALT'
  | 'MIRROR_SERVICE_URL'
  | 'NEXT_PUBLIC_SITE_URL'

export const env: Readonly<Record<EnvKeys, string>> = new Proxy(
  {} as Record<EnvKeys, string>,
  {
    get(_target, prop: string) {
      return requireEnv(prop)
    },
  },
)
