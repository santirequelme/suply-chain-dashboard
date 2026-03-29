# Make2Flow — Supply Chain Analytics Dashboard

A production-quality, mobile-first supply chain analytics dashboard built with React, TypeScript, Tailwind CSS, and Recharts. The latest UX/UI improvements focus on clearer navigation, stronger visual hierarchy, smarter filtering, and deeper route intelligence for operational decision-making.

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

## UX/UI Improvements

### Information Architecture and Navigation

Navigation was restructured to follow a clearer and more logical flow:

- Dashboard
- Suppliers
- Facilities
- Products
- Shipments
- Settings

This sequence improves consistency, discoverability, and data hierarchy across the full analytics journey.

### Dashboard Visual System

The Dashboard was upgraded to include all required visual building blocks in one cohesive overview:

- KPI cards with trend indicators
- Line chart for time-based analysis
- Bar chart for cross-entity comparison
- Donut chart for distribution analysis
- Paginated data table for recent activity

The result is a faster read of business performance with clearer, more actionable insights.

### Purpose-Driven Views

Each section was refined with a specific analytical goal:

- **Suppliers**: tier analysis, activity trends, and detailed tables
- **Facilities**: type distribution, regional breakdown, and linked supplier context
- **Products**: volume trends and full relational visibility
- **Shipments**: the most robust page, with advanced filtering, time analysis, and detailed operational tables

### Global Filtering Experience

A consistent global filtering system now powers key views with:

- Date range
- Suppliers
- Facilities
- Products
- Status

Filters update instantly, display as removable chips, and use mobile-friendly bottom sheets for small screens.

### Time Intelligence (2020-2026)

Time-based analysis was integrated across core pages to support trend tracking from 2020 to 2026 and improve temporal comparison in daily decision-making.

### Data Table Upgrades

All key tables were improved with:

- Sorting
- Pagination
- Expandable rows
- Responsive mobile behavior

This creates a more reliable data exploration experience across devices.

### Settings with Operational Value

The Settings page now provides practical controls that directly affect analytics workflows:

- Data preferences
- Time granularity
- Default filter presets

### Route Intelligence Map

As a standout feature, the Shipments view now includes a Route Intelligence Map that visualizes facility-to-facility flows with interactive routes. This improves understanding of logistics movement, route concentration, and potential bottlenecks.

---

## Mobile-First Approach

The entire application was designed mobile-first, meaning every layout decision starts from the smallest screen and scales up. The sidebar collapses into a slide-over drawer on mobile, revealed by a hamburger menu in the topbar. Navigation switches from a persistent left rail on desktop to a full-height overlay on mobile, ensuring thumb-friendly tap targets and no content overlap.

Data tables — the most challenging element on small screens — use horizontal scroll with a pinned first column so users never lose context while swiping. On the dashboard, KPI cards stack vertically in a single column on mobile and expand to a 2- or 4-column grid on larger breakpoints (`grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`). Charts use `ResponsiveContainer` from Recharts to fill their parent's width at any viewport size, with reduced tick density on narrow viewports via `interval="preserveStartEnd"`.

Every interactive element (buttons, selects, table rows) meets the 44px minimum touch target recommendation. ARIA labels are applied to all tables, charts, navigation regions, and form controls for screen-reader compatibility. The topbar is `sticky` with a `backdrop-blur` so it remains legible as content scrolls beneath it on mobile.

---

## AI Workflow

This project was built in collaboration with Claude (Anthropic) running in Cowork mode. The workflow followed a design-then-code discipline: wireframes for all core views were created first in Pencil.dev, then a custom Python script was used to apply a Vision UI dark color palette directly to the `.pen` JSON file — avoiding any manual color-picking. Once the design was locked, Claude scaffolded the full React project from `package.json` through every component and view, following three skills loaded at the start of the session: `react-19` (no manual memoization, named imports), `typescript` (const-types pattern, flat interfaces, no `any`), and `tailwind-4` (`cn()` utility, semantic classes, no hex in `className`).

Mock data (55 facilities, 22 suppliers, 120 products, 220 shipments) was generated using a seeded pseudo-random number generator so the data is deterministic, realistic, and reproducible without a database. The AI helped identify the right seeding strategy to avoid repeating patterns and to produce plausible seasonal revenue curves across 2020–2026.

---

## Features

- **Dashboard** — KPI cards with trend indicators, revenue/shipments area chart, shipments-by-status donut, top facilities bar chart, recent shipments table
- **Facilities** — Full data table (55 rows) with sort, pagination, CSV export, and filters by type, status, and region. Utilization progress bars per row.
- **Suppliers** — Star ratings, on-time delivery trend badges, defect rate color coding, aggregate summary chips
- **Products** — Stock status color coding, lead time indicators, category donut chart, 120 products
- **Shipments** — Advanced filtering, time analysis, detailed tables, and interactive Route Intelligence Map
- **Settings** — Data preferences, time granularity, and default filters
- **Dark/Light mode toggle** — Persisted via Zustand + localStorage
- **Global filters** — Cross-view filtering with instant updates, chips, and mobile bottom sheets
- **CSV Export** — Available on every data table
- **Accessibility** — ARIA labels on all tables, navigation, form controls, and status badges

---

## Project Structure

```
src/
├── components/
│   ├── charts/       # RevenueBarChart, ShipmentLineChart, DonutChart
│   ├── map/          # Route Intelligence Map components
│   ├── layout/       # AppLayout, Sidebar, Topbar
│   └── ui/           # KpiCard, DataTable, Badge
├── data/             # Mock data + derived helpers
├── lib/              # cn(), formatters, CSV export
├── store/            # Zustand app store
├── types/            # TypeScript interfaces (const-types pattern)
└── views/            # Dashboard, Suppliers, Facilities, Products, Shipments, Settings
```
