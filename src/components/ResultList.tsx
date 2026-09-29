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

function rowTone(outcome: Outcome): string {
  if (outcome === 'Decline') return 'is-decline'
  if (outcome === 'needs_review') return 'is-review'
  if (outcome === 'Guaranteed' || outcome === 'Guaranteed Issue') return 'is-guaranteed'
  return 'is-ok'
}

export function ResultList({ results, overrides, onOverride }: ResultListProps) {
  const [openWhy, setOpenWhy] = useState<string | null>(null)
  const [overrideTarget, setOverrideTarget] = useState<Result | null>(null)

  const declineCount = (results ?? []).filter((r) => {
    const o = overrides?.[r.productId]?.outcome ?? r.outcome
    return o === 'Decline'
  }).length

  return (
    <section className="panel overflow-hidden">
      <div className="panel-header">
        <h2 className="panel-title">Carrier eligibility</h2>
        <span className="text-[0.6875rem] text-[var(--muted)]">
          {results?.length ?? 0} products · {declineCount} declined · rules only
        </span>
      </div>
      <div>
        {(results ?? []).map((r) => {
          const override = overrides?.[r.productId]
          const outcome = override?.outcome ?? r.outcome
          const styles = badgeStyles(outcome)
          const whyOpen = openWhy === r.productId
          return (
            <article
              key={r.productId}
              className={`eligibility-row ${rowTone(outcome)}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-[var(--navy)]">{r.carrier}</div>
                  <div className="text-sm text-[var(--muted)]">{r.product}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="status-pill"
                    style={{ background: styles.bg, color: styles.color }}
                  >
                    {outcome}
                  </span>
                  {override ? (
                    <span className="status-pill bg-[var(--review-bg)] text-[var(--review)]">
                      Agent override
                    </span>
                  ) : null}
                  <button
                    type="button"
                    className="rounded border border-[var(--line-strong)] bg-white px-2.5 py-1 text-xs font-medium text-[var(--ink)] hover:bg-[var(--surface-2)]"
                    onClick={() => setOverrideTarget(r)}
                  >
                    Override
                  </button>
                </div>
              </div>

              <p className="m-0 text-sm text-[var(--ink)]">
                {override ? `Override reason: ${override.reason}` : r.reason}
              </p>

              {!override && r.matchedRules?.[0]?.source?.text ? (
                <div className="rounded border border-[var(--line)] bg-white/80 px-3 py-2 text-sm">
                  <div className="text-[0.6875rem] font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Applicable rule
                  </div>
                  <p className="mb-1 mt-1 text-[var(--ink)]">
                    &ldquo;{r.matchedRules[0].source.text}&rdquo;
                  </p>
                  <p className="m-0 text-xs text-[var(--muted)]">
                    {r.matchedRules[0].source.section}
                  </p>
                </div>
              ) : null}

              {(r.matchedRules?.length ?? 0) > 0 && (
                <div>
                  <button
                    type="button"
                    className="text-xs font-medium text-[var(--accent)] hover:underline"
                    onClick={() => setOpenWhy(whyOpen ? null : r.productId)}
                  >
                    {whyOpen ? 'Hide rule trace' : 'View full rule trace'}
                  </button>
                  {whyOpen ? (
                    <ol className="mb-0 mt-2 list-decimal pl-5 text-xs text-[var(--muted)]">
                      {(r.matchedRules ?? []).map((m) => (
                        <li key={m.ruleId} className="mb-1">
                          <strong className="text-[var(--ink)]">{m.outcome}</strong>
                          {' — '}
                          {m.source?.text}{' '}
                          <span className="opacity-70">({m.condition})</span>
                        </li>
                      ))}
                    </ol>
                  ) : null}
                </div>
              )}
            </article>
          )
        })}
      </div>

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
