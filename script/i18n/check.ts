import * as Fs from 'fs'
import * as Path from 'path'

const root = Path.dirname(Path.dirname(__dirname))
const localesDir = Path.join(root, 'app', 'src', 'i18n', 'locales')

type JsonObject = { readonly [key: string]: JsonValue }
type JsonValue = string | JsonObject

function readLocale(name: string) {
  const file = Path.join(localesDir, `${name}.json`)
  return JSON.parse(Fs.readFileSync(file, 'utf8')) as JsonObject
}

function flatten(
  value: JsonValue,
  prefix = '',
  result = new Map<string, string>()
) {
  if (typeof value === 'string') {
    result.set(prefix, value)
    return result
  }

  for (const [key, child] of Object.entries(value)) {
    flatten(child, prefix.length > 0 ? `${prefix}.${key}` : key, result)
  }

  return result
}

function interpolationNames(value: string) {
  return Array.from(
    value.matchAll(/\{\{\s*([\w.]+)\s*\}\}/g),
    match => match[1]
  )
    .sort()
    .join(',')
}

const english = flatten(readLocale('en-US'))
const chinese = flatten(readLocale('zh-CN'))
const errors = new Array<string>()

for (const key of english.keys()) {
  const zhValue = chinese.get(key)

  if (zhValue == null) {
    errors.push(`Missing zh-CN translation for ${key}`)
    continue
  }

  const englishInterpolations = interpolationNames(english.get(key)!)
  const chineseInterpolations = interpolationNames(zhValue)

  if (englishInterpolations !== chineseInterpolations) {
    errors.push(
      `Interpolation mismatch for ${key}: en-US [${englishInterpolations}] zh-CN [${chineseInterpolations}]`
    )
  }
}

for (const key of chinese.keys()) {
  if (!english.has(key)) {
    errors.push(`Unused zh-CN translation for ${key}`)
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(`i18n check passed (${english.size} keys)`)
