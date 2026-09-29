export type AnswerValue = boolean | number | string | null | undefined

export type Answers = Record<string, AnswerValue>

export type CompareOp = 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte' | 'in'

export type Condition =
  | { field: string; op: CompareOp; value: AnswerValue | AnswerValue[] }
  | { all: Condition[] }
  | { any: Condition[] }

export type Outcome =
  | 'Decline'
  | 'needs_review'
  | 'Guaranteed'
  | 'Guaranteed Issue'
  | 'Graded'
  | 'Modified'
  | 'ROP'
  | 'Standard'
  | 'Select'
  | 'Level'
  | 'Preferred'
  | 'eligible'

export interface RuleSource {
  section: string
  text: string
}

export interface Rule {
  id: string
  carrier: string
  product: string
  productId: string
  condition: string
  when: Condition
  outcome: Outcome
  source: RuleSource
  reasonNote?: string
}

export interface Product {
  id: string
  carrier: string
  product: string
}

export interface MatchedRule {
  ruleId: string
  outcome: Outcome
  condition: string
  source: RuleSource
  reasonNote?: string
}

export interface Result {
  productId: string
  carrier: string
  product: string
  outcome: Outcome
  reason: string
  matchedRules: MatchedRule[]
  needsReviewReason?: string
}

export interface QuestionShowIf {
  field: string
  op: CompareOp
  value: AnswerValue
}

export interface Question {
  id: string
  text: string
  type: 'yes_no' | 'number' | 'select'
  options?: string[]
  min?: number
  max?: number
  showIf?: QuestionShowIf
}
