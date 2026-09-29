import { describe, expect, it } from 'vitest'
import { evaluate, evalCondition, outcomeSeverity } from './evaluate'
import rules from '../data/rules.json'
import products from '../data/products.json'
import presets from '../data/presets.json'
import type { Answers, Rule, Product } from './types'

const typedRules = rules as Rule[]
const typedProducts = products as Product[]

describe('outcomeSeverity', () => {
  it('ranks Decline worse than Preferred', () => {
    expect(outcomeSeverity('Decline')).toBeGreaterThan(outcomeSeverity('Preferred'))
    expect(outcomeSeverity('Decline')).toBeGreaterThan(outcomeSeverity('Guaranteed'))
    expect(outcomeSeverity('Guaranteed')).toBeGreaterThan(outcomeSeverity('Standard'))
  })
})

describe('evalCondition', () => {
  it('evaluates all / any / comparisons', () => {
    const answers: Answers = { a: true, b: 8, c: 'x' }
    expect(evalCondition({ field: 'a', op: 'eq', value: true }, answers).match).toBe(true)
    expect(evalCondition({ field: 'b', op: 'gte', value: 5 }, answers).match).toBe(true)
    expect(
      evalCondition(
        { all: [{ field: 'a', op: 'eq', value: true }, { field: 'b', op: 'lt', value: 10 }] },
        answers,
      ).match,
    ).toBe(true)
    expect(
      evalCondition(
        { any: [{ field: 'a', op: 'eq', value: false }, { field: 'c', op: 'eq', value: 'x' }] },
        answers,
      ).match,
    ).toBe(true)
  })

  it('flags missing fields', () => {
    const r = evalCondition({ field: 'missing', op: 'eq', value: true }, {})
    expect(r.missing).toBe(true)
    expect(r.match).toBe(false)
  })
})

describe('evaluate presets', () => {
  for (const preset of presets) {
    it(`${preset.id}: ${preset.label}`, () => {
      const results = evaluate(preset.answers as Answers, typedRules, typedProducts)
      for (const [productId, expectedOutcome] of Object.entries(preset.expected)) {
        const result = results.find((r) => r.productId === productId)
        expect(result, `missing result for ${productId}`).toBeDefined()
        expect(result?.outcome).toBe(expectedOutcome)
      }
    })
  }
})

describe('evaluate edge cases', () => {
  it('never silently defaults to Preferred when condition has no covering match and no baseline', () => {
    const results = evaluate(
      { tobacco: false, hosp_recent: true, hosp_currently: false, hosp_days: 1, hosp_times_2yr: false, depression: false, heart_attack: false },
      typedRules,
      typedProducts,
    )
    // Ethos/Baltimore: hosp not current, days < 5 → no hosp rule matches; depression/HA false
    // positive Hospitalization with no matching rule → needs_review
    const ethos = results.find((r) => r.productId === 'ethos-advantage')
    expect(ethos?.outcome).toBe('needs_review')
  })

  it('worst outcome wins when multiple rules match', () => {
    const results = evaluate(
      {
        tobacco: true,
        hosp_recent: false,
        depression: false,
        heart_attack: true,
        heart_attack_months_ago: 6,
        heart_attack_count: 1,
        heart_medication: true,
      },
      typedRules,
      typedProducts,
    )
    const ethos = results.find((r) => r.productId === 'ethos-advantage')
    expect(ethos?.outcome).toBe('Decline')
    expect(ethos?.matchedRules?.length).toBeGreaterThan(0)
    expect(ethos?.matchedRules?.[0]?.source?.text).toBeTruthy()
  })
})
