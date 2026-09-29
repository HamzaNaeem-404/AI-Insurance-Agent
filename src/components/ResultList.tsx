import { useState } from 'react'
import type { Outcome, Result } from '../engine/types'
import { OverrideModal } from './OverrideModal'

export interface OverrideState {
  outcome: Outcome
  reason: string
}

interface ResultListProps {
  results: Result[]
  overrides: Record<string, OverrideState>
  onOverride: (productId: string, outcome: Outcome, reason: string) => void
}

function badgeStyles(outcome: Outcome): { bg: string; color: string } {
  if (outcome === 'Decline') return { bg: 'var(--decline-bg)', color: 'var(--decline)' }
  if (outcome === 'needs_review') return { bg: 'var(--review-bg)', color: 'var(--review)' }
  if (outcome === 'Guaranteed' || outcome === 'Guaranteed Issue') {
    return { bg: 'var(--guaranteed-bg)', color: 'var(--guaranteed)' }
  }
  return { bg: 'var(--ok-bg)', color: 'var(--ok)' }
}

export function ResultList({ results, overrides, onOverride }: ResultListProps) {
  const [openWhy, setOpenWhy] = useState<string | null>(null)
  const [overrideTarget, setOverrideTarget] = useState<Result | null>(null)

  return (
    <section className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
      <h2 className="mb-1 mt-0 text-lg">Carrier results</h2>
      <p className="mb-4 mt-0 text-sm text-[var(--muted)]">
        Eligibility comes only from the rules — every result quotes the deciding sentence.
      </p>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {(results ?? []).map((r) => {
          const override = overrides?.[r.productId]
          const outcome = override?.outcome ?? r.outcome
          const styles = badgeStyles(outcome)
          const whyOpen = openWhy === r.productId
          return (
            <li
              key={r.productId}
              className="rounded-md border border-[var(--line)] p-3 sm:p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-medium">
                    {r.carrier}{' '}
                    <span className="font-normal text-[var(--muted)]">{r.product}</span>
                  </div>
                  <span
                    className="mt-1 inline-block rounded px-2 py-0.5 text-xs font-semibold"
                    style={{ background: styles.bg, color: styles.color }}
                  >
                    {outcome}
                  </span>
                  {override ? (
                    <span className="ml-2 inline-block rounded bg-[var(--review-bg)] px-2 py-0.5 text-xs text-[var(--review)]">
                      Overridden by agent
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="rounded-md border border-[var(--line)] px-2.5 py-1 text-xs"
                  onClick={() => setOverrideTarget(r)}
                >
                  Override
                </button>
              </div>
              <p className="mb-1 mt-2 text-sm">
                {override
                  ? `Override reason: ${override.reason}`
                  : r.reason}
              </p>
              {!override && r.matchedRules?.[0]?.source?.text ? (
                <blockquote className="m-0 border-l-2 border-[var(--accent)] pl-3 text-sm italic text-[var(--muted)]">
                  &ldquo;{r.matchedRules[0].source.text}&rdquo;
                  <footer className="mt-1 not-italic text-xs">
                    — {r.matchedRules[0].source.section}
                  </footer>
                </blockquote>
              ) : null}
              {(r.matchedRules?.length ?? 0) > 0 && (
                <button
                  type="button"
                  className="mt-2 text-xs text-[var(--accent)] underline"
                  onClick={() => setOpenWhy(whyOpen ? null : r.productId)}
                >
                  {whyOpen ? 'Hide why' : 'Why (rule trace)'}
                </button>
              )}
              {whyOpen && (
                <ol className="mt-2 list-decimal pl-5 text-xs text-[var(--muted)]">
                  {(r.matchedRules ?? []).map((m) => (
                    <li key={m.ruleId} className="mb-1">
                      <strong>{m.outcome}</strong> — {m.source?.text}{' '}
                      <span className="opacity-70">({m.condition})</span>
                    </li>
                  ))}
                </ol>
              )}
            </li>
          )
        })}
      </ul>

      {overrideTarget ? (
        <OverrideModal
          productLabel={`${overrideTarget.carrier} — ${overrideTarget.product}`}
          currentOutcome={
            overrides?.[overrideTarget.productId]?.outcome ?? overrideTarget.outcome
          }
          onClose={() => setOverrideTarget(null)}
          onSave={(outcome, reason) => {
            onOverride(overrideTarget.productId, outcome, reason)
            setOverrideTarget(null)
          }}
        />
      ) : null}
    </section>
  )
}
