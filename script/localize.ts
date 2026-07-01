#!/usr/bin/env ts-node

/**
 * ForgeDM Desktop 汉化脚本
 * 参考项目：https://github.com/cngege/GitHubDesktop2Chinese
 *
 * 功能：读取 localization.json，批量替换源码中的英文字符串为中文
 */

import * as fs from 'fs'
import * as path from 'path'

// 使用 process.cwd() 获取项目根目录
const projectRoot = process.cwd()

// 翻译规则类型
type TranslationRule = [string, string] | [string, string, string]

interface LocalizationData {
  version: number
  minversion: string
  tip: string[]
  select: string[][]
  main: TranslationRule[]
  main_dev: TranslationRule[]
  renderer: TranslationRule[]
  renderer_dev: TranslationRule[]
}

// 统计信息
interface Stats {
  totalFiles: number
  modifiedFiles: number
  totalReplacements: number
  skippedRules: number
  errors: string[]
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 将正则表达式规则转换为精确匹配
 * localization.json 中的规则是正则表达式格式，需要转换为源码中的精确字符串
 */
function convertRuleToExactMatch(rule: TranslationRule): { pattern: string; replacement: string } | null {
  const [pattern, replacement] = rule

  // 跳过空规则
  if (!pattern || !replacement) {
    return null
  }

  // 跳过包含复杂正则的规则（需要特殊处理）
  if (pattern.includes('..') || pattern.includes('.*') || pattern.includes('.+')) {
    return null
  }

  // 清理转义的引号
  let cleanPattern = pattern
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\')

  // 清理替换文本中的转义
  let cleanReplacement = replacement
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\')

  return {
    pattern: cleanPattern,
    replacement: cleanReplacement
  }
}

/**
 * 在文件内容中执行替换
 */
function applyTranslations(
  content: string,
  rules: TranslationRule[],
  filePath: string
): { content: string; count: number } {
  let count = 0
  let modifiedContent = content

  for (const rule of rules) {
    const converted = convertRuleToExactMatch(rule)
    if (!converted) {
      continue
    }

    const { pattern, replacement } = converted

    // 统计替换次数
    const regex = new RegExp(escapeRegExp(pattern), 'g')
    const matches = modifiedContent.match(regex)

    if (matches && matches.length > 0) {
      modifiedContent = modifiedContent.replace(regex, replacement)
      count += matches.length
    }
  }

  return { content: modifiedContent, count }
}

/**
 * 处理单个文件
 */
function processFile(
  filePath: string,
  mainRules: TranslationRule[],
  rendererRules: TranslationRule[]
): { modified: boolean; count: number; error?: string } {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    let result = { content, count: 0 }

    // 根据文件路径选择规则
    if (filePath.includes('main-process') || filePath.includes('main/')) {
      result = applyTranslations(content, mainRules, filePath)
    } else {
      result = applyTranslations(content, rendererRules, filePath)
    }

    // 同时应用两组规则（因为某些字符串可能在两个文件中都出现）
    const combinedResult = applyTranslations(result.content,
      filePath.includes('main-process') ? rendererRules : mainRules,
      filePath
    )

    const totalCount = result.count + combinedResult.count

    if (totalCount > 0) {
      fs.writeFileSync(filePath, combinedResult.content, 'utf-8')
      return { modified: true, count: totalCount }
    }

    return { modified: false, count: 0 }
  } catch (error) {
    return { modified: false, count: 0, error: String(error) }
  }
}

/**
 * 递归扫描目录
 */
function scanDirectory(dir: string, extensions: string[]): string[] {
  const files: string[] = []

  const items = fs.readdirSync(dir)
  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      // 跳过 node_modules 和 dist
      if (item !== 'node_modules' && item !== 'dist' && item !== '.git') {
        files.push(...scanDirectory(fullPath, extensions))
      }
    } else if (extensions.some(ext => fullPath.endsWith(ext))) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * 主函数
 */
async function main() {
  console.log('🌏 ForgeDM Desktop 汉化脚本')
  console.log('================================\n')

  // 1. 读取 localization.json
  const localizationPath = path.join(projectRoot, 'localization.json')

  if (!fs.existsSync(localizationPath)) {
    console.error('❌ 未找到 localization.json，请先下载汉化映射文件')
    console.log('下载地址：https://raw.githubusercontent.com/cngege/GitHubDesktop2Chinese/master/json/localization.json')
    process.exit(1)
  }

  const localizationData: LocalizationData = JSON.parse(
    fs.readFileSync(localizationPath, 'utf-8')
  )

  console.log(`✅ 已加载汉化映射：`)
  console.log(`   - 主进程规则：${localizationData.main.length} 条`)
  console.log(`   - 渲染进程规则：${localizationData.renderer.length} 条\n`)

  // 2. 扫描源文件
  const srcDir = path.join(projectRoot, 'app', 'src')
  const extensions = ['.ts', '.tsx']
  const files = scanDirectory(srcDir, extensions)

  console.log(`📁 扫描到 ${files.length} 个源文件\n`)

  // 3. 执行汉化
  const stats: Stats = {
    totalFiles: files.length,
    modifiedFiles: 0,
    totalReplacements: 0,
    skippedRules: 0,
    errors: []
  }

  console.log('🔄 开始汉化...\n')

  for (const file of files) {
    const relativePath = path.relative(projectRoot, file)
    const result = processFile(file, localizationData.main, localizationData.renderer)

    if (result.error) {
      stats.errors.push(`${relativePath}: ${result.error}`)
    } else if (result.modified) {
      stats.modifiedFiles++
      stats.totalReplacements += result.count
      console.log(`   ✅ ${relativePath} (${result.count} 处替换)`)
    }
  }

  // 4. 输出统计
  console.log('\n📊 汉化统计：')
  console.log(`   - 扫描文件：${stats.totalFiles}`)
  console.log(`   - 修改文件：${stats.modifiedFiles}`)
  console.log(`   - 替换总数：${stats.totalReplacements}`)

  if (stats.errors.length > 0) {
    console.log(`\n⚠️  错误 (${stats.errors.length})：`)
    stats.errors.forEach(err => console.log(`   - ${err}`))
  }

  console.log('\n✨ 汉化完成！')
}

// 运行
main().catch(error => {
  console.error('❌ 汉化失败：', error)
  process.exit(1)
})
