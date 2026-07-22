---
name: Flow v2 Architecture
description: Key decisions and patterns for the Flow finance app after the v2 upgrade
---

## Stack
- Monorepo: pnpm workspaces, TypeScript 5.9, Node 24
- Frontend: React + Vite at `artifacts/flow-app/` (preview path `/`)
- Backend: Express 5 at `artifacts/api-server/` (preview path `/api`)
- DB: PostgreSQL via Drizzle ORM in `lib/db/`
- API contract: OpenAPI-first in `lib/api-spec/openapi.yaml`, codegen via Orval → React Query hooks in `lib/api-client-react/` and Zod schemas in `lib/api-zod/`

## Codegen workflow
Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change. This also runs `typecheck:libs`.

**Why:** Orval generates both React Query hooks AND Zod validation schemas from the single OpenAPI spec. Any new endpoint needs to be in the spec first, then codegen, then implement.

## DB push workflow
Run `pnpm --filter @workspace/db run push` after any schema change.

## DB schema tables
- `incomeTable` — id, amount, source, date, category (default 'other')
- `billsTable` — id, amount, name, category (default 'miscellaneous')
- `settingsTable` — id, bufferPct, bufferBalance, bufferGoalMonths, onboarded
- `savingsGoalsTable` — id, name, targetAmount, currentAmount, deadline, completed, createdAt
- `recurringItemsTable` — id, type, name, amount, category, frequency, startDate, active, createdAt

## Frontend tabs
5 tabs in FlowApp.tsx: Home | Income | Bills | Goals | Charts

**Why:** Added Goals tab for savings goals + What If simulator. Charts kept separate for analytics.

## Key frontend files
- `src/pages/FlowApp.tsx` — root layout, 5-tab nav, currency/theme controls, demo data menu
- `src/components/HomeTab.tsx` — safe-to-spend hero, insights grid, buffer bar, activity feed
- `src/components/GoalsTab.tsx` — savings goals CRUD + What If simulator sliders
- `src/components/ChartsTab.tsx` — monthly bar chart + category breakdown (recharts)
- `src/hooks/useCurrency.ts` — currency context from localStorage, `formatAmount(n)` function
- `src/components/ThemeProvider.tsx` — dark/light theme from localStorage
- `src/lib/pdfExport.ts` — jsPDF + jspdf-autotable report generator
- `src/components/CsvImportModal.tsx` — CSV parse, validate, batch import
- `src/components/EditIncomeSheet.tsx` / `EditBillSheet.tsx` — edit mutations

## API routes
- GET/POST/PATCH/DELETE /income, /bills
- GET/PATCH /settings
- GET /dashboard (insights: dailyBudget, daysRemainingInMonth, savingsPct, spendingRate, projectedMonthEnd, budgetHealth)
- GET /analytics/monthly
- GET /export/csv
- GET/POST/PUT/DELETE /recurring
- GET/POST/PUT/DELETE /savings-goals
- POST /demo/load (seeds demo data + sets onboarded=true)
- POST /demo/clear (clears all + resets settings)

## PWA
vite-plugin-pwa added to vite.config.ts with NetworkFirst strategy for /api routes.

## Design palette
- `--ink` #1B2430, `--paper` #EDEEE9, `--paper-raised` #F6F6F3
- `--gold` #C9A227, `--teal` #2F6E63, `--coral` #C1584A, `--gray` #8B9098
- Dark mode: --ink flips to light (~213 28% 90%), --paper becomes dark (~213 20% 14%)

## Known quirk: settings.onboarded reset
After DB schema pushes, check that `settings.onboarded` is still true. If not:
`pool.query('UPDATE settings SET onboarded = true')` from lib/db directory.
