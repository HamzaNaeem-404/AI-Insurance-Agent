# Nick Dale Underwriting Demo

Clickable underwriting rules demo for Nick Dale (final-expense). Answers go through a pure `evaluate()` function backed by `rules.json` — no AI decides eligibility.

## Stack

- Vite + React + TypeScript + Tailwind CSS
- No backend, no database, no login
- Vitest unit tests for the rules engine

## Scripts

```bash
npm install
npm run dev
npm test
npm run build
```

## Data

- `src/data/questions.json` — intake questions with `showIf`
- `src/data/rules.json` — carrier rules with exact source text from Nick's doc
- `src/data/presets.json` — three example clients with expected outcomes
- `src/data/openQuestions.json` — unclear rules noticed while encoding

## Deploy

Static site (Vercel). Includes `<meta name="robots" content="noindex" />`.
