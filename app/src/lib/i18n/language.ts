export type SupportedLanguage = 'en-US' | 'zh-CN' | 'pseudo'

export const DefaultLanguage: SupportedLanguage = 'en-US'

const supportedLanguages = new Set<SupportedLanguage>([
  'en-US',
  'zh-CN',
  'pseudo',
])

export function normalizeLanguage(language: string | null | undefined) {
  if (language == null || language.length === 0) {
    return DefaultLanguage
  }

  const normalized = language.replace('_', '-')

  if (supportedLanguages.has(normalized as SupportedLanguage)) {
    return normalized as SupportedLanguage
  }

  const lower = normalized.toLowerCase()

  if (lower === 'pseudo') {
    return 'pseudo'
  }

  if (lower.startsWith('zh')) {
    return 'zh-CN'
  }

  if (lower.startsWith('en')) {
    return 'en-US'
  }

  return DefaultLanguage
}

export function getLanguageFromCountryCode(
  countryCode: string | null | undefined
) {
  if (countryCode == null) {
    return DefaultLanguage
  }

  switch (countryCode.toUpperCase()) {
    case 'CN':
    case 'SG':
      return 'zh-CN'
    default:
      return DefaultLanguage
  }
}

export function getEnvironmentLanguage() {
  return normalizeLanguage(process.env.FORGEDM_LOCALE)
}
