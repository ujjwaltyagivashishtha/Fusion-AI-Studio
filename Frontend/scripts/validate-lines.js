#!/usr/bin/env node

/**
 * Line-Limit Enforcement Validator for Frontend
 * Ensures every applicable source code file contains <= 300 physical lines of code.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import process from 'node:process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const frontendRoot = path.resolve(__dirname, '..')

const MAX_LINES = 300

// Directories and file types to skip (build artifacts, dependencies, lockfiles, media)
const IGNORED_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  '.git',
  '.gemini',
  'coverage'
])

const IGNORED_FILES = new Set([
  'package-lock.json'
])

const VALID_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.css',
  '.html',
  '.json',
  '.svg'
])

function countPhysicalLines(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  return content.split('\n').length
}

function scanDirectory(dirPath, filesList = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        scanDirectory(path.join(dirPath, entry.name), filesList)
      }
    } else if (entry.isFile()) {
      if (IGNORED_FILES.has(entry.name)) continue

      const ext = path.extname(entry.name)
      if (VALID_EXTENSIONS.has(ext)) {
        filesList.push(path.join(dirPath, entry.name))
      }
    }
  }

  return filesList
}

function main() {
  console.log(`\n🔍 Validating Frontend Line Limits (Strict Maximum: ${MAX_LINES} lines)...`)
  const allFiles = scanDirectory(frontendRoot)

  let violations = 0
  const results = []

  for (const filePath of allFiles) {
    const relPath = path.relative(frontendRoot, filePath)
    const lineCount = countPhysicalLines(filePath)
    results.push({ path: relPath, count: lineCount })

    if (lineCount > MAX_LINES) {
      violations++
      console.error(`❌ VIOLATION: ${relPath} has ${lineCount} lines (exceeds ${MAX_LINES})`)
    }
  }

  // Sort by count descending
  results.sort((a, b) => b.count - a.count)

  console.log(`\n📊 Audited ${results.length} applicable frontend source files.`)
  console.log('Top 5 largest files:')
  results.slice(0, 5).forEach((r) => {
    console.log(`   ${r.count.toString().padStart(4, ' ')} lines : ${r.path}`)
  })

  if (violations > 0) {
    console.error(`\n❌ FAILED: Found ${violations} file(s) exceeding ${MAX_LINES} physical lines.\n`)
    process.exit(1)
  }

  console.log(`\n✅ PASSED: All ${results.length} frontend source files are strictly <= ${MAX_LINES} lines.\n`)
  process.exit(0)
}

main()
