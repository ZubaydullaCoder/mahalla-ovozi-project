import { describe, expect, it } from 'vitest'
import { ClassifierOutputSchema } from './schema.js'

describe('ClassifierOutputSchema', () => {
  it('accepts a valid signal classification', () => {
    const result = ClassifierOutputSchema.safeParse({
      decision:      'signal',
      category:      'water',
      hokim_related: false,
      short_label:   'No water for three days',
    })

    expect(result.success).toBe(true)
  })

  it('accepts a valid ignore classification', () => {
    const result = ClassifierOutputSchema.safeParse({
      decision: 'ignore',
    })

    expect(result.success).toBe(true)
  })

  it('rejects a signal classification without category', () => {
    const result = ClassifierOutputSchema.safeParse({
      decision: 'signal',
    })

    expect(result.success).toBe(false)
  })

  it('rejects an invalid decision', () => {
    const result = ClassifierOutputSchema.safeParse({
      decision: 'maybe',
    })

    expect(result.success).toBe(false)
  })
})
