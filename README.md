# Flow — Safe to Spend

> Know exactly what's safe to spend, always.

Flow is a personal finance app designed for freelancers, contractors, and anyone with variable income. It calculates your **safe to spend** figure by taking your baseline income, subtracting fixed bills and a configurable buffer reserve, and giving you a clear, confident number.

---

## Features

- **Safe to Spend Calculator** — Baseline income minus bills minus buffer, in real time
- **Cushion Buffer** — Set a savings reserve target (e.g. 3 months of income) and track your progress
- **Financial Insights** — Daily budget, savings rate, spending rate, projected month-end, budget health indicator
- **Income Tracking** — Log freelance payments with source, date, and category
- **Fixed Bills** — Track recurring monthly costs with categories
- **Recurring Transactions** — Set up daily / weekly / monthly / yearly income and bill templates
- **Savings Goals** — Create targets, track progress, set deadlines, mark complete
- **What If? Simulator** — Drag sliders to see how income or expense changes affect your safe-to-spend before committing
- **Charts** — Monthly income vs bills bar chart, category breakdown
- **CSV Export** — Download income or bills as CSV from any list view
- **CSV Import** — Import previously exported CSVs with validation and error feedback
- **PDF Report** — Export a premium financial report with charts, summaries, and goal tracking
- **Dark Mode** — Full dark theme that preserves the notebook aesthetic, persisted in localStorage
- **Currency Selector** — Switch between USD, INR, EUR, GBP, CAD, AUD, SGD, JPY
- **Search & Filter** — Full-text search and category filters on income and bills
- **Edit & Delete** — Tap the pencil icon to edit any entry; delete with the trash icon
- **Demo Data** — Load rich demo data or clear everything from the ··· menu
- **PWA** — Installable as a Progressive Web App with offline support
- **Accessibility** — ARIA labels, roles, live regions, keyboard-navigable
- **Toasts** — Success, warning, and error notifications throughout

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS v4, shadcn/ui |
| Backend | Express 5, Node 24 |
| Database | PostgreSQL via Drizzle ORM |
| API Contract | OpenAPI 3.1 → Orval codegen → React Query + Zod |
| Monorepo | pnpm workspaces, TypeScript 5.9 |
| Fonts | Fraunces (serif), IBM Plex Sans, IBM Plex Mono |

---

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL database (set `DATABASE_URL` env var)

### Install

```bash
pnpm install
```

### Development

```bash
# Start the frontend (Vite dev server)
pnpm --filter @workspace/flow-app run dev

# Start the backend API
pnpm --filter @workspace/api-server run dev

# Push DB schema changes
pnpm --filter @workspace/db run push

# Regenerate API client after spec changes
pnpm --filter @workspace/api-spec run codegen
```

---

## Project Structure

```
├── artifacts/
│   ├── flow-app/          # React + Vite frontend
│   └── api-server/        # Express 5 backend
├── lib/
│   ├── db/                # Drizzle ORM schema + client
│   ├── api-spec/          # OpenAPI 3.1 spec + codegen config
│   ├── api-client-react/  # Generated React Query hooks
│   └── api-zod/           # Generated Zod schemas
```

---

## Palette

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#1B2430` | Primary text, backgrounds |
| `--paper` | `#EDEEE9` | App background |
| `--paper-raised` | `#F6F6F3` | Cards, surfaces |
| `--gold` | `#C9A227` | Savings, highlights |
| `--teal` | `#2F6E63` | Income, positive |
| `--coral` | `#C1584A` | Bills, negative, alerts |
| `--gray` | `#8B9098` | Secondary text |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Express session secret |
| `PORT` | Yes | Port for each artifact service |
| `BASE_PATH` | Yes | URL base path for each artifact |

---

## Customization

### Buffer percentage
Update via Settings API: `PATCH /api/settings { "bufferPct": 0.3 }` (default 20%)

### Buffer goal
`PATCH /api/settings { "bufferGoalMonths": 6 }` (default 3 months)

### Add currencies
Edit `artifacts/flow-app/src/hooks/useCurrency.ts` — add to `CURRENCIES` map.

### Add categories
Edit `artifacts/flow-app/src/lib/categories.ts` — add to `INCOME_CATEGORIES` or `BILL_CATEGORIES`.

---

## Deployment

This project is configured for Replit deployment. Build outputs:
- Frontend: `artifacts/flow-app/dist/public/` (static, served at `/`)
- Backend: `artifacts/api-server/dist/index.mjs` (Node.js, at `/api`)

---

## Changelog

### v2.0
- Dark mode, currency selector, 5-tab layout
- Charts tab with monthly analytics and category breakdown
- Savings Goals with progress tracking
- What If? Budget Simulator
- Recurring transactions
- Edit transactions inline
- CSV import/export
- PDF report export
- Demo data load / clear all
- PWA support
- Enhanced dashboard insights (daily budget, budget health, projected month-end)
- Search + category filters on all lists
- Success/error toast notifications throughout

### v1.0
- Safe to spend calculator
- Income and bills tracking
- Cushion buffer
- Onboarding flow
