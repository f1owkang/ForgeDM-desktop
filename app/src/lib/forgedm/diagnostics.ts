import { t } from '../i18n'

/**
 * ForgeDM connection diagnostics (L0).
 *
 * When cloning from a private ForgeDM/Gitea instance fails, this module
 * probes the instance's version API and turns low-level network errors
 * into actionable, human-readable hints for non-programmers.
 */

const PROBE_TIMEOUT_MS = 5000

export interface IInstanceProbeResult {
  /** The normalized instance base URL that was probed. */
  readonly baseUrl: string

  /** True when the instance answered the version API. */
  readonly reachable: boolean

  /** Server version string when reachable. */
  readonly version?: string

  /** Human-readable hint when not reachable (already localized). */
  readonly hint?: string
}

/**
 * Extracts the instance base URL (`scheme://host[:port]`) from a clone URL,
 * so `https://git.corp.example.com/acme/widget.git` probes the server root.
 * Returns null for non-HTTP(S) or unparseable URLs.
 */
export function instanceBaseUrlFromCloneUrl(url: string): string | null {
  const trimmed = url.trim()
  if (!/^https?:\/\//i.test(trimmed)) {
    return null
  }

  try {
    const parsed = new URL(trimmed)
    return `${parsed.protocol}//${parsed.host}`
  } catch {
    return null
  }
}

/** True when the clone URL points at a self-hosted instance rather than GitHub.com. */
export function isSelfHostedUrl(url: string): boolean {
  const base = instanceBaseUrlFromCloneUrl(url)
  return base !== null && !/github\.com/i.test(base)
}

/**
 * Probes `<base>/api/v1/version` and classifies failures.
 * Never throws: any unexpected error degrades to a generic hint.
 */
export async function probeInstance(url: string): Promise<IInstanceProbeResult> {
  const baseUrl = instanceBaseUrlFromCloneUrl(url) ?? url.replace(/\/+$/, '')
  try {
    const response = await fetch(`${baseUrl}/api/v1/version`, {
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      return { baseUrl, reachable: false, hint: t('forge.diagnostics.notForge') }
    }

    const body = (await response.json()) as { version?: unknown }
    const version = typeof body?.version === 'string' ? body.version : undefined
    return { baseUrl, reachable: true, version }
  } catch (err) {
    return { baseUrl, reachable: false, hint: classifyProbeError(err) }
  }
}

/**
 * Convenience wrapper used by the clone failure path: returns a localized,
 * actionable hint for self-hosted URLs, or null when diagnostics are not
 * applicable (GitHub.com URLs) or the server looks healthy.
 */
export async function describeCloneProblem(
  url: string
): Promise<string | null> {
  if (!isSelfHostedUrl(url)) {
    return null
  }

  try {
    const result = await probeInstance(url)
    if (!result.reachable) {
      return result.hint ?? t('forge.diagnostics.generic')
    }

    // Reachable now: likely bad credentials/path rather than connectivity.
    return t('forge.diagnostics.reachableButDenied', {
      version: result.version ?? '',
    })
  } catch {
    // Diagnostics must never mask the original failure.
    return null
  }
}

function classifyProbeError(err: unknown): string {
  const cause =
    typeof err === 'object' && err !== null && 'cause' in err
      ? (err as { cause?: { code?: string; message?: string } }).cause
      : undefined
  const code = cause?.code ?? ''

  switch (code) {
    case 'ENOTFOUND':
    case 'EAI_AGAIN':
      return t('forge.diagnostics.dns')
    case 'ECONNREFUSED':
      return t('forge.diagnostics.refused')
    case 'ECONNRESET':
      return t('forge.diagnostics.reset')
    case 'CERT_HAS_EXPIRED':
    case 'ERR_TLS_CERT_ALTNAME_INVALID':
    case 'DEPTH_ZERO_SELF_SIGNED_CERT':
    case 'UNABLE_TO_VERIFY_LEAF_SIGNATURE':
      return t('forge.diagnostics.tls')
    default:
      if (err instanceof DOMException && err.name === 'TimeoutError') {
        return t('forge.diagnostics.timeout')
      }
      return t('forge.diagnostics.network')
  }
}
