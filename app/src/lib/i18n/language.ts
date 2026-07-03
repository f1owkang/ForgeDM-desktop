export type SupportedLanguage = 'en-US' | 'zh-CN' | 'pseudo'
export type ApplicationLanguagePreference = 'system' | SupportedLanguage

export const DefaultLanguage: SupportedLanguage = 'en-US'
export const DefaultLanguagePreference: ApplicationLanguagePreference = 'system'
export const applicationLanguagePreferenceKey = 'application-language'

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

export function normalizeLanguagePreference(
  value: string | null | undefined
): ApplicationLanguagePreference {
  if (value === 'system') {
    return 'system'
  }

  if (value == null || value.length === 0) {
    return DefaultLanguagePreference
  }

  const normalized = normalizeLanguage(value)
  return normalized === DefaultLanguage && value !== DefaultLanguage
    ? DefaultLanguagePreference
    : normalized
}

export function resolveLanguagePreference(
  preference: ApplicationLanguagePreference,
  systemLanguage: string | null | undefined,
  countryCode?: string | null
): SupportedLanguage {
  if (preference !== 'system') {
    return preference
  }

  const language = normalizeLanguage(systemLanguage)

  if (language !== DefaultLanguage) {
    return language
  }

  return getLanguageFromCountryCode(countryCode)
}

export function getPersistedLanguagePreference() {
  if (typeof localStorage === 'undefined') {
    return DefaultLanguagePreference
  }

  return normalizeLanguagePreference(
    localStorage.getItem(applicationLanguagePreferenceKey)
  )
}

export function setPersistedLanguagePreference(
  preference: ApplicationLanguagePreference
) {
  if (typeof localStorage === 'undefined') {
    return
  }

  if (preference === DefaultLanguagePreference) {
    localStorage.removeItem(applicationLanguagePreferenceKey)
  } else {
    localStorage.setItem(applicationLanguagePreferenceKey, preference)
  }
}
