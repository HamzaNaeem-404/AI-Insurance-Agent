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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="override-title"
      onClick={onClose}
    >
      <form
        className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg"
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
        <h3 id="override-title" className="mt-0 text-lg">
          Override result
        </h3>
        <p className="text-sm text-[var(--muted)]">{productLabel}</p>
        <label className="mt-3 block text-sm font-medium" htmlFor="override-outcome">
          New status
        </label>
        <select
          id="override-outcome"
          name="outcome"
          defaultValue={currentOutcome}
          className="mt-1 w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm"
        >
          {OUTCOMES.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <label className="mt-3 block text-sm font-medium" htmlFor="override-reason">
          Reason for override <span className="text-[var(--decline)]">*</span>
        </label>
        <textarea
          id="override-reason"
          name="reason"
          required
          rows={3}
          placeholder="Required — why is the agent changing this result?"
          className="mt-1 w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--line)] px-3 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm text-white"
          >
            Apply override
          </button>
        </div>
      </form>
    </div>
  )
}
