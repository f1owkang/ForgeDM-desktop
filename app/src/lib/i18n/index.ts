import i18n, { TOptions } from 'i18next'

import { DefaultLanguage, SupportedLanguage } from './language'
import { resources } from './resources'

export { i18n }
export * from './language'

export function initializeI18n(language: SupportedLanguage = DefaultLanguage) {
  if (i18n.isInitialized) {
    if (i18n.language !== language) {
      i18n.changeLanguage(language).catch(err => {
        log.error(`[i18n] failed changing language to ${language}`, err)
      })
    }

    return i18n
  }

  i18n.init({
    resources,
    lng: language,
    fallbackLng: DefaultLanguage,
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    initImmediate: false,
    returnNull: false,
  })

  return i18n
}

export function t(key: string, options?: TOptions) {
  return String(i18n.t(key, options))
}

export function platformKey(key: string) {
  return `${key}.${__DARWIN__ ? 'darwin' : 'default'}`
}

export function platformT(key: string, options?: TOptions) {
  return t(platformKey(key), options)
}

export function fileManagerT(key: string, options?: TOptions) {
  if (__DARWIN__) {
    return t(`${key}.darwin`, options)
  }

  if (__WIN32__) {
    return t(`${key}.win32`, options)
  }

  return t(`${key}.linux`, options)
}
