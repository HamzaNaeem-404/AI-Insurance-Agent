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
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <header className="mb-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
          Nick Dale · Final expense underwriting
        </p>
        <h1 className="mb-2 mt-0 text-2xl sm:text-3xl">Underwriting rules demo</h1>
        <p className="m-0 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
          Only the rules decide eligibility, and every result quotes its rule. No AI in this
          demo — answers go through one pure function that reads his rules doc as data.
        </p>
      </header>

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

      <div className="flex flex-col gap-4">
        <ClientCard />
        <Questionnaire answers={answers} onChange={handleAnswers} />
        <ResultList
          results={results}
          overrides={overrides}
          onOverride={handleOverride}
        />
        <OpenQuestions />
      </div>

      <footer className="mt-8 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)]">
        Demo only · fake client data · no login · robots noindex · rules from Nick&apos;s
        underwriting document
      </footer>
    </div>
  )
}
