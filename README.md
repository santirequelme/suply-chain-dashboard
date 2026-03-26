# Make2Flow — Supply Chain Analytics Dashboard

A production-quality supply chain analytics dashboard built with React 18, TypeScript, Tailwind CSS, and Recharts. Features a Vision UI-inspired theme with a built-in dark/light mode toggle, fully responsive layout, and rich data exploration across facilities, suppliers, products, and shipments.

## Pencil design file: m2f-suply-chain-design.pen

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Tech Stack
| Framework | React 18 + TypeScript |
| Bundler | Vite 5 |
| Styling | Tailwind CSS|
| Charts | Recharts (Area, Bar, Pie/Donut) |
| State | Zustand (dark mode, sidebar, global search) |
| Routing | React Router v6 |
| Icons | Lucide React |
| Utilities | clsx + tailwind-merge |

---

## Mobile-First Approach

The entire application was designed mobile-first, meaning every layout decision starts from the smallest screen and scales up. The sidebar collapses into a slide-over drawer on mobile, revealed by a hamburger menu in the topbar. Navigation switches from a persistent left rail on desktop to a full-height overlay on mobile, ensuring thumb-friendly tap targets and no content overlap.

Data tables — the most challenging element on small screens — use horizontal scroll with a pinned first column so users never lose context while swiping. On the dashboard, KPI cards stack vertically in a single column on mobile and expand to a 2- or 4-column grid on larger breakpoints (`grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`). Charts use `ResponsiveContainer` from Recharts to fill their parent's width at any viewport size, with reduced tick density on narrow viewports via `interval="preserveStartEnd"`.

Every interactive element (buttons, selects, table rows) meets the 44px minimum touch target recommendation. ARIA labels are applied to all tables, charts, navigation regions, and form controls for screen-reader compatibility. The topbar is `sticky` with a `backdrop-blur` so it remains legible as content scrolls beneath it on mobile.

---

## AI Workflow

This project was built in collaboration with Claude (Anthropic) running in Cowork mode. The workflow followed a design-then-code discipline: wireframes for all five views were created first in Pencil.dev, then a custom Python script was used to apply a Vision UI dark color palette directly to the `.pen` JSON file — avoiding any manual color-picking. Once the design was locked, Claude scaffolded the full React project from `package.json` through every component and view, following three skills loaded at the start of the session: `react-19` (no manual memoization, named imports), `typescript` (const-types pattern, flat interfaces, no `any`), and `tailwind-4` (`cn()` utility, semantic classes, no hex in `className`).

Mock data (55 facilities, 22 suppliers, 120 products, 220 shipments) was generated using a seeded pseudo-random number generator so the data is deterministic, realistic, and reproducible without a database. The AI helped identify the right seeding strategy to avoid repeating patterns and to produce plausible seasonal revenue curves across 2020–2026.

---

## Features

- **Dashboard** — KPI cards with trend indicators, revenue/shipments area chart, shipments-by-status donut, top facilities bar chart, recent shipments table
- **Facilities** — Full data table (55 rows) with sort, pagination, CSV export, and filters by type, status, and region. Utilization progress bars per row.
- **Suppliers** — Star ratings, on-time delivery trend badges, defect rate color coding, aggregate summary chips
- **Products** — Stock status color coding, lead time indicators, category donut chart, 120 products
- **Shipments** — Multi-filter (status, carrier, year), value + quantity columns, trend chart, 220 records
- **Dark/Light mode toggle** — Persisted via Zustand + localStorage
- **Global search** — Topbar search feeds into the active table's search filter
- **CSV Export** — Available on every data table
- **Accessibility** — ARIA labels on all tables, navigation, form controls, and status badges

---

## Project Structure

```
src/
├── components/
│   ├── charts/       # RevenueBarChart, ShipmentLineChart, DonutChart
│   ├── layout/       # AppLayout, Sidebar, Topbar
│   └── ui/           # KpiCard, DataTable, Badge
├── data/             # Mock data + derived helpers
├── lib/              # cn(), formatters, CSV export
├── store/            # Zustand app store
├── types/            # TypeScript interfaces (const-types pattern)
└── views/            # Dashboard, Facilities, Suppliers, Products, Shipments
```
