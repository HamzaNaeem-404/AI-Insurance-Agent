import type {
  Answers,
  AnswerValue,
  Condition,
  MatchedRule,
  Outcome,
  Product,
  Result,
  Rule,
} from './types'

/** Lower number = worse outcome (wins when multiple rules match). */
const OUTCOME_SEVERITY: Record<string, number> = {
  Decline: 100,
  needs_review: 90,
  Guaranteed: 70,
  'Guaranteed Issue': 70,
  Graded: 55,
  Modified: 55,
  ROP: 55,
  Standard: 40,
  Select: 40,
  Level: 40,
  Preferred: 20,
  eligible: 20,
}

export function outcomeSeverity(outcome: Outcome | string): number {
  return OUTCOME_SEVERITY[outcome] ?? 50
}

function isMissing(value: AnswerValue): boolean {
  return value === null || value === undefined || value === ''
}

function compare(
  actual: AnswerValue,
  op: string,
  expected: AnswerValue | AnswerValue[],
): boolean | 'missing' {
  if (isMissing(actual)) return 'missing'

  switch (op) {
    case 'eq':
      return actual === expected
    case 'neq':
      return actual !== expected
    case 'lt':
      return typeof actual === 'number' && typeof expected === 'number' && actual < expected
    case 'lte':
      return typeof actual === 'number' && typeof expected === 'number' && actual <= expected
    case 'gt':
      return typeof actual === 'number' && typeof expected === 'number' && actual > expected
    case 'gte':
      return typeof actual === 'number' && typeof expected === 'number' && actual >= expected
    case 'in':
      return Array.isArray(expected) && expected.includes(actual)
    default:
      return false
  }
}

type EvalResult = { match: boolean; missing: boolean }

export function evalCondition(condition: Condition, answers: Answers): EvalResult {
  if ('all' in condition) {
    let anyMissing = false
    for (const child of condition.all ?? []) {
      const r = evalCondition(child, answers)
      if (r.missing) anyMissing = true
      if (!r.match && !r.missing) return { match: false, missing: false }
      if (!r.match && r.missing) return { match: false, missing: true }
    }
    return { match: true, missing: anyMissing }
  }

  if ('any' in condition) {
    let anyMissing = false
    let anyMatch = false
    for (const child of condition.any ?? []) {
      const r = evalCondition(child, answers)
      if (r.match) anyMatch = true
      if (r.missing) anyMissing = true
    }
    if (anyMatch) return { match: true, missing: false }
    if (anyMissing) return { match: false, missing: true }
    return { match: false, missing: false }
  }

  const result = compare(answers?.[condition.field], condition.op, condition.value)
  if (result === 'missing') return { match: false, missing: true }
  return { match: result, missing: false }
}

function buildReason(outcome: Outcome, matched: MatchedRule[]): string {
  if (matched.length === 0) {
    return outcome === 'needs_review' ? 'No rule found' : 'No adverse rules matched'
  }
  const primary = matched[0]
  const text = primary?.source?.text ?? ''
  if (outcome === 'Decline') return `Not eligible: ${text}`
  if (outcome === 'needs_review') return `Needs review: ${text}`
  return `${outcome}: ${text}`
}

const TRACKED_CONDITIONS = ['Hospitalization', 'Depression', 'Heart Attack'] as const

function positiveConditionFlags(answers: Answers): string[] {
  const flags: string[] = []
  if (answers?.hosp_recent === true) flags.push('Hospitalization')
  if (answers?.depression === true) flags.push('Depression')
  if (answers?.heart_attack === true) flags.push('Heart Attack')
  return flags
}

/**
 * Pure underwriting evaluation. No UI, no AI — only rules decide eligibility.
 */
export function evaluate(
  answers: Answers,
  rules: Rule[],
  products: Product[],
): Result[] {
  return (products ?? []).map((product) => {
    const productRules = (rules ?? []).filter((r) => r?.productId === product?.id)
    const matched: MatchedRule[] = []
    let missingRequired = false

    for (const rule of productRules) {
      if (rule?.condition === 'Baseline') continue
      const { match, missing } = evalCondition(rule.when, answers)
      if (missing) {
        // Only flag missing if a parent condition gate is true and we need follow-ups
        const gateField =
          rule.condition === 'Hospitalization'
            ? 'hosp_recent'
            : rule.condition === 'Depression'
              ? 'depression'
              : rule.condition === 'Heart Attack'
                ? 'heart_attack'
                : null
        if (gateField && answers?.[gateField] === true) {
          missingRequired = true
        }
        continue
      }
      if (match) {
        matched.push({
          ruleId: rule.id,
          outcome: rule.outcome,
          condition: rule.condition,
          source: rule.source,
          reasonNote: rule.reasonNote,
        })
      }
    }

    // Sort matched by severity descending (worst first)
    matched.sort(
      (a, b) => outcomeSeverity(b.outcome) - outcomeSeverity(a.outcome),
    )

    const positive = positiveConditionFlags(answers)
    for (const cond of positive) {
      if (!TRACKED_CONDITIONS.includes(cond as (typeof TRACKED_CONDITIONS)[number])) continue
      const covered = matched.some((m) => m.condition === cond)
      if (!covered && !missingRequired) {
        // Check if any rules exist for this product+condition at all
        const hasRules = productRules.some((r) => r.condition === cond)
        if (!hasRules) {
          return {
            productId: product.id,
            carrier: product.carrier,
            product: product.product,
            outcome: 'needs_review' as Outcome,
            reason: 'No rule found',
            matchedRules: [],
            needsReviewReason: `No rule found for ${cond}`,
          }
        }
      }
    }

    if (missingRequired && matched.length === 0) {
      return {
        productId: product.id,
        carrier: product.carrier,
        product: product.product,
        outcome: 'needs_review',
        reason: 'Needs review: required follow-up answer is missing',
        matchedRules: [],
        needsReviewReason: 'Required answer missing',
      }
    }

    if (matched.length > 0) {
      const worst = matched[0]!
      // If missing follow-ups but we already have a decline, decline still wins
      let outcome = worst.outcome
      if (missingRequired && outcomeSeverity(outcome) < outcomeSeverity('needs_review')) {
        outcome = 'needs_review'
      }
      return {
        productId: product.id,
        carrier: product.carrier,
        product: product.product,
        outcome,
        reason: buildReason(outcome, matched),
        matchedRules: matched,
        needsReviewReason: missingRequired ? 'Required answer missing' : undefined,
      }
    }

    // Baseline / healthy path
    const baseline = productRules.find((r) => r.condition === 'Baseline')
    if (baseline) {
      const { match } = evalCondition(baseline.when, answers)
      if (match) {
        const m: MatchedRule = {
          ruleId: baseline.id,
          outcome: baseline.outcome,
          condition: baseline.condition,
          source: baseline.source,
        }
        return {
          productId: product.id,
          carrier: product.carrier,
          product: product.product,
          outcome: baseline.outcome,
          reason: buildReason(baseline.outcome, [m]),
          matchedRules: [m],
        }
      }
    }

    // Positive condition but no matching rule → needs_review
    if (positive.length > 0) {
      return {
        productId: product.id,
        carrier: product.carrier,
        product: product.product,
        outcome: 'needs_review',
        reason: 'No rule found',
        matchedRules: [],
        needsReviewReason: 'No rule found',
      }
    }

    return {
      productId: product.id,
      carrier: product.carrier,
      product: product.product,
      outcome: 'Preferred',
      reason: 'No adverse rules matched',
      matchedRules: [],
    }
  })
}
