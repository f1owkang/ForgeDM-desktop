import { getStringArray, setStringArray } from '../local-storage'

/**
 * ForgeDM instance URL history (L0).
 *
 * Persists the ForgeDM server base URLs the user recently typed into the
 * clone dialog, so non-programmers don't have to remember long URLs.
 * Stored via the typed local-storage helpers as a string array,
 * newest first, capped at MAX_ITEMS.
 */

const KEY = 'forgedm.instanceHistory'
const MAX_ITEMS = 5

/** Returns saved instance origins, newest first. */
export function getInstanceHistory(): readonly string[] {
  return getStringArray(KEY).filter(v => isHttpUrl(v))
}

/**
 * Normalizes the given URL to its origin (`https://host:port`) and remembers
 * it as the most recently used instance. Returns the normalized origin, or
 * null when the input isn't a usable HTTP(S) URL.
 */
export function rememberInstance(url: string): string | null {
  const origin = normalizeToOrigin(url)
  if (origin === null) {
    return null
  }

  const next = [origin, ...getInstanceHistory().filter(h => h !== origin)]
  setStringArray(KEY, next.slice(0, MAX_ITEMS))

  return origin
}

/** The most recently used instance origin, or null. */
export function getLastInstance(): string | null {
  return getInstanceHistory()[0] ?? null
}

function normalizeToOrigin(url: string): string | null {
  const trimmed = url.trim()
  if (trimmed.length === 0) {
    return null
  }

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const parsed = new URL(candidate)
    return isHttpUrl(candidate) ? parsed.origin : null
  } catch {
    return null
  }
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\/[^\s/]+/i.test(value)
}
