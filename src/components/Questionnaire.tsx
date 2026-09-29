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

function isFollowUp(q: Question): boolean {
  return Boolean(q?.showIf)
}

export function Questionnaire({ answers, onChange }: QuestionnaireProps) {
  const qs = questions as Question[]
  const visible = qs.filter((q) => isVisible(q, answers))

  const setAnswer = (id: string, value: AnswerValue) => {
    const next: Answers = { ...answers, [id]: value }
    const q = qs.find((item) => item.id === id)
    if (q?.type === 'yes_no' && value === false) {
      for (const childId of childIdsOf(id, qs)) {
        delete next[childId]
      }
    }
    onChange(next)
  }

  return (
    <section className="panel overflow-hidden">
      <div className="panel-header">
        <h2 className="panel-title">Health intake</h2>
        <span className="text-[0.6875rem] text-[var(--muted)]">
          {visible.length} questions · follow-ups as needed
        </span>
      </div>
      <div className="panel-body">
        {visible.map((q) => (
          <div
            key={q.id}
            className={`field-row ${isFollowUp(q) ? 'sm:pl-3 sm:border-l-2 sm:border-[var(--accent-soft)]' : ''}`}
          >
            <label className="text-sm font-medium text-[var(--ink)]" htmlFor={q.id}>
              {q.text}
              {isFollowUp(q) ? (
                <span className="ml-2 text-[0.6875rem] font-normal uppercase tracking-wide text-[var(--muted)]">
                  Follow-up
                </span>
              ) : null}
            </label>
            <div>
              {q.type === 'yes_no' && (
                <div id={q.id} className="inline-flex" role="group" aria-label={q.text}>
                  {[true, false].map((val) => (
                    <button
                      key={String(val)}
                      type="button"
                      className="seg-btn"
                      aria-pressed={answers?.[q.id] === val}
                      onClick={() => setAnswer(q.id, val)}
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
                  className="input-control"
                />
              )}
              {q.type === 'select' && (
                <select
                  id={q.id}
                  value={typeof answers?.[q.id] === 'string' ? String(answers[q.id]) : ''}
                  onChange={(e) => setAnswer(q.id, e.target.value || undefined)}
                  className="input-control max-w-md"
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
          </div>
        ))}
      </div>
    </section>
  )
}
