import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getLanguageInfo, formatCodeContent } from './editorUtils.js'
import { formatRelativeTime, TEMPLATE_OPTIONS } from './projectUtils.js'
import { generatePreviewDoc, searchFiles } from './workspaceConstants.js'

describe('Editor & Workspace Utilities Suite', () => {
  describe('1. Language & Icon Detection', () => {
    it('detects JavaScript and JSX extensions correctly', () => {
      const js = getLanguageInfo('server.js')
      assert.strictEqual(js.name, 'JavaScript (ES6+)')
      assert.strictEqual(js.icon, 'ri-javascript-line')

      const jsx = getLanguageInfo('Component.jsx')
      assert.strictEqual(jsx.name, 'React (JSX)')
    })

    it('detects Python, Java, Rust, and Go correctly', () => {
      assert.strictEqual(getLanguageInfo('main.py').name, 'Python 3')
      assert.strictEqual(getLanguageInfo('App.java').name, 'Java')
      assert.strictEqual(getLanguageInfo('lib.rs').name, 'Rust')
      assert.strictEqual(getLanguageInfo('main.go').name, 'Go')
    })

    it('handles files with no extension or unknown types gracefully', () => {
      assert.strictEqual(getLanguageInfo('').name, 'Plain Text')
      assert.strictEqual(getLanguageInfo('unknown_file.xyz123').name, 'Plain Text')
      assert.strictEqual(getLanguageInfo('.env').name, 'Environment Config')
    })
  })

  describe('2. Code Formatter', () => {
    it('formats valid JSON with configured indentation', () => {
      const raw = '{"a":1,"b":[2,3]}'
      const formatted = formatCodeContent(raw, 'package.json', 2)
      assert.ok(formatted.includes('  "a": 1'))
    })

    it('trims trailing whitespaces across lines for non-JSON files', () => {
      const raw = 'const x = 10;   \nconst y = 20;  '
      const formatted = formatCodeContent(raw, 'index.js')
      assert.strictEqual(formatted, 'const x = 10;\nconst y = 20;')
    })

    it('returns original string safely if JSON is invalid', () => {
      const invalidJson = '{ key: invalid }'
      assert.strictEqual(formatCodeContent(invalidJson, 'config.json'), invalidJson)
    })
  })

  describe('3. Relative Time Formatter', () => {
    it('formats recent timestamps accurately', () => {
      const now = new Date()
      assert.strictEqual(formatRelativeTime(now.toISOString()), 'Just now')

      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      assert.strictEqual(formatRelativeTime(fiveMinsAgo), '5m ago')

      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      assert.strictEqual(formatRelativeTime(twoHoursAgo), '2h ago')
    })

    it('handles falsy dates with fallback', () => {
      assert.strictEqual(formatRelativeTime(null), 'Recently')
      assert.strictEqual(formatRelativeTime(undefined), 'Recently')
    })
  })

  describe('4. File Search Engine', () => {
    const files = {
      'app.js': 'import express from "express"\nconst app = express()\napp.listen(3000)',
      'style.css': 'body { background: #000; }\n.btn { color: #fff; }'
    }

    it('finds matching tokens with correct line numbers and file names', () => {
      const results = searchFiles(files, 'express')
      assert.strictEqual(results.length, 2)
      assert.strictEqual(results[0].file, 'app.js')
      assert.strictEqual(results[0].lineNum, 1)
      assert.strictEqual(results[1].lineNum, 2)
    })

    it('is case-insensitive', () => {
      const results = searchFiles(files, 'EXPRESS')
      assert.strictEqual(results.length, 2)
    })

    it('returns empty array for empty search queries or empty file object', () => {
      assert.deepStrictEqual(searchFiles(files, ''), [])
      assert.deepStrictEqual(searchFiles(files, '   '), [])
      assert.deepStrictEqual(searchFiles(null, 'test'), [])
    })
  })

  describe('5. Live Preview Document Generator', () => {
    it('assembles index.html, style.css, and main.js into an isolated document', () => {
      const files = {
        'index.html': '<html><head></head><body><h1>Hello</h1></body></html>',
        'style.css': 'h1 { color: red; }',
        'main.js': 'console.log("preview active");'
      }

      const doc = generatePreviewDoc(files)
      assert.ok(doc.includes('<style>h1 { color: red; }</style>'))
      assert.ok(doc.includes('<script>console.log("preview active");</script>'))
      assert.ok(doc.includes('PREVIEW_CONSOLE'))
    })

    it('provides fallback container if index.html is missing', () => {
      const doc = generatePreviewDoc({})
      assert.ok(doc.includes('No HTML Entry'))
    })
  })

  describe('6. Project Templates', () => {
    it('defines expected templates with icons and primary files', () => {
      assert.ok(TEMPLATE_OPTIONS.length >= 4)
      const ids = TEMPLATE_OPTIONS.map((t) => t.id)
      assert.ok(ids.includes('node-express'))
      assert.ok(ids.includes('react-vite'))
      assert.ok(ids.includes('python-flask'))
      assert.ok(ids.includes('vanilla-web'))
    })
  })
})
