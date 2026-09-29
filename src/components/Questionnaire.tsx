import questions from '../data/questions.json'
import { evalCondition } from '../engine/evaluate'
import type { Answers, AnswerValue, Question } from '../engine/types'

interface QuestionnaireProps {
  answers: Answers
  onChange: (answers: Answers) => void
}

function isVisible(q: Question, answers: Answers): boolean {
  if (!q?.showIf) return true
  const { match } = evalCondition(
    { field: q.showIf.field, op: q.showIf.op, value: q.showIf.value },
    answers,
  )
  return match
}

function childIdsOf(parentId: string, all: Question[]): string[] {
  return (all ?? [])
    .filter((q) => q?.showIf?.field === parentId)
    .flatMap((q) => [q.id, ...childIdsOf(q.id, all)])
}

export function Questionnaire({ answers, onChange }: QuestionnaireProps) {
  const qs = questions as Question[]

  const setAnswer = (id: string, value: AnswerValue) => {
    const next: Answers = { ...answers, [id]: value }
    // When parent becomes false/no, clear hidden children
    const q = qs.find((item) => item.id === id)
    if (q?.type === 'yes_no' && value === false) {
      for (const childId of childIdsOf(id, qs)) {
        delete next[childId]
      }
    }
    onChange(next)
  }

  return (
    <section className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
      <h2 className="mb-1 mt-0 text-lg">Health questions</h2>
      <p className="mb-4 mt-0 text-sm text-[var(--muted)]">
        From Nick&apos;s intake worksheet. Follow-ups appear only when needed.
      </p>
      <div className="flex flex-col gap-4">
        {qs.filter((q) => isVisible(q, answers)).map((q) => (
          <div key={q.id} className="border-t border-[var(--line)] pt-3 first:border-t-0 first:pt-0">
            <label className="mb-2 block text-sm font-medium" htmlFor={q.id}>
              {q.text}
            </label>
            {q.type === 'yes_no' && (
              <div id={q.id} className="flex gap-2" role="group" aria-label={q.text}>
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    aria-pressed={answers?.[q.id] === val}
                    onClick={() => setAnswer(q.id, val)}
                    className={`min-w-16 rounded-md border px-3 py-1.5 text-sm ${
                      answers?.[q.id] === val
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                        : 'border-[var(--line)] bg-white'
                    }`}
                  >
                    {val ? 'Yes' : 'No'}
                  </button>
                ))}
              </div>
            )}
            {q.type === 'number' && (
              <input
                id={q.id}
                type="number"
                min={q.min}
                max={q.max}
                value={typeof answers?.[q.id] === 'number' ? String(answers[q.id]) : ''}
                onChange={(e) => {
                  const raw = e.target.value
                  setAnswer(q.id, raw === '' ? undefined : Number(raw))
                }}
                className="w-full max-w-xs rounded-md border border-[var(--line)] px-3 py-2 text-sm"
              />
            )}
            {q.type === 'select' && (
              <select
                id={q.id}
                value={typeof answers?.[q.id] === 'string' ? String(answers[q.id]) : ''}
                onChange={(e) => setAnswer(q.id, e.target.value || undefined)}
                className="w-full max-w-md rounded-md border border-[var(--line)] px-3 py-2 text-sm"
              >
                <option value="">Select…</option>
                {(q.options ?? []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
