import openQuestions from '../data/openQuestions.json'

export function OpenQuestions() {
  return (
    <section className="rounded-lg border border-dashed border-[var(--review)] bg-[var(--review-bg)]/40 p-4 sm:p-5">
      <h2 className="mb-1 mt-0 text-lg">Unclear rules we noticed</h2>
      <p className="mb-4 mt-0 text-sm text-[var(--muted)]">
        Exact wording from Nick&apos;s underwriting doc — for day-1 clarification.
      </p>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {(openQuestions ?? []).map((q) => (
          <li key={q.id} className="rounded-md bg-white/80 p-3 text-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--review)]">
              {q.section}
            </div>
            <blockquote className="my-2 border-l-2 border-[var(--review)] pl-3 italic">
              &ldquo;{q.exactWording}&rdquo;
            </blockquote>
            <p className="m-0 text-[var(--muted)]">{q.whyUnclear}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
