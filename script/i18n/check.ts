import * as Fs from 'fs'
import * as Path from 'path'

const root = Path.dirname(Path.dirname(__dirname))
const localesDir = Path.join(root, 'app', 'src', 'i18n', 'locales')

type JsonObject = { readonly [key: string]: JsonValue }
type JsonValue = string | JsonObject

const errors = new Array<string>()

function readLocale(name: string) {
  const file = Path.join(localesDir, `${name}.json`)
  // FORGEDM: sync read is intentional here - tiny CLI script, keeps flow simple
  const contents = Fs.readFileSync(file, 'utf8') // eslint-disable-line no-sync
  const duplicateKeys = findDuplicateKeys(contents)

  if (duplicateKeys.length > 0) {
    for (const key of duplicateKeys) {
      errors.push(`Duplicate key in ${name}.json: ${key}`)
    }
  }

  return JSON.parse(contents) as JsonObject
}

function findDuplicateKeys(contents: string) {
  const duplicates = new Array<string>()
  const stack = new Array<{
    readonly path: string
    readonly keys: Set<string>
  }>()

  let i = 0
  while (i < contents.length) {
    const char = contents[i]

    if (char === '"') {
      const { value, end } = readJsonString(contents, i)
      const colonIndex = skipWhitespace(contents, end + 1)

      if (contents[colonIndex] === ':' && stack.length > 0) {
        const frame = stack[stack.length - 1]
        const keyPath = frame.path.length > 0 ? `${frame.path}.${value}` : value

        if (frame.keys.has(value)) {
          duplicates.push(keyPath)
        } else {
          frame.keys.add(value)
        }
      }

      i = end + 1
      continue
    }

    if (char === '{') {
      const key = findObjectKeyBefore(contents, i)
      const parent = stack[stack.length - 1]
      const path =
        parent !== undefined && key !== null
          ? parent.path.length > 0
            ? `${parent.path}.${key}`
            : key
          : ''

      stack.push({ path, keys: new Set<string>() })
    } else if (char === '}') {
      stack.pop()
    }

    i++
  }

  return duplicates
}

function readJsonString(contents: string, start: number) {
  let value = ''

  for (let i = start + 1; i < contents.length; i++) {
    const char = contents[i]

    if (char === '\\') {
      value += contents[i + 1] ?? ''
      i++
      continue
    }

    if (char === '"') {
      return { value, end: i }
    }

    value += char
  }

  throw new Error('Unterminated JSON string')
}

function skipWhitespace(contents: string, start: number) {
  let i = start
  while (/\s/.test(contents[i] ?? '')) {
    i++
  }
  return i
}

function findObjectKeyBefore(contents: string, objectStart: number) {
  let i = objectStart - 1

  while (/\s/.test(contents[i] ?? '')) {
    i--
  }

  if (contents[i] !== ':') {
    return null
  }

  i--
  while (/\s/.test(contents[i] ?? '')) {
    i--
  }

  if (contents[i] !== '"') {
    return null
  }

  let quote = i
  while (quote > 0) {
    quote--

    if (contents[quote] === '"' && contents[quote - 1] !== '\\') {
      return contents.slice(quote + 1, i)
    }
  }

  return null
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
