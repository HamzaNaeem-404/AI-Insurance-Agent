import { useMemo, useState } from 'react'
import { ClientCard } from './components/ClientCard'
import { PresetBar } from './components/PresetBar'
import { Questionnaire } from './components/Questionnaire'
import { ResultList, type OverrideState } from './components/ResultList'
import { OpenQuestions } from './components/OpenQuestions'
import { evaluate } from './engine/evaluate'
import type { Answers, Outcome, Rule, Product } from './engine/types'
import rules from './data/rules.json'
import products from './data/products.json'
import presets from './data/presets.json'
import client from './data/client.json'

const typedRules = rules as Rule[]
const typedProducts = products as Product[]

const emptyAnswers: Answers = {
  tobacco: false,
  height_ft: 5,
  height_in: 6,
  weight: 150,
  hosp_recent: false,
  depression: false,
  heart_attack: false,
}

export default function App() {
  const healthy = presets?.[0]?.answers as Answers | undefined
  const [answers, setAnswers] = useState<Answers>(healthy ?? emptyAnswers)
  const [activePreset, setActivePreset] = useState<string | null>(presets?.[0]?.id ?? null)
  const [overrides, setOverrides] = useState<Record<string, OverrideState>>({})

  const results = useMemo(
    () => evaluate(answers, typedRules, typedProducts),
    [answers],
  )

  const handleAnswers = (next: Answers) => {
    setAnswers(next)
    setActivePreset(null)
    setOverrides({})
  }

  const handleOverride = (productId: string, outcome: Outcome, reason: string) => {
    setOverrides((prev) => ({
      ...prev,
      [productId]: { outcome, reason },
    }))
  }

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white/65">
              Final expense · Underwriting
            </div>
            <h1 className="m-0 text-base font-semibold text-white sm:text-lg">
              Underwriting worksheet
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-white/80">
            <span>
              Agent <strong className="font-semibold text-white">{client?.agentId}</strong>
            </span>
            <span className="hidden h-3 w-px bg-white/25 sm:block" aria-hidden />
            <span>
              Client <strong className="font-semibold text-white">{client?.clientId}</strong>
            </span>
            <span className="rounded border border-white/25 bg-white/10 px-2 py-0.5 font-medium text-white">
              Rules engine
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 sm:py-6">
        <p className="mb-4 mt-0 max-w-3xl text-sm text-[var(--muted)]">
          Capture health answers and review carrier eligibility. Outcomes are determined only by
          the underwriting rules — each result cites the deciding language from the rules document.
        </p>

        <div className="mb-4">
          <PresetBar
            activeId={activePreset}
            onSelect={(id, presetAnswers) => {
              setAnswers({ ...presetAnswers })
              setActivePreset(id)
              setOverrides({})
            }}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-5">
            <ClientCard />
            <Questionnaire answers={answers} onChange={handleAnswers} />
          </div>
          <div className="flex flex-col gap-4 lg:col-span-7">
            <ResultList
              results={results}
              overrides={overrides}
              onOverride={handleOverride}
            />
            <OpenQuestions />
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-x-4 gap-y-1 px-4 py-3 text-[0.6875rem] text-[var(--muted)]">
          <span>Sample data only · PHI not stored</span>
          <span>No AI eligibility decisions</span>
          <span>Rules sourced from underwriting document</span>
        </div>
      </footer>
    </div>
  )
}
