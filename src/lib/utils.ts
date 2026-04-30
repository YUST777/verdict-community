import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDisplayName(nameOrEmail?: string | null): string {
  if (!nameOrEmail) return 'Member';
  const value = String(nameOrEmail).trim();
  if (!value) return 'Member';
  if (value.includes('@')) {
    return value.split('@')[0] || 'Member';
  }
  return value;
}
