import openQuestions from '../data/openQuestions.json'

export function OpenQuestions() {
  return (
    <section className="panel overflow-hidden">
      <div className="panel-header">
        <h2 className="panel-title">Rules clarification</h2>
        <span className="text-[0.6875rem] text-[var(--muted)]">
          Flagged for underwriter review
        </span>
      </div>
      <div className="divide-y divide-[var(--line)]">
        {(openQuestions ?? []).map((q, index) => (
          <div key={q.id} className="px-4 py-3 text-sm">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-[0.6875rem] font-bold text-[var(--review)]">
                #{index + 1}
              </span>
              <span className="text-xs font-semibold text-[var(--navy)]">{q.section}</span>
            </div>
            <blockquote className="my-2 border-l-2 border-[var(--line-strong)] pl-3 text-[var(--ink)]">
              &ldquo;{q.exactWording}&rdquo;
            </blockquote>
            <p className="m-0 text-xs leading-relaxed text-[var(--muted)]">{q.whyUnclear}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
