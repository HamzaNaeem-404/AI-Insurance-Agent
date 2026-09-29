import presets from '../data/presets.json'
import type { Answers } from '../engine/types'

interface PresetBarProps {
  activeId: string | null
  onSelect: (id: string, answers: Answers) => void
}

export function PresetBar({ activeId, onSelect }: PresetBarProps) {
  return (
    <div className="panel overflow-hidden">
      <div className="panel-header">
        <h2 className="panel-title">Sample cases</h2>
        <span className="text-[0.6875rem] text-[var(--muted)]">
          Load a profile to review eligibility
        </span>
      </div>
      <div className="flex flex-col gap-0 sm:flex-row">
        {(presets ?? []).map((preset, index) => {
          const active = activeId === preset?.id
          return (
            <button
              key={preset?.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(preset.id, preset.answers as Answers)}
              className={`relative flex-1 cursor-pointer border-0 border-[var(--line)] px-3 py-3 text-left transition sm:border-l ${
                index === 0 ? 'sm:border-l-0' : ''
              } border-t sm:border-t-0 ${
                active
                  ? 'bg-[var(--accent-soft)] shadow-[inset_0_0_0_2px_var(--accent)]'
                  : 'bg-[var(--surface)] hover:bg-[var(--accent-soft)]/60'
              }`}
            >
              {active ? (
                <span
                  className="absolute inset-x-0 top-0 h-0.5 bg-[var(--accent)] sm:inset-y-0 sm:left-0 sm:h-auto sm:w-1"
                  aria-hidden
                />
              ) : null}
              <div
                className={`text-[0.6875rem] font-semibold uppercase tracking-wide ${
                  active ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
                }`}
              >
                Case {index + 1}
                {active ? (
                  <span className="ml-2 rounded bg-[var(--accent)] px-1.5 py-0.5 text-[0.625rem] font-bold tracking-wide text-white">
                    Selected
                  </span>
                ) : null}
              </div>
              <div
                className={`mt-0.5 text-sm font-medium ${
                  active ? 'text-[var(--navy)]' : 'text-[var(--ink)]'
                }`}
              >
                {preset?.shortLabel ?? preset?.label}
              </div>
              <div className="mt-0.5 text-xs text-[var(--muted)]">{preset?.label}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
