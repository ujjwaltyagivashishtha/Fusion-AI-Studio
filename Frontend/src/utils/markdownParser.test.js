import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  sanitizeUrl,
  highlightCodeTokens,
  parseMarkdownBlocks
} from './markdownParser.js'

describe('Frontend Markdown Parser & Sanitizer Suite', () => {
  // 1. URL Sanitization & Security
  describe('1. URL Sanitization & Security', () => {
    it('allows valid https, http, and mailto links', () => {
      assert.strictEqual(sanitizeUrl('https://example.com/docs'), 'https://example.com/docs')
      assert.strictEqual(sanitizeUrl('http://localhost:3000'), 'http://localhost:3000')
      assert.strictEqual(sanitizeUrl('mailto:dev@fusionai.studio'), 'mailto:dev@fusionai.studio')
    })

    it('blocks malicious javascript:, data:, and vbscript: protocols', () => {
      assert.strictEqual(sanitizeUrl('javascript:alert(document.cookie)'), null)
      assert.strictEqual(sanitizeUrl('JAVASCRIPT:alert(1)'), null)
      assert.strictEqual(sanitizeUrl('data:text/html;base64,PHNjcmlwdD4='), null)
      assert.strictEqual(sanitizeUrl('vbscript:msgbox("xss")'), null)
    })
  })

  // 2. Headings, Lists, Blockquotes, and Paragraphs
  describe('2. Block-level parsing', () => {
    it('parses headings with correct levels (#, ##, ###)', () => {
      const input = '# Heading 1\n## Heading 2\n### Heading 3'
      const blocks = parseMarkdownBlocks(input)
      assert.strictEqual(blocks.length, 3)
      assert.strictEqual(blocks[0].type, 'heading')
      assert.strictEqual(blocks[0].level, 1)
      assert.strictEqual(blocks[0].text, 'Heading 1')
      assert.strictEqual(blocks[1].level, 2)
      assert.strictEqual(blocks[2].level, 3)
    })

    it('parses ordered and unordered lists', () => {
      const input = '- Item A\n- Item B\n* Item C\n\n1. Step One\n2. Step Two'
      const blocks = parseMarkdownBlocks(input)
      const ulBlock = blocks.find((b) => b.type === 'ul')
      const olBlock = blocks.find((b) => b.type === 'ol')

      assert.ok(ulBlock)
      assert.strictEqual(ulBlock.items.length, 3)
      assert.strictEqual(ulBlock.items[0], 'Item A')

      assert.ok(olBlock)
      assert.strictEqual(olBlock.items.length, 2)
      assert.strictEqual(olBlock.items[0], 'Step One')
    })

    it('parses blockquotes and horizontal rules', () => {
      const input = '> Note: Important advisory\n\n---\n\nRegular text paragraph'
      const blocks = parseMarkdownBlocks(input)

      assert.strictEqual(blocks[0].type, 'blockquote')
      assert.strictEqual(blocks[0].text, 'Note: Important advisory')
      assert.strictEqual(blocks[1].type, 'hr')
      assert.strictEqual(blocks[2].type, 'p')
    })
  })

  // 3. Fenced Code Blocks & Multi-Language Support
  describe('3. Code Fences & Syntax Highlighting', () => {
    it('parses fenced JavaScript, Python, and Java code blocks', () => {
      const jsBlock = '```javascript\nconst app = express();\n```'
      const pyBlock = '```python\ndef handler():\n    return 42\n```'
      const javaBlock = '```java\npublic class Server {}\n```'

      const parsedJs = parseMarkdownBlocks(jsBlock)
      assert.strictEqual(parsedJs[0].type, 'code')
      assert.strictEqual(parsedJs[0].lang, 'javascript')
      assert.ok(parsedJs[0].code.includes('const app = express();'))

      const parsedPy = parseMarkdownBlocks(pyBlock)
      assert.strictEqual(parsedPy[0].lang, 'python')

      const parsedJava = parseMarkdownBlocks(javaBlock)
      assert.strictEqual(parsedJava[0].lang, 'java')
    })

    it('tokenizes code into keywords, strings, comments, and numbers', () => {
      const code = 'const port = 3000; // Server Port\nconst name = "Fusion";'
      const rows = highlightCodeTokens(code)
      assert.strictEqual(rows.length, 2)

      const line1Tokens = rows[0].tokens
      const hasKeyword = line1Tokens.some((t) => t.type === 'keyword' && t.text === 'const')
      const hasNumber = line1Tokens.some((t) => t.type === 'number' && t.text === '3000')
      const hasComment = line1Tokens.some((t) => t.type === 'comment')

      assert.ok(hasKeyword, 'Expected keyword token')
      assert.ok(hasNumber, 'Expected number token')
      assert.ok(hasComment, 'Expected comment token')
    })
  })

  // 4. Streaming Resilience: Incomplete Fences
  describe('4. Streaming Handling', () => {
    it('handles unclosed code fences during live streaming without throwing or crashing', () => {
      const incompleteStreamingMarkdown = 'Here is the server:\n```javascript\nconst app = express();\napp.use(cors());'
      const blocks = parseMarkdownBlocks(incompleteStreamingMarkdown)

      assert.strictEqual(blocks[0].type, 'p')
      assert.strictEqual(blocks[1].type, 'code')
      assert.strictEqual(blocks[1].lang, 'javascript')
      assert.strictEqual(blocks[1].isStreaming, true)
      assert.ok(blocks[1].code.includes('app.use(cors());'))
    })
  })
})
