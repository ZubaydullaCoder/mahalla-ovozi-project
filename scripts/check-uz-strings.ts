import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Scans strings.ts for Latin Uzbek slip-throughs.
// Latin Uzbek characters that must never appear in UI strings:
// o' → ʻ  g' → ġ  sh → ш  ch → ч  ng → нг  etc.
// Simple approach: flag any file containing obvious Latin-only Uzbek words.

const LATIN_UZ_PATTERNS = [
  /\bma['ʻ]lumot/i,
  /\bmahalla\b/i,       // must be Маҳалла in UI
  /\bsignal\b/i,        // must be Сигнал in UI
  /\bbugun\b/i,         // must be Бугун
  /\bkecha\b/i,         // must be Кеча
  /\bsoat\b/i,          // must be соат
  /\bqidiruv\b/i,       // must be Қидириш
]

describe('Uzbek Cyrillic string enforcement', () => {
  it('strings.ts contains no Latin Uzbek slip-throughs', () => {
    const stringsPath = resolve('apps/web/src/strings.ts')
    let content: string
    try {
      content = readFileSync(stringsPath, 'utf-8')
    } catch {
      // File does not exist yet — acceptable in early stories
      return
    }

    for (const pattern of LATIN_UZ_PATTERNS) {
      const match = content.match(pattern)
      expect(match, `Latin Uzbek detected in strings.ts: "${match?.[0]}"`).toBeNull()
    }
  })
})
