import presets from '../data/presets.json'
import type { Answers } from '../engine/types'

interface PresetBarProps {
  activeId: string | null
  onSelect: (id: string, answers: Answers) => void
}

export function PresetBar({ activeId, onSelect }: PresetBarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      {(presets ?? []).map((preset) => {
        const active = activeId === preset?.id
        return (
          <button
            key={preset?.id}
            type="button"
            onClick={() => onSelect(preset.id, preset.answers as Answers)}
            className={`rounded-md border px-3 py-2 text-left text-sm transition ${
              active
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--accent)]'
            }`}
          >
            {preset?.label}
          </button>
        )
      })}
    </div>
  )
}
