import type { Outcome } from '../engine/types'

interface OverrideModalProps {
  productLabel: string
  currentOutcome: Outcome
  onClose: () => void
  onSave: (outcome: Outcome, reason: string) => void
}

const OUTCOMES: Outcome[] = [
  'Preferred',
  'Standard',
  'Modified',
  'Graded',
  'Guaranteed',
  'Decline',
  'needs_review',
]

export function OverrideModal({
  productLabel,
  currentOutcome,
  onClose,
  onSave,
}: OverrideModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(11,31,51,0.45)] p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="override-title"
      onClick={onClose}
    >
      <form
        className="w-full max-w-md overflow-hidden rounded-md border border-[var(--line)] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          const outcome = String(fd.get('outcome') ?? currentOutcome) as Outcome
          const reason = String(fd.get('reason') ?? '').trim()
          if (!reason) return
          onSave(outcome, reason)
        }}
      >
        <div className="border-b border-[var(--line)] bg-[var(--surface-2)] px-4 py-3">
          <h3 id="override-title" className="m-0 text-sm font-semibold uppercase tracking-wide text-[var(--navy)]">
            Agent override
          </h3>
          <p className="mb-0 mt-1 text-sm text-[var(--muted)]">{productLabel}</p>
        </div>
        <div className="px-4 py-4">
          <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]" htmlFor="override-outcome">
            New status
          </label>
          <select
            id="override-outcome"
            name="outcome"
            defaultValue={currentOutcome}
            className="input-control mt-1 max-w-none"
          >
            {OUTCOMES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]" htmlFor="override-reason">
            Reason required
          </label>
          <textarea
            id="override-reason"
            name="reason"
            required
            rows={3}
            placeholder="Document why eligibility is being changed…"
            className="input-control mt-1 max-w-none"
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-[var(--line)] bg-[var(--surface-2)] px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-[var(--line-strong)] bg-white px-3 py-1.5 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded border border-[var(--accent)] bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
          >
            Save override
          </button>
        </div>
      </form>
    </div>
  )
}
